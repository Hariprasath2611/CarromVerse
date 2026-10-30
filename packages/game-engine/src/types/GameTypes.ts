/**
 * CarromVerse Game Engine - Core Types
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface NormalizedCoordinate {
  nx: number; // 0.0 to 1.0 (0,0 is top-left, 0.5,0.5 is board center)
  ny: number;
}

export type CoinType = 'white' | 'black' | 'queen';

export type StrikerSkin = 'classic' | 'emerald' | 'royal' | 'gold';

export type BoardThemeId = 'classic' | 'forest' | 'royal' | 'marble' | 'neon' | 'gold';

export interface BoardThemeColors {
  frameColor: string;
  frameAccent: string;
  frameInnerCushion: string;
  surfaceBg: string;
  surfaceGlow?: string;
  markingsColor: string;
  pocketColor: string;
  pocketRimColor: string;
  baselineCircleColor: string;
  baselineDotColor: string;
  arrowColor: string;
}

export interface BoardThemeConfig {
  id: BoardThemeId;
  name: string;
  colors: BoardThemeColors;
}

export interface BoardDimensions {
  size: number;
  frameWidth: number;
  playingSurfaceSize: number;
  pocketRadius: number;
  centerOuterRadius: number;
  centerInnerRadius: number;
  centerRedDotRadius: number;
  baselineOffset: number;
  baselineLength: number;
  baselineCircleRadius: number;
  coinRadius: number;
  strikerRadius: number;
}

export interface CoinVisualConfig {
  id: string;
  type: CoinType;
  nx: number;
  ny: number;
  scale?: number;
  rotation?: number;
  visible?: boolean;
}

export interface StrikerVisualConfig {
  id: string;
  skin: StrikerSkin;
  nx: number;
  ny: number;
  scale?: number;
  rotation?: number;
  visible?: boolean;
  activeSeat?: number; // 0: South, 1: East, 2: North, 3: West
}

export type BridgeMessageType =
  | 'ENGINE_INIT'
  | 'ENGINE_READY'
  | 'BOARD_RENDERED'
  | 'CHANGE_THEME'
  | 'CHANGE_STRIKER_SKIN'
  | 'SET_PLAYER_SEAT'
  | 'RESET_BOARD'
  | 'SET_STRIKER_OFFSET'
  | 'PAUSE_ENGINE'
  | 'RESUME_ENGINE'
  | 'COIN_CLICKED'
  | 'STRIKER_DRAGGED';

export interface BridgeMessage<T = any> {
  type: BridgeMessageType;
  payload?: T;
  timestamp: number;
}
