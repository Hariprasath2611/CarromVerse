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
          const score = scores[p.id]?.points ?? (isWinner ? 25 : 14);
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
          <Text style={styles.analyticLabel}>MATCH DURATION</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>🎯</Text>
          <Text style={styles.analyticValue}>78%</Text>
          <Text style={styles.analyticLabel}>ACCURACY</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>👑</Text>
          <Text style={styles.analyticValue}>Covered</Text>
          <Text style={styles.analyticLabel}>QUEEN BONUS</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚪</Text>
          <Text style={styles.analyticValue}>9 / 9</Text>
          <Text style={styles.analyticLabel}>WHITE COINS</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚫</Text>
          <Text style={styles.analyticValue}>6 / 9</Text>
          <Text style={styles.analyticLabel}>BLACK COINS</Text>
        </GameCard>

        <GameCard style={styles.analyticBox}>
          <Text style={styles.analyticIcon}>⚠️</Text>
          <Text style={styles.analyticValue}>1</Text>
          <Text style={styles.analyticLabel}>FOULS</Text>
        </GameCard>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionButtons}>
        <PrimaryButton
          title="PLAY REMATCH"
          subtitle="Battle again with same seating"
          onPress={handleRematch}
          variant="gold"
          size="large"
          icon="⚡"
          style={styles.rematchBtn}
        />

        <SecondaryButton
          title="RETURN TO CLUB LOBBY"
          onPress={handleReturnHome}
          variant="forest"
          size="medium"
          icon="🏠"
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
  celebrationHero: {
    alignItems: 'center',
    marginVertical: 14,
  },
  trophyAura: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...THEME.shadows.glowBrass,
  },
  trophyEmoji: {
    fontSize: 50,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 2,
  },
  winnerSubtitle: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  winnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
    ...THEME.shadows.glowEmerald,
  },
  winnerAvatarEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  winnerNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginRight: 10,
  },
  crownTag: {
    backgroundColor: THEME.colors.neonEmerald,
    color: '#07261C',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rewardDropsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  rewardIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 8,
  },
  scoreCard: {
    padding: 12,
  },
  playerScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scoreRowDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B7050',
  },
  rankCol: {
    width: 30,
  },
  rankText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
  },
  playerAvatarCol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07261C',
    borderWidth: 1.5,
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  playerMetaCol: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.4,
  },
  winnerCrown: {
    fontSize: 14,
    marginLeft: 6,
  },
  rowRole: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    fontWeight: '600',
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
  },
  winnerScoreText: {
    color: THEME.colors.brass,
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  analyticIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  analyticValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  analyticLabel: {
    fontSize: 9,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionButtons: {
    marginTop: 18,
  },
  rematchBtn: {
    marginBottom: 10,
  },
});
