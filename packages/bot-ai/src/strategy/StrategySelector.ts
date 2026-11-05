import { BotPersonality } from '../types/BotTypes.js';
import { BotStrategyMode, ShotEvaluationWeights } from '../types/StrategyTypes.js';

export class StrategySelector {
  /**
   * Returns weights tailored to the current strategy mode and difficulty.
   */
  public static getWeights(
    mode: BotStrategyMode,
    personality: BotPersonality
  ): ShotEvaluationWeights {
    switch (mode) {
      case 'COVER_QUEEN':
        return {
          pocketProbabilityWeight: 2.2, // Pocketing ANY assigned coin is critical to cover queen!
          distanceWeight: 1.2,
          cutAngleWeight: 1.5,
          queenWeight: 0.0, // Queen is already pocketed
          coverReadinessWeight: 2.5,
          foulRiskPenalty: 2.5,
          defenseWeight: 0.2,
        };

      case 'QUEEN_HUNTER':
        return {
          pocketProbabilityWeight: 1.5,
          distanceWeight: 1.0,
          cutAngleWeight: 1.2,
          queenWeight: 2.0 * personality.queenPrioritizationWeight,
          coverReadinessWeight: 1.5,
          foulRiskPenalty: 1.8,
          defenseWeight: 0.5,
        };

      case 'DEFENSIVE':
        return {
          pocketProbabilityWeight: 1.0,
          distanceWeight: 0.8,
          cutAngleWeight: 1.0,
          queenWeight: 0.5,
          coverReadinessWeight: 0.5,
          foulRiskPenalty: 2.0,
          defenseWeight: 2.0,
        };

      case 'OFFENSIVE':
      default:
        return {
          pocketProbabilityWeight: 1.8,
          distanceWeight: 1.0,
          cutAngleWeight: 1.2,
          queenWeight: 1.0 * personality.queenPrioritizationWeight,
          coverReadinessWeight: 1.0,
          foulRiskPenalty: 1.5,
          defenseWeight: 0.5,
        };
    }
  }
}
