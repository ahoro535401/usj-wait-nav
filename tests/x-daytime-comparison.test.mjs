import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8'))
  .replace('export default {', 'globalThis.__worker = {');
const context = vm.createContext({ console, URL, Request, Response, AbortSignal, fetch });
vm.runInContext(source, context, { filename: 'src/index.js' });
const at = value => Date.parse(value) / 1000;
const fetchedAt = '2026-11-01T13:01:00+09:00';
const ids = [12061, 14402, 7077, 12065, 7092, 12071];
const rides = ids.map((id, index) => ({
  id, name: `Ride ${index + 1}`, source: 'Queue-Times', is_open: true,
  data_unavailable: false, wait_time: 20 + index * 10, last_updated: fetchedAt,
}));

function historicalDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE snapshots(slot INTEGER PRIMARY KEY,captured_at INTEGER);' +
    'CREATE TABLE ride_samples(slot INTEGER,ride_id INTEGER,wait_minutes INTEGER,is_open INTEGER,source TEXT);');
  const snapshot = sqlite.prepare('INSERT INTO snapshots VALUES (?,?)');
  const sample = sqlite.prepare('INSERT INTO ride_samples VALUES (?,?,?,?,?)');
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const captured = at('2026-10-25T13:00:00+09:00') + dayIndex * 86400;
    const slot = Math.floor(captured / 1200);
    snapshot.run(slot, captured);
    ids.forEach(id => sample.run(slot, id, 40, 1, 'Queue-Times'));
  }
  return {
    sqlite,
    db: { prepare(sql) { return { bind(...args) { return { async all() {
      return { results: sqlite.prepare(sql).all(...args) };
    } }; } }; } },
  };
}

test('daytime cards compare current verified rides with their own prior seven-day same-slot waits', async () => {
  const { db, sqlite } = historicalDatabase();
  const comparison = await context.daytimeXComparison(db, rides, at(fetchedAt));
  assert.deepEqual(JSON.parse(JSON.stringify(comparison)), {
    now: 45, past: 40, difference: 5, rides: 6,
  });
  const names = new Map(ids.map((id, index) => [id, `施設${index + 1}`]));
  const japanesePost = context.xWaitPost(rides, names, fetchedAt);
  const englishPost = context.englishXPost(rides, fetchedAt);
  assert.ok(japanesePost && context.xWeightedLength(japanesePost) <= 280);
  assert.ok(englishPost && context.xWeightedLength(englishPost) <= 280);
  assert.match(context.xCardPayload(rides, names, fetchedAt, null, japanesePost, comparison).subtitle,
    /比較6施設平均 45分 \| 過去7日同時刻 40分（\+5分）/);
  assert.match(context.englishXCardPayload(rides, fetchedAt, null, englishPost, comparison).subtitle,
    /6 rides avg: now 45 min \| prior 7 days same time 40 min \(\+5\)/);
  assert.equal(context.xWaitPost(rides, names, fetchedAt), japanesePost);
  assert.equal(context.englishXPost(rides, fetchedAt), englishPost);
  sqlite.close();
});

test('stale current rides and sparse historical records are excluded from the comparison', async () => {
  const { db, sqlite } = historicalDatabase();
  const stale = rides.map(ride => ({ ...ride }));
  stale[0].last_updated = '2026-11-01T12:30:00+09:00';
  const result = await context.daytimeXComparison(db, stale, at(fetchedAt));
  assert.equal(result.rides, 5);
  sqlite.exec(`DELETE FROM ride_samples WHERE ride_id=${ids[1]} AND slot IN (` +
    `SELECT slot FROM snapshots ORDER BY slot LIMIT 4)`);
  assert.equal(await context.daytimeXComparison(db, stale, at(fetchedAt)), null);
  sqlite.close();
});

test('17:00 Japanese and English posts include the comparison in images while keeping post text short', async () => {
  const sent = [];
  const rendered = [];
  const publishedAt = '2026-11-01T17:00:00+09:00';
  const currentRides = rides.map(ride => ({ ...ride, last_updated: publishedAt }));
  context.EMBEDDED_ASSETS = { '/en/index.html': '<html></html>' };
  context.rideJapaneseNames = () => new Map(ids.map((id, index) => [id, `施設${index + 1}`]));
  context.daytimeXComparison = async () => ({ now: 45, past: 40, difference: 5, rides: 6 });
  context.renderXCard = async (_, card) => {
    rendered.push(card);
    return new Response('x'.repeat(2100), { headers: { 'Content-Type': 'image/png' } });
  };
  context.sendBufferPost = async (...args) => sent.push(args);
  const env = {
    DB: { prepare(sql) { return { bind(...args) { return {
      async first() {
        if (sql.includes('FROM app_meta')) return {
          value: args[0] === 'rides_payload' ? JSON.stringify(currentRides) : publishedAt,
        };
        return null;
      },
      async run() { return { meta: { changes: 1 } }; },
    }; } }; } },
    ASSETS: { fetch: async () => new Response('<html></html>') },
    IMAGES: {}, X_AUTOPOST_ENABLED: 'true', EN_PUBLIC_ENABLED: 'true',
    EN_X_AUTOPOST_ENABLED: 'true', BUFFER_API_KEY: 'test',
    BUFFER_X_CHANNEL_ID: 'ja-channel', BUFFER_EN_X_CHANNEL_ID: 'en-channel',
  };
  const seconds = at(publishedAt);
  assert.equal(context.dueXPost(seconds), '17:00');
  assert.equal(context.dueEnglishXPost(seconds), '17:00');
  assert.ok(context.xWaitPost(currentRides, context.rideJapaneseNames(), publishedAt));
  assert.ok(context.englishXPost(currentRides, publishedAt));
  await context.maybePostX(env, seconds);
  await context.maybePostEnglishX(env, seconds);
  assert.equal(sent.length, 2);
  assert.equal(rendered.length, 2);
  assert.match(rendered[0].subtitle, /過去7日同時刻 40分/);
  assert.match(rendered[1].subtitle, /prior 7 days same time 40 min/);
  assert.match(sent[0][7], /過去7日同時刻 40分/);
  assert.match(sent[1][7], /prior 7 days same time 40 min/);
  assert.ok(sent.every(args => context.xWeightedLength(args[3]) <= 280));
});
