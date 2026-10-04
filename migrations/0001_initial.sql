CREATE TABLE IF NOT EXISTS snapshots (
  slot INTEGER PRIMARY KEY,
  captured_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ride_samples (
  slot INTEGER NOT NULL,
  ride_id INTEGER NOT NULL,
  wait_minutes INTEGER,
  is_open INTEGER NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (slot, ride_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS ride_samples_by_ride ON ride_samples (ride_id, slot);
CREATE TABLE IF NOT EXISTS park_days (
  day TEXT PRIMARY KEY,
  opens TEXT,
  closes TEXT,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) WITHOUT ROWID;
