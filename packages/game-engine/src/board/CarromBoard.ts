import * as Phaser from 'phaser';
import { BoardRenderer } from './BoardRenderer.js';
import { calculateBoardDimensions, getBaselineForSeat, NORMALIZED_BOARD_CONFIG } from './BoardConfig.js';
import { getBoardTheme } from './BoardThemes.js';
import { BoardDimensions, BoardThemeConfig, NormalizedCoordinate, Vector2D } from '../types/GameTypes.js';

export class CarromBoard {
  private scene: Phaser.Scene;
  private renderer: BoardRenderer;
  private dimensions: BoardDimensions;
  private theme: BoardThemeConfig;

  constructor(scene: Phaser.Scene, canvasSize: number, initialThemeId: string = 'forest') {
    this.scene = scene;
    this.dimensions = calculateBoardDimensions(canvasSize);
    this.theme = getBoardTheme(initialThemeId);
    this.renderer = new BoardRenderer(this.scene, this.dimensions, this.theme);
  }

  /**
   * Initializes and renders the board with current theme.
   */
  public init(): void {
    this.renderer.renderBoard(this.theme);
  }

  /**
   * Updates the theme and re-renders the board markings & cushions.
   */
  public setTheme(themeId: string): void {
    this.theme = getBoardTheme(themeId);
    this.renderer.renderBoard(this.theme);
  }

  /**
   * Resizes the board on canvas resize.
   */
  public resize(canvasSize: number): void {
    this.dimensions = calculateBoardDimensions(canvasSize);
    this.renderer.updateDimensions(this.dimensions);
  }

  /**
   * Converts normalized coordinate [0, 1] to screen pixel coordinate.
   */
  public toPixel(nx: number, ny: number): Vector2D {
    return this.renderer.toPixel(nx, ny);
  }

  /**
   * Converts pixel coordinate to normalized coordinate.
   */
  public toNormalized(x: number, y: number): NormalizedCoordinate {
    return this.renderer.toNormalized(x, y);
  }

  /**
   * Checks if normalized coordinate is inside the playable surface (inside cushions).
   */
  public isInsidePlayingSurface(nx: number, ny: number): boolean {
    const fw = NORMALIZED_BOARD_CONFIG.FRAME_WIDTH;
    return nx >= fw && nx <= 1 - fw && ny >= fw && ny <= 1 - fw;
  }

  /**
   * Returns shooting baseline coordinates for given player seat (0: South, 1: East, 2: North, 3: West).
   */
  public getSeatBaseline(seat: number) {
    return getBaselineForSeat(seat);
  }

  public getDimensions(): BoardDimensions {
    return this.dimensions;
  }

  public getTheme(): BoardThemeConfig {
    return this.theme;
  }

  public destroy(): void {
    this.renderer.destroy();
  }
}
