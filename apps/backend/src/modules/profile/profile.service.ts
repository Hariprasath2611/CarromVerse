import { BaseService } from '../../services/base.service.js';
import {
  AvatarUploadDto,
  PublicPlayerProfile,
  UpdateProfileDto,
  UserProfile,
  UsernameAvailabilityResponse,
} from '@carromverse/shared-types';
import { UsernameValidator } from './username.validator.js';

export class ProfileService extends BaseService {
  private static instance: ProfileService;

  // Primary profile storage: userId -> UserProfile
  private profiles = new Map<string, UserProfile>();

  // Normalized username index for O(1) uniqueness: normalizedUsername -> userId
  private usernameIndex = new Map<string, string>();

  public constructor() {
    super('ProfileService');
    this.seedDefaultProfiles();
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private seedDefaultProfiles(): void {
    const defaultUsers: UserProfile[] = [
      {
        userId: 'usr_default',
        displayName: 'Carrom Champion',
        username: 'CarromChampion',
        email: 'player@carromverse.io',
        avatarUrl: '👑',
        accountCreatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        accountStatus: 'active',
        playerLevel: 5,
        totalMatches: 25,
        totalWins: 18,
        totalLosses: 5,
        totalDraws: 2,
        totalCoinsPocketed: 142,
        totalFouls: 4,
      },
      {
        userId: 'user_test_123',
        displayName: 'Hariprasath',
        username: 'Hariprasath',
        email: 'hari@carromverse.io',
        avatarUrl: '🐯',
        accountCreatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        accountStatus: 'active',
        playerLevel: 7,
        totalMatches: 48,
        totalWins: 34,
        totalLosses: 11,
        totalDraws: 3,
        totalCoinsPocketed: 286,
        totalFouls: 6,
      },
      {
        userId: 'user_ramesh',
        displayName: 'Ramesh Mendis',
        username: 'RameshMendis',
        email: 'ramesh@carromverse.io',
        avatarUrl: '🦅',
        accountCreatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        accountStatus: 'active',
        playerLevel: 6,
        totalMatches: 30,
        totalWins: 20,
        totalLosses: 8,
        totalDraws: 2,
        totalCoinsPocketed: 195,
        totalFouls: 5,
      },
    ];

    for (const u of defaultUsers) {
      this.profiles.set(u.userId, u);
      this.usernameIndex.set(u.username.toLowerCase(), u.userId);
    }
  }

  /**
   * Retrieves or initializes a player's full profile.
   */
  public async getProfile(userId: string, authUser?: { email?: string; displayName?: string }): Promise<UserProfile> {
    let profile = this.profiles.get(userId);

    if (!profile) {
      const now = new Date().toISOString();
      const initialUsername = this.generateInitialUsername(userId, authUser?.displayName);

      profile = {
        userId,
        displayName: (authUser?.displayName || initialUsername).trim(),
        username: initialUsername,
        email: authUser?.email || `${userId}@carromverse.io`,
        avatarUrl: '👑',
        accountCreatedAt: now,
        lastUpdatedAt: now,
        accountStatus: 'active',
        playerLevel: 1,
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        totalCoinsPocketed: 0,
        totalFouls: 0,
      };

      this.profiles.set(userId, profile);
      this.usernameIndex.set(initialUsername.toLowerCase(), userId);
      this.log(`Created new profile for user ${userId} (@${initialUsername})`);
    }

    return profile;
  }

  /**
   * Retrieves safe public gaming information for any player.
   */
  public async getPublicProfile(userId: string): Promise<PublicPlayerProfile | null> {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    return {
      userId: profile.userId,
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      playerLevel: profile.playerLevel,
      accountCreatedAt: profile.accountCreatedAt,
      totalMatches: profile.totalMatches,
      totalWins: profile.totalWins,
      totalLosses: profile.totalLosses,
      totalDraws: profile.totalDraws,
      totalCoinsPocketed: profile.totalCoinsPocketed,
      totalFouls: profile.totalFouls,
    };
  }

  /**
   * Checks whether a username is available.
   */
  public async checkUsernameAvailability(
    rawUsername: string,
    currentUserId?: string
  ): Promise<UsernameAvailabilityResponse> {
    const val = UsernameValidator.validate(rawUsername);
    if (!val.isValid) {
      return { username: String(rawUsername || ''), available: false, reason: val.error };
    }

    const existingUserId = this.usernameIndex.get(val.normalized);
    if (existingUserId && existingUserId !== currentUserId) {
      return {
        username: rawUsername.trim(),
        available: false,
        reason: 'This username is already taken by another player.',
      };
    }

    return { username: rawUsername.trim(), available: true };
  }

  /**
   * Updates an authenticated user's profile.
   */
  public async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    const now = new Date().toISOString();

    // 1. Update Display Name if provided
    if (dto.displayName !== undefined) {
      const cleanName = dto.displayName.trim();
      if (cleanName.length < 1 || cleanName.length > 30) {
        throw new Error('VALIDATION_ERROR: Display name must be between 1 and 30 characters.');
      }
      profile.displayName = cleanName;
    }

    // 2. Update Username if provided and changed
    if (dto.username !== undefined) {
      const trimmedUsername = dto.username.trim();
      if (trimmedUsername.toLowerCase() !== profile.username.toLowerCase()) {
        const check = await this.checkUsernameAvailability(trimmedUsername, userId);
        if (!check.available) {
          throw new Error(`USERNAME_CONFLICT: ${check.reason || 'Username is not available.'}`);
        }

        // Release old username from index and claim new
        this.usernameIndex.delete(profile.username.toLowerCase());
        this.usernameIndex.set(trimmedUsername.toLowerCase(), userId);
        profile.username = trimmedUsername;
      }
    }

    // 3. Update Avatar URL if provided
    if (dto.avatarUrl !== undefined) {
      profile.avatarUrl = dto.avatarUrl;
    }

    profile.lastUpdatedAt = now;
    this.profiles.set(userId, profile);
    this.log(`Updated profile for ${userId} (@${profile.username})`);
    return profile;
  }

  /**
   * Validates and updates user avatar.
   */
  public async updateAvatar(userId: string, avatarData: AvatarUploadDto): Promise<{ avatarUrl: string }> {
    const profile = await this.getProfile(userId);

    // Option A: Custom Base64 Image Upload
    if (avatarData.imageBase64) {
      const mime = (avatarData.mimeType || 'image/jpeg').toLowerCase();
      const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validMimes.includes(mime)) {
        throw new Error('INVALID_IMAGE_FORMAT: Avatar must be a JPEG, PNG, or WEBP image.');
      }

      // Max size: 2 MB
      const base64Content = avatarData.imageBase64.includes('base64,')
        ? avatarData.imageBase64.split('base64,')[1]
        : avatarData.imageBase64;

      const byteLength = Buffer.byteLength(base64Content, 'base64');
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (byteLength > maxBytes) {
        throw new Error('IMAGE_TOO_LARGE: Avatar image size exceeds the 2MB limit.');
      }

      // Generate avatar URL (or data URI)
      const dataUri = `data:${mime};base64,${base64Content}`;
      profile.avatarUrl = dataUri;
    } else if (avatarData.avatarUrl) {
      // Option B: Preset avatar emoji or external storage URL
      profile.avatarUrl = avatarData.avatarUrl.trim();
    } else {
      throw new Error('VALIDATION_ERROR: Either avatarUrl or imageBase64 must be provided.');
    }

    profile.lastUpdatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);
    return { avatarUrl: profile.avatarUrl };
  }

  /**
   * Resets avatar to default.
   */
  public async deleteAvatar(userId: string): Promise<{ avatarUrl: null }> {
    const profile = await this.getProfile(userId);
    profile.avatarUrl = null;
    profile.lastUpdatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);
    return { avatarUrl: null };
  }

  /**
   * Records match outcome and updates stats & level.
   */
  public async recordMatch(
    userId: string,
    options: { won: boolean; coinsPocketed?: number; fouls?: number; isDraw?: boolean }
  ): Promise<UserProfile> {
    const profile = await this.getProfile(userId);

    profile.totalMatches++;
    if (options.isDraw) {
      profile.totalDraws++;
    } else if (options.won) {
      profile.totalWins++;
    } else {
      profile.totalLosses++;
    }

    if (options.coinsPocketed) {
      profile.totalCoinsPocketed += options.coinsPocketed;
    }
    if (options.fouls) {
      profile.totalFouls += options.fouls;
    }

    // Dynamic level: 1 + Math.floor(totalWins / 3) + Math.floor(totalMatches / 10)
    profile.playerLevel = Math.max(1, 1 + Math.floor(profile.totalWins / 3) + Math.floor(profile.totalMatches / 10));
    profile.lastUpdatedAt = new Date().toISOString();
    this.profiles.set(userId, profile);
    return profile;
  }

  private generateInitialUsername(userId: string, displayName?: string): string {
    const base = displayName ? displayName.replace(/[^a-zA-Z0-9_]/g, '') : 'Player';
    const cleanBase = base.length >= 3 ? base.substring(0, 14) : 'Player';
    let candidate = cleanBase;
    let counter = 1;

    while (this.usernameIndex.has(candidate.toLowerCase())) {
      candidate = `${cleanBase}_${counter}`;
      counter++;
    }
    return candidate;
  }
}
