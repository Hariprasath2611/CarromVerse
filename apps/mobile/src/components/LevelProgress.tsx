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
    backgroundColor: '#07261C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.neonEmerald,
  },
  levelText: {
    color: THEME.colors.neonEmerald,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  expText: {
    color: THEME.colors.mutedMint,
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    height: 10,
    backgroundColor: '#07261C',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#1B7050',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: THEME.colors.neonEmerald,
    borderRadius: 5,
  },
});
