/**
 * Screen module registry and screen-level composition components.
 * Route endpoints are managed by Expo Router under `apps/frontend/app/`.
 */
export const SCREEN_NAMES = {
  HOME: 'Home Dashboard',
  GAME_MODE: 'Game Mode Selection',
  GAME_CONFIG: 'Game Configuration',
  PLAYER_SELECTION: 'Player Selection & Seat Assignment',
  LOBBY: 'Game Lobby',
  GAME_BOARD: 'Interactive Carrom Board',
  GAME_RESULT: 'Match Results & Victory',
  MATCH_HISTORY: 'Local & Online Match History',
} as const;

