import * as Phaser from 'phaser';
import { CarromBoard } from '../board/CarromBoard.js';
import { Coin } from '../entities/Coin.js';
import { Queen } from '../entities/Queen.js';
import { Striker } from '../entities/Striker.js';
import { generateOpeningCoinCluster } from '../board/BoardConfig.js';
import { getBoardTheme } from '../board/BoardThemes.js';
import { TextureManager } from '../rendering/TextureManager.js';
import { PointerInput } from '../input/PointerInput.js';
import { GAME_EVENTS } from '../core/GameEvents.js';
import { StrikerSkin } from '../types/GameTypes.js';
import { PhysicsManager } from '../physics/PhysicsManager.js';
import { AimState } from '../mechanics/AimingController.js';

export class CarromScene extends Phaser.Scene {
  public board!: CarromBoard;
  public coins: Map<string, Coin> = new Map();
  public queen!: Queen;
  public striker!: Striker;
  public pointerInput!: PointerInput;
  public physicsManager!: PhysicsManager;

  private currentThemeId: string = 'forest';
  private currentStrikerSkin: StrikerSkin = 'emerald';
  private activeSeat: number = 0;
  private isAiming: boolean = false;

  constructor() {
    super({ key: 'CarromScene' });
  }

  public create(): void {
    const canvasSize = this.cameras.main.width;
    this.currentThemeId = (this.game.registry.get('themeId') as string) || 'forest';
    this.currentStrikerSkin = (this.game.registry.get('strikerSkin') as StrikerSkin) || 'emerald';

    // 1. Initialize Carrom Board
    this.board = new CarromBoard(this, canvasSize, this.currentThemeId);
    this.board.init();

    // 2. Initialize Physics Manager
    this.physicsManager = new PhysicsManager(this, this.board, (type, payload) => {
      this.game.events.emit(type, payload);
    });
    this.physicsManager.initialize(canvasSize);

    // 3. Setup Opening Coin Cluster
    this.setupOpeningFormation();

    // 4. Initialize Striker on South Baseline
    this.striker = new Striker(
      this,
      this.board,
      'striker_player',
      this.currentStrikerSkin,
      this.activeSeat
    );

    // 5. Bind Physics to Entities
    this.physicsManager.bindEntities(this.striker, Array.from(this.coins.values()));

    // 6. Setup Interactive Pointer / Touch Controls
    this.setupControls(canvasSize);

    // Notify listeners that engine is fully ready
    this.game.events.emit(GAME_EVENTS.BOARD_RENDERED, {
      theme: this.currentThemeId,
      coinCount: this.coins.size,
    });
    this.game.events.emit(GAME_EVENTS.ENGINE_READY);
  }

  private setupControls(canvasSize: number): void {
    this.pointerInput = new PointerInput(this, canvasSize, {
      onPointerDown: (coord, rawPixel) => {
        if (!this.physicsManager.motionDetector.isBoardAtRest()) return;

        // Check if pointer initiates aiming on striker
        const started = this.physicsManager.aimingController?.startAim(rawPixel.x, rawPixel.y);
        this.isAiming = !!started;
      },
      onPointerMove: (coord, rawPixel, isDragging) => {
        if (!isDragging) return;

        if (this.isAiming) {
          this.physicsManager.aimingController?.updateAim(rawPixel.x, rawPixel.y);
        } else if (this.physicsManager.motionDetector.isBoardAtRest()) {
          // Adjust striker position along baseline
          const baseline = this.board.getSeatBaseline(this.activeSeat);
          let offsetRatio = 0;
          if (this.activeSeat % 2 === 0) {
            const halfLen = (baseline.x2 - baseline.x1) / 2;
            const midX = (baseline.x1 + baseline.x2) / 2;
            offsetRatio = (coord.nx - midX) / halfLen;
          } else {
            const halfLen = (baseline.y2 - baseline.y1) / 2;
            const midY = (baseline.y1 + baseline.y2) / 2;
            offsetRatio = (coord.ny - midY) / halfLen;
          }

          this.physicsManager.strikerController?.setOffset(offsetRatio);
          this.game.events.emit(GAME_EVENTS.STRIKER_MOVED, {
            offsetRatio,
            pos: this.striker.getNormalizedPosition(),
          });
        }
      },
      onPointerUp: () => {
        if (this.isAiming) {
          this.isAiming = false;
          const aim: AimState | null = this.physicsManager.aimingController?.releaseAim() ?? null;
          if (aim && aim.normalizedPower > 0.05) {
            this.physicsManager.shoot(aim);
          }
        }
      },
    });
  }

  public update(): void {
    if (this.physicsManager) {
      this.physicsManager.update();
    }
  }

  public setupOpeningFormation(): void {
    this.coins.forEach((coin) => coin.destroy());
    this.coins.clear();

    const cluster = generateOpeningCoinCluster();
    cluster.forEach((config) => {
      if (config.type === 'queen') {
        this.queen = new Queen(this, this.board, config.id, config.nx, config.ny);
        this.coins.set(config.id, this.queen);
      } else {
        const coin = new Coin(this, this.board, config.id, config.type, config.nx, config.ny);
        this.coins.set(config.id, coin);
      }
    });
  }

  public changeTheme(themeId: string): void {
    this.currentThemeId = themeId;
    const theme = getBoardTheme(themeId);

    const tm = new TextureManager(this, theme);
    tm.generateAllTextures(theme);
    this.board.setTheme(themeId);

    this.game.events.emit(GAME_EVENTS.THEME_CHANGED, { themeId });
  }

  public changeStrikerSkin(skin: StrikerSkin): void {
    this.currentStrikerSkin = skin;
    this.striker.setSkin(skin);
    this.game.events.emit(GAME_EVENTS.STRIKER_SKIN_CHANGED, { skin });
  }

  public setActiveSeat(seat: number): void {
    this.activeSeat = seat;
    this.physicsManager.strikerController?.setSeat(seat);
  }

  public setStrikerOffset(offsetRatio: number): void {
    this.physicsManager.strikerController?.setOffset(offsetRatio);
  }

  public resetBoard(): void {
    this.setupOpeningFormation();
    this.physicsManager.bindEntities(this.striker, Array.from(this.coins.values()));
    this.physicsManager.resetBoard();
    this.game.events.emit(GAME_EVENTS.BOARD_RESET);
  }
}
