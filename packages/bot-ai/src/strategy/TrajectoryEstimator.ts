import { CoinSnapshot, PocketDefinition, Vector2D } from '../types/ShotTypes.js';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';
import { CoinAnalyzer } from '../analysis/CoinAnalyzer.js';

export interface TrajectoryEstimationResult {
  isStrikerLineClear: boolean;
  isPocketLineClear: boolean;
  foulRisk: number; // 0 to 1
  estimatedSuccessProbability: number; // 0 to 1
  blockingCoinId?: string;
}

export class TrajectoryEstimator {
  /**
   * Evaluates line of sight, obstructions, foul risk, and success probability.
   */
  public static estimateTrajectory(
    strikerPos: Vector2D,
    impactPoint: Vector2D,
    targetCoin: CoinSnapshot,
    pocket: PocketDefinition,
    allCoins: CoinSnapshot[],
    cutAngleDeg: number,
    distStrikerToTarget: number,
    distCoinToPocket: number
  ): TrajectoryEstimationResult {
    // 1. Raycast striker path to impact point
    const strikerPathCheck = this.checkStrikerPathClear(strikerPos, impactPoint, targetCoin.id, allCoins);

    // 2. Raycast coin path to pocket
    const coinPathCheck = this.checkCoinPathClear(targetCoin.position, pocket.position, targetCoin.id, allCoins);

    // 3. Foul risk evaluation (striker entering pocket)
    const foulRisk = this.estimateStrikerPocketRisk(strikerPos, impactPoint, pocket);

    // 4. Calculate success probability
    // Factors:
    // a) Cut angle: 0 deg = 1.0, 45 deg = 0.5, 75 deg = 0.08
    const cutRad = (cutAngleDeg * Math.PI) / 180;
    const cutFactor = Math.max(0, Math.cos(cutRad));
    const cutScore = Math.pow(cutFactor, 1.8);

    // b) Distance factor (normalized board diagonal is ~1.41)
    const totalDist = distStrikerToTarget + distCoinToPocket * 1.2;
    const distScore = Math.max(0.1, 1.0 - totalDist / 1.5);

    // c) Clearance penalty
    let clearanceMultiplier = 1.0;
    if (!strikerPathCheck.isClear) clearanceMultiplier *= 0.1;
    if (!coinPathCheck.isClear) clearanceMultiplier *= 0.15;

    // d) Foul penalty
    const foulPenalty = 1.0 - foulRisk * 0.8;

    const estimatedSuccessProbability = Math.max(
      0.01,
      Math.min(0.99, cutScore * distScore * clearanceMultiplier * foulPenalty)
    );

    return {
      isStrikerLineClear: strikerPathCheck.isClear,
      isPocketLineClear: coinPathCheck.isClear,
      foulRisk,
      estimatedSuccessProbability,
      blockingCoinId: strikerPathCheck.blockingCoinId || coinPathCheck.blockingCoinId,
    };
  }

  /**
   * Checks if striker has an unobstructed line to the impact point.
   */
  private static checkStrikerPathClear(
    start: Vector2D,
    end: Vector2D,
    targetCoinId: string,
    allCoins: CoinSnapshot[]
  ): { isClear: boolean; blockingCoinId?: string } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return { isClear: true };

    const dirX = dx / len;
    const dirY = dy / len;
    const corridorRadius = BoardAnalyzer.STRIKER_RADIUS_NORM * 0.95 + BoardAnalyzer.COIN_RADIUS_NORM * 0.95;

    for (const c of allCoins) {
      if (c.id === targetCoinId || c.isPocketed) continue;

      const toCoinX = c.position.x - start.x;
      const toCoinY = c.position.y - start.y;
      const proj = toCoinX * dirX + toCoinY * dirY;

      // Only check between striker start and near impact point
      if (proj > BoardAnalyzer.STRIKER_RADIUS_NORM * 0.8 && proj < len - BoardAnalyzer.COIN_RADIUS_NORM * 0.5) {
        const perpSq = toCoinX * toCoinX + toCoinY * toCoinY - proj * proj;
        if (perpSq < corridorRadius * corridorRadius) {
          return { isClear: false, blockingCoinId: c.id };
        }
      }
    }

    return { isClear: true };
  }

  /**
   * Checks if target coin has an unobstructed path to pocket.
   */
  private static checkCoinPathClear(
    start: Vector2D,
    pocketPos: Vector2D,
    targetCoinId: string,
    allCoins: CoinSnapshot[]
  ): { isClear: boolean; blockingCoinId?: string } {
    const dx = pocketPos.x - start.x;
    const dy = pocketPos.y - start.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return { isClear: true };

    const dirX = dx / len;
    const dirY = dy / len;
    const corridorRadius = BoardAnalyzer.COIN_RADIUS_NORM * 1.8;

    for (const c of allCoins) {
      if (c.id === targetCoinId || c.isPocketed) continue;

      const toCoinX = c.position.x - start.x;
      const toCoinY = c.position.y - start.y;
      const proj = toCoinX * dirX + toCoinY * dirY;

      if (proj > BoardAnalyzer.COIN_RADIUS_NORM && proj < len - BoardAnalyzer.POCKET_RADIUS_NORM) {
        const perpSq = toCoinX * toCoinX + toCoinY * toCoinY - proj * proj;
        if (perpSq < corridorRadius * corridorRadius) {
          return { isClear: false, blockingCoinId: c.id };
        }
      }
    }

    return { isClear: true };
  }

  /**
   * Estimates probability of the striker falling into any pocket.
   */
  private static estimateStrikerPocketRisk(
    strikerPos: Vector2D,
    impactPoint: Vector2D,
    intendedPocket: PocketDefinition
  ): number {
    // If striker is shot directly towards intended pocket or close to corner
    const dx = impactPoint.x - strikerPos.x;
    const dy = impactPoint.y - strikerPos.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return 0;

    const dirX = dx / len;
    const dirY = dy / len;

    // Check all pockets for near-trajectory alignment
    for (const pocket of BoardAnalyzer.POCKETS) {
      const toPocketX = pocket.position.x - strikerPos.x;
      const toPocketY = pocket.position.y - strikerPos.y;
      const proj = toPocketX * dirX + toPocketY * dirY;

      if (proj > 0) {
        const perpSq = toPocketX * toPocketX + toPocketY * toPocketY - proj * proj;
        if (perpSq < BoardAnalyzer.POCKET_RADIUS_NORM * BoardAnalyzer.POCKET_RADIUS_NORM * 1.5) {
          // If pocket is close along trajectory, high risk!
          const distToPocket = Math.hypot(toPocketX, toPocketY);
          if (distToPocket < 0.4) {
            return Math.max(0, 1.0 - distToPocket / 0.4);
          }
        }
      }
    }

    return 0.05; // minimal background risk
  }
}
