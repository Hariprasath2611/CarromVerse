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
            label={player.teamId === 'team_a' ? 'TEAM A' : 'TEAM B'}
            variant={player.teamId === 'team_a' ? 'success' : 'gold'}
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
    backgroundColor: '#0E4A33',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1B7050',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activeCard: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125239',
    ...THEME.shadows.glowEmerald,
  },
  teamACard: {
    borderLeftWidth: 5,
    borderLeftColor: THEME.colors.neonEmerald,
  },
  teamBCard: {
    borderLeftWidth: 5,
    borderLeftColor: THEME.colors.brass,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: THEME.colors.cream,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  position: {
    color: THEME.colors.mutedMint,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  teamBadge: {
    marginBottom: 4,
  },
  scoreBox: {
    backgroundColor: '#07261C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1B7050',
  },
  scoreText: {
    color: THEME.colors.brass,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
