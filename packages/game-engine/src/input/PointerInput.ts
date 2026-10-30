import * as Phaser from 'phaser';
import { NormalizedCoordinate, Vector2D } from '../types/GameTypes.js';

export interface PointerInputEvents {
  onPointerDown?: (coord: NormalizedCoordinate, rawPixel: Vector2D) => void;
  onPointerMove?: (coord: NormalizedCoordinate, rawPixel: Vector2D, isDragging: boolean) => void;
  onPointerUp?: (coord: NormalizedCoordinate, rawPixel: Vector2D) => void;
}

export class PointerInput {
  private scene: Phaser.Scene;
  private canvasSize: number;
  private isPointerDown: boolean = false;
  private callbacks: PointerInputEvents;

  constructor(scene: Phaser.Scene, canvasSize: number, callbacks: PointerInputEvents = {}) {
    this.scene = scene;
    this.canvasSize = canvasSize;
    this.callbacks = callbacks;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      const norm = this.toNormalized(pointer.x, pointer.y);
      this.callbacks.onPointerDown?.(norm, { x: pointer.x, y: pointer.y });
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const norm = this.toNormalized(pointer.x, pointer.y);
      this.callbacks.onPointerMove?.(norm, { x: pointer.x, y: pointer.y }, this.isPointerDown);
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = false;
      const norm = this.toNormalized(pointer.x, pointer.y);
      this.callbacks.onPointerUp?.(norm, { x: pointer.x, y: pointer.y });
    });
  }

  public updateCanvasSize(size: number): void {
    this.canvasSize = size;
  }

  private toNormalized(x: number, y: number): NormalizedCoordinate {
    return {
      nx: Math.max(0, Math.min(1, x / this.canvasSize)),
      ny: Math.max(0, Math.min(1, y / this.canvasSize)),
    };
  }

  public destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
  }
}
