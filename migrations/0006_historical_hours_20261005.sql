-- 10/5の公表営業時間08:30〜21:30を過去日データに補完。
INSERT INTO park_days (day,opens,closes,status,source,checked_at) VALUES
  ('2026-10-05','08:30','21:30','OPERATING','過去日補完','2026-10-10')
ON CONFLICT(day) DO UPDATE SET opens=excluded.opens,closes=excluded.closes,
  status=excluded.status,source=excluded.source,checked_at=excluded.checked_at;
