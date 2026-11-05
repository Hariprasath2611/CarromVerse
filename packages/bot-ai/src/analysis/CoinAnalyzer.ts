import { CoinSnapshot, Vector2D } from '../types/ShotTypes.js';
import { QueenStatus } from '@carromverse/shared-types';

export interface CoinAnalysisResult {
  targetCoins: CoinSnapshot[];
  queenCoin: CoinSnapshot | null;
  opponentCoins: CoinSnapshot[];
  isQueenAvailable: boolean;
  canPocketQueen: boolean;
  remainingTargetCount: number;
}

export class CoinAnalyzer {
  /**
   * Analyzes available coins based on bot's assigned coin type and queen status.
   */
  public static analyzeCoins(
    activeCoins: CoinSnapshot[],
    assignedCoinType: 'white' | 'black',
    queenStatus: QueenStatus
  ): CoinAnalysisResult {
    const targetCoins: CoinSnapshot[] = [];
    const opponentCoins: CoinSnapshot[] = [];
    let queenCoin: CoinSnapshot | null = null;

    for (const coin of activeCoins) {
      if (coin.isPocketed) continue;

      if (coin.type === 'queen') {
        queenCoin = coin;
      } else if (coin.type === assignedCoinType) {
        targetCoins.push(coin);
      } else {
        opponentCoins.push(coin);
      }
    }

    const isQueenAvailable =
      queenCoin !== null && (queenStatus === 'unpocketed' || queenStatus === 'returned_to_board');

    // A player can legally pocket the queen if they have at least one assigned coin to cover it
    const canPocketQueen = isQueenAvailable && targetCoins.length >= 1;

    return {
      targetCoins,
      queenCoin,
      opponentCoins,
      isQueenAvailable,
      canPocketQueen,
      remainingTargetCount: targetCoins.length,
    };
  }

  /**
   * Computes Euclidean distance between two 2D points.
   */
  public static distance(p1: Vector2D, p2: Vector2D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Identifies if a coin is in a cluster (surrounded closely by other coins).
   */
  public static isCoinInCluster(
    targetCoin: CoinSnapshot,
    allCoins: CoinSnapshot[],
    clusterDistThreshold = 0.06
  ): boolean {
    let neighbors = 0;
    for (const other of allCoins) {
      if (other.id === targetCoin.id || other.isPocketed) continue;
      if (this.distance(targetCoin.position, other.position) < clusterDistThreshold) {
        neighbors++;
      }
    }
    return neighbors >= 2;
  }
}
