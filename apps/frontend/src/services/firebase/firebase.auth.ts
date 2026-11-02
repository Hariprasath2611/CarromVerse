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
    const newProfile: UserProfile = {
      userId: firebaseUser.uid,
      username: username.trim(),
      email: firebaseUser.email || email.trim(),
      profileImage: undefined,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      totalMatches: 0,
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

