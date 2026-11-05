import { Room, Client, ServerError } from 'colyseus';
import { GameMode, RoomLifecycleState } from '@carromverse/shared-types';
import { CarromRoomState, RoomStatus } from './schema/CarromRoomState.js';
import { PlayerSchema } from './schema/PlayerSchema.js';
import { FirebaseAuthService, DecodedFirebaseToken } from '../auth/firebaseAuth.service.js';
import { PlayerSessionManager } from '../services/playerSession.service.js';
import { PrivateRoomRegistry } from '../modules/multiplayer/privateRoom.registry.js';
import { RoomCodeService } from '../modules/multiplayer/roomCode.service.js';
import { Logger } from '../utils/logger.js';

export interface RoomCreateOptions {
  gameMode?: GameMode;
  roomCode?: string;
  isPrivate?: boolean;
  password?: string;
  boardTheme?: string;
  targetScore?: number;
  turnTimeLimitSeconds?: number;
  teamAName?: string;
  teamBName?: string;
  hostUserId?: string;
  hostDisplayName?: string;
}

export interface ClientShotMessage {
  powerRatio: number;
  aimAngle: number;
}

export interface ClientPlaceStrikerMessage {
  offsetRatio: number;
}

export class CarromRoom extends Room<{ state: CarromRoomState }> {
  private authService = FirebaseAuthService.getInstance();
  private sessionManager = PlayerSessionManager.getInstance();
  private roomRegistry = PrivateRoomRegistry.getInstance();

  override onCreate(options: RoomCreateOptions): void {
    const gameMode: GameMode = options.gameMode || 'two_player_individual';
    const maxClients = this.calculateCapacityForMode(gameMode);
    this.maxClients = maxClients;

    // Generate or use provided room code
    const rawCode = options.roomCode || this.roomRegistry.generateUniqueRoomCode();
    const roomCode = RoomCodeService.normalizeCode(rawCode);

    const hasPassword = Boolean(options.password && options.password.trim().length > 0);
    let passwordHash: string | undefined;
    let passwordSalt: string | undefined;

    if (hasPassword && options.password) {
      const hashed = this.roomRegistry.hashPassword(options.password.trim());
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    }

    const state = new CarromRoomState({
      roomId: this.roomId,
      roomCode,
      status: 'WAITING',
      gameMode,
      maxPlayers: maxClients,
      hostUserId: options.hostUserId || '',
      boardTheme: options.boardTheme || 'classic',
      targetScore: options.targetScore || 25,
      turnTimeLimitSeconds: options.turnTimeLimitSeconds || 25,
      isPrivate: options.isPrivate !== undefined ? options.isPrivate : true,
      hasPassword,
      teamAName: options.teamAName || 'Team Emerald',
      teamBName: options.teamBName || 'Team Gold',
      activeSeat: 0,
      turnNumber: 1,
      queenStatus: 'on_board',
      strikerOffset: 0,
    });

    this.setState(state);
    if ((this as any)._listing) {
      this.setMetadata({
        roomCode,
        gameMode,
        maxPlayers: maxClients,
        status: 'WAITING',
        hasPassword,
        isPrivate: state.isPrivate,
      });
    }

    // Register room in global active registry
    this.roomRegistry.registerRoom({
      roomId: this.roomId,
      roomCode,
      hostUserId: options.hostUserId || '',
      hostDisplayName: options.hostDisplayName || 'Host',
      gameMode,
      maxPlayers: maxClients,
      currentPlayers: 0,
      hasPassword,
      passwordHash,
      passwordSalt,
      boardTheme: state.boardTheme,
      targetScore: state.targetScore,
      turnTimeLimitSeconds: state.turnTimeLimitSeconds,
      status: 'WAITING',
    });

    Logger.info(
      `[CarromRoom] Created private room ${roomCode} (${this.roomId}) | Mode: ${gameMode} | Password: ${hasPassword}`
    );

    this.registerMessageHandlers();
  }

  override async onAuth(client: Client, options: any, request?: any): Promise<DecodedFirebaseToken> {
    const token = options?.token || options?.authToken || (request?.headers?.authorization as string);

    if (!token) {
      Logger.warn(`[CarromRoom] Authentication rejected for connection ${client.sessionId}: Missing token`);
      throw new ServerError(401, 'Authentication token required');
    }

    let decoded: DecodedFirebaseToken;
    try {
      decoded = await this.authService.verifyIdToken(token);
    } catch (err: any) {
      Logger.warn(`[CarromRoom] Token verification failed for ${client.sessionId}: ${err.message}`);
      throw new ServerError(401, err.message || 'Invalid or expired authentication token');
    }

    // 1. Password Verification if room is password protected
    if (this.state.hasPassword) {
      const providedPassword = options?.password || options?.roomPassword || '';
      const isPasswordValid = this.roomRegistry.verifyPassword(this.state.roomCode, providedPassword);
      if (!isPasswordValid) {
        Logger.warn(`[CarromRoom] Incorrect password attempt for room ${this.state.roomCode} by ${decoded.uid}`);
        throw new ServerError(403, 'Incorrect room password');
      }
    }

    // 2. Prevent duplicate user joins in the same room
    const existingPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
    const isAlreadyConnected = existingPlayers.some((p) => p.userId === decoded.uid && p.isConnected);
    if (isAlreadyConnected) {
      Logger.warn(`[CarromRoom] Duplicate user rejected: ${decoded.uid} already active in ${this.roomId}`);
      throw new ServerError(409, 'User is already connected to this room');
    }

    // 3. Prevent joining closed or completed rooms
    if (this.state.status === 'COMPLETED' || this.state.status === 'CLOSED' || this.state.status === 'EXPIRED') {
      throw new ServerError(400, 'This room is no longer active');
    }

    if (this.state.status === 'IN_PROGRESS' || this.state.status === 'STARTING') {
      throw new ServerError(400, 'Match is already in progress');
    }

    return decoded;
  }

  override onJoin(client: Client, options: any, auth: DecodedFirebaseToken): void {
    if (this.state.players.size >= this.maxClients) {
      throw new ServerError(400, 'Room is already full');
    }

    const assignedSeat = this.getNextAvailableSeat();
    const teamId = this.determineTeamForSeat(assignedSeat);
    const assignedCoin = this.determineCoinForSeat(assignedSeat);

    // First player or pre-designated creator becomes Host
    const isFirstPlayer = this.state.players.size === 0;
    const isHost = isFirstPlayer || (this.state.hostUserId ? this.state.hostUserId === auth.uid : false);

    if (isHost && !this.state.hostUserId) {
      this.state.hostUserId = auth.uid;
    }

    const player = new PlayerSchema({
      id: client.sessionId,
      userId: auth.uid,
      displayName: auth.displayName || options?.displayName || `Player ${assignedSeat + 1}`,
      avatar: auth.picture || options?.avatar || (assignedSeat === 0 ? '👑' : '🐯'),
      seat: assignedSeat,
      assignedCoinType: assignedCoin,
      teamId,
      isReady: false,
      isConnected: true,
      isHost,
      score: 0,
      fouls: 0,
    });

    this.state.players.set(client.sessionId, player);
    this.state.scores.set(client.sessionId, 0);

    // Register in session manager
    this.sessionManager.createOrUpdateSession(auth.uid, client.sessionId, {
      displayName: player.displayName,
      avatar: player.avatar,
    });
    this.sessionManager.assignRoom(auth.uid, this.roomId);

    // Update global room registry
    this.roomRegistry.updateRoom(this.roomId, {
      currentPlayers: this.state.players.size,
      hostUserId: this.state.hostUserId,
      hostDisplayName: isHost ? player.displayName : undefined,
    });

    Logger.info(
      `[CarromRoom] Player ${player.displayName} (${auth.uid}) joined room ${this.state.roomCode} as Seat ${assignedSeat} [Host: ${isHost}] (${this.state.players.size}/${this.maxClients})`
    );

    this.updateRoomReadiness();
  }

  override async onLeave(client: Client, code?: number): Promise<void> {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.isConnected = false;
    this.sessionManager.markDisconnected(client.sessionId);

    Logger.info(`[CarromRoom] Player ${player.displayName} (${client.sessionId}) left room ${this.state.roomCode}`);

    // If game has not started, remove player completely
    if (this.state.status === 'WAITING' || this.state.status === 'READY' || this.state.status === 'CREATED') {
      this.state.players.delete(client.sessionId);
      this.state.scores.delete(client.sessionId);

      // Handle Host Transfer if the leaving player was the host
      if (this.state.hostUserId === player.userId) {
        this.handleHostTransfer();
      }

      this.updateRoomReadiness();

      // If room is empty, clean it up
      if (this.state.players.size === 0) {
        try {
          this.disconnect();
        } catch {
          this.onDispose();
        }
      } else {
        this.roomRegistry.updateRoom(this.roomId, {
          currentPlayers: this.state.players.size,
          hostUserId: this.state.hostUserId,
          status: this.state.status,
        });
      }
    } else {
      // In progress: notify players of disconnect (Phase 2.8 prep)
      this.broadcast('PLAYER_DISCONNECTED', {
        seat: player.seat,
        displayName: player.displayName,
      });
    }
  }

  override onDispose(): void {
    Logger.info(`[CarromRoom] Disposing room ${this.state.roomCode} (${this.roomId})`);
    this.state.status = 'CLOSED';
    if ((this as any)._listing) {
      this.setMetadata({ status: 'CLOSED' });
    }
    this.roomRegistry.removeRoom(this.roomId);
  }

  // ==========================================
  // MESSAGE HANDLERS & HOST AUTHORIZATIONS
  // ==========================================

  private registerMessageHandlers(): void {
    // 1. Ready Status Toggle
    this.onMessage('SET_READY', (client: Client, message: { isReady?: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.status === 'IN_PROGRESS' || this.state.status === 'STARTING') {
        client.send('ERROR', { code: 'MATCH_STARTED', message: 'Match is already in progress' });
        return;
      }

      player.isReady = message.isReady !== undefined ? message.isReady : !player.isReady;
      Logger.info(`[CarromRoom] Player ${player.displayName} ready: ${player.isReady}`);

      this.updateRoomReadiness();
    });

    // 2. Host Game Mode Change
    this.onMessage('CHANGE_GAME_MODE', (client: Client, message: { gameMode: GameMode }) => {
      if (!this.assertHostPermission(client, 'change game mode')) return;

      if (this.state.status === 'IN_PROGRESS' || this.state.status === 'STARTING') {
        client.send('ERROR', { code: 'MATCH_STARTED', message: 'Cannot change mode while match is starting' });
        return;
      }

      const validModes: GameMode[] = [
        'two_player_individual',
        'three_player_individual',
        'four_player_individual',
        'four_player_team',
      ];

      if (!validModes.includes(message.gameMode)) {
        client.send('ERROR', { code: 'INVALID_MODE', message: 'Unknown or unsupported game mode' });
        return;
      }

      const newCapacity = this.calculateCapacityForMode(message.gameMode);

      // Cannot switch to smaller mode if current player count exceeds new capacity
      if (this.state.players.size > newCapacity) {
        client.send('ERROR', {
          code: 'CAPACITY_EXCEEDED',
          message: `Cannot switch to ${message.gameMode}: ${this.state.players.size} players in room (capacity: ${newCapacity})`,
        });
        return;
      }

      this.state.gameMode = message.gameMode;
      this.state.maxPlayers = newCapacity;
      this.maxClients = newCapacity;

      // Re-allocate seats & teams based on new mode
      this.rebalanceSeatsAndTeams();

      this.updateRoomReadiness();
      this.roomRegistry.updateRoom(this.roomId, {
        gameMode: message.gameMode,
        maxPlayers: newCapacity,
      });

      this.broadcast('ROOM_MODE_CHANGED', {
        gameMode: this.state.gameMode,
        maxPlayers: this.state.maxPlayers,
      });

      Logger.info(`[CarromRoom] Host changed game mode to ${message.gameMode} (Capacity: ${newCapacity})`);
    });

    // 3. Host Game Settings Change
    this.onMessage('CHANGE_SETTINGS', (client: Client, message: {
      boardTheme?: string;
      targetScore?: number;
      turnTimeLimitSeconds?: number;
      teamAName?: string;
      teamBName?: string;
    }) => {
      if (!this.assertHostPermission(client, 'change room settings')) return;

      if (this.state.status === 'IN_PROGRESS') return;

      if (message.boardTheme) this.state.boardTheme = message.boardTheme;
      if (message.targetScore && message.targetScore >= 10 && message.targetScore <= 100) {
        this.state.targetScore = message.targetScore;
      }
      if (message.turnTimeLimitSeconds && message.turnTimeLimitSeconds >= 10 && message.turnTimeLimitSeconds <= 60) {
        this.state.turnTimeLimitSeconds = message.turnTimeLimitSeconds;
      }
      if (message.teamAName) this.state.teamAName = message.teamAName.substring(0, 20);
      if (message.teamBName) this.state.teamBName = message.teamBName.substring(0, 20);

      this.roomRegistry.updateRoom(this.roomId, {
        boardTheme: this.state.boardTheme,
        targetScore: this.state.targetScore,
        turnTimeLimitSeconds: this.state.turnTimeLimitSeconds,
      });

      this.broadcast('ROOM_SETTINGS_CHANGED', {
        boardTheme: this.state.boardTheme,
        targetScore: this.state.targetScore,
        turnTimeLimitSeconds: this.state.turnTimeLimitSeconds,
        teamAName: this.state.teamAName,
        teamBName: this.state.teamBName,
      });
    });

    // 4. Team Switch (4-Player Team Mode)
    this.onMessage('SWITCH_TEAM', (client: Client, message?: { targetTeam?: 'team_a' | 'team_b'; targetSessionId?: string }) => {
      if (this.state.gameMode !== 'four_player_team') {
        client.send('ERROR', { code: 'INVALID_ACTION', message: 'Team switching only allowed in 2v2 team mode' });
        return;
      }

      if (this.state.status === 'IN_PROGRESS') return;

      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // If targetSessionId provided, only host can switch other players
      const targetSessionId = message?.targetSessionId || client.sessionId;
      if (targetSessionId !== client.sessionId && !player.isHost) {
        client.send('ERROR', { code: 'NOT_AUTHORIZED', message: 'Only host can change other players’ teams' });
        return;
      }

      const targetPlayer = this.state.players.get(targetSessionId);
      if (!targetPlayer) return;

      const currentTeam = targetPlayer.teamId;
      const desiredTeam = message?.targetTeam || (currentTeam === 'team_a' ? 'team_b' : 'team_a');

      // Check capacity of desired team (max 2 players per team)
      const allPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
      const teamCount = allPlayers.filter((p) => p.teamId === desiredTeam).length;

      if (teamCount >= 2) {
        client.send('ERROR', { code: 'TEAM_FULL', message: `${desiredTeam === 'team_a' ? 'Team A' : 'Team B'} is already full (max 2)` });
        return;
      }

      targetPlayer.teamId = desiredTeam;
      // Re-assign legal seat for team (Team A: seats 0, 2; Team B: seats 1, 3)
      const allowedSeats = desiredTeam === 'team_a' ? [0, 2] : [1, 3];
      const takenSeats = new Set(allPlayers.filter((p) => p.id !== targetPlayer.id).map((p) => p.seat));
      const newSeat = allowedSeats.find((s) => !takenSeats.has(s)) ?? allowedSeats[0];
      targetPlayer.seat = newSeat;
      targetPlayer.assignedCoinType = desiredTeam === 'team_a' ? 'white' : 'black';

      Logger.info(`[CarromRoom] Player ${targetPlayer.displayName} switched to ${desiredTeam} (Seat ${newSeat})`);
      this.broadcast('TEAM_UPDATED', {
        sessionId: targetPlayer.id,
        teamId: targetPlayer.teamId,
        seat: targetPlayer.seat,
      });
    });

    // 5. Host Kick Player
    this.onMessage('KICK_PLAYER', (client: Client, message: { targetSessionId: string }) => {
      if (!this.assertHostPermission(client, 'kick players')) return;

      if (this.state.status === 'IN_PROGRESS') {
        client.send('ERROR', { code: 'MATCH_STARTED', message: 'Cannot kick players during a match' });
        return;
      }

      const targetPlayer = this.state.players.get(message.targetSessionId);
      if (!targetPlayer) {
        client.send('ERROR', { code: 'PLAYER_NOT_FOUND', message: 'Player not found in room' });
        return;
      }

      if (targetPlayer.isHost) {
        client.send('ERROR', { code: 'CANNOT_KICK_HOST', message: 'Cannot kick the room host' });
        return;
      }

      Logger.info(`[CarromRoom] Host kicked player ${targetPlayer.displayName} (${message.targetSessionId})`);

      // Find client connection and force disconnect
      const targetClient = this.clients.find((c) => c.sessionId === message.targetSessionId);
      if (targetClient) {
        targetClient.send('KICKED_FROM_ROOM', { reason: 'Removed by room host' });
        targetClient.leave(4001);
      }
    });

    // 6. Host Start Match
    this.onMessage('START_MATCH', (client: Client) => {
      if (!this.assertHostPermission(client, 'start match')) return;

      if (this.state.status === 'IN_PROGRESS') {
        client.send('ERROR', { code: 'ALREADY_STARTED', message: 'Match is already started' });
        return;
      }

      // Validation 1: Capacity check
      if (this.state.players.size < this.maxClients) {
        client.send('ERROR', {
          code: 'ROOM_NOT_FULL',
          message: `Need ${this.maxClients} players to start. Current: ${this.state.players.size}`,
        });
        return;
      }

      // Validation 2: Readiness check
      const allPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
      const unreadyPlayers = allPlayers.filter((p) => !p.isReady);
      if (unreadyPlayers.length > 0) {
        client.send('ERROR', {
          code: 'PLAYERS_NOT_READY',
          message: `Cannot start match: ${unreadyPlayers.map((p) => p.displayName).join(', ')} not ready`,
        });
        return;
      }

      // Transition Lifecycle: READY -> STARTING -> IN_PROGRESS
      this.state.status = 'STARTING';
      this.broadcast('MATCH_STARTING', { countdownSeconds: 3 });

      setTimeout(() => {
        if (this.state.status === 'STARTING') {
          this.state.status = 'IN_PROGRESS';
          this.roomRegistry.updateRoom(this.roomId, { status: 'IN_PROGRESS' });
          this.broadcast('MATCH_STARTED', {
            gameMode: this.state.gameMode,
            activeSeat: this.state.activeSeat,
            boardTheme: this.state.boardTheme,
            targetScore: this.state.targetScore,
          });
          Logger.info(`[CarromRoom] Match officially started in room ${this.state.roomCode}!`);
        }
      }, 1000);
    });

    // 7. Striker Placement & Shots (Existing Authoritative Handlers)
    this.onMessage('PLACE_STRIKER', (client: Client, message: ClientPlaceStrikerMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.status === 'IN_PROGRESS' && player.seat !== this.state.activeSeat) {
        client.send('ERROR', { code: 'NOT_YOUR_TURN', message: 'Cannot place striker out of turn' });
        return;
      }

      if (typeof message.offsetRatio !== 'number' || isNaN(message.offsetRatio)) {
        client.send('ERROR', { code: 'INVALID_OFFSET', message: 'Offset must be a valid number' });
        return;
      }

      const clampedOffset = Math.max(-0.92, Math.min(0.92, message.offsetRatio));
      this.state.strikerOffset = clampedOffset;

      this.broadcast('STRIKER_POSITION_UPDATED', {
        seat: player.seat,
        offset: clampedOffset,
      }, { except: client });
    });

    this.onMessage('EXECUTE_SHOT', (client: Client, message: ClientShotMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.status === 'IN_PROGRESS' && player.seat !== this.state.activeSeat) {
        client.send('ERROR', { code: 'NOT_YOUR_TURN', message: 'Cannot execute shot out of turn' });
        return;
      }

      if (
        typeof message.powerRatio !== 'number' ||
        typeof message.aimAngle !== 'number' ||
        isNaN(message.powerRatio) ||
        isNaN(message.aimAngle)
      ) {
        client.send('ERROR', { code: 'INVALID_PARAMETERS', message: 'Power and aim angle required' });
        return;
      }

      const clampedPower = Math.max(0.05, Math.min(1.0, message.powerRatio));

      this.broadcast('SHOT_EXECUTED', {
        seat: player.seat,
        powerRatio: clampedPower,
        aimAngle: message.aimAngle,
        strikerOffset: this.state.strikerOffset,
      });
    });
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private assertHostPermission(client: Client, actionDescription: string): boolean {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isHost || player.userId !== this.state.hostUserId) {
      Logger.warn(`[CarromRoom] Unauthorized host action attempted (${actionDescription}) by ${client.sessionId}`);
      client.send('ERROR', {
        code: 'NOT_AUTHORIZED',
        message: `Only the room host can ${actionDescription}`,
      });
      return false;
    }
    return true;
  }

  private handleHostTransfer(): void {
    const remainingPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
    if (remainingPlayers.length > 0) {
      // Sort by seat to maintain predictable host transfer order
      remainingPlayers.sort((a, b) => a.seat - b.seat);
      const newHost = remainingPlayers[0];
      newHost.isHost = true;
      this.state.hostUserId = newHost.userId;

      Logger.info(`[CarromRoom] Host transferred to ${newHost.displayName} (${newHost.userId}) in room ${this.state.roomCode}`);

      this.broadcast('HOST_TRANSFERRED', {
        newHostUserId: newHost.userId,
        newHostDisplayName: newHost.displayName,
      });
    } else {
      this.state.hostUserId = '';
    }
  }

  private calculateCapacityForMode(mode: GameMode): number {
    switch (mode) {
      case 'three_player_individual':
        return 3;
      case 'four_player_individual':
      case 'four_player_team':
        return 4;
      case 'two_player_individual':
      default:
        return 2;
    }
  }

  private getNextAvailableSeat(): number {
    const allPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
    const takenSeats = new Set(allPlayers.map((p) => p.seat));

    if (this.state.gameMode === 'two_player_individual') {
      return takenSeats.has(0) ? 2 : 0;
    }

    for (let seat = 0; seat < this.maxClients; seat++) {
      if (!takenSeats.has(seat)) return seat;
    }
    return 0;
  }

  private determineTeamForSeat(seat: number): 'team_a' | 'team_b' | 'none' {
    if (this.state.gameMode === 'four_player_team') {
      return seat % 2 === 0 ? 'team_a' : 'team_b';
    }
    return 'none';
  }

  private determineCoinForSeat(seat: number): 'white' | 'black' {
    if (this.state.gameMode === 'two_player_individual') {
      return seat === 0 ? 'white' : 'black';
    }
    if (this.state.gameMode === 'four_player_team') {
      return seat % 2 === 0 ? 'white' : 'black';
    }
    return 'white';
  }

  private rebalanceSeatsAndTeams(): void {
    const players = Array.from(this.state.players.values()) as PlayerSchema[];
    players.sort((a, b) => a.seat - b.seat);

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      let assignedSeat = i;
      if (this.state.gameMode === 'two_player_individual') {
        assignedSeat = i === 0 ? 0 : 2;
      }
      p.seat = assignedSeat;
      p.teamId = this.determineTeamForSeat(assignedSeat);
      p.assignedCoinType = this.determineCoinForSeat(assignedSeat);
    }
  }

  private updateRoomReadiness(): void {
    const isFull = this.state.players.size >= this.maxClients;
    const allPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
    const allReady = isFull && allPlayers.every((p) => p.isReady);

    if (allReady) {
      this.state.status = 'READY';
    } else {
      this.state.status = 'WAITING';
    }

    if ((this as any)._listing) {
      this.setMetadata({
        status: this.state.status,
        playerCount: this.state.players.size,
        allReady,
      });
    }
  }
}
