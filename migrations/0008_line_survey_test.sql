-- Test-only, opt-in LINE survey. user_key is the existing HMAC of the LINE user ID.
-- Never store the raw LINE ID, token, name, email, location, or individual response history.
CREATE TABLE IF NOT EXISTS line_survey_answers (
  user_key TEXT PRIMARY KEY,
  age_band TEXT,
  region TEXT,
  visit_frequency TEXT,
  consented_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS line_survey_answers_expires_at ON line_survey_answers(expires_at);
