import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameModeCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { GameMode } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

interface ModeOption {
  mode: GameMode;
  title: string;
  subtitle: string;
  description: string;
  playerCount: string;
  icon: string;
}

const MODES: ModeOption[] = [
  {
    mode: 'two_player_individual',
    title: 'Two Players – Individual',
    subtitle: 'Classic 1 vs 1 Head-to-Head Duel',
    description:
      'Players sit opposite each other. White vs Black, pocket your 9 carrom men plus the Red Queen with cover.',
    playerCount: '2 Players',
    icon: '⚔️',
  },
  {
    mode: 'three_player_individual',
    title: 'Three Players – Individual',
    subtitle: '3-Way Free-for-All Points Battle',
    description:
      '3 players occupy 3 sides of the board. All coins are neutral: White is 1 pt, Black is 2 pts, Red Queen is 3 pts.',
    playerCount: '3 Players',
    icon: '🔺',
  },
  {
    mode: 'four_player_individual',
    title: 'Four Players – Individual',
    subtitle: '4-Way Points Race Showdown',
    description:
      'Each player commands one edge of the board. Race to pocket highest value coins before the board is cleared.',
    playerCount: '4 Players',
    icon: '👑',
  },
  {
    mode: 'four_player_team',
    title: 'Four Players – Team (2 vs 2)',
    subtitle: 'Partnership Carrom Strategy',
    description:
      'Partners sit opposite each other (North/South vs East/West) sharing scores and white/black piece assignments.',
    playerCount: '2 vs 2 Teams',
    icon: '🛡️',
  },
];

export default function GameModeScreen() {
  const router = useRouter();
  const { selectedMode, setGameMode } = useGameSetupStore();

  const handleSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleContinue = () => {
    router.push('/player-selection');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>STEP 1 OF 3</Text>
          <Text style={styles.headerTitle}>Select Game Mode</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Select your offline match format. All players participate smoothly on this shared device.
      </Text>

      {/* Mode Selection Cards */}
      <View style={styles.modeCardsList}>
        {MODES.map((item) => (
          <GameModeCard
            key={item.mode}
            mode={item.mode}
            title={item.title}
            subtitle={item.subtitle}
            description={item.description}
            playerCount={item.playerCount}
            icon={item.icon}
            isSelected={selectedMode === item.mode}
            onSelect={() => handleSelect(item.mode)}
          />
        ))}
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Continue to Player Setup"
          subtitle="Configure player seats & avatars"
          onPress={handleContinue}
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
  modeCardsList: {
    marginBottom: THEME.spacing.md,
  },
  footer: {
    marginTop: THEME.spacing.xs,
    paddingTop: THEME.spacing.sm,
  },
});
