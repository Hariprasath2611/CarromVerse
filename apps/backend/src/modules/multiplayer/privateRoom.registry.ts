import crypto from 'crypto';
import { GameMode, RoomLifecycleState } from '@carromverse/shared-types';
import { RoomCodeService } from './roomCode.service.js';
import { Logger } from '../../utils/logger.js';

export interface ActiveRoomEntry {
  roomId: string; // Colyseus room ID
  roomCode: string; // 6-character normalized room code
  hostUserId: string;
  hostDisplayName: string;
  gameMode: GameMode;
  maxPlayers: number;
  currentPlayers: number;
  hasPassword: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  boardTheme: string;
  targetScore: number;
  turnTimeLimitSeconds: number;
  status: RoomLifecycleState;
  createdAt: number;
  lastActivityAt: number;
}

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

export class PrivateRoomRegistry {
  private static instance: PrivateRoomRegistry;

  // Primary indexes
  private roomsByCode = new Map<string, ActiveRoomEntry>();
  private roomsById = new Map<string, ActiveRoomEntry>();

  // Rate limiting tracker: key -> { count, resetAt }
  private lookupRateLimits = new Map<string, RateLimitTracker>();

  // Config
  private static readonly MAX_LOOKUPS_PER_MINUTE = 25;
  private static readonly RATE_LIMIT_WINDOW_MS = 60 * 1000;
  private static readonly DEFAULT_ROOM_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes idle

  private constructor() {
    // Periodic cleanup of expired idle rooms
    setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000).unref();
  }

  public static getInstance(): PrivateRoomRegistry {
    if (!this.instance) {
      this.instance = new PrivateRoomRegistry();
    }
    return this.instance;
  }

  /**
   * Generates a guaranteed unique active room code.
   */
  public generateUniqueRoomCode(): string {
    const maxRetries = 20;
    for (let i = 0; i < maxRetries; i++) {
      const candidate = RoomCodeService.generateCode();
      if (!this.roomsByCode.has(candidate)) {
        return candidate;
      }
    }
    // Fallback in theoretical collision storm
    return `${RoomCodeService.generateCode()}${Math.floor(Math.random() * 9)}`;
  }

  /**
   * Hashes a room password with a random cryptographic salt.
   */
  public hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(password + salt)
      .digest('hex');
    return { hash, salt };
  }

  /**
   * Verifies a candidate password against stored hash & salt.
   */
  public verifyPassword(roomCode: string, candidatePassword: string): boolean {
    const normalized = RoomCodeService.normalizeCode(roomCode);
    const room = this.roomsByCode.get(normalized);
    if (!room || !room.hasPassword || !room.passwordHash || !room.passwordSalt) {
      return false;
    }

    const testHash = crypto
      .createHash('sha256')
      .update(candidatePassword + room.passwordSalt)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(testHash, 'hex'),
      Buffer.from(room.passwordHash, 'hex')
    );
  }

  /**
   * Registers a new room in the active registry.
   */
  public registerRoom(entry: Omit<ActiveRoomEntry, 'createdAt' | 'lastActivityAt'>): ActiveRoomEntry {
    const normalizedCode = RoomCodeService.normalizeCode(entry.roomCode);
    const now = Date.now();

    const fullEntry: ActiveRoomEntry = {
      ...entry,
      roomCode: normalizedCode,
      createdAt: now,
      lastActivityAt: now,
    };

    this.roomsByCode.set(normalizedCode, fullEntry);
    this.roomsById.set(entry.roomId, fullEntry);

    Logger.info(
      `[PrivateRoomRegistry] Registered room ${normalizedCode} -> ${entry.roomId} (Mode: ${entry.gameMode}, Host: ${entry.hostDisplayName})`
    );

    return fullEntry;
  }

  /**
   * Look up room by normalized code.
   */
  public getRoomByCode(roomCode: string): ActiveRoomEntry | undefined {
    const normalized = RoomCodeService.normalizeCode(roomCode);
    const entry = this.roomsByCode.get(normalized);
    if (entry) {
      entry.lastActivityAt = Date.now();
    }
    return entry;
  }

  /**
   * Look up room by Colyseus room ID.
   */
  public getRoomById(roomId: string): ActiveRoomEntry | undefined {
    const entry = this.roomsById.get(roomId);
    if (entry) {
      entry.lastActivityAt = Date.now();
    }
    return entry;
  }

  /**
   * Update active room state or configuration.
   */
  public updateRoom(roomId: string, updates: Partial<ActiveRoomEntry>): ActiveRoomEntry | undefined {
    const existing = this.roomsById.get(roomId);
    if (!existing) return undefined;

    // If room code changed, re-index
    if (updates.roomCode && updates.roomCode !== existing.roomCode) {
      this.roomsByCode.delete(existing.roomCode);
      existing.roomCode = RoomCodeService.normalizeCode(updates.roomCode);
      this.roomsByCode.set(existing.roomCode, existing);
    }

    Object.assign(existing, updates);
    existing.lastActivityAt = Date.now();
    return existing;
  }

  /**
   * Remove and invalidate room when finished, closed, or disposed.
   */
  public removeRoom(roomId: string): boolean {
    const room = this.roomsById.get(roomId);
    if (!room) return false;

    this.roomsByCode.delete(room.roomCode);
    this.roomsById.delete(roomId);

    Logger.info(`[PrivateRoomRegistry] Invalidated room ${room.roomCode} (${roomId})`);
    return true;
  }

  /**
   * Check and enforce rate limiting for room lookups by client identifier (IP / user ID).
   * Returns true if request is allowed, false if rate limited.
   */
  public checkAndRecordLookupRateLimit(identifier: string): boolean {
    const now = Date.now();
    const tracker = this.lookupRateLimits.get(identifier);

    if (!tracker || now > tracker.resetAt) {
      this.lookupRateLimits.set(identifier, {
        count: 1,
        resetAt: now + PrivateRoomRegistry.RATE_LIMIT_WINDOW_MS,
      });
      return true;
    }

    if (tracker.count >= PrivateRoomRegistry.MAX_LOOKUPS_PER_MINUTE) {
      Logger.warn(`[PrivateRoomRegistry] Rate limit exceeded for lookup identifier: ${identifier}`);
      return false;
    }

    tracker.count++;
    return true;
  }

  /**
   * Clean up expired rooms that have been inactive longer than maxIdleMs.
   */
  public cleanupExpired(maxIdleMs: number = PrivateRoomRegistry.DEFAULT_ROOM_EXPIRY_MS): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [roomId, room] of Array.from(this.roomsById.entries())) {
      if (now - room.lastActivityAt > maxIdleMs) {
        room.status = 'EXPIRED';
        this.removeRoom(roomId);
        cleaned++;
        Logger.info(`[PrivateRoomRegistry] Expired inactive room ${room.roomCode} (${roomId})`);
      }
    }

    // Also clean old rate limit keys
    for (const [key, tracker] of Array.from(this.lookupRateLimits.entries())) {
      if (now > tracker.resetAt) {
        this.lookupRateLimits.delete(key);
      }
    }

    return cleaned;
  }

  /**
   * Clears all rooms (useful in testing).
   */
  public clearAll(): void {
    this.roomsByCode.clear();
    this.roomsById.clear();
    this.lookupRateLimits.clear();
  }
}
