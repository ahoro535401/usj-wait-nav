import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8'))
  .replace('export default {', 'globalThis.__worker = {');
const context = vm.createContext({ console, URL, Request, Response, AbortSignal, fetch });
vm.runInContext(source, context, { filename: 'src/index.js' });
const visibleRidesForDay = (rides, day) => Array.from(
  vm.runInContext(`visibleRidesForDay(${JSON.stringify(rides)}, ${JSON.stringify(day)})`, context));

test('11月8日までは終了予定の3施設を残し、11月9日から除外する', () => {
  const rides = [15322, 13925, 17893, 12067, 12324, 17894, 17912]
    .map(id => ({ id }));
  assert.deepEqual(visibleRidesForDay(rides, '2026-11-08').map(ride => ride.id),
    rides.map(ride => ride.id));
  assert.deepEqual(visibleRidesForDay(rides, '2026-11-09').map(ride => ride.id),
    [12067, 12324, 17894, 17912]);
  assert.equal(rides.length, 7);
});

test('終了日の切替は日本時間の午前0時で行う', () => {
  const before = Date.parse('2026-11-08T14:59:59Z') / 1000;
  const after = Date.parse('2026-11-08T15:00:00Z') / 1000;
  assert.equal(vm.runInContext(`jstDay(${before})`, context), '2026-11-08');
  assert.equal(vm.runInContext(`jstDay(${after})`, context), '2026-11-09');
});

test('おさるのジョージは運営終了日まで現在表示に残し翌日から除外する', () => {
  const rides = [{ id: 12091 }, { id: 12067 }];
  assert.deepEqual(visibleRidesForDay(rides, '2027-02-28').map(ride => ride.id), [12091, 12067]);
  assert.deepEqual(visibleRidesForDay(rides, '2027-03-01').map(ride => ride.id), [12067]);
});

test('提供元に終了施設が残っても、翌日の取得データには保存しない', () => {
  const queue = { rides: [15322, 13925, 17893, 12067, 12324, 17894]
    .map(id => ({ id, name: String(id), is_open: true, wait_time: 20 })) };
  const ids = fetchedAt => Array.from(vm.runInContext(
    `parseRides(${JSON.stringify(queue)}, null, ${JSON.stringify(fetchedAt)})`, context),
    ride => ride.id);
  assert.ok(ids('2026-11-08T14:59:59Z').includes(13925));
  const tomorrow = ids('2026-11-08T15:00:00Z');
  assert.ok([15322, 13925, 17893].every(id => !tomorrow.includes(id)));
  assert.ok([12067, 12324, 17894].every(id => tomorrow.includes(id)));
});
