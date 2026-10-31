import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native-reanimated';
import {
  PauseModal,
  PhaserCarromView,
  PhaserCarromViewRef,
  PrimaryButton,
  ScreenContainer,
  StickersModal,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { THEME } from '../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 20, 390);

export default function GameBoardScreen() {
  const router = useRouter();
  const carromRef = useRef<PhaserCarromViewRef>(null);
  const { players, boardTheme, targetPoints, turnTimeLimitSec, selectedMode } =
    useGameSetupStore();
  const {
    currentTurn,
    scores,
    queenStatus,
    recordPhysicalShot,
    endSession,
  } = useGameSessionStore();
  const { settings, toggleSound } = useSettingsStore();

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeSticker, setActiveSticker] = useState<{ emoji: string; text: string } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0); // slider -0.95 to 0.95
  const [pocketedWhiteCount, setPocketedWhiteCount] = useState(0);
  const [pocketedBlackCount, setPocketedBlackCount] = useState(0);
  const [isShotActive, setIsShotActive] = useState(false);
  const [aimPowerPercent, setAimPowerPercent] = useState<number | null>(null);
  const [pocketAlert, setPocketAlert] = useState<string | null>(null);

  // Animations
  const turnBannerScale = useSharedValue(1);

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
      withSpring(1.06, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  const handleSimulateShot = () => {
    if (isShotActive) return;
    if (carromRef.current) {
      carromRef.current.shoot(0.75);
    }
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
          <Text style={styles.modePillSub}>TARGET: {targetPoints} PTS</Text>
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
            {activePlayer.name.toUpperCase()} TURN
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

        {/* PHASER 3 GAME ENGINE CANVAS WITH MATTER PHYSICS */}
        <PhaserCarromView
          ref={carromRef}
          size={BOARD_SIZE}
          themeId={boardTheme}
          strikerSkin="emerald"
          activeSeat={activePlayer.seat}
          strikerOffset={strikerOffsetRatio}
          onStrikerDragged={(ratio) => setStrikerOffsetRatio(ratio)}
          onShotStarted={() => {
            setIsShotActive(true);
            setAimPowerPercent(null);
          }}
          onAimChanged={(details) => {
            setAimPowerPercent(Math.round(details.powerRatio * 100));
          }}
          onObjectPocketed={(details) => {
            if (details.type === 'white') {
              setPocketedWhiteCount((c) => Math.min(c + 1, 9));
              setPocketAlert('⚪ White Coin Pocketed!');
            } else if (details.type === 'black') {
              setPocketedBlackCount((c) => Math.min(c + 1, 9));
              setPocketAlert('⚫ Black Coin Pocketed!');
            } else if (details.type === 'queen') {
              setPocketAlert('👑 QUEEN POCKETED!');
            }
            setTimeout(() => setPocketAlert(null), 2400);
          }}
          onStrikerPocketed={() => {
            setPocketAlert('⚠️ STRIKER FOUL POCKETED');
            setTimeout(() => setPocketAlert(null), 2400);
          }}
          onShotSettled={() => {
            setIsShotActive(false);
            handleAdvanceTurn();
          }}
        />

        {/* AIM POWER / POCKET OVERLAY BADGE */}
        {aimPowerPercent !== null && (
          <View style={styles.aimPowerBadge}>
            <Text style={styles.aimPowerText}>⚡ STRIKE POWER: {aimPowerPercent}%</Text>
          </View>
        )}

        {pocketAlert && (
          <View style={styles.pocketAlertBadge}>
            <Text style={styles.pocketAlertText}>{pocketAlert}</Text>
          </View>
        )}
      </View>

      {/* STRIKER POSITIONING SLIDER CONTROLS */}
      <View style={styles.strikerControlsRow}>
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => setStrikerOffsetRatio((o) => Math.max(o - 0.15, -0.95))}
        >
          <Text style={styles.adjustBtnText}>◀ LEFT</Text>
        </TouchableOpacity>

        <Text style={styles.adjustLabel}>POSITION STRIKER BASELINE</Text>

        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => setStrikerOffsetRatio((o) => Math.min(o + 0.15, 0.95))}
        >
          <Text style={styles.adjustBtnText}>RIGHT ▶</Text>
        </TouchableOpacity>
      </View>

      {/* ACTION BUTTONS (Shot Simulation & Conclude) */}
      <View style={styles.bottomActions}>
        <View style={styles.actionBtnWrap}>
          <PrimaryButton
            title="TAKE SHOT"
            subtitle="Release striker impulse"
            onPress={handleSimulateShot}
            variant="emerald"
            size="medium"
            icon="🎯"
          />
        </View>

        <View style={styles.actionBtnWrapSmall}>
          <PrimaryButton
            title="END MATCH"
            subtitle="Results"
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
    paddingHorizontal: 10,
    paddingTop: 10,
    flex: 1,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconText: {
    fontSize: 16,
  },
  modePill: {
    alignItems: 'center',
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  modePillTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.neonEmerald,
    letterSpacing: 0.5,
  },
  modePillSub: {
    fontSize: 9,
    color: THEME.colors.brass,
    fontWeight: 'bold',
  },
  rightControlGroup: {
    flexDirection: 'row',
  },
  turnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    ...THEME.shadows.glowEmerald,
  },
  turnAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  turnAvatarEmoji: {
    fontSize: 20,
  },
  turnInfoCol: {
    flex: 1,
  },
  turnPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.4,
  },
  turnPositionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  timerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07261C',
  },
  timerRingUrgent: {
    borderColor: THEME.colors.queenRed,
    backgroundColor: 'rgba(226, 59, 90, 0.25)',
  },
  timerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  timerTextUrgent: {
    color: THEME.colors.queenRed,
  },
  opponentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  playerBadgeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  activePlayerBadgeBox: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125A3F',
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
    color: THEME.colors.cream,
  },
  activeBadgeText: {
    color: THEME.colors.neonEmerald,
  },
  badgeScore: {
    fontSize: 9,
    color: THEME.colors.brass,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(7, 38, 28, 0.95)',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    ...THEME.shadows.glowEmerald,
  },
  stickerEmojiLarge: {
    fontSize: 32,
  },
  stickerTextMsg: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  strikerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  adjustBtn: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  adjustLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
    letterSpacing: 0.8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnWrap: {
    flex: 0.65,
  },
  actionBtnWrapSmall: {
    flex: 0.32,
  },
  aimPowerBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(7, 38, 28, 0.92)',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 15,
  },
  aimPowerText: {
    color: THEME.colors.neonEmerald,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  pocketAlertBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(7, 38, 28, 0.95)',
    borderColor: THEME.colors.brass,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    zIndex: 15,
  },
  pocketAlertText: {
    color: THEME.colors.brass,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
