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
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  description: {
    color: '#9FD8B8',
    fontSize: 12,
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
    backgroundColor: '#2BD67B',
    borderColor: '#2BD67B',
  },
  trackInactive: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  thumbActive: {
    backgroundColor: '#07261C',
  },
  thumbInactive: {
    backgroundColor: '#9FD8B8',
  },
  disabled: {
    opacity: 0.5,
  },
});
