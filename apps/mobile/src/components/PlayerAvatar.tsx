import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface PlayerAvatarProps {
  name: string;
  size?: number;
  avatarUrl?: string;
  isActive?: boolean;
  showHalo?: boolean;
  level?: number;
  teamColor?: 'team_a' | 'team_b';
  style?: ViewStyle;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 52,
  avatarUrl,
  isActive = false,
  showHalo = false,
  level,
  teamColor,
  style,
}) => {
  const isGlowing = isActive || showHalo;
  const initial = (name || 'P').trim()[0].toUpperCase();
  const radius = size / 2;

  const getBorderColor = () => {
    if (isGlowing) return '#2BD67B'; // Neon Emerald active ring
    if (teamColor === 'team_a') return '#2BD67B';
    if (teamColor === 'team_b') return '#E9B949'; // Brass ring
    return '#1B7050'; // Panel edge default
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: getBorderColor(),
          },
          isGlowing && styles.activeHalo,
        ]}
      >
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {avatarUrl || initial}
        </Text>
      </View>

      {level !== undefined && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: '#07261C', // Forest ground dark
    borderWidth: 3,             // 3px colored ring
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHalo: {
    borderColor: '#2BD67B',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8,
  },
  initial: {
    fontWeight: 'bold',
    color: '#F5ECD2',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2BD67B',
    borderColor: '#07261C',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#07261C',
  },
});
