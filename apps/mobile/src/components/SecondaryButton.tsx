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

export interface SecondaryButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'surface' | 'outline' | 'forest';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'surface',
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
    height: 48,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.md,
  },
  text: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 0.4,
  },
  icon: {
    fontSize: 16,
    marginRight: THEME.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
