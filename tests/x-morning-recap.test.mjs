import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8'))
  .replace('export default {', 'globalThis.__worker = {');
const context = vm.createContext({
  console, URL, Request, Response, AbortSignal, fetch,
  EMBEDDED_ASSETS: { '/en/index.html': '' },
});
vm.runInContext(source, context, { filename: 'src/index.js' });

const at = value => Date.parse(value) / 1000;
const sample = {
  average_wait: 52,
  opening_at: at('2026-10-13T08:00:00+09:00'),
  closing_at: at('2026-10-13T22:00:00+09:00'),
  first_at: at('2026-10-13T08:20:00+09:00'),
  last_at: at('2026-10-13T21:40:00+09:00'),
  hours: [
    { at: at('2026-10-13T09:00:00+09:00'), snapshots: 3, ride_count: 12, average_wait: 43 },
    { at: at('2026-10-13T17:00:00+09:00'), snapshots: 3, ride_count: 12, average_wait: 75 },
    { at: at('2026-10-13T22:00:00+09:00'), snapshots: 2, ride_count: 12, average_wait: 10 },
  ],
};

function mockEnvironment({ status = 'OPERATING', count = 40, onWrite = null, recentDays = [] } = {}) {
  const requestedDays = [];
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.includes('FROM park_days')) {
                requestedDays.push(args[0]);
                return { status, opens: '08:00', closes: '22:00' };
              }
              if (sql.includes('FROM snapshots')) return { count };
              throw new Error(`Unexpected query: ${sql}`);
            },
            async all() {
              if (sql.includes('GROUP BY p.day ORDER BY p.day')) return { results: recentDays };
              throw new Error(`Unexpected query: ${sql}`);
            },
            async run() {
              if (!sql.includes('INSERT INTO app_meta')) throw new Error(`Unexpected write: ${sql}`);
              onWrite?.(...args);
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
  };
  return {
    env: {
      DB: db, X_AUTOPOST_ENABLED: 'true', EN_PUBLIC_ENABLED: 'true',
      EN_X_AUTOPOST_ENABLED: 'true', BUFFER_API_KEY: 'test',
      BUFFER_X_CHANNEL_ID: 'ja-channel', BUFFER_EN_X_CHANNEL_ID: 'en-channel',
    },
    requestedDays,
  };
}

test('05:30 JST posts the previous date to both language channels', async () => {
  const sent = [];
  context.archiveDay = async (_, day) => ({ ...sample, day });
  context.sendBufferPost = async (...args) => sent.push(args);
  const { env, requestedDays } = mockEnvironment();
  const seconds = at('2026-10-14T05:30:00+09:00');
  await context.maybePostPreviousDayX(env, seconds);
  await context.maybePostPreviousDayEnglishX(env, seconds);
  assert.deepEqual(requestedDays, ['2026-10-13', '2026-10-13']);
  assert.equal(sent.length, 2);
  assert.equal(sent[0][2], '05:30');
  assert.equal(sent[0][6], 'https://uniba-waittimes.com/og-photo-labeled.jpg');
  assert.match(sent[0][3], /昨日 10\/13（火）のUSJ混雑実績/);
  assert.match(sent[0][3], /plan\?date=2026-10-13/);
  assert.match(sent[0][3], /混雑ピーク：17時台/);
  assert.ok(sent[0][3].indexOf('https://') < 140);
  assert.match(sent[1][3], /Yesterday at USJ \| 10\/13 \(Tue\)/);
  assert.match(sent[1][3], /\/en\/x\/day\/2026-10-13/);
  assert.ok(sent[1][3].indexOf('https://') < 140);
  assert.equal(sent[1][8].channelId, 'en-channel');
  assert.equal(sent[1][8].keyPrefix, 'buffer_en_x');
  assert.ok(sent.every(args => args[5])); // both languages have a recap reply
  assert.match(sent[0][5], /比較的空いていたのは09時台/);
  assert.match(sent[1][5], /quietest recorded hour was 09:00/);
  assert.equal(context.xDailyCardPayload('2026-10-13', sample, true).title, '昨日の混雑実績');
  assert.equal(context.englishDailyCardPayload('2026-10-13', sample, true).title, 'Yesterday at USJ');
  assert.equal(context.xDailyCardPayload('2026-10-13', sample, true).layout, 'photo-recap-v1');
  assert.equal(context.englishDailyCardPayload('2026-10-13', sample, true).layout, 'photo-recap-v1');
  assert.equal(context.xDailyCardPayload('2026-10-13', sample).layout, 'photo-recap-v1');
  assert.equal(context.englishDailyCardPayload('2026-10-13', sample).layout, 'photo-recap-v1');
});

test('the 05:30 cards describe yesterday in both languages', async () => {
  const stored = [];
  context.renderXCard = async () => new Response('x'.repeat(2100), {
    headers: { 'Content-Type': 'image/png' },
  });
  const { env } = mockEnvironment({ onWrite: (key, value) => stored.push({ key, card: JSON.parse(value) }) });
  env.IMAGES = {};
  const seconds = at('2026-10-14T05:30:00+09:00');
  const japanese = await context.japaneseDailyXImage(env, seconds, '05:30', '2026-10-13', sample, true);
  const english = await context.englishXImage(env, seconds, '05:30',
    context.englishDailyCardPayload('2026-10-13', sample, true));
  assert.equal(japanese.url, 'https://uniba-waittimes.com/x-card/2026-10-14/0530.png');
  assert.equal(english.url, 'https://uniba-waittimes.com/en/x-card/2026-10-14/0530.png');
  assert.deepEqual(stored.map(item => item.key), ['xcard_2026-10-14_0530', 'xcard_en_2026-10-14_0530']);
  assert.equal(stored[0].card.title, '昨日の混雑実績');
  assert.equal(stored[1].card.title, 'Yesterday at USJ');
  assert.equal(stored[0].card.layout, 'photo-recap-v1');
  assert.equal(stored[1].card.layout, 'photo-recap-v1');
  assert.equal(stored[0].card.rows[2].name, '比較的空いた 09時台');
  assert.equal(stored[1].card.rows[2].name, 'Quietest: 09:00');
  assert.match(english.alt, /Daily average: 50 min/);
});

test('recap ranking excludes hours after closing and partially open hours', () => {
  const partialClosing = {
    ...sample,
    opening_at: at('2026-10-13T08:30:00+09:00'),
    closing_at: at('2026-10-13T21:30:00+09:00'),
    hours: [
      { at: at('2026-10-13T08:00:00+09:00'), snapshots: 2, ride_count: 12, average_wait: 5 },
      ...sample.hours,
      { at: at('2026-10-13T21:00:00+09:00'), snapshots: 2, ride_count: 12, average_wait: 4 },
    ],
  };
  assert.equal(context.xDailyCardPayload('2026-10-13', partialClosing, true).rows[2].name,
    '比較的空いた 09時台');
  assert.equal(context.englishDailyCardPayload('2026-10-13', partialClosing, true).rows[2].name,
    'Quietest: 09:00');
  assert.doesNotMatch(context.xDailyReply(partialClosing), /08時台|21時台|22時台/);
});

test('the morning window and data quality gates prevent a stale recap', async () => {
  const sent = [];
  context.archiveDay = async () => sample;
  context.sendBufferPost = async (...args) => sent.push(args);
  const outside = mockEnvironment();
  await context.maybePostPreviousDayX(outside.env, at('2026-10-14T05:45:00+09:00'));
  await context.maybePostPreviousDayEnglishX(outside.env, at('2026-10-14T22:30:00+09:00'));
  assert.equal(outside.requestedDays.length, 0);
  const closed = mockEnvironment({ status: 'CLOSED' });
  await context.maybePostPreviousDayX(closed.env, at('2026-10-14T05:30:00+09:00'));
  const sparse = mockEnvironment({ count: 10 });
  await context.maybePostPreviousDayEnglishX(sparse.env, at('2026-10-14T05:30:00+09:00'));
  assert.equal(sent.length, 0);
});

test('both recap cards compare against seven complete prior operating days without adding post text', async () => {
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(at('2026-10-06T12:00:00+09:00') * 1000 + index * 86400 * 1000)
      .toISOString().slice(0, 10);
    return {
      day, opens: '08:00', closes: '22:00', status: 'OPERATING', coverage: 40,
      first_at: at(`${day}T08:20:00+09:00`), last_at: at(`${day}T21:40:00+09:00`),
      wait_total: index === 6 ? 500 : 360, wait_count: 10,
    };
  });
  const { env } = mockEnvironment({ recentDays });
  context.archiveDay = async () => sample;
  const data = await context.dailyRecapData(env, '2026-10-13', at('2026-10-14T05:30:00+09:00'));
  assert.equal(data.seven_day_average, 40);
  assert.match(context.xDailyCardPayload('2026-10-13', data, true).subtitle,
    /直近7日平均 40分 \| この日 \+10分/);
  assert.match(context.englishDailyCardPayload('2026-10-13', data, false).subtitle,
    /Prior 7-day avg 40 min \| this day \+10 min/);
  assert.doesNotMatch(context.xPreviousDayPost('2026-10-13', data), /直近7日平均/);
  assert.equal(context.xPreviousDayPost('2026-10-13', data),
    context.xPreviousDayPost('2026-10-13', sample));
  assert.equal(context.xDailyPost('2026-10-13', data), context.xDailyPost('2026-10-13', sample));
  assert.equal(context.englishXPreviousDayPost('2026-10-13', data),
    context.englishXPreviousDayPost('2026-10-13', sample));
  assert.equal(context.englishXDailyPost('2026-10-13', data),
    context.englishXDailyPost('2026-10-13', sample));
  assert.ok(context.xWeightedLength(context.xPreviousDayPost('2026-10-13', data)) <= 250);
  assert.ok(context.xWeightedLength(context.xDailyPost('2026-10-13', data)) <= 250);
  assert.ok(context.xWeightedLength(context.englishXPreviousDayPost('2026-10-13', data)) <= 280);
  assert.ok(context.xWeightedLength(context.englishXDailyPost('2026-10-13', data)) <= 280);

  recentDays[3].coverage = 5;
  assert.equal(await context.sevenDayRecapAverage(env.DB, '2026-10-13'), null);
  recentDays.splice(3, 1);
  assert.equal(await context.sevenDayRecapAverage(env.DB, '2026-10-13'), null);
});

test('seven-day SQL computes the mean of daily recorded waits and excludes inferred waits', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE park_days(day TEXT PRIMARY KEY, opens TEXT, closes TEXT, status TEXT);' +
    'CREATE TABLE snapshots(slot INTEGER PRIMARY KEY, captured_at INTEGER);' +
    'CREATE TABLE ride_samples(slot INTEGER, ride_id INTEGER, wait_minutes INTEGER, is_open INTEGER, source TEXT);');
  const insertDay = sqlite.prepare('INSERT INTO park_days VALUES (?,?,?,?)');
  const insertSnapshot = sqlite.prepare('INSERT INTO snapshots VALUES (?,?)');
  const insertSample = sqlite.prepare('INSERT INTO ride_samples VALUES (?,?,?,?,?)');
  for (let index = 0; index < 7; index++) {
    const day = new Date(at('2026-10-06T12:00:00+09:00') * 1000 + index * 86400 * 1000)
      .toISOString().slice(0, 10);
    insertDay.run(day, '08:00', '22:00', 'OPERATING');
    for (let slotIndex = 0; slotIndex < 42; slotIndex++) {
      const captured = at(`${day}T08:00:00+09:00`) + slotIndex * 1200;
      const slot = captured / 1200;
      insertSnapshot.run(slot, captured);
      insertSample.run(slot, 1000, index === 6 ? 50 : 30, 1, 'Queue-Times');
      insertSample.run(slot, 1001, 999, 1, 'Queue-Times:inferred-dark-2026-10-04');
      insertSample.run(slot, 12067, 999, 1, 'Queue-Times');
    }
  }
  const db = { prepare(sql) { return { bind(...args) { return { async all() {
    return { results: sqlite.prepare(sql).all(...args) };
  } }; } }; } };
  assert.equal(await context.sevenDayRecapAverage(db, '2026-10-13'), 35);
  sqlite.close();
});
