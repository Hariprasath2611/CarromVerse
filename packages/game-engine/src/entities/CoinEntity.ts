import Phaser from 'phaser';
import { CoinType, Vector2D } from '@carromverse/shared-types';
import { COIN_PHYSICS } from '../config/physics.config.js';
import { COIN_VISUAL_CONFIGS } from '../config/coin.config.js';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';

export class CoinEntity {
  public id: string;
  public type: CoinType;
  public body: MatterJS.BodyType;
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private graphic: Phaser.GameObjects.Graphics;
  public isPocketed: boolean = false;

  constructor(scene: Phaser.Scene, id: string, type: CoinType, initialPos: Vector2D) {
    this.scene = scene;
    this.id = id;
    this.type = type;

    const visual = COIN_VISUAL_CONFIGS[type];
    const radius = visual.radius;

    // 1. Create Matter physics circular body
    this.body = scene.matter.add.circle(initialPos.x, initialPos.y, radius, {
      restitution: COIN_PHYSICS.restitution,
      friction: COIN_PHYSICS.friction,
      frictionAir: COIN_PHYSICS.frictionAir,
      density: COIN_PHYSICS.density,
      label: `coin_${id}`,
      collisionFilter: {
        category: COLLISION_CATEGORIES.COIN,
        mask: COLLISION_MASKS.COIN,
      },
    });

    // 2. Create high-detail visual vector graphics
    this.graphic = scene.add.graphics();
    this.drawCoinVisual(radius, visual);

    this.container = scene.add.container(initialPos.x, initialPos.y, [this.graphic]);
  }

  private drawCoinVisual(radius: number, visual: typeof COIN_VISUAL_CONFIGS[CoinType]): void {
    const g = this.graphic;
    g.clear();

    // Outer drop shadow
    g.fillStyle(0x000000, 0.35);
    g.fillCircle(1.5, 2.5, radius);

    // Rim
    g.fillStyle(visual.rimColor, 1);
    g.fillCircle(0, 0, radius);

    // Main Face
    g.fillStyle(visual.primaryColor, 1);
    g.fillCircle(0, 0, radius - 2.5);

    // Inner concentric ring
    g.lineStyle(1.5, visual.innerPatternColor, 0.7);
    g.strokeCircle(0, 0, radius * 0.55);

    // Center jewel / dot
    g.fillStyle(visual.innerPatternColor, 0.9);
    g.fillCircle(0, 0, radius * 0.18);
  }

  public update(): void {
    if (this.isPocketed) return;
    this.container.setPosition(this.body.position.x, this.body.position.y);
    this.container.setRotation(this.body.angle);
  }

  public animatePocket(pocketCenter: Vector2D, onComplete: () => void): void {
    this.isPocketed = true;
    this.scene.matter.world.remove(this.body);

    this.scene.tweens.add({
      targets: this.container,
      x: pocketCenter.x,
      y: pocketCenter.y,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 220,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.destroy();
        onComplete();
      },
    });
  }

  public destroy(): void {
    this.scene.matter.world.remove(this.body);
    this.container.destroy();
  }
}
