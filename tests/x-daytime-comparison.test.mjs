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
  sqlite.exec('CREATE TABLE app_meta(key TEXT PRIMARY KEY,value TEXT);' +
    'CREATE TABLE snapshots(slot INTEGER PRIMARY KEY,captured_at INTEGER);' +
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
    db: { prepare(sql) { return { bind(...args) { return {
      async all() { return { results: sqlite.prepare(sql).all(...args) }; },
      async first() { return sqlite.prepare(sql).get(...args) || null; },
    }; } }; } },
  };
}

test('daytime cards compare current verified rides with their own prior seven-day same-slot waits', async () => {
  const { db, sqlite } = historicalDatabase();
  const comparison = await context.daytimeXComparison(db, rides, at(fetchedAt));
  assert.deepEqual(JSON.parse(JSON.stringify(comparison)), {
    now: 45, past: 40, difference: 5, rides: 6,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(context.currentParkAverage(rides, at(fetchedAt)))),
    { average: 45, rides: 6 });
  const names = new Map(ids.map((id, index) => [id, `施設${index + 1}`]));
  const japanesePost = context.xWaitPost(rides, names, fetchedAt, null, comparison);
  const englishPost = context.englishXPost(rides, fetchedAt, null, comparison);
  assert.ok(japanesePost && context.xWeightedLength(japanesePost) <= 280);
  assert.ok(englishPost && context.xWeightedLength(englishPost) <= 280);
  assert.match(japanesePost.split('\n')[0], /直近7日間の同時刻平均より\+5分/);
  assert.match(englishPost.split('\n')[0], /\+5 min vs prior 7-day same-time avg/);
  const japaneseCard = context.xCardPayload(rides, names, fetchedAt, null, japanesePost,
    comparison, context.currentParkAverage(rides, at(fetchedAt)));
  const englishCard = context.englishXCardPayload(rides, fetchedAt, null, englishPost,
    comparison, context.currentParkAverage(rides, at(fetchedAt)));
  assert.equal(japaneseCard.title, '直近7日間の同時刻平均より+5分');
  assert.equal(englishCard.title, '+5 min vs 7-day same time');
  assert.match(japaneseCard.subtitle, /比較6施設：今45分 \/ 平均40分（\+5分）/);
  assert.match(englishCard.subtitle, /6 matched: now 45 \/ prior 7 days 40 min \(\+5\)/);
  assert.match(context.xWaitPost(rides, names, fetchedAt), /いまの上位3件/);
  assert.match(context.englishXPost(rides, fetchedAt), /Longest waits now/);
  sqlite.close();
});

test('stale current rides and sparse historical records are excluded from the comparison', async () => {
  const { db, sqlite } = historicalDatabase();
  const stale = rides.map(ride => ({ ...ride }));
  stale[0].last_updated = '2026-11-01T12:30:00+09:00';
  const result = await context.daytimeXComparison(db, stale, at(fetchedAt));
  assert.equal(result.rides, 5);
  assert.deepEqual(JSON.parse(JSON.stringify(context.currentParkAverage(stale, at(fetchedAt)))),
    { average: 50, rides: 5 });
  sqlite.exec(`DELETE FROM ride_samples WHERE ride_id=${ids[1]} AND slot IN (` +
    `SELECT slot FROM snapshots ORDER BY slot LIMIT 4)`);
  assert.equal(await context.daytimeXComparison(db, stale, at(fetchedAt)), null);
  sqlite.close();
});

test('midday highlights a verified movement and a Tuesday evening post explains one-tap return', () => {
  const names = new Map(ids.map((id, index) => [id, `施設${index + 1}`]));
  const comparison = { now: 45, past: 40, difference: 5, rides: 6 };
  const previous = { rides: { [ids[5]]: { wait_minutes: 90, is_open: 1, source: 'Queue-Times' } } };
  const midday = '2026-11-10T15:00:00+09:00';
  const middayRides = rides.map(ride => ({ ...ride, last_updated: midday }));
  const movement = context.xWaitPost(middayRides, names, midday, previous, comparison);
  assert.match(movement.split('\n')[0], /約20分前比-20分/);
  assert.ok(context.xWeightedLength(movement) <= 280);
  const evening = '2026-11-10T17:00:00+09:00';
  const eveningRides = rides.map(ride => ({ ...ride, last_updated: evening }));
  const post = context.xWaitPost(eveningRides, names, evening, null, comparison);
  assert.match(post.split('\n')[0], /直近7日間の同時刻平均より\+5分/);
  assert.match(post, /次回はホーム画面から1タップ/);
  assert.ok(context.xWeightedLength(post) <= 280);
  const early = '2026-11-10T16:58:00+09:00';
  const earlyRides = rides.map(ride => ({ ...ride, last_updated: early }));
  const scheduledPost = context.xWaitPost(earlyRides, names, early, null, comparison, true, '17:00');
  assert.match(scheduledPost, /次回はホーム画面から1タップ/);
  const englishEarly = context.englishXPost(earlyRides, early, previous, comparison, '17:00');
  assert.match(englishEarly.split('\n')[0], /shorter vs ~20 min ago/);
});

test('the current park average omits closed, unavailable, inferred and hidden-source waits', () => {
  const mixed = [
    ...rides.slice(0, 2),
    { ...rides[2], is_open: false },
    { ...rides[3], data_unavailable: true },
    { ...rides[4], source: 'Queue-Times:inferred-dark-2026-10-04' },
    { ...rides[5], id: 12068, source: 'Queue-Times' },
  ];
  assert.deepEqual(JSON.parse(JSON.stringify(context.currentParkAverage(mixed, at(fetchedAt)))),
    { average: 25, rides: 2 });
});

test('/api/waits exposes the verified average and matched seven-day comparison separately', async () => {
  const { db, sqlite } = historicalDatabase();
  sqlite.prepare('INSERT INTO app_meta VALUES (?,?)').run('rides_payload', JSON.stringify(rides));
  sqlite.prepare('INSERT INTO app_meta VALUES (?,?)').run('rides_fetched_at', fetchedAt);
  context.Date = class extends Date { static now() { return at(fetchedAt) * 1000; } };
  try {
    const response = await context.route(new Request('https://uniba-waittimes.com/api/waits'), { DB: db });
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.park_average, { average: 45, rides: 6 });
    assert.deepEqual(payload.seven_day_comparison,
      { now: 45, past: 40, difference: 5, rides: 6 });
  } finally {
    delete context.Date;
    sqlite.close();
  }
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
  assert.equal(rendered[0].title, '直近7日間の同時刻平均より+5分');
  assert.equal(rendered[1].title, '+5 min vs 7-day same time');
  assert.match(rendered[0].subtitle, /平均40分/);
  assert.match(rendered[1].subtitle, /prior 7 days 40 min/);
  assert.match(sent[0][7], /平均40分/);
  assert.match(sent[1][7], /prior 7 days 40 min/);
  assert.ok(sent.every(args => context.xWeightedLength(args[3]) <= 280));
  assert.match(sent[0][3].split('\n')[0], /直近7日間の同時刻平均より\+5分/);
  assert.match(sent[1][3].split('\n')[0], /prior 7-day same-time avg/);
});
