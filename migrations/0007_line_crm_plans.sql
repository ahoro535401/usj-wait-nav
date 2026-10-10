-- Optional LIFF My Plan. The key is an HMAC of the provider-scoped LINE user ID.
-- No raw LINE user ID, token, name, email, or location is stored here.
CREATE TABLE IF NOT EXISTS line_crm_plans (
  user_key TEXT PRIMARY KEY,
  favorites_json TEXT NOT NULL DEFAULT '[]',
  visit_day TEXT,
  consented_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS line_crm_plans_expires_at ON line_crm_plans (expires_at);
