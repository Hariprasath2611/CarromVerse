import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

export interface LevelProgressProps {
  level: number;
  currentExp: number;
  maxExp?: number;
  style?: ViewStyle;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  currentExp,
  maxExp = 1000,
  style,
}) => {
  const progressPercent = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progressPercent, { duration: 800 });
  }, [progressPercent]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
        <Text style={styles.expText}>
          {currentExp} / {maxExp} EXP
        </Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.accent,
  },
  levelText: {
    color: THEME.colors.accent,
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 0.5,
  },
  expText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
  },
  barTrack: {
    height: 8,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.full,
  },
});

