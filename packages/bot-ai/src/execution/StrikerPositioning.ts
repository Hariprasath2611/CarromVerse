import { PlayerSeat } from '@carromverse/shared-types';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';
import { CoinSnapshot } from '../types/ShotTypes.js';

export class StrikerPositioning {
  /**
   * Validates and adjusts the striker offset to ensure no overlap with coins on the baseline.
   */
  public static resolveValidOffset(
    seat: PlayerSeat,
    desiredOffset: number,
    activeCoins: CoinSnapshot[]
  ): number {
    const clampedOffset = Math.max(-0.90, Math.min(0.90, desiredOffset));
    const initialPos = BoardAnalyzer.getStrikerPositionForOffset(seat, clampedOffset);

    if (!BoardAnalyzer.isStrikerOverlappingAnyCoin(initialPos, activeCoins)) {
      return clampedOffset;
    }

    // Try nudging incrementally outwards from desired offset
    const step = 0.04;
    for (let i = 1; i <= 20; i++) {
      // Alternate left and right search
      for (const sign of [-1, 1]) {
        const testOffset = clampedOffset + sign * i * step;
        if (testOffset >= -0.90 && testOffset <= 0.90) {
          const testPos = BoardAnalyzer.getStrikerPositionForOffset(seat, testOffset);
          if (!BoardAnalyzer.isStrikerOverlappingAnyCoin(testPos, activeCoins)) {
            return Number(testOffset.toFixed(3));
          }
        }
      }
    }

    return clampedOffset;
  }
}

