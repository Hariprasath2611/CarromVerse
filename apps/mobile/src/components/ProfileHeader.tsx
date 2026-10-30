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
  nextLevelExp?: number;
  rankTitle?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  style?: ViewStyle;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  email,
  level,
  currentExp,
  maxExp = 1000,
  nextLevelExp,
  rankTitle = 'BOARD GRANDMASTER',
  avatarEmoji,
  avatarUrl,
  style,
}) => {
  const targetExp = nextLevelExp ?? maxExp;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <PlayerAvatar
          name={username}
          avatarUrl={avatarEmoji || avatarUrl}
          size={68}
          level={level}
          isActive
        />
        <View style={styles.info}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{email || 'Offline Guest Account'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>🏆 {rankTitle}</Text>
            </View>
          </View>
        </View>
      </View>

      <LevelProgress
        level={level}
        currentExp={currentExp}
        maxExp={targetExp}
        style={styles.progress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.xl,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
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
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  email: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tierPill: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: 10,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  progress: {
    marginTop: THEME.spacing.xs,
  },
});
