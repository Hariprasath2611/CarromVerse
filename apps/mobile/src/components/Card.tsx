import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { THEME } from '../constants/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  highlighted = false,
  style,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.base,
        elevated && styles.elevated,
        highlighted && styles.highlighted,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  elevated: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderColor: THEME.colors.goldBorder,
  },
  highlighted: {
    borderColor: THEME.colors.goldPrimary,
    backgroundColor: THEME.colors.surfaceElevated,
  },
});

