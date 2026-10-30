/**
 * Firebase Firestore User and Statistics data contracts for CarromVerse.
 */

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  profileImage?: string;
  createdAt: string;       // ISO timestamp
  lastLogin: string;       // ISO timestamp
  totalMatches: number;
  wins: number;
  losses: number;
  experience: number;
  level: number;
}

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

