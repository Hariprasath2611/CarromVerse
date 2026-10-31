import Phaser from 'phaser';
import { PocketDetection } from '../mechanics/PocketDetection.js';
import { GameEventManager } from '../systems/GameEventManager.js';
import { PHYSICS_EVENTS } from './PhysicsEvents.js';
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
    this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      this.handleCollisionStart(event);
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
        this.pocketDetection.handleSensorOverlap(bodyB, pocketIdx);
        return;
      }
      if (isSensorB) {
        const pocketIdx = parseInt(bodyB.label.split('_')[1], 10);
        this.pocketDetection.handleSensorOverlap(bodyA, pocketIdx);
        return;
      }

      // 2. Physical impact between game objects
      const isCushionA = bodyA.label?.startsWith('cushion_');
      const isCushionB = bodyB.label?.startsWith('cushion_');

      const relSpeed = Math.hypot(
        bodyA.velocity.x - bodyB.velocity.x,
        bodyA.velocity.y - bodyB.velocity.y
      );

      // Cushion Collision
      if (isCushionA) {
        const movingBody = bodyB;
        if ((movingBody as any).entity) {
          this.eventManager.emit(PHYSICS_EVENTS.CUSHION_COLLISION, {
            bodyId: (movingBody as any).entityId,
            bodyType: (movingBody as any).entityType as CoinType | 'striker',
            cushionLabel: bodyA.label,
            impactSpeed: relSpeed,
          });
        }
        return;
      }
      if (isCushionB) {
        const movingBody = bodyA;
        if ((movingBody as any).entity) {
          this.eventManager.emit(PHYSICS_EVENTS.CUSHION_COLLISION, {
            bodyId: (movingBody as any).entityId,
            bodyType: (movingBody as any).entityType as CoinType | 'striker',
            cushionLabel: bodyB.label,
            impactSpeed: relSpeed,
          });
        }
        return;
      }

      // Coin-to-Coin or Striker-to-Coin Collision
      const entityA = (bodyA as any).entity;
      const entityB = (bodyB as any).entity;

      if (entityA && entityB && relSpeed > 0.4) {
        this.eventManager.emit(PHYSICS_EVENTS.COIN_COLLISION, {
          bodyAId: (bodyA as any).entityId,
          bodyBId: (bodyB as any).entityId,
          bodyAType: (bodyA as any).entityType,
          bodyBType: (bodyB as any).entityType,
          impactSpeed: relSpeed,
          point: {
            x: (bodyA.position.x + bodyB.position.x) / 2,
            y: (bodyA.position.y + bodyB.position.y) / 2,
          },
        });
      }
    });
  }
}

