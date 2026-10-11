-- Test-only survey expansion. Preserve existing answers; old region remains for legacy rows.
ALTER TABLE line_survey_answers ADD COLUMN prefecture TEXT;
ALTER TABLE line_survey_answers ADD COLUMN annual_pass TEXT;
