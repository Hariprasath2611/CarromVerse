import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GameCard, PrimaryButton, SecondaryButton, ScreenContainer } from '../src/components';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const SLIDES = [
  {
    step: '01',
    badge: 'WELCOME TO CARROMVERSE',
    title: 'The Royal Board\nReimagined',
    description:
      'Step into a world of master tabletop carrom. Crafted with realistic wood textures, fluid physical strikes, and our signature Emerald Club Night aesthetic.',
    icon: '🎯',
    accentColor: THEME.colors.neonEmerald,
  },
  {
    step: '02',
    badge: 'LOCAL MULTIPLAYER',
    title: 'Play with Friends\n& Family Anywhere',
    description:
      'Gather around a single device for 2-Player Duels, 3-Player Free-for-All, or 4-Player 2v2 Team Doubles with zero internet connection required.',
    icon: '👥',
    accentColor: THEME.colors.brass,
  },
  {
    step: '03',
    badge: 'PRESTIGE & STYLES',
    title: 'Customize Boards\n& Crown the Queen',
    description:
      'Unlock luxurious boards, tournament-grade strikers, and gem-inlaid coins. Track match history and rise through the club ranks to become a Legend.',
    icon: '👑',
    accentColor: THEME.colors.brass,
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
            title="SKIP"
            variant="outline"
            size="small"
            onPress={handleSkip}
            style={styles.skipButton}
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
          title={isLast ? 'GET STARTED' : 'NEXT STEP'}
          icon={isLast ? '🚀' : '→'}
          onPress={handleNext}
          variant="emerald"
          size="large"
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
    color: THEME.colors.cream,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.neonEmerald,
    marginLeft: 6,
  },
  skipButton: {
    borderWidth: 0,
  },
  slideCard: {
    padding: 24,
    minHeight: 400,
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepPill: {
    backgroundColor: '#07261C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: THEME.colors.brass,
    marginRight: 8,
  },
  stepText: {
    color: THEME.colors.brass,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeText: {
    color: THEME.colors.mutedMint,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  visualBox: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#07261C',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...THEME.shadows.glowEmerald,
  },
  heroEmoji: {
    fontSize: 40,
  },
  slideTitle: {
    color: THEME.colors.cream,
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 12,
  },
  slideDesc: {
    color: THEME.colors.mutedMint,
    fontSize: 14,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1B7050',
  },
  activeDot: {
    width: 32,
    backgroundColor: THEME.colors.neonEmerald,
  },
  bottomControls: {
    marginTop: 20,
  },
  actionButton: {
    width: '100%',
  },
});
