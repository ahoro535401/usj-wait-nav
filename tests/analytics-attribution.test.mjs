import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const planHtml = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const analyticsScript = await readFile(new URL('../public/analytics.js', import.meta.url), 'utf8');

test('opening a linked archive date retains its X campaign through history changes', () => {
  const helper = planHtml.match(/function replacePlanHistory\(day\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(helper, 'the archive URL helper must exist');
  let current = new URL('https://uniba-waittimes.com/plan?date=2026-10-21&utm_source=x&utm_medium=social&utm_campaign=daily_recap&private=discard');
  const context = {
    URL, URLSearchParams,
    get location() { return current; },
    history: { replaceState(_state, _title, path) { current = new URL(path, current); } },
  };
  vm.runInNewContext(`${helper}\nreplacePlanHistory('2026-10-21');`, context);
  assert.equal(current.pathname, '/plan');
  assert.equal(current.searchParams.get('date'), '2026-10-21');
  assert.equal(current.searchParams.get('utm_campaign'), 'daily_recap');
  assert.equal(current.searchParams.get('utm_source'), 'x');
  assert.equal(current.searchParams.has('private'), false);
  vm.runInNewContext(`${helper}\nreplacePlanHistory();`, context);
  assert.equal(current.searchParams.has('date'), false);
  assert.equal(current.searchParams.get('utm_campaign'), 'daily_recap');

  current = new URL('https://uniba-waittimes.com/liff/plan?date=2026-10-21&utm_source=line&utm_campaign=oa_navigation');
  vm.runInNewContext(`${helper}\nreplacePlanHistory('2026-10-20');`, context);
  assert.equal(current.pathname, '/liff/plan');
  assert.equal(current.searchParams.get('date'), '2026-10-20');
  assert.equal(current.searchParams.get('utm_campaign'), 'oa_navigation');
});

function analyticsContext(pagePath, consent = 'granted', operator = false) {
  const listeners = new Map();
  const values = new Map([
    ['usj-wait-nav:analytics-consent', consent],
    ['usj-wait-nav:demographics-consent', 'denied'],
    ['usj-wait-nav:analytics-operator', operator ? '1' : null],
  ]);
  const window = {};
  const location = new URL(`https://uniba-waittimes.com${pagePath}`);
  const document = {
    readyState: 'complete', documentElement: { lang: pagePath.startsWith('/en/') ? 'en' : 'ja' },
    head: { appendChild() {} },
    createElement() { return {}; },
    addEventListener(name, callback) { listeners.set(name, callback); },
  };
  vm.runInNewContext(analyticsScript, {
    window, document, location, URL,
    localStorage: { getItem(key) { return values.get(key) ?? null; } },
  });
  return { window, listeners };
}

test('facility link event records the entry page only after analytics consent', () => {
  const { window, listeners } = analyticsContext('/plan?date=2026-10-21&utm_campaign=daily_recap');
  const link = { href: 'https://uniba-waittimes.com/attraction/jaws' };
  listeners.get('click')({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  const event = Array.from(window.dataLayer.at(-1));
  assert.equal(event[0], 'event');
  assert.equal(event[1], 'attraction_link_click');
  assert.equal(event[2].entry_page, 'plan');

  const denied = analyticsContext('/plan', 'denied');
  denied.listeners.get('click')({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  assert.equal(denied.window.dataLayer, undefined);
});

test('operator visits remain marked and English links use the English entry page', () => {
  const { window, listeners } = analyticsContext('/en/', 'granted', true);
  const config = Array.from(window.dataLayer.find(command => command[0] === 'config'));
  assert.equal(config[2].user_properties.site_role, 'operator');
  listeners.get('click')({ target: { closest(selector) {
    return selector === 'a[href]' ? { href: 'https://uniba-waittimes.com/en/attraction/jaws' } : null;
  } } });
  const event = Array.from(window.dataLayer.at(-1));
  assert.equal(event[2].entry_page, 'en_today');
});
