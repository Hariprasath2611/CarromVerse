/**
 * CarromVerse - Asset Keys and Registry
 */

export const ASSET_KEYS = {
  TEXTURES: {
    BOARD_FRAME: 'tex_board_frame',
    BOARD_SURFACE: 'tex_board_surface',
    BOARD_MARKINGS: 'tex_board_markings',
    POCKET: 'tex_pocket',
    COIN_WHITE: 'tex_coin_white',
    COIN_BLACK: 'tex_coin_black',
    COIN_QUEEN: 'tex_coin_queen',
    COIN_SHADOW: 'tex_coin_shadow',
    STRIKER_CLASSIC: 'tex_striker_classic',
    STRIKER_EMERALD: 'tex_striker_emerald',
    STRIKER_ROYAL: 'tex_striker_royal',
    STRIKER_GOLD: 'tex_striker_gold',
    STRIKER_SHADOW: 'tex_striker_shadow',
    CORNER_ARROW: 'tex_corner_arrow',
  },
} as const;

export function getStrikerTextureKey(skin: string): string {
  switch (skin) {
    case 'emerald':
      return ASSET_KEYS.TEXTURES.STRIKER_EMERALD;
    case 'royal':
      return ASSET_KEYS.TEXTURES.STRIKER_ROYAL;
    case 'gold':
      return ASSET_KEYS.TEXTURES.STRIKER_GOLD;
    case 'classic':
    default:
      return ASSET_KEYS.TEXTURES.STRIKER_CLASSIC;
  }
}
