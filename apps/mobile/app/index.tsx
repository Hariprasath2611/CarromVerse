import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const onboarded = useSettingsStore((state) => state.settings.onboarded);

  // Reanimated values for entrance & ambient particle glow
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const textOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0.4);

  useEffect(() => {
    // 1. Entrance animation sequence
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    textTranslateY.value = withDelay(350, withSpring(0, { damping: 15 }));
    textOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));

    // 2. Ambient pulse
    glowPulse.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 1200 }), withTiming(0.4, { duration: 1200 })),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: textOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

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
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthInitialized, isSettingsLoading, onboarded, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Subtle Background Glow Aura */}
      <Animated.View style={[styles.glowAura, glowAnimatedStyle]} />

      <View style={styles.centerBox}>
        {/* Animated Carrom Emblem */}
        <Animated.View style={[styles.emblemOuter, logoAnimatedStyle]}>
          <View style={styles.emblemInner}>
            <View style={styles.woodRing}>
              <View style={styles.queenCenter} />
            </View>
          </View>
        </Animated.View>

        {/* Animated Typography */}
        <Animated.View style={[styles.titleBox, textAnimatedStyle]}>
          <Text style={styles.title}>CARROMVERSE</Text>
          <Text style={styles.subtitle}>FOREST EMERALD EDITION</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>PREMIUM TABLETOP CARROM</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={THEME.colors.accent} />
        <Text style={styles.loadingText}>Preparing Game Board & Services...</Text>
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
  glowAura: {
    position: 'absolute',
    top: '30%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: THEME.colors.primary,
    filter: 'blur(70px)',
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  emblemOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.emeraldGlow,
  },
  emblemInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  woodRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.woodDark,
    borderWidth: 1.5,
    borderColor: THEME.colors.woodLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queenCenter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.queenRed,
    borderWidth: 1.5,
    borderColor: '#FEF08A',
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 3,
    marginTop: 4,
    textAlign: 'center',
  },
  pillContainer: {
    marginTop: THEME.spacing.md,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderColor: THEME.colors.borderHighlight,
    borderWidth: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  pillText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 1.2,
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
