import Phaser from 'phaser';
import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';
import { CoinType } from '../types/GameTypes.js';

export interface PocketEventData {
  id: string;
  type: CoinType | 'striker';
  pocketIndex: number;
  timestamp: number;
}

export type PocketCallback = (event: PocketEventData) => void;

export class PocketDetection {
  private scene: Phaser.Scene;
  private onPocketedCallback?: PocketCallback;
  private queuedRemovals: Array<{ body: MatterJS.BodyType; entity: Coin | Striker; pocketIdx: number }> = [];
  private pocketedInCurrentShot: PocketEventData[] = [];
  private pocketedIds: Set<string> = new Set();

  constructor(scene: Phaser.Scene, onPocketed?: PocketCallback) {
    this.scene = scene;
    this.onPocketedCallback = onPocketed;
  }

  /**
   * Called by collision manager when an entity intersects a pocket sensor.
   */
  public handleSensorOverlap(body: MatterJS.BodyType, pocketIndex: number): void {
    const entity = (body as any).entity as (Coin | Striker) | undefined;
    if (!entity) return;

    const id = entity.id;
    if (this.pocketedIds.has(id)) {
      // Prevent duplicate detection
      return;
    }

    this.pocketedIds.add(id);

    // Queue for safe removal after physics step
    this.queuedRemovals.push({ body, entity, pocketIdx: pocketIndex });
  }

  /**
   * Safely process queued removals outside of the collision step.
   */
  public processQueuedRemovals(): void {
    if (this.queuedRemovals.length === 0) return;

    const items = [...this.queuedRemovals];
    this.queuedRemovals = [];

    items.forEach(({ body, entity, pocketIdx }) => {
      const type = (body as any).entityType as CoinType | 'striker';
      const eventData: PocketEventData = {
        id: entity.id,
        type,
        pocketIndex: pocketIdx,
        timestamp: Date.now(),
      };

      this.pocketedInCurrentShot.push(eventData);

      // Play visual shrink/sink animation
      entity.playPocketAnimation(() => {
        // Safely remove physics body from world
        if (this.scene.matter && this.scene.matter.world) {
          this.scene.matter.world.remove(body);
        }
      });

      this.onPocketedCallback?.(eventData);
    });
  }

  public getPocketedInCurrentShot(): PocketEventData[] {
    return this.pocketedInCurrentShot;
  }

  public clearCurrentShotPocketed(): void {
    this.pocketedInCurrentShot = [];
  }

  public reset(): void {
    this.queuedRemovals = [];
    this.pocketedInCurrentShot = [];
    this.pocketedIds.clear();
  }
}

