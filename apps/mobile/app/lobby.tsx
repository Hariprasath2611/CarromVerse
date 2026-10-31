import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, PlayerAvatar, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function LobbyScreen() {
  const router = useRouter();
  const {
    selectedMode,
    players,
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
    setGameMode,
    setPlayerCount,
  } = useGameSetupStore();
  const startSession = useGameSessionStore((state) => state.startSession);

  const [activeTab, setActiveTab] = useState<'2' | '3' | '4'>('4');
  const codeChars = ['K', '7', 'Q', '4', 'X', 'M'];

  const handleStartMatch = () => {
    const baseConfig = createDefaultGameConfig(selectedMode);
    const config = {
      ...baseConfig,
      targetScore: targetPoints,
      turnTimeLimitSeconds: turnTimeLimitSec,
    };
    startSession(config, players);
    router.replace('/game-board');
  };

  const handleSelectTab = (tab: '2' | '3' | '4') => {
    setActiveTab(tab);
    if (tab === '2') {
      setPlayerCount(2);
      setGameMode('two_player_individual');
    } else if (tab === '3') {
      setPlayerCount(3);
      setGameMode('three_player_individual');
    } else {
      setPlayerCount(4);
      setGameMode('four_player_team');
    }
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>TABLE K7Q4XM</Text>
      </View>

      {/* Code Tiles Row */}
      <View style={styles.tilesRow}>
        {codeChars.map((char, idx) => (
          <View key={idx} style={styles.codeTile}>
            <Text style={styles.codeChar}>{char}</Text>
          </View>
        ))}
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsRow}>
        <Button
          title="COPY CODE"
          variant="secondary"
          onPress={() => {}}
          style={styles.actionBtn}
        />
        <Button
          title="INVITE FRIEND"
          variant="secondary"
          onPress={() => {}}
          style={styles.actionBtn}
        />
      </View>

      {/* Circular Table Seating Card */}
      <Card style={styles.tableCard}>
        <View style={styles.tableCircle}>
          {/* Center Info */}
          <View style={styles.centerTableInfo}>
            <Text style={styles.centerCountText}>4 PLAYERS</Text>
            <Text style={styles.centerTeamsText}>TEAMS</Text>
          </View>

          {/* North Seat (+) */}
          <View style={[styles.seatSlot, styles.seatNorth]}>
            <View style={styles.dashedAddSlot}>
              <Text style={styles.addSlotPlus}>+</Text>
            </View>
          </View>

          {/* South Seat (Host) */}
          <View style={[styles.seatSlot, styles.seatSouth]}>
            <PlayerAvatar
              name="HARIPRASATH"
              size={54}
              colorVariant="gold"
              ringColor="#2BD67B"
            />
            <Text style={styles.seatLabel}>YOU · HOST</Text>
          </View>

          {/* West Seat (Arun) */}
          <View style={[styles.seatSlot, styles.seatWest]}>
            <PlayerAvatar
              name="Arun"
              size={54}
              colorVariant="emerald"
              ringColor="#E9B949"
            />
            <Text style={styles.seatLabel}>ARUN</Text>
          </View>

          {/* East Seat (+) */}
          <View style={[styles.seatSlot, styles.seatEast]}>
            <View style={[styles.dashedAddSlot, styles.dashedGold]}>
              <Text style={[styles.addSlotPlus, styles.goldPlus]}>+</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Player Mode Tabs */}
      <View style={styles.modeTabsRow}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === '2' && styles.modeTabActive]}
          onPress={() => handleSelectTab('2')}
        >
          <Text style={[styles.modeTabText, activeTab === '2' && styles.modeTabTextActive]}>
            2
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeTab === '3' && styles.modeTabActive]}
          onPress={() => handleSelectTab('3')}
        >
          <Text style={[styles.modeTabText, activeTab === '3' && styles.modeTabTextActive]}>
            3
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeTab === '4' && styles.modeTabGoldActive]}
          onPress={() => handleSelectTab('4')}
        >
          <Text
            style={[
              styles.modeTabText,
              activeTab === '4' && styles.modeTabGoldTextActive,
            ]}
          >
            4 · TEAMS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start Game Button */}
      <View style={styles.footer}>
        <Button
          title="START GAME"
          variant="primary"
          onPress={handleStartMatch}
          style={styles.startBtn}
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
    paddingVertical: 24,
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
    marginBottom: 12,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  codeTile: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5ECD2',
    borderWidth: 2,
    borderColor: '#C7B99A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    color: '#261B04',
    fontSize: 22,
    fontWeight: '900',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
  },
  tableCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 22,
    borderColor: '#7A431C',
    borderWidth: 4,
    backgroundColor: '#0E4A33',
  },
  tableCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTableInfo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderWidth: 1.5,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCountText: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
  },
  centerTeamsText: {
    color: '#2BD67B',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  seatSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatNorth: {
    top: 6,
  },
  seatSouth: {
    bottom: -6,
  },
  seatWest: {
    left: 6,
  },
  seatEast: {
    right: 6,
  },
  dashedAddSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedGold: {
    borderColor: '#E9B949',
  },
  addSlotPlus: {
    color: '#2BD67B',
    fontSize: 24,
    fontWeight: '900',
  },
  goldPlus: {
    color: '#E9B949',
  },
  seatLabel: {
    color: '#F5ECD2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  modeTab: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    borderColor: '#2BD67B',
  },
  modeTabGoldActive: {
    backgroundColor: '#E9B949',
    borderColor: '#F7D070',
    borderBottomWidth: 4,
    borderBottomColor: '#A57E24',
  },
  modeTabText: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
  },
  modeTabTextActive: {
    color: '#2BD67B',
  },
  modeTabGoldTextActive: {
    color: '#261B04',
  },
  footer: {
    marginTop: 'auto',
  },
  startBtn: {
    width: '100%',
  },
});
