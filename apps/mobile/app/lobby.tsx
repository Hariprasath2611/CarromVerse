import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BoardPreview,
  GameCard,
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
          <Text style={styles.backArrow}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>LOCAL PRE-GAME LOBBY</Text>
          <Text style={styles.headerTitle}>READY TO BREAK</Text>
        </View>
      </View>

      {/* Match Rules Pill */}
      <GameCard style={styles.rulesCard}>
        <View style={styles.ruleBadgeRow}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{modeDisplayName}</Text>
          </View>
          <Text style={styles.rulesSummary}>
            TARGET: {targetPoints} PTS • {turnTimeLimitSec}S SHOT CLOCK
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
          title="START MATCH"
          subtitle="Break the center cluster and start game"
          onPress={handleStartMatch}
          variant="gold"
          size="large"
          icon="⚡"
          style={styles.startBtn}
        />

        <SecondaryButton
          title="EDIT CONFIGURATION"
          onPress={() => router.back()}
          variant="forest"
          size="medium"
          style={styles.editBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 16,
    color: THEME.colors.brass,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerStep: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  rulesCard: {
    padding: 12,
    marginBottom: 14,
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
    letterSpacing: 0.5,
  },
  rulesSummary: {
    fontSize: 11,
    color: THEME.colors.brass,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  boardPreviewWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  rosterTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
  },
  rosterGrid: {
    marginBottom: 14,
  },
  playerSlotCard: {
    padding: 12,
    marginBottom: 10,
  },
  firstPlayerCard: {
    borderColor: THEME.colors.neonEmerald,
    ...THEME.shadows.glowEmerald,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seatPill: {
    backgroundColor: '#07261C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderColor: '#1B7050',
    borderWidth: 1,
  },
  seatPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
  },
  firstTurnBadge: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  firstTurnText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.brass,
  },
  slotBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.3,
  },
  playerRole: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
  },
  startBtn: {
    marginBottom: 10,
  },
  editBtn: {},
});
