export type BotStrategyMode =
  | 'OFFENSIVE'
  | 'QUEEN_HUNTER'
  | 'COVER_QUEEN'
  | 'DEFENSIVE'
  | 'CLEAR_CLUSTERS';

export interface ShotEvaluationWeights {
  pocketProbabilityWeight: number;
  distanceWeight: number;
  cutAngleWeight: number;
  queenWeight: number;
  coverReadinessWeight: number;
  foulRiskPenalty: number;
  defenseWeight: number;
}
