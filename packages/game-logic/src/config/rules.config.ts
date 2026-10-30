import { GameConfiguration, GameMode, GameModeDefinition } from '@carromverse/shared-types';
import { DEFAULT_BOARD_DIMENSIONS } from './board.config.js';

export const GAME_MODE_DEFINITIONS: Record<GameMode, GameModeDefinition> = {
  two_player_individual: {
    mode: 'two_player_individual',
    name: '2-Player Duel',
    description: 'Head-to-head classic carrom match between 2 players seated opposite each other.',
    minPlayers: 2,
    maxPlayers: 2,
    isTeamBased: false,
    requiresQueenCover: true,
    defaultCoins: { white: 9, black: 9, queen: 1 },
  },
  three_player_individual: {
    mode: 'three_player_individual',
    name: '3-Player Free-for-All',
    description: 'Every player for themselves. Points carrom mode where all coins carry points.',
    minPlayers: 3,
    maxPlayers: 3,
    isTeamBased: false,
    requiresQueenCover: false,
    defaultCoins: { white: 9, black: 9, queen: 1 },
  },
  four_player_individual: {
    mode: 'four_player_individual',
    name: '4-Player Free-for-All',
    description: 'Four players competing individually around all four baselines.',
    minPlayers: 4,
    maxPlayers: 4,
    isTeamBased: false,
    requiresQueenCover: false,
    defaultCoins: { white: 9, black: 9, queen: 1 },
  },
  four_player_team: {
    mode: 'four_player_team',
    name: '4-Player Doubles (2 vs 2)',
    description: 'Partners sit opposite each other (Team A vs Team B). Shared score and team strategy.',
    minPlayers: 4,
    maxPlayers: 4,
    isTeamBased: true,
    requiresQueenCover: true,
    defaultCoins: { white: 9, black: 9, queen: 1 },
  },
  practice: {
    mode: 'practice',
    name: 'Solo Practice',
    description: 'Free solo board play with unlimited turns to perfect shots, cuts, and rebounds.',
    minPlayers: 1,
    maxPlayers: 1,
    isTeamBased: false,
    requiresQueenCover: false,
    defaultCoins: { white: 9, black: 9, queen: 1 },
  },
};

export function createDefaultGameConfig(mode: GameMode): GameConfiguration {
  const def = GAME_MODE_DEFINITIONS[mode];
  return {
    id: `config_${mode}`,
    mode,
    variant: def.isTeamBased || mode === 'two_player_individual' ? 'classic_carrom' : 'points_carrom',
    targetScore: mode === 'two_player_individual' || mode === 'four_player_team' ? 25 : 50,
    turnTimeLimitSeconds: 25,
    maxRounds: 8,
    foulPenaltyCoins: 1,
    whiteCoinPoints: 10,
    blackCoinPoints: 5,
    queenPoints: 25,
    queenCoverRequired: def.requiresQueenCover,
    allowSuicideFoulPenalty: true,
    boardDimensions: DEFAULT_BOARD_DIMENSIONS,
  };
}
