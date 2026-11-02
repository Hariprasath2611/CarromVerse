import { Logger } from '../utils/logger.js';

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface PlayerSession {
  userId: string;
  displayName: string;
  avatar: string;
  connectionId: string;
  connectionStatus: ConnectionStatus;
  joinedTimestamp: number;
  lastActivityTimestamp: number;
  activeRoomId?: string;
  metadata?: Record<string, unknown>;
}

export class PlayerSessionManager {
  private static instance: PlayerSessionManager;
  private sessions = new Map<string, PlayerSession>(); // Key: userId
  private connectionIndex = new Map<string, string>(); // Key: connectionId -> userId

  public static getInstance(): PlayerSessionManager {
    if (!PlayerSessionManager.instance) {
      PlayerSessionManager.instance = new PlayerSessionManager();
    }
    return PlayerSessionManager.instance;
  }

  public createOrUpdateSession(
    userId: string,
    connectionId: string,
    profile: { displayName?: string; avatar?: string }
  ): PlayerSession {
    const existing = this.sessions.get(userId);
    const now = Date.now();

    if (existing) {
      // Remove old connection mapping if reassigned
      if (existing.connectionId && existing.connectionId !== connectionId) {
        this.connectionIndex.delete(existing.connectionId);
      }

      existing.connectionId = connectionId;
      existing.connectionStatus = 'CONNECTED';
      existing.lastActivityTimestamp = now;
      if (profile.displayName) existing.displayName = profile.displayName;
      if (profile.avatar) existing.avatar = profile.avatar;

      this.connectionIndex.set(connectionId, userId);
      Logger.info(`[PlayerSession] Updated session for user ${userId} (conn: ${connectionId})`);
      return existing;
    }

    const newSession: PlayerSession = {
      userId,
      displayName: profile.displayName || `Player_${userId.substring(0, 5)}`,
      avatar: profile.avatar || '👑',
      connectionId,
      connectionStatus: 'CONNECTED',
      joinedTimestamp: now,
      lastActivityTimestamp: now,
    };

    this.sessions.set(userId, newSession);
    this.connectionIndex.set(connectionId, userId);
    Logger.info(`[PlayerSession] Created new session for user ${userId} (conn: ${connectionId})`);
    return newSession;
  }

  public getSessionByUserId(userId: string): PlayerSession | undefined {
    return this.sessions.get(userId);
  }

  public getSessionByConnectionId(connectionId: string): PlayerSession | undefined {
    const userId = this.connectionIndex.get(connectionId);
    return userId ? this.sessions.get(userId) : undefined;
  }

  public updateActivity(userId: string): void {
    const session = this.sessions.get(userId);
    if (session) {
      session.lastActivityTimestamp = Date.now();
    }
  }

  public markDisconnected(connectionId: string): void {
    const userId = this.connectionIndex.get(connectionId);
    if (userId) {
      const session = this.sessions.get(userId);
      if (session) {
        session.connectionStatus = 'DISCONNECTED';
        session.lastActivityTimestamp = Date.now();
      }
      this.connectionIndex.delete(connectionId);
      Logger.info(`[PlayerSession] Marked user ${userId} as DISCONNECTED`);
    }
  }

  public assignRoom(userId: string, roomId: string | undefined): void {
    const session = this.sessions.get(userId);
    if (session) {
      session.activeRoomId = roomId;
    }
  }

  public removeSession(userId: string): void {
    const session = this.sessions.get(userId);
    if (session) {
      if (session.connectionId) {
        this.connectionIndex.delete(session.connectionId);
      }
      this.sessions.delete(userId);
    }
  }

  public getActiveCount(): number {
    return this.sessions.size;
  }
}
