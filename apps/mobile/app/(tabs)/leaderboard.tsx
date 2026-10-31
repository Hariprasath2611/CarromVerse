import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCard, ScreenContainer } from '../../src/components';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { THEME } from '../../src/constants/theme';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  avatar: string;
  score: number;
  wins: number;
  winRate: string;
  isCurrentUser?: boolean;
}

const MOCK_LEADERS: LeaderboardEntry[] = [
  {
    rank: 1,
    id: 'p_1',
    name: 'SultanOfStrikes',
    level: 48,
    avatar: '👑',
    score: 4850,
    wins: 342,
    winRate: '88%',
  },
  {
    rank: 2,
    id: 'p_2',
    name: 'QueenHunter',
    level: 42,
    avatar: '🐯',
    score: 4120,
    wins: 298,
    winRate: '82%',
  },
  {
    rank: 3,
    id: 'p_3',
    name: 'PocketMaster',
    level: 39,
    avatar: '🦅',
    score: 3890,
    wins: 260,
    winRate: '79%',
  },
  {
    rank: 4,
    id: 'p_4',
    name: 'CarromWhiz',
    level: 35,
    avatar: '🦁',
    score: 3450,
    wins: 215,
    winRate: '74%',
  },
  {
    rank: 5,
    id: 'p_5',
    name: 'SmoothRebound',
    level: 31,
    avatar: '⚡',
    score: 3120,
    wins: 190,
    winRate: '71%',
  },
  {
    rank: 6,
    id: 'p_6',
    name: 'VortexShot',
    level: 28,
    avatar: '🔥',
    score: 2840,
    wins: 165,
    winRate: '68%',
  },
  {
    rank: 7,
    id: 'p_curr',
    name: 'You (Member)',
    level: 12,
    avatar: '🎯',
    score: 2500,
    wins: 26,
    winRate: '76%',
    isCurrentUser: true,
  },
  {
    rank: 8,
    id: 'p_8',
    name: 'EmeraldKnight',
    level: 24,
    avatar: '🛡️',
    score: 2310,
    wins: 130,
    winRate: '65%',
  },
  {
    rank: 9,
    id: 'p_9',
    name: 'ShadowFlick',
    level: 21,
    avatar: '🥷',
    score: 2040,
    wins: 110,
    winRate: '61%',
  },
  {
    rank: 10,
    id: 'p_10',
    name: 'PrecisionPro',
    level: 18,
    avatar: '🎯',
    score: 1850,
    wins: 95,
    winRate: '58%',
  },
];

export default function LeaderboardScreen() {
  const [filter, setFilter] = useState<'global' | 'weekly' | 'offline'>('global');
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);

  const top1 = MOCK_LEADERS[0];
  const top2 = MOCK_LEADERS[1];
  const top3 = MOCK_LEADERS[2];
  const restLeaders = MOCK_LEADERS.slice(3);

  const currentUserEntry = MOCK_LEADERS.find((l) => l.isCurrentUser) || {
    rank: 7,
    id: 'curr',
    name: profile?.username || user?.displayName || 'You',
    level: profile?.level || 12,
    avatar: '🎯',
    score: 2500,
    wins: profile?.wins || 26,
    winRate: '76%',
    isCurrentUser: true,
  };

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>HALL OF CHAMPIONS</Text>
        <Text style={styles.subtitle}>Compete for table glory and prestige season trophies</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'global' && styles.filterBtnActive]}
          onPress={() => setFilter('global')}
        >
          <Text
            style={[styles.filterBtnText, filter === 'global' && styles.filterBtnTextActive]}
          >
            GLOBAL ARENA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'weekly' && styles.filterBtnActive]}
          onPress={() => setFilter('weekly')}
        >
          <Text
            style={[styles.filterBtnText, filter === 'weekly' && styles.filterBtnTextActive]}
          >
            WEEKLY CUP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'offline' && styles.filterBtnActive]}
          onPress={() => setFilter('offline')}
        >
          <Text
            style={[styles.filterBtnText, filter === 'offline' && styles.filterBtnTextActive]}
          >
            CLUB RECORDS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Podium for Top 3 */}
      <View style={styles.podiumContainer}>
        {/* 2nd Place */}
        <View style={[styles.podiumColumn, styles.podiumCol2]}>
          <Text style={styles.podiumMedal}>🥈</Text>
          <View style={[styles.avatarBox, styles.silverBorder]}>
            <Text style={styles.avatarEmoji}>{top2.avatar}</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {top2.name}
          </Text>
          <Text style={styles.podiumScore}>{top2.score} pts</Text>
          <View style={[styles.pedestal, styles.pedestal2]}>
            <Text style={styles.pedestalNumber}>2</Text>
          </View>
        </View>

        {/* 1st Place */}
        <View style={[styles.podiumColumn, styles.podiumCol1]}>
          <Text style={styles.crownEmoji}>👑</Text>
          <View style={[styles.avatarBox, styles.goldBorder]}>
            <Text style={styles.avatarEmoji}>{top1.avatar}</Text>
          </View>
          <Text style={[styles.podiumName, styles.goldText]} numberOfLines={1}>
            {top1.name}
          </Text>
          <Text style={[styles.podiumScore, styles.goldText]}>{top1.score} pts</Text>
          <View style={[styles.pedestal, styles.pedestal1]}>
            <Text style={[styles.pedestalNumber, styles.goldText]}>1</Text>
          </View>
        </View>

        {/* 3rd Place */}
        <View style={[styles.podiumColumn, styles.podiumCol3]}>
          <Text style={styles.podiumMedal}>🥉</Text>
          <View style={[styles.avatarBox, styles.bronzeBorder]}>
            <Text style={styles.avatarEmoji}>{top3.avatar}</Text>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {top3.name}
          </Text>
          <Text style={styles.podiumScore}>{top3.score} pts</Text>
          <View style={[styles.pedestal, styles.pedestal3]}>
            <Text style={styles.pedestalNumber}>3</Text>
          </View>
        </View>
      </View>

      {/* Ranks 4+ List */}
      <FlatList
        data={restLeaders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.leaderRow,
              item.isCurrentUser && styles.currentUserHighlightRow,
            ]}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{item.rank}</Text>
            </View>

            <View style={styles.rowAvatar}>
              <Text style={styles.rowAvatarEmoji}>{item.avatar}</Text>
            </View>

            <View style={styles.rowInfo}>
              <Text
                style={[
                  styles.rowName,
                  item.isCurrentUser && styles.currentUserNameText,
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={styles.rowSub}>
                Lvl {item.level} • {item.wins} Wins • {item.winRate} Win Rate
              </Text>
            </View>

            <View style={styles.scoreWrap}>
              <Text style={styles.rowScore}>{item.score}</Text>
              <Text style={styles.trophySmall}>🏆</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Bottom Current User Bar */}
      <View style={styles.stickyUserCard}>
        <View style={styles.stickyRankBadge}>
          <Text style={styles.stickyRankText}>#{currentUserEntry.rank}</Text>
        </View>
        <View style={styles.stickyAvatar}>
          <Text style={styles.stickyAvatarEmoji}>{currentUserEntry.avatar}</Text>
        </View>
        <View style={styles.stickyInfo}>
          <Text style={styles.stickyTitle}>YOUR STANDING</Text>
          <Text style={styles.stickySub}>
            Lvl {currentUserEntry.level} • {currentUserEntry.wins} Wins
          </Text>
        </View>
        <View style={styles.stickyScoreWrap}>
          <Text style={styles.stickyScore}>{currentUserEntry.score}</Text>
          <Text style={styles.trophySmall}>🏆</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#07261C',
    borderRadius: 16,
    padding: 4,
    marginVertical: 10,
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: THEME.colors.neonEmerald,
  },
  filterBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
    letterSpacing: 0.5,
  },
  filterBtnTextActive: {
    color: '#07261C',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 180,
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  podiumColumn: {
    alignItems: 'center',
    flex: 1,
  },
  podiumCol1: {
    zIndex: 2,
  },
  podiumCol2: {
    zIndex: 1,
  },
  podiumCol3: {
    zIndex: 1,
  },
  crownEmoji: {
    fontSize: 22,
    marginBottom: -4,
  },
  podiumMedal: {
    fontSize: 18,
    marginBottom: 2,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#07261C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  goldBorder: {
    borderColor: THEME.colors.brass,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    ...THEME.shadows.glowBrass,
  },
  silverBorder: {
    borderColor: '#C0C0C0',
  },
  bronzeBorder: {
    borderColor: '#CD7F32',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    maxWidth: 90,
  },
  goldText: {
    color: THEME.colors.brass,
  },
  podiumScore: {
    fontSize: 10,
    color: THEME.colors.neonEmerald,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pedestal: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  pedestal1: {
    height: 74,
    backgroundColor: '#0E4A33',
    borderColor: THEME.colors.brass,
  },
  pedestal2: {
    height: 54,
    backgroundColor: '#0A3324',
  },
  pedestal3: {
    height: 40,
    backgroundColor: '#07261C',
  },
  pedestalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
  },
  listContent: {
    paddingBottom: 88,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  currentUserHighlightRow: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125A3F',
    ...THEME.shadows.glowEmerald,
  },
  rankBadge: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.brass,
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#07261C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  rowAvatarEmoji: {
    fontSize: 18,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  currentUserNameText: {
    color: THEME.colors.neonEmerald,
  },
  rowSub: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowScore: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    marginRight: 4,
  },
  trophySmall: {
    fontSize: 13,
  },
  stickyUserCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#07261C',
    borderTopColor: THEME.colors.neonEmerald,
    borderTopWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 10,
  },
  stickyRankBadge: {
    backgroundColor: THEME.colors.neonEmerald,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  stickyRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#07261C',
  },
  stickyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0E4A33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#1B7050',
  },
  stickyAvatarEmoji: {
    fontSize: 18,
  },
  stickyInfo: {
    flex: 1,
  },
  stickyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  stickySub: {
    fontSize: 10,
    color: THEME.colors.mutedMint,
  },
  stickyScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyScore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    marginRight: 4,
  },
});
