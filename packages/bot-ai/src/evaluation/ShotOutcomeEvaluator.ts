import { SettledShotEvaluation } from '@carromverse/game-logic';

export interface ShotOutcomeSummary {
  wasSuccessful: boolean;
  pocketedCount: number;
  pocketedAssignedCount: number;
  queenPocketed: boolean;
  queenCovered: boolean;
  foulOccurred: boolean;
  earnedExtraTurn: boolean;
  pointsEarned: number;
}

export class ShotOutcomeEvaluator {
  /**
   * Translates a rules engine settled shot evaluation into bot performance metrics.
   */
  public static evaluateOutcome(
    evaluation: SettledShotEvaluation,
    assignedColor: 'white' | 'black'
  ): ShotOutcomeSummary {
    const pocketed = evaluation.pocketedCoins || [];
    const assignedCoins = pocketed.filter((c) => c.type === assignedColor);
    const queenPocketed = pocketed.some((c) => c.type === 'queen');

    let points = assignedCoins.length * (assignedColor === 'white' ? 20 : 10);
    if (evaluation.queenCoveredThisShot) {
      points += 50;
    }

    const wasSuccessful = assignedCoins.length > 0 || evaluation.queenCoveredThisShot || queenPocketed;

    return {
      wasSuccessful,
      pocketedCount: pocketed.length,
      pocketedAssignedCount: assignedCoins.length,
      queenPocketed,
      queenCovered: evaluation.queenCoveredThisShot,
      foulOccurred: evaluation.foulOccurred,
      earnedExtraTurn: evaluation.extraTurnEarned,
      pointsEarned: points,
    };
  }
}
