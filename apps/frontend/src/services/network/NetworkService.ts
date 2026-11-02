import { Client, Room } from 'colyseus.js';
import { ConnectionStatus, JoinRoomOptions, NetworkConfig, NetworkErrorEvent } from './network.types';
import { getCurrentUserIdToken } from '../firebase/firebase.auth';

export class MultiplayerNetworkService {
  private static instance: MultiplayerNetworkService;
  private client: Client | null = null;
  private currentRoom: Room<any> | null = null;
  private status: ConnectionStatus = 'DISCONNECTED';
  private config: NetworkConfig;
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private errorListeners = new Set<(err: NetworkErrorEvent) => void>();
  private lastPingTimestamp = 0;
  private latencyMs = 0;

  private constructor() {
    this.config = {
      serverUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000',
      connectionTimeoutMs: 10000,
      reconnectAttempts: 3,
      pingIntervalMs: 5000,
    };
  }

  public static getInstance(): MultiplayerNetworkService {
    if (!MultiplayerNetworkService.instance) {
      MultiplayerNetworkService.instance = new MultiplayerNetworkService();
    }
    return MultiplayerNetworkService.instance;
  }

  public setConfig(customConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...customConfig };
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getCurrentRoom(): Room<any> | null {
    return this.currentRoom;
  }

  public getLatency(): number {
    return this.latencyMs;
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public onError(listener: (err: NetworkErrorEvent) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Initializes Colyseus Client with given server URL.
   */
  public connect(serverUrl?: string): Client {
    if (serverUrl) {
      this.config.serverUrl = serverUrl;
    }

    if (!this.client) {
      this.setStatus('CONNECTING');
      try {
        this.client = new Client(this.config.serverUrl);
        this.setStatus('CONNECTED');
      } catch (err: any) {
        this.setStatus('ERROR');
        this.notifyError('INIT_FAILED', err?.message || 'Failed to initialize Colyseus client');
        throw err;
      }
    }

    return this.client;
  }

  /**
   * Joins or creates an authoritative multiplayer Carrom room.
   */
  public async joinOrCreateRoom(
    roomName = 'carrom_room',
    options: JoinRoomOptions = {}
  ): Promise<Room<any>> {
    const client = this.connect();

    // Automatically resolve authentication token from Firebase if not passed
    let authToken = options.token;
    if (!authToken) {
      authToken = (await getCurrentUserIdToken()) || undefined;
    }

    const joinOptions = {
      ...options,
      token: authToken,
    };

    this.setStatus('CONNECTING');

    try {
      const room = await client.joinOrCreate(roomName, joinOptions);
      this.currentRoom = room;
      this.setStatus('CONNECTED');

      // Wire Room Listeners
      room.onLeave((code) => {
        this.currentRoom = null;
        this.setStatus('DISCONNECTED');
      });

      room.onError((code, message) => {
        this.notifyError(`ROOM_ERROR_${code}`, message || 'Room encountered an error');
      });

      return room;
    } catch (err: any) {
      this.setStatus('ERROR');
      this.notifyError('JOIN_FAILED', err?.message || 'Failed to join multiplayer room');
      throw err;
    }
  }

  /**
   * Leaves the active room cleanly.
   */
  public async leaveRoom(consented = true): Promise<void> {
    if (this.currentRoom) {
      try {
        await this.currentRoom.leave(consented);
      } finally {
        this.currentRoom = null;
        this.setStatus('DISCONNECTED');
      }
    }
  }

  /**
   * Disconnects completely from the multiplayer server.
   */
  public disconnect(): void {
    if (this.currentRoom) {
      this.currentRoom.leave(true);
      this.currentRoom = null;
    }
    this.client = null;
    this.setStatus('DISCONNECTED');
  }

  /**
   * Preparation for Phase 2.8 Reconnection.
   */
  public async prepareReconnect(reconnectionToken: string): Promise<Room<any>> {
    const client = this.connect();
    this.setStatus('RECONNECTING');
    try {
      const room = await client.reconnect(reconnectionToken);
      this.currentRoom = room;
      this.setStatus('CONNECTED');
      return room;
    } catch (err: any) {
      this.setStatus('ERROR');
      this.notifyError('RECONNECT_FAILED', err?.message || 'Reconnection failed');
      throw err;
    }
  }

  private setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((l) => l(newStatus));
    }
  }

  private notifyError(code: string, message: string): void {
    const errorEvent: NetworkErrorEvent = {
      code,
      message,
      timestamp: Date.now(),
    };
    this.errorListeners.forEach((l) => l(errorEvent));
  }
}
