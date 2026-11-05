import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer } from '../../src/components';
import { BOT_PERSONALITIES, BotDifficulty } from '@carromverse/bot-ai';
import { useGameSetupStore } from '../../src/store/gameSetupStore';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { AudioManager } from '../../src/services/audio/AudioManager';

export default function PracticeDifficultyScreen() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('MEDIUM');
  const { setupPracticeMatch } = useGameSetupStore();
  const profile = useUserStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const playerName = profile?.username || user?.displayName || 'Player 1';
  const botInfo = BOT_PERSONALITIES[selectedDifficulty];

  const handleSelectDifficulty = (diff: BotDifficulty) => {
    setSelectedDifficulty(diff);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.6);
  };

  const handleContinue = () => {
    setupPracticeMatch(selectedDifficulty, playerName, '👑', 'white');
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.8);
    router.push('/practice/config');
  };

  const handleViewStats = () => {
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.6);
    router.push('/practice/stats');
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
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statsButton}
          onPress={handleViewStats}
          activeOpacity={0.8}
        >
          <Text style={styles.statsButtonText}>📊 STATS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.titleText}>AI PRACTICE MODE</Text>
        <Text style={styles.subtitleText}>
          Sharpen your skills against intelligent bots running actual physics and carrom rules
        </Text>
      </View>

      {/* DIFFICULTY SELECTION CARDS */}
      <View style={styles.cardsContainer}>
        {/* EASY BOT */}
        <TouchableOpacity
          style={[
            styles.difficultyCard,
            selectedDifficulty === 'EASY' && styles.difficultyCardActive,
          ]}
          onPress={() => handleSelectDifficulty('EASY')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>{BOT_PERSONALITIES.EASY.avatar}</Text>
            </View>
            <View style={styles.cardTitleBox}>
              <View style={styles.nameRow}>
                <Text style={styles.botNameText}>{BOT_PERSONALITIES.EASY.name}</Text>
                <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.badgeText}>EASY</Text>
                </View>
              </View>
              <Text style={styles.botTitleText}>{BOT_PERSONALITIES.EASY.title}</Text>
            </View>
          </View>
          <Text style={styles.botDescText}>{BOT_PERSONALITIES.EASY.description}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Direct Shots: <Text style={styles.statVal}>High</Text></Text>
            <Text style={styles.statLabel}>Precision: <Text style={styles.statVal}>Casual</Text></Text>
          </View>
        </TouchableOpacity>

        {/* MEDIUM BOT */}
        <TouchableOpacity
          style={[
            styles.difficultyCard,
            selectedDifficulty === 'MEDIUM' && styles.difficultyCardActive,
          ]}
          onPress={() => handleSelectDifficulty('MEDIUM')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>{BOT_PERSONALITIES.MEDIUM.avatar}</Text>
            </View>
            <View style={styles.cardTitleBox}>
              <View style={styles.nameRow}>
                <Text style={styles.botNameText}>{BOT_PERSONALITIES.MEDIUM.name}</Text>
                <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.badgeText}>MEDIUM</Text>
                </View>
              </View>
              <Text style={styles.botTitleText}>{BOT_PERSONALITIES.MEDIUM.title}</Text>
            </View>
          </View>
          <Text style={styles.botDescText}>{BOT_PERSONALITIES.MEDIUM.description}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Angle Cuts: <Text style={styles.statVal}>Accurate</Text></Text>
            <Text style={styles.statLabel}>Queen Cover: <Text style={styles.statVal}>Smart</Text></Text>
          </View>
        </TouchableOpacity>

        {/* HARD BOT */}
        <TouchableOpacity
          style={[
            styles.difficultyCard,
            selectedDifficulty === 'HARD' && styles.difficultyCardActive,
          ]}
          onPress={() => handleSelectDifficulty('HARD')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>{BOT_PERSONALITIES.HARD.avatar}</Text>
            </View>
            <View style={styles.cardTitleBox}>
              <View style={styles.nameRow}>
                <Text style={styles.botNameText}>{BOT_PERSONALITIES.HARD.name}</Text>
                <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.badgeText}>HARD</Text>
                </View>
              </View>
              <Text style={styles.botTitleText}>{BOT_PERSONALITIES.HARD.title}</Text>
            </View>
          </View>
          <Text style={styles.botDescText}>{BOT_PERSONALITIES.HARD.description}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Ghost Ball: <Text style={styles.statVal}>Surgical</Text></Text>
            <Text style={styles.statLabel}>Foul Risk: <Text style={styles.statVal}>Zero</Text></Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* BOT PROFILE SUMMARY BANNER */}
      <View style={styles.profileSummaryBanner}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryTitle}>Selected Opponent</Text>
          <Text style={styles.summaryName}>{botInfo.name}</Text>
          <Text style={styles.summaryHint}>
            {botInfo.difficulty === 'HARD'
              ? 'Evaluates 80+ candidates with near-laser precision'
              : botInfo.difficulty === 'MEDIUM'
                ? 'Balanced candidate solver with strategic queen cover'
                : 'Takes direct opportunities with forgiving misses'}
          </Text>
        </View>
        <Text style={styles.summaryEmoji}>{botInfo.avatar}</Text>
      </View>

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomActions}>
        <Button
          title="CONFIGURE MATCH →"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueButton}
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
  statsButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderWidth: 1,
    borderColor: '#2BD67B',
  },
  statsButtonText: {
    color: '#2BD67B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  difficultyCard: {
    backgroundColor: '#0E4A33',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(43, 214, 123, 0.20)',
  },
  difficultyCardActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#125A3E',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 216, 74, 0.3)',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  cardTitleBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botNameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  botTitleText: {
    color: '#FFD84A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  botDescText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
  },
  statVal: {
    color: '#2BD67B',
    fontWeight: '700',
  },
  profileSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 216, 74, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 74, 0.25)',
    marginBottom: 20,
  },
  summaryLeft: {
    flex: 1,
    marginRight: 12,
  },
  summaryTitle: {
    color: '#FFD84A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryHint: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 12,
    marginTop: 3,
  },
  summaryEmoji: {
    fontSize: 36,
  },
  bottomActions: {
    marginTop: 4,
  },
  continueButton: {
    height: 52,
  },
});
