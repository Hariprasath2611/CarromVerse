import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'wood' | 'outline' | 'danger';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? THEME.colors.textInverse : THEME.colors.goldBright}
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            styles[`${variant}Text` as keyof typeof styles],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: THEME.colors.goldPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.goldBright,
    ...THEME.shadows.goldGlow,
  },
  secondary: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.goldBorder,
  },
  wood: {
    backgroundColor: THEME.colors.woodPrimary,
    borderWidth: 1,
    borderColor: THEME.colors.woodLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.goldBorder,
  },
  danger: {
    backgroundColor: THEME.colors.error,
    borderWidth: 1,
    borderColor: THEME.colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: THEME.colors.textInverse,
  },
  secondaryText: {
    color: THEME.colors.goldBright,
  },
  woodText: {
    color: THEME.colors.textPrimary,
  },
  outlineText: {
    color: THEME.colors.textSecondary,
  },
  dangerText: {
    color: THEME.colors.textPrimary,
  },
  disabledText: {
    color: THEME.colors.textMuted,
  },
});
