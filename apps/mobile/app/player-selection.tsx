import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  PrimaryButton,
  ScreenContainer,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { PlayerCount } from '@carromverse/shared-types';
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
          <Text style={styles.backArrow}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>STEP 2 OF 3</Text>
          <Text style={styles.headerTitle}>PLAYER COUNT & SEATING</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Select how many players will compete on this device. The visual seating layout reflects your physical positions.
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
              {count} PLAYERS
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
            <View style={[styles.seatBox, northPlayer.teamId === 'team_a' ? styles.teamABorder : styles.seatDefaultBorder]}>
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
              <View style={[styles.seatBox, westPlayer.teamId === 'team_b' ? styles.teamBBorder : styles.seatDefaultBorder]}>
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
            {/* Wooden frame & Brass inner border */}
            <View style={styles.brassInner}>
              <View style={styles.creamFace}>
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

                {/* Center Circle with Red Queen */}
                <View style={styles.boardCenterCircle}>
                  <View style={styles.boardCenterRedDot} />
                </View>
              </View>
            </View>
          </View>

          {/* East Seat (Right) */}
          <View style={styles.lateralSeat}>
            {eastPlayer ? (
              <View style={[styles.seatBox, eastPlayer.teamId === 'team_b' ? styles.teamBBorder : styles.seatDefaultBorder]}>
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
            <View style={[styles.seatBox, southPlayer.teamId === 'team_a' ? styles.teamABorder : styles.seatDefaultBorder]}>
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
          title="NEXT: CONFIGURE PLAYERS"
          subtitle="Customize names, colors & match rules"
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 16,
    color: THEME.colors.brass,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerStep: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  instruction: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
    marginBottom: 16,
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countChip: {
    flex: 0.31,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 16,
  },
  countChipActive: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125A3F',
    ...THEME.shadows.glowEmerald,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: THEME.colors.neonEmerald,
  },
  teamSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#07261C',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderColor: '#1B7050',
    borderWidth: 1.5,
  },
  teamOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  teamOptionActive: {
    backgroundColor: THEME.colors.neonEmerald,
  },
  teamOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  teamOptionTextActive: {
    color: '#07261C',
  },
  boardDiagramCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  diagramTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  northSeat: {
    alignItems: 'center',
    marginBottom: 8,
  },
  southSeat: {
    alignItems: 'center',
    marginTop: 8,
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
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 88,
  },
  seatDefaultBorder: {
    borderColor: '#1B7050',
  },
  teamABorder: {
    borderColor: THEME.colors.neonEmerald,
  },
  teamBBorder: {
    borderColor: THEME.colors.brass,
  },
  emptySeatBox: {
    backgroundColor: 'rgba(7, 38, 28, 0.4)',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 88,
  },
  emptySeatText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  seatAvatar: {
    fontSize: 20,
  },
  seatName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginTop: 2,
  },
  seatPos: {
    fontSize: 9,
    color: THEME.colors.mutedMint,
  },
  miniBoardGraphic: {
    width: 140,
    height: 140,
    backgroundColor: '#7A431C',
    borderColor: '#4D270E',
    borderWidth: 6,
    borderRadius: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  brassInner: {
    width: 122,
    height: 122,
    borderWidth: 1.5,
    borderColor: '#E9B949',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creamFace: {
    width: 114,
    height: 114,
    backgroundColor: '#F5ECD2',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  cornerPocket: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0B0F0D',
    borderColor: '#1F2937',
    borderWidth: 1,
  },
  pocketTL: { top: 2, left: 2 },
  pocketTR: { top: 2, right: 2 },
  pocketBL: { bottom: 2, left: 2 },
  pocketBR: { bottom: 2, right: 2 },
  baselineTop: {
    position: 'absolute',
    top: 16,
    left: 18,
    right: 18,
    height: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.4)',
  },
  baselineBottom: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
    height: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.4)',
  },
  baselineLeft: {
    position: 'absolute',
    left: 16,
    top: 18,
    bottom: 18,
    width: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.4)',
  },
  baselineRight: {
    position: 'absolute',
    right: 16,
    top: 18,
    bottom: 18,
    width: 1.5,
    backgroundColor: 'rgba(11, 15, 13, 0.4)',
  },
  boardCenterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardCenterRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E23B5A',
  },
  infoCard: {
    padding: 14,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    marginBottom: 3,
  },
  infoDesc: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    lineHeight: 18,
  },
  footer: {
    marginTop: 4,
  },
});
