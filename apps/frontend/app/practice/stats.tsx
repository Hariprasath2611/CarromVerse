import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer } from '../../src/components';
import { LocalStorageService } from '../../src/services/storage/localStorageService';
import {
  BotDifficulty,
  DEFAULT_OVERALL_PRACTICE_STATS,
  OverallPracticeStats,
  PracticeDifficultyStats,
} from '@carromverse/bot-ai';
import { AudioManager } from '../../src/services/audio/AudioManager';

export default function PracticeStatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<OverallPracticeStats>(DEFAULT_OVERALL_PRACTICE_STATS);
  const [selectedTab, setSelectedTab] = useState<'OVERALL' | BotDifficulty>('OVERALL');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const loaded = await LocalStorageService.getPracticeStats();
    setStats(loaded);
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Practice Statistics?',
      'Are you sure you want to clear your local practice match history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await LocalStorageService.savePracticeStats(DEFAULT_OVERALL_PRACTICE_STATS);
            setStats(DEFAULT_OVERALL_PRACTICE_STATS);
          },
        },
      ]
    );
  };

  const currentDiffStats: PracticeDifficultyStats =
    selectedTab === 'EASY'
      ? stats.easy
      : selectedTab === 'MEDIUM'
        ? stats.medium
        : selectedTab === 'HARD'
          ? stats.hard
          : {
              matchesPlayed: stats.easy.matchesPlayed + stats.medium.matchesPlayed + stats.hard.matchesPlayed,
              matchesWon: stats.easy.matchesWon + stats.medium.matchesWon + stats.hard.matchesWon,
              matchesLost: stats.easy.matchesLost + stats.medium.matchesLost + stats.hard.matchesLost,
              totalShots: stats.easy.totalShots + stats.medium.totalShots + stats.hard.totalShots,
              successfulPockets: stats.easy.successfulPockets + stats.medium.successfulPockets + stats.hard.successfulPockets,
              missedShots: stats.easy.missedShots + stats.medium.missedShots + stats.hard.missedShots,
              fouls: stats.easy.fouls + stats.medium.fouls + stats.hard.fouls,
              queenAttempts: stats.easy.queenAttempts + stats.medium.queenAttempts + stats.hard.queenAttempts,
              queenSuccesses: stats.easy.queenSuccesses + stats.medium.queenSuccesses + stats.hard.queenSuccesses,
              totalDurationSeconds: stats.easy.totalDurationSeconds + stats.medium.totalDurationSeconds + stats.hard.totalDurationSeconds,
              highestScore: Math.max(stats.easy.highestScore, stats.medium.highestScore, stats.hard.highestScore),
            };

  const winRate =
    currentDiffStats.matchesPlayed > 0
      ? Math.round((currentDiffStats.matchesWon / currentDiffStats.matchesPlayed) * 100)
      : 0;

  const pocketAccuracy =
    currentDiffStats.totalShots > 0
      ? Math.round((currentDiffStats.successfulPockets / currentDiffStats.totalShots) * 100)
      : 0;

  const queenCoverRate =
    currentDiffStats.queenAttempts > 0
      ? Math.round((currentDiffStats.queenSuccesses / currentDiffStats.queenAttempts) * 100)
      : 0;

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
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>PRACTICE STATS</Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetStats}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* DIFFICULTY TABS */}
      <View style={styles.tabsRow}>
        {(['OVERALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, selectedTab === tab && styles.tabChipActive]}
            onPress={() => {
              setSelectedTab(tab);
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabChipText, selectedTab === tab && styles.tabChipTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TOP WIN RATE HERO BANNER */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroSub}>WIN RATE</Text>
          <Text style={styles.heroWinRate}>{winRate}%</Text>
          <Text style={styles.heroRecord}>
            {currentDiffStats.matchesWon} Won • {currentDiffStats.matchesLost} Lost
          </Text>
        </View>

        <View style={styles.heroRightCircle}>
          <Text style={styles.heroMatchesCount}>{currentDiffStats.matchesPlayed}</Text>
          <Text style={styles.heroMatchesLabel}>MATCHES</Text>
        </View>
      </View>

      {/* KPI METRICS GRID */}
      <View style={styles.gridContainer}>
        {/* POCKET ACCURACY */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>POCKET ACCURACY</Text>
          <Text style={[styles.metricValue, { color: '#2BD67B' }]}>{pocketAccuracy}%</Text>
          <Text style={styles.metricDetail}>
            {currentDiffStats.successfulPockets} pockets / {currentDiffStats.totalShots} shots
          </Text>
        </View>

        {/* QUEEN COVER RATE */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>QUEEN COVER</Text>
          <Text style={[styles.metricValue, { color: '#FFD84A' }]}>{queenCoverRate}%</Text>
          <Text style={styles.metricDetail}>
            {currentDiffStats.queenSuccesses} covers / {currentDiffStats.queenAttempts} attempts
          </Text>
        </View>

        {/* TOTAL FOULS */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>TOTAL FOULS</Text>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>{currentDiffStats.fouls}</Text>
          <Text style={styles.metricDetail}>Striker scratches & time penalties</Text>
        </View>

        {/* HIGHEST MATCH SCORE */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>BEST SCORE</Text>
          <Text style={[styles.metricValue, { color: '#06B6D4' }]}>
            {currentDiffStats.highestScore}
          </Text>
          <Text style={styles.metricDetail}>Points in a single match</Text>
        </View>
      </View>

      {/* DIFFICULTY BREAKDOWN TABLE (When Overall is selected) */}
      {selectedTab === 'OVERALL' && (
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>PERFORMANCE BY BOT DIFFICULTY</Text>

          {/* Easy Row */}
          <View style={styles.breakdownRow}>
            <View style={styles.botRowLeft}>
              <Text style={styles.botEmoji}>🤖</Text>
              <Text style={styles.botName}>Rookie (Easy)</Text>
            </View>
            <Text style={styles.botStats}>
              {stats.easy.matchesWon}W - {stats.easy.matchesLost}L (
              {stats.easy.matchesPlayed > 0
                ? Math.round((stats.easy.matchesWon / stats.easy.matchesPlayed) * 100)
                : 0}
              %)
            </Text>
          </View>

          {/* Medium Row */}
          <View style={styles.breakdownRow}>
            <View style={styles.botRowLeft}>
              <Text style={styles.botEmoji}>🎯</Text>
              <Text style={styles.botName}>Pro (Medium)</Text>
            </View>
            <Text style={styles.botStats}>
              {stats.medium.matchesWon}W - {stats.medium.matchesLost}L (
              {stats.medium.matchesPlayed > 0
                ? Math.round((stats.medium.matchesWon / stats.medium.matchesPlayed) * 100)
                : 0}
              %)
            </Text>
          </View>

          {/* Hard Row */}
          <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
            <View style={styles.botRowLeft}>
              <Text style={styles.botEmoji}>🏆</Text>
              <Text style={styles.botName}>Master (Hard)</Text>
            </View>
            <Text style={styles.botStats}>
              {stats.hard.matchesWon}W - {stats.hard.matchesLost}L (
              {stats.hard.matchesPlayed > 0
                ? Math.round((stats.hard.matchesWon / stats.hard.matchesPlayed) * 100)
                : 0}
              %)
            </Text>
          </View>
        </View>
      )}

      {/* BOTTOM ACTION */}
      <View style={styles.bottomActions}>
        <Button
          title="PLAY PRACTICE MATCH 🎯"
          variant="primary"
          onPress={() => router.push('/practice')}
          style={styles.playButton}
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
    marginBottom: 16,
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
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabChipActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#0E4A33',
  },
  tabChipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabChipTextActive: {
    color: '#2BD67B',
  },
  heroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2BD67B',
  },
  heroLeft: {
    flex: 1,
  },
  heroSub: {
    color: '#FFD84A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroWinRate: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },
  heroRecord: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  heroRightCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderWidth: 2,
    borderColor: '#2BD67B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMatchesCount: {
    color: '#2BD67B',
    fontSize: 22,
    fontWeight: '900',
  },
  heroMatchesLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0E4A33',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.20)',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricDetail: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 11,
    lineHeight: 15,
  },
  breakdownCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.2)',
    marginBottom: 20,
  },
  breakdownTitle: {
    color: '#FFD84A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  botRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  botName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botStats: {
    color: '#2BD67B',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomActions: {
    marginTop: 4,
  },
  playButton: {
    height: 52,
  },
});
