import { CandidateShot } from '../types/ShotTypes.js';
import { ShotEvaluationWeights } from '../types/StrategyTypes.js';
import { BotPersonality } from '../types/BotTypes.js';

export class ShotEvaluator {
  /**
   * Scores and ranks candidate shots according to bot personality and weights.
   */
  public static evaluateCandidates(
    candidates: CandidateShot[],
    personality: BotPersonality,
    weights: ShotEvaluationWeights
  ): CandidateShot[] {
    for (const shot of candidates) {
      // 1. Success probability component (0 - 100)
      const probScore = shot.estimatedSuccessProbability * 100 * weights.pocketProbabilityWeight;

      // 2. Cut angle efficiency (smaller cut angle is easier to execute)
      const cutBonus = Math.max(0, 1.0 - shot.cutAngleDeg / 90) * 50 * weights.cutAngleWeight;

      // 3. Distance efficiency (closer is easier)
      const distBonus = Math.max(0, 1.0 - shot.distanceToTarget) * 30 * weights.distanceWeight;

      // 4. Queen opportunity bonus
      let queenBonus = 0;
      if (shot.targetCoinType === 'queen') {
        queenBonus = 40 * personality.queenPrioritizationWeight * weights.queenWeight;
      }

      // 5. Line of sight bonus / obstruction penalty
      let clearanceBonus = 0;
      if (shot.isLineOfSightClear && shot.isPocketLineClear) {
        clearanceBonus = 25;
      } else {
        clearanceBonus = -50;
      }

      // 6. Foul risk penalty
      const foulPenalty = shot.foulRisk * 100 * personality.foulAvoidanceWeight * weights.foulRiskPenalty;

      // Calculate composite score
      shot.score = Number(
        (probScore + cutBonus + distBonus + queenBonus + clearanceBonus - foulPenalty).toFixed(2)
      );
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    // Limit to evaluation budget
    return candidates.slice(0, personality.candidateEvaluationBudget);
  }

  /**
   * Selects the shot to execute from evaluated candidates based on difficulty.
   */
  public static selectBestShot(
    rankedCandidates: CandidateShot[],
    personality: BotPersonality,
    randomSeed?: number
  ): CandidateShot {
    if (rankedCandidates.length === 0) {
      throw new Error('No candidate shots available');
    }

    if (personality.difficulty === 'HARD' || rankedCandidates.length === 1) {
      // Hard Bot always picks the mathematically optimal shot
      return rankedCandidates[0];
    }

    // Pseudo-random selection for reproducibility when seed is supplied
    const rng = randomSeed !== undefined ? this.seededRandom(randomSeed) : Math.random();

    if (personality.difficulty === 'MEDIUM') {
      // 85% pick top choice, 15% pick 2nd choice (if available)
      if (rankedCandidates.length > 1 && rng > 0.85) {
        return rankedCandidates[1];
      }
      return rankedCandidates[0];
    }

    // EASY BOT:
    // 60% pick top choice, 30% pick 2nd choice, 10% pick 3rd choice
    if (rankedCandidates.length >= 3 && rng > 0.90) {
      return rankedCandidates[2];
    }
    if (rankedCandidates.length >= 2 && rng > 0.60) {
      return rankedCandidates[1];
    }
    return rankedCandidates[0];
  }

  private static seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
