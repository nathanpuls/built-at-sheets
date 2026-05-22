INSERT INTO sites (username, sheet_url, sheet_id, hidden, active, created_at, updated_at)
VALUES
  ('built', 'Paste a public Google Sheet sharing URL here', 'The Sheet ID can go here', 1, 1, '2026-05-21T18:47:26.000Z', '2026-05-21T18:47:26.000Z'),
  ('test', 'https://docs.google.com/spreadsheets/d/102t_BkHXsSCLFgyKJma5l62bnngHUaI69fquUp6xnxs/edit?usp=sharing', '102t_BkHXsSCLFgyKJma5l62bnngHUaI69fquUp6xnxs', 0, 1, '2026-05-21T00:00:00.000Z', '2026-05-21T00:00:00.000Z'),
  ('test2', 'https://docs.google.com/spreadsheets/d/10AhZSNZLJFp5loodwUSgAHMURCweOXO7UM67kXmcqK8/edit?usp=sharing', '10AhZSNZLJFp5loodwUSgAHMURCweOXO7UM67kXmcqK8', 0, 1, '2026-05-21T00:00:00.000Z', '2026-05-21T00:00:00.000Z'),
  ('test3', 'https://docs.google.com/spreadsheets/d/1AEaNh_rONglIGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73Ps/edit?usp=sharing', '1AEaNh_rONglIGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73Ps', 0, 1, '2026-05-21T12:35:00.000Z', '2026-05-21T12:35:00.000Z'),
  ('curlcheck1779392713', 'https://docs.google.com/spreadsheets/d/1AEaNh_rONgIlGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73x0/edit?usp=sharing', '1AEaNh_rONgIlGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73x0', 0, 1, '2026-05-21T12:45:00.000Z', '2026-05-21T12:45:00.000Z'),
  ('cfcheck1779392713', 'https://docs.google.com/spreadsheets/d/1AEaNh_rONgIlGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73x0/edit?usp=sharing', '1AEaNh_rONgIlGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73x0', 0, 1, '2026-05-21T12:45:00.000Z', '2026-05-21T12:45:00.000Z'),
  ('test4', 'https://docs.google.com/spreadsheets/d/1AEaNh_rONglIGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73Ps/edit?usp=sharing', '1AEaNh_rONglIGEVZMhJY7m5iZfbJ7U7Y7NJ2nQA73Ps', 1, 1, '2026-05-21T17:49:20.000Z', '2026-05-21T17:49:20.000Z')
ON CONFLICT(username) DO UPDATE SET
  sheet_url = excluded.sheet_url,
  sheet_id = excluded.sheet_id,
  hidden = excluded.hidden,
  active = excluded.active,
  updated_at = excluded.updated_at;
