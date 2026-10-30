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

export interface SecondaryButtonProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'surface' | 'outline' | 'forest';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  subtitle,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'surface',
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
      case 'forest':
        return {
          bg: THEME.colors.secondary,
          border: THEME.colors.borderHighlight,
          text: THEME.colors.accent,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: THEME.colors.borderHighlight,
          text: THEME.colors.textSecondary,
        };
      case 'surface':
      default:
        return {
          bg: THEME.colors.surfaceElevated,
          border: THEME.colors.border,
          text: THEME.colors.accent,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 10, fontSize: 12 };
      case 'large':
        return { height: subtitle ? 56 : 50, paddingHorizontal: 18, fontSize: 15 };
      case 'medium':
      default:
        return { height: subtitle ? 48 : 44, paddingHorizontal: 14, fontSize: 13 };
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
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
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
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 0.4,
  },
  subtitleText: {
    fontSize: 9,
    opacity: 0.8,
    marginTop: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: THEME.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
