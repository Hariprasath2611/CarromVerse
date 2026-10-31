import { Striker } from '../entities/Striker.js';
import { AimState } from './AimingController.js';
import { MotionDetector } from './MotionDetector.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';

export interface ShotResult {
  success: boolean;
  power?: number;
  angle?: number;
  impulse?: { x: number; y: number };
  reason?: 'board_not_at_rest' | 'insufficient_power' | 'striker_missing_body';
}

export type ShotStartedCallback = (result: ShotResult) => void;

export class ShootingController {
  private striker: Striker;
  private motionDetector: MotionDetector;
  private onShotStarted?: ShotStartedCallback;

  constructor(
    striker: Striker,
    motionDetector: MotionDetector,
    onShotStarted?: ShotStartedCallback
  ) {
    this.striker = striker;
    this.motionDetector = motionDetector;
    this.onShotStarted = onShotStarted;
  }

  public shoot(aim: AimState): ShotResult {
    // 1. Prevent shooting if previous shot is still in motion
    if (!this.motionDetector.isBoardAtRest()) {
      return { success: false, reason: 'board_not_at_rest' };
    }

    // 2. Validate minimum power threshold
    if (aim.normalizedPower <= 0.05 || aim.power < PHYSICS_CONFIG.shooting.minShotPower) {
      return { success: false, reason: 'insufficient_power' };
    }

    if (!this.striker.physicsBody) {
      return { success: false, reason: 'striker_missing_body' };
    }

    // 3. Compute directional impulse force vector
    const power = Math.min(PHYSICS_CONFIG.shooting.maxShotPower, aim.power);
    const fx = Math.cos(aim.angle) * power * PHYSICS_CONFIG.shooting.powerScale;
    const fy = Math.sin(aim.angle) * power * PHYSICS_CONFIG.shooting.powerScale;

    // 4. Apply impulse to striker body
    this.striker.applyImpulse(fx, fy);

    // 5. Notify motion detector that shot has begun
    this.motionDetector.notifyShotStarted();

    const result: ShotResult = {
      success: true,
      power,
      angle: aim.angle,
      impulse: { x: fx, y: fy },
    };

    this.onShotStarted?.(result);
    return result;
  }
}

