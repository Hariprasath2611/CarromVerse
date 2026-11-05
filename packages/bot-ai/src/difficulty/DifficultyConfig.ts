import { BotDifficulty, BotPersonality } from '../types/BotTypes.js';

export const BOT_PERSONALITIES: Record<BotDifficulty, BotPersonality> = {
  EASY: {
    id: 'bot_rookie',
    name: 'Rookie Bot',
    difficulty: 'EASY',
    title: 'Beginner',
    avatar: '🤖',
    description: 'A beginner bot learning carrom basics. Takes direct shots with occasional misses.',
    thinkingDelayMinMs: 1200,
    thinkingDelayMaxMs: 1800,
    aimingErrorMaxRad: 0.08, // ~4.6 degrees max jitter
    powerVariation: 0.15, // +/- 15% power noise
    candidateEvaluationBudget: 10,
    maxCutAngleDeg: 45,
    queenPrioritizationWeight: 0.4,
    defenseWeight: 0.1,
    foulAvoidanceWeight: 0.5,
    allowBankShots: false,
  },
  MEDIUM: {
    id: 'bot_pro',
    name: 'Pro Bot',
    difficulty: 'MEDIUM',
    title: 'Intermediate',
    avatar: '🎯',
    description: 'A balanced opponent calculating angles, accessible coins, and queen opportunities.',
    thinkingDelayMinMs: 1500,
    thinkingDelayMaxMs: 2200,
    aimingErrorMaxRad: 0.025, // ~1.4 degrees max jitter
    powerVariation: 0.05, // +/- 5% power noise
    candidateEvaluationBudget: 35,
    maxCutAngleDeg: 60,
    queenPrioritizationWeight: 1.0,
    defenseWeight: 0.6,
    foulAvoidanceWeight: 1.2,
    allowBankShots: true,
  },
  HARD: {
    id: 'bot_master',
    name: 'Master Bot',
    difficulty: 'HARD',
    title: 'Advanced Master',
    avatar: '🏆',
    description: 'An elite carrom master. Deep candidate evaluation, surgical precision, queen coverage, and strict foul avoidance.',
    thinkingDelayMinMs: 1800,
    thinkingDelayMaxMs: 2500,
    aimingErrorMaxRad: 0.003, // ~0.17 degrees (near laser precision)
    powerVariation: 0.01, // +/- 1% power noise
    candidateEvaluationBudget: 80,
    maxCutAngleDeg: 72,
    queenPrioritizationWeight: 1.8,
    defenseWeight: 1.5,
    foulAvoidanceWeight: 2.2,
    allowBankShots: true,
  },
};

export function getBotPersonality(difficulty: BotDifficulty): BotPersonality {
  return BOT_PERSONALITIES[difficulty] || BOT_PERSONALITIES.MEDIUM;
}

