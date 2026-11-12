import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8'))
  .replace('export default {', 'globalThis.__worker = {');
const context = vm.createContext({ console, URL, Request, Response, AbortSignal, fetch });
vm.runInContext(source, context, { filename: 'src/index.js' });
const evaluate = expression => vm.runInContext(expression, context);

function fakeDb(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: async () => ({ value: data.get(args[0]) }),
            run: async () => {
              if (sql.startsWith('INSERT INTO app_meta')) data.set(args[0], args[1]);
              if (sql.startsWith('DELETE FROM app_meta'))
                for (const key of data.keys()) if (key.startsWith('official_shows_') && key < args[0]) data.delete(key);
            },
          };
        },
      };
    },
  };
}

test('公式の翌日ショー時刻を日時・冬季ショー名付きで解釈する', () => {
  const raw = {
    ScheduleDate: '2026-11-14T00:00:00+09:00',
    ShowInformation: {
      UpdateTime: '2026-11-09T16:04:59+09:00',
      Details: [{
        ContentId: 'com.usj.park.shows.minions_cool_winter_greeting_2026',
        AttractionName: 'ミニオン・クール・ウインター・グリーティング',
        OpenTime: ['2026-11-14T09:45:00+09:00'],
      }],
    },
  };
  context.__raw = raw;
  const parsed = evaluate('parseOfficialShows(globalThis.__raw, "2026-11-14", "2026-11-13T00:00:00Z")');
  assert.equal(parsed.shows.length, 1);
  assert.equal(parsed.shows[0].name, 'ミニオン・クール・ウインター・グリーティング');
  assert.equal(parsed.shows[0].times[0].start, '2026-11-14T00:45:00.000Z');
});

test('設定が欠けても保存済みの翌日ショー時刻を表示する', async () => {
  const tomorrow = evaluate('jstDay(epoch() + 86400)');
  const payload = { day: tomorrow, shows: [{ name: 'test', times: [{ start: `${tomorrow}T01:00:00Z` }] }] };
  const db = fakeDb({ [`official_shows_${tomorrow}`]: JSON.stringify(payload) });
  context.__env = { DB: db };
  context.__request = new Request(`https://example.com/api/shows?date=${tomorrow}`);
  const response = await evaluate('route(globalThis.__request, globalThis.__env)');
  const result = await response.json();
  assert.equal(result.shows.length, 1);
  assert.equal(result.stale, true);
});

test('公式設定が残っていても8時間以上古い時刻は再確認待ちと示す', async () => {
  const tomorrow = evaluate('jstDay(epoch() + 86400)');
  const payload = { day: tomorrow, shows: [{ name: 'test', times: [{ start: `${tomorrow}T01:00:00Z` }] }],
    checked_at: new Date(Date.now() - 9 * 3600 * 1000).toISOString() };
  const db = fakeDb({ [`official_shows_${tomorrow}`]: JSON.stringify(payload) });
  context.__env = { DB: db, OFFICIAL_API_TOKEN: 'configured' };
  context.__request = new Request(`https://example.com/api/shows?date=${tomorrow}`);
  const response = await evaluate('route(globalThis.__request, globalThis.__env)');
  assert.equal((await response.json()).stale, true);
});

test('公式API設定が欠けている状態を診断用に残す', async () => {
  const db = fakeDb();
  context.__env = { DB: db };
  await evaluate('refreshOfficialShows(globalThis.__env, epoch())');
  assert.equal(JSON.parse(db.data.get('official_shows_health')).status, 'configuration_missing');
});

test('公式取得が失敗したら前回の時刻を保持し短時間の再試行を抑える', async () => {
  const day = evaluate('jstDay(epoch())');
  const checkedAt = new Date(Date.now() - 7 * 3600 * 1000).toISOString();
  const old = { day, shows: [{ name: 'previous', times: [{ start: `${day}T01:00:00Z` }] }],
    checked_at: checkedAt, fetched_at: checkedAt, unavailable: false };
  const db = fakeDb({ [`official_shows_${day}`]: JSON.stringify(old) });
  let requests = 0;
  context.fetch = async () => { requests++; return new Response('unauthorized', { status: 401 }); };
  context.__env = { DB: db, OFFICIAL_API_TOKEN: 'invalid' };
  const originalConsole = context.console;
  context.console = { ...console, error() {} };
  try {
    await evaluate('refreshOfficialShows(globalThis.__env, epoch())');
    const kept = JSON.parse(db.data.get(`official_shows_${day}`));
    assert.equal(kept.shows.length, 1);
    assert.equal(kept.checked_at, checkedAt);
    assert.equal(kept.stale, true);
    assert.equal(JSON.parse(db.data.get('official_shows_health')).status, 'source_error');
    const firstRequests = requests;
    await evaluate('refreshOfficialShows(globalThis.__env, epoch())');
    assert.equal(requests, firstRequests);
  } finally {
    context.fetch = fetch;
    context.console = originalConsole;
  }
});
