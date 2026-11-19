-- 2026-11-20、USJ公式営業時間カレンダーで11/30の変更を確認。
-- https://www.usj.co.jp/web/ja/jp/park-guide/schedule/park-hour2
INSERT INTO park_days (day,opens,closes,status,source,checked_at)
VALUES ('2026-11-30','09:00','20:30','OPERATING','USJ公式','2026-11-20')
ON CONFLICT(day) DO UPDATE SET opens=excluded.opens,closes=excluded.closes,
  status=excluded.status,source=excluded.source,checked_at=excluded.checked_at
WHERE park_days.checked_at IS NULL OR park_days.checked_at < excluded.checked_at;
