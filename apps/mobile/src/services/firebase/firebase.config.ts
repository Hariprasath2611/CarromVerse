import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  initializeAuth,
  // @ts-ignore - React Native persistence module resolution in modern modular Firebase
  getReactNativePersistence,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../../constants/config';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  isReady: boolean;
} {
  if (firebaseApp) {
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore: firebaseFirestore,
      storage: firebaseStorage,
      isReady: true,
    };
  }

  if (!APP_CONFIG.isFirebaseConfigured) {
    console.warn(
      '[Firebase] Missing or placeholder configuration keys:',
      APP_CONFIG.missingFirebaseKeys.join(', ')
    );
    console.warn('[Firebase] Running in offline-first mode until real credentials are supplied in .env.');
    return {
      app: null,
      auth: null,
      firestore: null,
      storage: null,
      isReady: false,
    };
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(APP_CONFIG.firebase);
    } else {
      firebaseApp = getApp();
    }

    // Initialize Auth with AsyncStorage persistence for React Native
    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // If auth already initialized in this process
      firebaseAuth = getAuth(firebaseApp);
    }

    firebaseFirestore = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore: firebaseFirestore,
      storage: firebaseStorage,
      isReady: true,
    };
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase SDK:', error);
    return {
      app: null,
      auth: null,
      firestore: null,
      storage: null,
      isReady: false,
    };
  }
}

// Initial eager attempt
const { app, auth, firestore, storage } = initializeFirebase();

export { app, auth, firestore, storage };

