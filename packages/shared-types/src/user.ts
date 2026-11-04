/**
 * User and Profile Data Contracts for CarromVerse (Phase 2.2).
 */

export type AccountStatus = 'active' | 'suspended' | 'deleted';

/**
 * Full online player profile (private view accessible by the owner).
 */
export interface UserProfile {
  userId: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  profileImage?: string;            // Backward compatibility alias for avatarUrl
  accountCreatedAt: string;         // ISO timestamp
  lastUpdatedAt: string;            // ISO timestamp
  accountStatus: AccountStatus;
  playerLevel: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalCoinsPocketed: number;
  totalFouls: number;
  // Legacy / convenience fields
  createdAt?: string;
  lastLogin?: string;
  wins?: number;
  losses?: number;
  level?: number;
  experience?: number;
}

/**
 * Public player profile (safe view exposed to other players).
 * Strips private authentication credentials (email, account status, etc.).
 */
export interface PublicPlayerProfile {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  playerLevel: number;
  accountCreatedAt: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalCoinsPocketed: number;
  totalFouls: number;
}

/**
 * DTO for updating player profile.
 */
export interface UpdateProfileDto {
  displayName?: string;
  username?: string;
  avatarUrl?: string | null;
}

/**
 * Response contract for username availability checks.
 */
export interface UsernameAvailabilityResponse {
  username: string;
  available: boolean;
  reason?: string;
}

/**
 * DTO for avatar update or upload.
 */
export interface AvatarUploadDto {
  avatarUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

/**
 * Default preset avatars available in CarromVerse.
 */
export const DEFAULT_PRESET_AVATARS = [
  '👑', // Crown / Royal
  '🐯', // Tiger
  '🦅', // Eagle
  '🦁', // Lion
  '🐉', // Dragon
  '⚡', // Lightning
  '🎯', // Target
  '🔥', // Flame
  '💎', // Diamond
  '🏆', // Trophy
  '🛡️', // Shield
  '⭐', // Star
] as const;

export interface UserGameStatistics {
  userId: string;
  totalMatches: number;
  individualWins: number;
  teamWins: number;
  totalPlayTime: number;    // In seconds
  whiteCoinsPocketed: number;
  blackCoinsPocketed: number;
  queenPockets: number;
  foulsCommitted: number;
  lastUpdated: string;      // ISO timestamp
}

export interface AuthSessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
}
