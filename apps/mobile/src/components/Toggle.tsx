import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

export interface ToggleProps {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const thumbOffset = value ? 22 : 2;

  const animatedThumb = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(thumbOffset, { duration: 180 }) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[styles.container, disabled && styles.disabled, style]}
    >
      {(!!label || !!description) && (
        <View style={styles.textContainer}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {!!description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}

      <View style={[styles.track, value ? styles.trackActive : styles.trackInactive]}>
        <Animated.View style={[styles.thumb, value ? styles.thumbActive : styles.thumbInactive, animatedThumb]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  description: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  track: {
    width: 48,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.accent,
  },
  trackInactive: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  thumbActive: {
    backgroundColor: THEME.colors.accent,
    ...THEME.shadows.emeraldGlow,
  },
  thumbInactive: {
    backgroundColor: THEME.colors.textMuted,
  },
  disabled: {
    opacity: 0.5,
  },
});
