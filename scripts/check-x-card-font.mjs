import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const font = await readFile(new URL('../public/x-card-font-v2.ttf', import.meta.url));
const tableCount = font.readUInt16BE(4);
let cmapOffset;
for (let i = 0; i < tableCount; i++) {
  const record = 12 + i * 16;
  if (font.toString('ascii', record, record + 4) === 'cmap') {
    cmapOffset = font.readUInt32BE(record + 8);
    break;
  }
}
if (cmapOffset == null) throw new Error('X card font has no cmap table');
let format4;
const encodingCount = font.readUInt16BE(cmapOffset + 2);
for (let i = 0; i < encodingCount; i++) {
  const record = cmapOffset + 4 + i * 8;
  const platform = font.readUInt16BE(record);
  const encoding = font.readUInt16BE(record + 2);
  const subtable = cmapOffset + font.readUInt32BE(record + 4);
  if (platform === 3 && encoding === 1 && font.readUInt16BE(subtable) === 4) {
    format4 = subtable;
    break;
  }
}
if (format4 == null) throw new Error('X card font has no Windows Unicode BMP cmap');
const segments = font.readUInt16BE(format4 + 6) / 2;
const ends = format4 + 14;
const starts = ends + segments * 2 + 2;
const deltas = starts + segments * 2;
const offsets = deltas + segments * 2;
function hasGlyph(character) {
  const code = character.codePointAt(0);
  if (code > 0xffff) return false;
  for (let i = 0; i < segments; i++) {
    const end = font.readUInt16BE(ends + i * 2);
    if (code > end) continue;
    const start = font.readUInt16BE(starts + i * 2);
    if (code < start) return false;
    const delta = font.readInt16BE(deltas + i * 2);
    const range = font.readUInt16BE(offsets + i * 2);
    if (range === 0) return ((code + delta) & 0xffff) !== 0;
    const position = offsets + i * 2 + range + (code - start) * 2;
    const glyph = font.readUInt16BE(position);
    return glyph !== 0 && ((glyph + delta) & 0xffff) !== 0;
  }
  return false;
}

const source = (await readFile(new URL('../src/index.js', import.meta.url), 'utf8'))
  .replace('export default {', 'globalThis.__worker = {');
const context = vm.createContext({ console, URL, Request, Response, AbortSignal, fetch });
vm.runInContext(source, context, { filename: 'src/index.js' });
const data = {
  average_wait: 55,
  last_at: Date.parse('2026-10-15T22:00:00+09:00') / 1000,
  hours: [
    { at: Date.parse('2026-10-15T09:00:00+09:00') / 1000, snapshots: 3, ride_count: 15, average_wait: 20 },
    { at: Date.parse('2026-10-15T17:00:00+09:00') / 1000, snapshots: 3, ride_count: 15, average_wait: 70 },
  ],
};
const cards = [
  context.xDailyCardPayload('2026-10-15', data, true),
  context.xDailyCardPayload('2026-10-15', data, false),
  context.englishDailyCardPayload('2026-10-15', data, true),
  context.englishDailyCardPayload('2026-10-15', data, false),
];
const shortNames = [...vm.runInContext('X_CARD_SHORT_NAMES.values()', context)];
const renderedText = [
  ...cards.flatMap(card => [card.label, card.title, card.subtitle || '',
    ...card.rows.flatMap(row => [row.name, `${row.wait}分`, `${row.wait} min`])]),
  ...shortNames, '現在の待ち時間 上位3施設', '20分前より短縮・増加',
];
const missing = [...new Set(renderedText.join(''))]
  .filter(character => !/\s/u.test(character) && !hasGlyph(character));
if (missing.length) throw new Error(`X card font is missing glyphs: ${missing.join(' ')}`);
console.log(`X card font covers ${renderedText.length} rendered text samples, including 昨日 and daily dates.`);
