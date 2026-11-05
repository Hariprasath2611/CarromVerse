import { Vector2D } from '../types/ShotTypes.js';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';

export interface GhostBallCalculation {
  impactPoint: Vector2D;
  aimAngle: number;
  cutAngleDeg: number;
  distanceStrikerToImpact: number;
  distanceCoinToPocket: number;
  isValidGeometry: boolean;
}

export class AngleCalculator {
  /**
   * Calculates ghost ball contact point, aim angle, and cut angle.
   */
  public static calculateGhostBall(
    strikerPos: Vector2D,
    coinPos: Vector2D,
    pocketPos: Vector2D,
    strikerRadius: number = BoardAnalyzer.STRIKER_RADIUS_NORM,
    coinRadius: number = BoardAnalyzer.COIN_RADIUS_NORM
  ): GhostBallCalculation {
    // Vector from coin to pocket
    const toPocketX = pocketPos.x - coinPos.x;
    const toPocketY = pocketPos.y - coinPos.y;
    const distCoinToPocket = Math.hypot(toPocketX, toPocketY);

    if (distCoinToPocket < 0.001) {
      return {
        impactPoint: coinPos,
        aimAngle: 0,
        cutAngleDeg: 180,
        distanceStrikerToImpact: 0,
        distanceCoinToPocket: 0,
        isValidGeometry: false,
      };
    }

    // Unit vector towards pocket
    const dirPocketX = toPocketX / distCoinToPocket;
    const dirPocketY = toPocketY / distCoinToPocket;

    // Contact distance: striker center to coin center at impact
    const contactDistance = strikerRadius + coinRadius;

    // Ghost ball position: behind the coin relative to pocket
    const impactPoint: Vector2D = {
      x: coinPos.x - dirPocketX * contactDistance,
      y: coinPos.y - dirPocketY * contactDistance,
    };

    // Vector from striker to impact point
    const toImpactX = impactPoint.x - strikerPos.x;
    const toImpactY = impactPoint.y - strikerPos.y;
    const distStrikerToImpact = Math.hypot(toImpactX, toImpactY);

    if (distStrikerToImpact < 0.001) {
      return {
        impactPoint,
        aimAngle: 0,
        cutAngleDeg: 180,
        distanceStrikerToImpact: 0,
        distanceCoinToPocket: distCoinToPocket,
        isValidGeometry: false,
      };
    }

    const aimAngle = Math.atan2(toImpactY, toImpactX);

    // Striker approach unit vector
    const dirApproachX = toImpactX / distStrikerToImpact;
    const dirApproachY = toImpactY / distStrikerToImpact;

    // Dot product between striker approach and coin-to-pocket vector
    // cos(phi) = dirApproach . dirPocket
    const dot = dirApproachX * dirPocketX + dirApproachY * dirPocketY;
    const clampedDot = Math.max(-1.0, Math.min(1.0, dot));
    const cutAngleRad = Math.acos(clampedDot);
    const cutAngleDeg = (cutAngleRad * 180) / Math.PI;

    // Geometry is valid if cut angle is less than 85 degrees (not hitting from opposite side)
    const isValidGeometry = cutAngleDeg < 85 && dot > 0.08;

    return {
      impactPoint,
      aimAngle,
      cutAngleDeg,
      distanceStrikerToImpact: distStrikerToImpact,
      distanceCoinToPocket: distCoinToPocket,
      isValidGeometry,
    };
  }

  /**
   * Normalizes an angle into [-PI, PI].
   */
  public static normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }
}

