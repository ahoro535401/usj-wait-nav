-- Official LINE account aggregate insight only. No raw LINE IDs or message text.
CREATE TABLE IF NOT EXISTS line_admin_follower_insights (
  day TEXT PRIMARY KEY,
  followers INTEGER NOT NULL,
  blocks INTEGER NOT NULL,
  targeted_reaches INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL
) WITHOUT ROWID;
