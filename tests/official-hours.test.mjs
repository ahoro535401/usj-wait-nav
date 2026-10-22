import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';

test('official hours survive a stale and shorter third-party schedule refresh', async () => {
  const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
  const overrides = source.match(/const OFFICIAL_HOURS_OVERRIDES = [\s\S]*?(?=const WEATHER_URL)/)?.[0];
  const refresh = source.match(/async function refreshSchedule\(db\) \{[\s\S]*?(?=async function inCollectionWindow)/)?.[0];
  assert.ok(overrides && refresh);
  const rows = new Map([
    ['2026-11-15', { day: '2026-11-15', opens: '08:30', closes: '22:00',
      status: 'OPERATING', source: 'ThemeParks.wiki', checked_at: null }],
    ['2026-11-22', { day: '2026-11-22', opens: '08:30', closes: '22:00',
      status: 'OPERATING', source: 'ThemeParks.wiki', checked_at: null }],
  ]);
  const changed = [];
  const db = {
    prepare(sql) {
      const statement = {
        bind(...params) { this.params = params; return this; },
        async all() { return { results: [...rows.values()] }; },
        async run() {
          if (sql.startsWith('INSERT INTO park_days')) {
            const [day, opens, closes, status, source, checked_at] = this.params;
            rows.set(day, { day, opens, closes, status, source, checked_at });
            changed.push(day);
          } else if (sql.startsWith('DELETE FROM park_days')) {
            rows.delete(this.params[0]);
          }
        },
      };
      return statement;
    },
    async batch(statements) { for (const statement of statements) await statement.run(); },
  };
  const wiki = {
    id: '47f61fac-7586-41ac-ae80-61c9257cf33e', timezone: 'Asia/Tokyo',
    schedule: [
      { date: '2026-11-15', type: 'OPERATING',
        openingTime: '2026-11-15T08:30:00+09:00', closingTime: '2026-11-15T22:00:00+09:00' },
      { date: '2026-11-22', type: 'OPERATING',
        openingTime: '2026-11-22T08:30:00+09:00', closingTime: '2026-11-22T22:00:00+09:00' },
    ],
  };
  const context = {
    Date, Map, Set,
    PARK_ID: wiki.id, WIKI_SCHEDULE_URL: 'test-schedule',
    fetchJson: async () => wiki,
    epoch: () => Date.parse('2026-10-23T12:00:00+09:00') / 1000,
    jstDay: seconds => new Date((seconds + 32400) * 1000).toISOString().slice(0, 10),
    hhmm: seconds => new Date((seconds + 32400) * 1000).toISOString().slice(11, 16),
  };
  const refreshSchedule = vm.runInNewContext(`${overrides}\n${refresh}\nrefreshSchedule`, context);
  await refreshSchedule(db);
  assert.deepEqual([rows.get('2026-11-15').opens, rows.get('2026-11-15').closes], ['08:00', '22:00']);
  for (let day = 23; day <= 30; day++) {
    assert.equal(rows.get(`2026-11-${day}`).source, 'USJ公式');
  }
  assert.equal(rows.get('2026-11-22').opens, '08:30');
  assert.equal(changed.length, 9);
  rows.set('2026-11-15', { ...rows.get('2026-11-15'), opens: '09:00', checked_at: '2026-10-24' });
  rows.set('2026-12-01', { day: '2026-12-01', opens: '09:00', closes: '20:00',
    status: 'OPERATING', source: 'USJ公式', checked_at: '2026-10-24' });
  await refreshSchedule(db);
  assert.equal(changed.length, 9);
  assert.equal(rows.get('2026-11-15').opens, '09:00');
  assert.equal(rows.get('2026-12-01').opens, '09:00');
});

test('official correction migration resists old Worker updates and deletions', async () => {
  const sql = await readFile(new URL('../migrations/0013_official_hours_20261023.sql', import.meta.url), 'utf8');
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE park_days (day TEXT PRIMARY KEY, opens TEXT, closes TEXT, status TEXT, source TEXT, checked_at TEXT)');
    db.exec("INSERT INTO park_days VALUES ('2026-11-15','08:30','22:00','OPERATING','ThemeParks.wiki',NULL)");
    db.exec(sql);
    db.exec(sql);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM park_days').get().n, 9);
    db.exec("UPDATE park_days SET opens='08:30',source='ThemeParks.wiki' WHERE day='2026-11-15'");
    db.exec("DELETE FROM park_days WHERE day='2026-11-30'");
    assert.equal(db.prepare("SELECT opens FROM park_days WHERE day='2026-11-15'").get().opens, '08:00');
    assert.equal(db.prepare("SELECT closes FROM park_days WHERE day='2026-11-30'").get().closes, '22:00');
    db.exec("UPDATE park_days SET closes='21:30',source='USJ公式' WHERE day='2026-11-30'");
    assert.equal(db.prepare("SELECT closes FROM park_days WHERE day='2026-11-30'").get().closes, '21:30');
  } finally {
    db.close();
  }
});
