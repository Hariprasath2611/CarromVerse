import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BoardPreview,
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

  const displayName = profile?.username || user?.displayName || 'Club Master';
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
    Alert.alert('Club Vault Refill', 'Claim +500 free practice coins?', [
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
      {/* TOP SECTION: Member Avatar, Level, Balance, Notifications, Settings */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileSection}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <PlayerAvatar name={displayName} size={50} level={playerLevel} showHalo isActive />
          <View style={styles.nameLevelWrap}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>MEMBER LVL {playerLevel}</Text>
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

      {/* PROMOTIONAL HERO BANNER WITH BOARD ART */}
      <GameCard elevated style={styles.heroBanner}>
        <View style={styles.bannerTagRow}>
          <View style={styles.liveSeasonBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.liveSeasonText}>SEASON 1: EMERALD ARENA</Text>
          </View>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>

        <View style={styles.heroLayout}>
          <View style={styles.heroTextCol}>
            <Text style={styles.bannerHeading}>MASTER THE TABLE</Text>
            <Text style={styles.bannerSubheading}>
              Realistic wooden carrom physics, fluid tactile striker controls & pass-and-play doubles.
            </Text>
          </View>
          <View style={styles.heroBoardCol}>
            <BoardPreview size={108} />
          </View>
        </View>

        <View style={styles.bannerStatsRow}>
          <View style={styles.bannerStatItem}>
            <Text style={styles.bannerStatValue}>100%</Text>
            <Text style={styles.bannerStatLabel}>Offline Pass & Play</Text>
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
          title="PLAY OFFLINE MATCH"
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
              title="SOLO PRACTICE"
              onPress={handlePracticeSolo}
              variant="forest"
              size="medium"
              icon="🎯"
            />
          </View>
          <View style={styles.halfButtonWrap}>
            <SecondaryButton
              title="GEAR VAULT"
              onPress={handleOpenCustomize}
              variant="brass"
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
              <Text style={styles.dailyRewardTitle}>DAILY LOGIN REWARDS</Text>
              <Text style={styles.dailyRewardSubtitle}>
                {hasUnclaimedDailyReward
                  ? 'Your day reward is waiting to be collected!'
                  : 'Streak active! Return tomorrow for higher bonuses.'}
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          title={hasUnclaimedDailyReward ? 'CLAIM DAILY REWARD' : 'VIEW REWARDS CALENDAR'}
          onPress={() => setShowDailyRewards(true)}
          variant={hasUnclaimedDailyReward ? 'gold' : 'forest'}
          size="small"
          style={styles.claimButton}
        />
      </GameCard>

      {/* QUICK STATS SNAPSHOT */}
      <Text style={styles.sectionTitle}>YOUR CLUB OVERVIEW</Text>
      <View style={styles.statsGrid}>
        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>🎖️</Text>
          <Text style={styles.statMiniValue}>{profile?.totalMatches || 34}</Text>
          <Text style={styles.statMiniLabel}>MATCHES</Text>
        </GameCard>

        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>👑</Text>
          <Text style={styles.statMiniValue}>{profile?.wins || 26}</Text>
          <Text style={styles.statMiniLabel}>VICTORIES</Text>
        </GameCard>

        <GameCard style={styles.statMiniCard}>
          <Text style={styles.statMiniEmoji}>🔥</Text>
          <Text style={styles.statMiniValue}>76%</Text>
          <Text style={styles.statMiniLabel}>WIN RATE</Text>
        </GameCard>
      </View>

      {/* MODALS */}
      <DailyRewardsModal
        visible={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
      />

      <Modal
        visible={showNotifications}
        title="Club Announcements"
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameLevelWrap: {
    marginLeft: 10,
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.4,
  },
  levelBadge: {
    backgroundColor: '#07261C',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
    marginTop: 3,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
    letterSpacing: 0.6,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  iconButtonEmoji: {
    fontSize: 17,
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: THEME.colors.queenRed,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#07261C',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  heroBanner: {
    padding: 18,
    marginBottom: 16,
  },
  bannerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveSeasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07261C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.neonEmerald,
    marginRight: 6,
  },
  liveSeasonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
    letterSpacing: 0.6,
  },
  trophyIcon: {
    fontSize: 22,
  },
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroBoardCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerSubheading: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    lineHeight: 18,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#1B7050',
  },
  bannerStatItem: {
    alignItems: 'center',
  },
  bannerStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.brass,
  },
  bannerStatLabel: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    fontWeight: '600',
  },
  statSeparator: {
    width: 1.5,
    height: 24,
    backgroundColor: '#1B7050',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  mainActionButton: {
    marginBottom: 12,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButtonWrap: {
    flex: 0.485,
  },
  dailyRewardCard: {
    padding: 16,
    marginBottom: 16,
  },
  dailyRewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dailyRewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  giftEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  dailyRewardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.4,
  },
  dailyRewardSubtitle: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  claimButton: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statMiniCard: {
    flex: 0.31,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  statMiniEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statMiniValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  statMiniLabel: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  notificationsList: {
    maxHeight: 350,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1B7050',
  },
  notifIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  notifMsg: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  notifDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
