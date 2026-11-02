import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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

  // Reanimated values
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const progressBar = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 500 });
    textOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    progressBar.value = withDelay(100, withTiming(1, { duration: 1300 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressBar.value * 100}%`,
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
    }, 1600);

    return () => clearTimeout(timer);
  }, [isAuthInitialized, isSettingsLoading, onboarded, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Subtle Background Decorative Circles */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      <View style={styles.centerBox}>
        {/* Gold Coin Medal with C */}
        <Animated.View style={[styles.medalOuter, logoAnimatedStyle]}>
          <View style={styles.medalInner}>
            <Text style={styles.medalLetter}>C</Text>
          </View>
        </Animated.View>

        {/* Brand Typography */}
        <Animated.View style={[styles.titleBox, textAnimatedStyle]}>
          <Text style={styles.titleCarrom}>
            CARROM<Text style={styles.titleVerse}>VERSE</Text>
          </Text>
          <Text style={styles.subtitle}>THE ULTIMATE BOARD EXPERIENCE</Text>
        </Animated.View>
      </View>

      {/* Horizontal Loading Bar */}
      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07261C',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 64,
  },
  bokehTop: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  medalOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E9B949',
    borderWidth: 4,
    borderColor: '#F7D070',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#E9B949',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  medalInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: '#C4962C',
    backgroundColor: '#E9B949',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalLetter: {
    fontSize: 44,
    fontWeight: '900',
    color: '#261B04',
    textAlign: 'center',
    lineHeight: 50,
  },
  titleBox: {
    alignItems: 'center',
  },
  titleCarrom: {
    color: '#F5ECD2', // Cream
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  titleVerse: {
    color: '#2BD67B', // Neon Emerald
  },
  subtitle: {
    color: '#9FD8B8', // Muted Mint
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginTop: 8,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2BD67B',
    borderRadius: 4,
  },
});
