const QUEUE_URL = 'https://queue-times.com/parks/284/queue_times.json';
const WIKI_LIVE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/live';
const WIKI_SCHEDULE_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/schedule';
const WIKI_MAP_URL = 'https://api.themeparks.wiki/v1/entity/47f61fac-7586-41ac-ae80-61c9257cf33e/children';
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
const POLL_ANALYTICS_URL = 'https://docs.google.com/forms/d/15RgNtu9O4eMpfgPXoXkdi6csUVwMcVHcEpYANl0ty00/viewanalytics';
const POLL_QUESTION_ID = 893336371;
const HOLIDAY_FROM = '2025-01-01';
const HOLIDAY_REFRESH_MS = 7 * 86400 * 1000;
const HOLIDAY_RETRY_MS = 6 * 3600 * 1000;
const PARK_ID = '47f61fac-7586-41ac-ae80-61c9257cf33e';
const DARK_ESTIMATE_SOURCE = 'Queue-Times:inferred-dark-2026-10-04';
const JST_OFFSET = 9 * 3600;
const SOURCE_MAX_AGE = 15 * 60;
const X_POST_TIMES = ['09:30', '12:00', '15:00', '17:00', '19:00'];
const X_EVENING_FIRST_DAY = '2026-10-09';
const X_EVENING_LAST_DAY = '2026-11-03';
const X_DAILY_POST_TIME = '22:30';
const X_POST_WINDOW_SECONDS = 15 * 60;
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
  'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value WHERE value <> excluded.value'
).bind(key, value).run();
const assetFetch = (request, env) => env.ASSETS ? env.ASSETS.fetch(request) : embeddedFetch(request);

// 同じ枠を再送しない。投稿が失敗した場合も自動再試行せず、記録を見て判断する。
function dueXPost(seconds) {
  const now = jstHour(seconds) * 3600 + jstMinute(seconds) * 60 + seconds % 60;
  return X_POST_TIMES.find(time => {
    if (time === '19:00' &&
        (jstDay(seconds) < X_EVENING_FIRST_DAY || jstDay(seconds) > X_EVENING_LAST_DAY)) return false;
    const [hour, minute] = time.split(':').map(Number);
    const start = hour * 3600 + minute * 60;
    return now >= start && now < start + X_POST_WINDOW_SECONDS;
  }) || null;
}

function dueDailyXPost(seconds) {
  const day = jstDay(seconds);
  if (day < X_EVENING_FIRST_DAY || day > X_EVENING_LAST_DAY) return false;
  const [hour, minute] = X_DAILY_POST_TIME.split(':').map(Number);
  const now = jstHour(seconds) * 3600 + jstMinute(seconds) * 60 + seconds % 60;
  const start = hour * 3600 + minute * 60;
  return now >= start && now < start + X_POST_WINDOW_SECONDS;
}

function xWeightedLength(value) {
  const url = 'https://uniba-waittimes.com/';
  const withoutUrl = value.replace(url, '');
  return [...withoutUrl].reduce((total, character) => total +
    (character.codePointAt(0) > 0x2ff ? 2 : 1), 23);
}

function xWaitPost(rides, names, fetchedAt) {
  const captured = Date.parse(fetchedAt) / 1000;
  const ranked = rides.filter(ride => ride.is_open && !ride.data_unavailable &&
    Number.isInteger(ride.wait_time) && ride.wait_time >= 0 && isRecent(ride, captured))
    .sort((a, b) => b.wait_time - a.wait_time || a.id - b.id);
  if (ranked.length < 5) return null;
  const date = `${Number(jstDay(captured).slice(5, 7))}/${Number(jstDay(captured).slice(8, 10))}`;
  const header = `【USJ待ち時間｜${date} ${hhmm(captured)}】非公式\n長い順・上位5施設`;
  const footer = '\n全施設はこちら↓\nhttps://uniba-waittimes.com/\n#USJ #ユニバ';
  const aliases = new Map([
    [12066, 'ミニオン・ライド'], [13005, 'コナン4-D'],
    [12073, 'ヒッポグリフ'], [12072, 'ミニオン・アイス'],
    [12065, 'フォービドゥン・ジャーニー'], [7065, 'キティ・カップケーキ'],
    [7063, 'キティ・リボン'], [7077, 'ハリドリ'],
    [12070, 'ハリドリ・バックドロップ'], [14918, 'ミニオン・ミッション'],
    [12068, 'ジョーズ通常'], [17894, 'ジョーズ夜'],
    [12067, 'ジュラシック通常'], [12061, 'マリオカート'],
    [14402, 'ドンキーコング'], [12197, 'オリバンダー'],
    [12091, 'おさるのジョージ'], [12324, '貞子の呪い'],
    [12083, 'セサミ4-D'], [12084, 'シュレック4-D'],
    [7214, 'シング'], [14919, 'スヌーピー・フライング'],
    [12082, 'スペース・ファンタジー'], [7092, 'フライング・ダイナソー'],
    [12075, 'フライング・スヌーピー'], [12071, 'ヨッシー'],
    [13925, 'チェンソーマン4-D'], [17893, 'ファクトリー・オブ・フィアー'],
    [15322, 'ジュラシック夜'],
  ]);
  for (const maxName of [Infinity, 13, 10, 8]) {
    const lines = ranked.slice(0, 5).map((ride, index) => {
      let name = (aliases.get(ride.id) || names.get(ride.id) || ride.name || '').replace(/™/g, '').trim();
      if ([...name].length > maxName) name = [...name].slice(0, maxName).join('') + '…';
      return `${index + 1}. ${name} ${ride.wait_time}分`;
    });
    const post = `${header}\n${lines.join('\n')}${footer}`;
    if (xWeightedLength(post) <= 250) return post;
  }
  return null;
}

async function maybePostX(env, seconds) {
  if (env.X_AUTOPOST_ENABLED !== 'true' || !env.BUFFER_API_KEY || !env.BUFFER_X_CHANNEL_ID) return;
  const slot = dueXPost(seconds);
  if (!slot) return;
  const [raw, fetchedAt] = await Promise.all([
    readMeta(env.DB, 'rides_payload'), readMeta(env.DB, 'rides_fetched_at'),
  ]);
  const captured = Date.parse(fetchedAt) / 1000;
  if (!raw || !Number.isFinite(captured) || seconds - captured < -120 || seconds - captured > 10 * 60) return;
  let rides;
  try { rides = JSON.parse(raw); } catch (_) { return; }
  if (!Array.isArray(rides)) return;
  const response = await assetFetch(new Request('https://uniba-waittimes.com/index.html'), env);
  if (!response.ok) throw new Error('Japanese ride names unavailable');
  const post = xWaitPost(rides, rideJapaneseNames(await response.text()), fetchedAt);
  if (!post) return;

  await sendBufferPost(env, seconds, slot, post, fetchedAt);
}

async function sendBufferPost(env, seconds, slot, post, capturedAt) {
  const key = `buffer_x_${jstDay(seconds)}_${slot.replace(':', '')}`;
  const claimed = await env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING')
    .bind(key, JSON.stringify({ status: 'sending', captured_at: capturedAt })).run();
  if (!claimed.meta?.changes) return;
  try {
    const mutation = 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ' +
      '... on PostActionSuccess { post { id status } } ... on MutationError { message } } }';
    const result = await fetch('https://api.buffer.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.BUFFER_API_KEY}` },
      body: JSON.stringify({ query: mutation, variables: { input: {
        text: post, channelId: env.BUFFER_X_CHANNEL_ID, schedulingType: 'automatic', mode: 'shareNow',
      } } }),
      signal: AbortSignal.timeout(10000),
    });
    const body = await result.json();
    const created = body?.data?.createPost?.post;
    if (!result.ok || body.errors?.length || !created?.id)
      throw new Error(`Buffer post failed: HTTP ${result.status}; ${body?.data?.createPost?.message || body.errors?.[0]?.message || 'unknown'}`);
    await writeMeta(env.DB, key, JSON.stringify({ status: 'accepted', post_id: created.id, captured_at: capturedAt }));
  } catch (error) {
    await writeMeta(env.DB, key, JSON.stringify({ status: 'failed', message: String(error).slice(0, 400), captured_at: capturedAt }));
    console.error('Buffer X post failed', error);
  }
}

function xDailyPost(day, data) {
  if (!Number.isFinite(data.average_wait)) return null;
  const peak = data.hours.filter(hour => hour.snapshots >= 2 && hour.ride_count >= 5 &&
    Number.isFinite(hour.average_wait)).sort((a, b) => b.average_wait - a.average_wait)[0];
  if (!peak) return null;
  const date = `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`;
  const post = `【USJ待ち時間ナビ｜${date}の混雑実績】非公式\n` +
    `この日の平均待ち時間：${Math.round(data.average_wait)}分\n` +
    `最も混雑した時間帯：${hhmm(peak.at).slice(0, 2)}時台（平均${Math.round(peak.average_wait)}分）\n` +
    `20分ごとの記録を集計。休止・欠測は除外。\n` +
    `今日の履歴はこちら↓\nhttps://uniba-waittimes.com/\n#USJ #ユニバ`;
  return xWeightedLength(post) <= 250 ? post : null;
}

async function maybePostDailyX(env, seconds) {
  if (env.X_AUTOPOST_ENABLED !== 'true' || !env.BUFFER_API_KEY || !env.BUFFER_X_CHANNEL_ID ||
      !dueDailyXPost(seconds)) return;
  const day = jstDay(seconds);
  const schedule = await env.DB.prepare('SELECT opens,closes,status FROM park_days WHERE day=?').bind(day).first();
  if (schedule?.status !== 'OPERATING' || !schedule.opens || !schedule.closes) return;
  const opening = Date.parse(`${day}T${schedule.opens}:00+09:00`) / 1000;
  const closing = Date.parse(`${day}T${schedule.closes}:00+09:00`) / 1000;
  if (!Number.isFinite(opening) || !Number.isFinite(closing) || closing <= opening ||
      seconds < closing + 20 * 60) return;
  const data = await archiveDay(env.DB, day);
  if (!data || !Number.isFinite(data.average_wait) || !data.last_at ||
      data.first_at > opening + 40 * 60 || data.last_at < closing - 40 * 60 ||
      data.snapshots < Math.ceil((closing - opening) / SNAPSHOT_SECONDS * 0.7)) return;
  const post = xDailyPost(day, data);
  if (post) await sendBufferPost(env, seconds, X_DAILY_POST_TIME, post, new Date(data.last_at * 1000).toISOString());
}
function parsePollAnalytics(html) {
  const marker = 'var ANALYTICS_LOAD_DATA_ = ';
  const start = html.indexOf(marker);
  const end = start < 0 ? -1 : html.indexOf(';</script>', start);
  if (end < 0) throw new Error('Google Forms summary data unavailable');
  const data = JSON.parse(html.slice(start + marker.length, end));
  const reportedTotal = data?.[5];
  if (!Number.isInteger(reportedTotal) || reportedTotal < 0) throw new Error('Invalid poll total');
  const question = data?.[3]?.find(row => row?.[0] === POLL_QUESTION_ID);
  if (reportedTotal && !Array.isArray(question?.[1])) throw new Error('Poll answers unavailable');
  const counts = (question?.[1] || []).map(row => ({ name: row?.[0], votes: row?.[2] }));
  if (counts.some(row => typeof row.name !== 'string' || !row.name ||
      !Number.isInteger(row.votes) || row.votes < 0) ||
      counts.reduce((sum, row) => sum + row.votes, 0) !== reportedTotal)
    throw new Error('Invalid poll counts');
  counts.sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, 'ja'));
  return { total: reportedTotal, results: counts, fetched_at: new Date().toISOString() };
}
async function getPollResults() {
  const response = await fetch(POLL_ANALYTICS_URL, {
    headers: { Accept: 'text/html', 'Accept-Language': 'ja-JP,ja;q=0.9' },
  });
  if (!response.ok) throw new Error(`Google Forms summary HTTP ${response.status}`);
  const html = await response.text();
  if (html.length > 300000) throw new Error('Google Forms summary too large');
  return parsePollAnalytics(html);
}
function parseMapLocations(raw) {
  const children = Array.isArray(raw.children) ? raw.children : [];
  const locations = children.filter(item => {
    const lat = Number(item.location?.latitude), lng = Number(item.location?.longitude);
    return ['ATTRACTION', 'RESTAURANT'].includes(item.entityType) &&
      typeof item.externalId === 'string' && typeof item.name === 'string' &&
      lat > 34.65 && lat < 34.68 && lng > 135.42 && lng < 135.45;
  }).map(item => ({ key: item.externalId, name: item.name, type: item.entityType,
    lat: Number(item.location.latitude), lng: Number(item.location.longitude) }));
  if (locations.filter(item => item.type === 'ATTRACTION').length < 35 ||
      locations.filter(item => item.type === 'RESTAURANT').length < 35)
    throw new Error('Map locations look incomplete');
  return { source: 'ThemeParks.wiki', fetched_at: new Date().toISOString(), locations };
}
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
    const [priorPayload, priorFetchedAt] = await Promise.all([
      readMeta(env.DB, 'rides_payload'), readMeta(env.DB, 'rides_fetched_at'),
    ]);
    let previous = null;
    const priorGap = Date.parse(fetchedAt) - Date.parse(priorFetchedAt);
    if (priorPayload && Number.isFinite(priorGap) && priorGap >= 3 * 60 * 1000 && priorGap <= 8 * 60 * 1000) {
      try {
        const priorRides = JSON.parse(priorPayload);
        if (Array.isArray(priorRides)) previous = { fetched_at: priorFetchedAt, rides: priorRides };
      } catch (_) { /* 前回値が壊れている場合は比較しない */ }
    }
    await env.DB.batch([
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_previous_payload', JSON.stringify(previous)),
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_payload', JSON.stringify(rides)),
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('rides_fetched_at', fetchedAt),
      env.DB.prepare('INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE value <> excluded.value').bind('rides_error', ''),
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
  const day = jstDay(capturedAt);
  let today = null;
  try { today = JSON.parse(await readMeta(db, 'today_payload')); } catch (_) { /* 初回はD1の記録から構築する */ }
  const latest = await db.prepare('SELECT slot FROM snapshots WHERE slot>=? AND slot<? ORDER BY slot DESC LIMIT 1')
    .bind(dayStart(capturedAt) / SNAPSHOT_SECONDS, (dayStart(capturedAt) + 86400) / SNAPSHOT_SECONDS).first();
  if (today?.day !== day || !Array.isArray(today.snapshots) ||
      (latest?.slot ?? null) !== (today.snapshots[0]?.slot ?? null)) {
    today = await readTodayMatrix(db, capturedAt);
  }
  const snapshot = { slot, captured_at: capturedAt, rides: {} };
  const statements = [db.prepare('INSERT OR IGNORE INTO snapshots (slot,captured_at) VALUES (?,?)').bind(slot, capturedAt)];
  for (const ride of recent) {
    const wait = ride.is_open ? Number(ride.wait_time) : null;
    if (ride.is_open && (!Number.isInteger(wait) || wait < 0 || wait > 9999)) continue;
    const sample = { ride_id: ride.id, source: ride.source };
    if (visibleSample(sample)) snapshot.rides[String(ride.id)] = {
      wait_minutes: wait, is_open: !!ride.is_open, source: ride.source,
      estimated: ride.source === DARK_ESTIMATE_SOURCE,
    };
    statements.push(db.prepare(
      'INSERT OR IGNORE INTO ride_samples (slot,ride_id,wait_minutes,is_open,source) VALUES (?,?,?,?,?)'
    ).bind(slot, ride.id, wait, ride.is_open ? 1 : 0, ride.source));
  }
  statements.push(db.prepare(
    'INSERT INTO app_meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
  ).bind('today_payload', JSON.stringify({ day, snapshots: [snapshot, ...today.snapshots] })));
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
  const { results: existing } = await db.prepare('SELECT day,opens,closes,status FROM park_days').all();
  const previous = new Map(existing.map(item => [item.day, item]));
  const next = new Set(days.map(item => item.day));
  const statements = [];
  for (const item of days) {
    const old = previous.get(item.day);
    if (old && old.opens === item.opens && old.closes === item.closes && old.status === item.status) continue;
    statements.push(db.prepare(
      'INSERT INTO park_days (day,opens,closes,status) VALUES (?,?,?,?) ' +
      'ON CONFLICT(day) DO UPDATE SET opens=excluded.opens,closes=excluded.closes,status=excluded.status'
    ).bind(item.day, item.opens, item.closes, item.status));
  }
  for (const item of existing) {
    if (!next.has(item.day)) statements.push(db.prepare('DELETE FROM park_days WHERE day=?').bind(item.day));
  }
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
  // 施設位置は変化が少ない。毎日03:00 JSTに更新し、失敗時だけ15:00に再試行する。
  if (minute === 0 && (jstHour(seconds) === 3 || jstHour(seconds) === 15)) {
    try {
      const locations = parseMapLocations(await fetchJson(WIKI_MAP_URL));
      await writeMeta(env.DB, 'map_locations_payload', JSON.stringify(locations));
    } catch (error) { console.error('Map location refresh failed', error); }
  }
  if (minute === 0 && jstHour(seconds) === 3) {
    const cutoff = `buffer_x_${jstDay(seconds - 30 * 86400)}`;
    await env.DB.prepare("DELETE FROM app_meta WHERE key LIKE 'buffer_x_%' AND key < ?")
      .bind(cutoff).run();
  }
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
  // 閉園後の実績投稿は収集時間外でも実行する。営業時間と記録量が不足すれば見送る。
  await maybePostDailyX(env, seconds);
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
  // Cron は予定時刻より数分遅れて起動することがある。実行時の分だけで
  // 保存可否を決めると、その20分枠を丸ごと取り逃すため、未保存なら補う。
  let save = minute % 20 === 0;
  if (!save) {
    const slot = Math.floor(seconds / SNAPSHOT_SECONDS);
    const existing = await env.DB.prepare('SELECT slot FROM snapshots WHERE slot=?').bind(slot).first();
    if (existing && retry) return;
    save = !existing;
  }
  const collected = await refreshLive(env, seconds, save);
  if (save && !collected) throw new Error('定時の待ち時間取得に失敗しました');
  if (collected) await maybePostX(env, seconds);
}

async function history(db, rideId, days) {
  const since = epoch() - days * 86400;
  const { results } = await db.prepare(
    'SELECT h.captured_at,s.wait_minutes,s.is_open,s.source,s.ride_id FROM ride_samples s JOIN snapshots h USING(slot) ' +
    'WHERE s.ride_id=? AND s.slot>=? AND h.captured_at>=? ORDER BY s.slot LIMIT 2200'
  ).bind(rideId, Math.floor(since / SNAPSHOT_SECONDS), since).all();
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

async function readTodayMatrix(db, seconds) {
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
      source: row.source,
      estimated: row.source === DARK_ESTIMATE_SOURCE,
    };
  }
  return { day: jstDay(seconds), snapshots };
}

async function todayMatrix(db, seconds) {
  let stored = null;
  try { stored = JSON.parse(await readMeta(db, 'today_payload')); } catch (_) { /* 未保存なら従来のSQLで読む */ }
  if (stored?.day === jstDay(seconds) && Array.isArray(stored.snapshots)) return stored;
  return readTodayMatrix(db, seconds);
}

async function archiveDates(db, seconds) {
  const { results } = await db.prepare(
    "SELECT date(h.captured_at + 32400, 'unixepoch') AS day, COUNT(*) AS snapshots, " +
    'MIN(h.captured_at) AS first_at, MAX(h.captured_at) AS last_at, ' +
    'w.temp_max,w.temp_min,w.precip_total,w.precip_daytime,w.sun_hours,w.coverage ' +
    'FROM snapshots h LEFT JOIN weather_days w ON w.day=date(h.captured_at + 32400, \'unixepoch\') ' +
    "WHERE h.slot < ? GROUP BY date(h.captured_at + 32400, 'unixepoch') ORDER BY day DESC"
  ).bind(dayStart(seconds) / SNAPSHOT_SECONDS).all();
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

function omitHtmlBlock(html, marker, endTag) {
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Missing page block: ${marker}`);
  const end = html.indexOf(endTag, start);
  if (end < 0) throw new Error(`Unclosed page block: ${marker}`);
  return html.slice(0, start) + html.slice(end + endTag.length);
}

function pageHtml(html, page) {
  const remove = page === 'plan'
    ? [
      ['<div class="today-hours"', '</div>'], ['<div id="park-state"', '</div>'],
      ['<a id="park-alert"', '</a>'], ['<section class="heatmap-panel"', '</section>'],
      ['<section class="shows-panel"', '</section>'],
      ['<section class="closures-panel"', '</section>'], ['<section class="weather-panel"', '</section>'],
    ]
    : [
      ['<section class="archive-panel"', '</section>'],
      ['<section class="events-panel"', '</section>'],
    ];
  // These legacy sections are hidden on both pages and no longer requested by either page.
  remove.push(['<section class="calendar-panel"', '</section>'],
    ['<section class="history-panel"', '</section>']);
  for (const [marker, endTag] of remove) html = omitHtmlBlock(html, marker, endTag);
  const other = page === 'plan' ? 'now' : 'plan';
  html = html.replace(new RegExp(`<a href="#[^"]+" data-only="${other}">[^<]+<\\/a>`, 'g'), '');
  return html;
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const displayTime = value => new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));
const unavailableText = () => `データを取得できませんでした（${displayTime(Date.now())}）。公式アプリでご確認ください。`;
function replaceElementContent(html, id, content) {
  const expression = new RegExp(`(<([a-z]+)[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`);
  return html.replace(expression, (_, start, _tag, end) => start + content + end);
}
function replaceElementText(html, id, value) {
  return replaceElementContent(html, id, escapeHtml(value));
}
async function staticJson(request, env, path) {
  const url = new URL(path, request.url);
  const response = await assetFetch(new Request(url, request), env);
  if (!response.ok) throw new Error(`Static data ${path}: ${response.status}`);
  return response.json();
}
function rideJapaneseNames(html) {
  const source = html.match(/const japaneseNames = new Map\(\[([\s\S]*?)\]\);/)?.[1] || '';
  return new Map([...source.matchAll(/\[(\d+), '([^']+)'\]/g)]
    .map(([, id, name]) => [Number(id), name]));
}
async function renderInitialData(html, page, request, env, rides, fetchedAt, todayRow) {
  const failure = escapeHtml(unavailableText());
  if (page === 'now') {
    let initialMeta = {};
    try {
      const { results } = await env.DB.prepare(
        "SELECT key,value FROM app_meta WHERE key IN ('shows_payload','weather_payload','jma_weather_payload')"
      ).all();
      initialMeta = Object.fromEntries(results.map(row => [row.key, row.value]));
    } catch (error) {
      console.warn('Initial display meta read failed', error);
    }
    const nightPeriods = JSON.parse(html.match(/<script id="night-schedule" type="application\/json">([^<]+)<\/script>/)?.[1] || '{}');
    for (const [kind, id] of [['jaws', 'jaws-night-hours'], ['jurassic', 'jurassic-night-hours']]) {
      const slot = nightPeriods[kind]?.find(item => item.start <= jstDay(epoch()) && jstDay(epoch()) <= item.end);
      html = replaceElementText(html, id, slot ? `${slot.time}〜パーククローズの夜間版` : '現在の開催予定を確認できません');
    }
    const hours = todayRow?.status === 'CLOSED' ? '休園日'
      : todayRow?.opens && todayRow?.closes ? `${todayRow.opens}〜${todayRow.closes}` : unavailableText();
    html = replaceElementText(html, 'today-hours-time', hours);
    const names = rideJapaneseNames(html);
    const fresh = fetchedAt && Date.now() - Date.parse(fetchedAt) <= 15 * 60 * 1000;
    const ranked = fresh && Array.isArray(rides) ? rides.filter(ride => {
      const updated = Date.parse(ride.verified_at || ride.last_updated);
      const age = Date.now() - updated;
      return ride.is_open && !ride.data_unavailable && Number.isInteger(ride.wait_time) &&
        Number.isFinite(age) && age >= -2 * 60 * 1000 && age <= 15 * 60 * 1000;
    }).sort((a, b) => b.wait_time - a.wait_time).slice(0, 5) : [];
    const list = ranked.length ? ranked.map(ride => `<li><span>${escapeHtml(names.get(Number(ride.id)) || ride.name)}</span><strong>${ride.wait_time}分</strong></li>`).join('')
      : `<li>${failure}</li>`;
    html = replaceElementContent(html, 'top-waits-list', list)
      .replace(/(<ol id="top-waits-list") aria-busy="true"/, '$1');
    html = replaceElementText(html, 'movement-status', '比較データは画面更新後に表示します。');
    html = replaceElementText(html, 'heatmap-status', '今日の記録は画面更新後に表示します。');
    html = replaceElementContent(html, 'heatmap-body', `<tr><td colspan="99">今日の記録は画面更新後に表示します。</td></tr>`);
    try {
      const closures = await staticJson(request, env, '/closures.json');
      const day = jstDay(epoch());
      const items = closures.closures.filter(item => item.start <= day && (!item.end || day <= item.end));
      const list = items.length ? items.map(item => `<li>${escapeHtml(item.title)}（${escapeHtml(item.start)}〜${escapeHtml(item.end || item.end_note)}）</li>`).join('')
        : '<li>確認済みの掲載予定はありません。</li>';
      html = replaceElementContent(html, 'today-closures', list);
      html = replaceElementText(html, 'closures-status', `USJ公式ページを${closures.checked_at}に確認 · 今日の掲載 ${items.length}件`);
    } catch (_) {
      html = replaceElementContent(html, 'today-closures', `<li>${failure}</li>`);
      html = replaceElementContent(html, 'closures-status', failure);
    }
    try {
      const raw = initialMeta.shows_payload;
      const data = raw ? JSON.parse(raw) : null;
      const shows = data?.day === jstDay(epoch()) ? data.shows : null;
      if (!shows?.length) throw new Error('No current shows');
      const entries = shows.flatMap(show => show.times.map(slot => ({ name: show.name, start: slot.start })))
        .sort((a, b) => a.start.localeCompare(b.start));
      html = replaceElementContent(html, 'show-list', `<ul class="initial-show-list">${entries.map(item =>
        `<li><time>${escapeHtml(displayTime(item.start))}</time> ${escapeHtml(item.name)}</li>`).join('')}</ul>`);
      html = replaceElementText(html, 'shows-status', `${data.day.replaceAll('-', '/')} · ${shows.length}件 · ${entries.length}回の開始時刻`);
    } catch (_) {
      html = replaceElementContent(html, 'show-list', `<p class="muted">${failure}</p>`);
      html = replaceElementContent(html, 'shows-status', failure);
    }
    try {
      const weatherRaw = initialMeta.weather_payload;
      const jmaRaw = initialMeta.jma_weather_payload;
      const weather = weatherRaw ? JSON.parse(weatherRaw) : null;
      const jma = jmaRaw ? JSON.parse(jmaRaw) : null;
      const period = weather?.periods?.find(item => Date.parse(item.time) >= Date.now() - 3600000);
      if (period && Date.now() - Date.parse(weather.fetched_at) < 3 * 3600000) {
        const symbol = period.symbol || '';
        const condition = symbol.includes('thunder') ? '雷雨' : symbol.includes('snow') ? '雪' :
          symbol.includes('rain') ? '雨' : symbol.includes('partlycloudy') || symbol.includes('fair') ? '晴れ時々曇り' :
          symbol.includes('cloudy') ? '曇り' : symbol.includes('clear') ? '晴れ' : '予報を確認中';
        html = replaceElementText(html, 'weather-summary', `USJ付近：${condition}・平均風速${Number.isFinite(period.wind_speed) ? period.wind_speed.toFixed(1) + 'm/s' : '不明'}`);
        html = replaceElementText(html, 'weather-status', `${weather.location} · ${displayTime(period.time)}時点の時間別予報`);
        html = replaceElementText(html, 'weather-condition', condition);
        for (const [id, value, unit] of [
          ['weather-temperature', period.temperature, '℃'], ['weather-wind', period.wind_speed, 'm/s'],
          ['weather-rain', period.precipitation, 'mm'], ['weather-gust', period.wind_gust, 'm/s'],
        ]) html = replaceElementText(html, id, Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—');
      } else {
        html = replaceElementContent(html, 'weather-summary', failure);
        html = replaceElementContent(html, 'weather-status', failure);
      }
      if (jma && Date.now() - Date.parse(jma.observed_at) < 3 * 3600000) {
        html = replaceElementText(html, 'jma-forecast', `気象庁・大阪府の天気予報：${jma.forecast_text || '天気情報なし'}`);
        html = replaceElementText(html, 'jma-status', `大阪観測所 ${displayTime(jma.observed_at)}時点の実測値。USJとは異なる地点です。`);
        for (const [id, value, unit] of [
          ['jma-temperature', jma.temperature, '℃'], ['jma-wind', jma.wind_speed, 'm/s'],
          ['jma-rain', jma.precipitation_1h, 'mm'],
        ]) html = replaceElementText(html, id, Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—');
      } else {
        html = replaceElementContent(html, 'jma-forecast', failure);
        html = replaceElementContent(html, 'jma-status', failure);
      }
    } catch (_) {
      for (const id of ['weather-summary', 'weather-status', 'jma-forecast', 'jma-status'])
        html = replaceElementContent(html, id, failure);
    }
  } else {
    try {
      const data = await staticJson(request, env, '/events.json');
      const today = jstDay(epoch());
      const groups = { ongoing: [], upcoming: [], undated: [] };
      for (const item of data.events) {
        if (item.end && item.end < today) continue;
        const group = item.start > today ? 'upcoming' : item.end ? 'ongoing' : 'undated';
        groups[group].push(item);
      }
      for (const [group, countId] of [['ongoing', 'ongoing-count'], ['upcoming', 'upcoming-count'], ['undated', 'undated-count']]) {
        const entries = groups[group];
        html = replaceElementText(html, countId, `（${entries.length}件）`);
        html = replaceElementContent(html, `${group}-events`, entries.length ? entries.map(item =>
          `<article class="event-card"><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a><small>${escapeHtml(item.time_note || `${item.start}〜${item.end || '終了日未掲載'}`)}</small></article>`).join('')
          : '<p class="muted">該当するイベントはありません。</p>');
      }
      html = replaceElementText(html, 'events-status', `公式一覧を${data.checked_at}に確認 · 日程は手動更新`);
    } catch (_) {
      html = replaceElementContent(html, 'events-status', failure);
      for (const id of ['ongoing-events', 'upcoming-events', 'undated-events'])
        html = replaceElementContent(html, id, `<p class="muted">${failure}</p>`);
    }
  }
  return html;
}

async function route(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  if (url.hostname === 'usj-wait-nav.kotaro-7436.workers.dev') {
    url.hostname = 'uniba-waittimes.com';
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname === '/en' || url.pathname === '/en/') {
    const assetUrl = new URL('/en/index.html', url);
    const asset = await assetFetch(new Request(assetUrl, request), env);
    const headers = new Headers(asset.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Cache-Control', 'public, max-age=60');
    return new Response(asset.body, { status: asset.status, headers });
  }
  const shortRidePath = /^\/r\/([1-9]\d{0,7})$/.exec(url.pathname);
  if (url.pathname === '/' || url.pathname === '/plan' || shortRidePath) {
    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/index.html';
    const asset = await assetFetch(new Request(indexUrl, request), env);
    let html = await asset.text();
    let payload = null;
    let fetchedAt = null;
    let rides = null;
    try {
      [payload, fetchedAt] = await Promise.all([
        readMeta(env.DB, 'rides_payload'), readMeta(env.DB, 'rides_fetched_at'),
      ]);
    } catch (error) {
      console.warn('Summary database read failed', error);
    }
    let summary = '<p class="muted">最新の待ち時間と保存済み履歴は、このページの表で確認できます。</p>';
    if (payload && fetchedAt && Date.now() - Date.parse(fetchedAt) <= 15 * 60 * 1000) {
      rides = JSON.parse(payload);
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
      const time = displayTime(fetchedAt);
      summary = `<p class="muted">${time}時点：待ち時間を確認できるアトラクション${open.length}件` +
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
    html = await renderInitialData(html, page, request, env, rides, fetchedAt, todayRow);
    html = html.replace('<html lang="ja">', `<html lang="ja" data-page="${page}">`);
    if (shortRidePath) {
      html = html.replace(/<meta property="og:url" content="[^"]*">/,
        `<meta property="og:url" content="${url.origin}${url.pathname}">`);
    }
    html = html.replace(
      page === 'plan' ? /<h1 data-only="now">[\s\S]*?<\/h1>\s*/ : /<h1 data-only="plan">[\s\S]*?<\/h1>\s*/,
      '');
    html = pageHtml(html, page);
    if (page === 'plan') {
      html = html
        .replace(/<title>[^<]*<\/title>/,
          '<title>USJ混雑カレンダー｜過去の待ち時間実績と天気｜USJ待ち時間ナビ</title>')
        .replace(/<meta name="description" content="[^"]*">/,
          '<meta name="description" content="USJの過去の混雑実績をカレンダーで確認。日別・アトラクション別の待ち時間、気象庁の天気実績、営業時間、イベント情報をまとめた個人運営の非公式サイトです。">')
        .replace(/(<link rel="canonical" href="[^"]*)\/"/, '$1/plan"')
        .replace(/(<meta property="og:url" content="[^"]*)\/"/, '$1/plan"')
        .replace(/<meta property="og:title" content="[^"]*">/,
          '<meta property="og:title" content="USJ混雑カレンダー｜過去の待ち時間実績と天気｜USJ待ち時間ナビ">')
        .replace(/<meta property="og:description" content="[^"]*">/,
          '<meta property="og:description" content="USJの過去の混雑実績をカレンダーで確認。日別・アトラクション別の待ち時間、気象庁の天気実績、営業時間、イベント情報をまとめた個人運営の非公式サイトです。">');
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
  if (url.pathname === '/vote') {
    url.pathname = '/vote.html';
    return assetFetch(new Request(url, request), env);
  }
  // 位置データの一括配信は行わず、地図ページの表示にのみ使用する。
  if (url.pathname === '/map-locations.json') return new Response('Not found', { status: 404 });
  if (url.pathname === '/map') {
    url.pathname = '/map.html';
    const response = await assetFetch(new Request(url, request), env);
    if (!response.ok) return response;
    let locations = null;
    try { locations = await readMeta(env.DB, 'map_locations_payload'); }
    catch (error) { console.warn('Saved map locations unavailable; using bundled snapshot', error); }
    if (!locations) {
      if (typeof EMBEDDED_ASSETS !== 'undefined') locations = EMBEDDED_ASSETS['/map-locations.json'];
      else {
        const fallback = await assetFetch(new Request(new URL('/map-locations.json', request.url)), env);
        if (fallback.ok) locations = await fallback.text();
      }
    }
    const safe = (locations || '{"locations":[]}').replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
    const html = (await response.text()).replace('<!--MAP_LOCATIONS-->', safe);
    return new Response(html, { status: 200, headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    } });
  }
  if (url.pathname === '/sitemap.xml') return embeddedFetch(request);
  if (url.pathname === '/api/poll-results') {
    try { return json(await getPollResults()); }
    catch (error) {
      console.warn('Poll summary unavailable', error);
      return json({ unavailable: true, error: '集計を確認できません' }, 503);
    }
  }
  if (url.pathname === '/api/events' || url.pathname === '/api/closures' || url.pathname === '/api/pass-exclusions' || url.pathname === '/api/ticket-prices') {
    url.pathname = url.pathname === '/api/events' ? '/events.json'
      : url.pathname === '/api/closures' ? '/closures.json'
      : url.pathname === '/api/ticket-prices' ? '/ticket-prices.json' : '/pass-exclusions.json';
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
    const [fetchedAt, refreshError, previousPayload] = await Promise.all([
      readMeta(env.DB, 'rides_fetched_at'), readMeta(env.DB, 'rides_error'),
      readMeta(env.DB, 'rides_previous_payload').catch(() => null),
    ]);
    let previous = null;
    try { previous = JSON.parse(previousPayload); } catch (_) { /* 前回値がなければ比較しない */ }
    return json({ rides, fetched_at: fetchedAt, previous, refresh_error: refreshError || null,
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
  ['/', 60], ['/en', 60], ['/en/', 60], ['/plan', 60], ['/map', 300], ['/vote', 300],
  ['/api/waits', 300], ['/api/today', 300], ['/api/weather', 600],
  ['/api/schedule', 1800], ['/api/holidays', 21600], ['/api/shows', 300], ['/api/archive/days', 1800],
  ['/api/archive/day', 86400], ['/api/history', 300],
  ['/api/poll-results', 300],
]);

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;
    const ttl = request.method === 'GET'
      ? (/^\/r\/[1-9]\d{0,7}$/.test(pathname) ? 60 : API_CACHE_SECONDS.get(pathname)) : null;
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
