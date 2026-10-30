import Phaser from 'phaser';
import { PlayerSeat, Vector2D } from '@carromverse/shared-types';
import { BASELINE_DEFINITIONS, BaselineSegment } from '@carromverse/game-logic';
import { STRIKER_PHYSICS } from '../config/physics.config.js';
import { STRIKER_CONFIG } from '../config/striker.config.js';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';

export class StrikerEntity {
  public body: MatterJS.BodyType;
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private graphic: Phaser.GameObjects.Graphics;
  private aimGraphic: Phaser.GameObjects.Graphics;
  private activeSeat: PlayerSeat = 0;
  public isPocketed: boolean = false;
  public isAiming: boolean = false;

  constructor(scene: Phaser.Scene, initialSeat: PlayerSeat = 0) {
    this.scene = scene;
    this.activeSeat = initialSeat;
    const initialPos = this.getBaselinePosition(0.5);

    // 1. Matter body (initially static during placement/aiming)
    this.body = scene.matter.add.circle(initialPos.x, initialPos.y, STRIKER_CONFIG.radius, {
      isStatic: true,
      restitution: STRIKER_PHYSICS.restitution,
      friction: STRIKER_PHYSICS.friction,
      frictionAir: STRIKER_PHYSICS.frictionAir,
      density: STRIKER_PHYSICS.density,
      label: 'striker_main',
      collisionFilter: {
        category: COLLISION_CATEGORIES.STRIKER,
        mask: COLLISION_MASKS.STRIKER,
      },
    });

    // 2. Visual Graphics
    this.graphic = scene.add.graphics();
    this.drawStrikerVisual();

    this.container = scene.add.container(initialPos.x, initialPos.y, [this.graphic]);
    this.aimGraphic = scene.add.graphics();
  }

  private drawStrikerVisual(): void {
    const g = this.graphic;
    const r = STRIKER_CONFIG.radius;
    g.clear();

    // Shadow
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(2, 3, r);

    // Golden Outer Rim
    g.fillStyle(STRIKER_CONFIG.rimColor, 1);
    g.fillCircle(0, 0, r);

    // Dark Onyx Face
    g.fillStyle(STRIKER_CONFIG.primaryColor, 1);
    g.fillCircle(0, 0, r - 3.5);

    // Inner Gold Inlay
    g.lineStyle(2, STRIKER_CONFIG.accentColor, 0.85);
    g.strokeCircle(0, 0, r * 0.55);

    // Sapphire Core
    g.fillStyle(STRIKER_CONFIG.coreColor, 1);
    g.fillCircle(0, 0, r * 0.22);
  }

  public getBaselinePosition(normalized: number): Vector2D {
    const baseline: BaselineSegment = BASELINE_DEFINITIONS[this.activeSeat] ?? BASELINE_DEFINITIONS[0];
    const clamped = Math.max(0, Math.min(1, normalized));
    return {
      x: baseline.start.x + (baseline.end.x - baseline.start.x) * clamped,
      y: baseline.start.y + (baseline.end.y - baseline.start.y) * clamped,
    };
  }

  public setBaselinePosition(normalized: number): void {
    const pos = this.getBaselinePosition(normalized);
    this.scene.matter.body.setPosition(this.body, pos);
    this.container.setPosition(pos.x, pos.y);
  }

  public setSeat(seat: PlayerSeat): void {
    this.activeSeat = seat;
    this.resetToBaseline(0.5);
  }

  public resetToBaseline(normalized: number = 0.5): void {
    this.isPocketed = false;
    this.isAiming = false;
    this.aimGraphic.clear();

    this.scene.matter.body.setStatic(this.body, true);
    this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
    this.scene.matter.body.setAngularVelocity(this.body, 0);

    const pos = this.getBaselinePosition(normalized);
    this.scene.matter.body.setPosition(this.body, pos);
    this.container.setPosition(pos.x, pos.y);
    this.container.setAlpha(1);
    this.container.setScale(1);
  }

  public drawAimIndicator(angle: number, power: number, showGuide: boolean = true): void {
    this.aimGraphic.clear();
    if (!showGuide || power <= 0.01) return;

    const startX = this.body.position.x;
    const startY = this.body.position.y;
    const length = 80 + power * 260; // Dynamic guide length

    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    // Outer trajectory line
    this.aimGraphic.lineStyle(3, 0xffd700, 0.8);
    this.aimGraphic.lineBetween(startX, startY, endX, endY);

    // Target arrow head
    const arrowSize = 10;
    const arrowAngle1 = angle + Math.PI * 0.85;
    const arrowAngle2 = angle - Math.PI * 0.85;

    this.aimGraphic.lineStyle(2, 0xffffff, 0.9);
    this.aimGraphic.lineBetween(endX, endY, endX + Math.cos(arrowAngle1) * arrowSize, endY + Math.sin(arrowAngle1) * arrowSize);
    this.aimGraphic.lineBetween(endX, endY, endX + Math.cos(arrowAngle2) * arrowSize, endY + Math.sin(arrowAngle2) * arrowSize);
  }

  public clearAimIndicator(): void {
    this.aimGraphic.clear();
  }

  public fire(angle: number, power: number): void {
    this.clearAimIndicator();
    this.scene.matter.body.setStatic(this.body, false);

    const forceMagnitude = STRIKER_CONFIG.minForce + power * (STRIKER_CONFIG.maxForce - STRIKER_CONFIG.minForce);
    const forceVector = {
      x: Math.cos(angle) * forceMagnitude,
      y: Math.sin(angle) * forceMagnitude,
    };

    this.scene.matter.body.applyForce(this.body, this.body.position, forceVector);
  }

  public update(): void {
    if (this.isPocketed) return;
    this.container.setPosition(this.body.position.x, this.body.position.y);
    this.container.setRotation(this.body.angle);
  }

  public animatePocket(pocketCenter: Vector2D, onComplete: () => void): void {
    this.isPocketed = true;
    this.scene.matter.body.setStatic(this.body, true);

    this.scene.tweens.add({
      targets: this.container,
      x: pocketCenter.x,
      y: pocketCenter.y,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        onComplete();
      },
    });
  }
}
