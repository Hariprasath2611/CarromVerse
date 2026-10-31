import {
  Coin,
  CoinType,
  GameConfiguration,
  GameMode,
  GameVariant,
  Player,
  PlayerId,
  QueenStatus,
  TeamId,
} from '@carromverse/shared-types';

export interface WinEvaluationContext {
  players: Player[];
  scores: Record<PlayerId, { points: number; whiteCoinsPocketed: number; blackCoinsPocketed: number; queenPocketed: boolean }>;
  teamScores?: Record<TeamId, { points: number; whiteCoinsPocketed: number; blackCoinsPocketed: number; queenPocketed: boolean }>;
  coinsOnBoard: Coin[];
  queenStatus: QueenStatus;
  currentRound: number;
}

export interface WinEvaluationResult {
  hasWinner: boolean;
  winnerPlayerId?: PlayerId;
  winnerName?: string;
  winningTeamId?: TeamId;
  isDraw: boolean;
  reason?: string;
}

export interface RulesetOptions {
  mode: GameMode;
  variant: GameVariant;
  name: string;
  description: string;
  requiresQueenCover: boolean;
  whiteCoinPoints: number;
  blackCoinPoints: number;
  queenPoints: number;
  targetScore: number;
  maxRounds: number;
  foulPenaltyCoins: number;
  foulPenaltyPoints: number;
  allowStrictOpponentCoinFoul?: boolean;
}

export interface IRuleset {
  readonly mode: GameMode;
  readonly variant: GameVariant;
  readonly name: string;
  readonly description: string;
  readonly requiresQueenCover: boolean;
  readonly whiteCoinPoints: number;
  readonly blackCoinPoints: number;
  readonly queenPoints: number;
  readonly targetScore: number;
  readonly maxRounds: number;
  readonly foulPenaltyCoins: number;
  readonly foulPenaltyPoints: number;

  isAssignedCoin(player: Player, coinType: CoinType): boolean;
  isOpponentCoin(player: Player, coinType: CoinType): boolean;
  getPointsForCoin(coinType: CoinType): number;
  canCoverQueen(player: Player, queenPocketedByPlayerId?: PlayerId, queenPocketedByTeamId?: TeamId): boolean;
  evaluateWin(context: WinEvaluationContext): WinEvaluationResult;
}

