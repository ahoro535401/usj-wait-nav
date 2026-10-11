import assert from 'node:assert/strict';
import { generateKeyPairSync, createSign } from 'node:crypto';
import test from 'node:test';
import worker from '../src/index.js';

const host = 'https://crm.uniba-waittimes.com/';
const team = 'https://test.cloudflareaccess.com';
const aud = 'test-audience';
const email = 'owner@example.com';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const token = claims => {
  const input = `${b64({ alg: 'RS256', kid: 'test-key' })}.${b64({ iss: team, aud, email, exp: Math.floor(Date.now() / 1000) + 600, ...claims })}`;
  return `${input}.${createSign('RSA-SHA256').update(input).sign(privateKey).toString('base64url')}`;
};
const env = { ADMIN_EMAIL: email, TEAM_DOMAIN: team, POLICY_AUD: aud };
const req = (url = host, jwt) => new Request(url, { headers: jwt ? { 'Cf-Access-Jwt-Assertion': jwt } : {} });

test('admin denies requests without a signed Access token', async () => {
  const response = await worker.fetch(req(), env);
  assert.equal(response.status, 403);
  assert.match(response.headers.get('Cache-Control'), /no-store/);
});

test('admin denies a forged header and a token for another account or host', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ keys: [jwk] });
  try {
    assert.equal((await worker.fetch(req(host, 'abc.def.ghi'), env)).status, 403);
    assert.equal((await worker.fetch(req(host, token({ email: 'other@example.com' })), env)).status, 403);
    assert.equal((await worker.fetch(req(host, token({ aud: 'other-audience' })), env)).status, 403);
    assert.equal((await worker.fetch(req('https://elsewhere.example.com/', token({})), env)).status, 403);
  } finally { globalThis.fetch = originalFetch; }
});

test('signed owner token can view aggregate data without exposing raw user keys', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ keys: [jwk] });
  const fakeDb = { prepare(query) { return {
    bind() { return this; },
    async first() { return { n: 1 }; },
    async all() {
      if (query.includes('line_admin_follower_insights')) return { results: [] };
      if (query.includes('FROM (SELECT user_key')) return { results: [{ user_key: 'abcdef0123456789private', favorites_json: '[1,2]', visit_day: '2026-10-20', age_band: '20s', gender: 'woman', prefecture: '28', visit_frequency: 'monthly_1', annual_pass: 'standard', plan_updated: 1791600000, survey_updated: 1791600000 }] };
      return { results: [{ choice: '20s', n: 1 }] };
    },
  }; } };
  try {
    const response = await worker.fetch(req(host, token({})), { ...env, DB: fakeDb });
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(body, /アンケート回答者/);
    assert.match(body, /abcdef0123/);
    assert.doesNotMatch(body, /abcdef0123456789private/);
  } finally { globalThis.fetch = originalFetch; }
});
