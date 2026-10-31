import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';
import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';

export interface MotionCallbacks {
  onStrikerStopped?: () => void;
  onAllObjectsStopped?: () => void;
  onShotSettled?: () => void;
  onCoinMoved?: (coinId: string) => void;
}

export class MotionDetector {
  private callbacks: MotionCallbacks;
  private isShotActive: boolean = false;
  private isStrikerMoving: boolean = false;
  private isAnyCoinMoving: boolean = false;
  private restStartTime: number = 0;
  private hasReportedAllStopped: boolean = false;
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
    this.shotStartTime = Date.now();
  }

  public update(striker: Striker, coins: Coin[]): void {
    if (!this.isShotActive) return;

    const linearThreshold = PHYSICS_CONFIG.motion.linearRestThreshold;
    const angularThreshold = PHYSICS_CONFIG.motion.angularRestThreshold;

    // Check striker motion
    let strikerMoving = false;
    if (striker.physicsBody && !striker.isPocketed) {
      const speed = Math.hypot(striker.physicsBody.velocity.x, striker.physicsBody.velocity.y);
      const av = Math.abs(striker.physicsBody.angularVelocity);
      strikerMoving = speed >= linearThreshold || av >= angularThreshold;
    }

    if (this.isStrikerMoving && !strikerMoving) {
      this.isStrikerMoving = false;
      this.callbacks.onStrikerStopped?.();
    } else {
      this.isStrikerMoving = strikerMoving;
    }

    // Check coins motion
    let anyCoinMoving = false;
    coins.forEach((coin) => {
      if (!coin.physicsBody || coin.isPocketed) return;

      const speed = Math.hypot(coin.physicsBody.velocity.x, coin.physicsBody.velocity.y);
      const av = Math.abs(coin.physicsBody.angularVelocity);
      const moving = speed >= linearThreshold || av >= angularThreshold;

      if (moving) {
        anyCoinMoving = true;
        this.callbacks.onCoinMoved?.(coin.id);
      }
    });

    this.isAnyCoinMoving = anyCoinMoving;
    const allStopped = !strikerMoving && !anyCoinMoving;
    const now = Date.now();

    // Failsafe timeout to prevent infinite shot locking
    const shotDuration = now - this.shotStartTime;
    if (shotDuration > PHYSICS_CONFIG.motion.maxShotDurationMs) {
      this.isShotActive = false;
      this.callbacks.onShotSettled?.();
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

      // Check stable settling cooldown
      const restDuration = now - this.restStartTime;
      if (restDuration >= PHYSICS_CONFIG.motion.settledCooldownMs) {
        this.isShotActive = false;
        this.restStartTime = 0;
        this.callbacks.onShotSettled?.();
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
