const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function scenario(steps = []) {
  const pending = [...steps], events = [];
  const connection = {
    async query(sql, params) {
      const step = pending.shift();
      assert.ok(step, `Consulta inesperada: ${sql}`);
      assert.ok(sql.includes(step.sql), `Esperaba ${step.sql}, recibió ${sql}`);
      if (step.params) assert.deepEqual(JSON.parse(JSON.stringify(params)), step.params);
      if (step.error) throw new Error(step.error);
      return [step.result];
    },
    async beginTransaction() { events.push('begin'); },
    async commit() { events.push('commit'); },
    async rollback() { events.push('rollback'); },
    release() { events.push('release'); },
  };
  const db = { query: connection.query, async getConnection() { return connection; } };
  const sandbox = { exports: {}, require: name => { assert.equal(name, '../config/db'); return db; }, console: { error() {} } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/checklistItemController.js'), 'utf8'), sandbox);
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.body = JSON.parse(JSON.stringify(data)); return this; } };
  return {
    controller: sandbox.exports, res, events,
    done() { assert.equal(pending.length, 0, 'Faltan consultas por ejecutar'); },
  };
}

const base = { proceso: 'PROCESO A', categoria: 'ANTES', nombre: 'Verificar aceite' };
const assigned = { id: 7, ...base, aplica_todos_equipos: 0 };

test('crea un ítem común a dos equipos con el mismo nombre, deduplicando IDs', async () => {
  const s = scenario([
    { sql: 'SELECT id, proceso FROM equipos', params: [1, 2], result: [{ id: 1, proceso: 'PROCESO A' }, { id: 2, proceso: 'PROCESO A' }] },
    { sql: 'INSERT INTO checklist_items', params: ['PROCESO A', 'ANTES', 'Verificar aceite', false], result: { insertId: 7 } },
    { sql: 'DELETE FROM checklist_item_equipos', params: [7], result: {} },
    { sql: 'INSERT INTO checklist_item_equipos', params: [7, 1], result: {} },
    { sql: 'INSERT INTO checklist_item_equipos', params: [7, 2], result: {} },
    { sql: 'SELECT ce.checklist_item_id', result: [
      { checklist_item_id: 7, id: 1, nombre: 'Jumbo', codigo: 'J-01', proceso: 'PROCESO A' },
      { checklist_item_id: 7, id: 2, nombre: 'Jumbo', codigo: 'J-02', proceso: 'PROCESO A' },
    ] },
  ]);
  await s.controller.createCheckListItem({ body: { ...base, equipo_ids: [1, 2, 1] } }, s.res);
  assert.equal(s.res.statusCode, 201);
  assert.deepEqual(s.res.body.equipo_ids, [1, 2]);
  assert.equal(s.res.body.aplica_todos_equipos, false);
  assert.deepEqual(s.events, ['begin', 'commit', 'release']); s.done();
});

test('mantiene la creación anterior por proceso cuando se omiten equipos', async () => {
  const s = scenario([
    { sql: 'INSERT INTO checklist_items', params: ['PROCESO A', 'ANTES', 'Verificar aceite', true], result: { insertId: 7 } },
    { sql: 'DELETE FROM checklist_item_equipos', result: {} },
    { sql: 'SELECT ce.checklist_item_id', result: [] },
  ]);
  await s.controller.createCheckListItem({ body: base }, s.res);
  assert.equal(s.res.statusCode, 201); assert.equal(s.res.body.aplica_todos_equipos, true);
  assert.deepEqual(s.res.body.equipo_ids, []); s.done();
});

for (const [name, body] of [
  ['sin nombre', { ...base, nombre: '' }],
  ['IDs no enteros', { ...base, equipo_ids: [1.5] }],
  ['IDs como arreglo anidado', { ...base, equipo_ids: [[1]] }],
  ['IDs no son arreglo', { ...base, equipo_ids: '1,2' }],
  ['alcance contradictorio', { ...base, equipo_ids: [1], aplica_todos_equipos: true }],
  ['alcance no booleano', { ...base, aplica_todos_equipos: 'false' }],
  ['sin equipos específicos', { ...base, equipo_ids: [] }],
]) {
  test(`rechaza ${name}`, async () => {
    const s = scenario();
    await s.controller.createCheckListItem({ body }, s.res);
    assert.equal(s.res.statusCode, 400); assert.ok(!s.events.includes('commit')); s.done();
  });
}

for (const [name, equipos] of [
  ['equipo inexistente', []], ['equipo de otro proceso', [{ id: 1, proceso: 'PROCESO B' }]],
]) {
  test(`rechaza ${name} y revierte`, async () => {
    const s = scenario([{ sql: 'SELECT id, proceso FROM equipos', result: equipos }]);
    await s.controller.createCheckListItem({ body: { ...base, equipo_ids: [1] } }, s.res);
    assert.equal(s.res.statusCode, 400); assert.deepEqual(s.events, ['begin', 'rollback', 'release']); s.done();
  });
}

test('editar sin equipo_ids conserva y revalida las asignaciones', async () => {
  const s = scenario([
    { sql: 'SELECT * FROM checklist_items', result: [assigned] },
    { sql: 'SELECT equipo_id FROM checklist_item_equipos', result: [{ equipo_id: 1 }] },
    { sql: 'SELECT id, proceso FROM equipos', result: [{ id: 1, proceso: 'PROCESO A' }] },
    { sql: 'UPDATE checklist_items', result: {} },
    { sql: 'DELETE FROM checklist_item_equipos', result: {} },
    { sql: 'INSERT INTO checklist_item_equipos', params: [7, 1], result: {} },
    { sql: 'SELECT ce.checklist_item_id', result: [{ checklist_item_id: 7, id: 1, nombre: 'Jumbo' }] },
  ]);
  await s.controller.updateCheckListItem({ params: { id: '7' }, body: base }, s.res);
  assert.equal(s.res.statusCode, 200); assert.deepEqual(s.res.body.equipo_ids, [1]); s.done();
});

test('cambiar el proceso no deja asignaciones de equipos de otro proceso', async () => {
  const s = scenario([
    { sql: 'SELECT * FROM checklist_items', result: [assigned] },
    { sql: 'SELECT equipo_id FROM checklist_item_equipos', result: [{ equipo_id: 1 }] },
    { sql: 'SELECT id, proceso FROM equipos', result: [{ id: 1, proceso: 'PROCESO A' }] },
  ]);
  await s.controller.updateCheckListItem({ params: { id: '7' }, body: { ...base, proceso: 'PROCESO B' } }, s.res);
  assert.equal(s.res.statusCode, 400); assert.ok(s.events.includes('rollback')); s.done();
});

test('puede volver al alcance general sin conservar asignaciones', async () => {
  const s = scenario([
    { sql: 'SELECT * FROM checklist_items', result: [assigned] },
    { sql: 'UPDATE checklist_items', params: ['PROCESO A', 'ANTES', 'Verificar aceite', true, 7], result: {} },
    { sql: 'DELETE FROM checklist_item_equipos', result: {} },
    { sql: 'SELECT ce.checklist_item_id', result: [] },
  ]);
  await s.controller.updateCheckListItem({ params: { id: '7' }, body: { ...base, aplica_todos_equipos: true } }, s.res);
  assert.equal(s.res.body.aplica_todos_equipos, true); assert.deepEqual(s.res.body.equipo_ids, []); s.done();
});

test('un error al guardar las asignaciones revierte toda la escritura', async () => {
  const s = scenario([
    { sql: 'SELECT id, proceso FROM equipos', result: [{ id: 1, proceso: 'PROCESO A' }] },
    { sql: 'INSERT INTO checklist_items', result: { insertId: 7 } },
    { sql: 'DELETE FROM checklist_item_equipos', result: {} },
    { sql: 'INSERT INTO checklist_item_equipos', error: 'fallo simulado' },
  ]);
  await s.controller.createCheckListItem({ body: { ...base, equipo_ids: [1] } }, s.res);
  assert.equal(s.res.statusCode, 500); assert.deepEqual(s.events, ['begin', 'rollback', 'release']); s.done();
});

test('filtra por equipo con alcance general o asignado y respeta proceso y categoría', async () => {
  const s = scenario([
    { sql: 'SELECT id, proceso FROM equipos', params: [2], result: [{ id: 2, proceso: 'PROCESO A' }] },
    { sql: 'ci.aplica_todos_equipos = 1 OR EXISTS', params: ['PROCESO A', 2, 'ANTES'], result: [assigned] },
    { sql: 'SELECT ce.checklist_item_id', result: [{ checklist_item_id: 7, id: 2, nombre: 'Jumbo' }] },
  ]);
  await s.controller.getAllCheckListItems({ params: { equipoId: '2' }, query: { categoria: 'ANTES' } }, s.res);
  assert.equal(s.res.statusCode, 200); assert.deepEqual(s.res.body[0].equipo_ids, [2]); s.done();
});

test('un equipo inexistente devuelve 404 y no el catálogo completo', async () => {
  const s = scenario([{ sql: 'SELECT id, proceso FROM equipos', result: [] }]);
  await s.controller.getAllCheckListItems({ params: {}, query: { equipo_id: '999' } }, s.res);
  assert.equal(s.res.statusCode, 404); s.done();
});

test('rechaza IDs inválidos antes de consultar', async () => {
  const s = scenario();
  await s.controller.getCheckListItemById({ params: { id: '1 OR 1=1' } }, s.res);
  assert.equal(s.res.statusCode, 400); s.done();
});

test('elimina por ID con 404 si no existe', async () => {
  const s = scenario([{ sql: 'DELETE FROM checklist_items', params: [7], result: { affectedRows: 0 } }]);
  await s.controller.deleteCheckListItem({ params: { id: '7' } }, s.res);
  assert.equal(s.res.statusCode, 404); s.done();
});

test('la migración preserva los ítems y crea la relación con clave compuesta y cascada', async () => {
  const migration = require('../migrations/20261014160000-add-checklist-equipo-assignments');
  const calls = [];
  const qi = {
    async addColumn(table, column, definition) { assert.equal(table, 'checklist_items'); assert.equal(column, 'aplica_todos_equipos'); assert.equal(definition.defaultValue, true); calls.push('column'); },
    async createTable(table, fields) {
      assert.equal(table, 'checklist_item_equipos');
      for (const column of ['checklist_item_id', 'equipo_id']) {
        assert.equal(fields[column].primaryKey, true); assert.equal(fields[column].onDelete, 'CASCADE');
      }
      calls.push('table');
    },
    async addIndex() { calls.push('index'); },
    async dropTable(table) { assert.equal(table, 'checklist_item_equipos'); calls.push('drop'); },
    async removeColumn(table, column) { assert.equal(table, 'checklist_items'); assert.equal(column, 'aplica_todos_equipos'); calls.push('remove'); },
  };
  await migration.up(qi, { INTEGER: 'INTEGER', BOOLEAN: 'BOOLEAN' });
  await migration.down(qi);
  assert.deepEqual(calls, ['column', 'table', 'index', 'drop', 'remove']);
});
