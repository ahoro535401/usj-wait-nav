import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('.', import.meta.url));
// 位置データの生JSONを公開リポジトリへ再配布しない。未生成時だけAPIから作成する。
try { await readFile(join(base, 'public', 'map-locations.json')); }
catch { await import('./scripts/sync-map-locations.mjs'); }
const files = {
  '/index.html': 'index.html',
  '/en/index.html': 'en/index.html',
  '/map.html': 'map.html',
  '/vote.html': 'vote.html',
  '/map-locations.json': 'map-locations.json',
  '/privacy.html': 'privacy.html',
  '/install.html': 'install.html',
  '/analytics.js': 'analytics.js',
  '/events.json': 'events.json',
  '/closures.json': 'closures.json',
  '/pass-exclusions.json': 'pass-exclusions.json',
  '/ticket-prices.json': 'ticket-prices.json',
  '/robots.txt': 'robots.txt',
  '/sitemap.xml': 'sitemap.xml',
  '/manifest.webmanifest': 'manifest.webmanifest',
  '/fallback.json': 'fallback.json',
};
// The English page is an unpublished prototype. Include it only for local review.
if (process.env.INCLUDE_EN !== '1') delete files['/en/index.html'];
const assets = {};
for (const [route, name] of Object.entries(files)) {
  assets[route] = await readFile(join(base, 'public', name), 'utf8');
}
// The API deployment path uses embedded assets when no ASSETS binding is present.
// Binary files must be base64 encoded instead of being read as UTF-8 text.
const binaryFiles = {
  '/og.png': 'og.png',
  '/og-photo.jpg': 'og-photo.jpg',
  '/og-photo-labeled.jpg': 'og-photo-labeled.jpg',
  '/poll-campaign-1.jpg': 'poll-campaign-1.jpg',
  '/poll-campaign-2.jpg': 'poll-campaign-2.jpg',
  '/poll-campaign-3.jpg': 'poll-campaign-3.jpg',
  '/poll-campaign-4.jpg': 'poll-campaign-4.jpg',
  '/park-map.jpg': 'park-map.jpg',
  '/favicon.ico': 'favicon.ico',
  '/apple-touch-icon.png': 'apple-touch-icon.png',
  '/icon-192.png': 'icon-192.png',
  '/icon-512.png': 'icon-512.png',
  '/icon-maskable-512.png': 'icon-maskable-512.png',
  '/icon-512.jpg': 'icon-512.jpg',
  '/icon-maskable-512.jpg': 'icon-maskable-512.jpg',
};
const binaryAssets = {};
for (const [route, name] of Object.entries(binaryFiles)) {
  binaryAssets[route] = (await readFile(join(base, 'public', name))).toString('base64');
}
const preamble = `const EMBEDDED_ASSETS = ${JSON.stringify(assets)};\n` +
`const FALLBACK_DATA = JSON.parse(EMBEDDED_ASSETS['/fallback.json']);\n` +
`const EMBEDDED_BINARY_ASSETS = ${JSON.stringify(binaryAssets)};\n` +
`function embeddedFetch(request) {
  const route = new URL(request.url).pathname;
  const binary = EMBEDDED_BINARY_ASSETS[route];
  if (binary !== undefined) {
    const body = Uint8Array.from(atob(binary), character => character.charCodeAt(0));
    const type = route.endsWith('.ico') ? 'image/x-icon' : route.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    return Promise.resolve(new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } }));
  }
  const body = EMBEDDED_ASSETS[route];
  if (body === undefined) return Promise.resolve(new Response('Not found', { status: 404 }));
  const type = route.endsWith('.json') ? 'application/json' : route.endsWith('.webmanifest') ? 'application/manifest+json' : route.endsWith('.xml') ? 'application/xml' : route.endsWith('.txt') ? 'text/plain' : route.endsWith('.js') ? 'text/javascript' : 'text/html';
  return Promise.resolve(new Response(body, { headers: { 'Content-Type': type + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } }));
}\n`;
const source = await readFile(join(base, 'src', 'index.js'), 'utf8');
await mkdir(join(base, 'dist'), { recursive: true });
await writeFile(join(base, 'dist', 'worker.js'), preamble + source, 'utf8');
console.log('Wrote dist/worker.js');
