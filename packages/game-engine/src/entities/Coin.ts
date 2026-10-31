import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../assets/AssetRegistry.js';
import { CoinType, NormalizedCoordinate, Vector2D } from '../types/GameTypes.js';
import { COIN_SHADOW_CONFIG } from '../rendering/Shadows.js';
import { CarromBoard } from '../board/CarromBoard.js';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';

export class Coin {
  public readonly id: string;
  public readonly coinType: CoinType;
  protected scene: Phaser.Scene;
  protected board: CarromBoard;
  protected container: Phaser.GameObjects.Container;
  protected shadowSprite: Phaser.GameObjects.Sprite;
  protected coinSprite: Phaser.GameObjects.Sprite;

  protected nx: number;
  protected ny: number;
  protected baseRadius: number;

  public physicsBody: MatterJS.BodyType | null = null;
  public isPocketed: boolean = false;

  constructor(
    scene: Phaser.Scene,
    board: CarromBoard,
    id: string,
    coinType: CoinType,
    nx: number,
    ny: number
  ) {
    this.scene = scene;
    this.board = board;
    this.id = id;
    this.coinType = coinType;
    this.nx = nx;
    this.ny = ny;
    this.baseRadius = this.board.getDimensions().coinRadius;

    const pixelPos = this.board.toPixel(this.nx, this.ny);

    // Root Container
    this.container = this.scene.add.container(pixelPos.x, pixelPos.y);
    this.container.setDepth(10); // Above board surface and markings

    // 1. Soft Drop Shadow
    this.shadowSprite = this.scene.add.sprite(
      COIN_SHADOW_CONFIG.offset.x,
      COIN_SHADOW_CONFIG.offset.y,
      ASSET_KEYS.TEXTURES.COIN_SHADOW
    );
    this.shadowSprite.setDisplaySize(this.baseRadius * 2.3, this.baseRadius * 2.3);
    this.shadowSprite.setAlpha(COIN_SHADOW_CONFIG.alpha);
    this.container.add(this.shadowSprite);

    // 2. Main Coin Sprite
    const textureKey =
      coinType === 'queen'
        ? ASSET_KEYS.TEXTURES.COIN_QUEEN
        : coinType === 'white'
        ? ASSET_KEYS.TEXTURES.COIN_WHITE
        : ASSET_KEYS.TEXTURES.COIN_BLACK;

    this.coinSprite = this.scene.add.sprite(0, 0, textureKey);
    this.coinSprite.setDisplaySize(this.baseRadius * 2, this.baseRadius * 2);
    this.container.add(this.coinSprite);
  }

  /**
   * Instantiates Matter.js physics rigid circle body and attaches to entity.
   */
  public createPhysicsBody(): MatterJS.BodyType {
    const pixelPos = this.board.toPixel(this.nx, this.ny);
    const radius = this.baseRadius;

    let category = COLLISION_CATEGORIES.WHITE_COIN;
    let mask = COLLISION_MASKS.WHITE_COIN;

    if (this.coinType === 'black') {
      category = COLLISION_CATEGORIES.BLACK_COIN;
      mask = COLLISION_MASKS.BLACK_COIN;
    } else if (this.coinType === 'queen') {
      category = COLLISION_CATEGORIES.QUEEN;
      mask = COLLISION_MASKS.QUEEN;
    }

    const body = this.scene.matter.add.circle(pixelPos.x, pixelPos.y, radius, {
      restitution: PHYSICS_CONFIG.coins.restitution,
      friction: PHYSICS_CONFIG.coins.friction,
      frictionAir: PHYSICS_CONFIG.coins.frictionAir,
      frictionStatic: PHYSICS_CONFIG.coins.frictionStatic,
      density: PHYSICS_CONFIG.coins.density,
      label: `coin_${this.id}`,
      collisionFilter: {
        category,
        mask,
      },
    });

    (body as any).entity = this;
    (body as any).entityType = this.coinType;
    (body as any).entityId = this.id;
    this.physicsBody = body;
    return body;
  }

  /**
   * Synchronizes visual container and sprite position/rotation with Matter body.
   */
  public syncVisualWithPhysics(): void {
    if (!this.physicsBody || this.isPocketed) return;

    const px = this.physicsBody.position.x;
    const py = this.physicsBody.position.y;
    this.container.setPosition(px, py);
    this.coinSprite.setRotation(this.physicsBody.angle);

    const norm = this.board.toNormalized(px, py);
    this.nx = norm.nx;
    this.ny = norm.ny;
  }

  /**
   * Plays smooth sink animation when coin enters a corner pocket.
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
   * Checks if coin physics body is at rest.
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
   * Sets normalized position and updates pixel placement and shadow.
   */
  public setNormalizedPosition(nx: number, ny: number): void {
    this.nx = nx;
    this.ny = ny;
    const pixelPos = this.board.toPixel(nx, ny);
    this.container.setPosition(pixelPos.x, pixelPos.y);

    if (this.physicsBody) {
      this.scene.matter.body.setPosition(this.physicsBody, { x: pixelPos.x, y: pixelPos.y });
    }
  }

  public setScale(scale: number): void {
    this.container.setScale(scale);
  }

  public setRotation(rotation: number): void {
    this.coinSprite.setRotation(rotation);
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public setDepth(depth: number): void {
    this.container.setDepth(depth);
  }

  public getNormalizedPosition(): NormalizedCoordinate {
    return { nx: this.nx, ny: this.ny };
  }

  public getPixelPosition(): Vector2D {
    return { x: this.container.x, y: this.container.y };
  }

  public attachPhysicsBody(body: MatterJS.BodyType): void {
    this.physicsBody = body;
  }

  public destroy(): void {
    if (this.physicsBody && this.scene.matter && this.scene.matter.world) {
      this.scene.matter.world.remove(this.physicsBody);
      this.physicsBody = null;
    }
    this.shadowSprite.destroy();
    this.coinSprite.destroy();
    this.container.destroy();
  }
}
