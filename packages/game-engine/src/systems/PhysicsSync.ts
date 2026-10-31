import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';

export class PhysicsSync {
  /**
   * Synchronizes visual positions, rotations, and shadows with their Matter.js physics bodies.
   */
  public static syncAll(striker: Striker, coins: Coin[]): void {
    // 1. Sync Striker
    striker.syncVisualWithPhysics();

    // 2. Sync Coins
    coins.forEach((coin) => {
      coin.syncVisualWithPhysics();
    });
  }
}

