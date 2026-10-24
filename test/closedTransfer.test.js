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
  return {
    records, writes: 0,
    rawAttributes: Object.fromEntries(fields(type).map(field => [field, {}])),
    sequelize: { async transaction(action) { return action({ LOCK: { UPDATE: 'UPDATE' } }); } },
    async findOrCreate({ where, defaults }) {
      if (!records.has(where.sync_uuid)) {
        const row = { ...defaults, id: records.size + 1, toJSON() {
          const copy = { ...this }; delete copy.toJSON; return copy;
        } };
        records.set(where.sync_uuid, row); this.writes++;
      }
      return [records.get(where.sync_uuid), true];
    },
    async findByPk(id) { return [...records.values()].find(row => row.id === id) || null; },
  };
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