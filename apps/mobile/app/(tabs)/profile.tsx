import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, Header, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { GameResult } from '@carromverse/shared-types';
import { formatDuration, formatTimestamp } from '@carromverse/shared-utils';
import { THEME } from '../../src/constants/theme';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const loadProfile = useUserStore((state) => state.loadUserProfile);
  const loadStats = useUserStore((state) => state.loadUserStatistics);
  const stats = useUserStore((state) => state.statistics);

  const [matches, setMatches] = useState<GameResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (user?.uid) {
      await loadProfile(user.uid);
      await loadStats(user.uid);
    }
    const history = await LocalDatabaseService.getMatchHistory(20);
    setMatches(history);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalMatches = stats?.totalMatches ?? matches.length;
  const totalWins = stats?.individualWins ?? matches.filter((m) => m.winnerId === user?.uid).length;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      <Header title="Player Profile" />

      {/* Profile Overview Card */}
      <Card elevated style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(profile?.username || user?.displayName || 'G')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.username}>
              {profile?.username || user?.displayName || 'Guest Player'}
            </Text>
            <Text style={styles.email}>
              {user?.email || 'Local Offline Account'}
            </Text>
            <View style={styles.levelRow}>
              <Badge label={`Level ${profile?.level ?? 1}`} variant="gold" />
              <Text style={styles.expText}>EXP: {profile?.experience ?? 0} pts</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Lifetime Stats Matrix */}
      <Text style={styles.sectionTitle}>LIFETIME PERFORMANCE</Text>

      <View style={styles.statsGrid}>
        <Card style={styles.statBox}>
          <Text style={styles.statValue}>{totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statValue, { color: THEME.colors.goldBright }]}>
            {totalWins}
          </Text>
          <Text style={styles.statLabel}>Victories</Text>
        </Card>

        <Card style={styles.statBox}>
          <Text style={[styles.statValue, { color: THEME.colors.success }]}>
            {winRate}%
          </Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </Card>
      </View>

      {/* Local Game Match History (SQLite) */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>LOCAL MATCH HISTORY (SQLITE)</Text>
        <Text style={styles.countText}>{matches.length} recorded</Text>
      </View>

      {matches.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No local games recorded yet.</Text>
          <Text style={styles.emptySubtext}>
            Complete an offline match to see your structured game results here.
          </Text>
        </Card>
      ) : (
        matches.map((item) => (
          <Card key={item.id} style={styles.matchCard}>
            <View style={styles.matchRow}>
              <View>
                <Text style={styles.matchMode}>
                  {item.mode.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <Text style={styles.matchDate}>
                  {formatTimestamp(item.completedAt)} • {formatDuration(item.durationSeconds)}
                </Text>
              </View>
              <Badge
                label={item.isSynced ? 'Cloud Synced' : 'Local Only'}
                variant={item.isSynced ? 'success' : 'muted'}
              />
            </View>
            <Text style={styles.winnerNote}>
              Winner: {item.winnerName || (item.isDraw ? 'Draw' : 'Completed')}
            </Text>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.md,
  },
  profileCard: {
    marginBottom: THEME.spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.woodDark,
    borderWidth: 2,
    borderColor: THEME.colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  avatarText: {
    color: THEME.colors.goldBright,
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  username: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.subtitle,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  email: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
    marginBottom: 6,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
  },
  sectionTitle: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
  },
  statValue: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.headline,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  statLabel: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
  },
  emptyCard: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  emptySubtext: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.bodySm,
    textAlign: 'center',
    marginTop: 6,
  },
  matchCard: {
    marginBottom: THEME.spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchMode: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  matchDate: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
  },
  winnerNote: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 6,
  },
});

