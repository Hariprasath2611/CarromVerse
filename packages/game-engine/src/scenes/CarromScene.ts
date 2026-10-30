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

export class CarromScene extends Phaser.Scene {
  public board!: CarromBoard;
  public coins: Map<string, Coin> = new Map();
  public queen!: Queen;
  public striker!: Striker;
  public pointerInput!: PointerInput;

  private currentThemeId: string = 'forest';
  private currentStrikerSkin: StrikerSkin = 'emerald';
  private activeSeat: number = 0;

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

    // 2. Setup Opening Coin Cluster
    this.setupOpeningFormation();

    // 3. Initialize Striker on South Baseline
    this.striker = new Striker(
      this,
      this.board,
      'striker_player',
      this.currentStrikerSkin,
      this.activeSeat
    );

    // 4. Initialize Pointer Input
    this.pointerInput = new PointerInput(this, canvasSize, {
      onPointerMove: (coord, rawPixel, isDragging) => {
        if (isDragging) {
          // Calculate horizontal offset along active baseline
          const baseline = this.board.getSeatBaseline(this.activeSeat);
          let offsetRatio = 0;
          if (this.activeSeat % 2 === 0) {
            // Horizontal baseline
            const halfLen = (baseline.x2 - baseline.x1) / 2;
            const midX = (baseline.x1 + baseline.x2) / 2;
            offsetRatio = (coord.nx - midX) / halfLen;
          } else {
            // Vertical baseline
            const halfLen = (baseline.y2 - baseline.y1) / 2;
            const midY = (baseline.y1 + baseline.y2) / 2;
            offsetRatio = (coord.ny - midY) / halfLen;
          }

          this.striker.setBaselineOffset(offsetRatio);
          this.game.events.emit(GAME_EVENTS.STRIKER_MOVED, {
            offsetRatio,
            pos: this.striker.getNormalizedPosition(),
          });
        }
      },
    });

    // Notify listeners that board has been completely rendered
    this.game.events.emit(GAME_EVENTS.BOARD_RENDERED, {
      theme: this.currentThemeId,
      coinCount: this.coins.size,
    });
    this.game.events.emit(GAME_EVENTS.ENGINE_READY);
  }

  /**
   * Clears existing pieces and spawns the official ICF opening formation.
   */
  public setupOpeningFormation(): void {
    // Clear old pieces
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

  /**
   * Switches board theme dynamically.
   */
  public changeTheme(themeId: string): void {
    this.currentThemeId = themeId;
    const theme = getBoardTheme(themeId);

    // Regenerate procedural textures for pockets & arrows
    const tm = new TextureManager(this, theme);
    tm.generateAllTextures(theme);

    // Redraw board surface and markings
    this.board.setTheme(themeId);

    this.game.events.emit(GAME_EVENTS.THEME_CHANGED, { themeId });
  }

  /**
   * Switches striker visual skin.
   */
  public changeStrikerSkin(skin: StrikerSkin): void {
    this.currentStrikerSkin = skin;
    this.striker.setSkin(skin);
    this.game.events.emit(GAME_EVENTS.STRIKER_SKIN_CHANGED, { skin });
  }

  /**
   * Sets active player turn seat (0: South, 1: East, 2: North, 3: West).
   */
  public setActiveSeat(seat: number): void {
    this.activeSeat = seat;
    this.striker.setActiveSeat(seat);
  }

  /**
   * Updates striker offset directly from external slider (-1.0 to 1.0).
   */
  public setStrikerOffset(offsetRatio: number): void {
    this.striker.setBaselineOffset(offsetRatio);
  }

  /**
   * Resets the entire board to opening formation.
   */
  public resetBoard(): void {
    this.setupOpeningFormation();
    this.striker.setBaselineOffset(0);
    this.game.events.emit(GAME_EVENTS.BOARD_RESET);
  }
}
