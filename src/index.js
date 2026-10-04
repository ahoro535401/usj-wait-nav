const QUEUE_URL = 'https://queue-times.com/parks/284/queue_times.json';
const WIKI_LIVE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/live';
const WIKI_SCHEDULE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/schedule';
const OFFICIAL_SCHEDULE_URL = 'https://www.usj.co.jp/web/ja/jp/park-guide/schedule/park-hour2';
const PARK_ID = '47f61fac-7586-41ac-ae80-61c9257cf33e';
const DARK_ESTIMATE_SOURCE = 'Queue-Times:inferred-dark-2026-10-04';
const JST_OFFSET = 9 * 3600;
const SOURCE_MAX_AGE = 15 * 60;
const SNAPSHOT_SECONDS = 20 * 60;
const JURASSIC = [
  { externalId: 'usj.usj.rides.jurassic_park_the_ride', id: 12067, name: 'Jurassic Park – The Ride™' },
  { externalId: 'usj.usj.rides.jurassic_park_the_ride_in_the_dark_2026', id: 15322, name: 'Jurassic Park - The Ride in the Dark' },
];
const SHOW_NAMES = {
  'usj.usj.shows.minions_belloween_greeting_2026': 'ミニオン・ベロウィーン・グリーティング',
  'usj.usj.shows.zombie_de_dance_2026': 'ゾンビ・デ・ダンス',
  'usj.usj.shows.the_ultimate_blues_bash_2026': 'アルティメット・ブルース・バッシュ ～音楽の色～',
  'usj.usj.show.peanuts_photo_opportunity': 'スヌーピー・フォト・オポチュニティ',
  'usj.usj.show.little_creatures_wonder_meet': 'ホグズミード・マジカル・クリーチャーズ・ミート',
  'usj.usj.show.street_zombies_2026': 'ストリート・ゾンビ',
  'usj.usj.show.waterworld': 'ウォーターワールド',
  'usj.usj.show.playback_zombie_de_dance_halloween_horror_nights_15th_anniversary': 'プレイバック・ゾンビ・デ・ダンス ～ハロウィーン・ホラー・ナイト 15周年～',
  'usj.usj.show.frog_choir': 'フロッグ・クワイア',
  'usj.usj.show.no_limit_parade_25th_anniversary_discover_u_2026': 'NO LIMIT! パレード ～Discover U!!! バージョン～',
  'usj.usj.show.universal_wonderland_lets_smile_together_2026': 'ユニバーサル・ワンダーランド ～レッツ・スマイル・トゥギャザー！～',
  'usj.usj.show.wicked_the_witches_of_oz_2026': 'ウィキッド ～オズの魔女たち～',
  'usj.usj.show.hippogriff_wonder_lesson_2023': 'ヒッポグリフ・マジカル・レッスン',
  'usj.usj.shows.universal_monster_live_rock_roll_show': 'ユニバーサル・モンスター・ライブ・ロックンロール・ショー',
  'usj.usj.shows.the_power_of_rock_u_rock_2026': 'パワー・オブ・ロック ～ユー・ロック！～',
  'usj.usj.show.jurassic_park_dinosaur_meet_greet_2026': 'ジュラシック・パーク・ダイナソー・ミート ＆ グリート',
  'usj.usj.shows.kuromi_live_discover_me_discover_u_2026': 'クロミ・ライブ ～ Discover Me Discover U!!! ～',
  'usj.usj.shows.onepiece_premier_show_2026': 'ワンピース・プレミアショー 2026',
  'usj.usj.shows.discover_u_time_2026': 'Discover U!!! タイム',
  'usj.usj.show.triwizard_spirit_rally': 'トライウィザード・スピリット・ラリー',
  'usj.usj.show.halloween_horror_nights_academy_15years_of_screams_2026': 'ハロウィーン・ホラー・ナイト・アカデミー ～絶叫の15年～',
};

const epoch = () => Math.floor(Date.now() / 1000);
const jstDay = seconds => new Date((seconds + JST_OFFSET) * 1000).toISOString().slice(0, 10);
const jstHour = seconds => Math.floor(((seconds + JST_OFFSET) % 86400) / 3600);
const jstMinute = seconds => Math.floor(((seconds + JST_OFFSET) % 3600) / 60);
const hhmm = seconds => new Date((seconds + JST_OFFSET) * 1000).toISOString().slice(11, 16);
const dayStart = seconds => Math.floor((seconds + JST_OFFSET) / 86400) * 86400 - JST_OFFSET;
const visibleSample = row => row.ride_id !== 12067 && row.ride_id !== 15322 ||
  row.source === 'ThemeParks.wiki' || row.ride_id === 15322 && row.source === DARK_ESTIMATE_SOURCE;
const json = (value, status = 200) => Response.json(value, {
  status,
  headers: { 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' },
});
const readMeta = async (db, key) => (await db.prepare('SELECT value FROM app_meta WHERE key = ?').bind(key).first())?.value ?? null;
const writeMeta = (db, key, value) => db.prepare(
  'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
).bind(key, value).run();
const assetFetch = (request, env) => env.ASSETS ? env.ASSETS.fetch(request) : embeddedFetch(request);

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'USJWaitNav/1.0' } });
  if (!response.ok) throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
  return response.json();
}

function parseShows(raw, fetchedAt) {
  const day = jstDay(Math.floor(Date.parse(fetchedAt) / 1000));
  const shows = [];
  for (const item of raw.liveData || []) {
    if (item.entityType !== 'SHOW' || item.status !== 'OPERATING') continue;
    const times = [];
    for (const slot of item.showtimes || []) {
      if (slot.type !== 'PERFORMANCE_TIME') continue;
      const start = Date.parse(slot.startTime);
      if (!Number.isFinite(start) || jstDay(Math.floor(start / 1000)) !== day) continue;
      const parsedEnd = slot.endTime ? Date.parse(slot.endTime) : NaN;
      const end = Number.isFinite(parsedEnd) && parsedEnd > start && jstDay(Math.floor(parsedEnd / 1000)) === day
        ? new Date(parsedEnd).toISOString() : null;
      times.push({ start: new Date(start).toISOString(), end });
    }
    const ordered = [...new Map(times.map(slot => [`${slot.start}|${slot.end}`, slot])).values()]
      .sort((a, b) => a.start.localeCompare(b.start));
    if (ordered.length) shows.push({
      name: SHOW_NAMES[item.externalId] || item.name,
      times: ordered,
      source_updated_at: item.lastUpdated || null,
    });
  }
  shows.sort((a, b) => a.times[0].start.localeCompare(b.times[0].start) || a.name.localeCompare(b.name));
  return { day, shows, fetched_at: fetchedAt, unavailable: false };
}

function parseRides(queueRaw, wikiRaw, fetchedAt) {
  const rides = [...(queueRaw.rides || []), ...(queueRaw.lands || []).flatMap(land => land.rides || [])]
    .map(item => ({
      id: Number(item.id), name: item.name, is_open: !!item.is_open,
      wait_time: item.is_open ? item.wait_time : null, last_updated: item.last_updated || null,
      source: 'Queue-Times',
    })).filter(item => Number.isInteger(item.id) && item.id > 0);
  if (!rides.length) throw new Error('待ち時間データが空です');
  const byId = new Map(rides.map(ride => [ride.id, ride]));
  const byExternal = new Map((wikiRaw?.liveData || []).map(item => [item.externalId, item]));
  for (const definition of JURASSIC) {
    const ride = byId.get(definition.id) || { id: definition.id, name: definition.name };
    if (!byId.has(definition.id)) rides.push(ride);
    ride.source = 'ThemeParks.wiki';
    ride.data_unavailable = true;
    ride.is_open = false;
    ride.wait_time = null;
    ride.verified_at = null;
    const item = byExternal.get(definition.externalId);
    if (!item) continue;
    if (item.status === 'CLOSED') {
      ride.is_open = false;
    } else if (item.status === 'OPERATING') {
      const wait = item.queue?.STANDBY?.waitTime;
      if (!Number.isInteger(wait) || wait < 0 || wait > 9999) continue;
      ride.is_open = true;
      ride.wait_time = wait;
    } else continue;
    ride.data_unavailable = false;
    ride.verified_at = fetchedAt;
    ride.last_updated = item.lastUpdated || null;
  }
  return rides;
}

function isRecent(ride, capturedAt) {
  if (ride.data_unavailable) return false;
  const stamp = ride.source === 'ThemeParks.wiki' ? ride.verified_at : ride.last_updated;
  const updated = Date.parse(stamp);
  if (!Number.isFinite(updated)) return false;
  const age = capturedAt - updated / 1000;
  return age >= -120 && age <= SOURCE_MAX_AGE;
}

async function refreshLive(env, capturedAt = epoch(), save = false) {
  let wikiRaw = null;
  try {
    wikiRaw = await fetchJson(WIKI_LIVE_URL);
    await writeMeta(env.DB, 'shows_payload', JSON.stringify(parseShows(wikiRaw, new Date().toISOString())));
  } catch (error) {
    await writeMeta(env.DB, 'shows_error', String(error));
  }
  try {
    const queueRaw = await fetchJson(QUEUE_URL);
    const fetchedAt = new Date().toISOString();
    const rides = parseRides(queueRaw, wikiRaw, fetchedAt);
    await env.DB.batch([
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_payload', JSON.stringify(rides)),
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_fetched_at', fetchedAt),
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_error', ''),
    ]);
    if (save) await saveSnapshot(env.DB, rides, capturedAt);
    return true;
  } catch (error) {
    await writeMeta(env.DB, 'rides_error', String(error));
    return false;
  }
}

async function saveSnapshot(db, rides, capturedAt) {
  const slot = Math.floor(capturedAt / SNAPSHOT_SECONDS);
  const recent = rides.filter(ride => isRecent(ride, capturedAt));
  if (!recent.length) return false;
  const existing = await db.prepare('SELECT slot FROM snapshots WHERE slot = ?').bind(slot).first();
  if (existing) return false;
  const statements = [db.prepare('INSERT OR IGNORE INTO snapshots (slot,captured_at) VALUES (?,?)').bind(slot, capturedAt)];
  for (const ride of recent) {
    const wait = ride.is_open ? Number(ride.wait_time) : null;
    if (ride.is_open && (!Number.isInteger(wait) || wait < 0 || wait > 9999)) continue;
    statements.push(db.prepare(
      'INSERT OR IGNORE INTO ride_samples (slot,ride_id,wait_minutes,is_open,source) VALUES (?,?,?,?,?)'
    ).bind(slot, ride.id, wait, ride.is_open ? 1 : 0, ride.source));
  }
  await db.batch(statements);
  return true;
}

async function refreshSchedule(db) {
  const raw = await fetchJson(WIKI_SCHEDULE_URL);
  if (raw.id !== PARK_ID || raw.timezone !== 'Asia/Tokyo') throw new Error('営業時間データの対象パークが異なります');
  const days = [];
  for (const item of raw.schedule || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date || '')) continue;
    if (item.type === 'CLOSED') {
      days.push({ day: item.date, opens: null, closes: null, status: 'CLOSED' });
    } else if (item.type === 'OPERATING') {
      const opening = Date.parse(item.openingTime);
      const closing = Date.parse(item.closingTime);
      if (!Number.isFinite(opening) || !Number.isFinite(closing) ||
          jstDay(Math.floor(opening / 1000)) !== item.date) continue;
      days.push({ day: item.date, opens: hhmm(Math.floor(opening / 1000)),
        closes: hhmm(Math.floor(closing / 1000)), status: 'OPERATING' });
    }
  }
  if (!days.length) throw new Error('営業時間データが空です');
  const statements = [db.prepare('DELETE FROM park_days')];
  for (const item of days) statements.push(db.prepare(
    'INSERT INTO park_days (day,opens,closes,status) VALUES (?,?,?,?)'
  ).bind(item.day, item.opens, item.closes, item.status));
  statements.push(db.prepare(
    'INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
  ).bind('schedule_fetched_at', new Date().toISOString()));
  await db.batch(statements);
}

async function inCollectionWindow(db, seconds) {
  const day = jstDay(seconds);
  const row = await db.prepare('SELECT opens,closes,status FROM park_days WHERE day=?').bind(day).first();
  if (row?.status === 'CLOSED') return false;
  if (row?.status === 'OPERATING' && row.opens && row.closes) {
    const start = Date.parse(`${day}T${row.opens}:00+09:00`) / 1000 - 30 * 60;
    let end = Date.parse(`${day}T${row.closes}:00+09:00`) / 1000;
    if (end <= start + 30 * 60) end += 86400;
    return seconds >= start && seconds <= end + 30 * 60;
  }
  return jstHour(seconds) >= 6;
}

async function scheduled(event, env) {
  const seconds = epoch();
  const minute = jstMinute(seconds);
  const retry = minute === 2 || minute === 22 || minute === 42;
  const scheduleFetchedAt = Date.parse(await readMeta(env.DB, 'schedule_fetched_at'));
  if (!Number.isFinite(scheduleFetchedAt) || Date.now() - scheduleFetchedAt > 6 * 3600 * 1000) {
    try {
      await refreshSchedule(env.DB);
      await writeMeta(env.DB, 'schedule_error', '');
    } catch (error) {
      await writeMeta(env.DB, 'schedule_error', String(error));
    }
  }
  if (!(await inCollectionWindow(env.DB, seconds))) return;
  if (retry) {
    const slot = Math.floor(seconds / SNAPSHOT_SECONDS);
    if (await env.DB.prepare('SELECT slot FROM snapshots WHERE slot=?').bind(slot).first()) return;
  }
  const save = minute % 20 === 0 || retry;
  await refreshLive(env, seconds, save);
}

async function historySummary(db) {
  const row = await db.prepare(
    'SELECT COUNT(*) AS snapshots,MIN(captured_at) AS first_at,MAX(captured_at) AS last_at FROM snapshots'
  ).first();
  return { ...row, bytes: null };
}

async function comparisons(db, seconds) {
  const slot = Math.floor(seconds / SNAPSHOT_SECONDS);
  const start = dayStart(seconds);
  const prior = await db.prepare('SELECT MAX(slot) AS slot FROM snapshots WHERE slot < ?').bind(slot).first();
  const out = {};
  if (prior?.slot != null) {
    const { results } = await db.prepare(
      'SELECT s.ride_id,s.wait_minutes,s.is_open,s.source,h.captured_at FROM ride_samples s JOIN snapshots h USING(slot) WHERE s.slot=?'
    ).bind(prior.slot).all();
    for (const row of results.filter(visibleSample)) out[row.ride_id] = {
      previous_wait: row.wait_minutes, previous_open: !!row.is_open,
      previous_at: row.captured_at, previous_estimated: row.source === DARK_ESTIMATE_SOURCE,
    };
  }
  const { results } = await db.prepare(
    'SELECT s.ride_id,s.wait_minutes,s.source,h.captured_at FROM ride_samples s JOIN snapshots h USING(slot) ' +
    'WHERE h.captured_at>=? AND h.captured_at<? AND s.is_open=1 AND s.wait_minutes IS NOT NULL'
  ).bind(start - 7 * 86400, start).all();
  const byRide = new Map();
  for (const row of results) {
    if (!visibleSample(row) || row.source === DARK_ESTIMATE_SOURCE || jstHour(row.captured_at) !== jstHour(seconds)) continue;
    const days = byRide.get(row.ride_id) || new Map();
    const day = jstDay(row.captured_at);
    days.set(day, [...(days.get(day) || []), row.wait_minutes]);
    byRide.set(row.ride_id, days);
  }
  for (const [rideId, days] of byRide) {
    const dailyMeans = [...days.values()].map(values => values.reduce((sum, x) => sum + x, 0) / values.length);
    out[rideId] ||= {};
    out[rideId].same_time_avg = Math.round(dailyMeans.reduce((sum, x) => sum + x, 0) / dailyMeans.length * 10) / 10;
    out[rideId].same_time_count = dailyMeans.length;
    out[rideId].same_time_samples = [...days.values()].reduce((sum, values) => sum + values.length, 0);
  }
  return out;
}

async function history(db, rideId, days) {
  const since = epoch() - days * 86400;
  const { results } = await db.prepare(
    'SELECT h.captured_at,s.wait_minutes,s.is_open,s.source,s.ride_id FROM ride_samples s JOIN snapshots h USING(slot) ' +
    'WHERE s.ride_id=? AND h.captured_at>=? ORDER BY s.slot LIMIT 2200'
  ).bind(rideId, since).all();
  const hours = new Map();
  for (const row of results.filter(visibleSample)) {
    const at = Math.floor((row.captured_at + JST_OFFSET) / 3600) * 3600 - JST_OFFSET;
    const item = hours.get(at) || { at, samples: 0, open_samples: 0, estimated_samples: 0, total_wait: 0 };
    item.samples++;
    if (row.is_open && row.wait_minutes != null) {
      item.open_samples++;
      item.total_wait += row.wait_minutes;
      if (row.source === DARK_ESTIMATE_SOURCE) item.estimated_samples++;
    }
    hours.set(at, item);
  }
  return { ride_id: rideId, days, hours: [...hours.values()].map(item => ({
    at: item.at, samples: item.samples, open_samples: item.open_samples,
    estimated_samples: item.estimated_samples,
    average_wait: item.open_samples ? Math.round(item.total_wait / item.open_samples * 10) / 10 : null,
  })) };
}

async function todayMatrix(db, seconds) {
  const start = dayStart(seconds);
  const { results } = await db.prepare(
    'SELECT h.slot,h.captured_at,s.ride_id,s.wait_minutes,s.is_open,s.source FROM snapshots h ' +
    'LEFT JOIN ride_samples s USING(slot) WHERE h.captured_at>=? AND h.captured_at<? ' +
    'ORDER BY h.slot DESC,s.ride_id'
  ).bind(start, start + 86400).all();
  const snapshots = [];
  for (const row of results) {
    if (!snapshots.length || snapshots.at(-1).slot !== row.slot) {
      snapshots.push({ slot: row.slot, captured_at: row.captured_at, rides: {} });
    }
    if (row.ride_id != null && visibleSample(row)) snapshots.at(-1).rides[String(row.ride_id)] = {
      wait_minutes: row.wait_minutes, is_open: !!row.is_open,
      estimated: row.source === DARK_ESTIMATE_SOURCE,
    };
  }
  return { day: jstDay(seconds), snapshots };
}

async function archiveDates(db, seconds) {
  const { results } = await db.prepare(
    "SELECT date(captured_at + 32400, 'unixepoch') AS day, COUNT(*) AS snapshots, " +
    'MIN(captured_at) AS first_at, MAX(captured_at) AS last_at FROM snapshots ' +
    'WHERE captured_at < ? GROUP BY day ORDER BY day DESC'
  ).bind(dayStart(seconds)).all();
  return { days: results };
}

async function archiveDay(db, day) {
  const start = Date.parse(`${day}T00:00:00+09:00`) / 1000;
  const { results } = await db.prepare(
    'SELECT h.slot,h.captured_at,s.ride_id,s.wait_minutes,s.is_open,s.source ' +
    'FROM snapshots h LEFT JOIN ride_samples s USING(slot) ' +
    'WHERE h.captured_at>=? AND h.captured_at<? ORDER BY h.slot,s.ride_id'
  ).bind(start, start + 86400).all();
  const slots = new Set();
  const hours = new Map();
  let totalWait = 0;
  let openSamples = 0;
  let firstAt = null;
  let lastAt = null;
  for (const row of results) {
    slots.add(row.slot);
    firstAt = firstAt == null ? row.captured_at : Math.min(firstAt, row.captured_at);
    lastAt = lastAt == null ? row.captured_at : Math.max(lastAt, row.captured_at);
    const at = Math.floor((row.captured_at + JST_OFFSET) / 3600) * 3600 - JST_OFFSET;
    const hour = hours.get(at) || { at, slots: new Set(), rides: new Map(), totalWait: 0, openSamples: 0, rideIds: new Set() };
    hour.slots.add(row.slot);
    hours.set(at, hour);
    if (row.ride_id == null || !visibleSample(row)) continue;
    const ride = hour.rides.get(row.ride_id) || {
      samples: 0, open_samples: 0, closed_samples: 0, estimated_samples: 0, total_wait: 0,
    };
    ride.samples++;
    if (row.is_open && Number.isInteger(row.wait_minutes)) {
      ride.open_samples++;
      ride.total_wait += row.wait_minutes;
      if (row.source === DARK_ESTIMATE_SOURCE) ride.estimated_samples++;
      else {
        hour.totalWait += row.wait_minutes;
        hour.openSamples++;
        hour.rideIds.add(row.ride_id);
        totalWait += row.wait_minutes;
        openSamples++;
      }
    } else if (!row.is_open) ride.closed_samples++;
    hour.rides.set(row.ride_id, ride);
  }
  if (!slots.size) return null;
  const mean = (total, count) => count ? Math.round(total / count * 10) / 10 : null;
  return {
    day, snapshots: slots.size, first_at: firstAt, last_at: lastAt,
    average_wait: mean(totalWait, openSamples), open_samples: openSamples,
    hours: [...hours.values()].map(hour => ({
      at: hour.at, snapshots: hour.slots.size,
      average_wait: mean(hour.totalWait, hour.openSamples),
      open_samples: hour.openSamples, ride_count: hour.rideIds.size,
      rides: Object.fromEntries([...hour.rides].map(([id, ride]) => [String(id), {
        samples: ride.samples, open_samples: ride.open_samples,
        closed_samples: ride.closed_samples, estimated_samples: ride.estimated_samples,
        average_wait: mean(ride.total_wait, ride.open_samples),
      }])),
    })),
  };
}

async function route(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  if (url.pathname === '/') {
    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/index.html';
    const asset = await assetFetch(new Request(indexUrl, request), env);
    let html = await asset.text();
    const payload = await readMeta(env.DB, 'rides_payload');
    const fetchedAt = await readMeta(env.DB, 'rides_fetched_at');
    let summary = '<p class="muted">最新の待ち時間と保存済み履歴は、この下の表で確認できます。</p>';
    if (payload && fetchedAt && Date.now() - Date.parse(fetchedAt) <= 15 * 60 * 1000) {
      const rides = JSON.parse(payload);
      const open = rides.filter(ride => ride.is_open && !ride.data_unavailable && Number.isInteger(ride.wait_time));
      const max = open.length ? Math.max(...open.map(ride => ride.wait_time)) : null;
      const time = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })
        .format(new Date(fetchedAt));
      summary = `<p class="muted">${time} JST確認：待ち時間を掲載中のアトラクション${open.length}件` +
        `${max == null ? '' : `、掲載値の最長${max}分`}。詳しい値は下の表をご覧ください。</p>`;
    }
    html = html.replace('<!--PUBLIC_SUMMARY-->', summary);
    return new Response(html, { status: asset.status, headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    } });
  }
  if (url.pathname === '/privacy') {
    url.pathname = '/privacy.html';
    return assetFetch(new Request(url, request), env);
  }
  if (url.pathname === '/api/events' || url.pathname === '/api/closures') {
    url.pathname = url.pathname === '/api/events' ? '/events.json' : '/closures.json';
    return assetFetch(new Request(url, request), env);
  }
  if (url.pathname === '/api/schedule') {
    const { results } = await env.DB.prepare('SELECT day,opens,closes,status FROM park_days ORDER BY day').all();
    return json({ days: results, fetched_at: await readMeta(env.DB, 'schedule_fetched_at'),
      error: await readMeta(env.DB, 'schedule_error'), source: 'ThemeParks.wiki', official_url: OFFICIAL_SCHEDULE_URL });
  }
  if (url.pathname === '/api/shows') {
    const payload = await readMeta(env.DB, 'shows_payload');
    if (!payload) return json({ day: jstDay(epoch()), shows: [], unavailable: true }, 503);
    const parsed = JSON.parse(payload);
    if (parsed.day !== jstDay(epoch())) return json({ day: jstDay(epoch()), shows: [], unavailable: true });
    return json(parsed);
  }
  if (url.pathname === '/api/today') return json(await todayMatrix(env.DB, epoch()));
  if (url.pathname === '/api/archive/days') return json(await archiveDates(env.DB, epoch()));
  if (url.pathname === '/api/archive/day') {
    const day = url.searchParams.get('date') || '';
    const start = Date.parse(`${day}T00:00:00+09:00`) / 1000;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(start) ||
        jstDay(start) !== day || day >= jstDay(epoch())) return json({ error: '過去の日付を指定してください' }, 400);
    const data = await archiveDay(env.DB, day);
    return data ? json(data) : json({ error: 'この日の記録はありません' }, 404);
  }
  if (url.pathname === '/api/history') {
    const rideId = Number(url.searchParams.get('ride_id'));
    const days = Number(url.searchParams.get('days') || 1);
    if (!Number.isInteger(rideId) || rideId <= 0 || ![1, 7, 30].includes(days))
      return json({ error: 'ride_idとdaysの指定が不正です' }, 400);
    return json(await history(env.DB, rideId, days));
  }
  if (url.pathname === '/api/waits') {
    const payload = await readMeta(env.DB, 'rides_payload');
    if (!payload) return json({ error: '最初の定時取得を待っています' }, 503);
    const rides = JSON.parse(payload);
    const [fetchedAt, refreshError, stats, prior] = await Promise.all([
      readMeta(env.DB, 'rides_fetched_at'), readMeta(env.DB, 'rides_error'),
      historySummary(env.DB), comparisons(env.DB, epoch()),
    ]);
    return json({ rides, fetched_at: fetchedAt, refresh_error: refreshError || null,
      archive_error: null, history: stats, comparisons: prior });
  }
  if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
  return assetFetch(request, env);
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      console.error('Request failed', error);
      return json({ error: '表示データを読み込めません' }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(scheduled(event, env).catch(error => {
      console.error('Scheduled collection failed', error);
    }));
  },
};
