import { Vector2D } from './coin.js';

export type StrikerState =
  | 'placing'    // Player sliding striker along their assigned baseline
  | 'aiming'     // Aim line being dragged
  | 'charging'   // Power gauge active
  | 'in_motion'  // Physical simulation running
  | 'settled';   // All bodies on board have come to a complete rest

export interface Striker {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  angle: number;           // Aim direction angle in radians
  power: number;           // Impulse force (0.0 to 1.0)
  state: StrikerState;
  baselineNormalizedPos: number; // 0.0 (left) to 1.0 (right) along active baseline
  radius: number;
  mass: number;
}

export interface AimGuide {
  origin: Vector2D;
  direction: Vector2D;
  length: number;
  power: number;
  predictedBounce?: Vector2D[];
}
