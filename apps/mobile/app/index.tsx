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
      {/* Background Glow Aura */}
      <Animated.View style={[styles.glowAura, glowAnimatedStyle]} />

      <View style={styles.centerBox}>
        {/* Animated Carrom Emblem */}
        <Animated.View style={[styles.emblemOuter, logoAnimatedStyle]}>
          <View style={styles.emblemInner}>
            <View style={styles.woodRing}>
              <View style={styles.brassRing}>
                <View style={styles.queenCenter} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Animated Typography */}
        <Animated.View style={[styles.titleBox, textAnimatedStyle]}>
          <Text style={styles.title}>CARROMVERSE</Text>
          <Text style={styles.subtitle}>EMERALD CLUB NIGHT</Text>
          <View style={styles.pillContainer}>
            <Text style={styles.pillText}>PREMIUM TABLETOP CARROM</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={THEME.colors.neonEmerald} />
        <Text style={styles.loadingText}>PREPARING CLUB TABLE & ENGINES...</Text>
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
    paddingVertical: 56,
  },
  glowAura: {
    position: 'absolute',
    top: '28%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#0F5A3E',
    opacity: 0.5,
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  emblemOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#0E4A33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...THEME.shadows.glowEmerald,
  },
  emblemInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: '#1B7050',
    backgroundColor: '#07261C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  woodRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#7A431C',
    borderWidth: 2,
    borderColor: '#4D270E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brassRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#E9B949',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5ECD2',
  },
  queenCenter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E23B5A',
    borderWidth: 2,
    borderColor: '#981C33',
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    color: THEME.colors.cream,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.colors.neonEmerald,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginTop: 6,
    textAlign: 'center',
  },
  pillContainer: {
    marginTop: 16,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    color: THEME.colors.brass,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  footer: {
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.colors.mutedMint,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 1,
  },
});
