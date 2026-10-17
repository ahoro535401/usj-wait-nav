import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
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

function mockEnvironment({ status = 'OPERATING', count = 40, onWrite = null } = {}) {
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
  assert.equal(stored[0].card.rows[2].name, '比較的空いた 09時台');
  assert.equal(stored[1].card.rows[2].name, 'Quietest: 09:00');
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
