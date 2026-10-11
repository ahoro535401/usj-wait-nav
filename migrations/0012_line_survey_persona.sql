-- Preserve existing five-question answers; new questions remain unanswered until renewed consent.
ALTER TABLE line_survey_answers ADD COLUMN usual_party TEXT;
ALTER TABLE line_survey_answers ADD COLUMN experience_priorities_json TEXT;
ALTER TABLE line_survey_answers ADD COLUMN information_goal TEXT;
