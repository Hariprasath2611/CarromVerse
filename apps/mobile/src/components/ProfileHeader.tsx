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
  rankTitle = 'CLUB MASTER',
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
          size={70}
          level={level}
          isActive
        />
        <View style={styles.info}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{email || 'Club Member'}</Text>
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
    backgroundColor: '#0E4A33',
    borderRadius: 22,
    borderColor: '#1B7050',
    borderWidth: 2,
    padding: 18,
    marginBottom: 16,
    ...THEME.shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tierPill: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tierText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 0.6,
  },
  progress: {
    marginTop: 4,
  },
});
