'use strict';
const { createHash } = require('node:crypto');
const common = ['fecha', 'turno', 'operador', 'jefe_guardia', 'estado'];
const equipment = ['equipo', 'n_equipo', 'registros', 'horometros', 'condiciones_equipo', 'check_list', 'control_llantas'];
const extras = {
  tal_largo: ['seccion', 'modelo_equipo'], tal_horizontal: ['seccion', 'modelo_equipo'],
  empernador: ['seccion', 'tipo_equipo'],
  carguio: ['seccion', 'capacidad', 'tipo_equipo', 'programa_trabajo'],
  dumper: ['seccion', 'capacidad', 'tipo_equipo', 'programa_trabajo'],
  rompebanco: [], anfochanger: [], scissor: ['guardia'], scalamin: ['guardia'],
  volquetes: ['guardia', 'n_volquete', 'empresa', 'registros', 'horometros'],
};
const jsonFields = new Set(['registros', 'horometros', 'condiciones_equipo', 'check_list',
  'control_llantas', 'programa_trabajo']);
function fields(type) {
  if (!Object.hasOwn(extras, type)) throw new Error('Tipo no soportado');
  return [...common, ...(type === 'volquetes' ? [] : equipment), ...extras[type]];
}
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, normalize(value[key])]));
  return value;
}
function content(type, payload) {
  const result = {};
  for (const field of fields(type)) {
    if (!Object.hasOwn(payload, field)) throw new Error('Falta campo: ' + field);
    let value = payload[field];
    if (jsonFields.has(field)) {
      if (typeof value === 'string') value = JSON.parse(value);
      if (!value || typeof value !== 'object') throw new Error('JSON invalido: ' + field);
      result[field] = normalize(value);
    } else result[field] = String(value ?? '');
  }
  return normalize(result);
}
function fingerprint(type, payload) {
  function stable(value) {
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort()
      .map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
    return JSON.stringify(value);
  }
  return createHash('sha256').update(stable(content(type, payload))).digest('hex');
}
async function confirmClosedTransfer(Model, type, payload, hash) {
  if (!payload || payload.estado !== 'cerrado' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(payload.sync_uuid) ||
      fingerprint(type, payload) !== hash) throw new Error('Contenido cerrado o huella invalida');
  for (const field of fields(type)) {
    if (!Model.rawAttributes[field]) throw new Error('Actualizar el modelo y la tabla: ' + field);
  }
  const defaults = Object.fromEntries(fields(type).map(field => [field, payload[field]]));
  defaults.sync_uuid = payload.sync_uuid;
  defaults.envio = 1;
  if (typeof payload.Hora_envio === 'string' && Model.rawAttributes.Hora_envio) defaults.Hora_envio = payload.Hora_envio;
  return Model.sequelize.transaction(async transaction => {
    let record;
    if (Number(payload.idNube) > 0) {
      record = await Model.findByPk(Number(payload.idNube), { transaction, lock: transaction.LOCK.UPDATE });
      if (!record || (record.sync_uuid && record.sync_uuid !== payload.sync_uuid)) {
        return { sync_uuid: payload.sync_uuid, hash, status: 'conflict', server_id: null };
      }
    } else {
      [record] = await Model.findOrCreate({ where: { sync_uuid: payload.sync_uuid }, defaults, transaction });
      // Volver a leer con bloqueo: comparar el contenido vigente, no un snapshot.
      record = await Model.findByPk(record.id, { transaction, lock: transaction.LOCK.UPDATE });
    }
    let matches = false;
    try { matches = record.estado === 'cerrado' && fingerprint(type, record.toJSON()) === hash; } catch (_) {}
    return { sync_uuid: payload.sync_uuid, hash,
      status: matches ? 'confirmed' : 'conflict', server_id: record.id };
  });
}
module.exports = { fields, content, fingerprint, confirmClosedTransfer };

// Consulta estrictamente de lectura: no crea, no vincula y no actualiza filas.
module.exports.lookupSync = async function lookupSync(Model, type, payload, hash) {
  if (!payload || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(payload.sync_uuid) ||
      fingerprint(type, payload) !== hash) throw new Error('UUID o contenido de consulta invalido');
  const record = await Model.findOne({ where: { sync_uuid: payload.sync_uuid } });
  if (!record) return { sync_uuid: payload.sync_uuid, hash, status: 'missing', server_id: null };
  let matches = false;
  try { matches = fingerprint(type, record.toJSON()) === hash; } catch (_) {}
  const remote = record.toJSON();
  const identityFields = ['fecha', 'turno', 'operador', 'equipo', 'n_equipo', 'n_volquete']
    .filter(field => fields(type).includes(field));
  const identityMatches = identityFields.every(field => String(remote[field] ?? '') === String(payload[field] ?? ''));
  return { sync_uuid: payload.sync_uuid, hash, status: matches ? 'confirmed' : 'conflict',
    server_id: record.id, remote_state: record.estado, identity_matches: identityMatches };
};