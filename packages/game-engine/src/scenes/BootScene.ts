import * as Phaser from 'phaser';
import { TextureManager } from '../rendering/TextureManager.js';
import { getBoardTheme } from '../board/BoardThemes.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    const initialThemeId = (this.game.registry.get('themeId') as string) || 'forest';
    const theme = getBoardTheme(initialThemeId);

    // Procedurally generate all coin, striker, pocket, and shadow textures
    const textureManager = new TextureManager(this, theme);
    textureManager.generateAllTextures(theme);

    // Transition to Preload Scene
    this.scene.start('PreloadScene');
  }
}
