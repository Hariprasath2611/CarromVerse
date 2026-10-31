import * as Phaser from 'phaser';
import { ASSET_KEYS, getStrikerTextureKey } from '../assets/AssetRegistry.js';
import { NormalizedCoordinate, StrikerSkin, Vector2D } from '../types/GameTypes.js';
import { STRIKER_SHADOW_CONFIG } from '../rendering/Shadows.js';
import { CarromBoard } from '../board/CarromBoard.js';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';

export class Striker {
  public readonly id: string;
  public skin: StrikerSkin;
  private scene: Phaser.Scene;
  private board: CarromBoard;
  private container: Phaser.GameObjects.Container;
  private shadowSprite: Phaser.GameObjects.Sprite;
  private strikerSprite: Phaser.GameObjects.Sprite;
  private aimRay: Phaser.GameObjects.Graphics;

  private nx: number;
  private ny: number;
  private aimAngleRad: number = -Math.PI / 2; // Pointing upwards by default
  private baseRadius: number;
  private activeSeat: number = 0; // 0 = South
  public isPocketed: boolean = false;

  public physicsBody: MatterJS.BodyType | null = null;

  constructor(
    scene: Phaser.Scene,
    board: CarromBoard,
    id: string = 'striker_primary',
    skin: StrikerSkin = 'emerald',
    activeSeat: number = 0
  ) {
    this.scene = scene;
    this.board = board;
    this.id = id;
    this.skin = skin;
    this.activeSeat = activeSeat;
    this.baseRadius = this.board.getDimensions().strikerRadius;

    // Initial position on active player's baseline (center of baseline)
    const baseline = this.board.getSeatBaseline(this.activeSeat);
    this.nx = (baseline.x1 + baseline.x2) / 2;
    this.ny = (baseline.y1 + baseline.y2) / 2;

    const pixelPos = this.board.toPixel(this.nx, this.ny);

    // Root Container
    this.container = this.scene.add.container(pixelPos.x, pixelPos.y);
    this.container.setDepth(20); // Top layer above all pieces

    // 1. Soft Shadow Sprite
    this.shadowSprite = this.scene.add.sprite(
      STRIKER_SHADOW_CONFIG.offset.x,
      STRIKER_SHADOW_CONFIG.offset.y,
      ASSET_KEYS.TEXTURES.STRIKER_SHADOW
    );
    this.shadowSprite.setDisplaySize(this.baseRadius * 2.4, this.baseRadius * 2.4);
    this.shadowSprite.setAlpha(STRIKER_SHADOW_CONFIG.alpha);
    this.container.add(this.shadowSprite);

    // 2. Main Striker Sprite
    const textureKey = getStrikerTextureKey(this.skin);
    this.strikerSprite = this.scene.add.sprite(0, 0, textureKey);
    this.strikerSprite.setDisplaySize(this.baseRadius * 2, this.baseRadius * 2);
    this.container.add(this.strikerSprite);

    // 3. Aim Vector Ray
    this.aimRay = this.scene.add.graphics();
    this.container.add(this.aimRay);
    this.renderAimRay(0, false);
  }

  /**
   * Instantiates Matter.js physics rigid circle body for the striker.
   */
  public createPhysicsBody(): MatterJS.BodyType {
    const pixelPos = this.board.toPixel(this.nx, this.ny);
    const radius = this.baseRadius;

    const body = this.scene.matter.add.circle(pixelPos.x, pixelPos.y, radius, {
      restitution: PHYSICS_CONFIG.striker.restitution,
      friction: PHYSICS_CONFIG.striker.friction,
      frictionAir: PHYSICS_CONFIG.striker.frictionAir,
      frictionStatic: PHYSICS_CONFIG.striker.frictionStatic,
      density: PHYSICS_CONFIG.striker.density,
      label: 'striker',
      collisionFilter: {
        category: COLLISION_CATEGORIES.STRIKER,
        mask: COLLISION_MASKS.STRIKER,
      },
    });

    (body as any).entity = this;
    (body as any).entityType = 'striker';
    (body as any).entityId = this.id;
    body.inertia = Infinity;
    this.scene.matter.body.setMass(body, PHYSICS_CONFIG.striker.mass);
    this.physicsBody = body;
    return body;
  }

  /**
   * Synchronizes visual container with Matter body.
   */
  public syncVisualWithPhysics(): void {
    if (!this.physicsBody || this.isPocketed) return;

    const px = this.physicsBody.position.x;
    const py = this.physicsBody.position.y;
    this.container.setPosition(px, py);
    this.strikerSprite.setRotation(this.physicsBody.angle);

    const norm = this.board.toNormalized(px, py);
    this.nx = norm.nx;
    this.ny = norm.ny;
  }

  /**
   * Applies an impulse force to shoot the striker.
   */
  public applyImpulse(fx: number, fy: number): void {
    if (!this.physicsBody) return;
    this.scene.matter.body.applyForce(
      this.physicsBody,
      this.physicsBody.position,
      { x: fx, y: fy }
    );
  }

  /**
   * Sets linear velocity vector directly on the striker's Matter body.
   */
  public setVelocity(vx: number, vy: number): void {
    if (!this.physicsBody) return;
    this.scene.matter.body.setVelocity(this.physicsBody, { x: vx, y: vy });
  }

  /**
   * Checks if striker is at rest.
   */
  public isAtRest(): boolean {
    if (!this.physicsBody) return true;
    if (this.isPocketed) return true;
    const speed = Math.hypot(this.physicsBody.velocity.x, this.physicsBody.velocity.y);
    const angularSpeed = Math.abs(this.physicsBody.angularVelocity);
    return (
      speed < PHYSICS_CONFIG.motion.linearRestThreshold &&
      angularSpeed < PHYSICS_CONFIG.motion.angularRestThreshold
    );
  }

  /**
   * Resets striker to baseline with zero velocity.
   */
  public resetToBaseline(offsetRatio: number = 0): void {
    this.isPocketed = false;
    this.setVisible(true);
    this.container.setScale(1);
    this.container.setAlpha(1);

    this.setBaselineOffset(offsetRatio);

    if (this.physicsBody) {
      this.physicsBody.isSensor = false;
      const pixelPos = this.board.toPixel(this.nx, this.ny);
      this.scene.matter.body.setPosition(this.physicsBody, { x: pixelPos.x, y: pixelPos.y });
      this.scene.matter.body.setVelocity(this.physicsBody, { x: 0, y: 0 });
      this.scene.matter.body.setAngularVelocity(this.physicsBody, 0);
    }
  }

  /**
   * Plays smooth sink animation when striker enters a corner pocket.
   */
  public playPocketAnimation(onComplete?: () => void): void {
    this.isPocketed = true;
    if (this.physicsBody) {
      this.physicsBody.isSensor = true;
      this.scene.matter.body.setVelocity(this.physicsBody, { x: 0, y: 0 });
      this.scene.matter.body.setAngularVelocity(this.physicsBody, 0);
    }

    this.scene.tweens.add({
      targets: [this.container],
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: PHYSICS_CONFIG.pocket.sinkAnimationDurationMs,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.setVisible(false);
        onComplete?.();
      },
    });
  }

  /**
   * Sets striker skin (classic, emerald, royal, gold).
   */
  public setSkin(skin: StrikerSkin): void {
    this.skin = skin;
    const key = getStrikerTextureKey(skin);
    if (this.scene.textures.exists(key)) {
      this.strikerSprite.setTexture(key);
    }
  }

  /**
   * Positions striker along baseline clamped within legal baseline endpoints.
   */
  public setBaselineOffset(offsetRatio: number): void {
    const clampedOffset = Math.max(-0.95, Math.min(0.95, offsetRatio));
    const baseline = this.board.getSeatBaseline(this.activeSeat);

    const t = (clampedOffset + 1) / 2;
    const nx = baseline.x1 + t * (baseline.x2 - baseline.x1);
    const ny = baseline.y1 + t * (baseline.y2 - baseline.y1);

    this.setNormalizedPosition(nx, ny);
  }

  public setSeat(seatIndex: number): void {
    this.activeSeat = seatIndex;
    const angles = [-Math.PI / 2, -Math.PI, Math.PI / 2, 0];
    this.aimAngleRad = angles[seatIndex] ?? -Math.PI / 2;
    this.setBaselineOffset(0);
  }

  public setAimAngle(angleRad: number): void {
    this.aimAngleRad = angleRad;
    this.renderAimRay(0, false);
  }

  public renderAimRay(powerRatio: number = 0, visible: boolean = true): void {
    this.aimRay.clear();
    if (!visible) return;

    const baseLength = this.baseRadius * 2.5;
    const dynamicLength = baseLength + powerRatio * this.baseRadius * 4;
    const endX = Math.cos(this.aimAngleRad) * dynamicLength;
    const endY = Math.sin(this.aimAngleRad) * dynamicLength;

    // Gradient aim guide: emerald green to gold
    const alpha = 0.5 + powerRatio * 0.5;
    const color = powerRatio > 0.75 ? 0xF59E0B : 0x4ADE80;

    this.aimRay.lineStyle(2.5, color, alpha);
    this.aimRay.lineBetween(0, 0, endX, endY);

    // Tip dot
    this.aimRay.fillStyle(color, alpha);
    this.aimRay.fillCircle(endX, endY, 4 + powerRatio * 3);
  }

  public setNormalizedPosition(nx: number, ny: number): void {
    this.nx = nx;
    this.ny = ny;
    const pixelPos = this.board.toPixel(nx, ny);
    this.container.setPosition(pixelPos.x, pixelPos.y);

    if (this.physicsBody) {
      this.scene.matter.body.setPosition(this.physicsBody, { x: pixelPos.x, y: pixelPos.y });
    }
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public getNormalizedPosition(): NormalizedCoordinate {
    return { nx: this.nx, ny: this.ny };
  }

  public getPixelPosition(): Vector2D {
    return { x: this.container.x, y: this.container.y };
  }

  public getRadius(): number {
    return this.baseRadius;
  }

  public destroy(): void {
    if (this.physicsBody && this.scene.matter && this.scene.matter.world) {
      this.scene.matter.world.remove(this.physicsBody);
      this.physicsBody = null;
    }
    this.aimRay.destroy();
    this.shadowSprite.destroy();
    this.strikerSprite.destroy();
    this.container.destroy();
  }
}
