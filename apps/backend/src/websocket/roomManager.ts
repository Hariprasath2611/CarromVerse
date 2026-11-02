import { Logger } from '../utils/logger.js';

export interface ConnectedClient {
  id: string;
  userId: string;
  roomId?: string;
  joinedAt: number;
}

export class RoomManager {
  private rooms: Map<string, Set<string>> = new Map();
  private clients: Map<string, ConnectedClient> = new Map();

  public registerClient(clientId: string, userId: string): void {
    this.clients.set(clientId, { id: clientId, userId, joinedAt: Date.now() });
    Logger.debug(`Client registered: ${clientId} (${userId})`);
  }

  public unregisterClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client?.roomId) {
      this.leaveRoom(client.roomId, clientId);
    }
    this.clients.delete(clientId);
    Logger.debug(`Client unregistered: ${clientId}`);
  }

  public joinRoom(roomId: string, clientId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(clientId);
    const client = this.clients.get(clientId);
    if (client) {
      client.roomId = roomId;
    }
    Logger.info(`Client ${clientId} joined room ${roomId}`);
  }

  public leaveRoom(roomId: string, clientId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    const client = this.clients.get(clientId);
    if (client) {
      client.roomId = undefined;
    }
    Logger.info(`Client ${clientId} left room ${roomId}`);
  }

  public getRoomClients(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) || []);
  }
}

