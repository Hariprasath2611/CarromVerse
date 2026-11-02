-- Initial seed data for PostgreSQL
INSERT INTO users (id, email, username, avatar_url, level, xp, coins, gems)
VALUES
  ('usr_seed_1', 'striker@carromverse.io', 'StrikerKing', '👑', 10, 5000, 50000, 200),
  ('usr_seed_2', 'tiger@carromverse.io', 'CarromMaster', '🐯', 8, 3800, 32000, 120)
ON CONFLICT (id) DO NOTHING;
