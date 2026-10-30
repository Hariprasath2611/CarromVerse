import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BoardPreview,
  GameCard,
  PlayerAvatar,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function LobbyScreen() {
  const router = useRouter();
  const {
    selectedMode,
    players,
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
  } = useGameSetupStore();
  const startSession = useGameSessionStore((state) => state.startSession);

  const handleStartMatch = () => {
    const baseConfig = createDefaultGameConfig(selectedMode);
    const config = {
      ...baseConfig,
      targetScore: targetPoints,
      turnTimeLimitSeconds: turnTimeLimitSec,
    };
    startSession(config, players);
    router.replace('/game-board');
  };

  const modeDisplayName = selectedMode.replace(/_/g, ' ').toUpperCase();

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>LOCAL PRE-GAME LOBBY</Text>
          <Text style={styles.headerTitle}>Ready to Break</Text>
        </View>
      </View>

      {/* Match Rules Pill */}
      <GameCard style={styles.rulesCard}>
        <View style={styles.ruleBadgeRow}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{modeDisplayName}</Text>
          </View>
          <Text style={styles.rulesSummary}>
            Target: {targetPoints} Pts • {turnTimeLimitSec}s Shot Clock
          </Text>
        </View>
      </GameCard>

      {/* Board Visual Preview */}
      <View style={styles.boardPreviewWrap}>
        <BoardPreview size={190} theme={boardTheme} />
      </View>

      {/* Roster Slots Grid */}
      <Text style={styles.rosterTitle}>CONFIRMED PLAYER SLOTS</Text>
      <View style={styles.rosterGrid}>
        {players.map((player, index) => (
          <GameCard
            key={player.id}
            elevated
            style={[
              styles.playerSlotCard,
              index === 0 && styles.firstPlayerCard,
            ]}
          >
            <View style={styles.slotHeader}>
              <View style={styles.seatPill}>
                <Text style={styles.seatPillText}>
                  {player.position.toUpperCase()} SEAT
                </Text>
              </View>
              {index === 0 && (
                <View style={styles.firstTurnBadge}>
                  <Text style={styles.firstTurnText}>BREAK SHOT</Text>
                </View>
              )}
            </View>

            <View style={styles.slotBody}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarEmoji}>{player.avatarUrl || '👑'}</Text>
              </View>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.name}
                </Text>
                <Text style={styles.playerRole}>
                  {player.teamId
                    ? `${player.teamId === 'team_a' ? 'Team A' : 'Team B'} • `
                    : ''}
                  {player.assignedCoinType.toUpperCase()} COINS
                </Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Start Match"
          subtitle="Break the center cluster and start game"
          onPress={handleStartMatch}
          variant="gold"
          size="large"
          icon="⚡"
          style={styles.startBtn}
        />

        <SecondaryButton
          title="Edit Configuration"
          onPress={() => router.back()}
          variant="surface"
          size="medium"
          style={styles.editBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: THEME.colors.textPrimary,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerStep: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  rulesCard: {
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
    borderColor: THEME.colors.border,
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: THEME.colors.accent,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  rulesSummary: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  boardPreviewWrap: {
    alignItems: 'center',
    marginVertical: THEME.spacing.xs,
  },
  rosterTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  rosterGrid: {
    marginBottom: THEME.spacing.sm,
  },
  playerSlotCard: {
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
    borderColor: THEME.colors.border,
  },
  firstPlayerCard: {
    borderColor: THEME.colors.accent,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seatPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  seatPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
  },
  firstTurnBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: THEME.colors.goldBright,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  firstTurnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.goldBright,
  },
  slotBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  playerRole: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    marginTop: THEME.spacing.sm,
  },
  startBtn: {
    marginBottom: THEME.spacing.xs,
  },
  editBtn: {},
});
