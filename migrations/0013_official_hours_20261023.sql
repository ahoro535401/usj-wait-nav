-- 2026-10-23にUSJ公式営業時間カレンダーで確認。
-- https://www.usj.co.jp/web/ja/jp/park-guide/schedule/park-hour
-- 11/15は提供元の旧時刻を訂正。11/23〜30は取得範囲外の日付を補完。
INSERT INTO park_days (day,opens,closes,status,source,checked_at) VALUES
  ('2026-11-15','08:00','22:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-23','09:00','20:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-24','09:00','22:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-25','09:00','21:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-26','08:30','21:30','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-27','08:30','19:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-28','08:30','22:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-29','08:30','22:00','OPERATING','USJ公式','2026-10-23'),
  ('2026-11-30','08:30','22:00','OPERATING','USJ公式','2026-10-23')
ON CONFLICT(day) DO UPDATE SET opens=excluded.opens,closes=excluded.closes,
  status=excluded.status,source=excluded.source,checked_at=excluded.checked_at;

-- 旧Workerや取得元の短い予定表が公式確認値を上書き・削除しないための保護。
-- 公式の後続変更は source='USJ公式' の更新で反映できる。
CREATE TRIGGER IF NOT EXISTS protect_official_hours_20261023_update
BEFORE UPDATE ON park_days
WHEN OLD.source='USJ公式'
  AND (OLD.day='2026-11-15' OR OLD.day BETWEEN '2026-11-23' AND '2026-11-30')
  AND NEW.source!='USJ公式'
BEGIN
  SELECT RAISE(IGNORE);
END;

CREATE TRIGGER IF NOT EXISTS protect_official_hours_20261023_delete
BEFORE DELETE ON park_days
WHEN OLD.source='USJ公式'
  AND (OLD.day='2026-11-15' OR OLD.day BETWEEN '2026-11-23' AND '2026-11-30')
BEGIN
  SELECT RAISE(IGNORE);
END;
