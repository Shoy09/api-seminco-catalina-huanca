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
    if (record.estado === 'activo') {
      const remoteHash = cloudHash(type, record);
      const suppliedBase = payload.base_cloud_hash;
      const hasBase = typeof suppliedBase === 'string' && /^[0-9a-f]{64}$/.test(suppliedBase);
      const expectedBase = hasBase ? suppliedBase : fingerprint(type, { ...payload, estado: 'activo' });
      const remote = record.toJSON();
      const sameIdentity = ['fecha', 'turno', 'operador', 'equipo', 'n_equipo', 'n_volquete']
        .filter(field => fields(type).includes(field))
        .every(field => String(remote[field] ?? '') === String(payload[field] ?? ''));
      if (!sameIdentity || !remoteHash || (remoteHash !== expectedBase && !attemptedVersion(payload, remoteHash))) {
        return { sync_uuid: payload.sync_uuid, hash, status: 'conflict', server_id: record.id,
          reason: !sameIdentity ? 'identity_mismatch' : hasBase ? 'remote_changed' : 'missing_base' };
      }
      await record.update(defaults, { transaction });
    }
    let matches = false;
    try { matches = record.estado === 'cerrado' && fingerprint(type, record.toJSON()) === hash; } catch (_) {}
    return { sync_uuid: payload.sync_uuid, hash,
      status: matches ? 'confirmed' : 'conflict', server_id: record.id,
      reason: matches ? null : 'remote_content_differs' };
  });
}
module.exports = { fields, content, fingerprint, confirmClosedTransfer };

function cloudHash(type, record) {
  try { return fingerprint(type, typeof record.toJSON === 'function' ? record.toJSON() : record); }
  catch (_) { return null; }
}
module.exports.cloudHash = cloudHash;

function attemptedVersion(payload, hash) {
  const attempts = payload.attempted_hashes;
  return Array.isArray(attempts) && attempts.every(v => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v)) && attempts.includes(hash);
}
module.exports.attemptedVersion = attemptedVersion;

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
    server_id: record.id, remote_state: record.estado, identity_matches: identityMatches,
    cloud_hash: cloudHash(type, record), remote_payload: record.toJSON() };
};

// Explicit user-reviewed resolution, protected by the exact remote version seen.
module.exports.resolveClosedTransfer = async function resolveClosedTransfer(Model, type, payload, hash, review) {
  if (!payload || payload.estado !== 'cerrado' || fingerprint(type, payload) !== hash ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(payload.sync_uuid)) {
    throw new Error('Copia cerrada invalida');
  }
  if (!review || !(review.expected_remote_hash === null || /^[0-9a-f]{64}$/.test(review.expected_remote_hash))) {
    throw new Error('Primero consulta la version de nube');
  }
  for (const field of fields(type)) { if (!Model.rawAttributes[field]) throw new Error('Actualizar modelo: ' + field); }
  const defaults = Object.fromEntries(fields(type).map(field => [field, payload[field]]));
  Object.assign(defaults, { sync_uuid: payload.sync_uuid, envio: 1 });
  return Model.sequelize.transaction(async transaction => {
    let record = Number(payload.idNube) > 0
      ? await Model.findByPk(Number(payload.idNube), { transaction, lock: transaction.LOCK.UPDATE })
      : await Model.findOne({ where: { sync_uuid: payload.sync_uuid }, transaction, lock: transaction.LOCK.UPDATE });
    const conflict = reason => ({ sync_uuid: payload.sync_uuid, hash, status: 'conflict', server_id: record?.id ?? null, reason });
    if (!record) {
      if (Number(payload.idNube) > 0 || review.expected_remote_hash !== null || review.verified_absent !== true) return conflict('remote_changed');
      const found = await Model.findOrCreate({ where: { sync_uuid: payload.sync_uuid }, defaults, transaction });
      record = found[0];
      if (!found[1]) return conflict('remote_changed');
    } else {
      if (record.sync_uuid !== payload.sync_uuid || cloudHash(type, record) !== review.expected_remote_hash) return conflict('remote_changed');
      await record.update(defaults, { transaction });
    }
    if (cloudHash(type, record) !== hash) throw new Error('El contenido guardado no coincide con la copia revisada');
    return { sync_uuid: payload.sync_uuid, hash, status: 'confirmed', server_id: record.id };
  });
};

module.exports.resolveSyncConflict = async function resolveSyncConflict(Model, type, payload, hash, review) {
  if (!payload || !['activo', 'cerrado'].includes(payload.estado) ||
      fingerprint(type, payload) !== hash ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.sync_uuid)) {
    throw new Error('Operacion o huella invalida');
  }
  if (!review || !(review.expected_remote_hash === null ||
      /^[0-9a-f]{64}$/.test(review.expected_remote_hash))) {
    throw new Error('Primero consulta la version de nube');
  }
  for (const field of fields(type)) {
    if (!Model.rawAttributes[field]) throw new Error('Actualizar modelo y tabla: ' + field);
  }
  const defaults = Object.fromEntries(fields(type).map(field => [field, payload[field]]));
  Object.assign(defaults, {
    sync_uuid: payload.sync_uuid.toLowerCase(),
    envio: payload.estado === 'cerrado' ? 1 : 0.5,
  });

  return Model.sequelize.transaction(async transaction => {
    const lock = { transaction, lock: transaction.LOCK.UPDATE };
    let record = Number(payload.idNube) > 0
      ? await Model.findByPk(Number(payload.idNube), lock)
      : await Model.findOne({ where: { sync_uuid: defaults.sync_uuid }, ...lock });
    const conflict = reason => ({
      sync_uuid: defaults.sync_uuid,
      hash,
      status: 'conflict',
      server_id: record?.id ?? null,
      reason,
    });

    if (!record) {
      if (Number(payload.idNube) > 0 ||
          review.expected_remote_hash !== null ||
          review.verified_absent !== true) {
        return conflict('remote_changed');
      }
      const [created, inserted] = await Model.findOrCreate({
        where: { sync_uuid: defaults.sync_uuid },
        defaults,
        transaction,
      });
      if (!inserted) return conflict('remote_changed');
      record = await Model.findByPk(created.id, lock);
    } else {
      if (record.sync_uuid !== defaults.sync_uuid ||
          cloudHash(type, record) !== review.expected_remote_hash) {
        return conflict('remote_changed');
      }
      if (record.estado === 'cerrado' && payload.estado === 'activo') {
        return conflict('cannot_reopen');
      }
      await record.update(defaults, { transaction });
    }

    if (cloudHash(type, record) !== hash) {
      throw new Error('El contenido guardado no coincide con la version revisada');
    }
    return {
      sync_uuid: defaults.sync_uuid,
      hash,
      status: 'confirmed',
      server_id: record.id,
      cloud_hash: cloudHash(type, record),
    };
  });
};
