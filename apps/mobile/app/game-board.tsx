import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  PauseModal,
  PhaserCarromView,
  PlayerCard,
  PrimaryButton,
  ScreenContainer,
  StickersModal,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 24, 380);

export default function GameBoardScreen() {
  const router = useRouter();
  const { players, boardTheme, targetPoints, turnTimeLimitSec, selectedMode } =
    useGameSetupStore();
  const {
    currentTurn,
    scores,
    queenStatus,
    recordPhysicalShot,
    endSession,
    startSession,
  } = useGameSessionStore();
  const { settings, toggleSound, toggleMusic } = useSettingsStore();

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeSticker, setActiveSticker] = useState<{ emoji: string; text: string } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0); // slider -0.95 to 0.95
  const [pocketedWhiteCount, setPocketedWhiteCount] = useState(2);
  const [pocketedBlackCount, setPocketedBlackCount] = useState(1);

  // Animations
  const turnBannerScale = useSharedValue(1);
  const strikerAimOpacity = useSharedValue(0.85);

  const activePlayer = players[activePlayerIndex % players.length] || players[0];

  // Turn timer countdown
  useEffect(() => {
    setSecondsRemaining(turnTimeLimitSec);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired, pass turn
          handleAdvanceTurn();
          return turnTimeLimitSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePlayerIndex, turnTimeLimitSec]);

  const handleAdvanceTurn = () => {
    turnBannerScale.value = withSequence(
      withSpring(1.08, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  const handleSimulateShot = () => {
    // Record mock physical shot with state machine if available
    recordPhysicalShot([], false);

    // Random pocket increment for visual UI demonstration
    if (Math.random() > 0.5) {
      if (activePlayer.assignedCoinType === 'white') {
        setPocketedWhiteCount((c) => Math.min(c + 1, 9));
      } else {
        setPocketedBlackCount((c) => Math.min(c + 1, 9));
      }
    }

    handleAdvanceTurn();
  };

  const handleFinishMatch = () => {
    endSession();
    router.replace('/game-result');
  };

  const handleStickerSelected = (sticker: { emoji: string; text: string }) => {
    setActiveSticker(sticker);
    setTimeout(() => {
      setActiveSticker(null);
    }, 2800);
  };

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: turnBannerScale.value }],
  }));

  // Board colors based on theme
  const boardBg =
    boardTheme === 'emerald'
      ? '#064E3B'
      : boardTheme === 'mahogany'
      ? '#4A1D13'
      : '#D27D2D';

  const woodBorder =
    boardTheme === 'emerald'
      ? '#0F291E'
      : boardTheme === 'mahogany'
      ? '#2A0D08'
      : '#5C2C16';

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* TOP CONTROL BAR */}
      <View style={styles.topControlBar}>
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={() => setShowPauseModal(true)}
        >
          <Text style={styles.controlIconText}>⏸️</Text>
        </TouchableOpacity>

        <View style={styles.modePill}>
          <Text style={styles.modePillTitle}>
            {selectedMode.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <Text style={styles.modePillSub}>Target: {targetPoints} Pts</Text>
        </View>

        <View style={styles.rightControlGroup}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={toggleSound}>
            <Text style={styles.controlIconText}>
              {settings.soundEnabled ? '🔊' : '🔇'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconCircleBtn, { marginLeft: 8 }]}
            onPress={() => setShowStickersModal(true)}
          >
            <Text style={styles.controlIconText}>🎭</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTIVE TURN & TIMER BANNER */}
      <Animated.View style={[styles.turnBanner, bannerAnimatedStyle]}>
        <View style={styles.turnAvatarCircle}>
          <Text style={styles.turnAvatarEmoji}>{activePlayer.avatarUrl || '👑'}</Text>
        </View>
        <View style={styles.turnInfoCol}>
          <Text style={styles.turnPlayerName} numberOfLines={1}>
            {activePlayer.name}'s Turn
          </Text>
          <Text style={styles.turnPositionText}>
            {activePlayer.position.toUpperCase()} SEAT •{' '}
            {activePlayer.assignedCoinType.toUpperCase()} PIECES
          </Text>
        </View>

        {/* Circular Countdown Ring Badge */}
        <View
          style={[
            styles.timerRing,
            secondsRemaining <= 5 && styles.timerRingUrgent,
          ]}
        >
          <Text
            style={[
              styles.timerText,
              secondsRemaining <= 5 && styles.timerTextUrgent,
            ]}
          >
            {secondsRemaining}s
          </Text>
        </View>
      </Animated.View>

      {/* OPPONENT / TOP SCORE CARDS */}
      <View style={styles.opponentsRow}>
        {players.map((p, idx) => {
          const isTurn = idx === activePlayerIndex % players.length;
          return (
            <View
              key={p.id}
              style={[styles.playerBadgeBox, isTurn && styles.activePlayerBadgeBox]}
            >
              <Text style={styles.miniAvatar}>{p.avatarUrl || '👑'}</Text>
              <View style={styles.badgeCol}>
                <Text
                  style={[styles.badgeName, isTurn && styles.activeBadgeText]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text style={styles.badgeScore}>
                  {scores[p.id]?.points ?? (p.assignedCoinType === 'white' ? pocketedWhiteCount * 2 : pocketedBlackCount)} pts
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* CARROM BOARD CONTAINER (CENTERPIECE) */}
      <View style={styles.boardWrapper}>
        {/* Floating Table Reaction Bubble */}
        {activeSticker && (
          <View style={styles.floatingStickerBubble}>
            <Text style={styles.stickerEmojiLarge}>{activeSticker.emoji}</Text>
            <Text style={styles.stickerTextMsg}>{activeSticker.text}</Text>
          </View>
        )}

        {/* PHASER 3 GAME ENGINE CANVAS */}
        <PhaserCarromView
          size={BOARD_SIZE}
          themeId={boardTheme}
          strikerSkin="emerald"
          activeSeat={activePlayer.seat}
          strikerOffset={strikerOffsetRatio}
          onStrikerDragged={(ratio) => setStrikerOffsetRatio(ratio)}
        />
      </View>

      {/* STRIKER POSITIONING SLIDER CONTROLS */}
      <View style={styles.strikerControlsRow}>
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => setStrikerOffsetRatio((o) => Math.max(o - 0.15, -0.95))}
        >
          <Text style={styles.adjustBtnText}>◀ Left</Text>
        </TouchableOpacity>

        <Text style={styles.adjustLabel}>Position Striker (or Drag on Board)</Text>

        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => setStrikerOffsetRatio((o) => Math.min(o + 0.15, 0.95))}
        >
          <Text style={styles.adjustBtnText}>Right ▶</Text>
        </TouchableOpacity>
      </View>

      {/* ACTION BUTTONS (Shot Simulation & Conclude) */}
      <View style={styles.bottomActions}>
        <View style={styles.actionBtnWrap}>
          <PrimaryButton
            title="Take Shot"
            subtitle="Release striker impulse"
            onPress={handleSimulateShot}
            variant="emerald"
            size="medium"
            icon="🎯"
          />
        </View>

        <View style={styles.actionBtnWrapSmall}>
          <PrimaryButton
            title="End Match"
            subtitle="View Results"
            onPress={handleFinishMatch}
            variant="gold"
            size="medium"
          />
        </View>
      </View>

      {/* MODALS */}
      <PauseModal
        visible={showPauseModal}
        onResume={() => setShowPauseModal(false)}
        onRestart={() => {
          setShowPauseModal(false);
          setPocketedWhiteCount(0);
          setPocketedBlackCount(0);
          setActivePlayerIndex(0);
        }}
        onExit={() => {
          setShowPauseModal(false);
          router.replace('/(tabs)');
        }}
      />

      <StickersModal
        visible={showStickersModal}
        onClose={() => setShowStickersModal(false)}
        onSelectSticker={handleStickerSelected}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.sm,
    paddingTop: THEME.spacing.sm,
    flex: 1,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconText: {
    fontSize: 16,
  },
  modePill: {
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  modePillTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  modePillSub: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  rightControlGroup: {
    flexDirection: 'row',
  },
  turnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.primary,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 6,
    marginBottom: THEME.spacing.xs,
  },
  turnAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.xs,
  },
  turnAvatarEmoji: {
    fontSize: 18,
  },
  turnInfoCol: {
    flex: 1,
  },
  turnPlayerName: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  turnPositionText: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.colors.accent,
  },
  timerRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: THEME.colors.accent,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
  },
  timerRingUrgent: {
    borderColor: THEME.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  timerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  timerTextUrgent: {
    color: THEME.colors.danger,
  },
  opponentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  playerBadgeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginHorizontal: 2,
  },
  activePlayerBadgeBox: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  miniAvatar: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeCol: {
    flex: 1,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  activeBadgeText: {
    color: THEME.colors.accent,
  },
  badgeScore: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  floatingStickerBubble: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
    backgroundColor: 'rgba(16, 37, 26, 0.95)',
    borderColor: THEME.colors.accent,
    borderWidth: 2,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  stickerEmojiLarge: {
    fontSize: 32,
  },
  stickerTextMsg: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  carromBoard: {
    borderRadius: 8,
    borderWidth: 14,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  cushionTop: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cushionBottom: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cushionLeft: {
    position: 'absolute',
    left: 0,
    top: 24,
    bottom: 24,
    width: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cushionRight: {
    position: 'absolute',
    right: 0,
    top: 24,
    bottom: 24,
    width: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  boardPocket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a0a0a',
    borderColor: '#4A3B2C',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketInnerWell: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
  },
  pocketTopLeft: { top: 0, left: 0 },
  pocketTopRight: { top: 0, right: 0 },
  pocketBottomLeft: { bottom: 0, left: 0 },
  pocketBottomRight: { bottom: 0, right: 0 },
  cornerArrow: {
    position: 'absolute',
    width: 24,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  arrowTL: { top: 28, left: 28, transform: [{ rotate: '45deg' }] },
  arrowTR: { top: 28, right: 28, transform: [{ rotate: '-45deg' }] },
  arrowBL: { bottom: 28, left: 28, transform: [{ rotate: '-45deg' }] },
  arrowBR: { bottom: 28, right: 28, transform: [{ rotate: '45deg' }] },
  baselineH_Top: {
    position: 'absolute',
    top: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  baselineH_Bottom: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  baselineLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  baselineV_Left: {
    position: 'absolute',
    left: 36,
    top: 48,
    bottom: 48,
    alignItems: 'center',
  },
  baselineV_Right: {
    position: 'absolute',
    right: 36,
    top: 48,
    bottom: 48,
    alignItems: 'center',
  },
  baselineLineV: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  baselineRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    borderColor: '#7F1D1D',
    borderWidth: 1,
  },
  centerOuterCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderColor: 'rgba(0,0,0,0.35)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  queenPiece: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderColor: '#7F1D1D',
    borderWidth: 1.5,
    zIndex: 2,
  },
  carromCoin: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1,
  },
  coinWhite: {
    backgroundColor: '#F5F5F0',
    borderColor: '#B0B0A8',
  },
  coinBlack: {
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
  },
  coinCluster1: { top: 4, left: 18 },
  coinCluster2: { top: 12, right: 4 },
  coinCluster3: { bottom: 6, right: 8 },
  coinCluster4: { bottom: 4, left: 18 },
  coinCluster5: { bottom: 6, left: 8 },
  coinCluster6: { top: 12, left: 4 },
  activeStriker: {
    position: 'absolute',
    bottom: 27,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    borderColor: '#FCA5A5',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  strikerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEF08A',
  },
  aimGuideRay: {
    position: 'absolute',
    bottom: 24,
    width: 2,
    height: 60,
    backgroundColor: 'rgba(254, 240, 138, 0.7)',
    borderStyle: 'dashed',
  },
  strikerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    marginTop: 2,
    marginBottom: THEME.spacing.xs,
  },
  adjustBtn: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  adjustLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.xs,
  },
  actionBtnWrap: {
    flex: 0.65,
  },
  actionBtnWrapSmall: {
    flex: 0.32,
  },
});
