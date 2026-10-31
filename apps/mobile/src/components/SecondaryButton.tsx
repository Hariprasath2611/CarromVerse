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

export interface SecondaryButtonProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'surface' | 'outline' | 'forest' | 'brass';
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
  variant = 'forest',
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
      translateY.value = withTiming(3, { duration: 80 });
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
      case 'brass':
        return {
          bg: '#E9B949',
          borderBottom: '#A57E24',
          borderColor: '#F3D27A',
          text: '#261B04',
        };
      case 'outline':
        return {
          bg: 'transparent',
          borderBottom: '#0A3223',
          borderColor: '#1B7050',
          text: '#9FD8B8',
        };
      case 'surface':
        return {
          bg: '#103728',
          borderBottom: '#071B13',
          borderColor: '#1B7050',
          text: '#2BD67B',
        };
      case 'forest':
      default:
        return {
          bg: '#0E4A33',
          borderBottom: '#083021',
          borderColor: '#1B7050',
          text: '#F5ECD2',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 38, paddingHorizontal: 12, fontSize: 12 };
      case 'large':
        return { height: subtitle ? 58 : 52, paddingHorizontal: 20, fontSize: 15 };
      case 'medium':
      default:
        return { height: subtitle ? 50 : 44, paddingHorizontal: 16, fontSize: 13 };
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
            borderColor: v.borderColor,
            borderBottomColor: v.borderBottom,
            borderBottomWidth: isPressed ? 2 : 5,
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
    borderRadius: 16,
  },
  button: {
    borderRadius: 16,
    borderWidth: 1.5,
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
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitleText: {
    fontSize: 9,
    opacity: 0.85,
    marginTop: 1,
    fontWeight: '600',
  },
  icon: {
    fontSize: 16,
    marginRight: THEME.spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
