import {
  GameConfiguration,
  GameResult,
  GameScore,
  Player,
  PlayerId,
  TeamId,
} from '@carromverse/shared-types';
import { generateUUID } from '@carromverse/shared-utils';
import { IRuleset, WinEvaluationContext, WinEvaluationResult } from '../rulesets/Ruleset.js';

export interface CreateGameResultInput {
  sessionId: string;
  config: GameConfiguration;
  winResult: WinEvaluationResult;
  players: Player[];
  finalScores: Record<PlayerId, GameScore>;
  totalTurns: number;
  startedAt: string;
}

export class WinConditionManager {
  private ruleset: IRuleset;

  constructor(ruleset: IRuleset) {
    this.ruleset = ruleset;
  }

  public checkWinCondition(context: WinEvaluationContext): WinEvaluationResult {
    return this.ruleset.evaluateWin(context);
  }

  public createGameResult(input: CreateGameResultInput): GameResult {
    const { sessionId, config, winResult, finalScores, totalTurns, startedAt } = input;
    const now = new Date();
    const startTime = new Date(startedAt).getTime();
    const durationSeconds = Math.max(1, Math.round((now.getTime() - startTime) / 1000));

    return {
      id: generateUUID(),
      sessionId,
      mode: config.mode,
      variant: config.variant,
      winnerId: winResult.winnerPlayerId,
      winnerName: winResult.winnerName,
      winningTeamId: winResult.winningTeamId,
      isDraw: winResult.isDraw,
      finalScores,
      durationSeconds,
      totalTurns,
      startedAt,
      completedAt: now.toISOString(),
      isSynced: false,
      syncAttemptCount: 0,
    };
  }
}
