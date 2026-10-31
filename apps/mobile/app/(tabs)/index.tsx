import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BoardPreview,
  Button,
  CoinBalance,
  DailyRewardsModal,
  PlayerAvatar,
  ScreenContainer,
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
  const { coins, hasUnclaimedDailyReward, addCoins } = useEconomyStore();
  const { setGameMode } = useGameSetupStore();

  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const displayName = profile?.username || user?.displayName || 'HARIPRASATH';
  const playerLevel = profile?.level || 7;

  const onlineFriends = [
    { initial: 'A', name: 'Arun', color: 'emerald' as const },
    { initial: 'M', name: 'Meera', color: 'pink' as const },
    { initial: 'K', name: 'Kabir', color: 'mint' as const },
    { initial: 'D', name: 'Divya', color: 'emerald' as const },
  ];

  const handlePlayWithFriends = () => {
    router.push('/game-mode');
  };

  const handleRoomCode = () => {
    router.push('/lobby');
  };

  const handleNearby = () => {
    router.push('/game-mode');
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.container}
    >
      {/* Subtle Background Decorative Circles */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* TOP HEADER BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileSection}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <PlayerAvatar
            name={displayName}
            size={48}
            colorVariant="gold"
            ringColor="#2BD67B"
          />
          <View style={styles.nameBlock}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {displayName.toUpperCase()}
            </Text>
            <Text style={styles.leagueText}>Level {playerLevel} · Silver League</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowDailyRewards(true)}>
          <CoinBalance
            balance={coins || 2450}
            onAddPress={() => addCoins(500)}
          />
        </TouchableOpacity>
      </View>

      {/* HERO SECTION WITH TITLE & 3D TILTED BOARD */}
      <View style={styles.heroSection}>
        <Text style={styles.titleCarrom}>
          CARROM<Text style={styles.titleVerse}>VERSE</Text>
        </Text>

        <View style={styles.tiltedWrapper}>
          <BoardPreview size={210} theme="classic" />
        </View>
      </View>

      {/* PRIMARY CTA & QUICK ACTIONS */}
      <View style={styles.actionsSection}>
        <Button
          title="PLAY WITH FRIENDS"
          variant="primary"
          onPress={handlePlayWithFriends}
          style={styles.playButton}
        />

        <View style={styles.secondaryRow}>
          <Button
            title="ROOM CODE"
            variant="secondary"
            onPress={handleRoomCode}
            style={styles.secondaryBtn}
          />
          <Button
            title="NEARBY"
            variant="secondary"
            onPress={handleNearby}
            style={styles.secondaryBtn}
          />
        </View>
      </View>

      {/* ONLINE FRIENDS ROW */}
      <View style={styles.onlineSection}>
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>ONLINE</Text>
        </View>

        <View style={styles.avatarsRow}>
          {onlineFriends.map((f, idx) => (
            <View key={idx} style={styles.avatarItem}>
              <PlayerAvatar
                name={f.initial}
                size={38}
                colorVariant={f.color}
              />
              <View style={styles.activeStatusDot} />
            </View>
          ))}
        </View>
      </View>

      {/* Daily Rewards Modal */}
      <DailyRewardsModal
        visible={showDailyRewards}
        onClose={() => setShowDailyRewards(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  bokehTop: {
    position: 'absolute',
    top: 50,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 90,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameBlock: {
    justifyContent: 'center',
  },
  usernameText: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  leagueText: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  titleCarrom: {
    color: '#F5ECD2',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  titleVerse: {
    color: '#2BD67B',
  },
  tiltedWrapper: {
    transform: [{ perspective: 700 }, { rotateX: '26deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsSection: {
    width: '100%',
  },
  playButton: {
    marginBottom: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
  },
  onlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 14,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2BD67B',
  },
  onlineText: {
    color: '#2BD67B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarItem: {
    position: 'relative',
  },
  activeStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2BD67B',
    borderColor: '#0E4A33',
    borderWidth: 1.5,
  },
});
