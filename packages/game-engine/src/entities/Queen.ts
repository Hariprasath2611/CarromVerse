import * as Phaser from 'phaser';
import { Coin } from './Coin.js';
import { CarromBoard } from '../board/CarromBoard.js';

export class Queen extends Coin {
  constructor(scene: Phaser.Scene, board: CarromBoard, id: string = 'coin_queen', nx: number = 0.5, ny: number = 0.5) {
    super(scene, board, id, 'queen', nx, ny);
    this.container.setDepth(12); // Queen sits proudly slightly above standard carrom men
  }

  /**
   * Triggers a subtle victory celebration pulse on the queen.
   */
  public pulse(): void {
    this.scene.tweens.add({
      targets: this.container,
      scale: 1.15,
      duration: 300,
      yoyo: true,
      ease: 'Quad.easeInOut',
    });
  }
}
