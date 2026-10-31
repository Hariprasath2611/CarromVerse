import Phaser from 'phaser';
import { PHYSICS_CONFIG } from './PhysicsConfig.js';

export class PhysicsWorld {
  private scene: Phaser.Scene;
  private matterWorld: Phaser.Physics.Matter.World;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.matterWorld = scene.matter.world;
  }

  public initialize(): void {
    // Top-down carrom: zero gravity
    this.matterWorld.setGravity(
      PHYSICS_CONFIG.world.gravity.x,
      PHYSICS_CONFIG.world.gravity.y
    );

    // Disable default Matter world wall boundaries so custom carrom cushions handle collisions
    this.matterWorld.setBounds(0, 0, 0, 0, 0, false, false, false, false);
  }

  public getRawWorld(): Phaser.Physics.Matter.World {
    return this.matterWorld;
  }

  public removeBody(body: MatterJS.BodyType): void {
    if (this.matterWorld && body) {
      this.matterWorld.remove(body);
    }
  }

  public pause(): void {
    this.matterWorld.pause();
  }

  public resume(): void {
    this.matterWorld.resume();
  }
}
