import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PARK_ID = '47f61fac-7586-41ac-ae80-61c9257cf33e';
const url = `https://api.themeparks.wiki/v1/entity/${PARK_ID}/children`;
const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'USJWaitNav/1.0' } });
if (!response.ok) throw new Error(`ThemeParks.wiki children: HTTP ${response.status}`);
const raw = await response.json();
const children = Array.isArray(raw.children) ? raw.children : [];
const valid = item => {
  const latitude = Number(item.location?.latitude);
  const longitude = Number(item.location?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude > 34.65 && latitude < 34.68 && longitude > 135.42 && longitude < 135.45;
};
const locations = children.filter(item =>
  ['ATTRACTION', 'RESTAURANT'].includes(item.entityType) &&
  typeof item.externalId === 'string' && typeof item.name === 'string' && valid(item)
).map(item => ({
  key: item.externalId,
  name: item.name,
  type: item.entityType,
  lat: Number(item.location.latitude),
  lng: Number(item.location.longitude),
}));
const restaurants = locations.filter(item => item.type === 'RESTAURANT').length;
const attractions = locations.filter(item => item.type === 'ATTRACTION').length;
if (restaurants < 35 || attractions < 35) throw new Error(`Incomplete locations: ${attractions} attractions, ${restaurants} restaurants`);
const target = fileURLToPath(new URL('../public/map-locations.json', import.meta.url));
await writeFile(target, JSON.stringify({ source: 'ThemeParks.wiki', fetched_at: new Date().toISOString(), locations }, null, 2) + '\n', 'utf8');
console.log(`Saved ${attractions} attraction and ${restaurants} restaurant locations to ${target}`);
