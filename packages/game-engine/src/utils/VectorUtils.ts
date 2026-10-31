/**
 * 2D Vector math utilities for Carrom physics calculations.
 */

import { Vector2D } from '../types/GameTypes.js';

export type { Vector2D };

export class VectorUtils {
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  public static magnitude(x: number, y: number): number {
    return Math.hypot(x, y);
  }

  public static normalize(x: number, y: number): Vector2D {
    const mag = Math.hypot(x, y);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: x / mag, y: y / mag };
  }

  public static dot(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * x2 + y1 * y2;
  }

  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  public static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  public static scale(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  public static add(v1: Vector2D, v2: Vector2D): Vector2D {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  public static sub(v1: Vector2D, v2: Vector2D): Vector2D {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  public static reflect(v: Vector2D, normal: Vector2D): Vector2D {
    const d = 2 * (v.x * normal.x + v.y * normal.y);
    return {
      x: v.x - d * normal.x,
      y: v.y - d * normal.y,
    };
  }
}
