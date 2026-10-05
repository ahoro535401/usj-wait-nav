CREATE TABLE IF NOT EXISTS weather_days (
  day TEXT PRIMARY KEY,
  temp_max REAL,
  temp_min REAL,
  precip_total REAL NOT NULL,
  precip_daytime REAL NOT NULL,
  sun_hours REAL NOT NULL,
  coverage REAL NOT NULL,
  updated_at INTEGER NOT NULL
) WITHOUT ROWID;
