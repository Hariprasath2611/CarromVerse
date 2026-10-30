import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useEconomyStore } from '../src/store/economyStore';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function GameResultScreen() {
  const router = useRouter();
  const { players, selectedMode, targetPoints, turnTimeLimitSec } = useGameSetupStore();
  const { startSession, scores } = useGameSessionStore();
  const addCoins = useEconomyStore((state) => state.addCoins);

  const winner = players[0]; // Player 1 default winner or based on score

  const handleRematch = () => {
    addCoins(150); // Reward for completing match
    const baseConfig = createDefaultGameConfig(selectedMode);
    const config = {
      ...baseConfig,
      targetScore: targetPoints,
      turnTimeLimitSeconds: turnTimeLimitSec,
    };
    startSession(config, players);
    router.replace('/game-board');
  };

  const handleReturnHome = () => {
    addCoins(150);
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* CELEBRATORY WINNER HERO */}
      <View style={styles.celebrationHero}>
        <View style={styles.trophyAura}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </View>
        <Text style={styles.victoryTitle}>VICTORY!</Text>
        <Text style={styles.winnerSubtitle}>
          {winner.name} dominates the board and takes the crown!
        </Text>

        {/* Winner Badge Pill */}
        <View style={styles.winnerPill}>
          <Text style={styles.winnerAvatarEmoji}>{winner.avatarUrl || '👑'}</Text>
          <Text style={styles.winnerNameText}>{winner.name}</Text>
          <Text style={styles.crownTag}>CHAMPION</Text>
        </View>

        {/* Match Reward Drops */}
        <View style={styles.rewardDropsRow}>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardIcon}>⚡</Text>
            <Text style={styles.rewardText}>+150 EXP</Text>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardIcon}>💰</Text>
            <Text style={styles.rewardText}>+250 COINS</Text>
          </View>
        </View>
      </View>

      {/* FINAL SCOREBOARD TABLE */}
      <Text style={styles.sectionTitle}>FINAL MATCH STANDINGS</Text>
      <GameCard elevated style={styles.scoreCard}>
        {players.map((p, idx) => {
          const isWinner = idx === 0;
          const score = scores[p.id]?.score ?? (isWinner ? 25 : 14);
          return (
            <View
              key={p.id}
              style={[
                styles.playerScoreRow,
                idx !== players.length - 1 && styles.scoreRowDivider,
              ]}
            >
              <View style={styles.rankCol}>
                <Text style={styles.rankText}>#{idx + 1}</Text>
              </View>

              <View style={styles.playerAvatarCol}>
                <Text style={styles.avatarEmoji}>{p.avatarUrl || '👑'}</Text>
              </View>

              <View style={styles.playerMetaCol}>
                <View style={styles.playerNameRow}>
                  <Text style={styles.rowPlayerName}>{p.name}</Text>
                  {isWinner && <Text style={styles.winnerCrown}>👑</Text>}
                </View>
                <Text style={styles.rowRole}>
                  {p.position.toUpperCase()} SEAT • {p.assignedCoinType.toUpperCase()} COINS
                </Text>
              </View>

              <View style={styles.scoreCol}>
                <Text
                  style={[
                    styles.scoreText,
                    isWinner && styles.winnerScoreText,
                  ]}
                >
                  {score} pts
                </Text>
              </View>
            </View>
          );
        })}
      </GameCard>

      {/* DETAILED MATCH STATISTICS MATRIX */}
      <Text style={styles.sectionTitle}>MATCH PERFORMANCE ANALYTICS</Text>
      <View style={styles.analyticsGrid}>
        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⏱️</Text>
          <Text style={styles.analyticValue}>06:48</Text>
          <Text style={styles.analyticLabel}>Match Duration</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>🎯</Text>
          <Text style={styles.analyticValue}>78%</Text>
          <Text style={styles.analyticLabel}>Shot Accuracy</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>👑</Text>
          <Text style={styles.analyticValue}>Covered</Text>
          <Text style={styles.analyticLabel}>Queen Pocketed</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚪</Text>
          <Text style={styles.analyticValue}>9 / 9</Text>
          <Text style={styles.analyticLabel}>White Coins</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚫</Text>
          <Text style={styles.analyticValue}>6 / 9</Text>
          <Text style={styles.analyticLabel}>Black Coins</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚠️</Text>
          <Text style={styles.analyticValue}>1</Text>
          <Text style={styles.analyticLabel}>Fouls / Penalties</Text>
        </GameCard>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionButtons}>
        <PrimaryButton
          title="Play Rematch"
          subtitle="Battle again with same seating"
          onPress={handleRematch}
          variant="gold"
          size="large"
          icon="⚡"
          style={styles.rematchBtn}
        />

        <SecondaryButton
          title="Return to Main Menu"
          onPress={handleReturnHome}
          variant="surface"
          size="medium"
          icon="🏠"
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
  celebrationHero: {
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  trophyAura: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.goldBright,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    shadowColor: THEME.colors.goldBright,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  trophyEmoji: {
    fontSize: 48,
  },
  victoryTitle: {
    fontSize: THEME.typography.fontSize.h1,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.goldBright,
    letterSpacing: 2,
  },
  winnerSubtitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: THEME.spacing.lg,
  },
  winnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.accent,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: THEME.spacing.md,
  },
  winnerAvatarEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  winnerNameText: {
    fontSize: THEME.typography.fontSize.bodyMd,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginRight: 8,
  },
  crownTag: {
    backgroundColor: THEME.colors.primary,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardDropsRow: {
    flexDirection: 'row',
    marginTop: THEME.spacing.sm,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: THEME.colors.goldPrimary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    marginHorizontal: 4,
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.goldBright,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  scoreCard: {
    padding: THEME.spacing.sm,
    borderColor: THEME.colors.border,
  },
  playerScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scoreRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  rankCol: {
    width: 28,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
  },
  playerAvatarCol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  playerMetaCol: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPlayerName: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  winnerCrown: {
    fontSize: 12,
    marginLeft: 4,
  },
  rowRole: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  winnerScoreText: {
    color: THEME.colors.goldBright,
    fontSize: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticBox: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: 4,
    marginBottom: THEME.spacing.xs,
    borderColor: THEME.colors.border,
  },
  analyticIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  analyticValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  analyticLabel: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: THEME.spacing.md,
  },
  rematchBtn: {
    marginBottom: THEME.spacing.xs,
  },
});
