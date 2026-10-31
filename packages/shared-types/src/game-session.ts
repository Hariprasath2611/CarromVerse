import { Coin } from './coin.js';
import { GameConfiguration } from './game-configuration.js';
import { GameResult } from './game-result.js';
import { Player, PlayerId } from './player.js';
import { GameScore } from './score.js';
import { Striker } from './striker.js';
import { PlayerTurn } from './turn.js';

export type GameSessionStatus =
  | 'idle'
  | 'configuring'
  | 'in_progress'
  | 'paused'
  | 'round_end'
  | 'match_end'
  | 'abandoned';

export type OfflineMatchStatus =
  | 'CREATED'
  | 'CONFIGURING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PLAYER_HANDOVER'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ABANDONED';

export type QueenStatus =
  | 'unpocketed'
  | 'pending_cover'     // Queen pocketed, must pocket a cover coin next
  | 'covered'           // Queen successfully covered and retained
  | 'returned_to_board'; // Failed cover, placed back in center

export const QueenState = {
  QUEEN_ON_BOARD: 'unpocketed' as QueenStatus,
  QUEEN_PENDING_COVER: 'pending_cover' as QueenStatus,
  QUEEN_COVERED: 'covered' as QueenStatus,
  QUEEN_RETURNED: 'returned_to_board' as QueenStatus,
} as const;

export interface GameSession {
  id: string;
  config: GameConfiguration;
  players: Player[];
  status: GameSessionStatus;
  currentTurn: PlayerTurn;
  scores: Record<PlayerId, GameScore>;
  coins: Coin[];
  striker: Striker;
  queenStatus: QueenStatus;
  queenPocketedByPlayerId?: PlayerId;
  winnerPlayerId?: PlayerId;
  result?: GameResult;
  roundNumber: number;
  createdAt: number;
  updatedAt: number;
}
