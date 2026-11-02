# SQLite Local Database Documentation

## Tables

### `local_matches`
Stores completed match history on the mobile device for instant offline review and asynchronous cloud syncing.
- `id`: TEXT PRIMARY KEY
- `session_id`: TEXT NOT NULL
- `mode`: TEXT NOT NULL
- `variant`: TEXT NOT NULL
- `winner_id`: TEXT
- `winner_name`: TEXT
- `winning_team_id`: TEXT
- `is_draw`: INTEGER (0 or 1)
- `final_scores_json`: TEXT (serialized scores)
- `duration_seconds`: INTEGER
- `total_turns`: INTEGER
- `started_at`: TEXT (ISO 8601)
- `completed_at`: TEXT (ISO 8601)
- `is_synced`: INTEGER (0: pending, 1: synced)
- `sync_attempt_count`: INTEGER

### `pending_sync_queue`
Manages offline operations pending online synchronization when connectivity is restored.
- `id`: TEXT PRIMARY KEY
- `entity_type`: TEXT ('match_result' | 'user_profile' | 'stats')
- `entity_id`: TEXT
- `payload_json`: TEXT
- `retry_count`: INTEGER
- `last_attempt_at`: TEXT
- `error_message`: TEXT
- `created_at`: TEXT
