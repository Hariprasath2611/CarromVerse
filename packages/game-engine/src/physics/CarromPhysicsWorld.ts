import Phaser from 'phaser';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from './CollisionCategories.js';
import { CUSHION_PHYSICS, WORLD_PHYSICS_CONFIG } from '../config/physics.config.js';
import { ENGINE_BOARD_CONFIG } from '../config/board.config.js';

export interface CollisionCallback {
  onPocketCollision: (body: MatterJS.BodyType, pocketIndex: number) => void;
  onImpact: (bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, intensity: number) => void;
}

export class CarromPhysicsWorld {
  private scene: Phaser.Scene;
  private callbacks: CollisionCallback;
  private cushionBodies: MatterJS.BodyType[] = [];
  private pocketSensors: MatterJS.BodyType[] = [];

  constructor(scene: Phaser.Scene, callbacks: CollisionCallback) {
    this.scene = scene;
    this.callbacks = callbacks;
  }

  public initialize(): void {
    const world = this.scene.matter.world;

    // Configure world parameters
    world.setGravity(WORLD_PHYSICS_CONFIG.gravity.x, WORLD_PHYSICS_CONFIG.gravity.y);

    this.createCushions();
    this.createPocketSensors();
    this.setupCollisionHandlers();
  }

  private createCushions(): void {
    const size = ENGINE_BOARD_CONFIG.boardSize;
    const thickness = 60;
    const halfSize = size / 2;

    const cushionConfigs = [
      // Top Cushion
      { x: halfSize, y: thickness / 2, w: size - 140, h: thickness },
      // Bottom Cushion
      { x: halfSize, y: size - thickness / 2, w: size - 140, h: thickness },
      // Left Cushion
      { x: thickness / 2, y: halfSize, w: thickness, h: size - 140 },
      // Right Cushion
      { x: size - thickness / 2, y: halfSize, w: thickness, h: size - 140 },
    ];

    cushionConfigs.forEach((cfg) => {
      const body = this.scene.matter.add.rectangle(cfg.x, cfg.y, cfg.w, cfg.h, {
        isStatic: true,
        restitution: CUSHION_PHYSICS.restitution,
        friction: CUSHION_PHYSICS.friction,
        label: 'cushion',
        collisionFilter: {
          category: COLLISION_CATEGORIES.CUSHION,
          mask: COLLISION_MASKS.CUSHION,
        },
      });
      this.cushionBodies.push(body);
    });
  }

  private createPocketSensors(): void {
    const pockets = ENGINE_BOARD_CONFIG.pockets;
    const radius = ENGINE_BOARD_CONFIG.pocketRadius;

    pockets.forEach((pos, index) => {
      const sensor = this.scene.matter.add.circle(pos.x, pos.y, radius * 0.75, {
        isStatic: true,
        isSensor: true, // Sensor detects intersections without applying physics pushback
        label: `pocket_${index}`,
        collisionFilter: {
          category: COLLISION_CATEGORIES.POCKET_SENSOR,
          mask: COLLISION_MASKS.POCKET_SENSOR,
        },
      });
      this.pocketSensors.push(sensor);
    });
  }

  private setupCollisionHandlers(): void {
    this.scene.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // Check if one is a pocket sensor
        const isSensorA = bodyA.isSensor && bodyA.label?.startsWith('pocket_');
        const isSensorB = bodyB.isSensor && bodyB.label?.startsWith('pocket_');

        if (isSensorA) {
          const pocketIdx = parseInt(bodyA.label.split('_')[1], 10);
          this.callbacks.onPocketCollision(bodyB, pocketIdx);
        } else if (isSensorB) {
          const pocketIdx = parseInt(bodyB.label.split('_')[1], 10);
          this.callbacks.onPocketCollision(bodyA, pocketIdx);
        } else {
          // Standard physical impact between coins/striker/cushions
          const relVel = Math.hypot(
            bodyA.velocity.x - bodyB.velocity.x,
            bodyA.velocity.y - bodyB.velocity.y
          );
          if (relVel > 0.5) {
            this.callbacks.onImpact(bodyA, bodyB, relVel);
          }
        }
      });
    });
  }

  public areAllBodiesAtRest(bodies: MatterJS.BodyType[]): boolean {
    const threshold = WORLD_PHYSICS_CONFIG.restVelocityThreshold;
    return bodies.every((b) => {
      if (b.isStatic) return true;
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      const angularSpeed = Math.abs(b.angularVelocity);
      return speed < threshold && angularSpeed < 0.05;
    });
  }
}
