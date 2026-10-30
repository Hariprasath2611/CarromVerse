import Phaser from 'phaser';
import { PlayerSeat, Vector2D } from '@carromverse/shared-types';
import { clamp, distance } from '@carromverse/shared-utils';
import { StrikerEntity } from '../entities/StrikerEntity.js';

export interface InputCallbacks {
  onAimChange: (angle: number, power: number) => void;
  onFire: (angle: number, power: number) => void;
  onPositionChange: (normalizedPos: number) => void;
}

export class InputManager {
  private scene: Phaser.Scene;
  private striker: StrikerEntity;
  private callbacks: InputCallbacks;
  private isAiming: boolean = false;
  private dragStart: Vector2D = { x: 0, y: 0 };
  private maxDragDistance: number = 180;
  private isInteractive: boolean = true;

  constructor(scene: Phaser.Scene, striker: StrikerEntity, callbacks: InputCallbacks) {
    this.scene = scene;
    this.striker = striker;
    this.callbacks = callbacks;
    this.setupListeners();
  }

  private setupListeners(): void {
    const input = this.scene.input;

    input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isInteractive || this.striker.isPocketed) return;

      const strikerPos = this.striker.body.position;
      const d = distance({ x: pointer.x, y: pointer.y }, strikerPos);

      // If user taps near striker, start aiming
      if (d < 80) {
        this.isAiming = true;
        this.dragStart = { x: pointer.x, y: pointer.y };
      }
    });

    input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isAiming || !this.isInteractive) return;

      const current = { x: pointer.x, y: pointer.y };
      const dx = this.dragStart.x - current.x;
      const dy = this.dragStart.y - current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        // Reverse direction for slingshot cue pull
        const angle = Math.atan2(dx, -dy) - Math.PI / 2;
        const power = clamp(dist / this.maxDragDistance, 0.05, 1.0);

        this.striker.drawAimIndicator(angle, power);
        this.callbacks.onAimChange(angle, power);
      }
    });

    input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isAiming || !this.isInteractive) return;
      this.isAiming = false;

      const current = { x: pointer.x, y: pointer.y };
      const dx = this.dragStart.x - current.x;
      const dy = this.dragStart.y - current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 15) {
        const angle = Math.atan2(dx, -dy) - Math.PI / 2;
        const power = clamp(dist / this.maxDragDistance, 0.1, 1.0);

        this.callbacks.onFire(angle, power);
      } else {
        this.striker.clearAimIndicator();
      }
    });
  }

  public setInteractive(enabled: boolean): void {
    this.isInteractive = enabled;
    if (!enabled) {
      this.isAiming = false;
      this.striker.clearAimIndicator();
    }
  }
}
