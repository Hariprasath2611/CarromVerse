/**
 * 32-bit collision categories and masks for Matter.js physics filtering.
 * Strictly symmetric collision table without collision groups.
 */

export const COLLISION_CATEGORIES = {
  DEFAULT: 0x0001,
  BOARD_BOUNDARY: 0x0002,
  CUSHION: 0x0002, // Backward compatibility alias for BOARD_BOUNDARY / WALL
  WALL: 0x0002,    // Primary name for static cushions/walls
  WHITE_COIN: 0x0004,
  BLACK_COIN: 0x0008,
  QUEEN: 0x0010,
  COIN: 0x001c,    // 0x0004 | 0x0008 | 0x0010 (All coins)
  STRIKER: 0x0020,
  POCKET_SENSOR: 0x0040,
  POCKET: 0x0040,  // Alias for pocket sensor
} as const;

export type CollisionCategoryType = keyof typeof COLLISION_CATEGORIES;

// Convenience bitmask grouping all coin categories
export const ALL_COINS_CATEGORY =
  COLLISION_CATEGORIES.WHITE_COIN |
  COLLISION_CATEGORIES.BLACK_COIN |
  COLLISION_CATEGORIES.QUEEN;

// All moving playing pieces (coins + striker)
export const ALL_PIECES_CATEGORY =
  ALL_COINS_CATEGORY |
  COLLISION_CATEGORIES.STRIKER;

export const COLLISION_MASKS = {
  // Walls collide with striker and all coins; walls do NOT interact with pockets
  WALL: ALL_PIECES_CATEGORY,
  BOARD_BOUNDARY: ALL_PIECES_CATEGORY,
  CUSHION: ALL_PIECES_CATEGORY,

  // Striker collides with walls, all coins, and pocket sensors
  STRIKER:
    COLLISION_CATEGORIES.WALL |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // White coin collides with walls, other coins, striker, and pocket sensors
  WHITE_COIN:
    COLLISION_CATEGORIES.WALL |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Black coin collides with walls, other coins, striker, and pocket sensors
  BLACK_COIN:
    COLLISION_CATEGORIES.WALL |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Queen collides with walls, other coins, striker, and pocket sensors
  QUEEN:
    COLLISION_CATEGORIES.WALL |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Generic coin mask for backward compatibility
  COIN:
    COLLISION_CATEGORIES.WALL |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Pocket sensors detect striker and all coins (pure sensor, no physical resistance)
  POCKET_SENSOR: ALL_PIECES_CATEGORY,
  POCKET: ALL_PIECES_CATEGORY,
} as const;

/**
 * Validates the collision table for absolute mathematical symmetry:
 * For every category pair (A, B): (categoryA & maskB !== 0) === (categoryB & maskA !== 0)
 */
export function assertSymmetricCollisionTable(): boolean {
  const checkList: Array<{ name: string; cat: number; mask: number }> = [
    { name: 'WALL', cat: COLLISION_CATEGORIES.WALL, mask: COLLISION_MASKS.WALL },
    { name: 'WHITE_COIN', cat: COLLISION_CATEGORIES.WHITE_COIN, mask: COLLISION_MASKS.WHITE_COIN },
    { name: 'BLACK_COIN', cat: COLLISION_CATEGORIES.BLACK_COIN, mask: COLLISION_MASKS.BLACK_COIN },
    { name: 'QUEEN', cat: COLLISION_CATEGORIES.QUEEN, mask: COLLISION_MASKS.QUEEN },
    { name: 'STRIKER', cat: COLLISION_CATEGORIES.STRIKER, mask: COLLISION_MASKS.STRIKER },
    { name: 'POCKET_SENSOR', cat: COLLISION_CATEGORIES.POCKET_SENSOR, mask: COLLISION_MASKS.POCKET_SENSOR },
  ];

  for (let i = 0; i < checkList.length; i++) {
    for (let j = 0; j < checkList.length; j++) {
      const a = checkList[i];
      const b = checkList[j];

      const aCollidesWithB = (a.cat & b.mask) !== 0;
      const bCollidesWithA = (b.cat & a.mask) !== 0;

      if (aCollidesWithB !== bCollidesWithA) {
        throw new Error(
          `Asymmetric collision configuration detected between ${a.name} and ${b.name}: ` +
          `${a.name} in ${b.name}.mask=${aCollidesWithB}, but ${b.name} in ${a.name}.mask=${bCollidesWithA}`
        );
      }
    }
  }

  return true;
}

// Run verification at startup in dev/test
assertSymmetricCollisionTable();
