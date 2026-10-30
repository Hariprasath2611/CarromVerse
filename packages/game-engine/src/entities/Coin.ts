import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../assets/AssetRegistry.js';
import { CoinType, NormalizedCoordinate, Vector2D } from '../types/GameTypes.js';
import { COIN_SHADOW_CONFIG } from '../rendering/Shadows.js';
import { CarromBoard } from '../board/CarromBoard.js';

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

  // Placeholder hook for Phase 1.4 Matter.js body
  public physicsBody: any = null;

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
   * Sets normalized position and updates pixel placement and shadow.
   */
  public setNormalizedPosition(nx: number, ny: number): void {
    this.nx = nx;
    this.ny = ny;
    const pixelPos = this.board.toPixel(nx, ny);
    this.container.setPosition(pixelPos.x, pixelPos.y);
  }

  /**
   * Sets scale factor.
   */
  public setScale(scale: number): void {
    this.container.setScale(scale);
  }

  /**
   * Sets rotation in radians.
   */
  public setRotation(rotation: number): void {
    this.coinSprite.setRotation(rotation);
  }

  /**
   * Sets coin visibility.
   */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * Sets rendering depth (Z-order).
   */
  public setDepth(depth: number): void {
    this.container.setDepth(depth);
  }

  /**
   * Returns normalized coordinate.
   */
  public getNormalizedPosition(): NormalizedCoordinate {
    return { nx: this.nx, ny: this.ny };
  }

  /**
   * Returns screen pixel position.
   */
  public getPixelPosition(): Vector2D {
    return { x: this.container.x, y: this.container.y };
  }

  /**
   * Hook for future Phase 1.4 Matter.js rigid body binding.
   */
  public attachPhysicsBody(body: any): void {
    this.physicsBody = body;
  }

  /**
   * Destroys visual sprites and containers.
   */
  public destroy(): void {
    this.shadowSprite.destroy();
    this.coinSprite.destroy();
    this.container.destroy();
  }
}
