import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../public/index.html', import.meta.url));
const target = fileURLToPath(new URL('../src/ride-names.js', import.meta.url));
const html = readFileSync(source, 'utf8');
const block = html.match(/const japaneseNames = new Map\(\[([\s\S]*?)\]\);/)?.[1];
if (!block) throw new Error('公開サイトの施設名一覧が見つかりません');
const names = [...block.matchAll(/\[(\d+), '([^']+)'\]/g)].map(([, id, name]) => [Number(id), name]);
const expectedEntries = [...block.matchAll(/\[\d+,\s*'/g)].length;
if (names.length < 20 || names.length !== expectedEntries || new Set(names.map(([id]) => id)).size !== names.length) {
  throw new Error('施設名一覧が不完全または重複しています');
}
writeFileSync(target, `// Generated from public/index.html by admin-crm/scripts/sync-ride-names.mjs.\nexport const rideNames = new Map(${JSON.stringify(names, null, 2)});\n`);
console.log(`${names.length}施設の表示名を公開サイトから同期しました`);
