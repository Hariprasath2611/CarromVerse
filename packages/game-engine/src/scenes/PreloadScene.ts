import * as Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public create(): void {
    // Immediately start the main gameplay rendering scene
    this.scene.start('CarromScene');
  }
}
