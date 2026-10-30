import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Input,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { PlayerSeat } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

const AVAILABLE_AVATARS = ['👑', '🐯', '🦅', '🦁', '⚡', '🔥', '🥷', '🎯'];

const BOARD_THEMES: Array<{ id: 'classic' | 'emerald' | 'mahogany'; name: string; color: string }> = [
  { id: 'classic', name: 'Classic Maple', color: '#D27D2D' },
  { id: 'emerald', name: 'Forest Emerald', color: '#064E3B' },
  { id: 'mahogany', name: 'Royal Mahogany', color: '#5C2C16' },
];

const TARGET_POINTS_OPTIONS = [25, 29, 50];
const TURN_TIMERS = [15, 25, 30];

export default function GameConfigScreen() {
  const router = useRouter();
  const {
    players,
    boardTheme,
    targetPoints,
    turnTimeLimitSec,
    updatePlayerName,
    updatePlayerAvatar,
    setBoardTheme,
    setTargetPoints,
    setTurnTimeLimitSec,
  } = useGameSetupStore();

  const handleProceed = () => {
    router.push('/lobby');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>STEP 3 OF 3</Text>
          <Text style={styles.headerTitle}>Match Configuration</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Personalize player identities, select your board surface, and establish match scoring rules.
      </Text>

      {/* PLAYER ROSTER SECTION */}
      <Text style={styles.sectionTitle}>PLAYER IDENTITIES & AVATARS</Text>
      {players.map((player) => (
        <GameCard key={player.id} elevated style={styles.playerCard}>
          <View style={styles.playerCardHeader}>
            <View style={styles.playerBadgeRow}>
              <View style={styles.seatBadge}>
                <Text style={styles.seatBadgeText}>
                  {player.position.toUpperCase()}
                </Text>
              </View>
              {player.teamId && (
                <View
                  style={[
                    styles.teamBadge,
                    player.teamId === 'team_a' ? styles.teamABadge : styles.teamBBadge,
                  ]}
                >
                  <Text style={styles.teamBadgeText}>
                    {player.teamId === 'team_a' ? 'TEAM A' : 'TEAM B'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.coinAssignment}>
              <Text style={styles.coinLabel}>Coins: </Text>
              <Text
                style={[
                  styles.coinValue,
                  player.assignedCoinType === 'white'
                    ? styles.coinWhite
                    : player.assignedCoinType === 'black'
                    ? styles.coinBlack
                    : styles.coinAny,
                ]}
              >
                {player.assignedCoinType.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Name Input */}
          <Text style={styles.inputLabel}>Player Name</Text>
          <TextInput
            style={styles.nameTextInput}
            value={player.name}
            onChangeText={(val) => updatePlayerName(player.seat, val)}
            placeholder="Enter Name"
            placeholderTextColor={THEME.colors.textMuted}
            maxLength={18}
          />

          {/* Avatar Selector Carousel */}
          <Text style={styles.avatarLabel}>Choose Avatar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarRow}
          >
            {AVAILABLE_AVATARS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.avatarChoice,
                  (player.avatarUrl || '👑') === emoji && styles.avatarChoiceActive,
                ]}
                onPress={() => updatePlayerAvatar(player.seat, emoji)}
              >
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </GameCard>
      ))}

      {/* BOARD THEME SECTION */}
      <Text style={styles.sectionTitle}>CARROM BOARD FINISH</Text>
      <View style={styles.boardThemeGrid}>
        {BOARD_THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeOption,
              boardTheme === theme.id && styles.themeOptionActive,
            ]}
            onPress={() => setBoardTheme(theme.id)}
          >
            <View style={[styles.themeSwatch, { backgroundColor: theme.color }]} />
            <Text
              style={[
                styles.themeName,
                boardTheme === theme.id && styles.themeNameActive,
              ]}
            >
              {theme.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MATCH SCORING RULES */}
      <Text style={styles.sectionTitle}>MATCH TARGET SCORE</Text>
      <View style={styles.rulesRow}>
        {TARGET_POINTS_OPTIONS.map((pts) => (
          <TouchableOpacity
            key={pts}
            style={[
              styles.ruleChip,
              targetPoints === pts && styles.ruleChipActive,
            ]}
            onPress={() => setTargetPoints(pts)}
          >
            <Text
              style={[
                styles.ruleChipText,
                targetPoints === pts && styles.ruleChipTextActive,
              ]}
            >
              {pts} Points
            </Text>
            <Text style={styles.ruleChipSub}>
              {pts === 25 ? 'Standard' : pts === 29 ? 'Championship' : 'Grand Final'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TURN TIMERS */}
      <Text style={styles.sectionTitle}>SHOT TIME LIMIT</Text>
      <View style={styles.rulesRow}>
        {TURN_TIMERS.map((sec) => (
          <TouchableOpacity
            key={sec}
            style={[
              styles.ruleChip,
              turnTimeLimitSec === sec && styles.ruleChipActive,
            ]}
            onPress={() => setTurnTimeLimitSec(sec)}
          >
            <Text
              style={[
                styles.ruleChipText,
                turnTimeLimitSec === sec && styles.ruleChipTextActive,
              ]}
            >
              {sec} Seconds
            </Text>
            <Text style={styles.ruleChipSub}>
              {sec === 15 ? 'Speed Blitz' : sec === 25 ? 'Recommended' : 'Relaxed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Proceed to Pre-Game Lobby"
          subtitle="Confirm seating and prepare the board"
          onPress={handleProceed}
          variant="emerald"
          size="large"
          icon="→"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: THEME.colors.textPrimary,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerStep: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  instruction: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  playerCard: {
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderColor: THEME.colors.border,
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  playerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatBadge: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
    marginRight: 6,
  },
  seatBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  teamABadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderColor: THEME.colors.accent,
    borderWidth: 1,
  },
  teamBBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: THEME.colors.goldBright,
    borderWidth: 1,
  },
  teamBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  coinAssignment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  coinValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  coinWhite: {
    color: '#FFFFFF',
  },
  coinBlack: {
    color: '#A0A0A0',
  },
  coinAny: {
    color: THEME.colors.accent,
  },
  inputLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  nameTextInput: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    color: THEME.colors.textPrimary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    fontSize: THEME.typography.fontSize.bodySm,
    marginBottom: THEME.spacing.sm,
  },
  avatarLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  avatarChoice: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarChoiceActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  boardThemeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  themeOption: {
    flex: 0.31,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    padding: 8,
    alignItems: 'center',
  },
  themeOptionActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  themeSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  themeNameActive: {
    color: THEME.colors.accent,
  },
  rulesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  ruleChip: {
    flex: 0.31,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ruleChipActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  ruleChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  ruleChipTextActive: {
    color: THEME.colors.accent,
  },
  ruleChipSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  footer: {
    marginTop: THEME.spacing.md,
  },
});

