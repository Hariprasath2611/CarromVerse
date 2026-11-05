import { GameConfiguration, Player, PlayerSeat } from '@carromverse/shared-types';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { BotDifficulty, OverallPracticeStats, PracticeDifficultyStats, PracticeSessionConfig } from '../types/BotTypes.js';
import { getBotPersonality } from '../difficulty/DifficultyConfig.js';

export const DEFAULT_DIFFICULTY_STATS: PracticeDifficultyStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  totalShots: 0,
  successfulPockets: 0,
  missedShots: 0,
  fouls: 0,
  queenAttempts: 0,
  queenSuccesses: 0,
  totalDurationSeconds: 0,
  highestScore: 0,
};

export const DEFAULT_OVERALL_PRACTICE_STATS: OverallPracticeStats = {
  easy: { ...DEFAULT_DIFFICULTY_STATS },
  medium: { ...DEFAULT_DIFFICULTY_STATS },
  hard: { ...DEFAULT_DIFFICULTY_STATS },
  lastPlayedAt: 0,
};

export class BotSessionManager {
  /**
   * Builds the Players list for a Human vs Bot match.
   */
  public static createPracticePlayers(
    humanName: string,
    humanAvatar: string = '👑',
    botDifficulty: BotDifficulty = 'MEDIUM',
    humanColor: 'white' | 'black' = 'white'
  ): Player[] {
    const personality = getBotPersonality(botDifficulty);
    const botColor = humanColor === 'white' ? 'black' : 'white';

    const humanPlayer: Player = {
      id: 'player_human',
      name: humanName || 'Player 1',
      avatarUrl: humanAvatar,
      type: 'human',
      seat: 0 as PlayerSeat,
      position: 'bottom',
      assignedCoinType: humanColor,
      isReady: true,
      score: 0,
      fouls: 0,
    };

    const botPlayer: Player = {
      id: personality.id,
      name: personality.name,
      avatarUrl: personality.avatar,
      type: 'bot',
      seat: 2 as PlayerSeat,
      position: 'top',
      assignedCoinType: botColor,
      isReady: true,
      score: 0,
      fouls: 0,
    };

    return [humanPlayer, botPlayer];
  }

  /**
   * Builds the GameConfiguration for a practice session.
   */
  public static createPracticeGameConfig(
    config: Partial<PracticeSessionConfig> = {}
  ): GameConfiguration {
    const baseConfig = createDefaultGameConfig('two_player_individual');

    return {
      ...baseConfig,
      mode: 'practice',
      targetScore: config.targetPoints || 115,
      turnTimeLimitSeconds: config.turnTimeLimitSec || 20,
      handoverConfirmationEnabled: false, // In practice mode against bot, never block with handover popups!
      soundEnabled: config.soundEnabled ?? true,
    };
  }

  /**
   * Updates practice statistics after a completed match.
   */
  public static recordMatchResult(
    currentStats: OverallPracticeStats,
    difficulty: BotDifficulty,
    won: boolean,
    humanScore: number,
    botScore: number,
    humanShots: number,
    humanPockets: number,
    humanFouls: number,
    queenCoveredByHuman: boolean,
    durationSec: number
  ): OverallPracticeStats {
    const diffKey = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    const existing = currentStats[diffKey] || { ...DEFAULT_DIFFICULTY_STATS };

    const updatedDiff: PracticeDifficultyStats = {
      matchesPlayed: existing.matchesPlayed + 1,
      matchesWon: existing.matchesWon + (won ? 1 : 0),
      matchesLost: existing.matchesLost + (won ? 0 : 1),
      totalShots: existing.totalShots + humanShots,
      successfulPockets: existing.successfulPockets + humanPockets,
      missedShots: existing.missedShots + Math.max(0, humanShots - humanPockets),
      fouls: existing.fouls + humanFouls,
      queenAttempts: existing.queenAttempts + (queenCoveredByHuman ? 1 : 0),
      queenSuccesses: existing.queenSuccesses + (queenCoveredByHuman ? 1 : 0),
      totalDurationSeconds: existing.totalDurationSeconds + durationSec,
      highestScore: Math.max(existing.highestScore, humanScore),
    };

    return {
      ...currentStats,
      [diffKey]: updatedDiff,
      lastPlayedAt: Date.now(),
    };
  }
}
