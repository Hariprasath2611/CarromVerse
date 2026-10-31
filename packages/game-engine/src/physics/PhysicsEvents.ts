import { CoinType } from '../types/GameTypes.js';

export const PHYSICS_EVENTS = {
  STRIKER_PLACED: 'physics:striker_placed',
  AIM_CHANGED: 'physics:aim_changed',
  SHOT_STARTED: 'physics:shot_started',
  COIN_MOVED: 'physics:coin_moved',
  COIN_COLLISION: 'physics:coin_collision',
  CUSHION_COLLISION: 'physics:cushion_collision',
  OBJECT_POCKETED: 'physics:object_pocketed',
  STRIKER_POCKETED: 'physics:striker_pocketed',
  STRIKER_STOPPED: 'physics:striker_stopped',
  ALL_OBJECTS_STOPPED: 'physics:all_objects_stopped',
  SHOT_SETTLED: 'physics:shot_settled',
} as const;

export type PhysicsEventType = typeof PHYSICS_EVENTS[keyof typeof PHYSICS_EVENTS];

export interface ShotStartedPayload {
  power: number;
  normalizedPower: number;
  angle: number;
  velocity: { x: number; y: number };
}

export interface AimChangedPayload {
  angle: number;
  power: number;
  normalizedPower: number;
  aimRay: { startX: number; startY: number; endX: number; endY: number };
}

export interface CoinCollisionPayload {
  bodyAId: string;
  bodyBId: string;
  bodyAType: CoinType | 'striker';
  bodyBType: CoinType | 'striker';
  impactSpeed: number;
  point: { x: number; y: number };
}

export interface CushionCollisionPayload {
  bodyId: string;
  bodyType: CoinType | 'striker';
  cushionLabel: string;
  impactSpeed: number;
}

export interface ObjectPocketedPayload {
  id: string;
  type: CoinType | 'striker';
  pocketIndex: number;
  timestamp: number;
}

export interface ShotSettledPayload {
  durationMs: number;
  pocketedCount: number;
  pocketedCoins: { id: string; type: CoinType | 'striker'; pocketIndex: number }[];
  strikerSettledPosition: { x: number; y: number; nx: number; ny: number };
}
