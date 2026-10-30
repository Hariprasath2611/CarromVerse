import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const SLIDES = [
  {
    title: 'The Royal Board',
    description: 'Experience genuine carrom dynamics calibrated with Matter.js physics: realistic bounciness, smooth powder sliding, and precision aiming.',
    tag: 'PHYSICS ENGINE',
  },
  {
    title: 'Play Anywhere Offline',
    description: 'Compete in 2-Player Duels, 3-Player Free-for-All, 4-Player Individual, or 2v2 Team Doubles without needing an active internet connection.',
    tag: 'OFFLINE-FIRST',
  },
  {
    title: 'Cloud Progression',
    description: 'Track match history securely in local SQLite storage. Connect to Firebase whenever you are online to preserve lifetime statistics.',
    tag: 'CLOUD SYNC',
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

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.brandTitle}>CARROMVERSE</Text>
        <Button
          title="Skip"
          variant="outline"
          onPress={handleSkip}
          style={styles.skipButton}
          textStyle={styles.skipText}
        />
      </View>

      <Card elevated style={styles.slideCard}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{slide.tag}</Text>
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentSlide && styles.activeDot]}
            />
          ))}
        </View>
      </Card>

      <View style={styles.bottomControls}>
        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Enter CarromVerse' : 'Next'}
          onPress={handleNext}
          variant="primary"
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
    marginBottom: THEME.spacing.xl,
  },
  brandTitle: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 2,
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
    minHeight: 280,
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: THEME.colors.goldPrimary,
    borderWidth: 1,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
  },
  tagText: {
    color: THEME.colors.goldBright,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  slideTitle: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.md,
  },
  slideDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.body,
    lineHeight: THEME.typography.lineHeight.body,
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
    backgroundColor: THEME.colors.surfaceBorder,
  },
  activeDot: {
    width: 24,
    backgroundColor: THEME.colors.goldPrimary,
  },
  bottomControls: {
    marginTop: THEME.spacing.xl,
  },
  actionButton: {
    width: '100%',
  },
});

