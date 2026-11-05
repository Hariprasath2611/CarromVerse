import { PlayerSeat } from '@carromverse/shared-types';
import { BoardSnapshot, CoinSnapshot, PocketDefinition, Vector2D } from '../types/ShotTypes.js';

export class BoardAnalyzer {
  public static readonly REFERENCE_B = 382;

  // Normalized dimensions relative to board width B
  public static readonly COIN_RADIUS_NORM = 10 / 382; // ~0.02618
  public static readonly STRIKER_RADIUS_NORM = 14.8 / 382; // ~0.03874
  public static readonly POCKET_RADIUS_NORM = 16.4 / 382; // ~0.04293
  public static readonly BASELINE_TRAVEL_HALF = 101 / 382; // ~0.26440

  public static readonly POCKETS: PocketDefinition[] = [
    { id: 0, position: { x: 24 / 382, y: 22.5 / 382 }, radius: 16.4 / 382, corner: 'top-left' },
    { id: 1, position: { x: 357.5 / 382, y: 22.5 / 382 }, radius: 16.4 / 382, corner: 'top-right' },
    { id: 2, position: { x: 24 / 382, y: 356.5 / 382 }, radius: 16.4 / 382, corner: 'bottom-left' },
    { id: 3, position: { x: 357.5 / 382, y: 356.5 / 382 }, radius: 16.4 / 382, corner: 'bottom-right' },
  ];

  /**
   * Translates a striker baseline offset ratio in [-1, 1] to normalized board coordinates (x, y) in [0, 1].
   */
  public static getStrikerPositionForOffset(seat: PlayerSeat, offsetRatio: number): Vector2D {
    const clampedOffset = Math.max(-0.92, Math.min(0.92, offsetRatio));
    const center = 0.5;
    const travel = this.BASELINE_TRAVEL_HALF;

    switch (seat) {
      case 0: // South baseline (Bottom)
        return {
          x: center + clampedOffset * travel,
          y: 317.1 / 382,
        };
      case 2: // North baseline (Top)
        return {
          x: center + clampedOffset * travel,
          y: 63.5 / 382,
        };
      case 1: // East baseline (Right)
        return {
          x: 317.0 / 382,
          y: center + clampedOffset * travel,
        };
      case 3: // West baseline (Left)
        return {
          x: 64.0 / 382,
          y: center + clampedOffset * travel,
        };
      default:
        return { x: center, y: 317.1 / 382 };
    }
  }

  /**
   * Checks if placing the striker at a given baseline position overlaps with any coin on the board.
   */
  public static isStrikerOverlappingAnyCoin(
    strikerPos: Vector2D,
    activeCoins: CoinSnapshot[]
  ): boolean {
    const minSafeDist = this.STRIKER_RADIUS_NORM + this.COIN_RADIUS_NORM;
    for (const coin of activeCoins) {
      if (coin.isPocketed) continue;
      const dx = strikerPos.x - coin.position.x;
      const dy = strikerPos.y - coin.position.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minSafeDist * minSafeDist) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns all active, unpocketed coins on the board.
   */
  public static getActiveCoins(snapshot: BoardSnapshot): CoinSnapshot[] {
    return snapshot.coins.filter((c) => !c.isPocketed);
  }

  /**
   * Creates a normalized snapshot from raw coordinates or ensures normalization.
   */
  public static normalizeSnapshot(rawSnapshot: any): BoardSnapshot {
    const boardSize = rawSnapshot.boardSize || 840;
    const scale = rawSnapshot.scale || boardSize / 382;

    const coins: CoinSnapshot[] = (rawSnapshot.coins || []).map((c: any, index: number) => {
      // If position values are > 1, normalize by boardSize
      const posX = c.x > 1 ? c.x / boardSize : (c.position ? (c.position.x > 1 ? c.position.x / boardSize : c.position.x) : 0.5);
      const posY = c.y > 1 ? c.y / boardSize : (c.position ? (c.position.y > 1 ? c.position.y / boardSize : c.position.y) : 0.5);
      return {
        id: c.id || `coin_${index}`,
        type: c.type || 'black',
        position: { x: posX, y: posY },
        isPocketed: !!c.isPocketed,
      };
    });

    const seat: PlayerSeat = rawSnapshot.activeSeat ?? 2;
    const strikerOffset = rawSnapshot.striker?.offsetRatio ?? 0;
    const strikerPos = this.getStrikerPositionForOffset(seat, strikerOffset);

    return {
      boardSize,
      scale,
      coins,
      striker: {
        position: strikerPos,
        radius: this.STRIKER_RADIUS_NORM,
        seat,
        offsetRatio: strikerOffset,
        isPocketed: !!rawSnapshot.striker?.isPocketed,
      },
      pockets: this.POCKETS,
      activeSeat: seat,
      timestamp: rawSnapshot.timestamp || Date.now(),
    };
  }
}

