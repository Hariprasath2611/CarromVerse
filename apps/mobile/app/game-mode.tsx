import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { THEME } from '../src/constants/theme';

interface ModeItem {
  id: string;
  num: number;
  badgeBg: string;
  title: string;
  desc: string;
  route: string;
}

const MODES: ModeItem[] = [
  {
    id: 'offline',
    num: 1,
    badgeBg: '#2BD67B', // Emerald
    title: 'OFFLINE',
    desc: 'Play against AI or pass & play with friends',
    route: '/player-selection',
  },
  {
    id: 'quick_match',
    num: 2,
    badgeBg: '#E9B949', // Gold
    title: 'QUICK MATCH',
    desc: 'Fast online match against random player',
    route: '/game-board',
  },
  {
    id: 'private_room',
    num: 3,
    badgeBg: '#F5ECD2', // Cream
    title: 'PRIVATE ROOM',
    desc: 'Create or join a private room with a code',
    route: '/lobby',
  },
  {
    id: 'nearby',
    num: 4,
    badgeBg: '#9FD8B8', // Mint
    title: 'NEARBY',
    desc: 'Play with friends over local Wi-Fi / Bluetooth',
    route: '/lobby',
  },
];

export default function GameModeScreen() {
  const router = useRouter();
  const { setGameMode } = useGameSetupStore();

  const handleSelectMode = (item: ModeItem) => {
    if (item.id === 'offline') {
      setGameMode('two_player_individual');
      router.push('/player-selection');
    } else if (item.id === 'quick_match') {
      setGameMode('two_player_individual');
      router.push('/game-board');
    } else {
      router.push('/lobby');
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>CHOOSE MODE</Text>
      </View>

      {/* 4 Mode Cards */}
      <View style={styles.modesList}>
        {MODES.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => handleSelectMode(item)}
          >
            <Card style={styles.modeCard}>
              <View style={[styles.numBadge, { backgroundColor: item.badgeBg }]}>
                <Text style={styles.numText}>{item.num}</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>{item.title}</Text>
                <Text style={styles.modeDesc}>{item.desc}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Back Button */}
      <View style={styles.footer}>
        <Button
          title="BACK"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  bokehTop: {
    position: 'absolute',
    top: 30,
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
    marginBottom: 20,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  modesList: {
    gap: 14,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 16,
  },
  numBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: '#07261C',
    fontSize: 22,
    fontWeight: '900',
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    color: '#F5ECD2',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  modeDesc: {
    color: '#9FD8B8',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 24,
  },
  backBtn: {
    width: '100%',
  },
});
