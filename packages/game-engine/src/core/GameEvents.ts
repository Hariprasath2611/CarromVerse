/**
 * CarromVerse - Game Events Catalog
 */

export const GAME_EVENTS = {
  ENGINE_READY: 'carrom:engine_ready',
  BOARD_RENDERED: 'carrom:board_rendered',
  THEME_CHANGED: 'carrom:theme_changed',
  STRIKER_SKIN_CHANGED: 'carrom:striker_skin_changed',
  STRIKER_MOVED: 'carrom:striker_moved',
  COIN_CLICKED: 'carrom:coin_clicked',
  BOARD_RESET: 'carrom:board_reset',
  ENGINE_PAUSED: 'carrom:engine_paused',
  ENGINE_RESUMED: 'carrom:engine_resumed',
} as const;
