import { DEFAULT_BOARD_DIMENSIONS, POCKET_POSITIONS } from '@carromverse/game-logic';

export const ENGINE_BOARD_CONFIG = {
  ...DEFAULT_BOARD_DIMENSIONS,
  pockets: POCKET_POSITIONS,
  theme: {
    backgroundColor: 0x0f0c0a,     // Deep obsidian background surrounding board
    playingSurfaceColor: 0xe6cca0, // Natural lacquered maple playing surface
    cushionBorderColor: 0x3d1c06,  // Dark rosewood / mahogany border
    outerFrameColor: 0x221105,     // Outer solid teak rim
    pocketHoleColor: 0x050505,     // Deep black hole
    pocketRingColor: 0x6e7681,     // Silver/iron pocket ring
    patternGoldColor: 0xb8860b,    // Gold baseline & center mandala
    foulLineRedColor: 0x8b0000,    // Deep red baseline termination circles
  },
};

