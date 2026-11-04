/**
 * LayoutConfig.ts
 * CarromVerse Phase 1.3b: Match Screen Layout & Geometry Reference
 * 
 * Single source of truth calibrated strictly to the design canvas (390 x 844 units).
 * Scale factor: s = screenWidth / 390.
 * Board frame width: B = 382 units.
 * Board elements are also expressed as ratios of B so the Phaser scene scales cleanly to any resolution.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LAYOUT_CONFIG = {
  // 1. Canvas Design Frame
  DESIGN_FRAME: {
    width: 390,
    height: 844,
    safeMarginMin: 8,
  },

  // 2. Board Frame & Surface
  BOARD: {
    // Top-left and size in design units
    frameX: 4,
    frameY: 240.5,
    frameWidth: 382,
    frameHeight: 381,
    frameRadius: 12,
    woodGradientStart: '#8B5226',
    woodGradientEnd: '#5A3012',

    // B = 382 units reference width
    B: 382,

    // Surface bounds
    surfaceX: 11,
    surfaceY: 247.5,
    surfaceWidth: 368,
    surfaceHeight: 366,
    surfaceColor: '#EBCB93',
    surfaceGrainOpacity: 0.30,

    // Emerald corner caps (L-shaped)
    cornerCapColor: '#2BD67B',
    cornerCapThickness: 6,
    cornerCapArmLength: 41,

    // Center circle
    centerX: 194.5,
    centerY: 430.2,
    centerCircleRadius: 63.5, // 0.166 B
    centerCircleRadiusRatioB: 63.5 / 382,
    centerCircleStroke: 1.2,

    // Relative to Board Frame Origin (4, 240.5):
    centerRelX: 190.5,
    centerRelY: 189.7,
  },

  // 3. Pockets (4 corner pockets)
  POCKETS: {
    radius: 16.4, // 0.04293 B (~0.043 B)
    diameter: 32.8, // 0.086 B
    radiusRatioB: 16.4 / 382, // 0.04293
    captureRadiusRatio: 0.85,
    captureRadius: 16.4 * 0.85, // 13.94 units
    color: '#0A0A0A',
    // Absolute design frame centers
    centers: [
      { id: 'top_left', x: 28, y: 263 },
      { id: 'top_right', x: 361.5, y: 263 },
      { id: 'bottom_left', x: 28, y: 597 },
      { id: 'bottom_right', x: 361.5, y: 597 },
    ] as const,
    // Board-relative ratios [0..1]
    ratios: [
      { id: 'top_left', nx: 24 / 382, ny: 22.5 / 382 },
      { id: 'top_right', nx: 357.5 / 382, ny: 22.5 / 382 },
      { id: 'bottom_left', nx: 24 / 382, ny: 356.5 / 382 },
      { id: 'bottom_right', nx: 357.5 / 382, ny: 356.5 / 382 },
    ] as const,
  },

  // 4. Baselines & End Markers
  BASELINES: {
    strokeWidth: 1.6,
    strokeColor: '#6B3A1A',
    thickness: 26.5, // 0.069 B
    thicknessRatioB: 26.5 / 382,
    length: 228, // 0.60 B
    lengthRatioB: 228 / 382,

    // Top baseline
    top: { x: 81, y: 290.7, width: 228, height: 26.5, centerY: 304.0 },
    // Bottom baseline
    bottom: { x: 81, y: 544.4, width: 228, height: 26.5, centerY: 557.65 },
    // Left baseline
    left: { x: 55.5, y: 317, width: 25.5, height: 227.4, centerX: 68.0 },
    // Right baseline
    right: { x: 308.5, y: 317, width: 25.5, height: 227.4, centerX: 321.0 },

    // End marker circles
    endMarkerRadius: 11.5,
    endMarkerFillColor: '#2BD67B',
    endMarkerRingColor: '#FFD84A',
    endMarkerRingWidth: 1.5,
    endMarkers: [
      // Top lane
      { x: 94, y: 304 },
      { x: 296, y: 304 },
      // Bottom lane
      { x: 94, y: 557.6 },
      { x: 296, y: 557.6 },
      // Left lane
      { x: 68, y: 329 },
      { x: 68, y: 532 },
      // Right lane
      { x: 321, y: 329 },
      { x: 321, y: 532 },
    ] as const,
  },

  // 5. Game Pieces & Start Formation
  PIECES: {
    coinDiameter: 20, // 0.052 B
    coinRadius: 10,
    coinRadiusRatioB: 10 / 382, // 0.02618 B
    strikerDiameter: 29.6, // 0.078 B
    strikerRadius: 14.8,
    strikerRadiusRatioB: 14.8 / 382, // 0.03874 B

    shadowOffset: { x: 0.7, y: 1.4 },

    colors: {
      white: '#F5ECD2',
      black: '#1B2420',
      queen: '#E23B5A',
      strikerRim: '#2BD67B',
      strikerFace: '#FFF8E7',
      strikerBrassRing: '#FFD84A',
      strikerDashedRing: '#2BD67B',
      strikerCenter: '#FFD84A',
      glowEmerald: '#2BD67B',
      glowGold: '#FFD84A',
    },

    // Reference Formation (13 pieces: 1 queen + 6 white + 6 black)
    // Relative to center (194.5, 430.2) in design units
    formation: {
      queen: { x: 0, y: 0, type: 'queen' as const },
      // Inner ring: radius ~0.055 B (~21.0 units)
      whites: [
        { x: -11.1, y: -16.5, type: 'white' as const },
        { x: 9.5, y: -18.1, type: 'white' as const },
        { x: -20.1, y: 2.0, type: 'white' as const },
        { x: 20.5, y: -1.2, type: 'white' as const },
        { x: -9.0, y: 18.4, type: 'white' as const },
        { x: 10.5, y: 17.3, type: 'white' as const },
      ],
      // Outer ring: radius ~0.09 B (~34.4 units)
      blacks: [
        { x: -1.5, y: -34.5, type: 'black' as const },
        { x: -30.7, y: -14.9, type: 'black' as const },
        { x: 29.5, y: -19.1, type: 'black' as const },
        { x: -29.1, y: 19.5, type: 'black' as const },
        { x: 31.7, y: 16.3, type: 'black' as const },
        { x: 2.6, y: 34.8, type: 'black' as const },
      ],
    },
  },

  // 6. Striker Lanes & Slider Controls
  STRIKER_LANES: {
    // Bottom player lane
    myLaneY: 557.6,
    laneXMin: 94,
    laneXMax: 296,
    laneCenterX: 195.0,
    laneHalfTravel: 101.0,

    // Top player lane (opponent)
    opponentLaneY: 304.0,

    // Side lanes (future 3-4 players)
    sideLeftX: 68.0,
    sideRightX: 321.0,
    sideYMin: 329.0,
    sideYMax: 532.0,
  },

  // 7. Slider Track (React Native)
  SLIDER: {
    trackX: 78,
    trackY: 736,
    trackWidth: 234,
    trackHeight: 30,
    trackRadius: 15,
    knobRadius: 13, // diameter 26
    knobCenter: { x: 194.5, y: 751 },
    knobMaxOffset: 104.0, // +/- 104 from center (194.5)
    strikerMaxOffset: 101.0, // +/- 101 from center (195.0)
    // Linear mapping factor
    knobToStrikerRatio: 101.0 / 104.0,
  },

  // 8. Bottom Buttons & Power Bar (React Native)
  BOTTOM_CONTROLS: {
    chatButton: {
      centerX: 36,
      centerY: 811,
      radius: 25,
      minTouchTarget: 44,
    },
    menuButton: {
      centerX: 354,
      centerY: 811,
      radius: 25,
      minTouchTarget: 44,
    },
    powerBar: {
      centerX: 376,
      centerY: 637,
      width: 4,
      height: 24,
      opacity: 0.80,
    },
  },

  // 9. HUD (React Native)
  HUD: {
    avatars: {
      width: 55,
      height: 55,
      radius: 6,
      strokeWidth: 2.4,
      left: { x: 16, y: 39 },
      right: { x: 320, y: 39 },
      activeStrokeColor: '#2BD67B', // Emerald
      inactiveStrokeColor: '#FFD84A', // Brass
    },
    names: {
      leftCenterX: 43.5,
      rightCenterX: 347.5,
      baselineY: 108,
      fontSize: 11,
      fontWeight: 'bold' as const,
    },
    scores: {
      leftStartX: 4,
      rightEndX: 386,
      baselineY: 138,
      numFontSize: 19,
      totalFontSize: 14,
      totalOpacity: 0.80,
      targetTotal: 115,
    },
    pot: {
      centerX: 195.5,
      pileCenterY: 84,
      pileWidth: 58,
      amountBaselineY: 138,
      amountFontSize: 26,
      defaultAmount: 400,
    },
    legend: {
      y: 220,
      baselineY: 226,
      fontSize: 16,
      fontWeight: 'bold' as const,
      iconRadius: 9.5,
      queen: { iconX: 137, textX: 152, defaultValue: 50 },
      black: { iconX: 183, textX: 197, defaultValue: 10 },
      white: { iconX: 230, textX: 243, defaultValue: 20 },
    },
  },

  // 10. Aiming UI (Phaser Overlay)
  AIMING: {
    aimZoneRadiusRatioB: 0.20,
    aimZoneRadiusUnits: 76.6, // 0.20 * 382 ~ 76.4-76.6
    aimZoneFill: 'rgba(0, 0, 0, 0.12)',
    aimZoneStroke: 'rgba(255, 255, 255, 0.30)',
    aimArrowStroke: 5,
    aimArrowGradientStart: '#FF7A00',
    aimArrowGradientEnd: '#FFD84A',
    arrowheadLength: 13,
    arrowheadHalfWidth: 6.5,
    postContactDotDiameter: 3.2,
    postContactDotSpacing: 7.5,
    pullbackTrailLength: 60,
    pullbackTrailOpacity: 0.45,
    aimingSliderTrackDim: 0.55,
    aimingSliderKnobDim: 0.45,
  },
} as const;

/**
 * Derives scaled dimensions for a given screen width.
 */
export function getLayoutScale(screenWidth: number) {
  const s = screenWidth / LAYOUT_CONFIG.DESIGN_FRAME.width;
  return {
    s,
    boardSize: Math.round(LAYOUT_CONFIG.BOARD.frameWidth * s),
    scaleValue: (val: number) => Math.round(val * s),
  };
}

