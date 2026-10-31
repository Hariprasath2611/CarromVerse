import { GameMode, GameVariant } from './game-mode.js';

/**
 * Geometric specifications for the standard Carrom board.
 * All units are in millimeters or normalized game units.
 */
export interface BoardDimensions {
  boardSize: number;           // Standard inner playing area size: e.g., 740mm
  frameWidth: number;          // Outer wooden frame: e.g., 75mm
  totalSize: number;           // boardSize + 2 * frameWidth
  pocketRadius: number;        // Pocket radius: ~22.5mm
  pocketCutoutRadius: number;  // Visual hole radius
  pocketOffset: number;        // Corner offset distance
  centerCircleRadius: number;  // Center circle radius: 15.9mm
  outerCircleRadius: number;   // Outer circle radius: ~105mm
  baselineOffset: number;      // Distance from inner frame to baseline: 101.5mm
  baselineLength: number;      // Baseline length: ~470mm
  baselineCircleRadius: number;// Base circle at ends of baseline: ~15.8mm
  strikerRadius: number;       // Striker radius: ~20.6mm
  coinRadius: number;          // Coin/carrom-man radius: ~15.9mm
}

/**
 * Complete runtime configuration for a game session.
 */
export interface GameConfiguration {
  id: string;
  mode: GameMode;
  variant: GameVariant;
  targetScore: number;
  turnTimeLimitSeconds: number;
  maxRounds: number;
  foulPenaltyCoins: number;
  whiteCoinPoints: number;
  blackCoinPoints: number;
  queenPoints: number;
  queenCoverRequired: boolean;
  allowSuicideFoulPenalty: boolean;
  boardDimensions: BoardDimensions;
  handoverConfirmationEnabled?: boolean;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  boardTheme?: string;
  teamNames?: { team_a: string; team_b: string };
}
