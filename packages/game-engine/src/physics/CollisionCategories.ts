/**
 * 32-bit collision categories for Matter.js collision filter masks.
 */
export const COLLISION_CATEGORIES = {
  DEFAULT: 0x0001,
  CUSHION: 0x0002,
  COIN: 0x0004,
  STRIKER: 0x0008,
  POCKET_SENSOR: 0x0010,
} as const;

export const COLLISION_MASKS = {
  // Striker collides with cushions and coins, and triggers pocket sensors
  STRIKER: COLLISION_CATEGORIES.CUSHION | COLLISION_CATEGORIES.COIN | COLLISION_CATEGORIES.POCKET_SENSOR,
  // Coins collide with other coins, cushions, and striker, and trigger pocket sensors
  COIN: COLLISION_CATEGORIES.CUSHION | COLLISION_CATEGORIES.COIN | COLLISION_CATEGORIES.STRIKER | COLLISION_CATEGORIES.POCKET_SENSOR,
  // Cushions collide with striker and coins
  CUSHION: COLLISION_CATEGORIES.STRIKER | COLLISION_CATEGORIES.COIN,
  // Pocket sensors detect coins and striker
  POCKET_SENSOR: COLLISION_CATEGORIES.STRIKER | COLLISION_CATEGORIES.COIN,
} as const;

