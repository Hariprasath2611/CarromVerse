import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Player } from '@carromverse/shared-types';
import { getSeatDirectionLabel } from '@carromverse/game-logic';
import { THEME } from '../constants/theme';
import { Button } from './Button';

export interface PlayerHandoverModalProps {
  visible: boolean;
  nextPlayer: Player | null;
  onConfirm: () => void;
}

export const PlayerHandoverModal: React.FC<PlayerHandoverModalProps> = ({
  visible,
  nextPlayer,
  onConfirm,
}) => {
  if (!nextPlayer) return null;

  const seatLabel = getSeatDirectionLabel(nextPlayer.seat);
  const coinLabel =
    nextPlayer.assignedCoinType === 'white'
      ? '⚪ White Coins'
      : nextPlayer.assignedCoinType === 'black'
      ? '⚫ Black Coins'
      : '🎯 Any Coins';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PASS AND PLAY</Text>
          </View>

          <Text style={styles.instruction}>Pass Device to</Text>

          {/* Player Avatar */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{nextPlayer.avatarUrl || '👑'}</Text>
          </View>

          {/* Player Name */}
          <Text style={styles.playerName}>{nextPlayer.name}</Text>

          {/* Details Row */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailLabel}>SEAT</Text>
              <Text style={styles.detailValue}>{seatLabel}</Text>
            </View>

            <View style={styles.detailBadge}>
              <Text style={styles.detailLabel}>TARGET</Text>
              <Text style={styles.detailValue}>{coinLabel}</Text>
            </View>

            {nextPlayer.teamId && (
              <View style={[styles.detailBadge, styles.teamBadge]}>
                <Text style={styles.detailLabel}>TEAM</Text>
                <Text style={styles.detailValue}>
                  {nextPlayer.teamId === 'team_a' ? 'Team A' : 'Team B'}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmation Action */}
          <Button
            title="READY TO PLAY"
            variant="primary"
            size="lg"
            onPress={onConfirm}
            style={styles.readyButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 20, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0D3826',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  badge: {
    backgroundColor: 'rgba(233, 185, 73, 0.18)',
    borderWidth: 1,
    borderColor: THEME.colors.brass,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: THEME.colors.brass,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  instruction: {
    color: THEME.colors.cream,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  detailBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 38, 28, 0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.2)',
  },
  teamBadge: {
    borderColor: THEME.colors.brass,
    backgroundColor: 'rgba(233, 185, 73, 0.1)',
  },
  detailLabel: {
    color: THEME.colors.mutedMint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  readyButton: {
    width: '100%',
  },
});
