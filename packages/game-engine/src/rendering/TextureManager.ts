import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../assets/AssetRegistry.js';
import { BoardThemeConfig } from '../types/GameTypes.js';

export class TextureManager {
  private scene: Phaser.Scene;
  private currentTheme: BoardThemeConfig;

  constructor(scene: Phaser.Scene, theme: BoardThemeConfig) {
    this.scene = scene;
    this.currentTheme = theme;
  }

  /**
   * Initializes and generates all procedural textures required for the carrom board.
   */
  public generateAllTextures(theme: BoardThemeConfig): void {
    this.currentTheme = theme;
    this.generateShadowTextures();
    this.generateCoinTextures();
    this.generateStrikerTextures();
    this.generatePocketTexture();
    this.generateArrowTexture();
  }

  /**
   * Generates soft radial drop shadow textures.
   */
  private generateShadowTextures(): void {
    // 1. Coin Shadow (Radius 48px)
    this.createCanvasTexture(ASSET_KEYS.TEXTURES.COIN_SHADOW, 96, 96, (ctx) => {
      const grad = ctx.createRadialGradient(48, 48, 16, 48, 48, 46);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(48, 48, 46, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Striker Shadow (Radius 64px)
    this.createCanvasTexture(ASSET_KEYS.TEXTURES.STRIKER_SHADOW, 128, 128, (ctx) => {
      const grad = ctx.createRadialGradient(64, 64, 24, 64, 64, 62);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(64, 64, 62, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Generates White, Black, and Queen coin textures.
   */
  private generateCoinTextures(): void {
    const size = 96;
    const center = size / 2;
    const r = center - 4;

    // A. WHITE COIN (Ivory polished wood/acrylic)
    this.createCanvasTexture(ASSET_KEYS.TEXTURES.COIN_WHITE, size, size, (ctx) => {
      // Base ivory gradient
      const baseGrad = ctx.createRadialGradient(center - 10, center - 10, 4, center, center, r);
      baseGrad.addColorStop(0, '#FFFFFF');
      baseGrad.addColorStop(0.4, '#FDFBF7');
      baseGrad.addColorStop(0.85, '#EBE3D5');
      baseGrad.addColorStop(1, '#C9BFA8');

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer bevel rim
      ctx.strokeStyle = '#B3A892';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Concentric carved decorative grooves
      ctx.strokeStyle = 'rgba(179, 168, 146, 0.55)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(center, center, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, r * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Center embossed dot
      ctx.fillStyle = '#C9BFA8';
      ctx.beginPath();
      ctx.arc(center, center, r * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Top-left curved specular gloss
      const glossGrad = ctx.createLinearGradient(center - r, center - r, center, center);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGrad;
      ctx.beginPath();
      ctx.arc(center - 8, center - 8, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });

    // B. BLACK COIN (Deep obsidian graphite)
    this.createCanvasTexture(ASSET_KEYS.TEXTURES.COIN_BLACK, size, size, (ctx) => {
      // Base dark graphite gradient
      const baseGrad = ctx.createRadialGradient(center - 10, center - 10, 4, center, center, r);
      baseGrad.addColorStop(0, '#3A3E45');
      baseGrad.addColorStop(0.3, '#22252A');
      baseGrad.addColorStop(0.85, '#121417');
      baseGrad.addColorStop(1, '#08090A');

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim edge
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Concentric carved grooves with subtle silver/graphite sheen
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.35)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(center, center, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, r * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = '#2D3139';
      ctx.beginPath();
      ctx.arc(center, center, r * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      const glossGrad = ctx.createLinearGradient(center - r, center - r, center, center);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGrad;
      ctx.beginPath();
      ctx.arc(center - 8, center - 8, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });

    // C. QUEEN COIN (Vibrant Ruby Red with Gold Rosette)
    this.createCanvasTexture(ASSET_KEYS.TEXTURES.COIN_QUEEN, size, size, (ctx) => {
      // Crimson base gradient
      const baseGrad = ctx.createRadialGradient(center - 10, center - 10, 4, center, center, r);
      baseGrad.addColorStop(0, '#FF4D4D');
      baseGrad.addColorStop(0.35, '#DC2626');
      baseGrad.addColorStop(0.85, '#991B1B');
      baseGrad.addColorStop(1, '#660F0F');

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fill();

      // Gold outer border
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner gold ring
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center, center, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      // Distinctive 8-point gold rosette star
      ctx.fillStyle = '#F59E0B';
      const points = 8;
      const outerR = r * 0.55;
      const innerR = r * 0.28;

      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const rad = (i * Math.PI) / points;
        const currentR = i % 2 === 0 ? outerR : innerR;
        const x = center + Math.cos(rad) * currentR;
        const y = center + Math.sin(rad) * currentR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Center ruby jewel core
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(center, center, r * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      const glossGrad = ctx.createLinearGradient(center - r, center - r, center, center);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glossGrad;
      ctx.beginPath();
      ctx.arc(center - 8, center - 8, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Generates Striker textures (Classic, Emerald, Royal, Gold).
   */
  private generateStrikerTextures(): void {
    const size = 128;
    const center = size / 2;
    const r = center - 5;

    // Helper to draw striker base
    const renderStriker = (
      key: string,
      primaryColors: [string, string, string],
      rimColor: string,
      innerColor: string
    ) => {
      this.createCanvasTexture(key, size, size, (ctx) => {
        // Base gradient
        const baseGrad = ctx.createRadialGradient(center - 14, center - 14, 6, center, center, r);
        baseGrad.addColorStop(0, primaryColors[0]);
        baseGrad.addColorStop(0.5, primaryColors[1]);
        baseGrad.addColorStop(1, primaryColors[2]);

        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.fill();

        // Metallic chrome rim
        ctx.strokeStyle = rimColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Secondary inner groove
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center, center, r * 0.78, 0, Math.PI * 2);
        ctx.stroke();

        // Center gem / emblem
        ctx.fillStyle = innerColor;
        ctx.beginPath();
        ctx.arc(center, center, r * 0.38, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = rimColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center pin
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(center, center, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Directional arrow pointer
        ctx.fillStyle = rimColor;
        ctx.beginPath();
        ctx.moveTo(center, center - r * 0.65);
        ctx.lineTo(center - 7, center - r * 0.42);
        ctx.lineTo(center + 7, center - r * 0.42);
        ctx.closePath();
        ctx.fill();

        // Curved gloss highlight
        const glossGrad = ctx.createLinearGradient(center - r, center - r, center, center);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.beginPath();
        ctx.arc(center - 12, center - 12, r * 0.48, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // 1. Emerald Striker (Forest Emerald default)
    renderStriker(
      ASSET_KEYS.TEXTURES.STRIKER_EMERALD,
      ['#34D399', '#059669', '#044E3B'],
      '#6EE7B7',
      '#065F46'
    );

    // 2. Classic Striker (Ivory tournament acrylic)
    renderStriker(
      ASSET_KEYS.TEXTURES.STRIKER_CLASSIC,
      ['#FFFFFF', '#E2E8F0', '#94A3B8'],
      '#CBD5E1',
      '#64748B'
    );

    // 3. Royal Striker (Deep Sapphire)
    renderStriker(
      ASSET_KEYS.TEXTURES.STRIKER_ROYAL,
      ['#60A5FA', '#2563EB', '#1E3A8A'],
      '#93C5FD',
      '#1D4ED8'
    );

    // 4. Gold Striker (Imperial Gold)
    renderStriker(
      ASSET_KEYS.TEXTURES.STRIKER_GOLD,
      ['#FDE047', '#EAB308', '#854D0E'],
      '#FEF08A',
      '#A16207'
    );
  }

  /**
   * Generates corner pocket texture with shadow depth.
   */
  private generatePocketTexture(): void {
    const size = 96;
    const center = size / 2;
    const r = center - 4;

    this.createCanvasTexture(ASSET_KEYS.TEXTURES.POCKET, size, size, (ctx) => {
      // Deep black cavity gradient
      const grad = ctx.createRadialGradient(center, center, 4, center, center, r);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.7, '#07090C');
      grad.addColorStop(0.92, '#1E232B');
      grad.addColorStop(1, '#2D3440');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fill();

      // Metallic pocket bracket rim
      ctx.strokeStyle = this.currentTheme.colors.pocketRimColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner net texture pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = -r; i <= r; i += 12) {
        ctx.beginPath();
        ctx.moveTo(center + i, center - r);
        ctx.lineTo(center + i, center + r);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(center - r, center + i);
        ctx.lineTo(center + r, center + i);
        ctx.stroke();
      }
    });
  }

  /**
   * Generates decorative corner foul arrow marker.
   */
  private generateArrowTexture(): void {
    const width = 80;
    const height = 24;

    this.createCanvasTexture(ASSET_KEYS.TEXTURES.CORNER_ARROW, width, height, (ctx) => {
      ctx.strokeStyle = this.currentTheme.colors.arrowColor;
      ctx.fillStyle = this.currentTheme.colors.arrowColor;
      ctx.lineWidth = 2.5;

      // Shaft line
      ctx.beginPath();
      ctx.moveTo(4, height / 2);
      ctx.lineTo(width - 16, height / 2);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(width - 16, 3);
      ctx.lineTo(width - 2, height / 2);
      ctx.lineTo(width - 16, height - 3);
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * Helper to create a Phaser texture from an HTML5 Canvas drawing.
   */
  private createCanvasTexture(
    key: string,
    width: number,
    height: number,
    drawCallback: (ctx: CanvasRenderingContext2D) => void
  ): void {
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawCallback(ctx);
      this.scene.textures.addCanvas(key, canvas);
    }
  }
}
