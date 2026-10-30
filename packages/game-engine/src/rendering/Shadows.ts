import { Vector2D } from '../types/GameTypes.js';

export interface ShadowConfig {
  offset: Vector2D;
  blur: number;
  alpha: number;
  color: string;
}

export const COIN_SHADOW_CONFIG: ShadowConfig = {
  offset: { x: 3, y: 4 },
  blur: 6,
  alpha: 0.45,
  color: '#000000',
};

export const STRIKER_SHADOW_CONFIG: ShadowConfig = {
  offset: { x: 4, y: 6 },
  blur: 8,
  alpha: 0.55,
  color: '#000000',
};

export const CUSHION_SHADOW_CONFIG: ShadowConfig = {
  offset: { x: 2, y: 3 },
  blur: 5,
  alpha: 0.35,
  color: '#000000',
};
