import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
const helpers = source.match(/function inspectSnapshotRide\(ride, capturedAt\) \{[\s\S]*?(?=async function refreshLive)/)?.[0];
const save = source.match(/async function saveSnapshot\(db, rides, capturedAt, sourceCounts = \{\}\) \{[\s\S]*?(?=async function refreshSchedule)/)?.[0];
assert.ok(helpers && save);

function setup() {
  const recorded = [];
  const statements = [];
  const capturedAt = Date.parse('2026-10-29T21:20:00+09:00') / 1000;
  const context = {
    Date, Math, Number, JSON, console,
    SOURCE_MAX_AGE: 900, SNAPSHOT_SECONDS: 1200,
    DARK_ESTIMATE_SOURCE: 'estimated',
    jstDay: seconds => new Date((seconds + 32400) * 1000).toISOString().slice(0, 10),
    dayStart: seconds => Math.floor((seconds + 32400) / 86400) * 86400 - 32400,
    readMeta: async () => null,
    readTodayMatrix: async () => ({ day: '2026-10-29', snapshots: [] }),
    visibleSample: () => true,
    writeMeta: async (_db, key, value) => { recorded.push({ key, value: JSON.parse(value) }); },
  };
  const saveSnapshot = vm.runInNewContext(`${helpers}\n${save}\nsaveSnapshot`, context);
  const db = {
    prepare(sql) {
      return {
        sql,
        bind(...params) { this.params = params; return this; },
        async first() {
          if (sql.startsWith('SELECT COUNT(*)')) return { count: 2 };
          return null;
        },
      };
    },
    async batch(items) { statements.push(...items); },
  };
  return { saveSnapshot, db, recorded, statements, capturedAt };
}

test('snapshot diagnostic records each facility age, exclusions, and stored count', async () => {
  const { saveSnapshot, db, recorded, statements, capturedAt } = setup();
  const time = seconds => new Date((capturedAt - seconds) * 1000).toISOString();
  const rides = [
    { id: 1, source: 'Queue-Times', is_open: true, wait_time: 35, last_updated: time(899) },
    { id: 2, source: 'Queue-Times', is_open: true, wait_time: 40, last_updated: time(901) },
    { id: 3, source: 'ThemeParks.wiki', is_open: false, wait_time: null,
      verified_at: time(40), last_updated: time(1800) },
    { id: 4, source: 'Queue-Times', is_open: true, wait_time: -1, last_updated: time(30) },
    { id: 5, source: 'ThemeParks.wiki', is_open: false, data_unavailable: true },
  ];
  assert.equal(await saveSnapshot(db, rides, capturedAt, { queue_rides: 3, wiki_live_data: 2 }), true);
  assert.equal(statements.filter(item => item.sql.startsWith('INSERT OR IGNORE INTO ride_samples')).length, 2);
  assert.equal(recorded.length, 1);
  const { key, value } = recorded[0];
  assert.match(key, /^snapshot_diag_2026-10-29_/);
  assert.equal(value.status, 'saved');
  assert.equal(value.planned_samples, 2);
  assert.equal(value.stored_samples, 2);
  assert.equal(value.source_counts.queue_rides, 3);
  assert.equal(value.rides.find(item => item.ride_id === 1).age_seconds, 899);
  assert.equal(value.rides.find(item => item.ride_id === 2).age_seconds, 901);
  assert.equal(value.rides.find(item => item.ride_id === 3).upstream_age_seconds, 1800);
  assert.equal(value.rides.find(item => item.ride_id === 3).age_seconds, 40);
  assert.equal(value.excluded.stale_timestamp, 1);
  assert.equal(value.excluded.invalid_wait, 1);
  assert.equal(value.excluded.data_unavailable, 1);
});

test('a wholly stale slot leaves a durable diagnostic without inserting a snapshot', async () => {
  const { saveSnapshot, db, recorded, statements, capturedAt } = setup();
  const rides = [{ id: 1, source: 'Queue-Times', is_open: true, wait_time: 10,
    last_updated: new Date((capturedAt - 901) * 1000).toISOString() }];
  assert.equal(await saveSnapshot(db, rides, capturedAt), false);
  assert.equal(statements.length, 0);
  assert.equal(recorded[0].value.status, 'no_recent_samples');
  assert.equal(recorded[0].value.excluded.stale_timestamp, 1);
});

test('a failed snapshot write keeps the facility-level evidence and propagates the error', async () => {
  const { saveSnapshot, db, recorded, capturedAt } = setup();
  db.batch = async () => { throw new Error('D1 write failed'); };
  const rides = [{ id: 1, source: 'Queue-Times', is_open: true, wait_time: 10,
    last_updated: new Date((capturedAt - 899) * 1000).toISOString() }];
  await assert.rejects(saveSnapshot(db, rides, capturedAt), /D1 write failed/);
  assert.equal(recorded[0].value.status, 'save_error');
  assert.equal(recorded[0].value.rides[0].age_seconds, 899);
});
