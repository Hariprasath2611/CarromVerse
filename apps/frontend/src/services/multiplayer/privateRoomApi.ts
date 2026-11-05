import {
  CreatePrivateRoomDto,
  RoomLookupResponse,
} from '@carromverse/shared-types';
import { getCurrentUserIdToken } from '../firebase/firebase.auth';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export class PrivateRoomApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getCurrentUserIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      const errMessage = body?.error?.message || `Request failed with status ${response.status}`;
      const errCode = body?.error?.code || 'API_ERROR';
      const error = new Error(errMessage);
      (error as any).code = errCode;
      throw error;
    }

    return body.data as T;
  }

  /**
   * POST /api/v1/multiplayer/private/create
   * Reserves a private room and generates a room code.
   */
  public static async createPrivateRoom(dto: CreatePrivateRoomDto): Promise<{
    roomId: string;
    roomCode: string;
    gameMode: string;
    maxPlayers: number;
    hasPassword: boolean;
    boardTheme: string;
  }> {
    return this.request('/multiplayer/private/create', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  /**
   * GET /api/v1/multiplayer/private/:roomCode/lookup
   * Validates room code and fetches safe public details before connecting.
   */
  public static async lookupRoomCode(roomCode: string): Promise<RoomLookupResponse> {
    const cleanCode = roomCode.trim().toUpperCase();
    return this.request(`/multiplayer/private/${cleanCode}/lookup`, {
      method: 'GET',
    });
  }

  /**
   * POST /api/v1/multiplayer/private/:roomCode/verify-password
   */
  public static async verifyPassword(
    roomCode: string,
    password: string
  ): Promise<{ valid: boolean; requiresPassword: boolean }> {
    const cleanCode = roomCode.trim().toUpperCase();
    return this.request(`/multiplayer/private/${cleanCode}/verify-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}
