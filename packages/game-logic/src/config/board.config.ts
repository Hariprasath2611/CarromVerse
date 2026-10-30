import { BoardDimensions, PlayerSeat, Vector2D } from '@carromverse/shared-types';

/**
 * Standard normalized coordinate system for CarromVerse:
 * The board play surface is 1000 x 1000 units.
 * Center is (500, 500).
 */
export const BOARD_SIZE = 1000;
export const BOARD_CENTER: Vector2D = { x: 500, y: 500 };

export const DEFAULT_BOARD_DIMENSIONS: BoardDimensions = {
  boardSize: 1000,
  frameWidth: 90,
  totalSize: 1180,
  pocketRadius: 52,
  pocketCutoutRadius: 44,
  pocketOffset: 65,
  centerCircleRadius: 36,
  outerCircleRadius: 210,
  baselineOffset: 155,       // Distance from inner cushion border to baseline
  baselineLength: 520,       // Length of striker baseline
  baselineCircleRadius: 36,  // Base circle diameter ~ 3.18cm
  strikerRadius: 38,
  coinRadius: 28,
};

/**
 * 4 baseline definitions corresponding to seats 0 (bottom), 1 (right), 2 (top), 3 (left).
 */
export interface BaselineSegment {
  seat: PlayerSeat;
  start: Vector2D;
  end: Vector2D;
  leftCircleCenter: Vector2D;
  rightCircleCenter: Vector2D;
  normalDirection: Vector2D; // Direction pointing inwards toward center
}

export const BASELINE_DEFINITIONS: Record<PlayerSeat, BaselineSegment> = {
  0: {
    // Bottom player (Shooting Upward)
    seat: 0,
    start: { x: 240, y: 845 },
    end: { x: 760, y: 845 },
    leftCircleCenter: { x: 240, y: 845 },
    rightCircleCenter: { x: 760, y: 845 },
    normalDirection: { x: 0, y: -1 },
  },
  1: {
    // Right player (Shooting Leftward)
    seat: 1,
    start: { x: 845, y: 760 },
    end: { x: 845, y: 240 },
    leftCircleCenter: { x: 845, y: 760 },
    rightCircleCenter: { x: 845, y: 240 },
    normalDirection: { x: -1, y: 0 },
  },
  2: {
    // Top player (Shooting Downward)
    seat: 2,
    start: { x: 760, y: 155 },
    end: { x: 240, y: 155 },
    leftCircleCenter: { x: 760, y: 155 },
    rightCircleCenter: { x: 240, y: 155 },
    normalDirection: { x: 0, y: 1 },
  },
  3: {
    // Left player (Shooting Rightward)
    seat: 3,
    start: { x: 155, y: 240 },
    end: { x: 155, y: 760 },
    leftCircleCenter: { x: 155, y: 240 },
    rightCircleCenter: { x: 155, y: 760 },
    normalDirection: { x: 1, y: 0 },
  },
};

/**
 * Corner pocket centers inside 1000x1000 board coordinate space.
 */
export const POCKET_POSITIONS: Vector2D[] = [
  { x: 55, y: 55 },     // Top-Left (Pocket 0)
  { x: 945, y: 55 },    // Top-Right (Pocket 1)
  { x: 945, y: 945 },   // Bottom-Right (Pocket 2)
  { x: 55, y: 945 },    // Bottom-Left (Pocket 3)
];
