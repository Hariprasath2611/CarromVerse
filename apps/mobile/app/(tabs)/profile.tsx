import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Modal,
  PlayerAvatar,
  PrimaryButton,
  ProfileHeader,
  ScreenContainer,
  SecondaryButton,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useEconomyStore } from '../../src/store/economyStore';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { GameResult } from '@carromverse/shared-types';
import { formatDuration, formatTimestamp } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

const MOCK_ACHIEVEMENTS = [
  { id: 'a1', title: 'First Blood', desc: 'Pocket your first carrom coin', icon: '🎯', unlocked: true },
  { id: 'a2', title: 'Queen Majesty', desc: 'Pocket the Red Queen with cover', icon: '👑', unlocked: true },
  { id: 'a3', title: 'Century Club', desc: 'Complete 100 offline matches', icon: '💯', unlocked: false },
  { id: 'a4', title: 'White Wash', desc: 'Win a match without conceding any coin', icon: '⚡', unlocked: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const loadProfile = useUserStore((state) => state.loadUserProfile);
  const loadStats = useUserStore((state) => state.loadUserStatistics);
  const stats = useUserStore((state) => state.statistics);
  const coins = useEconomyStore((state) => state.coins);

  const [matches, setMatches] = useState<GameResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<GameResult | null>(null);

  const loadData = async () => {
    if (user?.uid) {
      await loadProfile(user.uid);
      await loadStats(user.uid);
    }
    try {
      const history = await LocalDatabaseService.getMatchHistory(20);
      setMatches(history);
    } catch {
      // Graceful fallback if SQLite empty
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayName = profile?.username || user?.displayName || 'Grand Striker';
  const totalMatches = stats?.totalMatches ?? Math.max(matches.length, 34);
  const totalWins = stats?.individualWins ?? 26;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 76;
  const playerLevel = profile?.level || 12;
  const experience = profile?.experience || 2850;

  return (
    <ScreenContainer
      scrollable
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={THEME.colors.accent}
        />
      }
      contentContainerStyle={styles.container}
    >
      {/* Top Banner with Settings shortcut */}
      <View style={styles.topActionsRow}>
        <Text style={styles.topTitle}>Player Career</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Header with Avatar Halo, Level & EXP */}
      <ProfileHeader
        username={displayName}
        level={playerLevel}
        currentExp={experience % 1000}
        nextLevelExp={1000}
        rankTitle="BOARD GRANDMASTER"
        avatarEmoji="👑"
      />

      {/* Career Performance Matrix */}
      <Text style={styles.sectionTitle}>CAREER PERFORMANCE MATRIX</Text>
      <View style={styles.statsRow}>
        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>🎮</Text>
          <Text style={styles.statNumber}>{totalMatches}</Text>
          <Text style={styles.statSubtitle}>Matches</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.goldBright }]}>
            {totalWins}
          </Text>
          <Text style={styles.statSubtitle}>Victories</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.accent }]}>
            {winRate}%
          </Text>
          <Text style={styles.statSubtitle}>Win Rate</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.goldBright }]}>
            {coins}
          </Text>
          <Text style={styles.statSubtitle}>Coins</Text>
        </GameCard>
      </View>

      {/* Achievements Showcase */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <Text style={styles.badgeCount}>2 / 4 UNLOCKED</Text>
      </View>

      <View style={styles.achievementsList}>
        {MOCK_ACHIEVEMENTS.map((ach) => (
          <GameCard
            key={ach.id}
            style={[styles.achievementCard, !ach.unlocked && styles.lockedCard]}
          >
            <View
              style={[
                styles.achIconCircle,
                ach.unlocked ? styles.achIconActive : styles.achIconLocked,
              ]}
            >
              <Text style={styles.achEmoji}>{ach.unlocked ? ach.icon : '🔒'}</Text>
            </View>
            <View style={styles.achBody}>
              <Text
                style={[
                  styles.achTitle,
                  !ach.unlocked && { color: THEME.colors.textMuted },
                ]}
              >
                {ach.title}
              </Text>
              <Text style={styles.achDesc}>{ach.desc}</Text>
            </View>
          </GameCard>
        ))}
      </View>

      {/* Match History (SQLite) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>LOCAL MATCH LOG (SQLITE)</Text>
        <Text style={styles.badgeCount}>
          {matches.length > 0 ? `${matches.length} MATCHES` : 'OFFLINE SYNC READY'}
        </Text>
      </View>

      {matches.length === 0 ? (
        <GameCard style={styles.emptyHistoryCard}>
          <Text style={styles.emptyHistoryIcon}>📝</Text>
          <Text style={styles.emptyHistoryTitle}>No Saved Matches Yet</Text>
          <Text style={styles.emptyHistorySub}>
            Complete an offline match to record detailed match stats, turns, and scores locally.
          </Text>
          <PrimaryButton
            title="Play Your First Match"
            onPress={() => router.push('/game-mode')}
            variant="emerald"
            size="small"
            style={{ marginTop: 12 }}
          />
        </GameCard>
      ) : (
        matches.map((item) => (
          <TouchableOpacity
            key={item.sessionId}
            activeOpacity={0.8}
            onPress={() => setSelectedMatch(item)}
          >
            <GameCard style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={styles.historyModeCol}>
                  <Text style={styles.historyMode}>
                    {item.mode.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatTimestamp(item.timestamp)}
                  </Text>
                </View>

                <View style={styles.historyOutcomeCol}>
                  <View
                    style={[
                      styles.outcomeTag,
                      item.winnerId === user?.uid
                        ? styles.outcomeWin
                        : styles.outcomeLoss,
                    ]}
                  >
                    <Text
                      style={[
                        styles.outcomeText,
                        item.winnerId === user?.uid
                          ? styles.outcomeWinText
                          : styles.outcomeLossText,
                      ]}
                    >
                      {item.winnerId === user?.uid ? 'VICTORY' : 'DEFEAT'}
                    </Text>
                  </View>
                  <Text style={styles.historyDuration}>
                    {formatDuration(item.durationSeconds)}
                  </Text>
                </View>
              </View>
            </GameCard>
          </TouchableOpacity>
        ))
      )}

      {/* Match Detail Modal */}
      <Modal
        visible={!!selectedMatch}
        title="Match Breakdown"
        onClose={() => setSelectedMatch(null)}
      >
        {selectedMatch && (
          <View style={styles.modalContent}>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Game Mode</Text>
              <Text style={styles.modalValue}>
                {selectedMatch.mode.replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Match Duration</Text>
              <Text style={styles.modalValue}>
                {formatDuration(selectedMatch.durationSeconds)}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Total Turns</Text>
              <Text style={styles.modalValue}>{selectedMatch.totalTurns}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Queen Covered</Text>
              <Text style={styles.modalValue}>
                {selectedMatch.queenPocketed ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Local Sync Status</Text>
              <Text style={[styles.modalValue, { color: THEME.colors.accent }]}>
                {selectedMatch.isSyncedToCloud ? 'Synced to Cloud' : 'Stored in SQLite'}
              </Text>
            </View>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  topTitle: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  badgeCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 0.23,
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: 2,
    borderColor: THEME.colors.border,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  statSubtitle: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  achievementsList: {
    marginBottom: THEME.spacing.xs,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
    borderColor: THEME.colors.border,
  },
  lockedCard: {
    opacity: 0.55,
  },
  achIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  achIconActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: THEME.colors.accent,
    borderWidth: 1,
  },
  achIconLocked: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  achEmoji: {
    fontSize: 16,
  },
  achBody: {
    flex: 1,
  },
  achTitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  achDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  emptyHistoryCard: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
    borderColor: THEME.colors.border,
  },
  emptyHistoryIcon: {
    fontSize: 32,
    marginBottom: THEME.spacing.xs,
  },
  emptyHistoryTitle: {
    fontSize: THEME.typography.fontSize.bodyMd,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  emptyHistorySub: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  historyCard: {
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
    borderColor: THEME.colors.border,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyModeCol: {
    flex: 1,
  },
  historyMode: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  historyDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  historyOutcomeCol: {
    alignItems: 'flex-end',
  },
  outcomeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: 2,
  },
  outcomeWin: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: THEME.colors.accent,
    borderWidth: 1,
  },
  outcomeLoss: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: THEME.colors.danger,
    borderWidth: 1,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  outcomeWinText: {
    color: THEME.colors.accent,
  },
  outcomeLossText: {
    color: THEME.colors.danger,
  },
  historyDuration: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  modalContent: {
    paddingVertical: THEME.spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  modalLabel: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
  },
  modalValue: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
});
