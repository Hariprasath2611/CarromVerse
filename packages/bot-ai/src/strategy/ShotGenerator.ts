import { PlayerSeat } from '@carromverse/shared-types';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';
import { CoinAnalyzer } from '../analysis/CoinAnalyzer.js';
import { AngleCalculator } from './AngleCalculator.js';
import { TrajectoryEstimator } from './TrajectoryEstimator.js';
import { BoardSnapshot, CandidateShot, CoinSnapshot, PocketDefinition, Vector2D } from '../types/ShotTypes.js';

export interface ShotGenerationOptions {
  samplingPoints: number; // e.g. 7 (Easy), 15 (Medium), 25 (Hard)
  maxCutAngleDeg: number; // e.g. 45 (Easy), 60 (Medium), 72 (Hard)
  includeQueen: boolean;
  allowBankShots: boolean;
}

export class ShotGenerator {
  /**
   * Generates candidate shots for the bot on its active seat.
   */
  public static generateCandidates(
    snapshot: BoardSnapshot,
    targetCoins: CoinSnapshot[],
    options: ShotGenerationOptions
  ): CandidateShot[] {
    const candidates: CandidateShot[] = [];
    const activeCoins = BoardAnalyzer.getActiveCoins(snapshot);
    const seat: PlayerSeat = snapshot.activeSeat;

    // 1. Generate discrete baseline offsets in [-0.85, 0.85]
    const offsets = this.generateSampleOffsets(options.samplingPoints);

    // 2. Evaluate each valid striker baseline position
    let candidateIndex = 0;

    for (const offset of offsets) {
      const strikerPos = BoardAnalyzer.getStrikerPositionForOffset(seat, offset);

      // Check if striker position overlaps with any coin on the baseline
      if (BoardAnalyzer.isStrikerOverlappingAnyCoin(strikerPos, activeCoins)) {
        continue;
      }

      // 3. Test each available target coin
      for (const coin of targetCoins) {
        if (coin.isPocketed) continue;

        // Test each pocket
        for (const pocket of snapshot.pockets) {
          const ghostBall = AngleCalculator.calculateGhostBall(
            strikerPos,
            coin.position,
            pocket.position
          );

          if (!ghostBall.isValidGeometry) continue;
          if (ghostBall.cutAngleDeg > options.maxCutAngleDeg) continue;

          // Check trajectory feasibility
          const trajectory = TrajectoryEstimator.estimateTrajectory(
            strikerPos,
            ghostBall.impactPoint,
            coin,
            pocket,
            activeCoins,
            ghostBall.cutAngleDeg,
            ghostBall.distanceStrikerToImpact,
            ghostBall.distanceCoinToPocket
          );

          // Calibrate power ratio based on distance
          const power = this.calculateRequiredPower(
            ghostBall.distanceStrikerToImpact,
            ghostBall.distanceCoinToPocket,
            ghostBall.cutAngleDeg
          );

          const candidate: CandidateShot = {
            id: `shot_${seat}_${candidateIndex++}`,
            targetCoinId: coin.id,
            targetCoinType: coin.type,
            pocketId: pocket.id,
            strikerOffset: offset,
            strikerPosition: strikerPos,
            targetCoinPosition: coin.position,
            pocketPosition: pocket.position,
            aimAngle: ghostBall.aimAngle,
            powerRatio: power,
            impactPoint: ghostBall.impactPoint,
            cutAngleDeg: ghostBall.cutAngleDeg,
            distanceToTarget: ghostBall.distanceStrikerToImpact,
            distanceToPocket: ghostBall.distanceCoinToPocket,
            isLineOfSightClear: trajectory.isStrikerLineClear,
            isPocketLineClear: trajectory.isPocketLineClear,
            shotType: ghostBall.cutAngleDeg < 15 ? 'direct' : 'cut',
            score: 0,
            estimatedSuccessProbability: trajectory.estimatedSuccessProbability,
            foulRisk: trajectory.foulRisk,
          };

          candidates.push(candidate);
        }
      }
    }

    // If no direct or cut candidates were found, generate a safe fallback push shot
    if (candidates.length === 0 && targetCoins.length > 0) {
      const fallback = this.generateFallbackShot(seat, targetCoins[0], activeCoins);
      if (fallback) {
        candidates.push(fallback);
      }
    }

    return candidates;
  }

  /**
   * Generates discrete baseline offsets.
   */
  public static generateSampleOffsets(points: number): number[] {
    if (points <= 1) return [0];
    const offsets: number[] = [];
    const minOffset = -0.85;
    const maxOffset = 0.85;
    const step = (maxOffset - minOffset) / (points - 1);

    for (let i = 0; i < points; i++) {
      offsets.push(Number((minOffset + i * step).toFixed(3)));
    }
    return offsets;
  }

  /**
   * Calculates required shooting power ratio in [0.25, 0.95].
   */
  public static calculateRequiredPower(
    distStrikerToTarget: number,
    distCoinToPocket: number,
    cutAngleDeg: number
  ): number {
    // Total physical path with cut energy loss
    const cutRad = (cutAngleDeg * Math.PI) / 180;
    const energyTransmission = Math.max(0.2, Math.cos(cutRad));

    const effectiveDist = (distStrikerToTarget + distCoinToPocket * 1.3) / energyTransmission;

    // Map effective normalized distance to power ratio [0.30, 0.90]
    const basePower = 0.28 + effectiveDist * 0.45;
    return Math.max(0.30, Math.min(0.92, Number(basePower.toFixed(2))));
  }

  /**
   * Generates a safe fallback defensive / cluster push shot when no pocket is accessible.
   */
  private static generateFallbackShot(
    seat: PlayerSeat,
    targetCoin: CoinSnapshot,
    activeCoins: CoinSnapshot[]
  ): CandidateShot | null {
    const defaultOffset = 0;
    const strikerPos = BoardAnalyzer.getStrikerPositionForOffset(seat, defaultOffset);

    const toCoinX = targetCoin.position.x - strikerPos.x;
    const toCoinY = targetCoin.position.y - strikerPos.y;
    const dist = Math.hypot(toCoinX, toCoinY);
    const aimAngle = Math.atan2(toCoinY, toCoinX);

    return {
      id: `shot_fallback_${Date.now()}`,
      targetCoinId: targetCoin.id,
      targetCoinType: targetCoin.type,
      pocketId: 0,
      strikerOffset: defaultOffset,
      strikerPosition: strikerPos,
      targetCoinPosition: targetCoin.position,
      pocketPosition: BoardAnalyzer.POCKETS[0].position,
      aimAngle,
      powerRatio: 0.45,
      impactPoint: targetCoin.position,
      cutAngleDeg: 0,
      distanceToTarget: dist,
      distanceToPocket: 0.5,
      isLineOfSightClear: true,
      isPocketLineClear: false,
      shotType: 'defensive',
      score: 10,
      estimatedSuccessProbability: 0.25,
      foulRisk: 0.05,
    };
  }
}
