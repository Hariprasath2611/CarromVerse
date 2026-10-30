import { BoardDimensions, CoinType, CoinVisualConfig, Vector2D } from '../types/GameTypes.js';

/**
 * Standard Carrom Board normalized proportions based on
 * International Carrom Federation (ICF) specifications.
 * All units are relative to the overall board square (1.0 x 1.0).
 */
export const NORMALIZED_BOARD_CONFIG = {
  // Frame
  FRAME_WIDTH: 0.08,             // 8% of board width on each edge
  PLAYING_SURFACE_SIZE: 0.84,    // 1.0 - 2 * 0.08 = 0.84

  // Pockets
  POCKET_RADIUS: 0.038,          // Pocket radius in normalized units
  POCKET_INSET: 0.08 + 0.015,    // Inset from outer edge

  // Center Circle
  CENTER_OUTER_RADIUS: 0.065,    // Outer center ring
  CENTER_INNER_RADIUS: 0.022,    // Inner center circle
  CENTER_RED_DOT_RADIUS: 0.007,  // Center red pinpoint dot

  // Baselines
  BASELINE_OFFSET: 0.135,        // Distance from inner playing edge to baseline
  BASELINE_LENGTH: 0.54,         // Width/length of the shooting baseline
  BASELINE_CIRCLE_RADIUS: 0.019, // Red circle target at baseline ends
  BASELINE_GAP: 0.018,           // Gap between the two parallel baseline lines

  // Game Pieces
  COIN_RADIUS: 0.020,            // Carrom piece radius
  STRIKER_RADIUS: 0.028,         // Striker radius (1.4x larger than coins)
} as const;

/**
 * Calculates pixel dimensions given a canvas square size (e.g. 800px).
 */
export function calculateBoardDimensions(canvasSize: number): BoardDimensions {
  return {
    size: canvasSize,
    frameWidth: canvasSize * NORMALIZED_BOARD_CONFIG.FRAME_WIDTH,
    playingSurfaceSize: canvasSize * NORMALIZED_BOARD_CONFIG.PLAYING_SURFACE_SIZE,
    pocketRadius: canvasSize * NORMALIZED_BOARD_CONFIG.POCKET_RADIUS,
    centerOuterRadius: canvasSize * NORMALIZED_BOARD_CONFIG.CENTER_OUTER_RADIUS,
    centerInnerRadius: canvasSize * NORMALIZED_BOARD_CONFIG.CENTER_INNER_RADIUS,
    centerRedDotRadius: canvasSize * NORMALIZED_BOARD_CONFIG.CENTER_RED_DOT_RADIUS,
    baselineOffset: canvasSize * NORMALIZED_BOARD_CONFIG.BASELINE_OFFSET,
    baselineLength: canvasSize * NORMALIZED_BOARD_CONFIG.BASELINE_LENGTH,
    baselineCircleRadius: canvasSize * NORMALIZED_BOARD_CONFIG.BASELINE_CIRCLE_RADIUS,
    coinRadius: canvasSize * NORMALIZED_BOARD_CONFIG.COIN_RADIUS,
    strikerRadius: canvasSize * NORMALIZED_BOARD_CONFIG.STRIKER_RADIUS,
  };
}

/**
 * Generates the standard initial opening arrangement of carrom coins.
 * Symmetrical packing:
 * - 1 Queen in center (0.5, 0.5)
 * - Ring 1: 6 alternating coins (3 White, 3 Black) touching the Queen
 * - Ring 2: 12 alternating coins (6 White, 6 Black) surrounding Ring 1
 * Total = 19 coins (1 Queen, 9 White, 9 Black).
 */
export function generateOpeningCoinCluster(): CoinVisualConfig[] {
  const coins: CoinVisualConfig[] = [];
  const cx = 0.5;
  const cy = 0.5;
  const rCoin = NORMALIZED_BOARD_CONFIG.COIN_RADIUS;

  // 1. Center Queen
  coins.push({
    id: 'coin_queen',
    type: 'queen',
    nx: cx,
    ny: cy,
    scale: 1,
    rotation: 0,
    visible: true,
  });

  // 2. Ring 1: 6 coins tightly packed around Queen (distance = 2 * rCoin)
  const dist1 = 2 * rCoin * 1.02; // slight 2% clearance to avoid collision jitter
  const ring1Types: CoinType[] = ['white', 'black', 'white', 'black', 'white', 'black'];

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3; // 0, 60, 120, 180, 240, 300 degrees
    coins.push({
      id: `coin_r1_${i}`,
      type: ring1Types[i],
      nx: cx + Math.cos(angle) * dist1,
      ny: cy + Math.sin(angle) * dist1,
      scale: 1,
      rotation: angle,
      visible: true,
    });
  }

  // 3. Ring 2: 12 coins surrounding Ring 1
  // In hexagonal close packing, the 12 coins consist of:
  // - 6 coins on the axes (distance = 4 * rCoin)
  // - 6 coins in the interstitial valleys (distance = 2 * sqrt(3) * rCoin)
  const dist2Axis = 4 * rCoin * 1.02;
  const dist2Interstitial = 2 * Math.sqrt(3) * rCoin * 1.02;

  // Sequence of 12 alternating coins (6 Black, 6 White)
  const ring2Types: CoinType[] = [
    'black', 'white', 'black', 'white', 'black', 'white',
    'black', 'white', 'black', 'white', 'black', 'white',
  ];

  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6; // every 30 degrees
    const isAxis = i % 2 === 0;
    const dist = isAxis ? dist2Axis : dist2Interstitial;

    coins.push({
      id: `coin_r2_${i}`,
      type: ring2Types[i],
      nx: cx + Math.cos(angle) * dist,
      ny: cy + Math.sin(angle) * dist,
      scale: 1,
      rotation: angle,
      visible: true,
    });
  }

  return coins;
}

/**
 * Returns baseline segment coordinates for each of the 4 player seats.
 * seat 0 = South (Bottom), seat 1 = East (Right), seat 2 = North (Top), seat 3 = West (Left).
 */
export function getBaselineForSeat(seat: number): { x1: number; y1: number; x2: number; y2: number } {
  const fw = NORMALIZED_BOARD_CONFIG.FRAME_WIDTH;
  const bo = NORMALIZED_BOARD_CONFIG.BASELINE_OFFSET;
  const bl = NORMALIZED_BOARD_CONFIG.BASELINE_LENGTH;
  const halfBl = bl / 2;

  switch (seat % 4) {
    case 1: // East (Right)
      return {
        x1: 1 - fw - bo,
        y1: 0.5 - halfBl,
        x2: 1 - fw - bo,
        y2: 0.5 + halfBl,
      };
    case 2: // North (Top)
      return {
        x1: 0.5 - halfBl,
        y1: fw + bo,
        x2: 0.5 + halfBl,
        y2: fw + bo,
      };
    case 3: // West (Left)
      return {
        x1: fw + bo,
        y1: 0.5 - halfBl,
        x2: fw + bo,
        y2: 0.5 + halfBl,
      };
    case 0: // South (Bottom)
    default:
      return {
        x1: 0.5 - halfBl,
        y1: 1 - fw - bo,
        x2: 0.5 + halfBl,
        y2: 1 - fw - bo,
      };
  }
}
