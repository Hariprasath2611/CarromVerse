import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

export interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'emerald' | 'gold' | 'wood' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'emerald',
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    if (!isDisabled) scale.value = withSpring(1, { damping: 15 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
        return {
          bg: THEME.colors.goldPrimary,
          border: THEME.colors.goldBright,
          text: THEME.colors.textInverse,
          glow: THEME.shadows.goldGlow,
        };
      case 'wood':
        return {
          bg: THEME.colors.woodPrimary,
          border: THEME.colors.woodLight,
          text: THEME.colors.textPrimary,
          glow: {},
        };
      case 'danger':
        return {
          bg: THEME.colors.error,
          border: '#DC2626',
          text: THEME.colors.textPrimary,
          glow: {},
        };
      case 'emerald':
      default:
        return {
          bg: THEME.colors.primary,
          border: THEME.colors.accent,
          text: THEME.colors.textPrimary,
          glow: THEME.shadows.emeraldGlow,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          { backgroundColor: v.bg, borderColor: v.border },
          v.glow,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.text} />
        ) : (
          <>
            {!!icon && <Text style={[styles.icon, { color: v.text }]}>{icon}</Text>}
            <Text style={[styles.text, { color: v.text }, textStyle]}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.borderRadius.md,
  },
  button: {
    height: 52,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  text: {
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 0.6,
  },
  icon: {
    fontSize: 18,
    marginRight: THEME.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
