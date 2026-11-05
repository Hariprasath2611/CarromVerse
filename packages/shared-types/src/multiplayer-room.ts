import { GameMode } from './game-mode.js';

export type RoomLifecycleState =
  | 'CREATED'
  | 'WAITING'
  | 'READY'
  | 'STARTING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'EXPIRED';

export type RoomTeamId = 'team_a' | 'team_b' | 'none';

export interface MultiplayerPlayer {
  id: string; // Session ID
  userId: string; // Firebase Auth UID
  displayName: string;
  avatar: string;
  seat: number;
  assignedCoinType: 'white' | 'black';
  teamId: RoomTeamId;
  isReady: boolean;
  isConnected: boolean;
  isHost: boolean;
  score?: number;
  fouls?: number;
}

export interface PrivateRoomSettings {
  gameMode: GameMode;
  maxPlayers: number;
  targetScore: number;
  turnTimeLimitSeconds: number;
  boardTheme: string;
  isPrivate: boolean;
  hasPassword?: boolean;
  password?: string;
  teamAName?: string;
  teamBName?: string;
}

export interface CreatePrivateRoomDto {
  gameMode: GameMode;
  targetScore?: number;
  turnTimeLimitSeconds?: number;
  boardTheme?: string;
  password?: string;
  teamAName?: string;
  teamBName?: string;
}

export interface JoinPrivateRoomDto {
  roomCode: string;
  password?: string;
  displayName?: string;
  avatar?: string;
}

export interface RoomLookupResponse {
  roomCode: string;
  roomId: string;
  exists: boolean;
  status: RoomLifecycleState;
  gameMode: GameMode;
  maxPlayers: number;
  currentPlayers: number;
  hasPassword: boolean;
  hostDisplayName: string;
  boardTheme: string;
}

export interface MultiplayerRoomDetails {
  roomId: string;
  roomCode: string;
  status: RoomLifecycleState;
  gameMode: GameMode;
  maxPlayers: number;
  currentPlayers: number;
  hostUserId: string;
  players: MultiplayerPlayer[];
  settings: PrivateRoomSettings;
  createdAt: number;
  lastActivityAt: number;
}

export interface VerifyRoomPasswordDto {
  roomCode: string;
  password: string;
}

// Client to Server Message Payloads
export type ClientMultiplayerMessage =
  | { type: 'SET_READY'; isReady?: boolean }
  | { type: 'CHANGE_GAME_MODE'; gameMode: GameMode }
  | { type: 'CHANGE_SETTINGS'; settings: Partial<PrivateRoomSettings> }
  | { type: 'SWITCH_TEAM'; targetTeam?: RoomTeamId }
  | { type: 'SWAP_SEATS'; seatA: number; seatB: number }
  | { type: 'KICK_PLAYER'; targetSessionId: string }
  | { type: 'START_MATCH' }
  | { type: 'LEAVE_ROOM' };
