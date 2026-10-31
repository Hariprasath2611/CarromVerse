import { Vector2D, VectorUtils } from './VectorUtils.js';

export class PhysicsUtils {
  /**
   * Converts normalized coordinate (0 to 1) to canvas pixel coordinate.
   */
  public static toPixels(normalized: number, canvasSize: number): number {
    return normalized * canvasSize;
  }

  /**
   * Converts canvas pixel coordinate to normalized coordinate (0 to 1).
   */
  public static toNormalized(pixels: number, canvasSize: number): number {
    return canvasSize > 0 ? pixels / canvasSize : 0;
  }

  /**
   * Converts 2D normalized vector to pixel vector.
   */
  public static toPixelVector(nv: Vector2D, canvasSize: number): Vector2D {
    return {
      x: nv.x * canvasSize,
      y: nv.y * canvasSize,
    };
  }

  /**
   * Calculates relative impact speed between two moving bodies.
   */
  public static calculateImpactSpeed(
    v1: { x: number; y: number },
    v2: { x: number; y: number }
  ): number {
    return Math.hypot(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * Calculates kinetic energy: E = 0.5 * mass * velocity^2
   */
  public static calculateKineticEnergy(mass: number, speed: number): number {
    return 0.5 * mass * speed * speed;
  }

  /**
   * Checks whether two circles overlap.
   */
  public static checkCircleOverlap(
    c1: { x: number; y: number; radius: number },
    c2: { x: number; y: number; radius: number }
  ): boolean {
    const dist = VectorUtils.distance(c1.x, c1.y, c2.x, c2.y);
    return dist < c1.radius + c2.radius;
  }

  /**
   * Checks whether a point lies inside a circular sensor/pocket.
   */
  public static isPointInCircle(
    px: number,
    py: number,
    cx: number,
    cy: number,
    radius: number
  ): boolean {
    return VectorUtils.distance(px, py, cx, cy) <= radius;
  }

  /**
   * Applies linear and angular deceleration towards zero.
   * If speed drops below restThreshold, snaps to zero.
   */
  public static applyDamping(
    velocity: Vector2D,
    linearDamping: number,
    restThreshold: number
  ): Vector2D {
    const speed = VectorUtils.magnitude(velocity.x, velocity.y);
    if (speed < restThreshold) {
      return { x: 0, y: 0 };
    }
    const factor = Math.max(0, 1 - linearDamping);
    return {
      x: velocity.x * factor,
      y: velocity.y * factor,
    };
  }
}

