import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useEconomyStore } from '../src/store/economyStore';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function GameResultScreen() {
  const router = useRouter();
  const { players, selectedMode, targetPoints, turnTimeLimitSec, teamAName, teamBName, boardTheme } =
    useGameSetupStore();
  const { gameResult, scores, startSession } = useGameSessionStore();
  const addCoins = useEconomyStore((state) => state.addCoins);

  const isTeam = selectedMode === 'four_player_team';

  // Winner calculation
  let title = 'MATCH COMPLETE';
  let subtitle = 'Well played!';
  let winnerEmoji = '👑';

  if (gameResult?.isDraw) {
    title = 'MATCH DRAW!';
    subtitle = 'Both players reached equal scores';
    winnerEmoji = '🤝';
  } else if (isTeam && gameResult?.winningTeamId) {
    const winningName = gameResult.winningTeamId === 'team_a' ? teamAName : teamBName;
    title = `${winningName.toUpperCase()} WINS!`;
    subtitle = `Dominant team victory in 2v2 doubles`;
    winnerEmoji = '🏆';
  } else if (gameResult?.winnerName) {
    title = `${gameResult.winnerName.toUpperCase()} WINS!`;
    subtitle = `Reached target score first`;
    const winningPlayer = players.find((p) => p.name === gameResult.winnerName);
    if (winningPlayer?.avatarUrl) {
      winnerEmoji = winningPlayer.avatarUrl;
    }
  }

  const handleRematch = () => {
    addCoins(100);
    const baseConfig = createDefaultGameConfig(selectedMode);
    const config = {
      ...baseConfig,
      boardTheme,
      targetScore: targetPoints,
      turnTimeLimitSeconds: turnTimeLimitSec,
      teamNames: isTeam ? { team_a: teamAName, team_b: teamBName } : undefined,
    };
    startSession(config, players);
    router.replace('/game-board');
  };

  const handleReturnHome = () => {
    addCoins(100);
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* WINNER HERO */}
      <View style={styles.header}>
        <View style={styles.trophyCircle}>
          <Text style={styles.trophyEmoji}>{winnerEmoji}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* FINAL SCORES BREAKDOWN CARD */}
      <Card style={styles.scoresCard}>
        <Text style={styles.cardHeaderTitle}>FINAL SCORES</Text>
        <View style={styles.scoresList}>
          {players.map((p) => {
            const finalScore =
              gameResult?.finalScores?.[p.id] ?? scores[p.id]?.points ?? 0;
            const isWinner =
              (!gameResult?.isDraw &&
                (p.id === gameResult?.winnerId ||
                  (isTeam && p.teamId === gameResult?.winningTeamId))) ||
              false;

            return (
              <View
                key={p.id}
                style={[styles.scoreRow, isWinner && styles.winnerScoreRow]}
              >
                <View style={styles.scoreRowLeft}>
                  <Text style={styles.playerAvatarEmoji}>{p.avatarUrl || '👑'}</Text>
                  <View>
                    <Text style={styles.playerRowName}>
                      {p.name} {isWinner ? '🏆' : ''}
                    </Text>
                    <Text style={styles.playerRowMeta}>
                      {p.teamId
                        ? p.teamId === 'team_a'
                          ? teamAName
                          : teamBName
                        : p.assignedCoinType === 'white'
                        ? 'White Coins'
                        : p.assignedCoinType === 'black'
                        ? 'Black Coins'
                        : 'Points Mode'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.scorePoints, isWinner && styles.winnerPoints]}>
                  {finalScore} pts
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* MATCH STATS CARD */}
      <View style={styles.statsRow}>
        <Card style={styles.statMiniCard}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statVal}>
            {gameResult?.durationSeconds
              ? `${Math.floor(gameResult.durationSeconds / 60)}m ${gameResult.durationSeconds % 60}s`
              : '2m 14s'}
          </Text>
        </Card>

        <Card style={styles.statMiniCard}>
          <Text style={styles.statLabel}>TOTAL TURNS</Text>
          <Text style={styles.statVal}>{gameResult?.totalTurns || 8}</Text>
        </Card>
      </View>

      {/* REWARDS SUMMARY */}
      <View style={styles.rewardsList}>
        <Card style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>COINS EARNED</Text>
          <Text style={styles.rewardCoins}>+100</Text>
        </Card>

        <Card style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>XP EARNED</Text>
          <Text style={styles.rewardXp}>+50</Text>
        </Card>
      </View>

      {/* BOTTOM ACTIONS */}
      <View style={styles.footer}>
        <Button
          title="PLAY AGAIN (REMATCH)"
          variant="primary"
          onPress={handleRematch}
          style={styles.actionBtn}
        />
        <Button
          title="RETURN TO HOME"
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
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  bokehTop: {
    position: 'absolute',
    top: 40,
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
    marginVertical: 8,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 185, 73, 0.2)',
    borderWidth: 2,
    borderColor: '#E9B949',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyEmoji: {
    fontSize: 40,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  scoresCard: {
    backgroundColor: '#0E4A33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    padding: 14,
  },
  cardHeaderTitle: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  scoresList: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(7, 38, 28, 0.6)',
  },
  winnerScoreRow: {
    backgroundColor: 'rgba(43, 214, 123, 0.2)',
    borderWidth: 1,
    borderColor: '#2BD67B',
  },
  scoreRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerAvatarEmoji: {
    fontSize: 22,
  },
  playerRowName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  playerRowMeta: {
    color: '#9FD8B8',
    fontSize: 10,
  },
  scorePoints: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '900',
  },
  winnerPoints: {
    color: '#2BD67B',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  rewardsList: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rewardLabel: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  rewardCoins: {
    color: '#E9B949',
    fontSize: 18,
    fontWeight: '900',
  },
  rewardXp: {
    color: '#2BD67B',
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    width: '100%',
  },
});
