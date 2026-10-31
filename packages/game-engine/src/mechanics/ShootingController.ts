import { Striker } from '../entities/Striker.js';
import { AimState } from './AimingController.js';
import { MotionDetector } from './MotionDetector.js';
import { SPEEDS, PX_PER_CM, SIMULATION } from '../physics/PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';

export interface ShotResult {
  success: boolean;
  power?: number;
  speed_cm_s?: number;
  angle?: number;
  velocityStep?: { x: number; y: number };
  reason?: 'board_not_at_rest' | 'insufficient_power' | 'striker_missing_body' | 'blocked_by_overlap';
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

    // 2. Prevent shooting if overlapping a coin
    if (aim.isBlockedByOverlap) {
      return { success: false, reason: 'blocked_by_overlap' };
    }

    // 3. Validate minimum power threshold
    if (aim.normalizedPower <= 0.05 || aim.speedCmS < SPEEDS.strikerMinLaunchSpeedCmS) {
      return { success: false, reason: 'insufficient_power' };
    }

    if (!this.striker.physicsBody) {
      return { success: false, reason: 'striker_missing_body' };
    }

    // 4. Compute physical velocity vector in cm/s, then convert to px/step
    const speedCmS = Math.min(SPEEDS.strikerMaxLaunchSpeedCmS, Math.max(SPEEDS.strikerMinLaunchSpeedCmS, aim.speedCmS));
    const vxCmS = Math.cos(aim.angle) * speedCmS;
    const vyCmS = Math.sin(aim.angle) * speedCmS;

    const vStep = PhysicsUtils.velocityCmSToStepVector(vxCmS, vyCmS, SIMULATION.baseDtSeconds, PX_PER_CM);

    // 5. Directly set velocity on striker (no arbitrary forces)
    this.striker.setVelocity(vStep.x, vStep.y);

    // 6. Notify motion detector that shot has begun
    this.motionDetector.notifyShotStarted();

    const result: ShotResult = {
      success: true,
      power: speedCmS,
      speed_cm_s: speedCmS,
      angle: aim.angle,
      velocityStep: vStep,
    };

    this.onShotStarted?.(result);
    return result;
  }
}
