import Phaser from 'phaser';
import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';
import { CoinType } from '../types/GameTypes.js';
import { SIZES, POCKET, PX_PER_CM, SIMULATION } from '../physics/PhysicsConfig.js';
import { PhysicsUtils } from '../utils/PhysicsUtils.js';

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
   * Called when an entity is within a pocket sensor zone.
   * Checks if body center is within capture distance (<= 0.85 * pocketRadius).
   * Applies gentle suction pull if within suction distance (<= 1.20 * pocketRadius).
   */
  public handleSensorOverlap(
    body: MatterJS.BodyType,
    pocketIndex: number,
    pocketSensorBody?: MatterJS.BodyType
  ): void {
    this.evaluatePocketInteraction(body, pocketIndex, pocketSensorBody);
  }

  public handleSensorActive(
    body: MatterJS.BodyType,
    pocketIndex: number,
    pocketSensorBody?: MatterJS.BodyType
  ): void {
    this.evaluatePocketInteraction(body, pocketIndex, pocketSensorBody);
  }

  private evaluatePocketInteraction(
    body: MatterJS.BodyType,
    pocketIndex: number,
    pocketSensorBody?: MatterJS.BodyType
  ): void {
    const entity = (body as any).entity as (Coin | Striker) | undefined;
    const bodyId = entity ? entity.id : ((body as any).entityId || body.label);
    if (!bodyId || this.pocketedIds.has(bodyId) || (body as any).isPocketed) {
      return;
    }

    if (!pocketSensorBody) {
      (body as any).isPocketed = true;
      this.pocketedIds.add(bodyId);
      if (entity) {
        this.queuedRemovals.push({ body, entity, pocketIdx: pocketIndex });
      } else {
        const type = (body as any).entityType || (body.label === 'striker' ? 'striker' : 'white');
        const eventData: PocketEventData = {
          id: bodyId,
          type: type as CoinType | 'striker',
          pocketIndex,
          timestamp: Date.now(),
        };
        this.pocketedInCurrentShot.push(eventData);
        this.scene.matter?.world?.remove?.(body);
        this.onPocketedCallback?.(eventData);
      }
      return;
    }

    // Calculate exact Euclidean distance from piece center to pocket hole center
    const dx = pocketSensorBody.position.x - body.position.x;
    const dy = pocketSensorBody.position.y - body.position.y;
    const distPx = Math.hypot(dx, dy);

    const pocketRadiusPx = SIZES.pocketRadiusPx;
    const captureDistPx = pocketRadiusPx * POCKET.captureRadiusRatio; // 0.85 * r
    const suctionDistPx = pocketRadiusPx * POCKET.suctionRadiusRatio; // 1.20 * r

    // 1. Suction pull: gentle radial attraction towards hole center
    if (distPx <= suctionDistPx && distPx > 1.0) {
      const suctionFactor = (1 - distPx / suctionDistPx) * 0.0008;
      this.scene.matter.body.applyForce(body, body.position, {
        x: dx * suctionFactor,
        y: dy * suctionFactor,
      });
    }

    // 2. Capture condition: center must be within 0.85 * pocketRadius
    if (distPx <= captureDistPx) {
      (body as any).isPocketed = true;
      this.pocketedIds.add(bodyId);

      if (entity) {
        this.queuedRemovals.push({ body, entity, pocketIdx: pocketIndex });
      } else {
        // Fallback if raw Matter body without entity wrapper
        const type = (body as any).entityType || (body.label === 'striker' ? 'striker' : 'white');
        const eventData: PocketEventData = {
          id: bodyId,
          type: type as CoinType | 'striker',
          pocketIndex,
          timestamp: Date.now(),
        };
        this.pocketedInCurrentShot.push(eventData);
        this.scene.matter.world.remove(body);
        this.onPocketedCallback?.(eventData);
      }
    }
  }

  /**
   * Safely process queued removals outside of the collision step.
   * Deduplicates by entity id so each pocketed object fires exactly once.
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
