import Phaser from 'phaser';
import { PhysicsWorld } from './PhysicsWorld.js';
import { CollisionManager } from './CollisionManager.js';
import { BoardBoundary } from '../entities/BoardBoundary.js';
import { PocketSensor } from '../entities/PocketSensor.js';
import { FrictionController } from '../mechanics/FrictionController.js';
import { PocketDetection, PocketEventData } from '../mechanics/PocketDetection.js';
import { MotionDetector } from '../mechanics/MotionDetector.js';
import { StrikerController } from '../mechanics/StrikerController.js';
import { AimingController, AimState } from '../mechanics/AimingController.js';
import { ShootingController, ShotResult } from '../mechanics/ShootingController.js';
import { GameEventManager } from '../systems/GameEventManager.js';
import { PhysicsSync } from '../systems/PhysicsSync.js';
import { Coin } from '../entities/Coin.js';
import { Striker } from '../entities/Striker.js';
import { PHYSICS_EVENTS } from './PhysicsEvents.js';
import { CarromBoard } from '../board/CarromBoard.js';

export class PhysicsManager {
  private scene: Phaser.Scene;
  private board: CarromBoard;
  public readonly physicsWorld: PhysicsWorld;
  public readonly boardBoundary: BoardBoundary;
  public readonly pocketSensor: PocketSensor;
  public readonly collisionManager: CollisionManager;
  public readonly frictionController: FrictionController;
  public readonly pocketDetection: PocketDetection;
  public readonly motionDetector: MotionDetector;
  public readonly eventManager: GameEventManager;

  public strikerController?: StrikerController;
  public aimingController?: AimingController;
  public shootingController?: ShootingController;

  private striker?: Striker;
  private coins: Coin[] = [];

  constructor(
    scene: Phaser.Scene,
    board: CarromBoard,
    hostBridgeSender?: (type: string, payload: any) => void
  ) {
    this.scene = scene;
    this.board = board;

    this.eventManager = new GameEventManager(hostBridgeSender);
    this.physicsWorld = new PhysicsWorld(scene);
    this.boardBoundary = new BoardBoundary(scene);
    this.pocketSensor = new PocketSensor(scene);
    this.frictionController = new FrictionController(scene);

    this.pocketDetection = new PocketDetection(scene, (data: PocketEventData) => {
      this.eventManager.emit(PHYSICS_EVENTS.OBJECT_POCKETED, data);
      if (data.type === 'striker') {
        this.eventManager.emit(PHYSICS_EVENTS.STRIKER_POCKETED, data);
      }
    });

    this.collisionManager = new CollisionManager(
      scene,
      this.pocketDetection,
      this.eventManager
    );

    this.motionDetector = new MotionDetector({
      onStrikerStopped: () => {
        this.eventManager.emit(PHYSICS_EVENTS.STRIKER_STOPPED);
      },
      onAllObjectsStopped: () => {
        this.eventManager.emit(PHYSICS_EVENTS.ALL_OBJECTS_STOPPED);
      },
      onShotSettled: () => {
        const pocketed = this.pocketDetection.getPocketedInCurrentShot();
        const strikerPos = this.striker
          ? this.striker.getPixelPosition()
          : { x: 0, y: 0 };
        const strikerNorm = this.striker
          ? this.striker.getNormalizedPosition()
          : { nx: 0, ny: 0 };

        this.eventManager.emit(PHYSICS_EVENTS.SHOT_SETTLED, {
          durationMs: 0,
          pocketedCount: pocketed.length,
          pocketedCoins: pocketed,
          strikerSettledPosition: {
            x: strikerPos.x,
            y: strikerPos.y,
            nx: strikerNorm.nx,
            ny: strikerNorm.ny,
          },
        });

        this.pocketDetection.clearCurrentShotPocketed();
      },
      onCoinMoved: (coinId: string) => {
        this.eventManager.emit(PHYSICS_EVENTS.COIN_MOVED, { coinId });
      },
    });
  }

  public initialize(boardSize: number): void {
    this.physicsWorld.initialize();
    this.boardBoundary.createBoundaries(boardSize);
    this.pocketSensor.createSensors(boardSize);
    this.collisionManager.setupCollisionHandlers();
  }

  public bindEntities(striker: Striker, coins: Coin[]): void {
    this.striker = striker;
    this.coins = coins;

    // Create Matter physics bodies
    striker.createPhysicsBody();
    coins.forEach((coin) => coin.createPhysicsBody());

    // Initialize mechanics controllers
    this.strikerController = new StrikerController(striker, this.board);
    this.aimingController = new AimingController(striker, (aim: AimState) => {
      this.eventManager.emit(PHYSICS_EVENTS.AIM_CHANGED, aim);
    });
    this.shootingController = new ShootingController(
      striker,
      this.motionDetector,
      (result: ShotResult) => {
        if (result.success) {
          this.eventManager.emit(PHYSICS_EVENTS.SHOT_STARTED, result);
        }
      }
    );
  }

  /**
   * Called every physics/scene frame.
   */
  public update(): void {
    if (!this.striker) return;

    // 1. Collect all active bodies
    const activeBodies: MatterJS.BodyType[] = [];
    if (this.striker.physicsBody) {
      activeBodies.push(this.striker.physicsBody);
    }
    this.coins.forEach((c) => {
      if (c.physicsBody && !c.isPocketed) {
        activeBodies.push(c.physicsBody);
      }
    });

    // 2. Apply realistic surface friction & zero micro-jitter
    this.frictionController.update(activeBodies);

    // 3. Synchronize visual containers & sprites with Matter body positions
    PhysicsSync.syncAll(this.striker, this.coins);

    // 4. Update motion and rest detection
    this.motionDetector.update(this.striker, this.coins);
  }

  public shoot(aim: AimState): ShotResult {
    if (!this.shootingController) {
      return { success: false, reason: 'striker_missing_body' };
    }
    return this.shootingController.shoot(aim);
  }

  public resetBoard(): void {
    this.pocketDetection.reset();
    if (this.striker) {
      this.striker.resetToBaseline(0);
    }
  }

  public destroy(): void {
    this.boardBoundary.destroy();
    this.pocketSensor.destroy();
    this.eventManager.clear();
  }
}

