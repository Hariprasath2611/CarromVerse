/**
 * 32-bit collision categories and masks for Matter.js physics filtering.
 */

export const COLLISION_CATEGORIES = {
  DEFAULT: 0x0001,
  BOARD_BOUNDARY: 0x0002,
  CUSHION: 0x0002, // Backward compatibility alias for BOARD_BOUNDARY
  WHITE_COIN: 0x0004,
  BLACK_COIN: 0x0008,
  QUEEN: 0x0010,
  COIN: 0x001c, // 0x0004 | 0x0008 | 0x0010 (All coins)
  STRIKER: 0x0020,
  POCKET_SENSOR: 0x0040,
} as const;

export type CollisionCategoryType = keyof typeof COLLISION_CATEGORIES;

// Convenience bitmask grouping all coin categories
export const ALL_COINS_CATEGORY =
  COLLISION_CATEGORIES.WHITE_COIN |
  COLLISION_CATEGORIES.BLACK_COIN |
  COLLISION_CATEGORIES.QUEEN;

export const COLLISION_MASKS = {
  // Striker collides with cushions, all coins, and triggers pocket sensors
  STRIKER:
    COLLISION_CATEGORIES.BOARD_BOUNDARY |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // White coins collide with cushions, other coins, striker, and pocket sensors
  WHITE_COIN:
    COLLISION_CATEGORIES.BOARD_BOUNDARY |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Black coins collide with cushions, other coins, striker, and pocket sensors
  BLACK_COIN:
    COLLISION_CATEGORIES.BOARD_BOUNDARY |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Queen collides with cushions, other coins, striker, and pocket sensors
  QUEEN:
    COLLISION_CATEGORIES.BOARD_BOUNDARY |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Cushions collide with striker and all coins
  BOARD_BOUNDARY:
    COLLISION_CATEGORIES.STRIKER |
    ALL_COINS_CATEGORY,

  CUSHION:
    COLLISION_CATEGORIES.STRIKER |
    ALL_COINS_CATEGORY,

  // Generic coin mask for backward compatibility
  COIN:
    COLLISION_CATEGORIES.BOARD_BOUNDARY |
    ALL_COINS_CATEGORY |
    COLLISION_CATEGORIES.STRIKER |
    COLLISION_CATEGORIES.POCKET_SENSOR,

  // Pocket sensors detect striker and all coins
  POCKET_SENSOR:
    COLLISION_CATEGORIES.STRIKER |
    ALL_COINS_CATEGORY,
} as const;
