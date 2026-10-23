'use strict';

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createOperation(Model, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Cada operacion debe ser un objeto');
  }
  const { local_id, id, idNube, ...values } = payload;
  let record;
  let reused = false;
  if (values.sync_uuid === undefined || values.sync_uuid === null) {
    // Compatibilidad con clientes anteriores: sin garantia de idempotencia.
    record = await Model.create(values);
  } else {
    if (typeof values.sync_uuid !== 'string' || !uuidV4.test(values.sync_uuid)) {
      throw new Error('sync_uuid debe ser un UUID v4 valido');
    }
    values.sync_uuid = values.sync_uuid.toLowerCase();
    // findOrCreate maneja la carrera mediante transaccion y el indice UNIQUE.
    // Un POST repetido nunca actualiza una operacion remota mas reciente.
    const [found, created] = await Model.findOrCreate({
      where: { sync_uuid: values.sync_uuid }, defaults: values,
    });
    record = found;
    reused = !created;
  }
  return {
    local_id: local_id ?? null,
    server_id: record.id,
    sync_uuid: values.sync_uuid ?? null,
    creado: true, // Confirmado, incluso si la identidad ya existia (cliente Flutter).
    reutilizado: reused,
  };
}

function updateValues(payload) {
  // La identidad de una creacion no puede cambiar por una actualizacion.
  const { sync_uuid, id, idNube, local_id, ...values } = payload;
  return values;
}

module.exports = { createOperation, updateValues };
