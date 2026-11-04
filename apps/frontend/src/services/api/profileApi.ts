import {
  AvatarUploadDto,
  PublicPlayerProfile,
  UpdateProfileDto,
  UserProfile,
  UsernameAvailabilityResponse,
} from '@carromverse/shared-types';
import { getCurrentUserIdToken } from '../firebase/firebase.auth';
import { getUserProfile, updateUserProfile as updateFirestoreProfile } from '../firebase/firebase.firestore';
import { LocalStorageService } from '../storage/localStorageService';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export class ProfileApiService {
  /**
   * Helper to perform authenticated API calls with token and JSON handling.
   */
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
      throw new Error(errMessage);
    }

    return body.data as T;
  }

  /**
   * GET /api/v1/profile/me
   * Retrieves authenticated player's full profile.
   */
  public static async getMyProfile(): Promise<UserProfile> {
    try {
      const profile = await this.request<UserProfile>('/profile/me');
      await LocalStorageService.setCachedProfile(profile);
      return profile;
    } catch (err) {
      // Offline fallback: try local cache or Firestore
      const cached = await LocalStorageService.getCachedProfile();
      if (cached) return cached;
      throw err;
    }
  }

  /**
   * PATCH /api/v1/profile/me
   * Updates player's profile (displayName, username, avatarUrl).
   */
  public static async updateMyProfile(dto: UpdateProfileDto): Promise<UserProfile> {
    try {
      const updated = await this.request<UserProfile>('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      await LocalStorageService.setCachedProfile(updated);
      return updated;
    } catch (err) {
      // If backend call fails, attempt to mirror update to Firestore if online
      const cached = await LocalStorageService.getCachedProfile();
      if (cached) {
        const merged: UserProfile = { ...cached, ...dto, lastUpdatedAt: new Date().toISOString() };
        await LocalStorageService.setCachedProfile(merged);
        if (cached.userId) {
          updateFirestoreProfile(cached.userId, dto).catch(() => {});
        }
        return merged;
      }
      throw err;
    }
  }

  /**
   * GET /api/v1/players/:userId
   * Public gaming profile retrieval for any player.
   */
  public static async getPublicPlayer(userId: string): Promise<PublicPlayerProfile> {
    try {
      return await this.request<PublicPlayerProfile>(`/players/${encodeURIComponent(userId)}`);
    } catch (err) {
      // Fallback to Firestore if public endpoint unreachable
      const firestoreDoc = await getUserProfile(userId);
      if (firestoreDoc) {
        return {
          userId: firestoreDoc.userId,
          displayName: firestoreDoc.username || 'Player',
          username: firestoreDoc.username,
          avatarUrl: firestoreDoc.profileImage || null,
          playerLevel: firestoreDoc.level || 1,
          accountCreatedAt: firestoreDoc.createdAt || new Date().toISOString(),
          totalMatches: firestoreDoc.totalMatches || 0,
          totalWins: firestoreDoc.wins || 0,
          totalLosses: firestoreDoc.losses || 0,
          totalDraws: 0,
          totalCoinsPocketed: 0,
          totalFouls: 0,
        };
      }
      throw err;
    }
  }

  /**
   * GET /api/v1/usernames/:username/availability
   * Checks username uniqueness and validation rules.
   */
  public static async checkUsernameAvailability(username: string): Promise<UsernameAvailabilityResponse> {
    try {
      return await this.request<UsernameAvailabilityResponse>(
        `/usernames/${encodeURIComponent(username)}/availability`
      );
    } catch (err: any) {
      // Fallback basic client-side check
      const trimmed = username.trim();
      const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(trimmed);
      return {
        username: trimmed,
        available: isValid,
        reason: isValid ? undefined : 'Must be 3-20 characters alphanumeric and underscores.',
      };
    }
  }

  /**
   * POST /api/v1/profile/avatar
   * Updates or uploads player avatar.
   */
  public static async uploadAvatar(data: AvatarUploadDto): Promise<{ avatarUrl: string }> {
    return await this.request<{ avatarUrl: string }>('/profile/avatar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE /api/v1/profile/avatar
   * Removes custom avatar.
   */
  public static async deleteAvatar(): Promise<{ avatarUrl: null }> {
    return await this.request<{ avatarUrl: null }>('/profile/avatar', {
      method: 'DELETE',
    });
  }
}
