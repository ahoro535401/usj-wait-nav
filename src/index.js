const QUEUE_URL = 'https://queue-times.com/parks/284/queue_times.json';
const WIKI_LIVE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/live';
const WIKI_SCHEDULE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/schedule';
const OFFICIAL_SHOW_API = 'https://mobile-service.usj.co.jp/api/Web/ShowsAndAttractions';
const OFFICIAL_SCHEDULE_URL = 'https://www.usj.co.jp/web/ja/jp/park-guide/schedule/park-hour2';
const WEATHER_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=34.6654&lon=135.4334';
const WEATHER_AGENT = 'USJWaitNav/1.0 github.com/ahoro535401/usj-wait-nav';
const JMA_LATEST_URL = 'https://www.jma.go.jp/bosai/amedas/data/latest_time.txt';
const JMA_FORECAST_URL = 'https://www.jma.go.jp/bosai/forecast/data/forecast/270000.json';
const JMA_POINT_URL = 'https://www.jma.go.jp/bosai/amedas/data/point/62078';
const WEATHER_BACKFILL_DAYS = 8;
const ARCHIVE_START_DAY = '2026-10-05';
const WEATHER_CHECK_SECONDS = 15 * 60;
const HOLIDAY_CSV_URL = 'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';
const HOLIDAY_JSON_URL = 'https://holidays-jp.github.io/api/v1/date.json';
const HOLIDAY_FROM = '2025-01-01';
const HOLIDAY_REFRESH_MS = 7 * 86400 * 1000;
const HOLIDAY_RETRY_MS = 6 * 3600 * 1000;
const PARK_ID = '47f61fac-7586-41ac-ae80-61c9257cf33e';
const DARK_ESTIMATE_SOURCE = 'Queue-Times:inferred-dark-2026-10-04';
const JST_OFFSET = 9 * 3600;
const SOURCE_MAX_AGE = 15 * 60;
const SNAPSHOT_SECONDS = 20 * 60;
const COLLECTION_LEAD_SECONDS = 2 * 3600;
const COLLECTION_TRAIL_SECONDS = 30 * 60;
const DISTINCT_RIDES = [
  { externalId: 'usj.usj.rides.jurassic_park_the_ride', id: 12067, name: 'Jurassic Park – The Ride™' },
  { externalId: 'usj.usj.rides.jurassic_park_the_ride_in_the_dark_2026', id: 15322, name: 'Jurassic Park - The Ride in the Dark' },
  { externalId: 'usj.usj.rides.jaws', id: 12068, name: 'JAWS' },
  { externalId: 'usj.usj.rides.jaws_discoveru_version_2026', id: 17894, name: 'JAWS: Red Alert' },
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
  'usj.usj.show.discover_u_time_2026': 'Discover U!!! タイム',
  'usj.usj.show.triwizard_spirit_rally': 'トライウィザード・スピリット・ラリー',
  'usj.usj.show.halloween_horror_nights_academy_15years_of_screams_2026': 'ハロウィーン・ホラー・ナイト・アカデミー ～絶叫の15年～',
};

const epoch = () => Math.floor(Date.now() / 1000);
const jstDay = seconds => new Date((seconds + JST_OFFSET) * 1000).toISOString().slice(0, 10);
const jstHour = seconds => Math.floor(((seconds + JST_OFFSET) % 86400) / 3600);
const jstMinute = seconds => Math.floor(((seconds + JST_OFFSET) % 3600) / 60);
const hhmm = seconds => new Date((seconds + JST_OFFSET) * 1000).toISOString().slice(11, 16);
const dayStart = seconds => Math.floor((seconds + JST_OFFSET) / 86400) * 86400 - JST_OFFSET;
const visibleSample = row => ![12067, 15322, 12068, 17894].includes(row.ride_id) ||
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
async function fallbackData(request, env) {
  if (typeof FALLBACK_DATA !== 'undefined') return FALLBACK_DATA;
  const url = new URL('/fallback.json', request.url);
  const response = await assetFetch(new Request(url), env);
  if (!response.ok) throw new Error('Fallback archive unavailable');
  return response.json();
}

function weatherPayload(raw) {
  const periods = (raw.properties?.timeseries || []).slice(0, 24).map(item => ({
    time: item.time,
    temperature: item.data?.instant?.details?.air_temperature ?? null,
    wind_speed: item.data?.instant?.details?.wind_speed ?? null,
    wind_gust: item.data?.instant?.details?.wind_speed_of_gust ?? null,
    precipitation: item.data?.next_1_hours?.details?.precipitation_amount ?? null,
    symbol: item.data?.next_1_hours?.summary?.symbol_code ?? null,
  }));
  if (!periods.length || !Number.isFinite(periods[0].temperature)) throw new Error('Weather data unavailable');
  return { periods, source: 'MET Norway / Norwegian Meteorological Institute',
    location: '大阪市此花区・USJ付近の予報地点', fetched_at: new Date().toISOString() };
}

async function getWeather(db) {
  const stored = await readMeta(db, 'weather_payload');
  const cached = stored ? JSON.parse(stored) : null;
  const needsGust = cached?.periods?.length && !Object.hasOwn(cached.periods[0], 'wind_gust');
  if (cached?.expires_at && Date.parse(cached.expires_at) > Date.now() && !needsGust) return cached;
  const headers = { Accept: 'application/json', 'User-Agent': WEATHER_AGENT };
  if (cached?.last_modified && !needsGust) headers['If-Modified-Since'] = cached.last_modified;
  try {
    const response = await fetch(WEATHER_URL, { headers });
    if (response.status !== 304 && !response.ok) throw new Error(`Weather HTTP ${response.status}`);
    const expires = Date.parse(response.headers.get('Expires') || '');
    const expiresAt = new Date(Number.isFinite(expires) && expires > Date.now()
      ? expires : Date.now() + 30 * 60 * 1000).toISOString();
    const data = response.status === 304 && cached ? { ...cached } : weatherPayload(await response.json());
    data.expires_at = expiresAt;
    data.last_modified = response.headers.get('Last-Modified') || cached?.last_modified || null;
    delete data.stale;
    await writeMeta(db, 'weather_payload', JSON.stringify(data));
    return data;
  } catch (error) {
    if (cached?.fetched_at && Date.now() - Date.parse(cached.fetched_at) < 3 * 3600 * 1000)
      return { ...cached, stale: true };
    throw error;
  }
}

async function getJmaWeather(db) {
  const stored = await readMeta(db, 'jma_weather_payload');
  const cached = stored ? JSON.parse(stored) : null;
  if (cached?.expires_at && Date.parse(cached.expires_at) > Date.now()) return cached;
  try {
    const [latestResponse, forecastResponse] = await Promise.all([
      fetch(JMA_LATEST_URL), fetch(JMA_FORECAST_URL),
    ]);
    if (!latestResponse.ok || !forecastResponse.ok) throw new Error('JMA fetch failed');
    const latest = (await latestResponse.text()).trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(latest)) throw new Error('JMA timestamp changed');
    const date = latest.slice(0, 10).replaceAll('-', '');
    const hour = Math.floor(Number(latest.slice(11, 13)) / 3) * 3;
    const pointUrl = `https://www.jma.go.jp/bosai/amedas/data/point/62078/${date}_${String(hour).padStart(2, '0')}.json`;
    const pointResponse = await fetch(pointUrl);
    if (!pointResponse.ok) throw new Error('JMA Osaka observation unavailable');
    const [points, forecast] = await Promise.all([pointResponse.json(), forecastResponse.json()]);
    const key = Object.keys(points).sort().at(-1);
    const point = points[key];
    const measured = value => Array.isArray(value) && value[1] === 0 && Number.isFinite(value[0]) ? value[0] : null;
    const observedAt = key ? `${key.slice(0,4)}-${key.slice(4,6)}-${key.slice(6,8)}T${key.slice(8,10)}:${key.slice(10,12)}:00+09:00` : null;
    const today = forecast?.[0];
    const area = today?.timeSeries?.[0]?.areas?.find(item => item.area?.code === '270000');
    const data = {
      location: '大阪府の予報・大阪観測所の実測',
      observed_at: observedAt,
      temperature: measured(point?.temp),
      wind_speed: measured(point?.wind),
      precipitation_1h: measured(point?.precipitation1h),
      forecast_text: area?.weathers?.[0] || null,
      forecast_reported_at: today?.reportDatetime || null,
      source_url: JMA_FORECAST_URL,
      observation_url: 'https://www.jma.go.jp/bosai/map.html#contents=amedas',
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
    if (!data.observed_at || !Number.isFinite(data.temperature)) throw new Error('JMA observation format changed');
    await writeMeta(db, 'jma_weather_payload', JSON.stringify(data));
    return data;
  } catch (error) {
    if (cached?.fetched_at && Date.now() - Date.parse(cached.fetched_at) < 60 * 60 * 1000)
      return { ...cached, stale: true };
    throw error;
  }
}

// 大阪観測所の10分値を日単位にまとめる。欠測項目を0として数えない。
async function summarizeJmaDay(day) {
  const ymd = day.replaceAll('-', '');
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  const files = await Promise.all(hours.map(async hour => {
    const response = await fetch(`${JMA_POINT_URL}/${ymd}_${String(hour).padStart(2, '0')}.json`);
    if (response.status === 404) return {};
    if (!response.ok) throw new Error(`JMA ${ymd}_${hour}: HTTP ${response.status}`);
    return response.json();
  }));
  const measured = value => Array.isArray(value) && value[1] === 0 && Number.isFinite(value[0]) ? value[0] : null;
  const records = Object.entries(Object.assign({}, ...files))
    .filter(([key]) => key.startsWith(ymd)).sort(([a], [b]) => a.localeCompare(b));
  let precipTotal = 0, precipDaytime = 0, sunMinutes = 0, complete = 0;
  const temps = [];
  for (const [key, point] of records) {
    const hour = Number(key.slice(8, 10));
    const temp = measured(point.temp);
    const rain = measured(point.precipitation10m);
    const sun = measured(point.sun10m);
    if (temp != null) temps.push(temp);
    if (rain != null) {
      precipTotal += rain;
      if (hour >= 8 && hour < 22) precipDaytime += rain;
    }
    if (sun != null) sunMinutes += sun;
    if (temp != null && rain != null && sun != null) complete++;
  }
  if (!records.length || !complete) throw new Error(`JMA ${day}: no complete observations`);
  const round1 = value => Math.round(value * 10) / 10;
  return { day, temp_max: temps.length ? Math.max(...temps) : null,
    temp_min: temps.length ? Math.min(...temps) : null,
    precip_total: round1(precipTotal), precip_daytime: round1(precipDaytime),
    sun_hours: round1(sunMinutes / 60), coverage: round1(complete / 144) };
}

async function recordWeatherDays(db, seconds) {
  if (jstHour(seconds) < 1) return;
  const checked = Number(await readMeta(db, 'weather_checked_at'));
  if (checked > 0 && seconds - checked < WEATHER_CHECK_SECONDS) return;
  await writeMeta(db, 'weather_checked_at', String(seconds));
  const candidates = Array.from({ length: WEATHER_BACKFILL_DAYS }, (_, index) => jstDay(seconds - (index + 1) * 86400))
    .filter(day => day >= ARCHIVE_START_DAY);
  if (!candidates.length) return;
  const { results } = await db.prepare(
    `SELECT day, coverage FROM weather_days WHERE day IN (${candidates.map(() => '?').join(',')})`
  ).bind(...candidates).all();
  const saved = new Map(results.map(row => [row.day, row.coverage]));
  const target = candidates.find((day, index) => !saved.has(day) || index < 2 && saved.get(day) < 0.9);
  if (!target) return;
  const weather = await summarizeJmaDay(target);
  await db.prepare('INSERT OR REPLACE INTO weather_days ' +
    '(day,temp_max,temp_min,precip_total,precip_daytime,sun_hours,coverage,updated_at) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(weather.day, weather.temp_max, weather.temp_min, weather.precip_total,
    weather.precip_daytime, weather.sun_hours, weather.coverage, seconds).run();
}

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
  return { day, shows, fetched_at: fetchedAt, unavailable: false, source: 'ThemeParks.wiki' };
}

const officialShowUrl = day => {
  const [year, month, date] = day.split('-');
  return `https://www.usj.co.jp/web/ja/jp/attractions/show-and-attraction-schedule?date=${encodeURIComponent(`${month}/${date}/${year}`)}`;
};

function parseOfficialShows(raw, day, fetchedAt) {
  if (raw?.ScheduleDate?.slice(0, 10) !== day || !Array.isArray(raw?.ShowInformation?.Details))
    throw new Error('公式ショー日程の形式が変わりました');
  const shows = [];
  for (const item of raw.ShowInformation.Details) {
    const id = String(item.ContentId || '').replace(/^com\.usj\.park\./, 'usj.usj.');
    const name = SHOW_NAMES[id] || (String(item.AttractionName || '').includes('�') ? '' : item.AttractionName);
    if (!name) continue;
    const times = [...new Set(item.OpenTime || [])]
      .filter(start => Number.isFinite(Date.parse(start)) && jstDay(Date.parse(start) / 1000) === day)
      .sort().map(start => ({ start: new Date(start).toISOString(), end: null }));
    if (times.length) shows.push({ name, times, source_updated_at: raw.ShowInformation.UpdateTime || null });
  }
  shows.sort((a, b) => a.times[0].start.localeCompare(b.times[0].start) || a.name.localeCompare(b.name));
  return { day, shows, fetched_at: fetchedAt, source: 'USJ公式', unavailable: false,
    official_url: officialShowUrl(day) };
}

async function refreshOfficialShows(env, seconds) {
  if (!env.OFFICIAL_API_TOKEN) return;
  const db = env.DB;
  const today = jstDay(seconds);
  for (let offset = 0; offset < 7; offset++) {
    const day = jstDay(seconds + offset * 86400);
    const key = `official_shows_${day}`;
    let previous = null;
    try { previous = JSON.parse(await readMeta(db, key)); } catch (_) { /* 初回取得 */ }
    const checkedAt = previous?.checked_at || previous?.fetched_at;
    if (checkedAt && Date.now() - Date.parse(checkedAt) < 6 * 3600 * 1000) continue;
    const [year, month, date] = day.split('-');
    const url = `${OFFICIAL_SHOW_API}?city=USJ&date=${encodeURIComponent(`${month}/${date}/${year}`)}`;
    const fetchedAt = new Date().toISOString();
    try {
      const headers = { 'Accept-Language': 'ja-JP', Accept: 'application/json',
        'X-UNIWebService-ApiKey': 'USJWeb', 'X-UNIWebService-Token': env.OFFICIAL_API_TOKEN };
      const response = await fetch(url, { headers });
      if (response.status === 404) {
        await writeMeta(db, key, JSON.stringify({ day, shows: [], unavailable: true,
          reason: 'unpublished', fetched_at: fetchedAt, official_url: officialShowUrl(day) }));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = parseOfficialShows(await response.json(), day, fetchedAt);
      parsed.checked_at = fetchedAt;
      await writeMeta(db, key, JSON.stringify(parsed));
    } catch (error) {
      if (!previous?.shows?.length) await writeMeta(db, key, JSON.stringify({ day, shows: [],
        unavailable: true, reason: 'source_error', fetched_at: fetchedAt, official_url: officialShowUrl(day) }));
      else await writeMeta(db, key, JSON.stringify({ ...previous, checked_at: fetchedAt }));
    }
  }
  // 過去日のキャッシュを削除し、保存量を7日分に抑える。
  await db.prepare("DELETE FROM app_meta WHERE key LIKE 'official_shows_%' AND key < ?")
    .bind(`official_shows_${today}`).run();
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
  for (const definition of DISTINCT_RIDES) {
    const ride = byId.get(definition.id) || { id: definition.id, name: definition.name };
    if (!byId.has(definition.id)) rides.push(ride);
    ride.name = definition.name;
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
    await writeMeta(env.DB, 'shows_error', '');
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
    const opening = Date.parse(`${day}T${row.opens}:00+09:00`) / 1000;
    const eightOClock = Date.parse(`${day}T08:00:00+09:00`) / 1000;
    const start = Math.min(opening - COLLECTION_LEAD_SECONDS, eightOClock);
    let end = Date.parse(`${day}T${row.closes}:00+09:00`) / 1000;
    if (end <= opening) end += 86400;
    return seconds >= start && seconds <= end + COLLECTION_TRAIL_SECONDS;
  }
  return jstHour(seconds) >= 6;
}

function holidayKind(day, name, names) {
  if (/振替/.test(name)) return 'substitute';
  if (name === '国民の休日') return 'citizens';
  if (name !== '休日') return 'national';
  const date = new Date(`${day}T00:00:00Z`);
  for (;;) {
    date.setUTCDate(date.getUTCDate() - 1);
    const previous = date.toISOString().slice(0, 10);
    if (!names.has(previous)) return 'citizens';
    if (date.getUTCDay() === 0 && names.get(previous) !== '休日') return 'substitute';
  }
}

async function fetchHolidays() {
  try {
    const response = await fetch(HOLIDAY_CSV_URL, { headers: { 'User-Agent': WEATHER_AGENT } });
    if (!response.ok) throw new Error(`Holiday CSV HTTP ${response.status}`);
    const text = new TextDecoder('shift_jis').decode(await response.arrayBuffer());
    if (!text.includes('国民の祝日')) throw new Error('Holiday CSV decode failed');
    const map = new Map();
    for (const line of text.split(/\r?\n/).slice(1)) {
      const match = line.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2}),(.+)$/);
      if (match) map.set(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`, match[4].trim());
    }
    return { map, source: 'cao' };
  } catch (error) {
    console.warn('Holiday CSV unavailable; trying JSON mirror', error);
    const data = await fetchJson(HOLIDAY_JSON_URL);
    return { map: new Map(Object.entries(data)), source: 'holidays-jp' };
  }
}

async function refreshHolidays(db) {
  const { map, source } = await fetchHolidays();
  const rows = [...map].filter(([day]) => day >= HOLIDAY_FROM).sort(([a], [b]) => a.localeCompare(b));
  const thisYear = jstDay(epoch()).slice(0, 4);
  if (rows.filter(([day]) => day.startsWith(thisYear)).length < 15)
    throw new Error('Holiday data looks incomplete');
  const names = new Map(rows);
  const now = epoch();
  const insert = db.prepare('INSERT INTO holidays (day,name,kind,source,updated_at) VALUES (?,?,?,?,?)');
  await db.batch([
    db.prepare('DELETE FROM holidays WHERE day >= ?').bind(HOLIDAY_FROM),
    ...rows.map(([day, name]) => insert.bind(day, name, holidayKind(day, name, names), source, now)),
  ]);
  return { count: rows.length, source };
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
  try {
    await refreshOfficialShows(env, seconds);
  } catch (error) {
    console.error('Official show schedule refresh failed', error);
  }
  try {
    await recordWeatherDays(env.DB, seconds);
  } catch (error) {
    console.error('JMA weather archive failed', error);
  }
  const holidaysTriedAt = Date.parse(await readMeta(env.DB, 'holidays_tried_at'));
  if (!Number.isFinite(holidaysTriedAt) || Date.now() - holidaysTriedAt > HOLIDAY_REFRESH_MS) {
    await writeMeta(env.DB, 'holidays_tried_at', new Date().toISOString());
    try {
      const result = await refreshHolidays(env.DB);
      await writeMeta(env.DB, 'holidays_fetched_at', new Date().toISOString());
      await writeMeta(env.DB, 'holidays_error', '');
      console.log(`Holidays saved: ${result.count} (${result.source})`);
    } catch (error) {
      console.error('Holiday refresh failed', error);
      await writeMeta(env.DB, 'holidays_error', String(error));
      await writeMeta(env.DB, 'holidays_tried_at',
        new Date(Date.now() - HOLIDAY_REFRESH_MS + HOLIDAY_RETRY_MS).toISOString());
    }
  }
  if (!(await inCollectionWindow(env.DB, seconds))) {
    // ショー時刻は開園前にも必要。今日のデータが揃うまで5分間隔で確認する。
    const saved = await readMeta(env.DB, 'shows_payload');
    let current = null;
    try { current = saved && JSON.parse(saved); } catch (_) { /* 再取得する */ }
    if (current?.day !== jstDay(seconds) || !current.shows?.length) {
      try {
        const raw = await fetchJson(WIKI_LIVE_URL);
        const parsed = parseShows(raw, new Date().toISOString());
        if (parsed.shows.length) {
          await writeMeta(env.DB, 'shows_payload', JSON.stringify(parsed));
          await writeMeta(env.DB, 'shows_error', '');
        }
      } catch (error) {
        await writeMeta(env.DB, 'shows_error', String(error));
      }
    }
    return;
  }
  if (retry) {
    const slot = Math.floor(seconds / SNAPSHOT_SECONDS);
    if (await env.DB.prepare('SELECT slot FROM snapshots WHERE slot=?').bind(slot).first()) return;
  }
  const save = minute % 20 === 0 || retry;
  const collected = await refreshLive(env, seconds, save);
  if (save && !collected) throw new Error('定時の待ち時間取得に失敗しました');
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
    'LEFT JOIN ride_samples s USING(slot) WHERE h.slot>=? AND h.slot<? ' +
    'ORDER BY h.slot DESC,s.ride_id'
  ).bind(start / SNAPSHOT_SECONDS, (start + 86400) / SNAPSHOT_SECONDS).all();
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
    "SELECT date(h.captured_at + 32400, 'unixepoch') AS day, COUNT(*) AS snapshots, " +
    'MIN(h.captured_at) AS first_at, MAX(h.captured_at) AS last_at, ' +
    'w.temp_max,w.temp_min,w.precip_total,w.precip_daytime,w.sun_hours,w.coverage ' +
    'FROM snapshots h LEFT JOIN weather_days w ON w.day=date(h.captured_at + 32400, \'unixepoch\') ' +
    "WHERE h.captured_at < ? GROUP BY date(h.captured_at + 32400, 'unixepoch') ORDER BY day DESC"
  ).bind(dayStart(seconds)).all();
  return { days: results.map(({temp_max, temp_min, precip_total, precip_daytime, sun_hours, coverage, ...row}) => ({
    ...row, weather: coverage > 0 ? {day: row.day, temp_max, temp_min, precip_total, precip_daytime, sun_hours, coverage} : null,
  })) };
}

async function archiveDay(db, day) {
  const start = Date.parse(`${day}T00:00:00+09:00`) / 1000;
  const { results } = await db.prepare(
    'SELECT h.slot,h.captured_at,s.ride_id,s.wait_minutes,s.is_open,s.source ' +
    'FROM snapshots h LEFT JOIN ride_samples s USING(slot) ' +
    'WHERE h.slot>=? AND h.slot<? ORDER BY h.slot,s.ride_id'
  ).bind(start / SNAPSHOT_SECONDS, (start + 86400) / SNAPSHOT_SECONDS).all();
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
  if (url.pathname === '/' || url.pathname === '/plan') {
    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/index.html';
    const asset = await assetFetch(new Request(indexUrl, request), env);
    let html = await asset.text();
    let payload = null;
    let fetchedAt = null;
    try {
      [payload, fetchedAt] = await Promise.all([
        readMeta(env.DB, 'rides_payload'), readMeta(env.DB, 'rides_fetched_at'),
      ]);
    } catch (error) {
      console.warn('Summary database read failed', error);
    }
    let summary = '<p class="muted">最新の待ち時間と保存済み履歴は、このページの表で確認できます。</p>';
    if (payload && fetchedAt && Date.now() - Date.parse(fetchedAt) <= 15 * 60 * 1000) {
      const rides = JSON.parse(payload);
      const now = Date.now();
      const confirmed = rides.filter(ride => {
        const updated = Date.parse(ride.verified_at || ride.last_updated);
        const age = now - updated;
        return !ride.data_unavailable && Number.isFinite(updated) && age <= 15 * 60 * 1000 && age >= -2 * 60 * 1000 &&
          (!ride.is_open || Number.isInteger(ride.wait_time));
      });
      const open = confirmed.filter(ride => ride.is_open && Number.isInteger(ride.wait_time));
      const unknown = rides.length - confirmed.length;
      const closed = confirmed.length - open.length;
      const max = open.length ? Math.max(...open.map(ride => ride.wait_time)) : null;
      const time = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' })
        .format(new Date(fetchedAt));
      summary = `<p class="muted">${time} JST取得：待ち時間を確認できるアトラクション${open.length}件` +
        `${unknown ? `、現在値を確認できない${unknown}件` : ''}${closed ? `、休止中${closed}件` : ''}` +
        `${max == null ? '' : `。掲載値の最長${max}分`}。アトラクションごとの掲載値はこのページの表で確認できます。</p>`;
    }
    // 営業時間外は、件数ではなく現在の状態を静的HTMLにも示す。
    let todayRow = null;
    try {
      todayRow = await env.DB.prepare('SELECT opens,closes,status FROM park_days WHERE day=?')
        .bind(jstDay(epoch())).first();
    } catch (error) {
      const fallback = await fallbackData(request, env);
      todayRow = fallback.schedule.days.find(item => item.day === jstDay(epoch())) || null;
    }
    const nowHm = hhmm(epoch());
    if (todayRow?.status === 'CLOSED') {
      summary = '<p class="muted">本日は休園日です。過去の混雑は「行く前に」ページで確認できます。</p>';
    } else if (todayRow?.opens && todayRow?.closes && (nowHm < todayRow.opens || nowHm > todayRow.closes)) {
      summary = `<p class="muted">現在は営業時間外です（本日 ${todayRow.opens}〜${todayRow.closes}）。` +
        '待ち時間は開園の約2時間前から表示します。過去の混雑は「行く前に」ページで確認できます。</p>';
    }
    html = html.replace('<!--PUBLIC_SUMMARY-->', summary);
    const page = url.pathname === '/plan' ? 'plan' : 'now';
    html = html.replace('<html lang="ja">', `<html lang="ja" data-page="${page}">`);
    html = html.replace(
      page === 'plan' ? /<h1 data-only="now">[\s\S]*?<\/h1>\s*/ : /<h1 data-only="plan">[\s\S]*?<\/h1>\s*/,
      '');
    if (page === 'plan') {
      html = html
        .replace(/<title>[^<]*<\/title>/,
          '<title>USJ混雑カレンダー｜過去の待ち時間実績と天気｜USJ待ち時間ナビ</title>')
        .replace(/<meta name="description" content="[^"]*">/,
          '<meta name="description" content="USJの過去の待ち時間実績をカレンダーで確認。日別・アトラクション別の待ち時間、気象庁の天気実績、営業時間、ショー開始時刻、イベント情報をまとめた個人運営の非公式サイトです。">')
        .replace(/(<link rel="canonical" href="[^"]*)\/"/, '$1/plan"')
        .replace(/(<meta property="og:url" content="[^"]*)\/"/, '$1/plan"')
        .replace(/<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="USJ混雑カレンダー｜過去の待ち時間実績と天気｜USJ待ち時間ナビ">')
        .replace(/<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="USJの過去の待ち時間実績をカレンダーで確認。日別・アトラクション別の待ち時間、気象庁の天気実績、営業時間、ショー開始時刻、イベント情報をまとめた個人運営の非公式サイトです。">');
    }
    return new Response(html, { status: asset.status, headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    } });
  }
  if (url.pathname === '/privacy') {
    url.pathname = '/privacy.html';
    return assetFetch(new Request(url, request), env);
  }
  if (url.pathname === '/sitemap.xml') return embeddedFetch(request);
  if (url.pathname === '/api/events' || url.pathname === '/api/closures' || url.pathname === '/api/pass-exclusions') {
    url.pathname = url.pathname === '/api/events' ? '/events.json'
      : url.pathname === '/api/closures' ? '/closures.json' : '/pass-exclusions.json';
    return assetFetch(new Request(url, request), env);
  }
  if (url.pathname === '/api/weather') {
    const [local, jma] = await Promise.allSettled([getWeather(env.DB), getJmaWeather(env.DB)]);
    if (local.status === 'rejected' && jma.status === 'rejected')
      return json({ error: '天気情報を取得できません' }, 502);
    return json({ ...(local.status === 'fulfilled' ? local.value : { periods: [], unavailable: true }),
      jma: jma.status === 'fulfilled' ? jma.value : null });
  }
  if (url.pathname === '/api/holidays') {
    const { results } = await env.DB.prepare('SELECT day,name,kind,source FROM holidays ORDER BY day').all();
    if (!results.length) return json({ days: [], pending: true }, 503);
    return json({ days: results, fetched_at: await readMeta(env.DB, 'holidays_fetched_at'),
      error: await readMeta(env.DB, 'holidays_error'),
      source: results[0].source === 'cao' ? '内閣府「国民の祝日」' : 'holidays-jp（予備）' });
  }
  if (url.pathname === '/api/schedule') {
    const { results } = await env.DB.prepare('SELECT day,opens,closes,status FROM park_days ORDER BY day').all();
    return json({ days: results, fetched_at: await readMeta(env.DB, 'schedule_fetched_at'),
      error: await readMeta(env.DB, 'schedule_error'), source: 'ThemeParks.wiki', official_url: OFFICIAL_SCHEDULE_URL });
  }
  if (url.pathname === '/api/shows') {
    const day = url.searchParams.get('date') || jstDay(epoch());
    const today = jstDay(epoch());
    const start = Date.parse(`${day}T00:00:00+09:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(start) ||
        jstDay(start / 1000) !== day || day < today ||
        day > jstDay(epoch() + 6 * 86400)) return json({ error: '今日から7日間の日付を指定してください' }, 400);
    const official = await readMeta(env.DB, `official_shows_${day}`);
    if (day !== today) return json(official && env.OFFICIAL_API_TOKEN ? JSON.parse(official) : {
      day, shows: [], unavailable: true, reason: 'external', official_url: officialShowUrl(day) });
    const payload = await readMeta(env.DB, 'shows_payload');
    const parsed = payload ? JSON.parse(payload) : null;
    if (parsed?.day === today && parsed.shows?.length) return json(parsed);
    if (official && env.OFFICIAL_API_TOKEN) return json(JSON.parse(official));
    return json({ day, shows: [], unavailable: true, reason: 'pending', official_url: officialShowUrl(day) });
  }
  if (url.pathname === '/api/today') return json(await todayMatrix(env.DB, epoch()));
  if (url.pathname === '/api/archive/days') return json(await archiveDates(env.DB, epoch()));
  if (url.pathname === '/api/archive/day') {
    const day = url.searchParams.get('date') || '';
    const start = Date.parse(`${day}T00:00:00+09:00`) / 1000;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(start) ||
        jstDay(start) !== day || day >= jstDay(epoch())) return json({ error: '過去の日付を指定してください' }, 400);
    const data = await archiveDay(env.DB, day);
    if (data) data.weather = await env.DB.prepare(
      'SELECT day,temp_max,temp_min,precip_total,precip_daytime,sun_hours,coverage FROM weather_days WHERE day=? AND coverage>0'
    ).bind(day).first();
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
    const [fetchedAt, refreshError] = await Promise.all([
      readMeta(env.DB, 'rides_fetched_at'), readMeta(env.DB, 'rides_error'),
    ]);
    return json({ rides, fetched_at: fetchedAt, refresh_error: refreshError || null,
      archive_error: null, history: null, comparisons: {} });
  }
  if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
  return assetFetch(request, env);
}

async function fallbackRoute(request, env) {
  const url = new URL(request.url);
  const day = url.searchParams.get('date') || jstDay(epoch());
  const fallback = await fallbackData(request, env);
  if (url.pathname === '/api/archive/days') return json({ ...fallback.archive_days, stale: true });
  if (url.pathname === '/api/archive/day') {
    const data = fallback.archive_by_day[day];
    return data ? json({ ...data, stale: true }) : json({ error: 'この日の記録はありません' }, 404);
  }
  if (url.pathname === '/api/holidays') return json({ days: [], stale: true });
  if (url.pathname === '/api/schedule') return json({ ...fallback.schedule, stale: true });
  if (url.pathname === '/api/today') return json({ day: jstDay(epoch()), snapshots: [], stale: true });
  if (url.pathname === '/api/shows') {
    if (day === jstDay(epoch())) {
      try {
        const raw = await fetchJson(WIKI_LIVE_URL);
        const parsed = parseShows(raw, new Date().toISOString());
        if (parsed.shows.length) return json(parsed);
      } catch (error) {
        console.warn('Show fallback fetch failed', error);
      }
    }
    return json({ day, shows: [], unavailable: true, reason: 'pending', official_url: officialShowUrl(day) });
  }
  if (url.pathname === '/api/waits') {
    try {
      const [queue, wiki] = await Promise.allSettled([fetchJson(QUEUE_URL), fetchJson(WIKI_LIVE_URL)]);
      if (queue.status === 'fulfilled') {
        const fetchedAt = new Date().toISOString();
        return json({ rides: parseRides(queue.value, wiki.status === 'fulfilled' ? wiki.value : null, fetchedAt),
          fetched_at: fetchedAt, refresh_error: null, archive_error: '保存データの読み取りが一時的に停止中',
          history: fallback.history, comparisons: {}, stale: false });
      }
    } catch (error) {
      console.warn('Wait fallback fetch failed', error);
    }
    return json({ rides: [], fetched_at: null, refresh_error: '待ち時間の取得を確認できません',
      archive_error: '保存データの読み取りが一時的に停止中', history: fallback.history,
      comparisons: {}, stale: true });
  }
  if (url.pathname === '/api/weather') {
    try {
      const response = await fetch(WEATHER_URL, { headers: { Accept: 'application/json', 'User-Agent': WEATHER_AGENT } });
      if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
      return json({ ...weatherPayload(await response.json()), jma: null });
    } catch (error) {
      return json({ periods: [], unavailable: true, jma: null }, 200);
    }
  }
  return json({ error: '一時的に読み込めません' }, 503);
}

const API_CACHE_SECONDS = new Map([
  ['/api/waits', 300], ['/api/today', 300], ['/api/weather', 600],
  ['/api/schedule', 1800], ['/api/holidays', 21600], ['/api/shows', 300], ['/api/archive/days', 1800],
  ['/api/archive/day', 86400],
]);

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;
    const ttl = request.method === 'GET' ? API_CACHE_SECONDS.get(pathname) : null;
    const cache = ttl && typeof caches !== 'undefined' ? caches.default : null;
    if (cache) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    let response;
    let usedFallback = false;
    try {
      response = await route(request, env);
    } catch (error) {
      console.error('Request failed', error);
      usedFallback = true;
      response = pathname.startsWith('/api/') ? await fallbackRoute(request, env) :
        json({ error: '表示データを読み込めません' }, 500);
    }
    if (cache && response.ok) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', `public, max-age=${usedFallback ? 120 : ttl}`);
      if (usedFallback) headers.set('X-Data-Fallback', '1');
      const cached = new Response(response.body, { status: response.status, headers });
      ctx?.waitUntil(cache.put(request, cached.clone()).catch(error => console.warn('Cache write failed', error)));
      return cached;
    }
    return response;
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(scheduled(event, env).catch(error => console.error('Scheduled collection failed', error)));
  },
};
