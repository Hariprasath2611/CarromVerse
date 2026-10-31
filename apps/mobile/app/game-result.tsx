import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, PlayerAvatar, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useEconomyStore } from '../src/store/economyStore';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function GameResultScreen() {
  const router = useRouter();
  const { players, selectedMode, targetPoints, turnTimeLimitSec } = useGameSetupStore();
  const { startSession } = useGameSessionStore();
  const addCoins = useEconomyStore((state) => state.addCoins);

  const handleRematch = () => {
    addCoins(120);
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
    addCoins(120);
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* WINNER TITLE */}
      <View style={styles.header}>
        <Text style={styles.title}>YOU WIN!</Text>
        <Text style={styles.subtitle}>Queen covered · Match complete</Text>
      </View>

      {/* PLAYER COMPARISON CARD */}
      <Card style={styles.vsCard}>
        <View style={styles.playerCol}>
          <PlayerAvatar
            name="H"
            size={64}
            colorVariant="gold"
            ringColor="#2BD67B"
          />
          <Text style={styles.scoreYou}>12</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.playerCol}>
          <PlayerAvatar
            name="A"
            size={64}
            colorVariant="mint"
            ringColor="#E9B949"
          />
          <Text style={styles.scoreOpponent}>8</Text>
        </View>
      </Card>

      {/* REWARD BREAKDOWN CARDS */}
      <View style={styles.rewardsList}>
        <Card style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>COINS</Text>
          <Text style={styles.rewardCoins}>+120</Text>
        </Card>

        <Card style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>XP</Text>
          <Text style={styles.rewardXp}>+60</Text>
        </Card>
      </View>

      {/* BOTTOM ACTIONS */}
      <View style={styles.footer}>
        <Button
          title="REMATCH"
          variant="primary"
          onPress={handleRematch}
          style={styles.actionBtn}
        />
        <Button
          title="HOME"
          variant="secondary"
          onPress={handleReturnHome}
          style={styles.actionBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    marginTop: 16,
  },
  title: {
    color: '#E9B949', // Gold
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  vsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginVertical: 16,
  },
  playerCol: {
    alignItems: 'center',
    gap: 12,
  },
  vsText: {
    color: '#9FD8B8',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreYou: {
    color: '#2BD67B',
    fontSize: 36,
    fontWeight: '900',
  },
  scoreOpponent: {
    color: '#E9B949',
    fontSize: 36,
    fontWeight: '900',
  },
  rewardsList: {
    gap: 12,
    marginBottom: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  rewardLabel: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  rewardCoins: {
    color: '#E9B949',
    fontSize: 16,
    fontWeight: '900',
  },
  rewardXp: {
    color: '#2BD67B',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
