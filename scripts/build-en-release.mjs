import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
process.env.INCLUDE_EN = '1';
await import('../build.mjs');

const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
await mkdir(new URL('../dist/en-release/', import.meta.url), { recursive: true });
await copyFile(new URL('../dist/worker.js', import.meta.url),
  new URL('../dist/en-release/worker.js', import.meta.url));
config.main = './worker.js';
config.assets.directory = '../../public';
config.vars.EN_PUBLIC_ENABLED = 'true';
config.vars.EN_X_AUTOPOST_ENABLED = 'true';
await writeFile(new URL('../dist/en-release/wrangler.jsonc', import.meta.url),
  JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log('Wrote dist/en-release/worker.js and wrangler.jsonc; English X auto-posting enabled.');
