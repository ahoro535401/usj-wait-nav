const day = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) {
  console.error('Usage: node scripts/check-public-show-schedule.mjs YYYY-MM-DD');
  process.exit(2);
}

const url = `https://uniba-waittimes.com/api/shows?date=${day}`;
const response = await fetch(url, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Show API HTTP ${response.status}`);
const data = await response.json();
const times = (data.shows || []).reduce((sum, show) => sum + (show.times || []).length, 0);
const checkedAt = Date.parse(data.checked_at || data.fetched_at);
if (data.day !== day || data.unavailable || !times || data.source !== 'USJ公式' ||
    data.stale || !Number.isFinite(checkedAt) || Date.now() - checkedAt > 8 * 3600 * 1000) {
  throw new Error(`${day}: official future show times unavailable (${data.reason || 'empty'}, ${times} times)`);
}
console.log(`${day}: ${data.shows.length} official shows, ${times} start times, checked ${data.checked_at || data.fetched_at}`);
