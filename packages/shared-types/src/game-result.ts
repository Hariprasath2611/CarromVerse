import { GameMode, GameVariant } from './game-mode.js';
import { PlayerId, TeamId } from './player.js';
import { GameScore } from './score.js';

export interface GameResult {
  id: string;
  sessionId: string;
  mode: GameMode;
  variant: GameVariant;
  winnerId?: PlayerId;
  winnerName?: string;
  winningTeamId?: TeamId;
  isDraw: boolean;
  finalScores: Record<PlayerId, GameScore>;
  durationSeconds: number;
  totalTurns: number;
  startedAt: string;     // ISO timestamp
  completedAt: string;   // ISO timestamp
  isSynced: boolean;
  syncAttemptCount: number;
}
