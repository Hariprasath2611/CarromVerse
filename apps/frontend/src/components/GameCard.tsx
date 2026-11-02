import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface GameCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  highlighted?: boolean;
  glow?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
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
    backgroundColor: '#0E4A33',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1B7050',
    overflow: 'hidden',
  },
  elevated: {
    ...THEME.shadows.card,
    backgroundColor: '#105239',
    borderColor: '#248660',
  },
  highlighted: {
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    backgroundColor: '#125A3F',
  },
  glow: {
    ...THEME.shadows.glowEmerald,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
