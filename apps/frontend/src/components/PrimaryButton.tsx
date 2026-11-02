import React, { useState } from 'react';
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
  withTiming,
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
        return {
          bg: '#E9B949',
          borderBottom: '#A57E24',
          text: '#261B04',
          shadow: THEME.shadows.glowBrass,
        };
      case 'wood':
        return {
          bg: '#7A431C',
          borderBottom: '#4D270E',
          text: '#F5ECD2',
          shadow: {},
        };
      case 'forest':
        return {
          bg: '#0E4A33',
          borderBottom: '#083021',
          text: '#F5ECD2',
          shadow: {},
        };
      case 'danger':
        return {
          bg: '#E23B5A',
          borderBottom: '#981C33',
          text: '#F5ECD2',
          shadow: {},
        };
      case 'emerald':
      default:
        return {
          bg: '#2BD67B',
          borderBottom: '#169352',
          text: '#07261C',
          shadow: THEME.shadows.glowEmerald,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 42, paddingHorizontal: 14, fontSize: 13 };
      case 'large':
        return { height: subtitle ? 62 : 56, paddingHorizontal: 22, fontSize: 16 };
      case 'medium':
      default:
        return { height: subtitle ? 54 : 48, paddingHorizontal: 18, fontSize: 14 };
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
            borderBottomColor: v.borderBottom,
            borderBottomWidth: isPressed ? 2 : 6,
            minHeight: s.height,
            paddingHorizontal: s.paddingHorizontal,
          },
          v.shadow,
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
    borderRadius: 16,
  },
  button: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderWidth: 0,
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
    fontWeight: 'bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subtitleText: {
    fontSize: 10,
    opacity: 0.85,
    marginTop: 1,
    fontWeight: '600',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
