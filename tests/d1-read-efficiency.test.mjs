import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/en-release/worker.js';

test('repeated attraction views reuse a short-lived page without another D1 trend query', async () => {
  const cached = new Map();
  const pending = [];
  let trendQueries = 0;
  const env = { EN_PUBLIC_ENABLED: 'true', DB: {
    prepare(sql) {
      return {
        bind() { return this; },
        async first() { return { value: null }; },
        async all() {
          if (!sql.includes('GROUP BY period,bin')) throw new Error(`Unexpected SQL: ${sql}`);
          trendQueries++;
          return { results: [] };
        },
      };
    },
  } };
  const previousCaches = globalThis.caches;
  globalThis.caches = { default: {
    async match(request) { return cached.get(request.url)?.clone(); },
    async put(request, response) { cached.set(request.url, response.clone()); },
  } };
  const get = path => worker.fetch(new Request(`https://uniba-waittimes.com${path}`), env, {
    waitUntil(promise) { pending.push(promise); },
  });
  try {
    const path = '/attraction/mario-kart-koopas-challenge';
    const first = await get(path);
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('Cache-Control'), 'public, max-age=60');
    await Promise.all(pending.splice(0));
    assert.equal(trendQueries, 1);

    const repeated = await get(path);
    assert.equal(repeated.status, 200);
    assert.equal(trendQueries, 1);

    const otherHistory = await get(`${path}?history=2026-10-19`);
    assert.equal(otherHistory.status, 200);
    assert.equal(trendQueries, 2);

    const english = await get(`/en${path}`);
    assert.equal(english.status, 200);
    await Promise.all(pending.splice(0));
    assert.equal((await get(`/en${path}`)).status, 200);
    assert.equal(trendQueries, 3);
  } finally {
    if (previousCaches === undefined) delete globalThis.caches;
    else globalThis.caches = previousCaches;
  }
});
