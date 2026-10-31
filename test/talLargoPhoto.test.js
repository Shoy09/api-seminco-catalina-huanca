'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { createTalLargoPhotoRouter } = require('../src/routes/api/talLargoPhotoRoutes');
const { procesos, schema, validOutput, readPhoto, readTalLargoPhoto } = require('../src/services/talLargoPhoto');

const secret = 'test-only-photo-import-secret';
const image = { mimeType: 'image/jpeg', image: Buffer.from([255,216,255,224]).toString('base64'), catalogo: [] };
function empty(spec = schema) {
  if (spec.type === 'object') return Object.fromEntries(Object.entries(spec.properties)
    .map(([k, value]) => [k, empty(value)]));
  return spec.type === 'array' ? [] : null;
}

async function fixture(t, { user = { id: 7, rol: 'Master', activo: 1 }, readPhoto,
  dailyLimit = 50, now = Date.now } = {}) {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  t.after(() => {
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
  });
  let calls = 0, userLookups = 0;
  const procesosLeidos = [];
  const app = express();
  app.use('/api', createTalLargoPhotoRouter({
    findUser: async id => { userLookups++; assert.equal(id, 7); return user; },
    readPhoto: async (...args) => {
      calls++;
      procesosLeidos.push(args[1].proceso);
      return readPhoto ? readPhoto(...args) : empty();
    },
    dailyLimit, now,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.post('/api/echo', (req, res) => res.json({ ok: true }));
  app.use((err, req, res, next) => res.status(err.status ?? 500).json({ error: 'test error' }));
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const token = jwt.sign({ id: 7, rol: 'Master' }, secret, { expiresIn: '1h' });
  const request = ({ body = image, auth = `Bearer ${token}`, raw, path = '/api/tal-largo/preview' } = {}) =>
    fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: raw ?? JSON.stringify(body),
    });
  return { request, calls: () => calls, lookups: () => userLookups, procesos: () => procesosLeidos };
}

test('each sheet has its own route; unknown processes are not exposed', async t => {
  let clock = Date.now();
  const f = await fixture(t, { now: () => clock });
  assert.equal((await f.request()).status, 200);
  clock += 11000;
  assert.equal((await f.request({ path: '/api/tal-horizontal/preview' })).status, 200);
  assert.deepEqual(f.procesos(), ['tal-largo', 'tal-horizontal']);
  assert.equal((await f.request({ path: '/api/otro/preview' })).status, 404);
  assert.equal(f.calls(), 2);
});
test('validated Taladro Largo prompt is not changed by other sheets', () => {
  // Validado con hojas reales (commit 1714c2e). Si cambias el texto a propósito,
  // vuelve a probar con fotos reales y actualiza este hash.
  const hash = require('node:crypto').createHash('sha256')
    .update(procesos['tal-largo'].instructions).digest('hex');
  assert.equal(hash, 'c676f476e489b52b2f50ba0ff3350f53f2a375703558a6849f44c3084bdfd5ea');
});
test('horizontal sheet asks for its own columns and the five footer meters', async () => {
  const config = procesos['tal-horizontal'];
  const actividad = config.schema.properties.actividades.items.properties;
  for (const k of ['labor', 'tal_prod', 'tal_rimados', 'long_barras', 'material', 'tipo_perforacion']) {
    assert.ok(actividad[k], k);
  }
  assert.equal(actividad.barras, undefined);
  assert.deepEqual(Object.keys(config.schema.properties.horometros.properties),
    ['diesel', 'electrico', 'percusion', 'electrico2', 'percusion2']);
  await readPhoto(image, {
    proceso: 'tal-horizontal', apiKey: 'test-key', model: 'test-model',
    fetchImpl: async (url, options) => {
      const body = JSON.parse(options.body);
      assert.match(body.systemInstruction.parts[0].text, /JUMBO FRONTONERO/);
      assert.match(body.systemInstruction.parts[0].text, /EXACTAMENTE como están escritas/);
      return Response.json({ candidates: [{ finishReason: 'STOP',
        content: { parts: [{ text: JSON.stringify(empty(config.schema)) }] } }] });
    },
  });
  await assert.rejects(readPhoto(image, { proceso: 'otro', apiKey: 'k', model: 'm' }),
    e => e.status === 404);
});

test('authenticated master receives only a draft using the existing JWT', async t => {
  const f = await fixture(t);
  const response = await f.request();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), empty());
  assert.equal(f.calls(), 1);
});
test('current database role prevails over a Master claim in an old token', async t => {
  const f = await fixture(t, { user: { id: 7, rol: 'Operador', activo: 1 } });
  assert.equal((await f.request()).status, 403);
  assert.equal(f.calls(), 0);
});
test('inactive master is denied', async t => {
  const f = await fixture(t, { user: { id: 7, rol: 'Master', activo: 0 } });
  assert.equal((await f.request()).status, 403);
  assert.equal(f.calls(), 0);
});
test('invalid JWT is rejected before database or Gemini access', async t => {
  const f = await fixture(t);
  assert.equal((await f.request({ auth: 'Bearer invalid' })).status, 401);
  assert.equal(f.calls(), 0);
  assert.equal(f.lookups(), 0);
});
test('invalid JSON and invalid images never reach Gemini', async t => {
  const f = await fixture(t);
  assert.equal((await f.request({ raw: '{invalid' })).status, 400);
  assert.equal((await f.request({ body: { ...image, mimeType: 'image/png' } })).status, 400);
  assert.equal(f.calls(), 0);
});
test('8 MB photos fit the dedicated parser while other routes retain 10 MB', async t => {
  const f = await fixture(t);
  const bytes = Buffer.alloc(8 * 1024 * 1024);
  bytes[0] = 255; bytes[1] = 216; bytes[2] = 255;
  const body = { ...image, image: bytes.toString('base64') };
  assert.equal((await f.request({ body })).status, 200);
  assert.equal((await f.request({ body, path: '/api/echo' })).status, 413);
  const oversized = { ...image, image: Buffer.concat([bytes, Buffer.from([0])]).toString('base64') };
  assert.equal((await f.request({ body: oversized })).status, 413);
  assert.equal(f.calls(), 1);
});
test('rejected concurrent requests cannot release the first request lock', async t => {
  let resolve;
  let clock = Date.now();
  const pending = new Promise(r => { resolve = r; });
  const f = await fixture(t, { readPhoto: () => pending, now: () => clock });
  const first = f.request();
  while (f.calls() === 0) await new Promise(r => setTimeout(r, 5));
  clock += 11000;
  assert.equal((await f.request()).status, 429);
  assert.equal((await f.request()).status, 429);
  assert.equal(f.calls(), 1);
  resolve(empty());
  assert.equal((await first).status, 200);
});
test('daily limit is enforced after cooldown', async t => {
  let clock = Date.now();
  const f = await fixture(t, { dailyLimit: 1, now: () => clock });
  assert.equal((await f.request()).status, 200);
  clock += 11000;
  assert.equal((await f.request()).status, 429);
  assert.equal(f.calls(), 1);
});
test('missing Gemini settings fail only this route without an upstream call', async () => {
  let called = false;
  await assert.rejects(readTalLargoPhoto(image, {
    apiKey: '', model: '', fetchImpl: async () => { called = true; },
  }), e => e.status === 503);
  assert.equal(called, false);
});
test('Gemini request includes footer horometers and validates the entire output', async () => {
  const result = await readTalLargoPhoto(image, {
    apiKey: 'test-key', model: 'test-model',
    fetchImpl: async (url, options) => {
      assert.equal(options.headers['x-goog-api-key'], 'test-key');
      const body = JSON.parse(options.body);
      assert.match(body.systemInstruction.parts[0].text, /al pie de la tabla/);
      assert.match(body.systemInstruction.parts[0].text, /H\. MOTOR corresponde a horometros\.diesel/);
      // Texto validado con hojas reales: UBICACIÓN es la labor completa.
      assert.match(body.systemInstruction.parts[0].text, /La columna UBICACIÓN es la labor/);
      assert.equal(body.contents[0].parts[1].inlineData.data, image.image);
      assert.equal(body.generationConfig.responseJsonSchema.properties.actividades.maxItems, undefined);
      assert.equal(body.generationConfig.responseJsonSchema.properties.actividades.items
        .properties.barras.maxItems, undefined);
      assert.equal(schema.properties.actividades.maxItems, 100);
      assert.equal(schema.properties.actividades.items.properties.barras.maxItems, 200);
      const draft = empty();
      draft.horometros = {
        diesel: { inicio: '2660.6', final: '2661.3' },
        percusion: { inicio: '5288.38', final: '5291.34' },
        electrico: { inicio: '14712.53', final: '14718.56' },
      };
      return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(draft) }] } }] });
    },
  });
  assert.equal(result.horometros.electrico.final, '14718.56');
  assert.equal(validOutput({ ...result, guardar: true }), false);
});
test('truncated, malformed and quota responses are safe failures without retry', async () => {
  for (const [response, status] of [
    [Response.json({}, { status: 429 }), 429],
    [Response.json({ candidates: [{ finishReason: 'MAX_TOKENS' }] }), 502],
    [Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{}' }] } }] }), 502],
  ]) {
    let calls = 0;
    await assert.rejects(readTalLargoPhoto(image, { apiKey: 'test-key', model: 'test-model',
      fetchImpl: async () => { calls++; return response; } }), e => e.status === status);
    assert.equal(calls, 1);
  }
});
test('Gemini timeout cancels the upstream request', async () => {
  await assert.rejects(readTalLargoPhoto(image, { apiKey: 'test-key', model: 'test-model', timeoutMs: 10,
    fetchImpl: async (url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }),
  }), e => e.status === 504);
});
