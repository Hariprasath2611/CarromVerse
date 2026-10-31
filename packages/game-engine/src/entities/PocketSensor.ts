import Phaser from 'phaser';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';
import { NORMALIZED_BOARD_CONFIG } from '../board/BoardConfig.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';

export interface PocketPosition {
  index: number;
  x: number;
  y: number;
  radius: number;
}

export class PocketSensor {
  private scene: Phaser.Scene;
  private sensors: MatterJS.BodyType[] = [];
  private positions: PocketPosition[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createSensors(boardSize: number): MatterJS.BodyType[] {
    this.destroy();

    const fw = boardSize * NORMALIZED_BOARD_CONFIG.FRAME_WIDTH;
    const pr = boardSize * NORMALIZED_BOARD_CONFIG.POCKET_RADIUS;
    const inset = fw + pr * 0.55;
    const sensorRadius = boardSize * PHYSICS_CONFIG.pocket.sensorRadiusRatio;

    this.positions = [
      { index: 0, x: inset, y: inset, radius: sensorRadius },
      { index: 1, x: boardSize - inset, y: inset, radius: sensorRadius },
      { index: 2, x: boardSize - inset, y: boardSize - inset, radius: sensorRadius },
      { index: 3, x: inset, y: boardSize - inset, radius: sensorRadius },
    ];

    this.positions.forEach((pos) => {
      const sensor = this.scene.matter.add.circle(pos.x, pos.y, pos.radius, {
        isStatic: true,
        isSensor: true,
        label: `pocket_${pos.index}`,
        collisionFilter: {
          category: COLLISION_CATEGORIES.POCKET_SENSOR,
          mask: COLLISION_MASKS.POCKET_SENSOR,
        },
      });
      this.sensors.push(sensor);
    });

    return this.sensors;
  }

  public getSensors(): MatterJS.BodyType[] {
    return this.sensors;
  }

  public getPositions(): PocketPosition[] {
    return this.positions;
  }

  public destroy(): void {
    this.sensors.forEach((s) => {
      if (this.scene.matter && this.scene.matter.world) {
        this.scene.matter.world.remove(s);
      }
    });
    this.sensors = [];
    this.positions = [];
  }
}
