/**
 * Application environment configuration and Firebase credential validation.
 * Reads strictly from EXPO_PUBLIC_* variables.
 */

export interface FirebaseEnvironmentConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  version: string;
  firebase: FirebaseEnvironmentConfig;
  isFirebaseConfigured: boolean;
  missingFirebaseKeys: string[];
}

function resolveConfig(): AppConfig {
  const firebase: FirebaseEnvironmentConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const requiredKeys: (keyof FirebaseEnvironmentConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFirebaseKeys = requiredKeys.filter((key) => {
    const val = firebase[key];
    return !val || val.includes('Placeholder') || val.includes('YourFirebase');
  });

  const isFirebaseConfigured = missingFirebaseKeys.length === 0;

  return {
    env: (process.env.EXPO_PUBLIC_APP_ENV as any) || 'development',
    version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    firebase,
    isFirebaseConfigured,
    missingFirebaseKeys: missingFirebaseKeys.map(
      (k) => `EXPO_PUBLIC_FIREBASE_${k.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`
    ),
  };
}

export const APP_CONFIG = resolveConfig();

