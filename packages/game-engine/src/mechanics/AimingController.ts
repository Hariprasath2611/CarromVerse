import { Striker } from '../entities/Striker.js';
import { Coin } from '../entities/Coin.js';
import { SPEEDS, SIZES, PX_PER_CM, SIMULATION } from '../physics/PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';
import { VectorUtils } from '../utils/VectorUtils.js';

export interface AimState {
  isAiming: boolean;
  angle: number;
  power: number;
  normalizedPower: number; // 0 to 1
  speedCmS: number;        // Direct launch speed in cm/s (40 to 350)
  dragVector: { x: number; y: number };
  contactPoint?: { x: number; y: number };
  targetType?: 'coin' | 'wall' | 'none';
  isBlockedByOverlap?: boolean;
}

export type AimCallback = (aimState: AimState) => void;

export class AimingController {
  private striker: Striker;
  private coins: Coin[] = [];
  private onAimChanged?: AimCallback;
  private isAiming: boolean = false;
  private startPoint: { x: number; y: number } = { x: 0, y: 0 };
  private isBlockedByOverlap: boolean = false;
  private currentAim: AimState = {
    isAiming: false,
    angle: -Math.PI / 2,
    power: 0,
    normalizedPower: 0,
    speedCmS: SPEEDS.strikerMinLaunchSpeedCmS,
    dragVector: { x: 0, y: 0 },
    isBlockedByOverlap: false,
  };

  constructor(striker: Striker, onAimChanged?: AimCallback) {
    this.striker = striker;
    this.onAimChanged = onAimChanged;
  }

  public setCoins(coins: Coin[]): void {
    this.coins = coins;
  }

  public setOverlapBlocked(blocked: boolean): void {
    this.isBlockedByOverlap = blocked;
    this.currentAim.isBlockedByOverlap = blocked;
  }

  public startAim(pointerX: number, pointerY: number): boolean {
    if (this.isBlockedByOverlap) return false;

    const pos = this.striker.getPixelPosition();
    const radius = this.striker.getRadius();

    const dist = VectorUtils.distance(pointerX, pointerY, pos.x, pos.y);
    if (dist <= radius * 2.5) {
      this.isAiming = true;
      this.startPoint = { x: pointerX, y: pointerY };
      this.updateAim(pointerX, pointerY);
      return true;
    }
    return false;
  }

  public updateAim(pointerX: number, pointerY: number): void {
    if (!this.isAiming) return;

    // Pull-back vector (slingshot direction: drag opposite to shot direction)
    const dx = this.startPoint.x - pointerX;
    const dy = this.startPoint.y - pointerY;
    const dist = Math.hypot(dx, dy);

    if (dist < SPEEDS.dragDeadzonePx) {
      this.currentAim = {
        isAiming: true,
        angle: -Math.PI / 2,
        power: 0,
        normalizedPower: 0,
        speedCmS: SPEEDS.strikerMinLaunchSpeedCmS,
        dragVector: { x: 0, y: 0 },
        isBlockedByOverlap: this.isBlockedByOverlap,
      };
      this.striker.renderAimRay(0, true);
      this.onAimChanged?.(this.currentAim);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const maxDragPx = SPEEDS.maxDragDistancePx;
    const clampedDist = Math.min(dist, maxDragPx);
    const normalizedPower = Math.max(
      0,
      Math.min(1, (clampedDist - SPEEDS.dragDeadzonePx) / (maxDragPx - SPEEDS.dragDeadzonePx))
    );

    // Physical speed in cm/s (40 to 350 cm/s)
    const speedCmS =
      SPEEDS.strikerMinLaunchSpeedCmS +
      normalizedPower * (SPEEDS.strikerMaxLaunchSpeedCmS - SPEEDS.strikerMinLaunchSpeedCmS);

    // Compute raycast contact point against coins and walls
    const raycastHit = this.computeRaycastContact(angle);

    this.currentAim = {
      isAiming: true,
      angle,
      power: speedCmS,
      normalizedPower,
      speedCmS,
      dragVector: { x: dx, y: dy },
      contactPoint: raycastHit.contactPoint,
      targetType: raycastHit.targetType,
      isBlockedByOverlap: this.isBlockedByOverlap,
    };

    this.striker.setAimAngle(angle);
    this.striker.renderAimRay(this.currentAim.normalizedPower, true);
    this.onAimChanged?.(this.currentAim);
  }

  /**
   * Raycast along the aim direction from striker position to find the first collision contact.
   */
  public computeRaycastContact(angle: number): {
    contactPoint: { x: number; y: number };
    targetType: 'coin' | 'wall' | 'none';
  } {
    const sPos = this.striker.getPixelPosition();
    const sRadius = this.striker.getRadius();
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let nearestDist = 800; // Large default
    let targetType: 'coin' | 'wall' | 'none' = 'none';

    // 1. Check against active coins on the board
    this.coins.forEach((coin) => {
      if (coin.isPocketed) return;
      const cPos = coin.getPixelPosition();
      const cRadius = coin.getRadius();
      const combinedRadius = sRadius + cRadius;

      // Vector from striker to coin center
      const toCoinX = cPos.x - sPos.x;
      const toCoinY = cPos.y - sPos.y;

      // Projection along ray direction
      const proj = toCoinX * cosA + toCoinY * sinA;
      if (proj <= 0) return; // Behind the striker

      // Perpendicular distance squared
      const perpSq = (toCoinX * toCoinX + toCoinY * toCoinY) - proj * proj;
      if (perpSq <= combinedRadius * combinedRadius) {
        // Intersects! Distance along ray to contact point
        const halfChord = Math.sqrt(Math.max(0, combinedRadius * combinedRadius - perpSq));
        const hitDist = proj - halfChord;
        if (hitDist > 0 && hitDist < nearestDist) {
          nearestDist = hitDist;
          targetType = 'coin';
        }
      }
    });

    // 2. Check against board cushions (740px playable area, e.g. [50, 790])
    // If no coin hit was closer, check wall distance
    const boardMin = 50 + sRadius;
    const boardMax = 790 - sRadius;

    let wallDist = 800;
    if (cosA > 0.001) {
      wallDist = Math.min(wallDist, (boardMax - sPos.x) / cosA);
    } else if (cosA < -0.001) {
      wallDist = Math.min(wallDist, (boardMin - sPos.x) / cosA);
    }

    if (sinA > 0.001) {
      wallDist = Math.min(wallDist, (boardMax - sPos.y) / sinA);
    } else if (sinA < -0.001) {
      wallDist = Math.min(wallDist, (boardMin - sPos.y) / sinA);
    }

    if (wallDist > 0 && wallDist < nearestDist) {
      nearestDist = wallDist;
      targetType = 'wall';
    }

    return {
      contactPoint: {
        x: sPos.x + cosA * nearestDist,
        y: sPos.y + sinA * nearestDist,
      },
      targetType,
    };
  }

  public releaseAim(): AimState | null {
    if (!this.isAiming) return null;

    const finalAim = { ...this.currentAim };
    this.isAiming = false;
    this.currentAim.isAiming = false;
    this.striker.renderAimRay(0, false);

    return finalAim;
  }

  public cancelAim(): void {
    this.isAiming = false;
    this.currentAim.isAiming = false;
    this.striker.renderAimRay(0, false);
  }

  public getAimState(): AimState {
    return this.currentAim;
  }
}
