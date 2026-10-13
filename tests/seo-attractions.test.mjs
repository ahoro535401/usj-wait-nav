import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../dist/en-release/worker.js';

const now = Date.now();
const fetchedAt = new Date(now - 60000).toISOString();
const verifiedAt = new Date(now - 90000).toISOString();
const previousAt = new Date(now - 6 * 60000).toISOString();
const ride = { id: 12061, is_open: true, wait_time: 95, source: 'Queue-Times', last_updated: verifiedAt };
const values = new Map([
  ['rides_payload', JSON.stringify([ride])], ['rides_fetched_at', fetchedAt],
  ['rides_previous_payload', JSON.stringify({ fetched_at: previousAt, rides: [
    { ...ride, wait_time: 105, last_updated: previousAt },
  ] })],
]);
const env = { EN_PUBLIC_ENABLED: 'true', DB: {
  prepare(sql) {
    let args;
    return {
      bind(...values) { args = values; return this; },
      async first() {
        assert.match(sql, /SELECT value FROM app_meta/);
        return { value: values.get(args[0]) };
      },
      async all() {
        if (sql.includes('GROUP BY period,bin')) return { results: [
          { period: 'past', bin: 30, samples: 4, total_wait: 280, average_wait: 70 },
          { period: 'past', bin: 31, samples: 4, total_wait: 280, average_wait: 70 },
          { period: 'past', bin: 32, samples: 4, total_wait: 280, average_wait: 70 },
          { period: 'past', bin: 33, samples: 3, total_wait: 240, average_wait: 80 },
          { period: 'past', bin: 34, samples: 3, total_wait: 300, average_wait: 100 },
          { period: 'past', bin: 36, samples: 2, total_wait: 300, average_wait: 150 },
          { period: 'today', bin: 30, samples: 1, total_wait: 95, average_wait: 95 },
          { period: 'today', bin: 31, samples: 1, total_wait: 125, average_wait: 125 },
        ] };
        if (sql.includes('ORDER BY h.captured_at DESC')) return { results: [
          { captured_at: Math.floor((Date.parse(fetchedAt) - 20 * 60000) / 1000), wait_minutes: 85,
            is_open: 1, source: 'Queue-Times' },
          { captured_at: Math.floor((Date.parse(fetchedAt) - 60 * 60000) / 1000), wait_minutes: 120,
            is_open: 1, source: 'Queue-Times' },
        ] };
        throw new Error(`Unexpected SQL: ${sql}`);
      },
    };
  },
} };
const get = path => worker.fetch(new Request(`https://uniba-waittimes.com${path}`), env, {});

test('Japanese and English attraction pages render useful, matching source HTML', async () => {
  const ja = await get('/attraction/mario-kart-koopas-challenge');
  const en = await get('/en/attraction/mario-kart-koopas-challenge');
  assert.equal(ja.status, 200);
  assert.equal(en.status, 200);
  const japanese = await ja.text(), english = await en.text();
  assert.match(japanese, /<h1>マリオカート ～クッパの挑戦状～™の待ち時間<\/h1>/);
  assert.match(japanese, /95分/);
  assert.match(japanese, /5分前比<\/span><strong>↓10分/);
  assert.match(japanese, /20分前比<\/span><strong>↑10分/);
  assert.match(japanese, /1時間前比<\/span><strong>↓25分/);
  assert.match(japanese, /11時台・平均90分/);
  assert.match(japanese, /10:00–11:00<\/th><td>110分<\/td><td>70分/);
  assert.doesNotMatch(japanese, /12:00–13:00/); // fewer than three records
  assert.match(japanese, /data-series="today"/);
  assert.match(japanese, /data-series="past"/);
  assert.match(japanese, /<th scope="col">本日平均<\/th><th scope="col">過去7日平均<\/th>/);
  assert.match(japanese, /5分・20分・1時間前比の増減値や将来の予測ではありません/);
  assert.match(japanese, /本日：20分ごとの記録値/);
  assert.match(japanese, /過去7日：同時刻の平均/);
  assert.match(japanese, /10:00 · 本日の記録値 · 95分/);
  assert.match(japanese, /10:20 · 本日の記録値 · 125分/);
  assert.match(japanese, /10:00 · 過去7日の同じ20分枠の平均 · 70分/);
  assert.doesNotMatch(japanese, /記録数/);
  assert.match(english, /<html lang="en">/);
  assert.match(english, /<h1>Mario Kart: Koopa&#39;s Challenge wait time<\/h1>/);
  assert.match(english, /95 min/);
  assert.match(english, /These values are not 5, 20 or 60-minute changes or forecasts/);
  assert.match(english, /Today: every 20 min/);
  assert.match(english, /Previous 7 days: same-time average/);
  for (const html of [japanese, english]) {
    assert.match(html, /hreflang="ja" href="https:\/\/uniba-waittimes.com\/attraction\/mario-kart-koopas-challenge"/);
    assert.match(html, /hreflang="en" href="https:\/\/uniba-waittimes.com\/en\/attraction\/mario-kart-koopas-challenge"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.match(html, /https:\/\/www.usj.co.jp\/web\//);
    assert.match(html, /<script src="\/analytics.js" defer><\/script>/);
  }
});

const guideSlugs = ['mario-kart-koopas-challenge', 'donkey-kong-country-ride',
  'the-flying-dinosaur', 'hollywood-dream-the-ride', 'hollywood-dream-the-ride-backdrop',
  'yoshis-adventure', 'flight-of-the-hippogriff', 'harry-potter-and-the-forbidden-journey',
  'jurassic-park-the-ride', 'jaws'];

test('ten attraction guides and their entry links exist in both languages', async () => {
  const japaneseHome = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const englishHome = await (await get('/en/')).text();
  const sitemap = await (await get('/sitemap.xml')).text();
  for (const slug of guideSlugs) {
    const jaPath = `/attraction/${slug}`;
    const enPath = `/en/attraction/${slug}`;
    const [ja, en] = await Promise.all([get(jaPath), get(enPath)]);
    assert.equal(ja.status, 200, jaPath);
    assert.equal(en.status, 200, enPath);
    const [japanese, english] = await Promise.all([ja.text(), en.text()]);
    assert.match(japanese, /data-series="past"/);
    assert.match(english, /data-series="past"/);
    assert.match(japaneseHome, new RegExp(`href="${jaPath}"`));
    assert.match(englishHome, new RegExp(`href="${enPath}"`));
    assert.match(sitemap, new RegExp(`${jaPath}<\\/loc>`));
    assert.match(sitemap, new RegExp(`${enPath}<\\/loc>`));
  }
  assert.match(japaneseHome, /\[12068, '\/attraction\/jaws'\]/);
  assert.match(japaneseHome, /\[12067, '\/attraction\/jurassic-park-the-ride'\]/);
});

test('English home includes server-rendered wait names before JavaScript runs', async () => {
  const response = await get('/en/');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Longest listed waits/);
  assert.match(html, /<a href="\/en\/attraction\/mario-kart-koopas-challenge">Mario Kart: Koopa&#39;s Challenge<\/a> <strong>95 min<\/strong>/);
  assert.match(html, /href="\/en\/attraction\/mario-kart-koopas-challenge"/);
});

test('stale values, unknown slugs and sitemap behave safely', async () => {
  values.set('rides_fetched_at', new Date(now - 3600000).toISOString());
  const stale = await (await get('/attraction/mario-kart-koopas-challenge')).text();
  assert.match(stale, /現在の待ち時間は確認できません/);
  assert.doesNotMatch(stale, /<p class="big">95分<\/p>/);
  values.set('rides_fetched_at', fetchedAt);
  values.set('rides_payload', JSON.stringify([{ ...ride, is_open: true, wait_time: null }]));
  const unknownWait = await (await get('/attraction/mario-kart-koopas-challenge')).text();
  assert.match(unknownWait, /通常待ち列の時間は確認できません/);
  values.set('rides_payload', JSON.stringify([ride]));
  assert.equal((await get('/attraction/unknown')).status, 404);
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.match(sitemap, /\/attraction\/mario-kart-koopas-challenge<\/loc>/);
  assert.match(sitemap, /\/en\/attraction\/mario-kart-koopas-challenge<\/loc>/);
});
