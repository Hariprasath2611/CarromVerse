import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'brass' | 'wood' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  const translateY = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      setIsPressed(true);
      translateY.value = withTiming(4, { duration: 80 });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      setIsPressed(false);
      translateY.value = withSpring(0, { damping: 15, stiffness: 250 });
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'gold':
      case 'brass':
        return {
          bg: '#E9B949',
          borderBottom: '#A57E24',
          borderColor: '#F7D070',
          textColor: '#261B04',
          shadow: THEME.shadows.glowBrass,
        };
      case 'secondary':
        return {
          bg: '#0E4A33',
          borderBottom: '#083021',
          borderColor: '#1B7050',
          textColor: '#F5ECD2',
          shadow: {},
        };
      case 'wood':
        return {
          bg: '#7A431C',
          borderBottom: '#4D270E',
          borderColor: '#E9B949',
          textColor: '#F5ECD2',
          shadow: {},
        };
      case 'outline':
        return {
          bg: 'transparent',
          borderBottom: '#083021',
          borderColor: '#1B7050',
          textColor: '#9FD8B8',
          shadow: {},
        };
      case 'danger':
        return {
          bg: '#E23B5A',
          borderBottom: '#981C33',
          borderColor: '#F87171',
          textColor: '#F5ECD2',
          shadow: {},
        };
      case 'primary':
      default:
        return {
          bg: '#2BD67B',
          borderBottom: '#169352',
          borderColor: '#4ADE80',
          textColor: '#07261C',
          shadow: THEME.shadows.glowEmerald,
        };
    }
  };

  const v = getVariantStyles();

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const btnHeight = isSmall ? 38 : isLarge ? 56 : 50;
  const btnRadius = isSmall ? 12 : isLarge ? 18 : 16;
  const borderBottom = isPressed ? (isSmall ? 1.5 : 2) : (isSmall ? 4 : 6);
  const textFontSize = isSmall ? 12 : isLarge ? 16 : 14;

  return (
    <Animated.View style={[styles.container, { borderRadius: btnRadius }, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          {
            height: btnHeight,
            borderRadius: btnRadius,
            paddingHorizontal: isSmall ? 10 : isLarge ? 20 : 16,
            backgroundColor: v.bg,
            borderBottomColor: v.borderBottom,
            borderBottomWidth: borderBottom,
            borderColor: v.borderColor,
            borderWidth: variant === 'outline' || variant === 'wood' || variant === 'secondary' ? 1.5 : 0,
          },
          v.shadow,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={v.textColor} />
        ) : (
          <Text
            style={[
              styles.textBase,
              { color: v.textColor, fontSize: textFontSize },
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
  },
  base: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: THEME.typography.fontSize.body,
    fontWeight: 'bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  disabledText: {
    color: THEME.colors.textMuted,
  },
});
