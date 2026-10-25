'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fields, content, fingerprint, confirmClosedTransfer } = require('../src/services/closedTransfer');
const uuid = 'c734e68b-9fad-4f42-9711-920cc2d4b84e';
function payload(type = 'tal_horizontal') {
  const json = new Set(['registros', 'horometros', 'condiciones_equipo', 'check_list',
    'control_llantas', 'check_list_telemando', 'programa_trabajo']);
  return { ...Object.fromEntries(fields(type).map(field => [field, json.has(field) ? '{}' : ''])),
    estado: 'cerrado', sync_uuid: uuid, registros: '[{"2":"dos","10":"diez","horas":1.0}]' };
}
function model(type = 'tal_horizontal') {
  const records = new Map();
  let tail = Promise.resolve();
  const Model = {
    records, writes: 0,
    rawAttributes: Object.fromEntries(fields(type).map(field => [field, {}])),
    sequelize: { transaction(action) {
      const task = tail.then(() => action({ LOCK: { UPDATE: 'UPDATE' } }));
      tail = task.catch(() => {}); return task;
    } },
    async findOrCreate({ where, defaults }) {
      if (!records.has(where.sync_uuid)) {
        const row = { ...defaults, id: records.size + 1, toJSON() {
          const copy = { ...this }; delete copy.toJSON; return copy;
        }, async update(values, options) {
          assert.ok(options.transaction); Object.assign(this, values); Model.writes++;
          return this;
        } };
        records.set(where.sync_uuid, row); this.writes++;
      }
      return [records.get(where.sync_uuid), true];
    },
    async findByPk(id) { return [...records.values()].find(row => row.id === id) || null; },
  };
  return Model;
}

for (const type of ['tal_largo', 'tal_horizontal', 'empernador', 'carguio', 'rompebanco',
  'scissor', 'anfochanger', 'scalamin', 'dumper', 'volquetes']) {
  test(type + ': repeated immutable closed content confirms same remote ID', async () => {
    const Model = model(type), data = payload(type), hash = fingerprint(type, data);
    const first = await confirmClosedTransfer(Model, type, data, hash);
    const repeated = await confirmClosedTransfer(Model, type, { ...data, Hora_envio: '23:59', envio: 0 }, hash);
    assert.equal(first.status, 'confirmed');
    assert.equal(repeated.server_id, first.server_id);
    assert.equal(repeated.status, 'confirmed');
    assert.equal(Model.writes, 1);
  });
}

test('different remote content is never overwritten by origin or master', async () => {
  const Model = model(), data = payload(), hash = fingerprint('tal_horizontal', data);
  await confirmClosedTransfer(Model, 'tal_horizontal', data, hash);
  Model.records.get(uuid).registros = '[{"masReciente":true}]';
  const result = await confirmClosedTransfer(Model, 'tal_horizontal', data, hash);
  assert.equal(result.status, 'conflict');
  assert.equal(Model.records.get(uuid).registros, '[{"masReciente":true}]');
  assert.equal(Model.writes, 1);
});

test('open remote operation is not closed by a transferred stale snapshot', async () => {
  const Model = model(), data = payload(), hash = fingerprint('tal_horizontal', data);
  await confirmClosedTransfer(Model, 'tal_horizontal', data, hash);
  Model.records.get(uuid).estado = 'activo';
  Model.records.get(uuid).registros = '[{"cambioPosterior":true}]';
  assert.equal((await confirmClosedTransfer(Model, 'tal_horizontal', data, hash)).status, 'conflict');
  assert.equal(Model.records.get(uuid).estado, 'activo');
});

test('rejects corrupted hash, missing fields and active payload before any writes', async () => {
  const Model = model(), data = payload();
  await assert.rejects(confirmClosedTransfer(Model, 'tal_horizontal', data, 'wrong'));
  await assert.rejects(confirmClosedTransfer(Model, 'tal_horizontal', { ...data, estado: 'activo' }, 'wrong'));
  const missing = { ...data }; delete missing.operador;
  assert.throws(() => content('tal_horizontal', missing));
  assert.equal(Model.writes, 0);
});

test('known remote ID cannot redirect confirmation to an unrelated UUID', async () => {
  const Model = model(), data = payload(), hash = fingerprint('tal_horizontal', data);
  await confirmClosedTransfer(Model, 'tal_horizontal', data, hash);
  const other = { ...data, idNube: 1, sync_uuid: 'e734e68b-9fad-4f42-9711-920cc2d4b84e' };
  assert.equal((await confirmClosedTransfer(Model, 'tal_horizontal', other, hash)).status, 'conflict');
  assert.equal(Model.writes, 1);
});

test('normalizes JSON key order/numbers but preserves array order and real edits', () => {
  const data = payload();
  const same = { ...data, registros: '[{"horas":1,"10":"diez","2":"dos"}]' };
  assert.equal(fingerprint('tal_horizontal', data), fingerprint('tal_horizontal', same));
  assert.notEqual(fingerprint('tal_horizontal', data), fingerprint('tal_horizontal', { ...same, operador: 'otro' }));
});

test('transfer contract fields exist in all ten real Sequelize models', () => {
  const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
  const names = { tal_largo: 'TalLargo', tal_horizontal: 'TalHorizontal', empernador: 'Empernador',
    carguio: 'Carguio', rompebanco: 'Rompebanco', scissor: 'Scissor', anfochanger: 'Anfochanger',
    scalamin: 'Scalamin', dumper: 'Dumper', volquetes: 'Volquetes' };
  for (const [type, name] of Object.entries(names)) {
    const sandbox = { module: { exports: {} }, require(dependency) {
      if (dependency === 'sequelize') return require('sequelize');
      if (dependency === '../config/sequelize') return { define(_, attributes) { return { rawAttributes: attributes }; } };
      throw new Error('Unexpected dependency');
    } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/models/Operacion' + name + '.js'), 'utf8'), sandbox);
    for (const field of fields(type)) assert.ok(sandbox.module.exports.rawAttributes[field], type + ': ' + field);
    assert.ok(!fields(type).includes('check_list_telemando'));
  }
});
test('lookup recovers same UUID and payload without any creation or update', async () => {
  const { lookupSync } = require('../src/services/closedTransfer');
  const data = payload(), hash = fingerprint('tal_horizontal', data);
  const Model = {
    async findOne({ where }) { assert.equal(where.sync_uuid, uuid); return {
      id: 800, estado: 'cerrado', toJSON() { return { ...data, id: 800 }; },
    }; },
    async create() { assert.fail('No se puede crear desde lookup'); },
    async update() { assert.fail('No se puede actualizar desde lookup'); },
    async findOrCreate() { assert.fail('No se puede crear desde lookup'); },
  };
  const result = await lookupSync(Model, 'tal_horizontal', data, hash);
  assert.equal(result.status, 'confirmed'); assert.equal(result.server_id, 800);
});

test('lookup missing UUID never creates an empty or duplicate record', async () => {
  const { lookupSync } = require('../src/services/closedTransfer');
  const data = payload(), hash = fingerprint('tal_horizontal', data);
  const result = await lookupSync({ async findOne() { return null; } }, 'tal_horizontal', data, hash);
  assert.equal(result.status, 'missing'); assert.equal(result.server_id, null);
});

test('lookup different data reports conflict without modifying remote data', async () => {
  const { lookupSync } = require('../src/services/closedTransfer');
  const data = payload(), hash = fingerprint('tal_horizontal', data);
  const remote = { ...data, registros: '[{"otraVersion":true}]' };
  const result = await lookupSync({ async findOne() { return {
    id: 800, estado: 'cerrado', toJSON() { return remote; },
  }; } }, 'tal_horizontal', data, hash);
  assert.equal(result.status, 'conflict'); assert.equal(result.server_id, 800);
  assert.equal(remote.registros, '[{"otraVersion":true}]');
});
test('lookup active creation identifies ownership without closing or overwriting it', async () => {
  const { lookupSync } = require('../src/services/closedTransfer');
  const data = payload(), hash = fingerprint('tal_horizontal', data);
  const remote = { ...data, estado: 'activo' };
  const Model = { async findOne() { return { id: 800, estado: remote.estado, toJSON() { return remote; } }; } };
  const result = await lookupSync(Model, 'tal_horizontal', data, hash);
  assert.equal(result.status, 'conflict'); assert.equal(result.remote_state, 'activo');
  assert.equal(result.identity_matches, true); assert.equal(remote.estado, 'activo');
  remote.operador = 'otro operador';
  assert.equal((await lookupSync(Model, 'tal_horizontal', data, hash)).identity_matches, false);
});

const { createOperation, updateOperation } = require('../src/services/operationSyncIdentity');
for (const type of ['tal_largo', 'tal_horizontal', 'empernador', 'carguio', 'rompebanco',
  'scissor', 'anfochanger', 'scalamin', 'dumper', 'volquetes']) {
  test(type + ': active online, edit, transfer closes same ID; lost response retry is idempotent', async () => {
    const Model = model(type);
    const active = { ...payload(type), estado: 'activo', registros: '[{"avance":1}]' };
    const created = await createOperation(Model, active, type);
    assert.equal(created.cloud_hash, fingerprint(type, active));
    const edited = { ...active, registros: '[{"avance":2}]', base_cloud_hash: created.cloud_hash };
    const saved = await updateOperation(Model, type, created.server_id, edited);
    assert.equal(saved.cloud_hash, fingerprint(type, edited));
    const closed = { ...edited, estado: 'cerrado', registros: '[{"avance":3}]',
      idNube: created.server_id, base_cloud_hash: saved.cloud_hash };
    Model.records.get(uuid).aprobado = true;
    const hash = fingerprint(type, closed);
    const first = await confirmClosedTransfer(Model, type, closed, hash);
    const writes = Model.writes;
    const retry = await confirmClosedTransfer(Model, type, closed, hash);
    assert.equal(first.status, 'confirmed'); assert.equal(retry.status, 'confirmed');
    assert.equal(first.server_id, created.server_id); assert.equal(Model.records.size, 1);
    assert.equal(Model.records.get(uuid).estado, 'cerrado');
    assert.equal(Model.records.get(uuid).registros, closed.registros);
    assert.equal(Model.records.get(uuid).aprobado, true);
    assert.equal(Model.writes, writes);
    // A delayed active PUT must never reopen the already closed row.
    await assert.rejects(updateOperation(Model, type, created.server_id, edited), /reabrir/);
    assert.equal(Model.records.get(uuid).estado, 'cerrado');
  });
}

test('active remote changed after confirmed base is not overwritten', async () => {
  const Model = model();
  const active = { ...payload(), estado: 'activo', registros: '[{"avance":1}]' };
  const created = await createOperation(Model, active, 'tal_horizontal');
  Model.records.get(uuid).registros = '[{"otroCambio":true}]';
  const closed = { ...active, estado: 'cerrado', registros: '[{"avance":2}]',
    idNube: created.server_id, base_cloud_hash: created.cloud_hash };
  const result = await confirmClosedTransfer(Model, 'tal_horizontal', closed, fingerprint('tal_horizontal', closed));
  assert.equal(result.status, 'conflict'); assert.equal(result.reason, 'remote_changed');
  assert.equal(Model.records.get(uuid).registros, '[{"otroCambio":true}]');
  assert.equal(Model.records.get(uuid).estado, 'activo');
});

test('legacy no-base closes only when business content differs solely in estado', async () => {
  const Model = model(), active = { ...payload(), estado: 'activo' };
  await createOperation(Model, active, 'tal_horizontal');
  const closed = { ...active, estado: 'cerrado' };
  assert.equal((await confirmClosedTransfer(Model, 'tal_horizontal', closed,
    fingerprint('tal_horizontal', closed))).status, 'confirmed');
});

test('no-base differing active content requires review, without writes', async () => {
  const Model = model(), active = { ...payload(), estado: 'activo' };
  await createOperation(Model, active, 'tal_horizontal');
  const closed = { ...active, estado: 'cerrado', registros: '[{"nuevo":true}]' };
  const writes = Model.writes;
  const result = await confirmClosedTransfer(Model, 'tal_horizontal', closed, fingerprint('tal_horizontal', closed));
  assert.equal(result.status, 'conflict'); assert.equal(result.reason, 'missing_base');
  assert.equal(Model.writes, writes);
});

test('two master closures from same base serialize; second different version conflicts', async () => {
  const Model = model(), active = { ...payload(), estado: 'activo' };
  const created = await createOperation(Model, active, 'tal_horizontal');
  const a = { ...active, estado: 'cerrado', registros: '[{"avance":2}]', base_cloud_hash: created.cloud_hash };
  const b = { ...a, registros: '[{"avance":3}]' };
  const results = await Promise.all([a, b].map(data => confirmClosedTransfer(Model, 'tal_horizontal', data,
    fingerprint('tal_horizontal', data))));
  assert.deepEqual(results.map(r => r.status).sort(), ['confirmed', 'conflict']);
  assert.equal(Model.records.size, 1);
});

test('normal update retries same content despite old base, but refuses different newer content', async () => {
  const Model = model(), active = { ...payload(), estado: 'activo' };
  const created = await createOperation(Model, active, 'tal_horizontal');
  const next = { ...active, registros: '[{"avance":2}]', base_cloud_hash: created.cloud_hash };
  await updateOperation(Model, 'tal_horizontal', created.server_id, next);
  const writes = Model.writes;
  await updateOperation(Model, 'tal_horizontal', created.server_id, next);
  assert.equal(Model.writes, writes);
  await assert.rejects(updateOperation(Model, 'tal_horizontal', created.server_id,
    { ...next, registros: '[{"obsoleto":true}]' }), /posteriores/);
});

const { resolveClosedTransfer } = require('../src/services/closedTransfer');

test('lost PUT response then new edit accepts a durable attempted version, including master closure', async () => {
  const Model = model(), type = 'tal_horizontal';
  const active = { ...payload(), estado: 'activo', registros: '[{"avance":1}]' };
  const created = await createOperation(Model, active, type);
  const lost = { ...active, registros: '[{"avance":2}]', base_cloud_hash: created.cloud_hash };
  await updateOperation(Model, type, created.server_id, lost); // response lost
  const closed = { ...lost, estado: 'cerrado', registros: '[{"avance":3}]',
    attempted_hashes: [fingerprint(type, active), fingerprint(type, lost)] };
  const result = await confirmClosedTransfer(Model, type, closed, fingerprint(type, closed));
  assert.equal(result.status, 'confirmed'); assert.equal(result.server_id, created.server_id);
  assert.equal(Model.records.size, 1); assert.equal(Model.records.get(uuid).registros, closed.registros);
});

test('lost POST response then master closes by UUID using persisted original attempt', async () => {
  const Model = model(), type = 'tal_horizontal';
  const active = { ...payload(), estado: 'activo', registros: '[{"avance":1}]' };
  const created = await createOperation(Model, active, type); // response lost; no idNube/base on tablet
  const closed = { ...active, estado: 'cerrado', registros: '[{"avance":3}]',
    attempted_hashes: [fingerprint(type, active)] };
  const result = await confirmClosedTransfer(Model, type, closed, fingerprint(type, closed));
  assert.equal(result.status, 'confirmed'); assert.equal(result.server_id, created.server_id);
  assert.equal(Model.records.size, 1);
});

test('normal PUT accepts own lost intermediate attempt but not a web edit', async () => {
  const Model = model(), type = 'tal_horizontal';
  const a = { ...payload(), estado: 'activo' };
  const created = await createOperation(Model, a, type);
  const b = { ...a, registros: '[{"avance":2}]', base_cloud_hash: created.cloud_hash };
  await updateOperation(Model, type, created.server_id, b);
  const c = { ...b, registros: '[{"avance":3}]', attempted_hashes: [fingerprint(type, b)] };
  await updateOperation(Model, type, created.server_id, c);
  Model.records.get(uuid).registros = '[{"edicionWeb":true}]';
  await assert.rejects(updateOperation(Model, type, created.server_id, c), /posteriores/);
  assert.equal(Model.records.get(uuid).registros, '[{"edicionWeb":true}]');
});

test('explicit review can replace chosen closed version, but refuses remote changes after review', async () => {
  const Model = model(), type = 'tal_horizontal', old = payload();
  await createOperation(Model, old, type);
  const chosen = { ...old, registros: '[{"elegidaPorUsuario":true}]', idNube: 1 };
  const result = await resolveClosedTransfer(Model, type, chosen, fingerprint(type, chosen),
    { expected_remote_hash: fingerprint(type, old) });
  assert.equal(result.status, 'confirmed'); assert.equal(result.server_id, 1);
  const later = { ...chosen, registros: '[{"otraVersion":true}]' };
  const blocked = await resolveClosedTransfer(Model, type, later, fingerprint(type, later),
    { expected_remote_hash: fingerprint(type, old) });
  assert.equal(blocked.status, 'conflict');
  assert.equal(Model.records.get(uuid).registros, chosen.registros);
});

test('manual missing recovery requires verified absence and rechecks creation race', async () => {
  const Model = model(), type = 'tal_horizontal', data = payload(), hash = fingerprint(type, data);
  Model.findOne = async ({ where }) => Model.records.get(where.sync_uuid) || null;
  assert.equal((await resolveClosedTransfer(Model, type, data, hash,
    { expected_remote_hash: null, verified_absent: false })).status, 'conflict');
  assert.equal(Model.records.size, 0);
  assert.equal((await resolveClosedTransfer(Model, type, data, hash,
    { expected_remote_hash: null, verified_absent: true })).status, 'confirmed');
  assert.equal((await resolveClosedTransfer(Model, type, data, hash,
    { expected_remote_hash: null, verified_absent: true })).status, 'conflict');
  assert.equal(Model.records.size, 1);
});
