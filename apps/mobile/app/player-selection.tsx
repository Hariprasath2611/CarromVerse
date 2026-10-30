import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { GameMode, PlayerCount } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

export default function PlayerSelectionScreen() {
  const router = useRouter();
  const { selectedMode, playerCount, setGameMode, setPlayerCount, players } =
    useGameSetupStore();

  const handleSelectCount = (count: PlayerCount) => {
    setPlayerCount(count);
  };

  const isTeamMode = selectedMode === 'four_player_team';

  const handleToggleTeamMode = (team: boolean) => {
    if (team) {
      setGameMode('four_player_team');
    } else {
      setGameMode('four_player_individual');
    }
  };

  // Resolve seats
  const southPlayer = players.find((p) => p.position === 'bottom');
  const northPlayer = players.find((p) => p.position === 'top');
  const eastPlayer = players.find((p) => p.position === 'right');
  const westPlayer = players.find((p) => p.position === 'left');

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>STEP 2 OF 3</Text>
          <Text style={styles.headerTitle}>Player Count & Seating</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Select how many players will compete on this device. The visual seating layout reflects your table positions.
      </Text>

      {/* Player Count Selector Chips */}
      <View style={styles.chipsRow}>
        {([2, 3, 4] as PlayerCount[]).map((count) => (
          <TouchableOpacity
            key={count}
            style={[
              styles.countChip,
              playerCount === count && styles.countChipActive,
            ]}
            onPress={() => handleSelectCount(count)}
          >
            <Text
              style={[
                styles.chipText,
                playerCount === count && styles.chipTextActive,
              ]}
            >
              {count} Players
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4-Player Team Sub-option */}
      {playerCount === 4 && (
        <View style={styles.teamSelectorRow}>
          <TouchableOpacity
            style={[
              styles.teamOption,
              !isTeamMode && styles.teamOptionActive,
            ]}
            onPress={() => handleToggleTeamMode(false)}
          >
            <Text
              style={[
                styles.teamOptionText,
                !isTeamMode && styles.teamOptionTextActive,
              ]}
            >
              👤 4-Way Individual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.teamOption,
              isTeamMode && styles.teamOptionActive,
            ]}
            onPress={() => handleToggleTeamMode(true)}
          >
            <Text
              style={[
                styles.teamOptionText,
                isTeamMode && styles.teamOptionTextActive,
              ]}
            >
              🤝 2 vs 2 Teams
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Visual Seating Diagram around the Board */}
      <GameCard elevated style={styles.boardDiagramCard}>
        <Text style={styles.diagramTitle}>TABLE SEATING LAYOUT</Text>

        {/* North Seat (Top) */}
        <View style={styles.northSeat}>
          {northPlayer ? (
            <View style={[styles.seatBox, northPlayer.teamId === 'team_a' && styles.teamABorder]}>
              <Text style={styles.seatAvatar}>{northPlayer.avatarUrl || '👑'}</Text>
              <Text style={styles.seatName} numberOfLines={1}>
                {northPlayer.name}
              </Text>
              <Text style={styles.seatPos}>North (Top)</Text>
            </View>
          ) : (
            <View style={styles.emptySeatBox}>
              <Text style={styles.emptySeatText}>Empty</Text>
            </View>
          )}
        </View>

        {/* Middle Row: West Seat + Mini Board + East Seat */}
        <View style={styles.middleRow}>
          {/* West Seat (Left) */}
          <View style={styles.lateralSeat}>
            {westPlayer ? (
              <View style={[styles.seatBox, westPlayer.teamId === 'team_b' && styles.teamBBorder]}>
                <Text style={styles.seatAvatar}>{westPlayer.avatarUrl || '🦁'}</Text>
                <Text style={styles.seatName} numberOfLines={1}>
                  {westPlayer.name}
                </Text>
                <Text style={styles.seatPos}>West</Text>
              </View>
            ) : (
              <View style={styles.emptySeatBox}>
                <Text style={styles.emptySeatText}>Empty</Text>
              </View>
            )}
          </View>

          {/* Center Graphic Board */}
          <View style={styles.miniBoardGraphic}>
            {/* Pockets */}
            <View style={[styles.cornerPocket, styles.pocketTL]} />
            <View style={[styles.cornerPocket, styles.pocketTR]} />
            <View style={[styles.cornerPocket, styles.pocketBL]} />
            <View style={[styles.cornerPocket, styles.pocketBR]} />

            {/* Baselines */}
            <View style={styles.baselineTop} />
            <View style={styles.baselineBottom} />
            <View style={styles.baselineLeft} />
            <View style={styles.baselineRight} />

            {/* Center Circle */}
            <View style={styles.boardCenterCircle}>
              <View style={styles.boardCenterRedDot} />
            </View>
          </View>

          {/* East Seat (Right) */}
          <View style={styles.lateralSeat}>
            {eastPlayer ? (
              <View style={[styles.seatBox, eastPlayer.teamId === 'team_b' && styles.teamBBorder]}>
                <Text style={styles.seatAvatar}>{eastPlayer.avatarUrl || '🐯'}</Text>
                <Text style={styles.seatName} numberOfLines={1}>
                  {eastPlayer.name}
                </Text>
                <Text style={styles.seatPos}>East</Text>
              </View>
            ) : (
              <View style={styles.emptySeatBox}>
                <Text style={styles.emptySeatText}>Empty</Text>
              </View>
            )}
          </View>
        </View>

        {/* South Seat (Bottom) */}
        <View style={styles.southSeat}>
          {southPlayer ? (
            <View style={[styles.seatBox, southPlayer.teamId === 'team_a' && styles.teamABorder]}>
              <Text style={styles.seatAvatar}>{southPlayer.avatarUrl || '👑'}</Text>
              <Text style={styles.seatName} numberOfLines={1}>
                {southPlayer.name}
              </Text>
              <Text style={styles.seatPos}>South (Bottom)</Text>
            </View>
          ) : (
            <View style={styles.emptySeatBox}>
              <Text style={styles.emptySeatText}>Empty</Text>
            </View>
          )}
        </View>
      </GameCard>

      {/* Info Tip */}
      <GameCard style={styles.infoCard}>
        <Text style={styles.infoTitle}>📱 Pass & Play Guidance</Text>
        <Text style={styles.infoDesc}>
          Players take turns shooting from their assigned edge of the board. The on-screen striker automatically aligns to each player's baseline when their turn begins.
        </Text>
      </GameCard>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Next: Configure Players"
          subtitle="Customize names, avatars & match rules"
          onPress={() => router.push('/game-config')}
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
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  countChip: {
    flex: 0.31,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
  },
  countChipActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  chipText: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  chipTextActive: {
    color: THEME.colors.accent,
  },
  teamSelectorRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginBottom: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  teamOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  teamOptionActive: {
    backgroundColor: THEME.colors.primary,
  },
  teamOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  teamOptionTextActive: {
    color: '#FFFFFF',
  },
  boardDiagramCard: {
    padding: THEME.spacing.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  diagramTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  northSeat: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  southSeat: {
    alignItems: 'center',
    marginTop: THEME.spacing.xs,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  lateralSeat: {
    flex: 1,
    alignItems: 'center',
  },
  seatBox: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 84,
  },
  teamABorder: {
    borderColor: THEME.colors.accent,
  },
  teamBBorder: {
    borderColor: THEME.colors.goldBright,
  },
  emptySeatBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 84,
  },
  emptySeatText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  seatAvatar: {
    fontSize: 18,
  },
  seatName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  seatPos: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  miniBoardGraphic: {
    width: 140,
    height: 140,
    backgroundColor: '#8B4513',
    borderColor: '#5C2C16',
    borderWidth: 8,
    borderRadius: THEME.borderRadius.md,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cornerPocket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F1A15',
    borderColor: '#3D1D0E',
    borderWidth: 2,
  },
  pocketTL: { top: 2, left: 2 },
  pocketTR: { top: 2, right: 2 },
  pocketBL: { bottom: 2, left: 2 },
  pocketBR: { bottom: 2, right: 2 },
  baselineTop: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#3D1D0E',
  },
  baselineBottom: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#3D1D0E',
  },
  baselineLeft: {
    position: 'absolute',
    left: 18,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#3D1D0E',
  },
  baselineRight: {
    position: 'absolute',
    right: 18,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#3D1D0E',
  },
  boardCenterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: '#3D1D0E',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardCenterRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  infoCard: {
    padding: THEME.spacing.sm,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  infoTitle: {
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    marginTop: THEME.spacing.xs,
  },
});

