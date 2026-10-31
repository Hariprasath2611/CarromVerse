import { Vector2D, VectorUtils } from './VectorUtils.js';
import { BOARD_PX, PX_PER_CM, SIZES, SPEEDS, SIMULATION } from '../physics/PhysicsConfig.js';

export class PhysicsUtils {
  /**
   * Converts centimeters to canvas pixels.
   */
  public static cmToPixels(cm: number, pxPerCm: number = PX_PER_CM): number {
    return cm * pxPerCm;
  }

  /**
   * Converts canvas pixels to centimeters.
   */
  public static pixelsToCm(pixels: number, pxPerCm: number = PX_PER_CM): number {
    return pxPerCm > 0 ? pixels / pxPerCm : 0;
  }

  /**
   * Converts normalized coordinate (0 to 1) to canvas pixel coordinate.
   */
  public static toPixels(normalized: number, canvasSize: number = BOARD_PX): number {
    return normalized * canvasSize;
  }

  /**
   * Converts canvas pixel coordinate to normalized coordinate (0 to 1).
   */
  public static toNormalized(pixels: number, canvasSize: number = BOARD_PX): number {
    return canvasSize > 0 ? pixels / canvasSize : 0;
  }

  /**
   * Converts 2D normalized vector to pixel vector.
   */
  public static toPixelVector(nv: Vector2D, canvasSize: number = BOARD_PX): Vector2D {
    return {
      x: nv.x * canvasSize,
      y: nv.y * canvasSize,
    };
  }

  /**
   * Converts speed in cm/s to Matter.js step velocity in px/step.
   * Matter.js displacement per step = v_step * (dt / (1/60)).
   * At dt = baseDtSeconds (1/60s), v_step = speedCmS * PX_PER_CM * dt.
   */
  public static speedCmSToStepVelocity(
    speedCmS: number,
    dtSeconds: number = SIMULATION.baseDtSeconds,
    pxPerCm: number = PX_PER_CM
  ): number {
    return speedCmS * pxPerCm * dtSeconds;
  }

  /**
   * Converts Matter.js step velocity (px/step) to speed in cm/s.
   */
  public static stepVelocityToSpeedCmS(
    stepVelocity: number,
    dtSeconds: number = SIMULATION.baseDtSeconds,
    pxPerCm: number = PX_PER_CM
  ): number {
    if (dtSeconds <= 0 || pxPerCm <= 0) return 0;
    return (stepVelocity / dtSeconds) / pxPerCm;
  }

  /**
   * Converts a velocity vector in cm/s to Matter.js step vector (px/step).
   */
  public static velocityCmSToStepVector(
    vxCmS: number,
    vyCmS: number,
    dtSeconds: number = SIMULATION.baseDtSeconds,
    pxPerCm: number = PX_PER_CM
  ): Vector2D {
    return {
      x: PhysicsUtils.speedCmSToStepVelocity(vxCmS, dtSeconds, pxPerCm),
      y: PhysicsUtils.speedCmSToStepVelocity(vyCmS, dtSeconds, pxPerCm),
    };
  }

  /**
   * Converts a Matter.js step velocity vector (px/step) to cm/s vector.
   */
  public static stepVectorToVelocityCmS(
    vxStep: number,
    vyStep: number,
    dtSeconds: number = SIMULATION.baseDtSeconds,
    pxPerCm: number = PX_PER_CM
  ): Vector2D {
    return {
      x: PhysicsUtils.stepVelocityToSpeedCmS(vxStep, dtSeconds, pxPerCm),
      y: PhysicsUtils.stepVelocityToSpeedCmS(vyStep, dtSeconds, pxPerCm),
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
  public static calculateKineticEnergy(mass: number, speedCmS: number): number {
    return 0.5 * mass * speedCmS * speedCmS;
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
   * Checks whether a striker at (x, y) overlaps any existing coin on the board.
   */
  public static isStrikerPositionOverlappingCoins(
    strikerPos: { x: number; y: number },
    strikerRadius: number = SIZES.strikerRadiusPx,
    coins: Array<{ x: number; y: number; radius: number; isPocketed?: boolean }>
  ): boolean {
    for (const coin of coins) {
      if (coin.isPocketed) continue;
      const dist = VectorUtils.distance(strikerPos.x, strikerPos.y, coin.x, coin.y);
      if (dist < strikerRadius + coin.radius) {
        return true;
      }
    }
    return false;
  }

  /**
   * Applies linear and angular deceleration towards zero.
   * If speed drops below restThreshold, snaps to zero.
   */
  public static applyDamping(
    velocity: Vector2D,
    linearDamping: number,
    restThreshold: number = SPEEDS.restSpeedThresholdCmS
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
