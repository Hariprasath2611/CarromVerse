import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer } from '../../src/components';
import { useGameSetupStore } from '../../src/store/gameSetupStore';
import { useGameSessionStore } from '../../src/store/gameSessionStore';
import { BOT_PERSONALITIES, BotSessionManager } from '@carromverse/bot-ai';
import { AudioManager } from '../../src/services/audio/AudioManager';

export default function PracticeLobbyScreen() {
  const router = useRouter();
  const {
    players,
    botDifficulty,
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
  } = useGameSetupStore();

  const { startSession } = useGameSessionStore();

  const human = players.find((p) => p.type === 'human') || players[0];
  const bot = players.find((p) => p.type === 'bot') || players[1];
  const botInfo = BOT_PERSONALITIES[botDifficulty || 'MEDIUM'];

  const handleStartMatch = () => {
    AudioManager.getInstance().playSound('MATCH_START', 1.0);

    const config = BotSessionManager.createPracticeGameConfig({
      boardTheme,
      targetPoints,
      turnTimeLimitSec,
      soundEnabled: true,
      soundVolume: 0.8,
    });

    startSession(config, players);
    router.replace('/game-board');
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← CONFIG</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRACTICE LOBBY</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* VS MATCH ARENA CARD */}
      <View style={styles.vsArenaCard}>
        {/* HUMAN SIDE */}
        <View style={styles.playerSide}>
          <View style={[styles.avatarBox, styles.humanAvatarBox]}>
            <Text style={styles.avatarEmoji}>{human?.avatarUrl || '👑'}</Text>
          </View>
          <Text style={styles.playerName} numberOfLines={1}>
            {human?.name || 'You'}
          </Text>
          <View style={styles.colorPill}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: human?.assignedCoinType === 'white' ? '#FFF' : '#111' },
              ]}
            />
            <Text style={styles.colorPillText}>
              {human?.assignedCoinType?.toUpperCase() || 'WHITE'}
            </Text>
          </View>
          <Text style={styles.turnOrderText}>
            {human?.assignedCoinType === 'white' ? '1st to shoot' : '2nd to shoot'}
          </Text>
        </View>

        {/* CENTER VS EMBLEM */}
        <View style={styles.vsCenter}>
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <Text style={styles.practiceModeLabel}>PRACTICE</Text>
        </View>

        {/* BOT SIDE */}
        <View style={styles.playerSide}>
          <View style={[styles.avatarBox, styles.botAvatarBox]}>
            <Text style={styles.avatarEmoji}>{bot?.avatarUrl || botInfo.avatar}</Text>
          </View>
          <Text style={styles.playerName} numberOfLines={1}>
            {bot?.name || botInfo.name}
          </Text>
          <View style={styles.colorPill}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: bot?.assignedCoinType === 'white' ? '#FFF' : '#111' },
              ]}
            />
            <Text style={styles.colorPillText}>
              {bot?.assignedCoinType?.toUpperCase() || 'BLACK'}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: botDifficulty === 'HARD' ? '#EF4444' : botDifficulty === 'MEDIUM' ? '#F59E0B' : '#10B981' }]}>
            <Text style={styles.diffBadgeText}>{botDifficulty}</Text>
          </View>
        </View>
      </View>

      {/* MATCH SETTINGS OVERVIEW */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>MATCH DETAILS</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Target Points</Text>
          <Text style={styles.detailValue}>{targetPoints} PTS</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Board Theme</Text>
          <Text style={styles.detailValue}>{boardTheme.toUpperCase()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Shot Timer</Text>
          <Text style={styles.detailValue}>{turnTimeLimitSec}s per turn</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Physics Engine</Text>
          <Text style={styles.detailValue}>Matter.js Live Simulation</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ruleset</Text>
          <Text style={styles.detailValue}>SGFI/ICF Tournament Standard</Text>
        </View>
      </View>

      {/* BOT BEHAVIOR NOTICE */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>🤖 REAL AI GAMEPLAY</Text>
        <Text style={styles.noticeBody}>
          The bot analyzes real Matter.js physics vectors, line of sight, and pocket angles. No scripted teleportation or artificial cheats are used.
        </Text>
      </View>

      {/* START MATCH BUTTON */}
      <View style={styles.bottomActions}>
        <Button
          title="START PRACTICE MATCH 🎯"
          variant="primary"
          onPress={handleStartMatch}
          style={styles.startButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#07261C',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    color: '#2BD67B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  vsArenaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2BD67B',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  playerSide: {
    flex: 1,
    alignItems: 'center',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2.5,
  },
  humanAvatarBox: {
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderColor: '#2BD67B',
  },
  botAvatarBox: {
    backgroundColor: 'rgba(255, 216, 74, 0.15)',
    borderColor: '#FFD84A',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  colorPillText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
  },
  turnOrderText: {
    color: '#2BD67B',
    fontSize: 10,
    fontWeight: '700',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  diffBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  vsCenter: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  vsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD84A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  vsText: {
    color: '#1A0503',
    fontSize: 16,
    fontWeight: '900',
  },
  practiceModeLabel: {
    color: '#2BD67B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  overviewCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.2)',
    marginBottom: 16,
  },
  overviewTitle: {
    color: '#FFD84A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 13,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: 'rgba(43, 214, 123, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    marginBottom: 20,
  },
  noticeTitle: {
    color: '#2BD67B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noticeBody: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    lineHeight: 17,
  },
  bottomActions: {
    marginTop: 4,
  },
  startButton: {
    height: 52,
  },
});
