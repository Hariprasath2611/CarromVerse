import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PlayerAvatar } from './PlayerAvatar';
import { Badge } from './Badge';
import { THEME } from '../constants/theme';
import { Player } from '@carromverse/shared-types';

export interface PlayerCardProps {
  player: Player;
  isActiveTurn?: boolean;
  score?: number;
  onEditPress?: () => void;
  style?: ViewStyle;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActiveTurn = false,
  score,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        isActiveTurn && styles.activeCard,
        player.teamId === 'team_a' && styles.teamACard,
        player.teamId === 'team_b' && styles.teamBCard,
        style,
      ]}
    >
      <View style={styles.left}>
        <PlayerAvatar
          name={player.name}
          size={44}
          isActive={isActiveTurn}
          teamColor={player.teamId}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.position}>
            {player.position.toUpperCase()} • {player.assignedCoinType.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {player.teamId && (
          <Badge
            label={player.teamId === 'team_a' ? 'Team A' : 'Team B'}
            variant={player.teamId === 'team_a' ? 'gold' : 'wood'}
            style={styles.teamBadge}
          />
        )}
        {score !== undefined && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.2,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  activeCard: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.surfaceHighlight,
    ...THEME.shadows.emeraldGlow,
  },
  teamACard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  teamBCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.goldPrimary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    marginLeft: THEME.spacing.md,
    flex: 1,
  },
  name: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  position: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: THEME.spacing.sm,
  },
  teamBadge: {
    marginBottom: 4,
  },
  scoreBox: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
  },
  scoreText: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.heavy,
  },
});
