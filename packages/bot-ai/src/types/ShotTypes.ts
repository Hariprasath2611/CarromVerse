import { PlayerSeat } from '@carromverse/shared-types';

export interface Vector2D {
  x: number;
  y: number;
}

export interface CoinSnapshot {
  id: string;
  type: 'white' | 'black' | 'queen';
  position: Vector2D;
  isPocketed: boolean;
}

export interface PocketDefinition {
  id: number;
  position: Vector2D;
  radius: number;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface BoardSnapshot {
  boardSize: number;
  scale: number;
  coins: CoinSnapshot[];
  striker: {
    position: Vector2D;
    radius: number;
    seat: PlayerSeat;
    offsetRatio: number;
    isPocketed: boolean;
  };
  pockets: PocketDefinition[];
  activeSeat: PlayerSeat;
  timestamp: number;
}

export type ShotType = 'direct' | 'cut' | 'bank' | 'defensive';

export interface CandidateShot {
  id: string;
  targetCoinId: string;
  targetCoinType: 'white' | 'black' | 'queen';
  pocketId: number;
  strikerOffset: number; // clamped to [-0.92, 0.92]
  strikerPosition: Vector2D;
  targetCoinPosition: Vector2D;
  pocketPosition: Vector2D;
  aimAngle: number; // in radians, directed from strikerPosition towards impactPoint
  powerRatio: number; // in [0.20, 0.95]
  impactPoint: Vector2D;
  cutAngleDeg: number;
  distanceToTarget: number;
  distanceToPocket: number;
  isLineOfSightClear: boolean;
  isPocketLineClear: boolean;
  shotType: ShotType;
  score: number;
  estimatedSuccessProbability: number;
  foulRisk: number;
}
