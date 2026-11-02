INSERT OR IGNORE INTO local_matches (
  id, session_id, mode, variant, winner_id, winner_name, winning_team_id, is_draw,
  final_scores_json, duration_seconds, total_turns, started_at, completed_at, is_synced, sync_attempt_count
) VALUES (
  'match_sample_001',
  'sess_sample_001',
  'two_player_individual',
  'standard',
  'player_0',
  'Player 1',
  NULL,
  0,
  '{"player_0":{"points":25,"coinsBanked":5,"foulsCommitted":0},"player_2":{"points":15,"coinsBanked":3,"foulsCommitted":1}}',
  240,
  14,
  '2026-11-01T12:00:00.000Z',
  '2026-11-01T12:04:00.000Z',
  1,
  1
);
