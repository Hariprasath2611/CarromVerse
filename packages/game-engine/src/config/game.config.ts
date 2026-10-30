import Phaser from 'phaser';
import { ENGINE_BOARD_CONFIG } from './board.config.js';
import { WORLD_PHYSICS_CONFIG } from './physics.config.js';

export function createPhaserGameConfig(
  parentContainerId: string | HTMLElement,
  scenes: Phaser.Types.Scenes.SceneType[]
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parentContainerId,
    width: ENGINE_BOARD_CONFIG.boardSize,
    height: ENGINE_BOARD_CONFIG.boardSize,
    backgroundColor: ENGINE_BOARD_CONFIG.theme.backgroundColor,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: WORLD_PHYSICS_CONFIG.gravity,
        debug: false,
        runner: {
          fps: 60,
        },
      },
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    scene: scenes,
  };
}
