import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../assets/AssetRegistry.js';
import { BoardDimensions, BoardThemeConfig, NormalizedCoordinate, Vector2D } from '../types/GameTypes.js';

export class BoardRenderer {
  private scene: Phaser.Scene;
  private dimensions: BoardDimensions;
  private theme: BoardThemeConfig;
  private container: Phaser.GameObjects.Container;
  private graphics: Phaser.GameObjects.Graphics;
  private pockets: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene, dimensions: BoardDimensions, theme: BoardThemeConfig) {
    this.scene = scene;
    this.dimensions = dimensions;
    this.theme = theme;
    this.container = this.scene.add.container(0, 0);
    this.graphics = this.scene.add.graphics();
    this.container.add(this.graphics);
  }

  /**
   * Renders the complete carrom board: frame, surface, cushions, markings, and pockets.
   */
  public renderBoard(theme: BoardThemeConfig): void {
    this.theme = theme;
    this.graphics.clear();
    this.clearPockets();

    this.drawOuterFrame();
    this.drawPlayingSurface();
    this.drawInnerCushions();
    this.drawBaselines();
    this.drawCenterCircle();
    this.drawCornerArrows();
    this.drawPockets();
  }

  /**
   * Updates board dimensions upon resize.
   */
  public updateDimensions(dimensions: BoardDimensions): void {
    this.dimensions = dimensions;
    this.renderBoard(this.theme);
  }

  /**
   * Converts normalized coordinates [0.0, 1.0] to pixel coordinates.
   */
  public toPixel(nx: number, ny: number): Vector2D {
    return {
      x: nx * this.dimensions.size,
      y: ny * this.dimensions.size,
    };
  }

  /**
   * Converts pixel coordinates to normalized coordinates [0.0, 1.0].
   */
  public toNormalized(x: number, y: number): NormalizedCoordinate {
    return {
      nx: Math.max(0, Math.min(1, x / this.dimensions.size)),
      ny: Math.max(0, Math.min(1, y / this.dimensions.size)),
    };
  }

  /**
   * Draws the heavy outer wooden frame with beveled corner miter joints.
   */
  private drawOuterFrame(): void {
    const s = this.dimensions.size;
    const fw = this.dimensions.frameWidth;

    // 1. Base frame rectangle
    const frameColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.frameColor).color;
    this.graphics.fillStyle(frameColor, 1);
    this.graphics.fillRect(0, 0, s, s);

    // 2. Outer bevel edge
    const accentColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.frameAccent).color;
    this.graphics.lineStyle(3, accentColor, 0.8);
    this.graphics.strokeRect(2, 2, s - 4, s - 4);

    // 3. Corner miter lines (45-degree join lines)
    this.graphics.lineStyle(1.5, 0x000000, 0.5);
    this.graphics.lineBetween(0, 0, fw, fw);
    this.graphics.lineBetween(s, 0, s - fw, fw);
    this.graphics.lineBetween(0, s, fw, s - fw);
    this.graphics.lineBetween(s, s, s - fw, s - fw);
  }

  /**
   * Draws the polished square playing surface.
   */
  private drawPlayingSurface(): void {
    const fw = this.dimensions.frameWidth;
    const surfSize = this.dimensions.playingSurfaceSize;

    // Playing face
    const surfaceColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.surfaceBg).color;
    this.graphics.fillStyle(surfaceColor, 1);
    this.graphics.fillRect(fw, fw, surfSize, surfSize);

    // Subtle edge boundary line
    this.graphics.lineStyle(1, 0x000000, 0.35);
    this.graphics.strokeRect(fw, fw, surfSize, surfSize);
  }

  /**
   * Draws the 4 raised wooden cushions bordering the playing surface.
   */
  private drawInnerCushions(): void {
    const s = this.dimensions.size;
    const fw = this.dimensions.frameWidth;
    const cWidth = fw * 0.35; // cushion bevel depth
    const cushionColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.frameInnerCushion).color;

    this.graphics.fillStyle(cushionColor, 1);

    // Top cushion
    this.graphics.fillRect(fw, fw - cWidth, s - fw * 2, cWidth);
    // Bottom cushion
    this.graphics.fillRect(fw, s - fw, s - fw * 2, cWidth);
    // Left cushion
    this.graphics.fillRect(fw - cWidth, fw, cWidth, s - fw * 2);
    // Right cushion
    this.graphics.fillRect(s - fw, fw, cWidth, s - fw * 2);

    // Bumper highlight lines
    this.graphics.lineStyle(1.5, 0x000000, 0.4);
    this.graphics.strokeRect(fw, fw, s - fw * 2, s - fw * 2);
  }

  /**
   * Draws official carrom baselines along all 4 edges with end target circles.
   */
  private drawBaselines(): void {
    const markColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.markingsColor).color;
    const circleColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.baselineCircleColor).color;
    const dotColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.baselineDotColor).color;

    const s = this.dimensions.size;
    const fw = this.dimensions.frameWidth;
    const bo = this.dimensions.baselineOffset;
    const bl = this.dimensions.baselineLength;
    const bcr = this.dimensions.baselineCircleRadius;
    const gap = s * 0.018; // gap between parallel lines

    const drawSide = (x1: number, y1: number, x2: number, y2: number, isHorizontal: boolean) => {
      // Parallel lines
      this.graphics.lineStyle(1.5, markColor, 0.85);

      if (isHorizontal) {
        // Line 1 (inner)
        this.graphics.lineBetween(x1, y1 - gap / 2, x2, y2 - gap / 2);
        // Line 2 (outer)
        this.graphics.lineBetween(x1, y1 + gap / 2, x2, y2 + gap / 2);

        // Circular target caps at both ends
        [x1, x2].forEach((cx) => {
          this.graphics.fillStyle(circleColor, 1);
          this.graphics.fillCircle(cx, y1, bcr);
          this.graphics.lineStyle(1.5, markColor, 0.9);
          this.graphics.strokeCircle(cx, y1, bcr);

          // Center solid dot
          this.graphics.fillStyle(dotColor, 1);
          this.graphics.fillCircle(cx, y1, bcr * 0.4);
        });
      } else {
        // Line 1 (inner)
        this.graphics.lineBetween(x1 - gap / 2, y1, x2 - gap / 2, y2);
        // Line 2 (outer)
        this.graphics.lineBetween(x1 + gap / 2, y1, x2 + gap / 2, y2);

        // Circular target caps at both ends
        [y1, y2].forEach((cy) => {
          this.graphics.fillStyle(circleColor, 1);
          this.graphics.fillCircle(x1, cy, bcr);
          this.graphics.lineStyle(1.5, markColor, 0.9);
          this.graphics.strokeCircle(x1, cy, bcr);

          // Center solid dot
          this.graphics.fillStyle(dotColor, 1);
          this.graphics.fillCircle(x1, cy, bcr * 0.4);
        });
      }
    };

    const halfBl = bl / 2;
    const center = s / 2;

    // South Baseline (Bottom)
    drawSide(center - halfBl, s - fw - bo, center + halfBl, s - fw - bo, true);
    // North Baseline (Top)
    drawSide(center - halfBl, fw + bo, center + halfBl, fw + bo, true);
    // West Baseline (Left)
    drawSide(fw + bo, center - halfBl, fw + bo, center + halfBl, false);
    // East Baseline (Right)
    drawSide(s - fw - bo, center - halfBl, s - fw - bo, center + halfBl, false);
  }

  /**
   * Draws accurate concentric center circle markings with Red Queen placement point.
   */
  private drawCenterCircle(): void {
    const center = this.dimensions.size / 2;
    const markColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.markingsColor).color;
    const dotColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.baselineDotColor).color;

    // Outer Circle (Diameter ~6.5cm ICF standard)
    this.graphics.lineStyle(2, markColor, 0.9);
    this.graphics.strokeCircle(center, center, this.dimensions.centerOuterRadius);

    // Inner Circle (Diameter ~2.5cm)
    this.graphics.lineStyle(1.5, markColor, 0.7);
    this.graphics.strokeCircle(center, center, this.dimensions.centerInnerRadius);

    // Center Queen Placement Red Dot
    this.graphics.fillStyle(dotColor, 1);
    this.graphics.fillCircle(center, center, this.dimensions.centerRedDotRadius);
  }

  /**
   * Draws 4 diagonal decorative arrows radiating towards the center circle.
   */
  private drawCornerArrows(): void {
    const s = this.dimensions.size;
    const fw = this.dimensions.frameWidth;
    const bo = this.dimensions.baselineOffset;
    const arrowLen = s * 0.085;
    const markColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.markingsColor).color;
    const circleColor = Phaser.Display.Color.HexStringToColor(this.theme.colors.baselineCircleColor).color;

    const corners = [
      { x: fw + bo * 0.6, y: fw + bo * 0.6, angle: Math.PI / 4 },         // Top-Left
      { x: s - fw - bo * 0.6, y: fw + bo * 0.6, angle: (3 * Math.PI) / 4 }, // Top-Right
      { x: s - fw - bo * 0.6, y: s - fw - bo * 0.6, angle: -(3 * Math.PI) / 4 }, // Bottom-Right
      { x: fw + bo * 0.6, y: s - fw - bo * 0.6, angle: -Math.PI / 4 },        // Bottom-Left
    ];

    corners.forEach((c) => {
      const endX = c.x + Math.cos(c.angle) * arrowLen;
      const endY = c.y + Math.sin(c.angle) * arrowLen;

      // Shaft
      this.graphics.lineStyle(1.8, markColor, 0.85);
      this.graphics.lineBetween(c.x, c.y, endX, endY);

      // Terminal circle
      this.graphics.fillStyle(circleColor, 1);
      this.graphics.fillCircle(endX, endY, 4.5);
    });
  }

  /**
   * Places the 4 corner pockets.
   */
  private drawPockets(): void {
    const s = this.dimensions.size;
    const fw = this.dimensions.frameWidth;
    const pr = this.dimensions.pocketRadius;
    const inset = fw + pr * 0.55;

    const pocketCoords = [
      { x: inset, y: inset },         // Top-Left
      { x: s - inset, y: inset },     // Top-Right
      { x: inset, y: s - inset },     // Bottom-Left
      { x: s - inset, y: s - inset }, // Bottom-Right
    ];

    pocketCoords.forEach((coord) => {
      const pocket = this.scene.add.sprite(coord.x, coord.y, ASSET_KEYS.TEXTURES.POCKET);
      pocket.setDisplaySize(pr * 2.2, pr * 2.2);
      pocket.setDepth(2);
      this.container.add(pocket);
      this.pockets.push(pocket);
    });
  }

  /**
   * Cleans up pocket sprites.
   */
  private clearPockets(): void {
    this.pockets.forEach((p) => p.destroy());
    this.pockets = [];
  }

  /**
   * Cleans up all board renderer resources.
   */
  public destroy(): void {
    this.clearPockets();
    this.graphics.destroy();
    this.container.destroy();
  }
}
