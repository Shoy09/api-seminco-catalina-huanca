'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createOperation, updateValues } = require('../src/services/operationSyncIdentity');
const migration = require('../migrations/20261023120000-add-sync-uuid-to-operaciones');
const key = 'c734e68b-9fad-4f42-9711-920cc2d4b84e';

function model() {
  const records = new Map();
  let id = 0;
  return {
    records,
    async create(values) { return { ...values, id: ++id }; },
    async findOrCreate({ where, defaults }) {
      assert.equal(where.sync_uuid, defaults.sync_uuid);
      if (records.has(where.sync_uuid)) return [records.get(where.sync_uuid), false];
      const row = { ...defaults, id: ++id };
      records.set(where.sync_uuid, row);
      return [row, true];
    },
  };
}

test('lost response can be retried with same ID without overwriting newer data', async () => {
  const Model = model();
  const first = await createOperation(Model, { local_id: 2, sync_uuid: key, estado: 'activo' });
  Model.records.get(key).estado = 'cerrado';
  const retry = await createOperation(Model, { local_id: 99, sync_uuid: key.toUpperCase(), estado: 'activo' });
  assert.equal(retry.server_id, first.server_id);
  assert.equal(retry.local_id, 99);
  assert.equal(retry.creado, true);
  assert.equal(retry.reutilizado, true);
  assert.equal(Model.records.size, 1);
  assert.equal(Model.records.get(key).estado, 'cerrado');
});

test('same tablet ID with different UUID creates distinct records', async () => {
  const Model = model();
  const first = await createOperation(Model, { local_id: 1, sync_uuid: key });
  const second = await createOperation(Model, { local_id: 1, sync_uuid: 'e734e68b-9fad-4f42-9711-920cc2d4b84e' });
  assert.notEqual(first.server_id, second.server_id);
});

test('creation strips remote IDs and keeps compatibility with old clients', async () => {
  const Model = model();
  Model.create = async values => {
    assert.equal(values.id, undefined);
    assert.equal(values.idNube, undefined);
    assert.equal(values.local_id, undefined);
    return { id: 42 };
  };
  const result = await createOperation(Model, { id: 7, idNube: 9, local_id: 1 });
  assert.equal(result.server_id, 42);
  assert.equal(result.local_id, 1);
});

test('invalid identities and invalid records never reach persistence', async () => {
  const Model = model();
  for (const sync_uuid of ['', 'abc', 4, {}, key.replace('-4f42-', '-1f42-')]) {
    await assert.rejects(createOperation(Model, { sync_uuid }), /UUID v4/);
  }
  for (const value of [null, [], 5, 'data']) await assert.rejects(createOperation(Model, value));
  assert.equal(Model.records.size, 0);
});

test('updates preserve remote identity and continue updating operation fields', () => {
  assert.deepEqual(updateValues({
    id: 1, idNube: 90, local_id: 7, sync_uuid: key, estado: 'cerrado', registros: '[1]',
  }), { estado: 'cerrado', registros: '[1]' });
});

function controller(Model) {
  const sandbox = { module: { exports: {} }, require(name) {
    if (name === '../models/indexOperaciones') return { tal_horizontal: Model };
    if (name === '../services/closedTransfer') return require('../src/services/closedTransfer');
    if (name === 'sequelize') return { Op: {} };
    if (name === '../services/operationSyncIdentity') return require('../src/services/operationSyncIdentity');
    throw new Error('Unexpected require: ' + name);
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/operaciones.js'), 'utf8'), sandbox);
  return sandbox.module.exports;
}
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
}

test('controller returns per-row confirmation and preserves single-record contract', async () => {
  const c = controller(model());
  const res = response();
  await c.crear({ body: { tipo: 'tal_horizontal', data: [
    { local_id: 1, sync_uuid: key }, { local_id: 2, sync_uuid: 'invalid' },
    { local_id: 3, sync_uuid: key },
  ] } }, res);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.data[0].creado, true);
  assert.equal(res.body.data[1].creado, false);
  assert.equal(res.body.data[2].server_id, res.body.data[0].server_id);
  const single = response();
  await c.crear({ body: { tipo: 'tal_horizontal', data: { local_id: 4, sync_uuid: key } } }, single);
  assert.equal(single.body.data.server_id, res.body.data[0].server_id);
});

test('mass update keeps idNube targeting and strips identity from update values', async () => {
  const Model = {
    sequelize: { transaction(action) { return action({ LOCK: { UPDATE: 'UPDATE' } }); } },
    async findByPk(id) { return id === 90 ? { id, estado: 'activo', async update(values, options) {
      assert.ok(options.transaction);
      assert.deepEqual(values, { estado: 'cerrado' });
      Object.assign(this, values); return this;
    } } : null; },
  };
  const res = response();
  await controller(Model).actualizarMasivo({ body: { tipo: 'tal_horizontal', data: [
    { idNube: 90, sync_uuid: key, estado: 'cerrado' }, { idNube: 91 },
  ] } }, res);
  assert.equal(res.body.data[0].actualizado, true);
  assert.equal(res.body.data[1].actualizado, false);
});

test('migration creates ten nullable unique keys, can resume, and rolls back', async () => {
  const tables = new Map();
  const qi = {
    async describeTable(table) { return tables.get(table)?.columns ?? {}; },
    async addColumn(table, field, options) {
      assert.equal(options.allowNull, true);
      assert.equal(options.defaultValue, null);
      tables.set(table, { columns: { [field]: options }, indexes: [] });
    },
    async showIndex(table) { return tables.get(table).indexes; },
    async addIndex(table, fields, options) {
      assert.equal(options.unique, true);
      tables.get(table).indexes.push({ unique: true, fields: fields.map(attribute => ({ attribute })) });
    },
    async removeColumn(table, field) { delete tables.get(table).columns[field]; },
  };
  const Sequelize = { STRING: length => ({ length }) };
  await migration.up(qi, Sequelize);
  await migration.up(qi, Sequelize);
  assert.equal(tables.size, 10);
  assert.ok(tables.has('Operacion_Volquetes'));
  assert.ok(tables.has('Operacion_dumper'));
  for (const table of tables.values()) assert.equal(table.indexes.length, 1);
  await migration.down(qi);
  for (const table of tables.values()) assert.equal(table.columns.sync_uuid, undefined);
});

test('capability endpoint verifies actual unique index and fails closed', async () => {
  for (const ready of [true, false]) {
    const Model = {
      getTableName() { return 'Operacion_tal_horizontal'; },
      sequelize: { getQueryInterface() { return {
        async showIndex(table) {
          assert.equal(table, 'Operacion_tal_horizontal');
          return ready ? [{ unique: true, fields: [{ attribute: 'sync_uuid' }] }] : [];
        },
      }; } },
    };
    const res = response();
    res.set = (name, value) => {
      assert.equal(name, 'Cache-Control');
      assert.equal(value, 'no-store');
      return res;
    };
    await controller(Model).syncCapabilities({}, res);
    assert.equal(res.statusCode, ready ? 200 : 503);
    assert.equal(res.body.sync_uuid_version, ready ? 1 : 0);
  }
});
