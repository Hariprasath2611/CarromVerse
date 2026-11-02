export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface NetworkConfig {
  serverUrl: string;
  connectionTimeoutMs: number;
  reconnectAttempts: number;
  pingIntervalMs: number;
}

export interface JoinRoomOptions {
  gameMode?: 'two_player_individual' | 'three_player_individual' | 'four_player_individual' | 'four_player_team';
  targetScore?: number;
  turnTimeLimitSeconds?: number;
  token?: string;
  displayName?: string;
  avatar?: string;
}

export interface NetworkErrorEvent {
  code: string;
  message: string;
  timestamp: number;
}

