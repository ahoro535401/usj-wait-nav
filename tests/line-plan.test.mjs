import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const lineSub = `U${'a'.repeat(32)}`;
const jwt = 'a.b.c';
const secret = 'test-secret-with-more-than-thirty-two-characters';
const visitDay = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const plans = new Map();
const db = {
  prepare(sql) {
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      async first() {
        if (!sql.startsWith('SELECT')) throw Error(`Unexpected SQL: ${sql}`);
        return plans.get(args[0]) || null;
      },
      async run() {
        if (sql.startsWith('INSERT')) {
          const [key, favorites_json, visit_day, consented_at, updated_at, expires_at] = args;
          plans.set(key, { favorites_json, visit_day, consented_at, updated_at, expires_at });
        } else if (sql.startsWith('DELETE')) plans.delete(args[0]);
        else throw Error(`Unexpected SQL: ${sql}`);
        return { success: true };
      },
    };
  },
};
const env = { DB: db, LIFF_APP_ID: '2011965864-hCyp1wQP', CRM_HASH_KEY: secret };
const url = 'https://uniba-waittimes.com/api/line-plan';
function req(method, body, auth = jwt, origin = 'https://uniba-waittimes.com') {
  return new Request(url, { method, headers: {
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
}

test('LIFF plan requires a verified ID token and explicit consent', async () => {
  const oldFetch = globalThis.fetch;
  let currentSub = lineSub;
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.body.get('client_id'), '2011965864');
    return Response.json({ aud: '2011965864', iss: 'https://access.line.me', sub: currentSub,
      exp: Math.floor(Date.now() / 1000) + 3600 });
  };
  try {
    let response = await worker.fetch(req('GET', null, null), env);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');

    response = await worker.fetch(req('PUT', { favorites: [12061], consent: true }, jwt, 'https://evil.example'), env);
    assert.equal(response.status, 403);

    response = await worker.fetch(req('PUT', { favorites: [12061], consent: false }), env);
    assert.equal(response.status, 400);
    assert.equal(plans.size, 0);

    response = await worker.fetch(req('PUT', { favorites: [12061, 12061, 12067],
      visit_day: visitDay, consent: true }), env);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).favorites, [12061, 12067]);
    assert.equal(plans.size, 1);
    assert.equal(plans.has(lineSub), false);
    assert.equal([...plans.keys()][0].length, 64);

    currentSub = `U${'b'.repeat(32)}`;
    response = await worker.fetch(req('GET'), env);
    assert.deepEqual(await response.json(), { saved: false });
    currentSub = lineSub;

    response = await worker.fetch(req('GET'), env);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).favorites, [12061, 12067]);

    const row = [...plans.values()][0];
    const originalExpiry = row.expires_at;
    row.expires_at = Math.floor(Date.now() / 1000) - 1;
    response = await worker.fetch(req('GET'), env);
    assert.deepEqual(await response.json(), { saved: false });
    row.expires_at = originalExpiry;

    response = await worker.fetch(req('DELETE'), env);
    assert.equal(response.status, 200);
    assert.equal(plans.size, 0);
  } finally { globalThis.fetch = oldFetch; }
});

test('verification response for another channel cannot access a plan', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ aud: 'other-channel', iss: 'https://access.line.me',
    sub: lineSub, exp: Math.floor(Date.now() / 1000) + 3600 });
  try {
    const response = await worker.fetch(req('GET'), env);
    assert.equal(response.status, 401);
  } finally { globalThis.fetch = oldFetch; }
});
