import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('.', import.meta.url));
const files = {
  '/index.html': 'index.html',
  '/privacy.html': 'privacy.html',
  '/events.json': 'events.json',
  '/closures.json': 'closures.json',
  '/robots.txt': 'robots.txt',
  '/sitemap.xml': 'sitemap.xml',
};
const assets = {};
for (const [route, name] of Object.entries(files)) {
  assets[route] = await readFile(join(base, 'public', name), 'utf8');
}
const preamble = `const EMBEDDED_ASSETS = ${JSON.stringify(assets)};\n` +
`function embeddedFetch(request) {
  const route = new URL(request.url).pathname;
  const body = EMBEDDED_ASSETS[route];
  if (body === undefined) return Promise.resolve(new Response('Not found', { status: 404 }));
  const type = route.endsWith('.json') ? 'application/json' : route.endsWith('.xml') ? 'application/xml' : route.endsWith('.txt') ? 'text/plain' : 'text/html';
  return Promise.resolve(new Response(body, { headers: { 'Content-Type': type + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } }));
}\n`;
const source = await readFile(join(base, 'src', 'index.js'), 'utf8');
await mkdir(join(base, 'dist'), { recursive: true });
await writeFile(join(base, 'dist', 'worker.js'), preamble + source, 'utf8');
console.log('Wrote dist/worker.js');
