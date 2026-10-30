/**
 * Matter.js physics properties calibrated for realistic Carrom board dynamics:
 * - Ultra-smooth gliding across polished plywood with boric powder
 * - High elastic collision response (restitution ~ 0.92 - 0.95)
 * - Gentle aerodynamic / board friction damping
 */

export interface PhysicsMaterialConfig {
  restitution: number;
  friction: number;
  frictionAir: number;
  frictionStatic: number;
  density: number;
}

export const CUSHION_PHYSICS: PhysicsMaterialConfig = {
  restitution: 0.92,        // High rebound off wooden cushions
  friction: 0.05,
  frictionAir: 0,
  frictionStatic: 0.05,
  density: 0.1,
};

export const COIN_PHYSICS: PhysicsMaterialConfig = {
  restitution: 0.94,        // High bounciness between wooden carrom men
  friction: 0.04,           // Low friction on powdered board
  frictionAir: 0.015,       // Gradual deceleration
  frictionStatic: 0.05,
  density: 0.002,           // Standard weight (~5.5 grams scaled)
};

export const STRIKER_PHYSICS: PhysicsMaterialConfig = {
  restitution: 0.95,        // Hard acrylic striker rebound
  friction: 0.03,
  frictionAir: 0.012,       // Slides slightly longer than coins
  frictionStatic: 0.04,
  density: 0.006,           // ~3x heavier than coins (~15 grams scaled)
};

export const WORLD_PHYSICS_CONFIG = {
  gravity: { x: 0, y: 0, scale: 0 }, // Top-down carrom has zero gravity
  velocityIterations: 10,            // High precision collision solver
  positionIterations: 10,
  restVelocityThreshold: 0.08,       // Velocity below which body is considered at rest
};
