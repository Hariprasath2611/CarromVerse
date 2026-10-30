import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GameCard, PrimaryButton, SecondaryButton, ScreenContainer } from '../src/components';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const SLIDES = [
  {
    step: '01',
    badge: 'WELCOME TO CARROMVERSE',
    title: 'The Royal Board\nReimagined',
    description:
      'Step into a world of master tabletop carrom. Crafted with realistic wood textures, fluid animations, and a signature Forest Emerald aesthetic.',
    icon: '🎯',
    accentColor: THEME.colors.primary,
  },
  {
    step: '02',
    badge: 'LOCAL MULTIPLAYER',
    title: 'Play with Friends\n& Family Anywhere',
    description:
      'Gather around a single device for 2-Player Duels, 3-Player Free-for-All, or 4-Player 2v2 Team Doubles with zero internet connection required.',
    icon: '👥',
    accentColor: THEME.colors.accent,
  },
  {
    step: '03',
    badge: 'PRESTIGE & STYLES',
    title: 'Customize Boards\n& Crown the Queen',
    description:
      'Unlock luxurious boards, tournament-grade strikers, and gem-inlaid coins. Track match history and rise through the ranks to become the Carrom Champion.',
    icon: '👑',
    accentColor: THEME.colors.goldBright,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboarded = useSettingsStore((state) => state.setOnboarded);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await setOnboarded();
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    await setOnboarded();
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <Text style={styles.brandTitle}>CARROMVERSE</Text>
          <View style={styles.brandDot} />
        </View>

        {!isLast && (
          <SecondaryButton
            title="Skip"
            variant="outline"
            onPress={handleSkip}
            style={styles.skipButton}
            textStyle={styles.skipText}
          />
        )}
      </View>

      {/* Main Slide Presentation Card */}
      <GameCard elevated style={styles.slideCard}>
        {/* Step Indicator Pill */}
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>{slide.step}</Text>
          </View>
          <Text style={styles.badgeText}>{slide.badge}</Text>
        </View>

        {/* Hero Visual Icon Container */}
        <View style={[styles.visualBox, { borderColor: slide.accentColor }]}>
          <Text style={styles.heroEmoji}>{slide.icon}</Text>
        </View>

        {/* Content */}
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>

        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </GameCard>

      {/* Bottom Navigation Buttons */}
      <View style={styles.bottomControls}>
        <PrimaryButton
          title={isLast ? 'Get Started' : 'Next'}
          icon={isLast ? '🚀' : '→'}
          onPress={handleNext}
          variant="emerald"
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 2,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.accent,
    marginLeft: 6,
  },
  skipButton: {
    height: 36,
    paddingHorizontal: THEME.spacing.md,
    borderWidth: 0,
  },
  skipText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.bodySm,
  },
  slideCard: {
    padding: THEME.spacing.xl,
    minHeight: 380,
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  stepPill: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.accent,
    marginRight: THEME.spacing.sm,
  },
  stepText: {
    color: THEME.colors.accent,
    fontSize: 11,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  badgeText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 1.2,
  },
  visualBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.emeraldGlow,
  },
  heroEmoji: {
    fontSize: 38,
  },
  slideTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.heavy,
    lineHeight: 34,
    marginBottom: THEME.spacing.md,
  },
  slideDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.body,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.borderHighlight,
  },
  activeDot: {
    width: 28,
    backgroundColor: THEME.colors.accent,
  },
  bottomControls: {
    marginTop: THEME.spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
});
