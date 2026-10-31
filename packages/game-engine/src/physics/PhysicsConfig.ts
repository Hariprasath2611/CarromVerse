/**
 * Centralized physics configuration for CarromVerse.
 * Calibrated for realistic tournament carrom board dynamics with boric powder.
 */

export interface MaterialPhysicsConfig {
  restitution: number;
  friction: number;
  frictionAir: number;
  frictionStatic: number;
  density: number;
}

export const PHYSICS_CONFIG = {
  // World Simulation Parameters
  world: {
    gravity: { x: 0, y: 0 },
    fixedTimeStep: 1000 / 60, // 60 FPS fixed simulation step (~16.67ms)
    velocityIterations: 12,   // High precision iterative constraint solver
    positionIterations: 12,
    enableSleeping: true,
  },

  // Cushions / Board Frame Boundaries
  cushions: {
    restitution: 0.90,        // Resilient rubber-backed wood cushion rebound
    friction: 0.04,           // Low friction along smooth rails
    frictionAir: 0,
    frictionStatic: 0.05,
    density: 0.2,             // Static / immovable mass
  } as MaterialPhysicsConfig,

  // Carrom Coins (White, Black, Queen)
  coins: {
    restitution: 0.93,        // High elastic restitution for wood-on-wood collision
    friction: 0.035,          // Gliding friction on boric powder
    frictionAir: 0.018,       // Natural decelerating aerodynamic/surface resistance
    frictionStatic: 0.045,
    density: 0.0025,          // Scaled mass ~5.5 grams
    massRatio: 1.0,           // Base unit mass
  } as MaterialPhysicsConfig & { massRatio: number },

  // Striker (Acrylic tournament striker)
  striker: {
    restitution: 0.95,        // Hard acrylic sharp rebound
    friction: 0.028,          // Ultra-smooth polished base
    frictionAir: 0.014,       // Slides further than coins due to greater momentum
    frictionStatic: 0.035,
    density: 0.0075,          // ~3x heavier than coins (~15.0 grams)
    massRatio: 2.73,          // Exact ICF ratio ~15g / 5.5g
  } as MaterialPhysicsConfig & { massRatio: number },

  // Aiming & Shooting Dynamics
  shooting: {
    minDragDistance: 12,      // Min drag pixels to initiate aim
    maxDragDistance: 150,     // Max pull-back drag distance
    minShotPower: 1.5,        // Minimum impulse magnitude
    maxShotPower: 28.0,       // Maximum tournament strike impulse
    powerScale: 0.18,         // Drag distance to impulse multiplier
    dragDeadzone: 6,          // Tiny jitter suppression
  },

  // Motion Detection & Rest Thresholds
  motion: {
    linearRestThreshold: 0.07,     // Below this speed (px/step), body is considered stopped
    angularRestThreshold: 0.04,    // Below this rad/step, angular rotation is considered stopped
    settledCooldownMs: 250,        // Duration all bodies must remain still before SHOT_SETTLED
    maxShotDurationMs: 12000,      // Failsafe timeout to force settling after 12s
  },

  // Pocket Sensing
  pocket: {
    sensorRadiusRatio: 0.038,      // Matches pocket geometry ratio
    captureRadiusRatio: 0.032,     // Distance to pocket center triggering entry
    sinkAnimationDurationMs: 280,  // Scale-down & fade visual duration
  },
} as const;
