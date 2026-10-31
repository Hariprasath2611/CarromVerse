import Phaser from 'phaser';
import { FRICTION, SPEEDS, PX_PER_CM, SIMULATION } from '../physics/PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';

export class FrictionController {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Applies realistic Coulomb surface friction and viscous damping per simulation substep.
   * If speed drops below rest threshold (2.0 cm/s), snaps velocity to zero to eliminate crawling/jitter.
   */
  public update(bodies: MatterJS.BodyType[], subDtSeconds: number = SIMULATION.baseDtSeconds): void {
    const linearRestCmS = SPEEDS.restSpeedThresholdCmS;
    const angularRestRadS = SPEEDS.angularRestThresholdRadS;
    const decelCmS2 = FRICTION.decelerationCmS2;
    const viscous = FRICTION.viscousDamping;
    const angularDamping = FRICTION.angularDampingPerSec;

    bodies.forEach((body) => {
      if (body.isStatic || (body as any).isPocketed) return;

      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const stepSpeed = Math.hypot(vx, vy);
      const speedCmS = PhysicsUtils.stepVelocityToSpeedCmS(stepSpeed, subDtSeconds, PX_PER_CM);
      const av = body.angularVelocity;

      // 1. Stable Rest Zeroing: Halt crawling & micro-jitter
      if (speedCmS < linearRestCmS && Math.abs(av) < angularRestRadS) {
        if (stepSpeed > 0 || av !== 0) {
          this.scene.matter.body.setVelocity(body, { x: 0, y: 0 });
          this.scene.matter.body.setAngularVelocity(body, 0);
        }
        return;
      }

      // 2. Coulomb surface friction (constant deceleration) + Viscous damping
      if (speedCmS >= linearRestCmS) {
        // Coulomb deceleration in cm/s
        let newSpeedCmS = Math.max(0, speedCmS - decelCmS2 * subDtSeconds);

        // Viscous damping
        newSpeedCmS = newSpeedCmS * Math.max(0, 1 - viscous * subDtSeconds);

        // Snap to zero if below cutoff threshold
        if (newSpeedCmS < linearRestCmS) {
          this.scene.matter.body.setVelocity(body, { x: 0, y: 0 });
        } else {
          const newStepSpeed = PhysicsUtils.speedCmSToStepVelocity(newSpeedCmS, subDtSeconds, PX_PER_CM);
          const factor = newStepSpeed / stepSpeed;
          this.scene.matter.body.setVelocity(body, {
            x: vx * factor,
            y: vy * factor,
          });
        }
      }

      // 3. Angular Damping (rotational friction against plywood)
      if (Math.abs(av) >= angularRestRadS) {
        const newAv = av * Math.max(0, 1 - angularDamping * subDtSeconds);
        if (Math.abs(newAv) < angularRestRadS) {
          this.scene.matter.body.setAngularVelocity(body, 0);
        } else {
          this.scene.matter.body.setAngularVelocity(body, newAv);
        }
      }
    });
  }
}
