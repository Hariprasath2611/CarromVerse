import { CoinSnapshot, PocketDefinition, Vector2D } from '../types/ShotTypes.js';
import { BoardAnalyzer } from './BoardAnalyzer.js';
import { CoinAnalyzer } from './CoinAnalyzer.js';

export interface PocketAssessment {
  pocket: PocketDefinition;
  distance: number;
  isPathClear: boolean;
  obstructingCoinId?: string;
  accessibilityScore: number;
}

export class PocketAnalyzer {
  /**
   * Evaluates all 4 pockets for a given target coin.
   */
  public static assessPocketsForCoin(
    coin: CoinSnapshot,
    pockets: PocketDefinition[],
    allCoins: CoinSnapshot[]
  ): PocketAssessment[] {
    const results: PocketAssessment[] = [];

    for (const pocket of pockets) {
      const dist = CoinAnalyzer.distance(coin.position, pocket.position);
      const obstruction = this.checkCoinToPocketObstruction(coin, pocket, allCoins);

      // Score based on distance and clearance
      let score = Math.max(0, 1.0 - dist / 1.2);
      if (!obstruction.isClear) {
        score *= 0.15; // heavy penalty for blocked path
      }

      results.push({
        pocket,
        distance: dist,
        isPathClear: obstruction.isClear,
        obstructingCoinId: obstruction.blockingCoinId,
        accessibilityScore: score,
      });
    }

    // Sort descending by accessibility score
    return results.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
  }

  /**
   * Raycasts a corridor between coin and pocket to detect blocking coins.
   */
  public static checkCoinToPocketObstruction(
    coin: CoinSnapshot,
    pocket: PocketDefinition,
    allCoins: CoinSnapshot[]
  ): { isClear: boolean; blockingCoinId?: string } {
    const start = coin.position;
    const end = pocket.position;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const pathLen = Math.sqrt(dx * dx + dy * dy);
    if (pathLen < 0.001) return { isClear: true };

    const dirX = dx / pathLen;
    const dirY = dy / pathLen;

    const clearanceRadius = BoardAnalyzer.COIN_RADIUS_NORM * 1.8;

    for (const other of allCoins) {
      if (other.id === coin.id || other.isPocketed) continue;

      const toOtherX = other.position.x - start.x;
      const toOtherY = other.position.y - start.y;

      // Project onto path
      const projection = toOtherX * dirX + toOtherY * dirY;

      // Only check coins strictly between target coin and pocket
      if (projection > BoardAnalyzer.COIN_RADIUS_NORM && projection < pathLen - BoardAnalyzer.POCKET_RADIUS_NORM) {
        // Perpendicular distance squared
        const perpSq = toOtherX * toOtherX + toOtherY * toOtherY - projection * projection;
        if (perpSq < clearanceRadius * clearanceRadius) {
          return { isClear: false, blockingCoinId: other.id };
        }
      }
    }

    return { isClear: true };
  }
}

