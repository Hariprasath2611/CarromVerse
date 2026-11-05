import { Client, Room } from 'colyseus.js';
import { GameMode, MultiplayerPlayer, RoomLifecycleState, RoomTeamId } from '@carromverse/shared-types';
import { getCurrentUserIdToken } from '../firebase/firebase.auth';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const WS_URL = BACKEND_URL.replace(/^http/, 'ws');

export class ColyseusClientService {
  private static instance: ColyseusClientService;
  private client: Client;
  private currentRoom: Room<any> | null = null;

  private constructor() {
    this.client = new Client(WS_URL);
  }

  public static getInstance(): ColyseusClientService {
    if (!this.instance) {
      this.instance = new ColyseusClientService();
    }
    return this.instance;
  }

  /**
   * Connect and join a Colyseus room by its Colyseus roomId.
   */
  public async joinRoom(
    roomId: string,
    options: {
      password?: string;
      displayName?: string;
      avatar?: string;
    } = {}
  ): Promise<Room<any>> {
    // If already in a room, leave it cleanly first
    await this.leaveRoom();

    const token = await getCurrentUserIdToken();

    const joinOptions = {
      token,
      ...options,
    };

    try {
      this.currentRoom = await this.client.joinById(roomId, joinOptions);
      return this.currentRoom;
    } catch (err: any) {
      this.currentRoom = null;
      throw new Error(err?.message || 'Failed to connect to multiplayer room');
    }
  }

  /**
   * Leave current active room.
   */
  public async leaveRoom(): Promise<void> {
    if (this.currentRoom) {
      try {
        await this.currentRoom.leave();
      } catch {
        // Ignore error on teardown
      }
      this.currentRoom = null;
    }
  }

  public getCurrentRoom(): Room<any> | null {
    return this.currentRoom;
  }

  /**
   * Send typed action to room server.
   */
  public send(type: string, payload?: any): void {
    if (this.currentRoom) {
      this.currentRoom.send(type, payload);
    }
  }

  /**
   * Set player readiness.
   */
  public setReady(isReady?: boolean): void {
    this.send('SET_READY', { isReady });
  }

  /**
   * Change game mode (Host only).
   */
  public changeGameMode(gameMode: GameMode): void {
    this.send('CHANGE_GAME_MODE', { gameMode });
  }

  /**
   * Change room settings (Host only).
   */
  public changeSettings(settings: {
    boardTheme?: string;
    targetScore?: number;
    turnTimeLimitSeconds?: number;
    teamAName?: string;
    teamBName?: string;
  }): void {
    this.send('CHANGE_SETTINGS', settings);
  }

  /**
   * Switch team in 2v2 mode.
   */
  public switchTeam(targetTeam?: RoomTeamId, targetSessionId?: string): void {
    this.send('SWITCH_TEAM', { targetTeam, targetSessionId });
  }

  /**
   * Kick player from room (Host only).
   */
  public kickPlayer(targetSessionId: string): void {
    this.send('KICK_PLAYER', { targetSessionId });
  }

  /**
   * Start match (Host only).
   */
  public startMatch(): void {
    this.send('START_MATCH');
  }
}

