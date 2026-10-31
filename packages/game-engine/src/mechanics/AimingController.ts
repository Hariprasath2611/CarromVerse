import { Striker } from '../entities/Striker.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';
import { VectorUtils } from '../utils/VectorUtils.js';

export interface AimState {
  isAiming: boolean;
  angle: number;
  power: number;
  normalizedPower: number; // 0 to 1
  dragVector: { x: number; y: number };
}

export type AimCallback = (aimState: AimState) => void;

export class AimingController {
  private striker: Striker;
  private onAimChanged?: AimCallback;
  private isAiming: boolean = false;
  private startPoint: { x: number; y: number } = { x: 0, y: 0 };
  private currentAim: AimState = {
    isAiming: false,
    angle: -Math.PI / 2,
    power: 0,
    normalizedPower: 0,
    dragVector: { x: 0, y: 0 },
  };

  constructor(striker: Striker, onAimChanged?: AimCallback) {
    this.striker = striker;
    this.onAimChanged = onAimChanged;
  }

  public startAim(pointerX: number, pointerY: number): boolean {
    const pos = this.striker.getPixelPosition();
    const radius = this.striker.getRadius();

    // Check if touch starts within striker or touch handle vicinity
    const dist = VectorUtils.distance(pointerX, pointerY, pos.x, pos.y);
    if (dist <= radius * 2.2) {
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

    if (dist < PHYSICS_CONFIG.shooting.dragDeadzone) {
      this.currentAim = {
        isAiming: true,
        angle: -Math.PI / 2,
        power: 0,
        normalizedPower: 0,
        dragVector: { x: 0, y: 0 },
      };
      this.striker.renderAimRay(0, true);
      this.onAimChanged?.(this.currentAim);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, PHYSICS_CONFIG.shooting.maxDragDistance);
    const normalizedPower =
      (clampedDist - PHYSICS_CONFIG.shooting.dragDeadzone) /
      (PHYSICS_CONFIG.shooting.maxDragDistance - PHYSICS_CONFIG.shooting.dragDeadzone);

    const power =
      PHYSICS_CONFIG.shooting.minShotPower +
      normalizedPower * (PHYSICS_CONFIG.shooting.maxShotPower - PHYSICS_CONFIG.shooting.minShotPower);

    this.currentAim = {
      isAiming: true,
      angle,
      power,
      normalizedPower: Math.max(0, Math.min(1, normalizedPower)),
      dragVector: { x: dx, y: dy },
    };

    this.striker.setAimAngle(angle);
    this.striker.renderAimRay(this.currentAim.normalizedPower, true);
    this.onAimChanged?.(this.currentAim);
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
