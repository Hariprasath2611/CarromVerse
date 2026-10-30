import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PlayerAvatar } from './PlayerAvatar';
import { LevelProgress } from './LevelProgress';
import { THEME } from '../constants/theme';

export interface ProfileHeaderProps {
  username: string;
  email?: string;
  level: number;
  currentExp: number;
  maxExp?: number;
  avatarUrl?: string;
  style?: ViewStyle;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  email,
  level,
  currentExp,
  maxExp = 1000,
  avatarUrl,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <PlayerAvatar
          name={username}
          size={68}
          level={level}
          isActive
        />
        <View style={styles.info}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{email || 'Offline Guest Account'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>🏆 MASTER TIER</Text>
            </View>
          </View>
        </View>
      </View>

      <LevelProgress
        level={level}
        currentExp={currentExp}
        maxExp={maxExp}
        style={styles.progress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.2,
    borderColor: THEME.colors.borderHighlight,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  info: {
    marginLeft: THEME.spacing.md,
    flex: 1,
  },
  username: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 0.3,
  },
  email: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: THEME.colors.goldPrimary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  tierText: {
    color: THEME.colors.goldBright,
    fontSize: 9,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  progress: {
    marginTop: THEME.spacing.xs,
  },
});
