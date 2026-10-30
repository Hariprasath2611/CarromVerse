import Phaser from 'phaser';
import { CoinType, PlayerSeat, Vector2D } from '@carromverse/shared-types';
import { BOARD_CENTER } from '@carromverse/game-logic';
import { BoardRenderer } from '../rendering/BoardRenderer.js';
import { CarromPhysicsWorld } from '../physics/CarromPhysicsWorld.js';
import { CoinEntity } from '../entities/CoinEntity.js';
import { StrikerEntity } from '../entities/StrikerEntity.js';
import { InputManager } from '../input/InputManager.js';
import { WebviewBridge } from '../bridge/WebviewBridge.js';
import { BridgeCommand } from '../events/BridgeProtocol.js';
import { ENGINE_BOARD_CONFIG } from '../config/board.config.js';

export class CarromBoardScene extends Phaser.Scene {
  private boardRenderer!: BoardRenderer;
  private physicsWorld!: CarromPhysicsWorld;
  private striker!: StrikerEntity;
  private coins: Map<string, CoinEntity> = new Map();
  private inputManager!: InputManager;
  private bridge!: WebviewBridge;
  private isSimulating: boolean = false;
  private activeSeat: PlayerSeat = 0;
  private aimAssistEnabled: boolean = true;

  constructor() {
    super({ key: 'CarromBoardScene' });
  }

  public init(data: { bridge?: WebviewBridge; seat?: PlayerSeat }): void {
    this.bridge = data.bridge || new WebviewBridge();
    this.activeSeat = data.seat ?? 0;
  }

  public create(): void {
    // 1. Render Carrom Board visuals
    this.boardRenderer = new BoardRenderer(this);
    this.boardRenderer.render();

    // 2. Initialize Physics World
    this.physicsWorld = new CarromPhysicsWorld(this, {
      onPocketCollision: (body, pocketIdx) => this.handlePocketCollision(body, pocketIdx),
      onImpact: (bodyA, bodyB, intensity) => this.handleBodyImpact(bodyA, bodyB, intensity),
    });
    this.physicsWorld.initialize();

    // 3. Create Striker
    this.striker = new StrikerEntity(this, this.activeSeat);

    // 4. Create Coins in standard layout
    this.spawnStandardCoins();

    // 5. Setup Input
    this.inputManager = new InputManager(this, this.striker, {
      onAimChange: (angle, power) => {
        // Broadcast aim change if needed
      },
      onFire: (angle, power) => {
        this.fireStriker(angle, power);
      },
      onPositionChange: (pos) => {
        this.striker.setBaselinePosition(pos);
      },
    });

    // 6. Connect Bridge Command Handler
    this.bridge.setCommandHandler((cmd) => this.handleBridgeCommand(cmd));

    // 7. Notify React Native that engine is ready
    this.bridge.sendToReactNative({
      type: 'ENGINE_READY',
      payload: {
        engineVersion: '1.0.0-phaser3',
        fps: 60,
      },
      timestamp: Date.now(),
    });
  }

  private spawnStandardCoins(): void {
    this.coins.forEach((c) => c.destroy());
    this.coins.clear();

    const radius = ENGINE_BOARD_CONFIG.coinRadius;

    // Queen
    this.addCoin('queen', 'queen', { x: BOARD_CENTER.x, y: BOARD_CENTER.y });

    // Inner Ring
    const innerDist = radius * 2 + 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const type: CoinType = i % 2 === 0 ? 'white' : 'black';
      this.addCoin(`inner_${i}`, type, {
        x: BOARD_CENTER.x + innerDist * Math.cos(angle),
        y: BOARD_CENTER.y + innerDist * Math.sin(angle),
      });
    }

    // Outer Ring
    const outerDist = innerDist * 1.95;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const type: CoinType = i % 2 === 0 ? 'white' : 'black';
      this.addCoin(`outer_${i}`, type, {
        x: BOARD_CENTER.x + outerDist * Math.cos(angle),
        y: BOARD_CENTER.y + outerDist * Math.sin(angle),
      });
    }
  }

  private addCoin(id: string, type: CoinType, pos: Vector2D): void {
    const coin = new CoinEntity(this, id, type, pos);
    this.coins.set(id, coin);
  }

  public fireStriker(angle: number, power: number): void {
    if (this.isSimulating) return;

    this.isSimulating = true;
    this.inputManager.setInteractive(false);
    this.striker.fire(angle, power);

    this.bridge.sendToReactNative({
      type: 'STRIKER_FIRED',
      payload: { angle, power },
      timestamp: Date.now(),
    });
  }

  private handlePocketCollision(body: MatterJS.BodyType, pocketIndex: number): void {
    const pocketPos = ENGINE_BOARD_CONFIG.pockets[pocketIndex];

    if (body.label === 'striker_main') {
      this.striker.animatePocket(pocketPos, () => {
        this.bridge.sendToReactNative({
          type: 'STRIKER_POCKETED',
          payload: { pocketIndex },
          timestamp: Date.now(),
        });
      });
    } else if (body.label?.startsWith('coin_')) {
      const coinId = body.label.replace('coin_', '');
      const coin = this.coins.get(coinId);
      if (coin && !coin.isPocketed) {
        coin.animatePocket(pocketPos, () => {
          this.bridge.sendToReactNative({
            type: 'COIN_POCKETED',
            payload: {
              coinId: coin.id,
              coinType: coin.type,
              pocketIndex,
            },
            timestamp: Date.now(),
          });
        });
      }
    }
  }

  private handleBodyImpact(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType, intensity: number): void {
    this.bridge.sendToReactNative({
      type: 'COLLISION',
      payload: {
        bodyA: (bodyA.label === 'striker_main' ? 'striker' : bodyA.label?.startsWith('coin') ? 'coin' : 'cushion') as any,
        bodyB: (bodyB.label === 'striker_main' ? 'striker' : bodyB.label?.startsWith('coin') ? 'coin' : 'cushion') as any,
        intensity: Math.min(1.0, intensity / 5),
      },
      timestamp: Date.now(),
    });
  }

  public handleBridgeCommand(cmd: BridgeCommand): void {
    switch (cmd.type) {
      case 'INIT_ENGINE':
        this.activeSeat = cmd.payload.activeSeat;
        this.aimAssistEnabled = cmd.payload.aimAssistEnabled;
        this.striker.setSeat(this.activeSeat);
        break;
      case 'SET_STRIKER_POSITION':
        this.striker.setBaselinePosition(cmd.payload.normalizedPos);
        break;
      case 'SET_AIM_VECTOR':
        this.striker.drawAimIndicator(cmd.payload.angle, cmd.payload.power, this.aimAssistEnabled);
        break;
      case 'FIRE_STRIKER':
        this.fireStriker(cmd.payload.angle, cmd.payload.power);
        break;
      case 'RESET_STRIKER':
        this.activeSeat = cmd.payload.seat;
        this.striker.setSeat(this.activeSeat);
        this.inputManager.setInteractive(true);
        this.isSimulating = false;
        break;
      case 'RESET_BOARD':
        this.spawnStandardCoins();
        this.striker.resetToBaseline(0.5);
        this.inputManager.setInteractive(true);
        this.isSimulating = false;
        break;
      case 'SET_AIM_ASSIST':
        this.aimAssistEnabled = cmd.payload.enabled;
        break;
      case 'PAUSE_ENGINE':
        this.scene.pause();
        break;
      case 'RESUME_ENGINE':
        this.scene.resume();
        break;
    }
  }

  public override update(): void {
    this.striker.update();
    this.coins.forEach((c) => c.update());

    // Check if motion has stopped after a shot
    if (this.isSimulating) {
      const activeBodies: MatterJS.BodyType[] = [this.striker.body];
      this.coins.forEach((c) => {
        if (!c.isPocketed) activeBodies.push(c.body);
      });

      if (this.physicsWorld.areAllBodiesAtRest(activeBodies)) {
        this.isSimulating = false;
        this.inputManager.setInteractive(true);

        const remainingCoins = Array.from(this.coins.values())
          .filter((c) => !c.isPocketed)
          .map((c) => ({
            id: c.id,
            type: c.type,
            position: { x: c.body.position.x, y: c.body.position.y },
          }));

        this.bridge.sendToReactNative({
          type: 'ALL_BODIES_SETTLED',
          payload: { remainingCoins },
          timestamp: Date.now(),
        });
      }
    }
  }
}
