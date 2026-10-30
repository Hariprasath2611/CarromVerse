import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
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
  subtitle?: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'emerald' | 'gold' | 'wood' | 'danger' | 'forest';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  subtitle,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'emerald',
  size = 'medium',
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
      case 'forest':
        return {
          bg: THEME.colors.secondary,
          border: THEME.colors.primary,
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

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 38, paddingHorizontal: 12, fontSize: 13 };
      case 'large':
        return { height: subtitle ? 58 : 52, paddingHorizontal: 20, fontSize: 16 };
      case 'medium':
      default:
        return { height: subtitle ? 52 : 46, paddingHorizontal: 16, fontSize: 14 };
    }
  };

  const v = getVariantStyles();
  const s = getSizeStyles();

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: v.bg,
            borderColor: v.border,
            minHeight: s.height,
            paddingHorizontal: s.paddingHorizontal,
          },
          v.glow,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.text} />
        ) : (
          <View style={styles.contentWrap}>
            {!!icon && <Text style={[styles.icon, { color: v.text }]}>{icon}</Text>}
            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.text,
                  { color: v.text, fontSize: s.fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {!!subtitle && (
                <Text style={[styles.subtitleText, { color: v.text }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
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
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 10,
    opacity: 0.85,
    marginTop: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: THEME.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
