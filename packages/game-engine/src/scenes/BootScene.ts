import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Phase 1.1 uses procedural vector graphics for premium sharpness at any DPI
    // Future audio/spritesheet preloads will hook in here
  }

  public create(): void {
    this.scene.start('CarromBoardScene');
  }
}

