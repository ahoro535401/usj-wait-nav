import { rideNames } from './ride-names.js';

const HOST = 'crm.uniba-waittimes.com';
const DAY = 86400000;
const LABELS = {
  age_band: { under20: '19歳以下', '20s': '20代', '30s': '30代', '40s': '40代', '50s': '50代', '60plus': '60代以上' },
  gender: { woman: '女性', man: '男性', other: 'その他' },
  visit_frequency: { first: '初めて', less_than_yearly: '年1回未満', yearly: '年1～2回', yearly_3_5: '年3～5回', yearly_6_11: '年6～11回', monthly_1: '月1回程度', monthly_2_plus: '月2回以上' },
  annual_pass: { standard: 'スタンダード', grand_royal: 'グランロイヤル', none: 'なし' },
  usual_party: { alone: 'ひとり', friends_partner: '友人・パートナー', with_children: '子ども連れ', other_family: 'その他の家族', varies: 'その都度異なる' },
  information_goal: { route_order: '施設を回る順番', queue_timing: '並ぶタイミング', quieter_rides: '空いている施設', visit_date: '来園日', ride_operations: '施設の運行・休止状況' },
  experience_priorities: { thrill_rides: '絶叫ライド', nintendo: 'ニンテンドー', shows_parades: 'ショー・パレード', seasonal_events: '季節イベント', kids_attractions: '子ども向け施設', food_shopping: '飲食・買い物' },
};
const PREFECTURES = '北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ');
const prefectureName = code => code === 'overseas' ? '海外' : PREFECTURES[Number(code) - 1] || code || '—';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dateJst = offset => new Date(Date.now() + 9 * 3600000 - offset * DAY).toISOString().slice(0, 10);
const dateDisplay = day => day ? `${day.slice(0, 4)}/${day.slice(5, 7)}/${day.slice(8, 10)}` : '—';
const fmt = value => value == null ? '—' : Number(value).toLocaleString('ja-JP');
const favoriteName = id => rideNames.get(Number(id)) || `施設ID ${id}`;
const parseFavorites = value => {
  try {
    const ids = JSON.parse(value || '[]');
    return Array.isArray(ids) ? [...new Set(ids.filter(id => Number.isInteger(id) && id > 0))] : [];
  } catch { return []; }
};
const parseExperiences = value => {
  try {
    const choices = JSON.parse(value || '[]');
    return Array.isArray(choices) ? choices.filter(choice => Object.hasOwn(LABELS.experience_priorities, choice)) : [];
  } catch { return []; }
};
const htmlResponse = (body, status = 200) => new Response(body, { status, headers: {
  'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow',
} });

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid token encoding');
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function authenticated(request, env) {
  if (new URL(request.url).hostname !== HOST || !env.ADMIN_EMAIL || !env.POLICY_AUD || !env.TEAM_DOMAIN) return false;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 12000) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (header.alg !== 'RS256' || !header.kid || claims.iss !== env.TEAM_DOMAIN ||
      !aud.includes(env.POLICY_AUD) || !Number.isFinite(claims.exp) || claims.exp <= now ||
      (claims.nbf != null && claims.nbf > now) ||
      String(claims.email || '').toLowerCase() !== String(env.ADMIN_EMAIL).toLowerCase()) return false;
    const certs = await fetch(`${env.TEAM_DOMAIN}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(5000) });
    if (!certs.ok) return false;
    const { keys } = await certs.json();
    const jwk = Array.isArray(keys) && keys.find(key => key.kid === header.kid && key.kty === 'RSA' && key.alg === 'RS256');
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodeBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch { return false; }
}

async function lineInsight(env, day) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) return null;
  const response = await fetch(`https://api.line.me/v2/bot/insight/followers?date=${day.replaceAll('-', '')}`, {
    headers: { Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`LINE insight HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== 'ready' || !['followers', 'blocks', 'targetedReaches'].every(k => Number.isInteger(data[k]) && data[k] >= 0)) return null;
  return { day, followers: data.followers, blocks: data.blocks, targeted_reaches: data.targetedReaches, fetched_at: Math.floor(Date.now() / 1000) };
}

async function refreshInsights(env) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) return { state: '未接続' };
  const yesterday = dateJst(1);
  const existing = await env.DB.prepare('SELECT day,fetched_at FROM line_admin_follower_insights WHERE day=?').bind(yesterday).first();
  if (existing && Date.now() / 1000 - existing.fetched_at < 6 * 3600) return { state: '取得済み' };
  try {
    const insight = await lineInsight(env, yesterday);
    if (!insight) return { state: '集計待ち' };
    await env.DB.prepare('INSERT INTO line_admin_follower_insights(day,followers,blocks,targeted_reaches,fetched_at) VALUES(?,?,?,?,?) ON CONFLICT(day) DO UPDATE SET followers=excluded.followers,blocks=excluded.blocks,targeted_reaches=excluded.targeted_reaches,fetched_at=excluded.fetched_at')
      .bind(insight.day, insight.followers, insight.blocks, insight.targeted_reaches, insight.fetched_at).run();
    return { state: '取得済み' };
  } catch (error) { return { state: '取得失敗', detail: error.message }; }
}

async function dataForDashboard(env) {
  const now = Math.floor(Date.now() / 1000);
  const [plans, answers, personaComplete, linked, recent, favoriteRows, favoriteUsers, groups, experienceRows, insights] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS n FROM line_crm_plans WHERE expires_at>?').bind(now).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM line_survey_answers WHERE expires_at>?').bind(now).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM line_survey_answers WHERE expires_at>?
      AND usual_party IS NOT NULL AND information_goal IS NOT NULL
      AND json_array_length(CASE WHEN json_valid(experience_priorities_json) THEN experience_priorities_json ELSE '[]' END)>0`).bind(now).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM line_crm_plans p JOIN line_survey_answers s ON p.user_key=s.user_key WHERE p.expires_at>? AND s.expires_at>?').bind(now, now).first(),
    env.DB.prepare(`SELECT x.user_key,p.favorites_json,p.visit_day,p.updated_at AS plan_updated,s.age_band,s.gender,s.prefecture,s.visit_frequency,s.annual_pass,
      s.usual_party,s.experience_priorities_json,s.information_goal,s.updated_at AS survey_updated
      FROM (SELECT user_key FROM line_crm_plans WHERE expires_at>? UNION SELECT user_key FROM line_survey_answers WHERE expires_at>?) x
      LEFT JOIN line_crm_plans p ON p.user_key=x.user_key AND p.expires_at>?
      LEFT JOIN line_survey_answers s ON s.user_key=x.user_key AND s.expires_at>?
      ORDER BY max(COALESCE(p.updated_at,0),COALESCE(s.updated_at,0)) DESC LIMIT 100`).bind(now, now, now, now).all(),
    env.DB.prepare(`SELECT CAST(j.value AS INTEGER) AS ride_id,COUNT(DISTINCT p.user_key) AS n
      FROM line_crm_plans p,json_each(CASE WHEN json_valid(p.favorites_json) THEN p.favorites_json ELSE '[]' END) j
      WHERE p.expires_at>? AND j.type='integer' AND CAST(j.value AS INTEGER)>0
      GROUP BY CAST(j.value AS INTEGER) ORDER BY n DESC,ride_id`).bind(now).all(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM line_crm_plans p WHERE p.expires_at>?
      AND json_array_length(CASE WHEN json_valid(p.favorites_json) THEN p.favorites_json ELSE '[]' END)>0`).bind(now).first(),
    Promise.all(['age_band', 'gender', 'prefecture', 'visit_frequency', 'annual_pass', 'usual_party', 'information_goal'].map(async key => ({
      key, rows: (await env.DB.prepare(`SELECT ${key} AS choice,COUNT(*) AS n FROM line_survey_answers WHERE expires_at>? AND ${key} IS NOT NULL GROUP BY ${key} ORDER BY n DESC,choice`).bind(now).all()).results || [],
    }))),
    env.DB.prepare(`SELECT j.value AS choice,COUNT(DISTINCT s.user_key) AS n FROM line_survey_answers s,
      json_each(CASE WHEN json_valid(s.experience_priorities_json) THEN s.experience_priorities_json ELSE '[]' END) j
      WHERE s.expires_at>? AND j.type='text' GROUP BY j.value ORDER BY n DESC,choice`).bind(now).all(),
    env.DB.prepare('SELECT day,followers,blocks,targeted_reaches FROM line_admin_follower_insights ORDER BY day DESC LIMIT 14').all(),
  ]);
  return { plans: plans?.n || 0, favoriteUsers: favoriteUsers?.n || 0, answers: answers?.n || 0,
    personaComplete: personaComplete?.n || 0, linked: linked?.n || 0,
    recent: recent.results || [], favorites: favoriteRows.results || [], groups,
    experiences: experienceRows.results || [], insights: insights.results || [] };
}

function groupHtml({ key, rows }) {
  const names = { age_band: '年代', gender: '性別', prefecture: '居住地', visit_frequency: '来園頻度', annual_pass: '年間パス', usual_party: '普段の同行者', information_goal: '待ち時間情報で決めたいこと' };
  const sum = rows.reduce((n, row) => n + row.n, 0);
  return `<section class="panel"><h2>${names[key]}</h2>${rows.length ? `<div class="bars">${rows.map(row => {
    const name = LABELS[key]?.[row.choice] || (key === 'prefecture' ? prefectureName(row.choice) : row.choice);
    return `<div class="bar-row"><span>${escape(name)}</span><div class="track"><div style="width:${Math.round(row.n * 100 / sum)}%"></div></div><strong>${fmt(row.n)}</strong></div>`;
  }).join('')}</div>` : '<p class="muted">回答はまだありません。</p>'}</section>`;
}

function dashboard(data, insightState) {
  const latest = data.insights[0];
  const rows = data.recent.map(row => {
    const favorites = parseFavorites(row.favorites_json);
    const experiences = parseExperiences(row.experience_priorities_json);
    const last = Math.max(row.plan_updated || 0, row.survey_updated || 0);
    const complete = row.usual_party && row.information_goal && experiences.length;
    return `<tr><td><code>${escape(row.user_key?.slice(0, 10))}</code></td><td>${row.survey_updated ? (complete ? '8項目回答済み' : '追加3項目未回答') : '未回答'}</td><td>${row.plan_updated ? (favorites.length ? escape(favorites.map(favoriteName).join('、')) : '登録なし') : '未保存'}</td><td>${escape(row.visit_day || '—')}</td><td>${escape(LABELS.age_band[row.age_band] || '—')}</td><td>${escape(LABELS.gender[row.gender] || '—')}</td><td>${escape(prefectureName(row.prefecture))}</td><td>${escape(LABELS.visit_frequency[row.visit_frequency] || '—')}</td><td>${escape(LABELS.annual_pass[row.annual_pass] || '—')}</td><td>${escape(LABELS.usual_party[row.usual_party] || '—')}</td><td>${escape(experiences.map(choice => LABELS.experience_priorities[choice]).join('、') || '—')}</td><td>${escape(LABELS.information_goal[row.information_goal] || '—')}</td><td>${last ? escape(new Date(last * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })) : '—'}</td></tr>`;
  }).join('');
  const favoriteTotal = data.favorites.reduce((sum, row) => sum + row.n, 0);
  const favoriteItems = data.favorites.map(row => `<div class="bar-row"><span>${escape(favoriteName(row.ride_id))}</span><div class="track"><div style="width:${Math.round(row.n * 100 / Math.max(data.plans, 1))}%"></div></div><strong>${fmt(row.n)}人</strong></div>`).join('');
  const experienceItems = data.experiences.filter(row => Object.hasOwn(LABELS.experience_priorities, row.choice))
    .map(row => `<div class="bar-row"><span>${escape(LABELS.experience_priorities[row.choice])}</span><div class="track"><div style="width:${Math.round(row.n * 100 / Math.max(data.personaComplete, 1))}%"></div></div><strong>${fmt(row.n)}人</strong></div>`).join('');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LINE友だち・利用状況 | USJ待ち時間ナビ</title><style>
  :root{font-family:system-ui,sans-serif;color:#182b42;background:#f3f7fb}*{box-sizing:border-box}body{max-width:1200px;margin:auto;padding:28px 16px 60px}h1{font-size:clamp(1.6rem,4vw,2.2rem);margin:0 0 4px}h2{font-size:1.12rem;margin:0 0 16px}.muted{color:#5c6b7b}.note{font-size:.88rem;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:22px 0}.card,.panel{background:white;border:1px solid #d7e2ee;border-radius:14px;padding:20px}.card strong{display:block;font-size:2rem;color:#145aa1}.card span{font-size:.85rem;color:#52657a}.panel{margin:16px 0}.columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}.columns .panel{margin:0}.bars{display:grid;gap:11px}.bar-row{display:grid;grid-template-columns:minmax(110px,260px) minmax(90px,1fr) 44px;gap:8px;align-items:center;font-size:.87rem}.bar-row span{overflow-wrap:anywhere}.track{height:10px;background:#e7edf5;border-radius:10px;overflow:hidden}.track div{height:100%;background:#236dbc}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:.84rem}td,th{text-align:left;padding:9px;border-bottom:1px solid #e4eaf1}th{background:#f1f6fc}a{color:#145aa1}code{font-size:.82rem}@media(max-width:600px){.bar-row{grid-template-columns:minmax(100px,1fr) 80px 44px}body{padding:20px 12px 40px}}
  </style></head><body><h1>LINE友だち・利用状況</h1><p class="muted">USJ待ち時間ナビ｜運営者専用・読み取り中心</p>
  <section class="grid"><div class="card"><span>友だち追加累計${latest ? `（${dateDisplay(latest.day)}時点）` : ''}</span><strong>${fmt(latest?.followers)}</strong></div><div class="card"><span>ブロック</span><strong>${fmt(latest?.blocks)}</strong></div><div class="card"><span>ターゲットリーチ</span><strong>${fmt(latest?.targeted_reaches)}</strong></div><div class="card"><span>アンケート回答者（旧5項目を含む）</span><strong>${fmt(data.answers)}</strong></div><div class="card"><span>追加3項目も回答済み</span><strong>${fmt(data.personaComplete)}</strong></div><div class="card"><span>マイプラン保存者</span><strong>${fmt(data.plans)}</strong></div><div class="card"><span>両方利用</span><strong>${fmt(data.linked)}</strong></div></section>
  <p class="note muted">友だち数：${escape(insightState.state)}${insightState.detail ? `（${escape(insightState.detail)}）` : ''}。LINE公式アカウントの友だちとLINE内機能の利用者は別集計です。友だち追加累計はブロック後も減らず、ターゲットリーチは配信可能な全員ではありません。</p>
  <section class="panel"><h2>友だち数の推移</h2>${data.insights.length ? `<div class="table-wrap"><table><thead><tr><th>日付</th><th>追加累計</th><th>ブロック</th><th>ターゲットリーチ</th></tr></thead><tbody>${data.insights.map(row => `<tr><td>${dateDisplay(row.day)}</td><td>${fmt(row.followers)}</td><td>${fmt(row.blocks)}</td><td>${fmt(row.targeted_reaches)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">LINE APIの接続後、確定した日次データを表示します。</p>'}</section>
  <section class="panel"><h2>お気に入り施設の登録状況</h2><p class="note muted">LINE保存者${fmt(data.plans)}人のうち、お気に入り施設の登録あり${fmt(data.favoriteUsers)}人・登録なし${fmt(Math.max(0, data.plans - data.favoriteUsers))}人。施設ごとの人数を表示します。1人が複数施設を登録できるため、合計${fmt(favoriteTotal)}件は人数と一致しません。</p><p class="note muted">通常サイトのブラウザー内だけに保存されたお気に入りは集計できません。利用者が通常サイトからLINE内マイプランへ引き継ぎ、同意して「LINEに保存する」を押すと、ここに反映されます。</p>${favoriteItems ? `<div class="bars">${favoriteItems}</div>` : '<p class="muted">LINEに保存されたお気に入り施設はまだありません。</p>'}</section>
  <div class="columns">${data.groups.map(groupHtml).join('')}</div>
  <section class="panel"><h2>楽しみにしているもの</h2><p class="note muted">1人あたり最大2つ選択できます。追加設問に回答済みの${fmt(data.personaComplete)}人を母数にした各選択肢の人数です。</p>${experienceItems ? `<div class="bars">${experienceItems}</div>` : '<p class="muted">回答はまだありません。</p>'}</section>
  <section class="panel"><h2>LINE内利用者（直近100件）</h2><p class="note muted">照合キーの一部だけを表示。LINE公式アカウントの友だちかどうかは判定していません。回答・保存は180日で失効します。</p><div class="table-wrap"><table><thead><tr><th>管理用ID</th><th>アンケート</th><th>お気に入り施設</th><th>来園予定日</th><th>年代</th><th>性別</th><th>居住地</th><th>来園頻度</th><th>年パス</th><th>同行者</th><th>楽しみにしているもの</th><th>知りたいこと</th><th>最終更新</th></tr></thead><tbody>${rows || '<tr><td colspan="13">利用者データはまだありません。</td></tr>'}</tbody></table></div></section>
  <p class="note muted">この画面から利用者へのメッセージ送信やデータ編集はできません。<a href="https://manager.line.biz/account/@133lotsh/insight/friends" rel="noreferrer">LINE公式管理画面の友だち分析</a>でも数値を確認できます。</p></body></html>`;
}

export default {
  async scheduled(_event, env) {
    await refreshInsights(env);
  },
  async fetch(request, env) {
    if (request.method !== 'GET' || new URL(request.url).pathname !== '/') return htmlResponse('Not found', 404);
    if (!await authenticated(request, env)) return htmlResponse('Forbidden', 403);
    try {
      const insightState = await refreshInsights(env);
      return htmlResponse(dashboard(await dataForDashboard(env), insightState));
    } catch { return htmlResponse('管理データを表示できません。時間をおいて再度お試しください。', 503); }
  },
};
