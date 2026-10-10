import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async path => readFile(resolve(root, path), 'utf8');
const json = async path => JSON.parse(await read(path));
const errors = [];
const japanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const requireEnglish = (value, label) => {
  if (typeof value !== 'string' || !value.trim() || japanese.test(value))
    errors.push(`${label}: English text is missing or still Japanese`);
};
const extract = (source, pattern, label) => {
  const match = source.match(pattern);
  if (!match) { errors.push(`${label}: source definition was not found`); return null; }
  return Function(`return (${match[1]})`)();
};

const [events, closures, shows, worker, english] = await Promise.all([
  json('public/events.json'), json('public/closures.json'), json('public/show-translations.json'),
  read('src/index.js'), read('preview/en/index.html'),
]);
for (const [label, data] of [['events', events.events], ['closures', closures.closures]]) {
  if (!Array.isArray(data)) { errors.push(`${label}: expected an array`); continue; }
  const seen = new Set();
  for (const item of data) {
    if (!item.title || seen.has(item.title)) errors.push(`${label}: missing or duplicate Japanese title ${item.title}`);
    seen.add(item.title);
    requireEnglish(item.title_en, `${label} / ${item.title}`);
    if (item.time_note) requireEnglish(item.time_note_en, `${label} / ${item.title} / time_note`);
    if (item.end_note) requireEnglish(item.end_note_en, `${label} / ${item.title} / end_note`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.start || '')) errors.push(`${label} / ${item.title}: invalid start date`);
    if (item.end && item.end < item.start) errors.push(`${label} / ${item.title}: end date precedes start date`);
  }
}
const japaneseShowNames = extract(worker, /const SHOW_NAMES = (\{[\s\S]*?\});/, 'SHOW_NAMES');
if (japaneseShowNames) {
  for (const name of new Set(Object.values(japaneseShowNames))) requireEnglish(shows[name], `show / ${name}`);
}
if (!english.includes('window.USJ_SHOW_TRANSLATIONS') || !english.includes('item.title_en'))
  errors.push('English page does not consume the shared show or event translations');

// Special seasonal attraction names must stay aligned between the English page and X posts.
const browserRides = extract(english, /const rideNames = new Map\((\[[\s\S]*?\])\);/, 'English rideNames');
const xRides = extract(worker, /const EN_X_RIDE_NAMES = new Map\((\[[\s\S]*?\])\);/, 'EN_X_RIDE_NAMES');
if (browserRides && xRides) {
  const web = new Map(browserRides), x = new Map(xRides);
  for (const id of new Set([...web.keys(), ...x.keys()])) {
    requireEnglish(web.get(id), `English page / attraction ${id}`);
    requireEnglish(x.get(id), `English X / attraction ${id}`);
  }
}

if (errors.length) {
  console.error(`Bilingual content check failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Bilingual content check passed: ${events.events.length} events, ${closures.closures.length} closures, ${Object.keys(japaneseShowNames).length} show IDs and ${browserRides.length} seasonal ride names.`);
}
