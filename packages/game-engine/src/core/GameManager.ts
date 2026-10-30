import * as Phaser from 'phaser';
import { createCarromGameConfig, CarromGameEngineOptions } from './GameConfig.js';
import { CarromScene } from '../scenes/CarromScene.js';
import { GAME_EVENTS } from './GameEvents.js';
import { BridgeMessage, StrikerSkin } from '../types/GameTypes.js';

export class GameManager {
  private game: Phaser.Game | null = null;
  private options: CarromGameEngineOptions;
  private onBridgeMessageCallback?: (msg: BridgeMessage) => void;

  constructor(options: CarromGameEngineOptions = {}) {
    this.options = options;
  }

  /**
   * Initializes the Phaser 3 Game instance.
   */
  public init(onBridgeMessage?: (msg: BridgeMessage) => void): Phaser.Game {
    if (this.game) {
      return this.game;
    }

    this.onBridgeMessageCallback = onBridgeMessage;
    const config = createCarromGameConfig(this.options);
    this.game = new Phaser.Game(config);

    // Bind engine events to bridge
    this.game.events.on(GAME_EVENTS.BOARD_RENDERED, (data: any) => {
      this.sendBridgeMessage('BOARD_RENDERED', data);
    });

    this.game.events.on(GAME_EVENTS.ENGINE_READY, () => {
      this.sendBridgeMessage('ENGINE_READY', { status: 'ready' });
    });

    this.game.events.on(GAME_EVENTS.STRIKER_MOVED, (data: any) => {
      this.sendBridgeMessage('STRIKER_DRAGGED', data);
    });

    return this.game;
  }

  /**
   * Returns active CarromScene if ready.
   */
  private getCarromScene(): CarromScene | null {
    if (!this.game) return null;
    return (this.game.scene.getScene('CarromScene') as CarromScene) || null;
  }

  /**
   * Changes the board theme.
   */
  public changeTheme(themeId: string): void {
    const scene = this.getCarromScene();
    scene?.changeTheme(themeId);
  }

  /**
   * Changes the striker visual skin.
   */
  public changeStrikerSkin(skin: StrikerSkin): void {
    const scene = this.getCarromScene();
    scene?.changeStrikerSkin(skin);
  }

  /**
   * Sets the active shooting seat (0: South, 1: East, 2: North, 3: West).
   */
  public setActiveSeat(seat: number): void {
    const scene = this.getCarromScene();
    scene?.setActiveSeat(seat);
  }

  /**
   * Moves striker along baseline (-1.0 to 1.0).
   */
  public setStrikerOffset(offsetRatio: number): void {
    const scene = this.getCarromScene();
    scene?.setStrikerOffset(offsetRatio);
  }

  /**
   * Resets opening coin arrangement.
   */
  public resetBoard(): void {
    const scene = this.getCarromScene();
    scene?.resetBoard();
  }

  /**
   * Pauses the game loop.
   */
  public pause(): void {
    if (this.game) {
      this.game.loop.sleep();
      this.sendBridgeMessage('PAUSE_ENGINE');
    }
  }

  /**
   * Resumes the game loop.
   */
  public resume(): void {
    if (this.game) {
      this.game.loop.wake();
      this.sendBridgeMessage('RESUME_ENGINE');
    }
  }

  /**
   * Processes incoming message from React Native host.
   */
  public handleIncomingMessage(msg: BridgeMessage): void {
    switch (msg.type) {
      case 'CHANGE_THEME':
        if (msg.payload?.themeId) this.changeTheme(msg.payload.themeId);
        break;
      case 'CHANGE_STRIKER_SKIN':
        if (msg.payload?.skin) this.changeStrikerSkin(msg.payload.skin);
        break;
      case 'SET_PLAYER_SEAT':
        if (typeof msg.payload?.seat === 'number') this.setActiveSeat(msg.payload.seat);
        break;
      case 'SET_STRIKER_OFFSET':
        if (typeof msg.payload?.offset === 'number') this.setStrikerOffset(msg.payload.offset);
        break;
      case 'RESET_BOARD':
        this.resetBoard();
        break;
      case 'PAUSE_ENGINE':
        this.pause();
        break;
      case 'RESUME_ENGINE':
        this.resume();
        break;
    }
  }

  /**
   * Dispatches message to React Native host.
   */
  private sendBridgeMessage(type: BridgeMessage['type'], payload?: any): void {
    const message: BridgeMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // If running in browser/WebView environment
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    }

    this.onBridgeMessageCallback?.(message);
  }

  /**
   * Cleans up Phaser game instance.
   */
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
