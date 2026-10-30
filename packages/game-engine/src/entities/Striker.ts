import * as Phaser from 'phaser';
import { ASSET_KEYS, getStrikerTextureKey } from '../assets/AssetRegistry.js';
import { NormalizedCoordinate, StrikerSkin, Vector2D } from '../types/GameTypes.js';
import { STRIKER_SHADOW_CONFIG } from '../rendering/Shadows.js';
import { CarromBoard } from '../board/CarromBoard.js';

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

  // Hook for Phase 1.4 Matter.js body
  public physicsBody: any = null;

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
    this.renderAimRay();
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
   * offsetRatio: -1.0 (far left of baseline) to 1.0 (far right of baseline), 0 is center.
   */
  public setBaselineOffset(offsetRatio: number): void {
    const clampedOffset = Math.max(-0.95, Math.min(0.95, offsetRatio));
    const baseline = this.board.getSeatBaseline(this.activeSeat);

    // Linear interpolation between baseline endpoints
    const t = (clampedOffset + 1) / 2;
    const nx = baseline.x1 + t * (baseline.x2 - baseline.x1);
    const ny = baseline.y1 + t * (baseline.y2 - baseline.y1);

    this.setNormalizedPosition(nx, ny);
  }

  /**
   * Sets normalized position and updates pixel placement.
   */
  public setNormalizedPosition(nx: number, ny: number): void {
    this.nx = nx;
    this.ny = ny;
    const pixelPos = this.board.toPixel(nx, ny);
    this.container.setPosition(pixelPos.x, pixelPos.y);
  }

  /**
   * Sets aim angle in radians and redraws directional indicator ray.
   */
  public setAimAngle(angleRad: number): void {
    this.aimAngleRad = angleRad;
    this.strikerSprite.setRotation(angleRad + Math.PI / 2);
    this.renderAimRay();
  }

  /**
   * Sets the active player seat (0: South, 1: East, 2: North, 3: West) and resets position to that baseline.
   */
  public setActiveSeat(seat: number): void {
    this.activeSeat = seat;
    this.setBaselineOffset(0);

    // Update aim direction to point inwards from that baseline
    switch (seat % 4) {
      case 1: // East: aims West
        this.setAimAngle(Math.PI);
        break;
      case 2: // North: aims South
        this.setAimAngle(Math.PI / 2);
        break;
      case 3: // West: aims East
        this.setAimAngle(0);
        break;
      case 0: // South: aims North
      default:
        this.setAimAngle(-Math.PI / 2);
        break;
    }
  }

  /**
   * Renders the directional aiming guide ray.
   */
  private renderAimRay(): void {
    this.aimRay.clear();
    const length = this.baseRadius * 3.5;
    const endX = Math.cos(this.aimAngleRad) * length;
    const endY = Math.sin(this.aimAngleRad) * length;

    // Dashed guide line
    this.aimRay.lineStyle(2, 0x4ADE80, 0.75);
    this.aimRay.lineBetween(0, 0, endX, endY);

    // Arrow tip
    this.aimRay.fillStyle(0x4ADE80, 0.9);
    this.aimRay.fillCircle(endX, endY, 3);
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

  /**
   * Hook for future Phase 1.4 Matter.js rigid body binding.
   */
  public attachPhysicsBody(body: any): void {
    this.physicsBody = body;
  }

  public destroy(): void {
    this.aimRay.destroy();
    this.shadowSprite.destroy();
    this.strikerSprite.destroy();
    this.container.destroy();
  }
}
