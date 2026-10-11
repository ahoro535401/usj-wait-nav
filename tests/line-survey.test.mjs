import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const answers = new Map();
const db = { prepare(sql) {
  let args = [];
  return {
    bind(...values) { args = values; return this; },
    async first() { return answers.get(args[0]) || null; },
    async run() {
      if (sql.startsWith('INSERT INTO line_survey_answers')) {
        const [user_key, age_band, gender, prefecture, visit_frequency, annual_pass,
          usual_party, experience_priorities_json, information_goal,
          consented_at, updated_at, expires_at] = args;
        answers.set(user_key, { age_band, gender, prefecture, visit_frequency, annual_pass,
          usual_party, experience_priorities_json, information_goal,
          consented_at, updated_at, expires_at });
      } else if (sql.includes('WHERE expires_at <= ?')) {
        for (const [key, value] of answers) if (value.expires_at <= args[0]) answers.delete(key);
      } else if (sql.includes('WHERE user_key=?')) answers.delete(args[0]);
      else throw Error(`Unexpected SQL: ${sql}`);
      return { success: true };
    },
  };
} };
const env = { DB: db, LIFF_APP_ID: '2011965864-82a4Fg80',
  CRM_HASH_KEY: 'test-secret-with-more-than-thirty-two-characters', LINE_SURVEY_ENABLED: 'true' };
const endpoint = 'https://example.test/api/line-survey';
const persona = { usual_party:'alone', experience_priorities:['thrill_rides','nintendo'],
  information_goal:'route_order' };
function req(method, body, auth = 'a.b.c', origin = 'https://example.test') {
  return new Request(endpoint, { method, headers: {
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
}

test('survey needs LINE authentication and explicit consent; stores one removable answer per user', async () => {
  const originalFetch = globalThis.fetch;
  let sub = `U${'a'.repeat(32)}`;
  globalThis.fetch = async () => Response.json({ aud: '2011965864', iss: 'https://access.line.me', sub,
    exp: Math.floor(Date.now() / 1000) + 3600 });
  try {
    let response = await worker.fetch(req('GET', null, null), env);
    assert.equal(response.status, 401);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'30s' }, 'a.b.c', 'https://wrong.test'), env);
    assert.equal(response.status, 403);
    response = await worker.fetch(req('PUT', { consent:false, age_band:'30s' }), env);
    assert.equal(response.status, 400);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'30s', email:'private@example.com' }), env);
    assert.equal(response.status, 400);
    assert.equal(answers.size, 0);

    response = await worker.fetch(req('PUT', { consent:true, age_band:'30s', gender:'woman',
      prefecture:'28', visit_frequency:'yearly', annual_pass:'standard', ...persona }), env);
    assert.equal(response.status, 200);
    assert.equal(answers.size, 1);
    assert.equal(answers.has(sub), false);
    assert.equal([...answers.keys()][0].length, 64);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'other',
      prefecture:'13', visit_frequency:'monthly_2_plus', annual_pass:'grand_royal', ...persona }), env);
    assert.equal(response.status, 200);
    assert.equal(answers.size, 1);
    assert.equal([...answers.values()][0].age_band, '40s');
    assert.equal([...answers.values()][0].gender, 'other');
    assert.equal([...answers.values()][0].prefecture, '13');
    assert.equal([...answers.values()][0].annual_pass, 'grand_royal');
    assert.equal([...answers.values()][0].visit_frequency, 'monthly_2_plus');
    assert.equal([...answers.values()][0].usual_party, 'alone');
    assert.deepEqual(JSON.parse([...answers.values()][0].experience_priorities_json), persona.experience_priorities);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'other',
      prefecture:'13', visit_frequency:'three_plus_yearly', annual_pass:'grand_royal', ...persona }), env);
    assert.equal(response.status, 400);

    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'other',
      prefecture:'13', visit_frequency:'monthly_2_plus', annual_pass:'grand_royal',
      ...persona, experience_priorities:['thrill_rides','nintendo','shows_parades'] }), env);
    assert.equal(response.status, 400);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'other',
      prefecture:'13', visit_frequency:'monthly_2_plus', annual_pass:'grand_royal',
      ...persona, experience_priorities:['thrill_rides','thrill_rides'] }), env);
    assert.equal(response.status, 400);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'other',
      prefecture:'13', visit_frequency:'monthly_2_plus', annual_pass:'grand_royal' }), env);
    assert.equal(response.status, 400);

    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'man',
      prefecture:'27', visit_frequency:'yearly' }), env);
    assert.equal(response.status, 400);
    assert.equal([...answers.values()][0].gender, 'other');
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'prefer_not',
      prefecture:'27', visit_frequency:'yearly', annual_pass:'none' }), env);
    assert.equal(response.status, 400);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'man',
      prefecture:'48', visit_frequency:'yearly', annual_pass:'none' }), env);
    assert.equal(response.status, 400);
    response = await worker.fetch(req('PUT', { consent:true, age_band:'40s', gender:'man',
      prefecture:'27', visit_frequency:'yearly', annual_pass:'premium' }), env);
    assert.equal(response.status, 400);

    sub = `U${'b'.repeat(32)}`;
    response = await worker.fetch(req('GET'), env);
    assert.deepEqual(await response.json(), { saved:false });
    sub = `U${'a'.repeat(32)}`;
    response = await worker.fetch(req('GET'), env);
    const saved = await response.json();
    assert.equal(saved.age_band, '40s');
    assert.equal(saved.gender, 'other');
    assert.equal(saved.prefecture, '13');
    assert.equal(saved.annual_pass, 'grand_royal');
    assert.deepEqual(saved.experience_priorities, persona.experience_priorities);
    assert.equal(Object.hasOwn(saved, 'experience_priorities_json'), false);

    const key = [...answers.keys()][0];
    answers.set(key, { ...answers.get(key), usual_party:null,
      experience_priorities_json:null, information_goal:null });
    response = await worker.fetch(req('GET'), env);
    const legacy = await response.json();
    assert.equal(legacy.saved, true);
    assert.equal(legacy.age_band, '40s');
    assert.deepEqual(legacy.experience_priorities, []);
    response = await worker.fetch(req('DELETE'), env);
    assert.equal(response.status, 200);
    assert.equal(answers.size, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('survey route stays unavailable when not enabled', async () => {
  const response = await worker.fetch(new Request(endpoint), { ...env, LINE_SURVEY_ENABLED:'false' });
  assert.equal(response.status, 404);
});
