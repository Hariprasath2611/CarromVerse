export const ROUTES = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  GAME_MODE: '/game-mode',
  GAME_CONFIG: '/game-config',
  PLAYER_SELECTION: '/player-selection',
  LOBBY: '/lobby',
  GAME_BOARD: '/game-board',
  GAME_RESULT: '/game-result',
  MATCH_HISTORY: '/match-history',
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  SETTINGS: '/settings',
  TABS: {
    HOME: '/(tabs)',
    CUSTOMIZE: '/(tabs)/customize',
    FRIENDS: '/(tabs)/friends',
    LEADERBOARD: '/(tabs)/leaderboard',
    PROFILE: '/(tabs)/profile',
  },
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

