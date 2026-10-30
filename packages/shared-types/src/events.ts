import { CoinType, Vector2D } from './coin.js';
import { FoulType } from './turn.js';

export type GameEventName =
  | 'STRIKER_POSITIONED'
  | 'STRIKER_AIM_CHANGED'
  | 'STRIKER_SHOT_RELEASED'
  | 'COLLISION_COIN_COIN'
  | 'COLLISION_COIN_CUSHION'
  | 'COLLISION_STRIKER_CUSHION'
  | 'COIN_POCKETED'
  | 'STRIKER_POCKETED'
  | 'BODIES_SETTLED'
  | 'FOUL_DETECTED'
  | 'TURN_STARTED'
  | 'TURN_TIME_TICK'
  | 'TURN_TIMEOUT'
  | 'TURN_EVALUATED'
  | 'ROUND_FINISHED'
  | 'MATCH_FINISHED';

export interface BaseGameEvent {
  type: GameEventName;
  timestamp: number;
}

export interface CoinPocketedEvent extends BaseGameEvent {
  type: 'COIN_POCKETED';
  coinId: string;
  coinType: CoinType;
  pocketIndex: number;
}

export interface StrikerPocketedEvent extends BaseGameEvent {
  type: 'STRIKER_POCKETED';
  pocketIndex: number;
}

export interface BodiesSettledEvent extends BaseGameEvent {
  type: 'BODIES_SETTLED';
  remainingCoins: { id: string; type: CoinType; position: Vector2D }[];
}

export interface FoulEvent extends BaseGameEvent {
  type: 'FOUL_DETECTED';
  playerId: string;
  foulType: FoulType;
  penaltyCoinsDue: number;
}
