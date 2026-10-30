import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CoinBalance,
  DailyRewardsModal,
  GameCard,
  Modal,
  PlayerAvatar,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useEconomyStore } from '../../src/store/economyStore';
import { useGameSetupStore } from '../../src/store/gameSetupStore';
import { THEME } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const { coins, notifications, hasUnclaimedDailyReward, markNotificationsAsRead, addCoins } =
    useEconomyStore();
  const { setGameMode } = useGameSetupStore();

  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = profile?.username || user?.displayName || 'Grand Striker';
  const playerLevel = profile?.level || 12;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePlayOffline = () => {
    router.push('/game-mode');
  };

  const handlePracticeSolo = () => {
    setGameMode('practice');
    router.push('/game-board');
  };

  const handleOpenCustomize = () => {
    router.push('/(tabs)/customize');
  };

  const handleAddCoins = () => {
    Alert.alert('Free Coins Refill', 'Claim +500 free practice coins?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Claim',
        onPress: () => {
          addCoins(500);
        },
      },
    ]);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* TOP SECTION: Profile, Level, Balance, Notifications, Settings */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileSection}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <PlayerAvatar name={displayName} size={48} level={playerLevel} showHalo />
          <View style={styles.nameLevelWrap}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>LEVEL {playerLevel}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightControls}>
          <CoinBalance balance={coins} onAddPress={handleAddCoins} />

          {/* Notifications Trigger */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowNotifications(true);
              markNotificationsAsRead();
            }}
          >
            <Text style={styles.iconButtonEmoji}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Settings Trigger */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.iconButtonEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROMOTIONAL HERO BANNER */}
      <GameCard elevated style={styles.heroBanner}>
        <View style={styles.bannerTagRow}>
          <View style={styles.liveSeasonBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.liveSeasonText}>SEASON 1: EMERALD ARENA</Text>
          </View>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>

        <Text style={styles.bannerHeading}>Master the Board</Text>
        <Text style={styles.bannerSubheading}>
          Realistic carrom physics, fluid striker controls & offline multiplayer showdowns.
        </Text>

        <View style={styles.bannerStatsRow}>
          <View style={styles.bannerStatItem}>
            <Text style={styles.bannerStatValue}>100%</Text>
            <Text style={styles.bannerStatLabel}>Offline Play</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.bannerStatItem}>
            <Text style={styles.bannerStatValue}>2 to 4</Text>
            <Text style={styles.bannerStatLabel}>Players Shared</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.bannerStatItem}>
            <Text style={styles.bannerStatValue}>2v2</Text>
            <Text style={styles.bannerStatLabel}>Team Battles</Text>
          </View>
        </View>
      </GameCard>

      {/* MAIN ACTION SECTION */}
      <View style={styles.actionsContainer}>
        {/* Play Offline Hero Button */}
        <PrimaryButton
          title="Play Offline Match"
          subtitle="2P, 3P, 4P & 2v2 Team Battles"
          onPress={handlePlayOffline}
          variant="emerald"
          size="large"
          icon="🎯"
          style={styles.mainActionButton}
        />

        <View style={styles.secondaryActionsRow}>
          <View style={styles.halfButtonWrap}>
            <SecondaryButton
              title="Practice Solo"
              onPress={handlePracticeSolo}
              variant="surface"
              size="medium"
              icon="🎯"
            />
          </View>
          <View style={styles.halfButtonWrap}>
            <SecondaryButton
              title="Customize Gear"
              onPress={handleOpenCustomize}
              variant="surface"
              size="medium"
              icon="🎨"
            />
          </View>
        </View>
      </View>

      {/* DAILY REWARDS SECTION */}
      <GameCard elevated style={styles.dailyRewardCard}>
        <View style={styles.dailyRewardHeader}>
          <View style={styles.dailyRewardTitleRow}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <View>
              <Text style={styles.dailyRewardTitle}>Daily Login Rewards</Text>
              <Text style={styles.dailyRewardSubtitle}>
                {hasUnclaimedDailyReward
                  ? 'Your day reward is waiting to be claimed!'
                  : 'Streak active! Return tomorrow for higher rewards.'}
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title={hasUnclaimedDailyReward ? 'Claim Daily Reward' : 'View 7-Day Calendar'}
          onPress={() => setShowDailyRewards(true)}
          variant={hasUnclaimedDailyReward ? 'gold' : 'forest'}
          size="small"
          style={styles.claimButton}
        />
      </GameCard>

      {/* QUICK STATS SNAPSHOT */}
      <Text style={styles.sectionTitle}>YOUR CAREER OVERVIEW</Text>
      <View style={styles.statsGrid}>
        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>🎖️</Text>
          <Text style={styles.statMiniValue}>{profile?.totalMatches || 34}</Text>
          <Text style={styles.statMiniLabel}>Total Matches</Text>
        </GameCard>

        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>👑</Text>
          <Text style={styles.statMiniValue}>{profile?.wins || 26}</Text>
          <Text style={styles.statMiniLabel}>Victories</Text>
        </GameCard>

        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>🔥</Text>
          <Text style={styles.statMiniValue}>76%</Text>
          <Text style={styles.statMiniLabel}>Win Rate</Text>
        </GameCard>
      </View>

      {/* MODALS */}
      <DailyRewardsModal
        visible={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
      />

      <Modal
        visible={showNotifications}
        title="Inbox & Updates"
        onClose={() => setShowNotifications(false)}
      >
        <ScrollView style={styles.notificationsList}>
          {notifications.map((item) => (
            <View key={item.id} style={styles.notificationItem}>
              <Text style={styles.notifIcon}>📢</Text>
              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMsg}>{item.message}</Text>
                <Text style={styles.notifDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameLevelWrap: {
    marginLeft: THEME.spacing.sm,
    flex: 1,
  },
  usernameText: {
    fontSize: THEME.typography.fontSize.bodyLg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  levelBadge: {
    backgroundColor: THEME.colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    marginTop: 2,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: THEME.spacing.xs,
    position: 'relative',
  },
  iconButtonEmoji: {
    fontSize: 16,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  heroBanner: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
    position: 'relative',
  },
  bannerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  liveSeasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderColor: THEME.colors.primary,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accent,
    marginRight: 6,
  },
  liveSeasonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  trophyIcon: {
    fontSize: 22,
  },
  bannerHeading: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.xs,
  },
  bannerSubheading: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  bannerStatItem: {
    alignItems: 'center',
  },
  bannerStatValue: {
    fontSize: THEME.typography.fontSize.bodyLg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.accent,
  },
  bannerStatLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.border,
  },
  actionsContainer: {
    marginBottom: THEME.spacing.md,
  },
  mainActionButton: {
    marginBottom: THEME.spacing.sm,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButtonWrap: {
    flex: 0.485,
  },
  dailyRewardCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderColor: THEME.colors.border,
  },
  dailyRewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  dailyRewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  giftEmoji: {
    fontSize: 28,
    marginRight: THEME.spacing.sm,
  },
  dailyRewardTitle: {
    fontSize: THEME.typography.fontSize.bodyMd,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  dailyRewardSubtitle: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  claimButton: {
    marginTop: THEME.spacing.xs,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statMiniCard: {
    flex: 0.31,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xs,
  },
  statMiniEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statMiniValue: {
    fontSize: THEME.typography.fontSize.h3,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  statMiniLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  notificationsList: {
    maxHeight: 350,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  notifIcon: {
    fontSize: 20,
    marginRight: THEME.spacing.sm,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  notifMsg: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  notifDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
