import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const onboarded = useSettingsStore((state) => state.settings.onboarded);

  useEffect(() => {
    if (!isAuthInitialized || isSettingsLoading) return;

    const timer = setTimeout(() => {
      if (!onboarded) {
        router.replace('/onboarding');
      } else if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthInitialized, isSettingsLoading, onboarded, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        {/* Decorative Golden Carrom Emblem */}
        <View style={styles.emblemOuter}>
          <View style={styles.emblemInner}>
            <View style={styles.queenCenter} />
          </View>
        </View>

        <Text style={styles.title}>CARROMVERSE</Text>
        <Text style={styles.subtitle}>PREMIUM MULTIPLAYER CARROM</Text>
        <Text style={styles.phaseBadge}>PHASE 1.1 • OFFLINE FOUNDATION</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={THEME.colors.goldBright} />
        <Text style={styles.loadingText}>Initializing Engine & Services...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.xxl,
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  emblemOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: THEME.colors.goldPrimary,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.goldGlow,
  },
  emblemInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBright,
    backgroundColor: THEME.colors.woodDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queenCenter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.queenRed,
    borderWidth: 1.5,
    borderColor: THEME.colors.goldBright,
  },
  title: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.medium,
    letterSpacing: 2,
    marginTop: THEME.spacing.xs,
    textAlign: 'center',
  },
  phaseBadge: {
    color: THEME.colors.woodGlow,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 1.5,
    marginTop: THEME.spacing.md,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.woodLight,
  },
  footer: {
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: THEME.spacing.sm,
    letterSpacing: 0.5,
  },
});
