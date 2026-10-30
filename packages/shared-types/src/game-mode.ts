/**
 * Game modes and rules variations supported in CarromVerse.
 */

export type PlayerCount = 1 | 2 | 3 | 4;

export type GameMode =
  | 'two_player_individual'
  | 'three_player_individual'
  | 'four_player_individual'
  | 'four_player_team'
  | 'practice';

export type GameVariant =
  | 'classic_carrom'   // White (10), Black (5), Queen (25 with cover)
  | 'points_carrom'    // First to reach target score (e.g., 25 or 29 points)
  | 'freestyle_carrom'; // Any coin gives points (Black=1, White=2, Queen=3)

export interface GameModeDefinition {
  mode: GameMode;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  isTeamBased: boolean;
  requiresQueenCover: boolean;
  defaultCoins: {
    white: number;
    black: number;
    queen: number;
  };
}
