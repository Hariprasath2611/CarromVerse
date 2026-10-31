import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BoardPreview, Button, ScreenContainer } from '../src/components';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const SLIDES = [
  {
    title: 'FLICK LIKE A PRO',
    description: 'Drag the striker along the baseline, pull back for power, and release to strike.',
    boardTheme: 'classic',
  },
  {
    title: 'PLAY WITH FRIENDS',
    description: 'Challenge players locally or online in 2-player duels and 4-player team matches.',
    boardTheme: 'emerald',
  },
  {
    title: 'CUSTOMIZE YOUR GEAR',
    description: 'Unlock exclusive handcrafted boards, weighted strikers, and legendary puck designs.',
    boardTheme: 'mahogany',
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
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Top Text Header */}
      <View style={styles.textHeader}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Tilted 3D Hero Board */}
      <View style={styles.heroBoardContainer}>
        <View style={styles.tiltedWrapper}>
          <BoardPreview size={260} theme={slide.boardTheme} />
          {/* Visual aim indicator line for realistic flick look */}
          <View style={styles.aimLine} />
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Button
          title={isLast ? 'GET STARTED' : 'NEXT'}
          variant="primary"
          onPress={handleNext}
          style={styles.nextButton}
        />

        <TouchableOpacity onPress={handleSkip} hitSlop={12} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bokehTop: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 100,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  textHeader: {
    alignItems: 'center',
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F5ECD2', // Cream
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#9FD8B8', // Muted Mint
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  heroBoardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  tiltedWrapper: {
    transform: [{ perspective: 800 }, { rotateX: '26deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aimLine: {
    position: 'absolute',
    bottom: 50,
    width: 2,
    height: 48,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#2BD67B',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2BD67B',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#0E4A33',
  },
  nextButton: {
    width: '100%',
    marginBottom: 14,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
