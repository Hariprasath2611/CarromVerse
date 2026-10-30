import { CoinType } from '@carromverse/shared-types';

export interface CoinVisualConfig {
  radius: number;
  primaryColor: number;
  rimColor: number;
  innerPatternColor: number;
  label: string;
}

export const COIN_VISUAL_CONFIGS: Record<CoinType, CoinVisualConfig> = {
  white: {
    radius: 28,
    primaryColor: 0xf5f5dc,       // Ivory white
    rimColor: 0xd4af37,           // Gold rim
    innerPatternColor: 0x8b4513,  // Subtle wood engraving
    label: 'White Coin',
  },
  black: {
    radius: 28,
    primaryColor: 0x221a15,       // Rich dark ebony
    rimColor: 0x4a3728,           // Warm mahogany rim
    innerPatternColor: 0x8b5a2b,  // Amber center ring
    label: 'Black Coin',
  },
  queen: {
    radius: 28,
    primaryColor: 0xb22222,       // Deep ruby / crimson red
    rimColor: 0xffd700,           // Royal gold rim
    innerPatternColor: 0xffffff,  // White floral star center
    label: 'Queen',
  },
};
