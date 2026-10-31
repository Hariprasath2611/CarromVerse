import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BoardPreview, Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { THEME } from '../src/constants/theme';

interface BoardOption {
  id: 'classic' | 'emerald' | 'mahogany';
  title: string;
  subtitle: string;
  surfaceColor: string;
}

const BOARDS: BoardOption[] = [
  {
    id: 'classic',
    title: 'CLASSIC WOOD',
    subtitle: 'Official Tournament Board',
    surfaceColor: '#F5ECD2',
  },
  {
    id: 'emerald',
    title: 'EMERALD NIGHT',
    subtitle: 'Club Edition',
    surfaceColor: '#0F5A3E',
  },
  {
    id: 'mahogany',
    title: 'MIDNIGHT MAHOGANY',
    subtitle: 'Dark Polished Wood',
    surfaceColor: '#1A2922',
  },
];

const TARGET_POINTS_OPTIONS = [15, 25, 29];
const TURN_TIMER_OPTIONS = [
  { label: '15s (Blitz)', value: 15 },
  { label: '25s (Standard)', value: 25 },
  { label: '35s (Relaxed)', value: 35 },
  { label: 'Unlimited', value: 0 },
];

export default function GameConfigScreen() {
  const router = useRouter();
  const {
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
    handoverConfirmationEnabled,
    soundEnabled,
    musicEnabled,
    setBoardTheme,
    setTargetPoints,
    setTurnTimeLimitSec,
    setHandoverConfirmationEnabled,
    setSoundEnabled,
    setMusicEnabled,
  } = useGameSetupStore();

  const handleContinue = () => {
    router.push('/lobby');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>BOARD & MATCH SETTINGS</Text>
        <Text style={styles.subtitle}>Configure board theme and match rules</Text>
      </View>

      {/* HERO BOARD PREVIEW */}
      <View style={styles.heroBoardBox}>
        <BoardPreview size={180} theme={boardTheme} />
      </View>

      {/* BOARD SELECTION SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CHOOSE BOARD THEME</Text>
        <View style={styles.boardList}>
          {BOARDS.map((b) => {
            const isSelected = boardTheme === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.85}
                onPress={() => setBoardTheme(b.id)}
              >
                <Card
                  style={[
                    styles.boardCard,
                    isSelected && styles.boardCardSelected,
                  ]}
                >
                  <View style={styles.thumbWrapper}>
                    <BoardPreview size={44} theme={b.id} />
                  </View>
                  <View style={styles.boardInfo}>
                    <Text style={styles.boardTitle}>{b.title}</Text>
                    <Text
                      style={[
                        styles.boardSubtitle,
                        isSelected && styles.boardSubtitleActive,
                      ]}
                    >
                      {isSelected ? '✓ SELECTED' : b.subtitle}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* TARGET POINTS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TARGET POINTS TO WIN</Text>
        <View style={styles.chipsRow}>
          {TARGET_POINTS_OPTIONS.map((pts) => {
            const isSelected = targetPoints === pts;
            return (
              <TouchableOpacity
                key={pts}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setTargetPoints(pts)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {pts} Points
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* TURN TIMER SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TURN TIME LIMIT</Text>
        <View style={styles.chipsRow}>
          {TURN_TIMER_OPTIONS.map((timer) => {
            const isSelected = turnTimeLimitSec === timer.value;
            return (
              <TouchableOpacity
                key={timer.value}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setTurnTimeLimitSec(timer.value)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {timer.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* PASS & PLAY SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PASS & PLAY BEHAVIOR</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Turn Handover Prompt</Text>
              <Text style={styles.settingDesc}>
                Show confirmation modal when passing phone to next player
              </Text>
            </View>
            <Switch
              value={handoverConfirmationEnabled}
              onValueChange={setHandoverConfirmationEnabled}
              trackColor={{ false: 'rgba(245, 236, 210, 0.2)', true: '#2BD67B' }}
              thumbColor={handoverConfirmationEnabled ? '#F5ECD2' : '#888888'}
            />
          </View>
        </Card>
      </View>

      {/* AUDIO SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AUDIO & FX</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDesc}>Board strikes, pockets and rebound audio</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: 'rgba(245, 236, 210, 0.2)', true: '#2BD67B' }}
              thumbColor={soundEnabled ? '#F5ECD2' : '#888888'}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Background Lounge Music</Text>
              <Text style={styles.settingDesc}>Ambient club soundtrack</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: 'rgba(245, 236, 210, 0.2)', true: '#2BD67B' }}
              thumbColor={musicEnabled ? '#F5ECD2' : '#888888'}
            />
          </View>
        </Card>
      </View>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="PROCEED TO LOBBY"
          variant="primary"
          onPress={handleContinue}
          style={styles.selectBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
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
    marginBottom: 4,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  heroBoardBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  boardList: {
    gap: 8,
  },
  boardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    gap: 12,
    backgroundColor: '#0E4A33',
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
  },
  boardCardSelected: {
    borderColor: '#2BD67B',
    borderWidth: 2,
    backgroundColor: '#11573C',
  },
  thumbWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  boardSubtitle: {
    color: '#9FD8B8',
    fontSize: 11,
  },
  boardSubtitleActive: {
    color: '#2BD67B',
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#11573C',
    borderColor: '#2BD67B',
  },
  chipText: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#2BD67B',
    fontWeight: '900',
  },
  settingCard: {
    backgroundColor: '#0E4A33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    padding: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 214, 123, 0.15)',
    marginTop: 8,
    paddingTop: 10,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  settingDesc: {
    color: '#9FD8B8',
    fontSize: 11,
  },
  footer: {
    marginTop: 8,
    paddingTop: 4,
  },
  selectBtn: {
    width: '100%',
  },
});
