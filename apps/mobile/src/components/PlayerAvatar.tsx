import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

export interface PlayerAvatarProps {
  name: string;
  size?: number;
  avatarUrl?: string;
  isActive?: boolean;
  level?: number;
  teamColor?: 'team_a' | 'team_b';
  style?: ViewStyle;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  size = 52,
  avatarUrl,
  isActive = false,
  level,
  teamColor,
  style,
}) => {
  const initial = (name || 'P').trim()[0].toUpperCase();
  const radius = size / 2;

  const getBorderColor = () => {
    if (isActive) return THEME.colors.accent;
    if (teamColor === 'team_a') return THEME.colors.primary;
    if (teamColor === 'team_b') return THEME.colors.goldPrimary;
    return THEME.colors.borderHighlight;
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
          isActive && styles.activeHalo,
        ]}
      >
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
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
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHalo: {
    borderWidth: 2.5,
    ...THEME.shadows.emeraldGlow,
  },
  initial: {
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.accent,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    color: THEME.colors.accent,
    fontSize: 9,
    fontWeight: THEME.typography.fontWeight.bold,
  },
});
