import { PlayerSeat } from '@carromverse/shared-types';
import { CandidateShot } from './ShotTypes.js';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface BotPersonality {
  id: string;
  name: string;
  difficulty: BotDifficulty;
  title: string;
  avatar: string;
  description: string;
  thinkingDelayMinMs: number;
  thinkingDelayMaxMs: number;
  aimingErrorMaxRad: number;
  powerVariation: number;
  candidateEvaluationBudget: number;
  maxCutAngleDeg: number;
  queenPrioritizationWeight: number;
  defenseWeight: number;
  foulAvoidanceWeight: number;
  allowBankShots: boolean;
}

export interface BotDecision {
  shot: CandidateShot;
  thinkingTimeMs: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
}

export interface PracticeSessionConfig {
  sessionId: string;
  humanPlayerName: string;
  humanAvatarUrl?: string;
  botDifficulty: BotDifficulty;
  boardTheme: string;
  targetPoints: number;
  turnTimeLimitSec: number;
  humanCoinAssignment?: 'white' | 'black';
  soundEnabled: boolean;
  soundVolume: number;
  startTime: number;
}

export interface PracticeDifficultyStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  totalShots: number;
  successfulPockets: number;
  missedShots: number;
  fouls: number;
  queenAttempts: number;
  queenSuccesses: number;
  totalDurationSeconds: number;
  highestScore: number;
}

export interface OverallPracticeStats {
  easy: PracticeDifficultyStats;
  medium: PracticeDifficultyStats;
  hard: PracticeDifficultyStats;
  lastPlayedAt: number;
}

