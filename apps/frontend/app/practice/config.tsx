import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer } from '../../src/components';
import { useGameSetupStore } from '../../src/store/gameSetupStore';
import { BOT_PERSONALITIES } from '@carromverse/bot-ai';
import { AudioManager } from '../../src/services/audio/AudioManager';

export default function PracticeConfigScreen() {
  const router = useRouter();
  const {
    boardTheme,
    setBoardTheme,
    targetPoints,
    setTargetPoints,
    turnTimeLimitSec,
    setTurnTimeLimitSec,
    botDifficulty,
    players,
    setupPracticeMatch,
  } = useGameSetupStore();

  const [humanColor, setHumanColor] = useState<'white' | 'black'>('white');
  const botInfo = BOT_PERSONALITIES[botDifficulty || 'MEDIUM'];
  const humanPlayer = players.find((p) => p.type === 'human') || players[0];

  const handleSelectColor = (color: 'white' | 'black') => {
    setHumanColor(color);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
    setupPracticeMatch(
      botDifficulty,
      humanPlayer?.name || 'Player 1',
      humanPlayer?.avatarUrl || '👑',
      color
    );
  };

  const handleSelectTheme = (theme: 'classic' | 'emerald' | 'mahogany') => {
    setBoardTheme(theme);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
  };

  const handleSelectTarget = (points: number) => {
    setTargetPoints(points);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
  };

  const handleSelectTimer = (sec: number) => {
    setTurnTimeLimitSec(sec);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
  };

  const handleProceed = () => {
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.8);
    router.push('/practice/lobby');
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← DIFFICULTY</Text>
        </TouchableOpacity>

        <View style={styles.opponentPill}>
          <Text style={styles.opponentPillEmoji}>{botInfo.avatar}</Text>
          <Text style={styles.opponentPillName}>{botInfo.name}</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.titleText}>MATCH CONFIGURATION</Text>
        <Text style={styles.subtitleText}>
          Customize board rules, target points, and coin assignment for your practice match
        </Text>
      </View>

      {/* COIN ASSIGNMENT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>YOUR COIN COLOR</Text>
        <Text style={styles.sectionSubtitle}>
          White breaks first. Black shoots second.
        </Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionChip,
              humanColor === 'white' && styles.optionChipActive,
            ]}
            onPress={() => handleSelectColor('white')}
            activeOpacity={0.8}
          >
            <View style={[styles.coinDot, { backgroundColor: '#FFFFFF' }]} />
            <Text
              style={[
                styles.optionChipText,
                humanColor === 'white' && styles.optionChipTextActive,
              ]}
            >
              WHITE (First Turn)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionChip,
              humanColor === 'black' && styles.optionChipActive,
            ]}
            onPress={() => handleSelectColor('black')}
            activeOpacity={0.8}
          >
            <View style={[styles.coinDot, { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#666' }]} />
            <Text
              style={[
                styles.optionChipText,
                humanColor === 'black' && styles.optionChipTextActive,
              ]}
            >
              BLACK (Second Turn)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOARD THEME */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>BOARD THEME</Text>
        <View style={styles.optionsRow}>
          {(['classic', 'emerald', 'mahogany'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.optionChip,
                boardTheme === t && styles.optionChipActive,
              ]}
              onPress={() => handleSelectTheme(t)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionChipText,
                  boardTheme === t && styles.optionChipTextActive,
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TARGET POINTS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>TARGET POINTS</Text>
        <View style={styles.optionsRow}>
          {[25, 50, 115].map((pts) => (
            <TouchableOpacity
              key={pts}
              style={[
                styles.optionChip,
                targetPoints === pts && styles.optionChipActive,
              ]}
              onPress={() => handleSelectTarget(pts)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionChipText,
                  targetPoints === pts && styles.optionChipTextActive,
                ]}
              >
                {pts} PTS
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TURN TIMER */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>TURN TIME LIMIT</Text>
        <View style={styles.optionsRow}>
          {[15, 20, 30].map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[
                styles.optionChip,
                turnTimeLimitSec === sec && styles.optionChipActive,
              ]}
              onPress={() => handleSelectTimer(sec)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionChipText,
                  turnTimeLimitSec === sec && styles.optionChipTextActive,
                ]}
              >
                {sec}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* RULES RECAP */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>OFFICIAL RULES ACTIVE</Text>
        <Text style={styles.rulesItem}>• SGFI/ICF Tournament Standard</Text>
        <Text style={styles.rulesItem}>• Queen Value: 50 pts (Requires Cover)</Text>
        <Text style={styles.rulesItem}>• White: 20 pts • Black: 10 pts</Text>
        <Text style={styles.rulesItem}>• Striker scratch foul: Turn passes + penalty return</Text>
      </View>

      {/* PROCEED BUTTON */}
      <View style={styles.bottomActions}>
        <Button
          title="PROCEED TO LOBBY →"
          variant="primary"
          onPress={handleProceed}
          style={styles.proceedButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#07261C',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    color: '#2BD67B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  opponentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 74, 0.4)',
  },
  opponentPillEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  opponentPillName: {
    color: '#FFD84A',
    fontSize: 12,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#0E4A33',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.20)',
  },
  sectionTitle: {
    color: '#FFD84A',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionChip: {
    flex: 1,
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionChipActive: {
    borderColor: '#2BD67B',
    backgroundColor: 'rgba(43, 214, 123, 0.20)',
  },
  optionChipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  optionChipTextActive: {
    color: '#2BD67B',
    fontWeight: '800',
  },
  coinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  rulesCard: {
    backgroundColor: 'rgba(255, 216, 74, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 74, 0.25)',
    marginBottom: 20,
  },
  rulesTitle: {
    color: '#FFD84A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rulesItem: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
  bottomActions: {
    marginTop: 4,
  },
  proceedButton: {
    height: 52,
  },
});

