import Phaser from 'phaser';
import { PocketDetection } from '../mechanics/PocketDetection.js';
import { GameEventManager } from '../systems/GameEventManager.js';
import { PHYSICS_EVENTS } from './PhysicsEvents.js';
import { PHYSICS_CONFIG, RESTITUTION, PX_PER_CM, SIMULATION } from './PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';
import { CoinType } from '../types/GameTypes.js';

export class CollisionManager {
  private scene: Phaser.Scene;
  private pocketDetection: PocketDetection;
  private eventManager: GameEventManager;
  private processedPairsInStep: Set<string> = new Set();

  constructor(
    scene: Phaser.Scene,
    pocketDetection: PocketDetection,
    eventManager: GameEventManager
  ) {
    this.scene = scene;
    this.pocketDetection = pocketDetection;
    this.eventManager = eventManager;
  }

  public setupCollisionHandlers(): void {
    // Intercept collision start
    this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      this.handleCollisionStart(event);
    });

    // Intercept collision active for continuous pocket suction pull and capture check
    this.scene.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      this.handleCollisionActive(event);
    });

    this.scene.matter.world.on('afterupdate', () => {
      this.processedPairsInStep.clear();
      this.pocketDetection.processQueuedRemovals();
    });
  }

  private handleCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const pairKey = `${bodyA.id}_${bodyB.id}`;

      if (this.processedPairsInStep.has(pairKey)) return;
      this.processedPairsInStep.add(pairKey);

      // 1. Check for Pocket Sensor collision
      const isSensorA = bodyA.isSensor && bodyA.label?.startsWith('pocket_');
      const isSensorB = bodyB.isSensor && bodyB.label?.startsWith('pocket_');

      if (isSensorA) {
        const pocketIdx = parseInt(bodyA.label.split('_')[1], 10);
        this.pocketDetection.handleSensorOverlap(bodyB, pocketIdx, bodyA);
        return;
      }
      if (isSensorB) {
        const pocketIdx = parseInt(bodyB.label.split('_')[1], 10);
        this.pocketDetection.handleSensorOverlap(bodyA, pocketIdx, bodyB);
        return;
      }

      // 2. Cushion / Wall Collision
      const isWallA = bodyA.label?.startsWith('wall') || bodyA.label?.startsWith('cushion');
      const isWallB = bodyB.label?.startsWith('wall') || bodyB.label?.startsWith('cushion');

      if (isWallA || isWallB) {
        // Enforce cushion bounce damping: retention ~0.65 of normal velocity
        pair.restitution = RESTITUTION.wallBounceDamping;

        const movingBody = isWallA ? bodyB : bodyA;
        const wallBody = isWallA ? bodyA : bodyB;

        // Tangential friction damping so reflection angle equals incidence angle
        const preVx = movingBody.velocity.x;
        const preVy = movingBody.velocity.y;
        const speedStep = Math.hypot(preVx, preVy);
        const speedCmS = PhysicsUtils.stepVelocityToSpeedCmS(speedStep);

        // Adjust tangential velocity to preserve incidence angle upon cushion rebound
        const isHorizontalWall = wallBody.label?.includes('top') || wallBody.label?.includes('bottom');
        if (isHorizontalWall) {
          // Normal is along Y, tangential is along X
          this.scene.matter.body.setVelocity(movingBody, {
            x: preVx * RESTITUTION.wallBounceDamping,
            y: movingBody.velocity.y,
          });
        } else {
          // Normal is along X, tangential is along Y
          this.scene.matter.body.setVelocity(movingBody, {
            x: movingBody.velocity.x,
            y: preVy * RESTITUTION.wallBounceDamping,
          });
        }

        if ((movingBody as any).entity) {
          this.eventManager.emit(PHYSICS_EVENTS.CUSHION_COLLISION, {
            bodyId: (movingBody as any).entityId,
            bodyType: (movingBody as any).entityType as CoinType | 'striker',
            cushionLabel: wallBody.label,
            impactSpeed: speedCmS,
          });
        }
        return;
      }

      // 3. Coin-to-Coin or Striker-to-Coin Collision
      const entityA = (bodyA as any).entity;
      const entityB = (bodyB as any).entity;

      const relStepSpeed = Math.hypot(
        bodyA.velocity.x - bodyB.velocity.x,
        bodyA.velocity.y - bodyB.velocity.y
      );
      const relSpeedCmS = PhysicsUtils.stepVelocityToSpeedCmS(relStepSpeed);

      if (relSpeedCmS > 2.0) {
        // Normal unit vector from A to B
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const dist = Math.hypot(dx, dy) || 1;
        const normal = { x: dx / dist, y: dy / dist };

        this.eventManager.emit(PHYSICS_EVENTS.COIN_COLLISION, {
          bodyA: (bodyA as any).entityId || bodyA.label || 'unknown',
          bodyB: (bodyB as any).entityId || bodyB.label || 'unknown',
          bodyAId: (bodyA as any).entityId,
          bodyBId: (bodyB as any).entityId,
          bodyAType: (bodyA as any).entityType,
          bodyBType: (bodyB as any).entityType,
          speed_cm_s: relSpeedCmS,
          impactSpeed: relSpeedCmS,
          normal,
          point: {
            x: (bodyA.position.x + bodyB.position.x) / 2,
            y: (bodyA.position.y + bodyB.position.y) / 2,
          },
        });
      }
    });
  }

  private handleCollisionActive(event: Phaser.Physics.Matter.Events.CollisionActiveEvent): void {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const isSensorA = bodyA.isSensor && bodyA.label?.startsWith('pocket_');
      const isSensorB = bodyB.isSensor && bodyB.label?.startsWith('pocket_');

      if (isSensorA) {
        const pocketIdx = parseInt(bodyA.label.split('_')[1], 10);
        this.pocketDetection.handleSensorActive(bodyB, pocketIdx, bodyA);
      } else if (isSensorB) {
        const pocketIdx = parseInt(bodyB.label.split('_')[1], 10);
        this.pocketDetection.handleSensorActive(bodyA, pocketIdx, bodyB);
      }
    });
  }
}
