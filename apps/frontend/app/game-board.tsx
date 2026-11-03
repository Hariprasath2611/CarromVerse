import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  PauseModal,
  PhaserCarromView,
  PhaserCarromViewRef,
  PlayerHandoverModal,
  ScreenContainer,
  StickersModal,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { AudioManager } from '../src/services/audio/AudioManager';
import { Player, PlayerSeat } from '@carromverse/shared-types';
import { createDefaultGameConfig } from '@carromverse/game-logic';

export default function GameBoardScreen() {
  const router = useRouter();
  const carromRef = useRef<PhaserCarromViewRef>(null);
  const { settings } = useSettingsStore();
  const { boardTheme, selectedMode, targetPoints, turnTimeLimitSec, teamAName, teamBName } =
    useGameSetupStore();
  const {
    stateMachine,
    startSession,
    processSettledShot,
    scores,
    currentTurn,
    queenStatus,
    activePlayers,
    isHandoverPending,
    nextPlayerToHandover,
    confirmHandover,
    restartSession,
    abandonSession,
    endSession,
    isPaused,
    pauseSession,
    resumeSession,
  } = useGameSessionStore();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Maximized board size preserving strict 1:1 aspect ratio with Carrom Pool layout
  const availableBoardHeight = screenHeight - 230;
  const BOARD_SIZE = Math.floor(Math.min(screenWidth - 16, availableBoardHeight, 480));
  const sliderTrackWidth = Math.min(BOARD_SIZE * 0.74, screenWidth - 64);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec || 25);
  const [isShotActive, setIsShotActive] = useState(false);
  const [, setPowerRatio] = useState(0.55);
  const [, setAimAngle] = useState(-Math.PI / 2);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0);
  const [isStrikerOverlapping, setIsStrikerOverlapping] = useState(false);
  const [pocketToast, setPocketToast] = useState<string | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ text: string; color: string } | null>(null);

  const triggerFloatingScore = (text: string, color: string) => {
    setFloatingScore({ text, color });
    setTimeout(() => setFloatingScore(null), 1800);
  };

  // Initialize rules engine session if not active
  useEffect(() => {
    if (!stateMachine) {
      const defaultPlayers: Player[] = [
        {
          id: 'player_0',
          name: teamAName || 'Hari',
          avatarUrl: '👑',
          type: 'human',
          seat: 0,
          position: 'bottom',
          assignedCoinType: 'white',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_2',
          name: teamBName || 'Ramesh Mendis',
          avatarUrl: '🐯',
          type: 'human',
          seat: 2,
          position: 'top',
          assignedCoinType: 'black',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];
      const baseConfig = createDefaultGameConfig(selectedMode);
      const config = {
        ...baseConfig,
        boardTheme: boardTheme || 'classic',
        targetScore: targetPoints || 115,
        turnTimeLimitSeconds: turnTimeLimitSec,
      };
      startSession(config, defaultPlayers);
    }
  }, [stateMachine, startSession, selectedMode, boardTheme, targetPoints, turnTimeLimitSec, teamAName, teamBName]);

  // Active player lookup
  const activeSeat: PlayerSeat = (currentTurn?.activeSeat as PlayerSeat) ?? 0;

  // Turn timer countdown (reset on turn change)
  useEffect(() => {
    if (turnTimeLimitSec <= 0 || isPaused || isHandoverPending || isShotActive) return;

    setSecondsRemaining(turnTimeLimitSec);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn?.turnNumber, turnTimeLimitSec, isPaused, isHandoverPending, isShotActive]);

  // Handle turn timeout foul safely in an effect outside render
  useEffect(() => {
    if (turnTimeLimitSec > 0 && secondsRemaining === 0 && !isPaused && !isHandoverPending && !isShotActive) {
      showToast('Time expired! Turn passed');
      processSettledShot({
        pocketedCoins: [],
        strikerPocketed: false,
        durationMs: (turnTimeLimitSec || 25) * 1000,
      });
    }
  }, [secondsRemaining, turnTimeLimitSec, isPaused, isHandoverPending, isShotActive]);

  const handleRestartMatch = () => {
    setShowPauseModal(false);
    restartSession();
    setStrikerOffsetRatio(0);
    setIsStrikerOverlapping(false);
    carromRef.current?.resetBoard();
    showToast('Match restarted!');
  };

  const handleExitMatch = () => {
    Alert.alert(
      'Exit Match?',
      'Are you sure you want to abandon this match? Progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            setShowPauseModal(false);
            abandonSession();
            endSession();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleStickerSelected = (sticker: { text: string }) => {
    setActiveReaction(sticker.text);
    setTimeout(() => {
      setActiveReaction(null);
    }, 3000);
  };

  const handleSliderTouch = (evt: GestureResponderEvent) => {
    if (isShotActive || isHandoverPending || isPaused) return;
    const { locationX } = evt.nativeEvent;
    const normalized = Math.max(0, Math.min(1, locationX / sliderTrackWidth));
    const newOffset = (normalized - 0.5) * 1.84;
    setStrikerOffsetRatio(Math.max(-0.92, Math.min(0.92, newOffset)));
  };

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
  };

  // Dynamic turn timer color (green -> amber -> red)
  const timerRingColor =
    secondsRemaining > 10 ? '#2BD67B' : secondsRemaining > 5 ? '#E9B949' : '#EF4444';

  const p1 = activePlayers.find((p) => p.seat === 0);
  const p2 = activePlayers.find((p) => p.seat === 2);
  const p1Score = scores[p1?.id ?? '']?.points ?? 0;
  const p2Score = scores[p2?.id ?? '']?.points ?? 0;
  const maxScore = targetPoints || 115;

  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* 1. TOP HEADER BAR: CARROM POOL PLAYERS & CENTER GOLD COINS (Images 1 & 2) */}
      <View style={styles.topHeaderBar}>
        {/* Left Player (Hari) */}
        <View style={styles.playerProfileCol}>
          <View
            style={[
              styles.playerAvatarBox,
              activeSeat === 0 && styles.playerAvatarBoxActive,
              activeSeat === 0 && { borderColor: timerRingColor },
            ]}
          >
            <Text style={styles.playerAvatarEmoji}>{p1?.avatarUrl || '👑'}</Text>
          </View>
          <Text style={styles.playerProfileName} numberOfLines={1}>
            {p1?.name || 'Hari'}
          </Text>
          <Text style={styles.playerProfileScore}>
            {p1Score}/{maxScore}
          </Text>
        </View>

        {/* Center 3D Gold Coins Stack & Pot Amount (Screenshot 3 & 4: 400) */}
        <View style={styles.centerPotBlock}>
          <View style={styles.goldCoinsStackGraphic}>
            <Text style={styles.goldCoinsStackEmoji}>🪙</Text>
          </View>
          <Text style={styles.centerPotAmount}>400</Text>
        </View>

        {/* Right Player (Ramesh Mendis) */}
        <View style={styles.playerProfileCol}>
          <View
            style={[
              styles.playerAvatarBox,
              activeSeat === 2 && styles.playerAvatarBoxActive,
              activeSeat === 2 && { borderColor: timerRingColor },
            ]}
          >
            <Text style={styles.playerAvatarEmoji}>{p2?.avatarUrl || '🐯'}</Text>
          </View>
          <Text style={styles.playerProfileName} numberOfLines={1}>
            {p2?.name || 'Ramesh Mendis'}
          </Text>
          <Text style={styles.playerProfileScore}>
            {p2Score}/{maxScore}
          </Text>
        </View>
      </View>

      {/* 2. COIN POINT VALUES PILL ROW (50 Queen · 10 Black · 20 White) */}
      <View style={styles.pointValuesRow}>
        <View style={styles.pointValItem}>
          <View style={[styles.coinPointDot, styles.coinPointDotRed]} />
          <Text style={styles.pointValNum}>50</Text>
        </View>
        <View style={styles.pointValItem}>
          <View style={[styles.coinPointDot, styles.coinPointDotBlack]} />
          <Text style={styles.pointValNum}>10</Text>
        </View>
        <View style={styles.pointValItem}>
          <View style={[styles.coinPointDot, styles.coinPointDotWhite]} />
          <Text style={styles.pointValNum}>20</Text>
        </View>
      </View>

      {/* 3. CENTER CARROM BOARD (Maximized, Perfectly Centered, 1:1 Aspect Ratio) */}
      <View style={styles.boardWrapper}>
        {activeReaction && (
          <View style={styles.reactionBubble}>
            <Text style={styles.reactionText}>{activeReaction}</Text>
          </View>
        )}

        {pocketToast && (
          <View style={styles.toastBubble}>
            <Text style={styles.toastText}>{pocketToast}</Text>
          </View>
        )}

        {floatingScore && (
          <View style={[styles.floatingScoreBadge, { borderColor: floatingScore.color }]}>
            <Text style={[styles.floatingScoreText, { color: floatingScore.color }]}>
              {floatingScore.text}
            </Text>
          </View>
        )}

        <PhaserCarromView
          ref={carromRef}
          size={BOARD_SIZE}
          themeId={boardTheme || 'classic'}
          strikerSkin="royal"
          activeSeat={activeSeat}
          strikerOffset={strikerOffsetRatio}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume}
          onStrikerDragged={(offset, isOverlapping) => {
            setStrikerOffsetRatio(offset);
            if (typeof isOverlapping === 'boolean') {
              setIsStrikerOverlapping(isOverlapping);
            }
          }}
          onShotStarted={() => setIsShotActive(true)}
          onAimChanged={(details) => {
            setPowerRatio(details.powerRatio);
            setAimAngle(details.angle);
          }}
          onObjectPocketed={(details) => {
            if (details.type === 'white') {
              AudioManager.getInstance().playSound('COIN_POCKET', 0.85);
              triggerFloatingScore('⚪ +20', '#FFFFFF');
              showToast('⚪ White Coin Pocketed!');
            } else if (details.type === 'black') {
              AudioManager.getInstance().playSound('COIN_POCKET', 0.85);
              triggerFloatingScore('⚫ +10', '#E9B949');
              showToast('⚫ Black Coin Pocketed!');
            } else if (details.type === 'queen') {
              AudioManager.getInstance().playSound('QUEEN_POCKET', 1.0);
              triggerFloatingScore('👑 QUEEN +50', '#EF4444');
              showToast('👑 QUEEN Pocketed!');
            }
          }}
          onStrikerPocketed={() => {
            AudioManager.getInstance().playSound('FOUL', 0.9);
            triggerFloatingScore('⚠️ FOUL', '#EF4444');
            showToast('⚠️ Striker Pocketed (Foul)');
          }}
          onShotSettled={(details: any) => {
            setIsShotActive(false);
            const evalResult = processSettledShot({
              pocketedCoins: details?.pocketed ?? [],
              strikerPocketed: !!details?.strikerPocketed,
              durationMs: details?.duration_ms,
            });

            if (evalResult) {
              if (evalResult.foulOccurred) {
                AudioManager.getInstance().playSound('FOUL', 0.9);
                showToast(
                  `FOUL: ${evalResult.primaryFoulType === 'striker_pocketed' ? 'Striker Scratch' : 'Foul committed'}`
                );
              } else if (evalResult.queenCoveredThisShot) {
                AudioManager.getInstance().playSound('QUEEN_POCKET', 1.0);
                triggerFloatingScore('👑 QUEEN COVERED!', '#E9B949');
                showToast('👑 QUEEN COVERED! +50 Points');
              } else if (evalResult.queenStatusAfter === 'pending_cover') {
                AudioManager.getInstance().playSound('QUEEN_POCKET', 0.9);
                showToast('👑 Queen Pocketed! Pocket assigned coin to cover');
              } else if (evalResult.queenReturnedToCenter) {
                AudioManager.getInstance().playSound('FOUL', 0.7);
                showToast('Failed to cover Queen! Returned to center');
              } else if (evalResult.extraTurnEarned) {
                triggerFloatingScore('🎯 EXTRA TURN', '#2BD67B');
                showToast('🎯 Coin Pocketed! Extra Turn');
              } else {
                AudioManager.getInstance().playSound('TURN_CHANGE', 0.6);
                showToast('Dry shot · Turn passed');
              }

              if (evalResult.isMatchOver) {
                AudioManager.getInstance().playSound('VICTORY', 1.0);
                setTimeout(() => {
                  router.replace('/game-result');
                }, 1800);
              }
            }
          }}
        />
      </View>

      {/* 4. RECESSED DARK MAHOGANY WOODEN BASELINE SLIDER (Carrom Pool Style!) */}
      <View style={styles.baselineArea}>
        <View
          style={[
            styles.recessedWoodenTrack,
            { width: sliderTrackWidth },
            isStrikerOverlapping && styles.recessedWoodenTrackOverlap,
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleSliderTouch}
          onResponderMove={handleSliderTouch}
        >
          {/* Inner Trough Guide Line */}
          <View style={styles.recessedInnerGuide} />

          {/* Draggable Mini Striker Medallion inside the track */}
          <View
            style={[
              styles.miniStrikerKnob,
              {
                left: `${((strikerOffsetRatio + 0.92) / 1.84) * 86 + 2}%`,
              },
              isStrikerOverlapping && styles.miniStrikerKnobOverlap,
            ]}
          >
            <View style={styles.miniStrikerGearRim} />
            <View style={styles.miniStrikerCore} />
          </View>
        </View>

        {isStrikerOverlapping && (
          <View style={styles.overlapWarningPill}>
            <Text style={styles.overlapWarningText}>
              ⚠️ Striker blocked · Slide away from coin
            </Text>
          </View>
        )}
      </View>

      {/* 5. BOTTOM ACTIONS ROW: CIRCULAR GLOWING GOLD BUTTONS (Chat & Menu) */}
      <View style={styles.bottomBarRow}>
        {/* Bottom Left: Circular Glowing Gold Button (Chat) */}
        <TouchableOpacity
          style={styles.circleGoldBtn}
          activeOpacity={0.8}
          onPress={() => {
            AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
            setShowStickersModal(true);
          }}
        >
          <View style={styles.circleGoldBtnInner}>
            <Text style={styles.circleGoldBtnIcon}>💬</Text>
          </View>
        </TouchableOpacity>

        {/* Turn Countdown Display */}
        <View style={styles.bottomTurnPill}>
          <Text style={[styles.bottomTurnText, { color: timerRingColor }]}>
            {activeSeat === 0 ? 'YOUR TURN' : "OPPONENT'S TURN"} · 0:
            {secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </Text>
        </View>

        {/* Bottom Right: Circular Glowing Gold Button (Menu) */}
        <TouchableOpacity
          style={styles.circleGoldBtn}
          activeOpacity={0.8}
          onPress={() => {
            AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
            pauseSession();
            carromRef.current?.pauseGame();
            setShowPauseModal(true);
          }}
        >
          <View style={styles.circleGoldBtnInner}>
            <Text style={styles.circleGoldBtnIcon}>☰</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* PASS-AND-PLAY TURN HANDOVER MODAL */}
      <PlayerHandoverModal
        visible={isHandoverPending}
        nextPlayer={nextPlayerToHandover}
        onConfirm={() => {
          AudioManager.getInstance().playSound('HANDOVER', 0.7);
          confirmHandover();
          setStrikerOffsetRatio(0);
          setIsStrikerOverlapping(false);
        }}
      />

      {/* PAUSE MODAL */}
      <PauseModal
        visible={showPauseModal}
        onResume={() => {
          resumeSession();
          carromRef.current?.resumeGame();
          setShowPauseModal(false);
        }}
        onRestart={handleRestartMatch}
        onExit={handleExitMatch}
      />

      {/* STICKERS MODAL */}
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
    flex: 1,
    backgroundColor: '#260805', // Deep rich wine red / burgundy
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  playerProfileCol: {
    alignItems: 'center',
    width: 95,
  },
  playerAvatarBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#3D150B',
    borderWidth: 2.5,
    borderColor: '#D4892A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4892A',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  playerAvatarBoxActive: {
    borderColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 7,
  },
  playerAvatarEmoji: {
    fontSize: 24,
  },
  playerProfileName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  playerProfileScore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
  },
  centerPotBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldCoinsStackGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  goldCoinsStackEmoji: {
    fontSize: 34,
  },
  centerPotAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pointValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'rgba(25, 6, 4, 0.75)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 137, 42, 0.35)',
    marginVertical: 4,
  },
  pointValItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinPointDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
  },
  coinPointDotRed: {
    backgroundColor: '#DC2626',
    borderColor: '#FFA0A0',
  },
  coinPointDotBlack: {
    backgroundColor: '#1E2320',
    borderColor: '#4A524D',
  },
  coinPointDotWhite: {
    backgroundColor: '#F5ECD2',
    borderColor: '#FFFFFF',
  },
  pointValNum: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  boardWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  baselineArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  recessedWoodenTrack: {
    height: 26,
    borderRadius: 13,
    backgroundColor: '#240D07',
    borderWidth: 1.8,
    borderColor: '#4E2214',
    position: 'relative',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  recessedWoodenTrackOverlap: {
    borderColor: '#EF4444',
    backgroundColor: '#3D0D0D',
  },
  recessedInnerGuide: {
    height: 2,
    width: '92%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  miniStrikerKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A126D',
    borderWidth: 2,
    borderColor: '#E9B949',
    position: 'absolute',
    top: -3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FFFF',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  miniStrikerKnobOverlap: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  miniStrikerGearRim: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  miniStrikerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    position: 'absolute',
  },
  overlapWarningPill: {
    marginTop: 4,
    backgroundColor: 'rgba(80, 10, 10, 0.85)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  overlapWarningText: {
    color: '#FF8888',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  circleGoldBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D97706',
    borderWidth: 2.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  circleGoldBtnInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGoldBtnIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  bottomTurnPill: {
    backgroundColor: 'rgba(25, 6, 4, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(212, 137, 42, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bottomTurnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reactionBubble: {
    position: 'absolute',
    top: 20,
    right: 25,
    zIndex: 20,
    backgroundColor: '#F5ECD2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#07261C',
  },
  reactionText: {
    color: '#07261C',
    fontWeight: '900',
    fontSize: 14,
  },
  toastBubble: {
    position: 'absolute',
    top: 24,
    zIndex: 25,
    backgroundColor: 'rgba(40, 10, 8, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E9B949',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  floatingScoreBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 35,
    backgroundColor: 'rgba(40, 10, 8, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 8,
  },
  floatingScoreText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
