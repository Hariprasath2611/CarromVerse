import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type TabName = 'home' | 'friends' | 'customize' | 'rankings' | 'profile';

export interface TabBarIconProps {
  name: TabName;
  focused: boolean;
  color?: string;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color = '#2BD67B' }) => {
  const getIconGlyph = () => {
    switch (name) {
      case 'home':
        return '🏠';
      case 'friends':
        return '👥';
      case 'customize':
        return '🎯';
      case 'rankings':
        return '🏆';
      case 'profile':
        return '👤';
      default:
        return '●';
    }
  };

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <Text style={[styles.iconText, { opacity: focused ? 1.0 : 0.65 }]}>
        {getIconGlyph()}
      </Text>
      {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    position: 'relative',
  },
  containerFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconText: {
    fontSize: 20,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -3,
    width: 14,
    height: 3,
    borderRadius: 2,
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
});
