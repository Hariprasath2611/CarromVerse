import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface BadgeProps {
  label: string;
  variant?: 'gold' | 'wood' | 'success' | 'warning' | 'error' | 'muted';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'gold',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.textBase, styles[`${variant}Text` as keyof typeof styles], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  textBase: {
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  gold: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: THEME.colors.goldPrimary,
  },
  goldText: {
    color: THEME.colors.goldBright,
  },
  wood: {
    backgroundColor: 'rgba(139, 69, 19, 0.25)',
    borderColor: THEME.colors.woodLight,
  },
  woodText: {
    color: THEME.colors.woodGlow,
  },
  success: {
    backgroundColor: THEME.colors.successBg,
    borderColor: THEME.colors.success,
  },
  successText: {
    color: THEME.colors.success,
  },
  warning: {
    backgroundColor: THEME.colors.warningBg,
    borderColor: THEME.colors.warning,
  },
  warningText: {
    color: THEME.colors.warning,
  },
  error: {
    backgroundColor: THEME.colors.errorBg,
    borderColor: THEME.colors.error,
  },
  errorText: {
    color: THEME.colors.error,
  },
  muted: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.surfaceBorder,
  },
  mutedText: {
    color: THEME.colors.textMuted,
  },
});

