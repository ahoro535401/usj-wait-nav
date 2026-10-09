-- 10/6〜8: public/fallback.json に残る2026-10-05取得のThemeParks.wiki公表予定。
-- 10/9: 2026-10-10に https://www.usj.co.jp/web/ja/jp/park-guide/schedule/park-hour2 で08:00〜22:00を確認。
INSERT INTO park_days (day,opens,closes,status,source,checked_at) VALUES
  ('2026-10-06','08:00','22:00','OPERATING','ThemeParks.wiki','2026-10-05T19:15:59.227Z'),
  ('2026-10-07','08:00','22:00','OPERATING','ThemeParks.wiki','2026-10-05T19:15:59.227Z'),
  ('2026-10-08','08:00','22:00','OPERATING','ThemeParks.wiki','2026-10-05T19:15:59.227Z'),
  ('2026-10-09','08:00','22:00','OPERATING','USJ公式','2026-10-10')
ON CONFLICT(day) DO UPDATE SET opens=excluded.opens,closes=excluded.closes,
  status=excluded.status,source=excluded.source,checked_at=excluded.checked_at;
