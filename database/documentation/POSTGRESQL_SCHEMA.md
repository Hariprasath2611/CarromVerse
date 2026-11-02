# PostgreSQL Schema Documentation (Future Backend Store)

## Tables & Relations

### `users`
Central user registry for cloud services.
- `id` (VARCHAR 64, PK)
- `email` (VARCHAR 255, UNIQUE)
- `username` (VARCHAR 64, UNIQUE)
- `avatar_url` (TEXT)
- `level` (INTEGER)
- `xp` (INTEGER)
- `coins` (INTEGER)
- `gems` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### `matches`
Completed match records with foreign key referencing `users(id)`.
- `id` (VARCHAR 64, PK)
- `session_id` (VARCHAR 64)
- `mode` (VARCHAR 32)
- `variant` (VARCHAR 32)
- `winner_id` (VARCHAR 64, FK -> users.id)
- `winning_team_id` (VARCHAR 32)
- `is_draw` (BOOLEAN)
- `duration_seconds` (INTEGER)
- `total_turns` (INTEGER)
- `final_scores` (JSONB)
- `started_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

