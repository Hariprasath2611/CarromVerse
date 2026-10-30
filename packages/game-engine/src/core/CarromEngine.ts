import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { CarromBoardScene } from '../scenes/CarromBoardScene.js';
import { WebviewBridge } from '../bridge/WebviewBridge.js';
import { BridgeCommand, BridgeEvent } from '../events/BridgeProtocol.js';
import { createPhaserGameConfig } from '../config/game.config.js';
import { PlayerSeat } from '@carromverse/shared-types';

export interface EngineOptions {
  containerId: string | HTMLElement;
  initialSeat?: PlayerSeat;
  onEvent?: (event: BridgeEvent) => void;
}

export class CarromEngine {
  private game: Phaser.Game | null = null;
  private bridge: WebviewBridge;
  private options: EngineOptions;

  constructor(options: EngineOptions) {
    this.options = options;
    this.bridge = new WebviewBridge();

    if (options.onEvent) {
      // Direct local callback hook for non-webview testing
      const origSend = this.bridge.sendToReactNative.bind(this.bridge);
      this.bridge.sendToReactNative = (evt: BridgeEvent) => {
        origSend(evt);
        options.onEvent?.(evt);
      };
    }
  }

  public start(): void {
    if (this.game) return;

    const boardScene = new CarromBoardScene();
    const config = createPhaserGameConfig(this.options.containerId, [BootScene, boardScene]);

    this.game = new Phaser.Game(config);

    // Pass bridge to scene
    this.game.scene.start('CarromBoardScene', {
      bridge: this.bridge,
      seat: this.options.initialSeat ?? 0,
    });
  }

  public sendCommand(command: BridgeCommand): void {
    const scene = this.game?.scene.getScene('CarromBoardScene') as CarromBoardScene | undefined;
    if (scene) {
      scene.handleBridgeCommand(command);
    }
  }

  public pause(): void {
    this.sendCommand({ type: 'PAUSE_ENGINE', payload: undefined, timestamp: Date.now() });
  }

  public resume(): void {
    this.sendCommand({ type: 'RESUME_ENGINE', payload: undefined, timestamp: Date.now() });
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
