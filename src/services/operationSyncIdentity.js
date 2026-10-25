'use strict';
const { cloudHash, attemptedVersion } = require('./closedTransfer');

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createOperation(Model, payload, type) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Cada operacion debe ser un objeto');
  }
  const { local_id, id, idNube, base_cloud_hash, sync_cloud_hash, attempted_hashes, ...values } = payload;
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
    cloud_hash: type ? cloudHash(type, record) : null,
  };
}

function updateValues(payload) {
  // La identidad de una creacion no puede cambiar por una actualizacion.
  const { sync_uuid, id, idNube, local_id, base_cloud_hash, sync_cloud_hash, attempted_hashes, ...values } = payload;
  return values;
}

async function updateOperation(Model, type, id, payload) {
  function fail(message, status = 409) { const error = new Error(message); error.status = status; throw error; }
  return Model.sequelize.transaction(async transaction => {
    const record = await Model.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!record) fail('Registro no encontrado', 404);
    if (payload.sync_uuid && record.sync_uuid && payload.sync_uuid !== record.sync_uuid) {
      fail('El UUID no corresponde al registro remoto');
    }
    const values = updateValues(payload);
    if (record.estado === 'cerrado' && values.estado === 'activo') fail('No se puede reabrir un registro cerrado mediante una copia activa');
    const currentHash = cloudHash(type, record);
    const merged = { ...(typeof record.toJSON === 'function' ? record.toJSON() : record), ...values };
    const desiredHash = cloudHash(type, merged);
    if (payload.base_cloud_hash != null &&
        (typeof payload.base_cloud_hash !== 'string' || !/^[0-9a-f]{64}$/.test(payload.base_cloud_hash))) {
      fail('Huella de version base invalida');
    }
    if ((payload.base_cloud_hash || Array.isArray(payload.attempted_hashes)) && payload.base_cloud_hash !== currentHash && desiredHash !== currentHash && !attemptedVersion(payload, currentHash)) {
      fail('La nube contiene cambios posteriores; requiere revision');
    }
    if (Object.keys(values).some(key => JSON.stringify(record[key]) !== JSON.stringify(values[key]))) {
      await record.update(values, { transaction });
    }
    return { record, cloud_hash: cloudHash(type, record) };
  });
}
module.exports = { createOperation, updateValues, updateOperation };
