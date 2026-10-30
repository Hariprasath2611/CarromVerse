import { CoinType, PlayerSeat, Vector2D } from '@carromverse/shared-types';

/**
 * Commands sent from React Native to Phaser Game Engine inside the WebView.
 */
export type BridgeCommandType =
  | 'INIT_ENGINE'
  | 'SET_STRIKER_POSITION'
  | 'SET_AIM_VECTOR'
  | 'FIRE_STRIKER'
  | 'RESET_STRIKER'
  | 'RESET_BOARD'
  | 'SET_AIM_ASSIST'
  | 'PAUSE_ENGINE'
  | 'RESUME_ENGINE';

export interface BaseBridgeCommand<T extends BridgeCommandType = BridgeCommandType, P = any> {
  type: T;
  payload: P;
  timestamp: number;
}

export interface InitEngineCommand extends BaseBridgeCommand<'INIT_ENGINE', {
  activeSeat: PlayerSeat;
  soundEnabled: boolean;
  aimAssistEnabled: boolean;
}> {}

export interface SetStrikerPositionCommand extends BaseBridgeCommand<'SET_STRIKER_POSITION', {
  normalizedPos: number; // 0.0 to 1.0 along active player's baseline
}> {}

export interface SetAimVectorCommand extends BaseBridgeCommand<'SET_AIM_VECTOR', {
  angle: number;
  power: number; // 0.0 to 1.0
}> {}

export interface FireStrikerCommand extends BaseBridgeCommand<'FIRE_STRIKER', {
  angle: number;
  power: number; // 0.0 to 1.0
}> {}

export type BridgeCommand =
  | InitEngineCommand
  | SetStrikerPositionCommand
  | SetAimVectorCommand
  | FireStrikerCommand
  | BaseBridgeCommand<'RESET_STRIKER', { seat: PlayerSeat }>
  | BaseBridgeCommand<'RESET_BOARD', void>
  | BaseBridgeCommand<'SET_AIM_ASSIST', { enabled: boolean }>
  | BaseBridgeCommand<'PAUSE_ENGINE', void>
  | BaseBridgeCommand<'RESUME_ENGINE', void>;

/**
 * Events sent from Phaser Game Engine to React Native UI.
 */
export type BridgeEventType =
  | 'ENGINE_READY'
  | 'STRIKER_PLACED'
  | 'STRIKER_FIRED'
  | 'COIN_POCKETED'
  | 'STRIKER_POCKETED'
  | 'COLLISION'
  | 'ALL_BODIES_SETTLED';

export interface BaseBridgeEvent<T extends BridgeEventType = BridgeEventType, P = any> {
  type: T;
  payload: P;
  timestamp: number;
}

export interface EngineReadyEvent extends BaseBridgeEvent<'ENGINE_READY', {
  engineVersion: string;
  fps: number;
}> {}

export interface CoinPocketedBridgeEvent extends BaseBridgeEvent<'COIN_POCKETED', {
  coinId: string;
  coinType: CoinType;
  pocketIndex: number;
}> {}

export interface StrikerPocketedBridgeEvent extends BaseBridgeEvent<'STRIKER_POCKETED', {
  pocketIndex: number;
}> {}

export interface CollisionBridgeEvent extends BaseBridgeEvent<'COLLISION', {
  bodyA: 'striker' | 'coin' | 'cushion';
  bodyB: 'striker' | 'coin' | 'cushion';
  intensity: number;
}> {}

export interface AllBodiesSettledBridgeEvent extends BaseBridgeEvent<'ALL_BODIES_SETTLED', {
  remainingCoins: { id: string; type: CoinType; position: Vector2D }[];
}> {}

export type BridgeEvent =
  | EngineReadyEvent
  | CoinPocketedBridgeEvent
  | StrikerPocketedBridgeEvent
  | CollisionBridgeEvent
  | AllBodiesSettledBridgeEvent
  | BaseBridgeEvent<'STRIKER_PLACED', { x: number; y: number }>
  | BaseBridgeEvent<'STRIKER_FIRED', { power: number; angle: number }>;

