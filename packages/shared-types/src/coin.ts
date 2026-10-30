export type CoinType = 'white' | 'black' | 'queen';

export type CoinState = 'on_board' | 'pocketed' | 'due' | 'in_hand';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Coin {
  id: string;
  type: CoinType;
  position: Vector2D;
  velocity: Vector2D;
  angle: number;
  angularVelocity: number;
  state: CoinState;
  pocketedBy?: string;
  pocketedAtTurn?: number;
  isCoverCoin?: boolean;
}

export interface CoinSetup {
  type: CoinType;
  position: Vector2D;
}
