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
    backgroundColor: '#0E4A33', // Felt panel green
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1B7050',     // 2px inner edge
    padding: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  elevated: {
    backgroundColor: '#11573C',
    borderColor: '#2BD67B',
  },
  highlighted: {
    borderColor: '#E9B949',     // Brass highlight
    backgroundColor: '#11573C',
  },
});
