import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BoardPreview, Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { AudioManager } from '../src/services/audio/AudioManager';
import { createDefaultGameConfig, getSeatDirectionLabel } from '@carromverse/game-logic';
import { GameConfiguration, PlayerSeat } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

export default function LobbyScreen() {
  const router = useRouter();
  const {
    selectedMode,
    players,
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
    handoverConfirmationEnabled,
    soundEnabled,
    musicEnabled,
    teamAName,
    teamBName,
  } = useGameSetupStore();

  const startSession = useGameSessionStore((state) => state.startSession);

  const handleStartMatch = () => {
    AudioManager.getInstance().playSound('MATCH_START', 0.85);
    const baseConfig = createDefaultGameConfig(selectedMode);
    const config: GameConfiguration = {
      ...baseConfig,
      boardTheme,
      targetScore: targetPoints,
      turnTimeLimitSeconds: turnTimeLimitSec,
      handoverConfirmationEnabled,
      soundEnabled,
      musicEnabled,
      teamNames: selectedMode === 'four_player_team'
        ? { team_a: teamAName, team_b: teamBName }
        : undefined,
    };

    startSession(config, players);
    router.replace('/game-board');
  };

  const getPlayerAtSeat = (seat: PlayerSeat) => {
    return players.find((p) => p.seat === seat);
  };

  const northPlayer = getPlayerAtSeat(2);
  const southPlayer = getPlayerAtSeat(0);
  const eastPlayer = getPlayerAtSeat(1);
  const westPlayer = getPlayerAtSeat(3);

  const modeTitle =
    selectedMode === 'two_player_individual'
      ? '2 Players · 1v1 Classic'
      : selectedMode === 'three_player_individual'
      ? '3 Players · Points Carrom'
      : selectedMode === 'four_player_team'
      ? `4 Players · 2v2 (${teamAName} vs ${teamBName})`
      : '4 Players · Free for All';

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFLINE GAME LOBBY</Text>
        <Text style={styles.subtitle}>All players ready on this device</Text>
      </View>

      {/* TABLE VISUALIZATION CARD */}
      <Card style={styles.tableCard}>
        {/* North Player (Seat 2) */}
        {northPlayer && (
          <View style={styles.seatRowNorth}>
            <View style={styles.seatSlot}>
              <View style={[styles.avatarCircle, northPlayer.teamId === 'team_b' ? styles.avatarGold : styles.avatarEmerald]}>
                <Text style={styles.avatarEmoji}>{northPlayer.avatarUrl || '👑'}</Text>
              </View>
              <Text style={styles.seatPlayerName} numberOfLines={1}>{northPlayer.name}</Text>
              <Text style={styles.seatMetaText}>
                {northPlayer.teamId ? (northPlayer.teamId === 'team_a' ? teamAName : teamBName) : 'North'}
              </Text>
            </View>
          </View>
        )}

        {/* Middle Row: West Player + Board Preview + East Player */}
        <View style={styles.middleRow}>
          {/* West Player (Seat 3) */}
          <View style={styles.sideSlotWrapper}>
            {westPlayer ? (
              <View style={styles.seatSlot}>
                <View style={[styles.avatarCircle, styles.avatarGold]}>
                  <Text style={styles.avatarEmoji}>{westPlayer.avatarUrl || '👑'}</Text>
                </View>
                <Text style={styles.seatPlayerName} numberOfLines={1}>{westPlayer.name}</Text>
                <Text style={styles.seatMetaText}>{teamBName}</Text>
              </View>
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>

          {/* Board Center */}
          <View style={styles.boardCenter}>
            <BoardPreview size={140} theme={boardTheme} />
          </View>

          {/* East Player (Seat 1) */}
          <View style={styles.sideSlotWrapper}>
            {eastPlayer ? (
              <View style={styles.seatSlot}>
                <View style={[styles.avatarCircle, eastPlayer.teamId === 'team_b' ? styles.avatarGold : styles.avatarEmerald]}>
                  <Text style={styles.avatarEmoji}>{eastPlayer.avatarUrl || '👑'}</Text>
                </View>
                <Text style={styles.seatPlayerName} numberOfLines={1}>{eastPlayer.name}</Text>
                <Text style={styles.seatMetaText}>
                  {eastPlayer.teamId ? teamBName : 'East'}
                </Text>
              </View>
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>
        </View>

        {/* South Player (Seat 0) */}
        {southPlayer && (
          <View style={styles.seatRowSouth}>
            <View style={styles.seatSlot}>
              <View style={[styles.avatarCircle, styles.avatarEmerald]}>
                <Text style={styles.avatarEmoji}>{southPlayer.avatarUrl || '👑'}</Text>
              </View>
              <Text style={styles.seatPlayerName} numberOfLines={1}>{southPlayer.name}</Text>
              <Text style={styles.seatMetaText}>
                {southPlayer.teamId ? teamAName : 'South'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* MATCH SUMMARY CARD */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>MATCH RULES SUMMARY</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>MODE</Text>
            <Text style={styles.summaryItemVal}>{modeTitle}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>TARGET SCORE</Text>
            <Text style={styles.summaryItemVal}>{targetPoints} Points</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>TIMER</Text>
            <Text style={styles.summaryItemVal}>
              {turnTimeLimitSec > 0 ? `${turnTimeLimitSec}s per turn` : 'Unlimited'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>HANDOVER</Text>
            <Text style={styles.summaryItemVal}>
              {handoverConfirmationEnabled ? 'Enabled (Pass & Play)' : 'Immediate'}
            </Text>
          </View>
        </View>
      </Card>

      {/* BOTTOM START BUTTON */}
      <View style={styles.footer}>
        <Button
          title="START MATCH"
          variant="primary"
          size="lg"
          onPress={handleStartMatch}
          style={styles.startBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  bokehTop: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 80,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: '#0E4A33',
    borderColor: 'rgba(43, 214, 123, 0.35)',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  seatRowNorth: {
    marginBottom: 8,
  },
  seatRowSouth: {
    marginTop: 8,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sideSlotWrapper: {
    width: 72,
    alignItems: 'center',
  },
  emptySlot: {
    width: 72,
  },
  boardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatSlot: {
    alignItems: 'center',
    width: 76,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(7, 38, 28, 0.9)',
    borderWidth: 2,
    borderColor: '#2BD67B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarEmerald: {
    borderColor: '#2BD67B',
  },
  avatarGold: {
    borderColor: '#E9B949',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  seatPlayerName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  seatMetaText: {
    color: '#9FD8B8',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(13, 56, 38, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    padding: 14,
  },
  summaryTitle: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  summaryGrid: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 214, 123, 0.1)',
  },
  summaryItemLabel: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryItemVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    marginTop: 8,
  },
  startBtn: {
    width: '100%',
  },
});
