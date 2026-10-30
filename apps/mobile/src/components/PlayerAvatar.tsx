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
    if (isGlowing) return THEME.colors.accent;
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
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHalo: {
    borderColor: THEME.colors.accent,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  initial: {
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.accent,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 9,
    fontWeight: THEME.typography.fontWeight.heavy,
    color: THEME.colors.accent,
  },
});
