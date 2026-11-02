import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { LocalDatabaseService } from '../src/services/database/localDatabaseService';
import { GameResult } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

export default function MatchHistoryScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<GameResult[]>([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalWins: 0,
    winRate: 0,
    totalDraws: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [history, localStats] = await Promise.all([
        LocalDatabaseService.getMatchHistory(50),
        LocalDatabaseService.getLocalStats(),
      ]);
      setMatches(history);
      setStats(localStats);
    } catch (err) {
      console.warn('[MatchHistory] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Match History?',
      'Are you sure you want to permanently delete all offline match records from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await LocalDatabaseService.clearMatchHistory();
            await loadData();
          },
        },
      ]
    );
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'two_player_individual':
        return '2P · 1v1 Classic';
      case 'three_player_individual':
        return '3P · Points Carrom';
      case 'four_player_team':
        return '4P · 2v2 Doubles';
      case 'four_player_individual':
        return '4P · Free for All';
      default:
        return 'Custom Match';
    }
  };

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFLINE MATCH HISTORY</Text>
        <Text style={styles.subtitle}>Records stored 100% locally in SQLite</Text>
      </View>

      {/* STATS OVERVIEW CARDS */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{stats.totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{stats.totalWins}</Text>
          <Text style={styles.statLabel}>Victories</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{stats.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{stats.totalDraws}</Text>
          <Text style={styles.statLabel}>Draws</Text>
        </Card>
      </View>

      {/* MATCH LIST OR EMPTY STATE */}
      <View style={styles.listContainer}>
        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No offline matches yet</Text>
            <Text style={styles.emptySubtitle}>
              Play a pass-and-play match to see your game history here!
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const formattedDate = new Date(item.completedAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );
              const scoreEntries = Object.entries(item.finalScores || {});

              return (
                <Card style={styles.matchCard}>
                  <View style={styles.matchCardTop}>
                    <View style={styles.modeBadge}>
                      <Text style={styles.modeBadgeText}>
                        {getModeLabel(item.mode)}
                      </Text>
                    </View>
                    <Text style={styles.matchDate}>{formattedDate}</Text>
                  </View>

                  <View style={styles.matchResultRow}>
                    <Text style={styles.winnerLabel}>
                      {item.isDraw
                        ? '🤝 DRAW'
                        : `🏆 Winner: ${item.winnerName || item.winningTeamId || 'Player'}`}
                    </Text>
                    <Text style={styles.turnsDuration}>
                      {item.totalTurns} turns · {item.durationSeconds}s
                    </Text>
                  </View>

                  {/* Scores Pills */}
                  <View style={styles.scoresRow}>
                    {scoreEntries.map(([playerId, pts]) => {
                      const scoreVal =
                        typeof pts === 'number' ? pts : (pts as any)?.points ?? 0;
                      return (
                        <View key={playerId} style={styles.scorePill}>
                          <Text style={styles.scorePillText}>
                            {playerId.replace('player_', 'P')}: {scoreVal} pts
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        {matches.length > 0 && (
          <Button
            title="CLEAR HISTORY"
            variant="secondary"
            onPress={handleClearHistory}
            style={styles.clearBtn}
          />
        )}
        <Button
          title="BACK TO PROFILE"
          variant="primary"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 14,
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
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 56, 38, 0.8)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.2)',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#9FD8B8',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  matchCard: {
    backgroundColor: '#0E4A33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    padding: 12,
    gap: 6,
  },
  matchCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeBadge: {
    backgroundColor: 'rgba(43, 214, 123, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.35)',
  },
  modeBadgeText: {
    color: '#2BD67B',
    fontSize: 10,
    fontWeight: '800',
  },
  matchDate: {
    color: '#9FD8B8',
    fontSize: 10,
  },
  matchResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  winnerLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  turnsDuration: {
    color: '#9FD8B8',
    fontSize: 11,
  },
  scoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  scorePill: {
    backgroundColor: 'rgba(7, 38, 28, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scorePillText: {
    color: '#F5ECD2',
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    gap: 8,
    paddingTop: 4,
  },
  clearBtn: {
    width: '100%',
  },
  backBtn: {
    width: '100%',
  },
});
