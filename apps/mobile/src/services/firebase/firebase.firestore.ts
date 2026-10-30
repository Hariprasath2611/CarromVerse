import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { GameResult, UserGameStatistics, UserProfile } from '@carromverse/shared-types';
import { firestore } from './firebase.config';

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  const userRef = doc(firestore, 'users', profile.userId);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!firestore) return null;

  try {
    const userRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error(`[Firestore] Failed to fetch user profile (${userId}):`, error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  partial: Partial<UserProfile>
): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  const userRef = doc(firestore, 'users', userId);
  await updateDoc(userRef, {
    ...partial,
    lastLogin: serverTimestamp(),
  });
}

export async function createInitialGameStatistics(userId: string): Promise<void> {
  if (!firestore) return;

  const statsRef = doc(firestore, 'gameStatistics', userId);
  const initial: UserGameStatistics = {
    userId,
    totalMatches: 0,
    individualWins: 0,
    teamWins: 0,
    totalPlayTime: 0,
    whiteCoinsPocketed: 0,
    blackCoinsPocketed: 0,
    queenPockets: 0,
    foulsCommitted: 0,
    lastUpdated: new Date().toISOString(),
  };

  await setDoc(statsRef, initial);
}

export async function getGameStatistics(userId: string): Promise<UserGameStatistics | null> {
  if (!firestore) return null;

  try {
    const statsRef = doc(firestore, 'gameStatistics', userId);
    const snap = await getDoc(statsRef);

    if (snap.exists()) {
      return snap.data() as UserGameStatistics;
    }
    return null;
  } catch (error) {
    console.error(`[Firestore] Failed to fetch stats (${userId}):`, error);
    throw error;
  }
}

export async function updateGameStatistics(
  userId: string,
  partial: Partial<UserGameStatistics>
): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  const statsRef = doc(firestore, 'gameStatistics', userId);
  await updateDoc(statsRef, {
    ...partial,
    lastUpdated: new Date().toISOString(),
  });
}

export async function syncMatchToFirestore(userId: string, match: GameResult): Promise<void> {
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  // Prevent duplicate insertion by using match.id as document id
  const matchRef = doc(firestore, 'matches', match.id);
  await setDoc(matchRef, {
    ...match,
    userId,
    syncedAt: serverTimestamp(),
  });
}
