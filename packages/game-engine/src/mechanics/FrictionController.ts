import Phaser from 'phaser';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';

export class FrictionController {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Applies realistic surface friction and zeroing deceleration to moving bodies.
   */
  public update(bodies: MatterJS.BodyType[]): void {
    const linearThreshold = PHYSICS_CONFIG.motion.linearRestThreshold;
    const angularThreshold = PHYSICS_CONFIG.motion.angularRestThreshold;

    bodies.forEach((body) => {
      if (body.isStatic || (body as any).isPocketed) return;

      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const speed = Math.hypot(vx, vy);
      const av = body.angularVelocity;

      // 1. Stable Rest Zeroing: Halt micro-jitter
      if (speed < linearThreshold && Math.abs(av) < angularThreshold) {
        if (speed > 0 || av !== 0) {
          this.scene.matter.body.setVelocity(body, { x: 0, y: 0 });
          this.scene.matter.body.setAngularVelocity(body, 0);
        }
        return;
      }

      // 2. Linear Friction Damping (powdered board resistance)
      // Slight additional linear damping to mimic surface friction
      if (speed >= linearThreshold) {
        const decayFactor = 0.992;
        this.scene.matter.body.setVelocity(body, {
          x: vx * decayFactor,
          y: vy * decayFactor,
        });
      }

      // 3. Angular Damping (rotational friction against plywood)
      if (Math.abs(av) >= angularThreshold) {
        this.scene.matter.body.setAngularVelocity(body, av * 0.95);
      }
    });
  }
}
