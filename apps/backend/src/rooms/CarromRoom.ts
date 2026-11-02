import { Room, Client, ServerError } from 'colyseus';
import { CarromRoomState, RoomStatus } from './schema/CarromRoomState.js';
import { PlayerSchema } from './schema/PlayerSchema.js';
import { FirebaseAuthService, DecodedFirebaseToken } from '../auth/firebaseAuth.service.js';
import { PlayerSessionManager } from '../services/playerSession.service.js';
import { Logger } from '../utils/logger.js';

export interface RoomCreateOptions {
  gameMode?: 'two_player_individual' | 'three_player_individual' | 'four_player_individual' | 'four_player_team';
  maxPlayers?: number;
  targetScore?: number;
  turnTimeLimitSeconds?: number;
  isPrivate?: boolean;
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

  override onCreate(options: RoomCreateOptions): void {
    const gameMode = options.gameMode || 'two_player_individual';
    let maxClients = 2;
    if (gameMode === 'three_player_individual') maxClients = 3;
    if (gameMode === 'four_player_individual' || gameMode === 'four_player_team') maxClients = 4;

    this.maxClients = maxClients;

    const state = new CarromRoomState({
      roomId: this.roomId,
      status: 'WAITING',
      gameMode,
      maxPlayers: maxClients,
      activeSeat: 0,
      turnNumber: 1,
      targetScore: options.targetScore || 25,
      turnTimeLimitSeconds: options.turnTimeLimitSeconds || 25,
      strikerOffset: 0,
    });

    this.setState(state);
    this.setMetadata({
      gameMode,
      maxPlayers: maxClients,
      status: 'WAITING',
    });

    Logger.info(`[CarromRoom] Created room ${this.roomId} (Mode: ${gameMode}, Capacity: ${maxClients})`);

    // Register Server-Authoritative Action Handlers
    this.onMessage('SET_READY', (client: Client, message: { isReady?: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.isReady = message.isReady !== undefined ? message.isReady : !player.isReady;
      Logger.info(`[CarromRoom] Player ${player.displayName} (${client.sessionId}) ready: ${player.isReady}`);

      this.checkAllPlayersReady();
    });

    this.onMessage('PLACE_STRIKER', (client: Client, message: ClientPlaceStrikerMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        client.send('ERROR', { code: 'PLAYER_NOT_FOUND', message: 'Player not recognized' });
        return;
      }

      // Authoritative validation: Turn check
      if (this.state.status === 'IN_PROGRESS' && player.seat !== this.state.activeSeat) {
        client.send('ERROR', { code: 'NOT_YOUR_TURN', message: 'Cannot place striker out of turn' });
        return;
      }

      // Authoritative validation: Bounds check [-0.92, 0.92]
      if (typeof message.offsetRatio !== 'number' || isNaN(message.offsetRatio)) {
        client.send('ERROR', { code: 'INVALID_OFFSET', message: 'Offset must be a valid number' });
        return;
      }

      const clampedOffset = Math.max(-0.92, Math.min(0.92, message.offsetRatio));
      this.state.strikerOffset = clampedOffset;

      // Broadcast position update to all room clients
      this.broadcast('STRIKER_POSITION_UPDATED', {
        seat: player.seat,
        offset: clampedOffset,
      }, { except: client });
    });

    this.onMessage('EXECUTE_SHOT', (client: Client, message: ClientShotMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        client.send('ERROR', { code: 'PLAYER_NOT_FOUND', message: 'Player not recognized' });
        return;
      }

      // Authoritative validation: Turn check
      if (this.state.status === 'IN_PROGRESS' && player.seat !== this.state.activeSeat) {
        client.send('ERROR', { code: 'NOT_YOUR_TURN', message: 'Cannot execute shot out of turn' });
        return;
      }

      // Authoritative validation: Parameters check
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

      Logger.info(
        `[CarromRoom] Validated shot by Seat ${player.seat} (${player.displayName}): Power ${Math.round(clampedPower * 100)}%, Angle ${message.aimAngle.toFixed(2)}`
      );

      // Broadcast authoritative shot event to all clients in room
      this.broadcast('SHOT_EXECUTED', {
        seat: player.seat,
        powerRatio: clampedPower,
        aimAngle: message.aimAngle,
        strikerOffset: this.state.strikerOffset,
      });
    });

    this.onMessage('PAUSE_MATCH', (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.hostUserId && player.userId !== this.state.hostUserId) {
        client.send('ERROR', { code: 'NOT_AUTHORIZED', message: 'Only room host can pause the match' });
        return;
      }

      this.state.status = this.state.status === 'PAUSED' ? 'IN_PROGRESS' : 'PAUSED';
      this.broadcast('MATCH_PAUSE_TOGGLED', { status: this.state.status });
    });
  }

  override async onAuth(client: Client, options: any, request?: any): Promise<DecodedFirebaseToken> {
    const token = options?.token || options?.authToken || (request?.headers?.authorization as string);

    if (!token) {
      Logger.warn(`[CarromRoom] Authentication rejected for connection ${client.sessionId}: Missing token`);
      throw new ServerError(401, 'Authentication token required');
    }

    try {
      const decoded = await this.authService.verifyIdToken(token);
      Logger.info(`[CarromRoom] Verified player: ${decoded.displayName || decoded.uid} (${decoded.uid})`);
      return decoded;
    } catch (err: any) {
      Logger.warn(`[CarromRoom] Token verification failed for ${client.sessionId}: ${err.message}`);
      throw new ServerError(403, err.message || 'Invalid or expired authentication token');
    }
  }

  override onJoin(client: Client, options: any, auth: DecodedFirebaseToken): void {
    const existingPlayerCount = this.state.players.size;
    if (existingPlayerCount >= this.maxClients) {
      throw new ServerError(400, 'Room capacity reached');
    }

    // Determine seat assignment based on game mode
    const assignedSeat = this.getNextAvailableSeat();

    // In 2-player mode: Seat 0 is White, Seat 2 is Black
    let assignedCoin = 'white';
    if (this.state.gameMode === 'two_player_individual') {
      assignedCoin = assignedSeat === 0 ? 'white' : 'black';
    } else if (this.state.gameMode === 'four_player_team') {
      assignedCoin = assignedSeat % 2 === 0 ? 'white' : 'black';
    }

    const teamId =
      this.state.gameMode === 'four_player_team'
        ? assignedSeat % 2 === 0
          ? 'team_a'
          : 'team_b'
        : 'none';

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
      score: 0,
      fouls: 0,
    });

    this.state.players.set(client.sessionId, player);
    this.state.scores.set(client.sessionId, 0);

    // Set first player as host
    if (!this.state.hostUserId) {
      this.state.hostUserId = auth.uid;
    }

    // Register in session manager
    this.sessionManager.createOrUpdateSession(auth.uid, client.sessionId, {
      displayName: player.displayName,
      avatar: player.avatar,
    });
    this.sessionManager.assignRoom(auth.uid, this.roomId);

    Logger.info(
      `[CarromRoom] Player ${player.displayName} joined Seat ${player.seat} (${this.state.players.size}/${this.maxClients})`
    );

    this.checkRoomFullStatus();
  }

  override async onLeave(client: Client, code?: number): Promise<void> {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.isConnected = false;
    this.sessionManager.markDisconnected(client.sessionId);

    Logger.info(`[CarromRoom] Client ${client.sessionId} left (code: ${code})`);

    // If game has not started, remove player completely
    if (this.state.status === 'WAITING' || this.state.status === 'READY') {
      this.state.players.delete(client.sessionId);
      this.state.scores.delete(client.sessionId);

      // Reassign host if host left
      if (this.state.hostUserId === player.userId) {
        const remainingPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
        const nextPlayer = remainingPlayers[0];
        this.state.hostUserId = nextPlayer ? nextPlayer.userId : '';
      }

      this.checkRoomFullStatus();
    } else {
      // Game in progress: allow grace period for reconnection (Phase 2.8 prep)
      this.broadcast('PLAYER_DISCONNECTED', {
        seat: player.seat,
        displayName: player.displayName,
      });
    }
  }

  override onDispose(): void {
    Logger.info(`[CarromRoom] Disposing room ${this.roomId}`);
    this.state.status = 'CLOSED';
    this.setMetadata({ status: 'CLOSED' });
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

  private checkRoomFullStatus(): void {
    if (this.state.players.size >= this.maxClients) {
      if (this.state.status === 'WAITING') {
        this.state.status = 'READY';
      }
    } else {
      if (this.state.status === 'READY') {
        this.state.status = 'WAITING';
      }
    }
    this.setMetadata({
      status: this.state.status,
      playerCount: this.state.players.size,
    });
  }

  private checkAllPlayersReady(): void {
    if (this.state.players.size < this.maxClients) return;

    const allPlayers = Array.from(this.state.players.values()) as PlayerSchema[];
    const allReady = allPlayers.every((p) => p.isReady);
    if (allReady && this.state.status === 'READY') {
      this.state.status = 'IN_PROGRESS';
      this.broadcast('MATCH_STARTED', {
        gameMode: this.state.gameMode,
        activeSeat: this.state.activeSeat,
      });
      Logger.info(`[CarromRoom] All players ready! Match started in room ${this.roomId}`);
    }
  }
}
