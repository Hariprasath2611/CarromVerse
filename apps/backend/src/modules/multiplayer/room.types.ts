import { GameMode } from '@carromverse/shared-types';

export interface MultiplayerRoomDto {
  roomId: string;
  roomCode: string;
  mode: GameMode;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  status: 'waiting' | 'starting' | 'in_game' | 'finished';
  createdAt: string;
}

export interface CreateRoomRequestDto {
  mode: GameMode;
  hostId: string;
  hostName: string;
  isPrivate?: boolean;
}

