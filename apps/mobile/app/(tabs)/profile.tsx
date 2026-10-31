import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Modal,
  PrimaryButton,
  ProfileHeader,
  ScreenContainer,
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
  { id: 'a3', title: 'Century Club', desc: 'Complete 100 offline matches', icon: '🏆', unlocked: false },
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

  const displayName = profile?.username || user?.displayName || 'Club Master';
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
          tintColor={THEME.colors.neonEmerald}
        />
      }
      contentContainerStyle={styles.container}
    >
      {/* Top Banner with Settings shortcut */}
      <View style={styles.topActionsRow}>
        <Text style={styles.topTitle}>MEMBER CAREER</Text>
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
        rankTitle="CLUB MASTER"
        avatarEmoji="👑"
      />

      {/* Career Performance Matrix */}
      <Text style={styles.sectionTitle}>CAREER PERFORMANCE MATRIX</Text>
      <View style={styles.statsRow}>
        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>🎮</Text>
          <Text style={styles.statNumber}>{totalMatches}</Text>
          <Text style={styles.statSubtitle}>MATCHES</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.brass }]}>
            {totalWins}
          </Text>
          <Text style={styles.statSubtitle}>VICTORIES</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.neonEmerald }]}>
            {winRate}%
          </Text>
          <Text style={styles.statSubtitle}>WIN RATE</Text>
        </GameCard>

        <GameCard style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statNumber, { color: THEME.colors.brass }]}>
            {coins}
          </Text>
          <Text style={styles.statSubtitle}>COINS</Text>
        </GameCard>
      </View>

      {/* Achievements Showcase */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>CLUB TROPHIES</Text>
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
            title="PLAY FIRST MATCH"
            onPress={() => router.push('/game-mode')}
            variant="emerald"
            size="small"
            style={{ marginTop: 14 }}
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
                    {formatTimestamp(item.completedAt || item.startedAt)}
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
                {selectedMatch.mode.replace(/_/g, ' ').toUpperCase()}
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
                {selectedMatch.winnerId && selectedMatch.finalScores[selectedMatch.winnerId]?.queenPocketed
                  ? 'Yes'
                  : 'No'}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Local Sync Status</Text>
              <Text style={[styles.modalValue, { color: THEME.colors.neonEmerald }]}>
                {selectedMatch.isSynced ? 'Synced to Cloud' : 'Stored in SQLite'}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  badgeCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 0.23,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  statSubtitle: {
    fontSize: 9,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  achievementsList: {
    marginBottom: 6,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  lockedCard: {
    opacity: 0.55,
  },
  achIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achIconActive: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
  },
  achIconLocked: {
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  achEmoji: {
    fontSize: 18,
  },
  achBody: {
    flex: 1,
  },
  achTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  achDesc: {
    fontSize: 11,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  emptyHistoryCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyHistoryIcon: {
    fontSize: 34,
    marginBottom: 6,
  },
  emptyHistoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  emptyHistorySub: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  historyCard: {
    padding: 12,
    marginBottom: 8,
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
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  historyDate: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  historyOutcomeCol: {
    alignItems: 'flex-end',
  },
  outcomeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  outcomeWin: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
  },
  outcomeLoss: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.queenRed,
    borderWidth: 1.5,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  outcomeWinText: {
    color: THEME.colors.neonEmerald,
  },
  outcomeLossText: {
    color: THEME.colors.queenRed,
  },
  historyDuration: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
  },
  modalContent: {
    paddingVertical: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B7050',
  },
  modalLabel: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
  },
  modalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
});
