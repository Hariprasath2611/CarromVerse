import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { PlayerCount, PlayerSeat } from '@carromverse/shared-types';
import {
  PREDEFINED_AVATARS,
  getSeatDirectionLabel,
} from '@carromverse/game-logic';
import { THEME } from '../src/constants/theme';

export default function PlayerSelectionScreen() {
  const router = useRouter();
  const {
    selectedMode,
    playerCount,
    players,
    teamAName,
    teamBName,
    recentNames,
    loadRecentNames,
    setGameMode,
    setPlayerCount,
    updatePlayerName,
    updatePlayerAvatar,
    togglePlayerReady,
    setTeamAName,
    setTeamBName,
    swapTeamPlayers,
    validateSetup,
    resetSetup,
  } = useGameSetupStore();

  const [activeAvatarPickerSeat, setActiveAvatarPickerSeat] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentNames();
  }, [loadRecentNames]);

  const isTeamMode = selectedMode === 'four_player_team';

  const handleSelectCount = (count: PlayerCount) => {
    setValidationError(null);
    setPlayerCount(count);
    if (count !== 4 && isTeamMode) {
      setGameMode(count === 2 ? 'two_player_individual' : 'three_player_individual');
    }
  };

  const handleSelectGameType = (team: boolean) => {
    setValidationError(null);
    if (team) {
      setPlayerCount(4);
      setGameMode('four_player_team');
    } else {
      if (playerCount === 4) {
        setGameMode('four_player_individual');
      } else if (playerCount === 3) {
        setGameMode('three_player_individual');
      } else {
        setGameMode('two_player_individual');
      }
    }
  };

  const handleContinue = () => {
    const validation = validateSetup();
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid configuration');
      return;
    }
    setValidationError(null);
    router.push('/game-config');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFLINE MULTIPLAYER</Text>
        <Text style={styles.subtitle}>Pass & play on a single device</Text>
      </View>

      {/* PLAYERS COUNT SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PLAYER COUNT</Text>
        <View style={styles.playersGrid}>
          {([2, 3, 4] as PlayerCount[]).map((count) => {
            const isActive = playerCount === count;
            return (
              <TouchableOpacity
                key={count}
                style={[styles.playerBox, isActive && styles.playerBoxActive]}
                activeOpacity={0.8}
                onPress={() => handleSelectCount(count)}
              >
                <Text style={[styles.playerNum, isActive && styles.playerNumActive]}>
                  {count}
                </Text>
                <Text style={[styles.playerSub, isActive && styles.playerSubActive]}>
                  {count === 2 ? 'Two Players' : count === 3 ? 'Three Players' : 'Four Players'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* GAME TYPE SECTION (FOR 4 PLAYERS) */}
      {playerCount === 4 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GAME TYPE</Text>
          <View style={styles.gameTypeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                !isTeamMode && styles.typeBtnIndividualActive,
              ]}
              onPress={() => handleSelectGameType(false)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  !isTeamMode && styles.typeBtnTextActive,
                ]}
              >
                INDIVIDUAL (FREE-FOR-ALL)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                isTeamMode && styles.typeBtnTeamActive,
              ]}
              onPress={() => handleSelectGameType(true)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  isTeamMode && styles.typeBtnTeamTextActive,
                ]}
              >
                TEAM 2 VS 2 (DOUBLES)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TEAM CONFIGURATION SECTION (FOR 2V2) */}
      {isTeamMode && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TEAM NAMES & SEATING</Text>
          <View style={styles.teamsRow}>
            <View style={styles.teamInputCard}>
              <Text style={styles.teamBadgeA}>TEAM A (WHITE)</Text>
              <TextInput
                style={styles.teamTextInput}
                value={teamAName}
                onChangeText={setTeamAName}
                placeholder="Team A Name"
                placeholderTextColor="rgba(245, 236, 210, 0.4)"
              />
              <Text style={styles.teamSeatsHint}>Seats 0 & 2 (Opposite)</Text>
            </View>

            <View style={styles.teamInputCard}>
              <Text style={styles.teamBadgeB}>TEAM B (BLACK)</Text>
              <TextInput
                style={styles.teamTextInput}
                value={teamBName}
                onChangeText={setTeamBName}
                placeholder="Team B Name"
                placeholderTextColor="rgba(245, 236, 210, 0.4)"
              />
              <Text style={styles.teamSeatsHint}>Seats 1 & 3 (Opposite)</Text>
            </View>
          </View>

          {/* Swap Team Partners Button */}
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => swapTeamPlayers(0, 2)}
            activeOpacity={0.8}
          >
            <Text style={styles.swapBtnText}>⇄ SWAP TEAM A PARTNER SEATS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PLAYER CONFIGURATION LIST */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>CONFIGURE PLAYERS</Text>
          <TouchableOpacity onPress={resetSetup}>
            <Text style={styles.resetText}>RESET DEFAULTS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playersList}>
          {players.map((player) => {
            const isPickerOpen = activeAvatarPickerSeat === player.seat;
            const seatLabel = getSeatDirectionLabel(player.seat);
            const coinLabel =
              player.assignedCoinType === 'white'
                ? 'White Coins'
                : player.assignedCoinType === 'black'
                ? 'Black Coins'
                : 'Any Coins (Points)';

            return (
              <Card key={player.id} style={styles.playerConfigCard}>
                <View style={styles.playerCardTopRow}>
                  {/* Avatar Circle with toggle */}
                  <TouchableOpacity
                    style={styles.avatarButton}
                    onPress={() =>
                      setActiveAvatarPickerSeat(isPickerOpen ? null : player.seat)
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.avatarEmoji}>{player.avatarUrl || '👑'}</Text>
                    <View style={styles.avatarEditPill}>
                      <Text style={styles.avatarEditPillText}>EDIT</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Name Input & Meta */}
                  <View style={styles.playerDetailsColumn}>
                    <View style={styles.nameRow}>
                      <TextInput
                        style={styles.nameInput}
                        value={player.name}
                        onChangeText={(text) => updatePlayerName(player.seat, text)}
                        placeholder={`Player ${player.seat + 1}`}
                        placeholderTextColor="rgba(245, 236, 210, 0.4)"
                        maxLength={18}
                      />
                      <TouchableOpacity
                        style={[
                          styles.readyToggle,
                          player.isReady && styles.readyToggleActive,
                        ]}
                        onPress={() => togglePlayerReady(player.seat)}
                      >
                        <Text
                          style={[
                            styles.readyToggleText,
                            player.isReady && styles.readyToggleTextActive,
                          ]}
                        >
                          {player.isReady ? 'READY ✓' : 'WAITING'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Seat & Coin Badges */}
                    <View style={styles.badgesRow}>
                      <View style={styles.seatBadge}>
                        <Text style={styles.seatBadgeText}>SEAT: {seatLabel}</Text>
                      </View>
                      <View style={styles.coinBadge}>
                        <Text style={styles.coinBadgeText}>{coinLabel}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Avatar Picker Expandable Strip */}
                {isPickerOpen && (
                  <View style={styles.avatarPickerContainer}>
                    <Text style={styles.pickerTitle}>CHOOSE AVATAR</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.avatarOptionsRow}>
                        {PREDEFINED_AVATARS.map((av) => (
                          <TouchableOpacity
                            key={av.id}
                            style={[
                              styles.avatarOptionBox,
                              player.avatarUrl === av.emoji && styles.avatarOptionSelected,
                            ]}
                            onPress={() => {
                              updatePlayerAvatar(player.seat, av.emoji);
                              setActiveAvatarPickerSeat(null);
                            }}
                          >
                            <Text style={styles.avatarOptionEmoji}>{av.emoji}</Text>
                            <Text style={styles.avatarOptionLabel}>{av.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Recent Player Names Suggestions */}
        {recentNames.length > 0 && (
          <View style={styles.recentNamesContainer}>
            <Text style={styles.recentNamesTitle}>RECENT NAMES:</Text>
            <View style={styles.recentNamesPillsRow}>
              {recentNames.slice(0, 5).map((name, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.recentNamePill}
                  onPress={() => {
                    // Fill into first player whose name is still default
                    const target = players.find((p) => p.name.startsWith('Player '));
                    if (target) {
                      updatePlayerName(target.seat, name);
                    }
                  }}
                >
                  <Text style={styles.recentNamePillText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Validation Error Banner */}
      {validationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {validationError}</Text>
        </View>
      )}

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="CONTINUE TO BOARD & SETTINGS"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
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
    marginBottom: 8,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  resetText: {
    color: THEME.colors.brass[400],
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  playersGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  playerBox: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerBoxActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playerNum: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
  },
  playerNumActive: {
    color: '#FFFFFF',
  },
  playerSub: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  playerSubActive: {
    color: '#2BD67B',
    fontWeight: '800',
  },
  gameTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnIndividualActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  typeBtnTeamActive: {
    borderColor: '#E9B949',
    backgroundColor: 'rgba(233, 185, 73, 0.2)',
  },
  typeBtnText: {
    color: '#F5ECD2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  typeBtnTextActive: {
    color: '#2BD67B',
  },
  typeBtnTeamTextActive: {
    color: '#E9B949',
  },
  teamsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  teamInputCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 56, 38, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    padding: 10,
  },
  teamBadgeA: {
    color: '#2BD67B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  teamBadgeB: {
    color: '#E9B949',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  teamTextInput: {
    backgroundColor: '#07261C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
  },
  teamSeatsHint: {
    color: '#9FD8B8',
    fontSize: 10,
  },
  swapBtn: {
    backgroundColor: 'rgba(233, 185, 73, 0.15)',
    borderWidth: 1,
    borderColor: '#E9B949',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  swapBtnText: {
    color: '#E9B949',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playersList: {
    gap: 10,
  },
  playerConfigCard: {
    backgroundColor: '#0E4A33',
    borderColor: 'rgba(43, 214, 123, 0.35)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  playerCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 38, 28, 0.8)',
    borderWidth: 2,
    borderColor: '#2BD67B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarEditPill: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#2BD67B',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  avatarEditPillText: {
    color: '#07261C',
    fontSize: 8,
    fontWeight: '900',
  },
  playerDetailsColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#07261C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  readyToggle: {
    backgroundColor: 'rgba(245, 236, 210, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 236, 210, 0.3)',
  },
  readyToggleActive: {
    backgroundColor: 'rgba(43, 214, 123, 0.25)',
    borderColor: '#2BD67B',
  },
  readyToggleText: {
    color: '#F5ECD2',
    fontSize: 10,
    fontWeight: '800',
  },
  readyToggleTextActive: {
    color: '#2BD67B',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  seatBadge: {
    backgroundColor: 'rgba(7, 38, 28, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatBadgeText: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '700',
  },
  coinBadge: {
    backgroundColor: 'rgba(233, 185, 73, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(233, 185, 73, 0.3)',
  },
  coinBadgeText: {
    color: '#E9B949',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarPickerContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 214, 123, 0.2)',
  },
  pickerTitle: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  avatarOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  avatarOptionBox: {
    width: 58,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(7, 38, 28, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatarOptionSelected: {
    borderColor: '#2BD67B',
    backgroundColor: 'rgba(43, 214, 123, 0.2)',
  },
  avatarOptionEmoji: {
    fontSize: 24,
  },
  avatarOptionLabel: {
    color: '#F5ECD2',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  recentNamesContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(13, 56, 38, 0.6)',
    borderRadius: 12,
    padding: 10,
  },
  recentNamesTitle: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  recentNamesPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recentNamePill: {
    backgroundColor: 'rgba(7, 38, 28, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.3)',
  },
  recentNamePillText: {
    color: '#F5ECD2',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(216, 52, 74, 0.2)',
    borderWidth: 1,
    borderColor: '#D8344A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#FF8896',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 10,
    paddingTop: 8,
  },
  continueBtn: {
    width: '100%',
  },
});
