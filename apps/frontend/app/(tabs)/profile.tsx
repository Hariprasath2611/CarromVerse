import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, PlayerAvatar, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { THEME } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { profile, loadUserProfile, clearUser } = useUserStore();

  const [offlineStats, setOfflineStats] = useState({
    totalMatches: 0,
    totalWins: 0,
    winRate: 0,
    totalDraws: 0,
  });

  useEffect(() => {
    // 1. Always load local offline stats
    LocalDatabaseService.getLocalStats()
      .then((stats) => setOfflineStats(stats))
      .catch(() => {});

    // 2. If authenticated, fetch latest online profile
    if (isAuthenticated && user?.uid) {
      loadUserProfile(user.uid).catch(() => {});
    }
  }, [isAuthenticated, user?.uid]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of CarromVerse?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              clearUser();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to log out.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Profile data resolution
  const isOnline = Boolean(isAuthenticated && user);
  const displayName = isOnline
    ? profile?.displayName || user?.displayName || profile?.username || 'Player'
    : 'Guest Player';
  const username = isOnline ? profile?.username || 'player' : 'guest';
  const avatarUrl = isOnline ? profile?.avatarUrl : null;
  const playerLevel = isOnline ? profile?.playerLevel || 1 : Math.max(1, Math.floor(offlineStats.totalWins / 3) + 1);

  // Statistics resolution
  const matches = isOnline ? (profile?.totalMatches ?? 0) : offlineStats.totalMatches;
  const wins = isOnline ? (profile?.totalWins ?? 0) : offlineStats.totalWins;
  const draws = isOnline ? (profile?.totalDraws ?? 0) : offlineStats.totalDraws;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : (isOnline ? 0 : offlineStats.winRate);
  const coinsPocketed = isOnline ? (profile?.totalCoinsPocketed ?? 0) : 0;
  const fouls = isOnline ? (profile?.totalFouls ?? 0) : 0;

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.container}
    >
      {/* Decorative background bokeh circles */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Large Avatar Hero */}
      <View style={styles.avatarHero}>
        <PlayerAvatar
          name={displayName}
          avatarUrl={avatarUrl}
          size={100}
          colorVariant="gold"
          ringColor="#2BD67B"
        />
        <Text style={styles.nameText}>{displayName.toUpperCase()}</Text>
        <Text style={styles.usernameTag}>@{username}</Text>
        <Text style={styles.leagueText}>
          Level {playerLevel} · {isOnline ? 'Silver League' : 'Offline Mode'}
        </Text>
      </View>

      {/* Level Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, Math.max(15, (playerLevel % 10) * 10))}%` },
            ]}
          />
        </View>
      </View>

      {/* Guest Mode Callout Card */}
      {!isOnline && (
        <Card style={styles.guestCard}>
          <Text style={styles.guestTitle}>Play Online & Save Progress</Text>
          <Text style={styles.guestSubtitle}>
            Sign in or create an account to unlock online multiplayer, secure your unique username, and save your career stats across devices.
          </Text>
          <Button
            title="SIGN IN / REGISTER"
            variant="primary"
            onPress={() => router.push('/(auth)/login')}
            style={styles.guestButton}
          />
        </Card>
      )}

      {/* Stats Section Title */}
      <Text style={styles.sectionTitle}>
        {isOnline ? 'CAREER STATISTICS' : 'OFFLINE STATISTICS'}
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{draws}</Text>
          <Text style={styles.statLabel}>Draws</Text>
        </Card>

        {isOnline && (
          <>
            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{coinsPocketed}</Text>
              <Text style={styles.statLabel}>Coins Pocketed</Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{fouls}</Text>
              <Text style={styles.statLabel}>Fouls</Text>
            </Card>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsList}>
        {isOnline && (
          <Button
            title="EDIT PROFILE"
            variant="primary"
            onPress={() => router.push('/edit-profile')}
            style={styles.actionBtn}
          />
        )}
        <Button
          title="MATCH HISTORY"
          variant="secondary"
          onPress={() => router.push('/match-history')}
          style={styles.actionBtn}
        />
        {isOnline && (
          <Button
            title="LOG OUT"
            variant="danger"
            onPress={handleLogout}
            style={styles.actionBtn}
          />
        )}
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
    paddingBottom: 36,
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
    marginBottom: 16,
  },
  nameText: {
    color: '#F5ECD2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 14,
    textAlign: 'center',
  },
  usernameTag: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
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
    marginBottom: 20,
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
    height: '100%',
    backgroundColor: '#2BD67B',
    borderRadius: 5,
  },
  guestCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  guestTitle: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  guestSubtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  guestButton: {
    width: '100%',
  },
  sectionTitle: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  statVal: {
    color: '#2BD67B',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsList: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
