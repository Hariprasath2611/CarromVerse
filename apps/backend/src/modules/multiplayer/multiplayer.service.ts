import { generateId } from '@carromverse/shared-utils';
import { BaseService } from '../../services/base.service.js';
import { CreateRoomRequestDto, MultiplayerRoomDto } from './room.types.js';

export class MultiplayerService extends BaseService {
  private rooms: Map<string, MultiplayerRoomDto> = new Map();

  constructor() {
    super('MultiplayerService');
  }

  public async createRoom(dto: CreateRoomRequestDto): Promise<MultiplayerRoomDto> {
    const roomId = generateId('room');
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const maxPlayers = dto.mode === 'two_player_individual' ? 2 : dto.mode === 'three_player_individual' ? 3 : 4;

    const room: MultiplayerRoomDto = {
      roomId,
      roomCode,
      mode: dto.mode,
      hostId: dto.hostId,
      hostName: dto.hostName,
      maxPlayers,
      currentPlayers: 1,
      isPrivate: !!dto.isPrivate,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    this.rooms.set(roomId, room);
    this.log(`Created room ${roomCode} (${roomId}) for mode ${dto.mode}`);
    return room;
  }

  public async getAvailableRooms(): Promise<MultiplayerRoomDto[]> {
    return Array.from(this.rooms.values()).filter((r) => !r.isPrivate && r.status === 'waiting');
  }

  public async getRoomById(roomId: string): Promise<MultiplayerRoomDto | undefined> {
    return this.rooms.get(roomId);
  }
}
