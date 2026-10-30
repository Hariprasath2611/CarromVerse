import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { LocalDatabaseService } from '../src/services/database/localDatabaseService';
import { SyncService } from '../src/services/sync/syncService';
import { THEME } from '../src/constants/theme';

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    // 1. Initialize Auth state persistence listener
    const unsubscribeAuth = initializeAuth();

    // 2. Load cached user settings
    loadSettings().catch((err) => console.warn('Failed to load settings:', err));

    // 3. Initialize SQLite local database tables
    LocalDatabaseService.getDb().catch((err) =>
      console.warn('Failed to initialize local SQLite database:', err)
    );

    // 4. Initialize network connectivity listener and offline sync service
    SyncService.initialize();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/index" />
      </Stack>
    </SafeAreaProvider>
  );
}
