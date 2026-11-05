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
import { GameMode } from '@carromverse/shared-types';
import {
  Button,
  Card,
  Header,
  Input,
  LoadingOverlay,
  ScreenContainer,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useMultiplayerRoomStore } from '../../src/store/multiplayerRoomStore';
import { THEME } from '../../src/constants/theme';

interface ModeOption {
  mode: GameMode;
  title: string;
  desc: string;
  playersCount: number;
}

const GAME_MODES: ModeOption[] = [
  {
    mode: 'two_player_individual',
    title: '2 Players · 1v1 Classic',
    desc: 'Head-to-head match with White vs Black pieces',
    playersCount: 2,
  },
  {
    mode: 'three_player_individual',
    title: '3 Players · Points Carrom',
    desc: 'High-score points match across 3 player positions',
    playersCount: 3,
  },
  {
    mode: 'four_player_individual',
    title: '4 Players · Free For All',
    desc: 'Four player individual free-for-all showdown',
    playersCount: 4,
  },
  {
    mode: 'four_player_team',
    title: '4 Players · 2v2 Team Match',
    desc: 'Cooperative doubles (North & South vs East & West)',
    playersCount: 4,
  },
];

export default function CreateRoomScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { createPrivateRoom, isLoading } = useMultiplayerRoomStore();

  const [selectedMode, setSelectedMode] = useState<GameMode>('two_player_individual');
  const [targetScore, setTargetScore] = useState<number>(25);
  const [turnTimerSec, setTurnTimerSec] = useState<number>(25);
  const [boardTheme, setBoardTheme] = useState<string>('classic');

  // Password protection toggle & value
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  // Team names for 2v2
  const [teamAName, setTeamAName] = useState('Team Emerald');
  const [teamBName, setTeamBName] = useState('Team Gold');

  const handleCreate = async () => {
    if (usePassword && (!password || password.trim().length < 3)) {
      Alert.alert('Password Required', 'Please enter a password with at least 3 characters, or disable password protection.');
      return;
    }

    try {
      await createPrivateRoom(
        {
          gameMode: selectedMode,
          targetScore,
          turnTimeLimitSeconds: turnTimerSec,
          boardTheme,
          password: usePassword ? password.trim() : undefined,
          teamAName: selectedMode === 'four_player_team' ? teamAName.trim() : undefined,
          teamBName: selectedMode === 'four_player_team' ? teamBName.trim() : undefined,
        },
        profile
      );

      router.replace('/multiplayer/room');
    } catch (err: any) {
      Alert.alert('Room Creation Failed', err?.message || 'Could not create private room. Please try again.');
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Creating private room..." />

      <Header title="CREATE PRIVATE ROOM" showBack />

      {/* 1. Game Mode Selection */}
      <Text style={styles.sectionHeader}>SELECT GAME MODE</Text>
      <View style={styles.modesContainer}>
        {GAME_MODES.map((item) => {
          const isSelected = selectedMode === item.mode;
          return (
            <TouchableOpacity
              key={item.mode}
              style={[styles.modeCard, isSelected && styles.modeCardSelected]}
              activeOpacity={0.8}
              onPress={() => setSelectedMode(item.mode)}
            >
              <View style={styles.modeRow}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.modeTextContainer}>
                  <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                    {item.title}
                  </Text>
                  <Text style={styles.modeDesc}>{item.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Target Score */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>TARGET SCORE</Text>
        <View style={styles.pillRow}>
          {[25, 29, 50].map((pts) => {
            const isSelected = targetScore === pts;
            return (
              <TouchableOpacity
                key={pts}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setTargetScore(pts)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {pts} Points
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 3. Turn Time Limit */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>TURN TIMER</Text>
        <View style={styles.pillRow}>
          {[15, 25, 45].map((sec) => {
            const isSelected = turnTimerSec === sec;
            return (
              <TouchableOpacity
                key={sec}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setTurnTimerSec(sec)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {sec} Seconds
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 4. Board Theme */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsLabel}>BOARD THEME</Text>
        <View style={styles.pillRow}>
          {['classic', 'emerald', 'rosewood'].map((th) => {
            const isSelected = boardTheme === th;
            return (
              <TouchableOpacity
                key={th}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setBoardTheme(th)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {th.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 5. 2v2 Team Names Configuration */}
      {selectedMode === 'four_player_team' && (
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsLabel}>TEAM NAMES (2v2 DOUBLES)</Text>
          <Input
            label="Team A (North & South)"
            value={teamAName}
            onChangeText={setTeamAName}
            maxLength={20}
          />
          <Input
            label="Team B (East & West)"
            value={teamBName}
            onChangeText={setTeamBName}
            maxLength={20}
          />
        </Card>
      )}

      {/* 6. Optional Password */}
      <Card style={styles.settingsCard}>
        <View style={styles.passwordToggleRow}>
          <Text style={styles.settingsLabel}>ROOM PASSWORD (OPTIONAL)</Text>
          <TouchableOpacity
            style={[styles.togglePill, usePassword && styles.togglePillActive]}
            onPress={() => setUsePassword(!usePassword)}
          >
            <Text style={[styles.toggleText, usePassword && styles.toggleTextActive]}>
              {usePassword ? 'ENABLED' : 'DISABLED'}
            </Text>
          </TouchableOpacity>
        </View>

        {usePassword && (
          <Input
            placeholder="Enter room password (min 3 chars)"
            value={password}
            onChangeText={setPassword}
            maxLength={20}
            secureTextEntry
            autoCapitalize="none"
            containerStyle={styles.passwordInputContainer}
          />
        )}
      </Card>

      {/* Submit Button */}
      <View style={styles.btnContainer}>
        <Button
          title="CREATE ROOM & OPEN LOBBY"
          variant="primary"
          onPress={handleCreate}
          disabled={isLoading}
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
  },
  modesContainer: {
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  modeCardSelected: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2BD67B',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2BD67B',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    color: '#F5ECD2',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  modeTitleSelected: {
    color: '#2BD67B',
  },
  modeDesc: {
    color: '#9FD8B8',
    fontSize: 12,
  },
  settingsCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  settingsLabel: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  pillText: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '700',
  },
  pillTextSelected: {
    color: '#F5ECD2',
    fontWeight: '900',
  },
  passwordToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1,
  },
  togglePillActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  toggleText: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#2BD67B',
  },
  passwordInputContainer: {
    marginTop: 12,
    marginBottom: 0,
  },
  btnContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});

