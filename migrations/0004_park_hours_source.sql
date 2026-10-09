ALTER TABLE park_days ADD COLUMN source TEXT NOT NULL DEFAULT 'ThemeParks.wiki';
ALTER TABLE park_days ADD COLUMN checked_at TEXT;
