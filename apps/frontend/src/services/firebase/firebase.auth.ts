import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSessionUser, UserProfile } from '@carromverse/shared-types';
import { auth } from './firebase.config';
import { createUserProfile, createInitialGameStatistics } from './firebase.firestore';

export function mapFirebaseAuthError(error: any): string {
  const code = error?.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase Console.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connectivity.';
    default:
      return error?.message || 'An unexpected authentication error occurred.';
  }
}

export function transformFirebaseUser(user: User | null): AuthSessionUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    emailVerified: user.emailVerified,
  };
}

export async function registerWithEmailPassword(
  email: string,
  pass: string,
  username: string
): Promise<{ user: AuthSessionUser; profile: UserProfile }> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure credentials in .env.');
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const firebaseUser = cred.user;

    // Set display name
    await updateProfile(firebaseUser, { displayName: username.trim() });

    // Create user profile in Firestore
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      userId: firebaseUser.uid,
      displayName: username.trim(),
      username: username.trim(),
      email: firebaseUser.email || email.trim(),
      avatarUrl: '👑',
      profileImage: undefined,
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
      createdAt: now,
      lastLogin: now,
      wins: 0,
      losses: 0,
      experience: 0,
      level: 1,
    };

    await createUserProfile(newProfile);
    await createInitialGameStatistics(firebaseUser.uid);

    return {
      user: transformFirebaseUser(firebaseUser)!,
      profile: newProfile,
    };
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<AuthSessionUser> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure credentials in .env.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return transformFirebaseUser(cred.user)!;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure credentials in .env.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export function onAuthStateChangedListener(
  callback: (user: AuthSessionUser | null) => void
): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(transformFirebaseUser(firebaseUser));
  });
}

export function getCurrentUser(): AuthSessionUser | null {
  if (!auth) return null;
  return transformFirebaseUser(auth.currentUser);
}

function toBase64Url(str: string): string {
  const g = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  if (typeof g.Buffer !== 'undefined') {
    return g.Buffer.from(str, 'utf8').toString('base64url');
  }
  const encoded = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  const base64 = typeof btoa !== 'undefined' ? btoa(encoded) : '';
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getStoredItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return null;
  }
}

async function setStoredItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  }
}

let cachedGuestToken: { token: string; exp: number } | null = null;

export async function getOrCreateGuestToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGuestToken && cachedGuestToken.exp > now + 300) {
    return cachedGuestToken.token;
  }

  let guestId: string | null = await getStoredItem('carromverse_guest_user_id');

  if (!guestId) {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    guestId = `guest_${randomSuffix}`;
    await setStoredItem('carromverse_guest_user_id', guestId);
  }

  let displayName = 'Guest Player';
  try {
    const cachedProfile = await getStoredItem('user_profile_data');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      if (parsed.displayName) displayName = parsed.displayName;
    }
  } catch {}

  const exp = now + 7 * 24 * 3600; // 7 days

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: 'https://auth.carromverse.io',
      aud: 'carromverse-dev',
      sub: guestId,
      user_id: guestId,
      name: displayName,
      email: `${guestId}@guest.carromverse.io`,
      iat: now,
      exp,
    })
  );
  const sig = toBase64Url(JSON.stringify({ sig: 'carromverse_guest_sig' }));

  const token = `${header}.${payload}.${sig}`;
  cachedGuestToken = { token, exp };
  return token;
}

export async function getCurrentUserIdToken(forceRefresh = false): Promise<string> {
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken(forceRefresh);
      if (token) return token;
    } catch (err) {
      // Fall through to guest token
    }
  }

  // Fallback to guest session token so unauthenticated and offline users can play multiplayer seamlessly
  return await getOrCreateGuestToken();
}

