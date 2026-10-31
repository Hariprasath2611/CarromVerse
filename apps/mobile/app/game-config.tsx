import React from 'react';
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
  PrimaryButton,
  ScreenContainer,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { THEME } from '../src/constants/theme';

const AVAILABLE_AVATARS = ['👑', '🐯', '🦅', '🦁', '⚡', '🔥', '🥷', '🎯'];

const BOARD_THEMES: Array<{ id: 'classic' | 'emerald' | 'mahogany'; name: string; color: string }> = [
  { id: 'emerald', name: 'Emerald Club', color: '#0F5A3E' },
  { id: 'classic', name: 'Cream Maple', color: '#F5ECD2' },
  { id: 'mahogany', name: 'Deep Walnut', color: '#5C2C16' },
];

const TARGET_POINTS_OPTIONS = [15, 25, 29];
const TURN_TIMERS = [15, 30, 60];

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
          <Text style={styles.backArrow}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerStep}>STEP 3 OF 3</Text>
          <Text style={styles.headerTitle}>MATCH CONFIGURATION</Text>
        </View>
      </View>

      <Text style={styles.instruction}>
        Personalize player identities, select your board finish, and set table points & timers.
      </Text>

      {/* PLAYER ROSTER SECTION */}
      <Text style={styles.sectionTitle}>PLAYER IDENTITIES & SEATS</Text>
      {players.map((player) => (
        <GameCard key={player.id} elevated style={styles.playerCard}>
          <View style={styles.playerCardHeader}>
            <View style={styles.playerBadgeRow}>
              <View style={styles.seatBadge}>
                <Text style={styles.seatBadgeText}>
                  {player.position.toUpperCase()} SEAT
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
          <Text style={styles.inputLabel}>PLAYER NAME</Text>
          <TextInput
            style={styles.nameTextInput}
            value={player.name}
            onChangeText={(val) => updatePlayerName(player.seat, val)}
            placeholder="Enter Name"
            placeholderTextColor={THEME.colors.textMuted}
            maxLength={18}
          />

          {/* Avatar Selector Carousel */}
          <Text style={styles.avatarLabel}>CHOOSE AVATAR</Text>
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
      <Text style={styles.sectionTitle}>TABLE BOARD FINISH</Text>
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
              {pts} PTS
            </Text>
            <Text style={styles.ruleChipSub}>
              {pts === 15 ? 'Quick Match' : pts === 25 ? 'Championship' : 'Grand Club'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TURN TIMERS */}
      <Text style={styles.sectionTitle}>SHOT TURN TIMER</Text>
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
              {sec} SEC
            </Text>
            <Text style={styles.ruleChipSub}>
              {sec === 15 ? 'Speed Blitz' : sec === 30 ? 'Tournament' : 'Relaxed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="PROCEED TO TABLE LOBBY"
          subtitle="Confirm seating and break the coins"
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
  },
  playerCard: {
    padding: 16,
    marginBottom: 12,
  },
  playerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatBadge: {
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  seatBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  teamABadge: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 1.5,
  },
  teamBBadge: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 1.5,
  },
  teamBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  coinAssignment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: 11,
    color: THEME.colors.mutedMint,
  },
  coinValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  coinWhite: {
    color: '#F5ECD2',
  },
  coinBlack: {
    color: '#9FD8B8',
  },
  coinAny: {
    color: THEME.colors.neonEmerald,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nameTextInput: {
    backgroundColor: '#0A2E22',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 14,
    color: THEME.colors.cream,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarChoiceActive: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125A3F',
    ...THEME.shadows.glowEmerald,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  boardThemeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  themeOption: {
    flex: 0.31,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  themeOptionActive: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125A3F',
    ...THEME.shadows.glowEmerald,
  },
  themeSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderColor: '#1B7050',
    borderWidth: 2,
    marginBottom: 6,
  },
  themeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
    textAlign: 'center',
  },
  themeNameActive: {
    color: THEME.colors.neonEmerald,
  },
  rulesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ruleChip: {
    flex: 0.31,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ruleChipActive: {
    borderColor: THEME.colors.brass,
    backgroundColor: '#124330',
    ...THEME.shadows.glowBrass,
  },
  ruleChipText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  ruleChipTextActive: {
    color: THEME.colors.brass,
  },
  ruleChipSub: {
    fontSize: 9,
    color: THEME.colors.mutedMint,
    marginTop: 2,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
  },
});
