-- Production LINE survey. Store only the HMAC user key and the five consented choices.
CREATE TABLE IF NOT EXISTS line_survey_answers (
  user_key TEXT PRIMARY KEY,
  age_band TEXT NOT NULL,
  gender TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  visit_frequency TEXT NOT NULL,
  annual_pass TEXT NOT NULL,
  consented_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS line_survey_answers_expires_at ON line_survey_answers(expires_at);
