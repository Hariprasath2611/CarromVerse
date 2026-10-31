import { SPEEDS, SIMULATION, PX_PER_CM } from '../physics/PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';
import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';

export interface MotionCallbacks {
  onStrikerStopped?: () => void;
  onAllObjectsStopped?: () => void;
  onShotSettled?: (data: { durationMs: number }) => void;
  onCoinMoved?: (coinId: string) => void;
}

export class MotionDetector {
  private callbacks: MotionCallbacks;
  private isShotActive: boolean = false;
  private isStrikerMoving: boolean = false;
  private isAnyCoinMoving: boolean = false;
  private restStartTime: number = 0;
  private hasReportedAllStopped: boolean = false;
  private hasReportedSettled: boolean = false;
  private shotStartTime: number = 0;

  constructor(callbacks: MotionCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public notifyShotStarted(): void {
    this.isShotActive = true;
    this.isStrikerMoving = true;
    this.isAnyCoinMoving = false;
    this.restStartTime = 0;
    this.hasReportedAllStopped = false;
    this.hasReportedSettled = false;
    this.shotStartTime = Date.now();
  }

  public update(striker: Striker, coins: Coin[], subDtSeconds: number = SIMULATION.baseDtSeconds): void {
    if (!this.isShotActive) return;

    const linearThresholdCmS = SPEEDS.restSpeedThresholdCmS;
    const angularThresholdRadS = SPEEDS.angularRestThresholdRadS;

    // 1. Check striker motion
    let strikerMoving = false;
    if (striker.physicsBody && !striker.isPocketed) {
      const stepSpeed = Math.hypot(striker.physicsBody.velocity.x, striker.physicsBody.velocity.y);
      const speedCmS = PhysicsUtils.stepVelocityToSpeedCmS(stepSpeed, subDtSeconds, PX_PER_CM);
      const av = Math.abs(striker.physicsBody.angularVelocity);
      strikerMoving = speedCmS >= linearThresholdCmS || av >= angularThresholdRadS;
    }

    if (this.isStrikerMoving && !strikerMoving) {
      this.isStrikerMoving = false;
      this.callbacks.onStrikerStopped?.();
    } else {
      this.isStrikerMoving = strikerMoving;
    }

    // 2. Check coins motion
    let anyCoinMoving = false;
    coins.forEach((coin) => {
      if (!coin.physicsBody || coin.isPocketed) return;

      const stepSpeed = Math.hypot(coin.physicsBody.velocity.x, coin.physicsBody.velocity.y);
      const speedCmS = PhysicsUtils.stepVelocityToSpeedCmS(stepSpeed, subDtSeconds, PX_PER_CM);
      const av = Math.abs(coin.physicsBody.angularVelocity);
      const moving = speedCmS >= linearThresholdCmS || av >= angularThresholdRadS;

      if (moving) {
        anyCoinMoving = true;
        this.callbacks.onCoinMoved?.(coin.id);
      }
    });

    this.isAnyCoinMoving = anyCoinMoving;
    const allStopped = !strikerMoving && !anyCoinMoving;
    const now = Date.now();
    const shotDuration = now - this.shotStartTime;

    // Failsafe timeout to prevent infinite shot locking
    if (shotDuration > SIMULATION.maxShotDurationMs) {
      if (!this.hasReportedSettled) {
        this.hasReportedSettled = true;
        this.isShotActive = false;
        this.callbacks.onShotSettled?.({ durationMs: shotDuration });
      }
      return;
    }

    if (allStopped) {
      if (this.restStartTime === 0) {
        this.restStartTime = now;
      }

      if (!this.hasReportedAllStopped) {
        this.hasReportedAllStopped = true;
        this.callbacks.onAllObjectsStopped?.();
      }

      // Check stable settling cooldown (300 ms continuous rest)
      const restDuration = now - this.restStartTime;
      if (restDuration >= SIMULATION.settledCooldownMs) {
        if (!this.hasReportedSettled) {
          this.hasReportedSettled = true;
          this.isShotActive = false;
          this.restStartTime = 0;
          this.callbacks.onShotSettled?.({ durationMs: shotDuration });
        }
      }
    } else {
      // Something is still moving, reset resting timer
      this.restStartTime = 0;
      this.hasReportedAllStopped = false;
    }
  }

  public isBoardAtRest(): boolean {
    return !this.isShotActive && !this.isStrikerMoving && !this.isAnyCoinMoving;
  }

  public isShotInProgress(): boolean {
    return this.isShotActive;
  }
}
