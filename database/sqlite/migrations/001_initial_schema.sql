-- Migration 001: Initial Local SQLite Storage for Match Records & Sync Queue
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS local_matches (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  variant TEXT NOT NULL,
  winner_id TEXT,
  winner_name TEXT,
  winning_team_id TEXT,
  is_draw INTEGER NOT NULL DEFAULT 0,
  final_scores_json TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_turns INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  is_synced INTEGER NOT NULL DEFAULT 0,
  sync_attempt_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pending_sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL
);

