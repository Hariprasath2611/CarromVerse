import Phaser from 'phaser';
import { BASELINE_DEFINITIONS } from '@carromverse/game-logic';
import { ENGINE_BOARD_CONFIG } from '../config/board.config.js';

export class BoardRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
  }

  public render(): void {
    const g = this.graphics;
    const cfg = ENGINE_BOARD_CONFIG;
    const size = cfg.boardSize;
    const theme = cfg.theme;

    g.clear();

    // 1. Outer Dark Mahogany Frame
    g.fillStyle(theme.outerFrameColor, 1);
    g.fillRect(0, 0, size, size);

    // 2. Cushion Border
    const framePadding = 25;
    g.fillStyle(theme.cushionBorderColor, 1);
    g.fillRect(framePadding, framePadding, size - framePadding * 2, size - framePadding * 2);

    // 3. Polished Maple Playing Surface
    const playAreaOffset = 50;
    const playAreaSize = size - playAreaOffset * 2;
    g.fillStyle(theme.playingSurfaceColor, 1);
    g.fillRect(playAreaOffset, playAreaOffset, playAreaSize, playAreaSize);

    // 4. Corner Pockets (Holes & Rings)
    cfg.pockets.forEach((pos) => {
      // Iron / brass pocket bezel
      g.fillStyle(theme.pocketRingColor, 1);
      g.fillCircle(pos.x, pos.y, cfg.pocketRadius);

      // Deep dark pocket cutout
      g.fillStyle(theme.pocketHoleColor, 1);
      g.fillCircle(pos.x, pos.y, cfg.pocketCutoutRadius);
    });

    // 5. Baselines and Base Circles for 4 sides
    Object.values(BASELINE_DEFINITIONS).forEach((b) => {
      // Double baseline lines
      g.lineStyle(2, theme.patternGoldColor, 0.9);
      g.lineBetween(b.start.x, b.start.y, b.end.x, b.end.y);

      // Parallel secondary baseline
      const offset = 32;
      const pStartX = b.start.x - b.normalDirection.x * offset;
      const pStartY = b.start.y - b.normalDirection.y * offset;
      const pEndX = b.end.x - b.normalDirection.x * offset;
      const pEndY = b.end.y - b.normalDirection.y * offset;
      g.lineBetween(pStartX, pStartY, pEndX, pEndY);

      // Red baseline termination circles
      g.fillStyle(theme.foulLineRedColor, 1);
      g.fillCircle(b.leftCircleCenter.x, b.leftCircleCenter.y, cfg.baselineCircleRadius * 0.45);
      g.fillCircle(b.rightCircleCenter.x, b.rightCircleCenter.y, cfg.baselineCircleRadius * 0.45);

      // Outer gold circle around red circles
      g.lineStyle(1.5, theme.patternGoldColor, 0.8);
      g.strokeCircle(b.leftCircleCenter.x, b.leftCircleCenter.y, cfg.baselineCircleRadius * 0.45);
      g.strokeCircle(b.rightCircleCenter.x, b.rightCircleCenter.y, cfg.baselineCircleRadius * 0.45);
    });

    // 6. Center Circle & Floral Mandala
    const center = { x: size / 2, y: size / 2 };

    // Outer decorative circle
    g.lineStyle(2, theme.patternGoldColor, 0.7);
    g.strokeCircle(center.x, center.y, cfg.outerCircleRadius);

    // Center Queen Circle
    g.fillStyle(theme.foulLineRedColor, 1);
    g.fillCircle(center.x, center.y, cfg.centerCircleRadius);
    g.lineStyle(2, theme.patternGoldColor, 0.9);
    g.strokeCircle(center.x, center.y, cfg.centerCircleRadius);

    // Decorative 12-petal radiating lines in center
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const r1 = cfg.centerCircleRadius + 4;
      const r2 = cfg.outerCircleRadius - 6;
      g.lineStyle(1, theme.patternGoldColor, 0.35);
      g.lineBetween(
        center.x + Math.cos(angle) * r1,
        center.y + Math.sin(angle) * r1,
        center.x + Math.cos(angle) * r2,
        center.y + Math.sin(angle) * r2
      );
    }
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
