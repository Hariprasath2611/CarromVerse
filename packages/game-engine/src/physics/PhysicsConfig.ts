/**
 * Centralized physics configuration for CarromVerse.
 * Single source of truth calibrated for tournament carrom board dynamics with boric powder.
 * Real carrom standard: ICF (International Carrom Federation) specifications.
 */

// 1. Board & Unit Scale
export const BOARD_PX = 740; // Playable surface width in canvas pixels
export const BOARD_CM = 74;  // Playable surface width in cm (ICF standard: 74cm x 74cm)
export const PX_PER_CM = BOARD_PX / BOARD_CM; // Exactly 10.0 px per cm

// 2. Physical Dimensions (in cm and px)
export const SIZES = {
  // Coin: 3.1 cm diameter -> 1.55 cm radius
  coinDiameterCm: 3.1,
  coinRadiusCm: 1.55,
  coinRadiusPx: 1.55 * PX_PER_CM, // 15.5 px

  // Striker: 4.1 cm diameter -> 2.05 cm radius
  strikerDiameterCm: 4.1,
  strikerRadiusCm: 2.05,
  strikerRadiusPx: 2.05 * PX_PER_CM, // 20.5 px

  // Pocket: 4.5 cm diameter hole -> 2.25 cm radius
  pocketDiameterCm: 4.5,
  pocketRadiusCm: 2.25,
  pocketRadiusPx: 2.25 * PX_PER_CM, // 22.5 px

  // Wall / Cushion: >= 5 cm thick outside playing surface
  wallThicknessCm: 5.0,
  wallThicknessPx: 5.0 * PX_PER_CM, // 50.0 px
} as const;

// 3. Masses (in relative units, ratio 3:1)
export const MASSES = {
  coin: 5.0,     // Real carrom coin ~5.0 - 5.5 grams
  striker: 15.0, // Real tournament striker ~15.0 grams (ratio 3:1)
  cushion: Infinity,
} as const;

// 4. Speeds (all in cm/s)
export const SPEEDS = {
  strikerMinLaunchSpeedCmS: 40.0,   // Min gentle strike speed
  strikerMaxLaunchSpeedCmS: 350.0,  // Max tournament break strike speed
  restSpeedThresholdCmS: 2.0,       // Below this speed (cm/s), snap to zero
  angularRestThresholdRadS: 0.05,   // Below this rad/s, snap angular velocity to zero
  maxDragDistanceCm: 12.0,          // Drag pull-back distance corresponding to max speed
  maxDragDistancePx: 12.0 * PX_PER_CM, // 120 px
  dragDeadzonePx: 8.0,
} as const;

// 5. Friction & Damping Dynamics
export const FRICTION = {
  // Coulomb surface friction: constant deceleration against velocity direction
  decelerationCmS2: 90.0, // 90.0 cm/s^2 (stopping 100 cm/s in ~1.0 s over ~50 cm)
  // Viscous damping (air and micro powder drag)
  viscousDamping: 0.15,
  // Rotational angular damping
  angularDampingPerSec: 6.0,
  angularDampingPerStep: 0.90, // Multiplier per 60Hz step
  // Matter.js surface friction parameters
  bodyFriction: 0.01,
  bodyFrictionStatic: 0.0,
  bodyFrictionAir: 0.0, // Set to 0 so custom Coulomb + viscous model controls glide
} as const;

// 6. Restitution & Elasticity
export const RESTITUTION = {
  coinToCoin: 0.88,        // Elastic wood-on-wood collision
  strikerToCoin: 0.88,     // Polished acrylic-on-wood collision
  wallBounceDamping: 0.65, // Rubber-backed cushion absorbs ~35% of normal energy (retains 65%)
  wallRestitution: 0.0,    // Managed by WALL_BOUNCE_DAMPING
} as const;

// 7. Pockets Dynamics
export const POCKET = {
  sensorRadiusRatio: 1.0,         // Matches pocket radius
  captureRadiusRatio: 0.85,       // Center distance <= 0.85 * r triggers capture
  suctionRadiusRatio: 1.20,       // Center distance <= 1.20 * r triggers suction pull
  suctionAccelCmS2: 80.0,         // Gentle suction acceleration towards hole center
  sinkAnimationDurationMs: 250,   // Visual fade/scale duration
} as const;

// 8. Timestep, Substepping & Solver Precision
export const SIMULATION = {
  baseDtSeconds: 1 / 60,          // 60 Hz base simulation step
  baseDtMs: 1000 / 60,
  maxSubsteps: 10,                // Adaptive substep cap
  maxDisplacementRatio: 0.5,      // Fastest body moves <= 0.5 * coinRadius per substep
  positionIterations: 8,          // Matter constraint solver position iterations
  velocityIterations: 6,          // Matter constraint solver velocity iterations
  settledCooldownMs: 300,         // Duration all bodies must remain still before SHOT_SETTLED
  maxShotDurationMs: 12000,       // Failsafe timeout to force settling
} as const;

// Unified PHYSICS_CONFIG object for backward-compatible access across modules
export const PHYSICS_CONFIG = {
  board: {
    sizePx: BOARD_PX,
    sizeCm: BOARD_CM,
    pxPerCm: PX_PER_CM,
  },
  sizes: SIZES,
  masses: MASSES,
  speeds: SPEEDS,
  friction: FRICTION,
  restitution: RESTITUTION,
  pocket: {
    radiusCm: SIZES.pocketRadiusCm,
    radiusPx: SIZES.pocketRadiusPx,
    sensorRadiusRatio: POCKET.sensorRadiusRatio,
    captureRadiusRatio: POCKET.captureRadiusRatio,
    suctionRadiusRatio: POCKET.suctionRadiusRatio,
    suctionAccelCmS2: POCKET.suctionAccelCmS2,
    sinkAnimationDurationMs: POCKET.sinkAnimationDurationMs,
  },
  world: {
    gravity: { x: 0, y: 0 },
    fixedTimeStep: SIMULATION.baseDtMs,
    positionIterations: SIMULATION.positionIterations,
    velocityIterations: SIMULATION.velocityIterations,
    maxSubsteps: SIMULATION.maxSubsteps,
    enableSleeping: false, // Disabled to prevent premature sleeping during continuous deceleration
  },
  cushions: {
    restitution: RESTITUTION.wallRestitution,
    normalRetention: RESTITUTION.wallBounceDamping,
    thicknessCm: SIZES.wallThicknessCm,
    thicknessPx: SIZES.wallThicknessPx,
    friction: 0.0,
    frictionAir: 0.0,
    frictionStatic: 0.0,
    density: 0.2,
  },
  coins: {
    radiusCm: SIZES.coinRadiusCm,
    radiusPx: SIZES.coinRadiusPx,
    mass: MASSES.coin,
    density: 0.0025,
    restitution: RESTITUTION.coinToCoin,
    friction: FRICTION.bodyFriction,
    frictionAir: FRICTION.bodyFrictionAir,
    frictionStatic: FRICTION.bodyFrictionStatic,
    massRatio: 1.0,
  },
  striker: {
    radiusCm: SIZES.strikerRadiusCm,
    radiusPx: SIZES.strikerRadiusPx,
    mass: MASSES.striker,
    density: 0.0075,
    restitution: RESTITUTION.strikerToCoin,
    friction: FRICTION.bodyFriction,
    frictionAir: FRICTION.bodyFrictionAir,
    frictionStatic: FRICTION.bodyFrictionStatic,
    massRatio: 3.0,
  },
  shooting: {
    minDragDistance: SPEEDS.dragDeadzonePx,
    maxDragDistance: SPEEDS.maxDragDistancePx,
    minLaunchSpeedCmS: SPEEDS.strikerMinLaunchSpeedCmS,
    maxLaunchSpeedCmS: SPEEDS.strikerMaxLaunchSpeedCmS,
    minShotPower: SPEEDS.strikerMinLaunchSpeedCmS,
    maxShotPower: SPEEDS.strikerMaxLaunchSpeedCmS,
    powerScale: 1.0,
    dragDeadzone: SPEEDS.dragDeadzonePx,
  },
  motion: {
    linearRestThreshold: SPEEDS.restSpeedThresholdCmS,
    linearRestThresholdPxStep: (SPEEDS.restSpeedThresholdCmS * PX_PER_CM * SIMULATION.baseDtSeconds),
    angularRestThreshold: SPEEDS.angularRestThresholdRadS,
    settledCooldownMs: SIMULATION.settledCooldownMs,
    maxShotDurationMs: SIMULATION.maxShotDurationMs,
  },
} as const;
