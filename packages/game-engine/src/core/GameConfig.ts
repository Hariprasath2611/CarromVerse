import * as Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { CarromScene } from '../scenes/CarromScene.js';

export interface CarromGameEngineOptions {
  parent?: HTMLElement | string;
  width?: number;
  height?: number;
  themeId?: string;
  strikerSkin?: string;
}

export function createCarromGameConfig(options: CarromGameEngineOptions = {}): Phaser.Types.Core.GameConfig {
  const size = options.width || 800;

  return {
    type: Phaser.AUTO,
    parent: options.parent,
    width: size,
    height: size,
    backgroundColor: '#07130E', // Matches CarromVerse Forest Emerald background
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: size,
      height: size,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, CarromScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set('themeId', options.themeId || 'forest');
        game.registry.set('strikerSkin', options.strikerSkin || 'emerald');
      },
    },
  };
}
