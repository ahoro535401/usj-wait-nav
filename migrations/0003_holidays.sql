CREATE TABLE IF NOT EXISTS holidays (
  day TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('national', 'substitute', 'citizens')),
  source TEXT NOT NULL CHECK (source IN ('cao', 'holidays-jp')),
  updated_at INTEGER NOT NULL
) WITHOUT ROWID;
