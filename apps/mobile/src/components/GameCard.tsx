import React from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface GameCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  highlighted?: boolean;
  glow?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const GameCard: React.FC<GameCardProps> = ({
  children,
  elevated = false,
  highlighted = false,
  glow = false,
  onPress,
  style,
  ...rest
}) => {
  const content = (
    <View
      style={[
        styles.base,
        elevated && styles.elevated,
        highlighted && styles.highlighted,
        glow && styles.glow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.2,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  elevated: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderColor: THEME.colors.borderHighlight,
  },
  highlighted: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surfaceHighlight,
  },
  glow: {
    borderColor: THEME.colors.accent,
    ...THEME.shadows.emeraldGlow,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
