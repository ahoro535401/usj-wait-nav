import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../dist/en-release/worker.js';

test('all-ride averages compare only matching recorded slots and ignore closed or inferred waits', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE snapshots (slot INTEGER PRIMARY KEY, captured_at INTEGER); ' +
    'CREATE TABLE ride_samples (slot INTEGER, ride_id INTEGER, wait_minutes INTEGER, is_open INTEGER, source TEXT, PRIMARY KEY(slot,ride_id))');
  const now = Math.floor(Date.now() / 1000);
  const firstSlot = Math.floor((now + 9 * 3600) / 86400) * 72 - 27;
  const add = (offset, id, wait, open = 1, source = 'Queue-Times', bin = firstSlot) =>
    sqlite.prepare('INSERT INTO ride_samples VALUES (?,?,?,?,?)').run(bin - offset * 72, id, wait, open, source);
  sqlite.prepare('INSERT INTO snapshots VALUES (?,?)').run(firstSlot, firstSlot * 1200);
  add(0, 1, 80);
  add(0, 2, 15);
  add(0, 3, null, 0);
  add(0, 4, 90, 1, 'Queue-Times:inferred-dark-2026-10-04');
  add(1, 1, 40);
  add(2, 1, 60);
  add(3, 1, 100, 0);
  add(4, 1, 90, 1, 'Queue-Times:inferred-dark-2026-10-04');
  add(5, 1, 20);
  add(6, 1, 100);
  add(7, 1, 50);
  for (const day of [1, 2, 3]) {
    add(day, 1, 30, 1, 'Queue-Times', firstSlot + 6);
    add(day, 1, 40, 1, 'Queue-Times', firstSlot + 9);
  }
  add(1, 1, 999, 1, 'Queue-Times', firstSlot + 1); // no today observation at this time
  const env = { DB: { prepare(sql) { return { bind(...args) { return {
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
  }; } }; } } };
  try {
    const response = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-averages?slot=${firstSlot}`), env, {});
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.through_slot, firstSlot);
    assert.deepEqual(data.rides['1'], {
      today_average: 80, today_samples: 1, past_average: 54, past_samples: 5, past_days: 5,
    });
    assert.equal(data.rides['2'].today_average, 15);
    assert.equal(data.rides['2'].past_average, null);
    assert.equal(data.rides['3'], undefined);
    assert.equal(data.rides['4'], undefined);
    const chartResponse = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-trends?ride_id=1&slot=${firstSlot}`), env, {});
    assert.equal(chartResponse.status, 200);
    const chart = await chartResponse.json();
    assert.equal(chart.ride_id, 1);
    assert.equal(chart.through_slot, firstSlot);
    assert.match(chart.html, /本日の20分ごとの待ち時間と過去7日の同時刻平均の比較/);
    assert.match(chart.html, /trend-series trend-today/);
    assert.match(chart.html, /trend-series trend-past/);
    assert.ok((chart.html.match(/class="trend-grid"/g) || []).length >= 6); // finer minute guides
    assert.ok((chart.html.match(/class="trend-hour-grid"/g) || []).length >= 5); // every hour
    const shortWaitChart = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-trends?ride_id=2&slot=${firstSlot}`), env, {});
    const shortHtml = (await shortWaitChart.json()).html;
    assert.match(shortHtml, /class="trend-axis"[^>]*>15<\/text>/); // ride-specific upper bound
    assert.doesNotMatch(shortHtml, /class="trend-axis"[^>]*>50<\/text>/);
    const englishChart = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-trends?ride_id=1&slot=${firstSlot}&lang=en`), env, {});
    assert.match((await englishChart.json()).html, /previous 7-day same-time average/);
    const future = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-averages?slot=${Math.floor(now / 1200) + 1}`), env, {});
    assert.equal(future.status, 400);
    const futureChart = await worker.fetch(new Request(`https://uniba-waittimes.com/api/ride-trends?ride_id=1&slot=${Math.floor(now / 1200) + 1}`), env, {});
    assert.equal(futureChart.status, 400);
  } finally {
    sqlite.close();
  }
});
