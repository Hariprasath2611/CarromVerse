import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, PlayerAvatar, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { THEME } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const [offlineStats, setOfflineStats] = useState({
    totalMatches: 0,
    totalWins: 0,
    winRate: 0,
    totalDraws: 0,
  });

  useEffect(() => {
    LocalDatabaseService.getLocalStats()
      .then((stats) => setOfflineStats(stats))
      .catch(() => {});
  }, []);

  const displayName = profile?.username || user?.displayName || 'HARIPRASATH';
  const playerLevel = profile?.level || 7;

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.container}
    >
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Large Avatar Hero */}
      <View style={styles.avatarHero}>
        <PlayerAvatar
          name={displayName}
          size={100}
          colorVariant="gold"
          ringColor="#2BD67B"
        />
        <Text style={styles.nameText}>{displayName.toUpperCase()}</Text>
        <Text style={styles.leagueText}>Level {playerLevel} · Silver League</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* 2x2 Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{offlineStats.totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{offlineStats.totalWins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{offlineStats.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{offlineStats.totalDraws}</Text>
          <Text style={styles.statLabel}>Draws</Text>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsList}>
        <Button
          title="MATCH HISTORY"
          variant="secondary"
          onPress={() => router.push('/match-history')}
          style={styles.actionBtn}
        />
        <Button
          title="EDIT PROFILE"
          variant="secondary"
          onPress={() => {}}
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
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
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
  avatarHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameText: {
    color: '#F5ECD2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 16,
    textAlign: 'center',
  },
  leagueText: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    width: '58%',
    height: '100%',
    backgroundColor: '#2BD67B',
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    width: '47.5%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
  },
  statVal: {
    color: '#2BD67B',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '700',
  },
  actionsList: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
