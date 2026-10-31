import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, PlayerAvatar, ScreenContainer } from '../../src/components';
import { THEME } from '../../src/constants/theme';

type TabType = 'GLOBAL' | 'FRIENDS' | 'WEEKLY' | 'MONTHLY';

interface RankRow {
  rank: number;
  initial: string;
  name: string;
  score: number;
  colorVariant: 'gold' | 'pink' | 'mint' | 'emerald';
  isCurrentUser?: boolean;
}

const LEADERBOARD_DATA: RankRow[] = [
  { rank: 1, initial: 'A', name: 'Arun', score: 2480, colorVariant: 'gold' },
  { rank: 2, initial: 'M', name: 'Meera', score: 2310, colorVariant: 'pink' },
  { rank: 3, initial: 'K', name: 'Kabir', score: 2190, colorVariant: 'mint' },
  { rank: 4, initial: 'D', name: 'Divya', score: 2050, colorVariant: 'emerald' },
  { rank: 12, initial: 'Y', name: 'You', score: 1620, colorVariant: 'gold', isCurrentUser: true },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('GLOBAL');
  const tabs: TabType[] = ['GLOBAL', 'FRIENDS', 'WEEKLY', 'MONTHLY'];

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>RANKINGS</Text>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rankings List */}
      <View style={styles.list}>
        {LEADERBOARD_DATA.map((row) => (
          <Card
            key={row.rank}
            style={[
              styles.rankCard,
              row.isCurrentUser && styles.rankCardUser,
            ]}
          >
            <Text
              style={[
                styles.rankNum,
                row.isCurrentUser ? styles.rankNumUser : styles.rankNumOther,
              ]}
            >
              {row.rank}
            </Text>

            <PlayerAvatar
              name={row.initial}
              size={44}
              colorVariant={row.colorVariant}
            />

            <Text style={styles.playerName}>{row.name}</Text>

            <Text style={styles.playerScore}>{row.score}</Text>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#2BD67B',
    borderColor: '#2BD67B',
  },
  tabText: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#07261C',
  },
  list: {
    gap: 12,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  rankCardUser: {
    borderColor: '#2BD67B',
    borderWidth: 2,
    backgroundColor: '#11573C',
  },
  rankNum: {
    fontSize: 20,
    fontWeight: '900',
    width: 34,
  },
  rankNumOther: {
    color: '#2BD67B',
  },
  rankNumUser: {
    color: '#F5ECD2',
  },
  playerName: {
    flex: 1,
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 14,
  },
  playerScore: {
    color: '#E9B949',
    fontSize: 18,
    fontWeight: '900',
  },
});
