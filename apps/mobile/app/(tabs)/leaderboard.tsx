import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCard, PlayerAvatar, ScreenContainer } from '../../src/components';
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
    name: 'You (Champion)',
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
        <Text style={styles.title}>Hall of Champions</Text>
        <Text style={styles.subtitle}>Compete for glory and prestigious season trophies</Text>
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
            Global Arena
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'weekly' && styles.filterBtnActive]}
          onPress={() => setFilter('weekly')}
        >
          <Text
            style={[styles.filterBtnText, filter === 'weekly' && styles.filterBtnTextActive]}
          >
            Weekly Cup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'offline' && styles.filterBtnActive]}
          onPress={() => setFilter('offline')}
        >
          <Text
            style={[styles.filterBtnText, filter === 'offline' && styles.filterBtnTextActive]}
          >
            Local Records
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
          <Text style={styles.stickyTitle}>Your Standing</Text>
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
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    flex: 1,
  },
  header: {
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginVertical: THEME.spacing.sm,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  filterBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 175,
    marginVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.sm,
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
    fontSize: 20,
    marginBottom: -4,
  },
  podiumMedal: {
    fontSize: 16,
    marginBottom: 2,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  goldBorder: {
    borderColor: THEME.colors.goldBright,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
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
    color: THEME.colors.textPrimary,
    maxWidth: 90,
  },
  goldText: {
    color: THEME.colors.goldBright,
  },
  podiumScore: {
    fontSize: 10,
    color: THEME.colors.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  pedestal: {
    width: '94%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: THEME.borderRadius.md,
    borderTopRightRadius: THEME.borderRadius.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  pedestal1: {
    height: 70,
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.goldPrimary,
  },
  pedestal2: {
    height: 52,
    backgroundColor: THEME.colors.surface,
  },
  pedestal3: {
    height: 38,
    backgroundColor: THEME.colors.surface,
  },
  pedestalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
  },
  listContent: {
    paddingBottom: 80,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.xs,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  currentUserHighlightRow: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  rankBadge: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  rowAvatarEmoji: {
    fontSize: 18,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  currentUserNameText: {
    color: THEME.colors.accent,
  },
  rowSub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowScore: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.accent,
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
    backgroundColor: THEME.colors.card,
    borderTopColor: THEME.colors.accent,
    borderTopWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    elevation: 10,
  },
  stickyRankBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    marginRight: THEME.spacing.sm,
  },
  stickyRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stickyAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
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
    color: THEME.colors.textPrimary,
  },
  stickySub: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  stickyScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.goldBright,
    marginRight: 4,
  },
});
