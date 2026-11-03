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
import { THEME } from '../src/constants/theme';
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
  const availableBoardHeight = screenHeight - 160;
  const BOARD_SIZE = Math.floor(Math.min(screenWidth - 38, availableBoardHeight, 480));

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec || 25);
  const [isShotActive, setIsShotActive] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0.55);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0);
  const [isStrikerOverlapping, setIsStrikerOverlapping] = useState(false);
  const [pocketToast, setPocketToast] = useState<string | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ text: string; color: string } | null>(null);

  // Side Power Meter State (Carrom Pool Force Meter)
  const [sidePower, setSidePower] = useState(0);
  const [isPullingSideMeter, setIsPullingSideMeter] = useState(false);

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
          name: 'Player 1',
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
          name: 'Player 2',
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
        targetScore: targetPoints,
        turnTimeLimitSeconds: turnTimeLimitSec,
      };
      startSession(config, defaultPlayers);
    }
  }, [stateMachine, startSession, selectedMode, boardTheme, targetPoints, turnTimeLimitSec]);

  // Active player lookup
  const activeSeat: PlayerSeat = (currentTurn?.activeSeat as PlayerSeat) ?? 0;
  const activePlayer =
    activePlayers.find((p) => p.seat === activeSeat) ||
    activePlayers[0] || {
      id: 'p1',
      name: 'Player 1',
      avatarUrl: '👑',
      seat: 0 as PlayerSeat,
      assignedCoinType: 'white',
    };

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

  const handleNudgeStriker = (delta: number) => {
    if (isShotActive || isHandoverPending || isPaused) return;
    const newOffset = Math.max(-0.92, Math.min(0.92, strikerOffsetRatio + delta));
    setStrikerOffsetRatio(newOffset);
    AudioManager.getInstance().playSound('STRIKER_PLACE', 0.4);
  };

  const handleSliderTouch = (evt: GestureResponderEvent) => {
    if (isShotActive || isHandoverPending || isPaused) return;
    const { locationX } = evt.nativeEvent;
    // Map slider width (~screenWidth - 90) to -0.92..0.92
    const sliderWidth = Math.max(120, screenWidth - 110);
    const normalized = Math.max(0, Math.min(1, locationX / sliderWidth));
    const newOffset = (normalized - 0.5) * 1.84;
    setStrikerOffsetRatio(Math.max(-0.92, Math.min(0.92, newOffset)));
  };

  // Side Power Meter touch and drag handlers
  const handleSideMeterTouch = (evt: GestureResponderEvent) => {
    if (isShotActive || isHandoverPending || isPaused) return;
    const { locationY } = evt.nativeEvent;
    const meterHeight = BOARD_SIZE * 0.82;
    // Pull down from top to bottom charges 0.05 to 1.0
    const rawRatio = Math.max(0, Math.min(1.0, locationY / meterHeight));
    setSidePower(rawRatio);
    setIsPullingSideMeter(true);
    carromRef.current?.setAimPower(rawRatio);
  };

  const handleSideMeterRelease = () => {
    if (isShotActive || isHandoverPending || isPaused) return;
    if (sidePower >= 0.12 && !isStrikerOverlapping) {
      AudioManager.getInstance().playSound('STRIKER_SHOOT', sidePower);
      carromRef.current?.shoot(sidePower, aimAngle);
    } else {
      carromRef.current?.cancelAim();
    }
    setSidePower(0);
    setIsPullingSideMeter(false);
  };

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
  };

  // Remaining coins calculation for 1v1
  const p1WhiteLeft = Math.max(0, 9 - (scores['player_0']?.whiteCoinsPocketed ?? 0));
  const p2BlackLeft = Math.max(0, 9 - (scores['player_2']?.blackCoinsPocketed ?? 0));

  // Dynamic turn timer color (green -> amber -> red)
  const timerRingColor =
    secondsRemaining > 10 ? '#2BD67B' : secondsRemaining > 5 ? '#E9B949' : '#EF4444';

  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* Subtle Background Decorative Shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* TOP HEADER: MATCH STAKES & PAUSE ICON */}
      <View style={styles.topHeaderBar}>
        <View style={styles.stakesPill}>
          <Text style={styles.stakesPillText}>🪙 500 · 1v1 CLASSIC</Text>
        </View>

        <TouchableOpacity
          style={styles.headerPauseBtn}
          activeOpacity={0.8}
          onPress={() => {
            AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
            pauseSession();
            carromRef.current?.pauseGame();
            setShowPauseModal(true);
          }}
        >
          <Text style={styles.headerPauseIcon}>⏸</Text>
        </TouchableOpacity>
      </View>

      {/* TOP PLAYERS HUD - CARROM POOL CIRCULAR COUNTDOWN RING STYLE */}
      <View style={styles.topHudRow}>
        {/* PLAYER 1 CARD (YOU / SEAT 0) */}
        <View
          style={[
            styles.playerHudCard,
            activeSeat === 0 && styles.playerHudCardActive,
            activeSeat === 0 && { borderColor: timerRingColor },
          ]}
        >
          {/* Avatar with Circular Countdown Ring */}
          <View
            style={[
              styles.avatarTimerRing,
              activeSeat === 0 && {
                borderColor: timerRingColor,
                shadowColor: timerRingColor,
              },
            ]}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmojiText}>
                {activePlayers.find((p) => p.seat === 0)?.avatarUrl || '👑'}
              </Text>
            </View>
          </View>

          <View style={styles.playerMetaCol}>
            <Text style={styles.playerNameText} numberOfLines={1}>
              {activePlayers.find((p) => p.seat === 0)?.name || 'Player 1'}
            </Text>
            <View style={styles.coinBadgeRow}>
              <Text style={styles.coinBadgeText}>⚪ White</Text>
              <Text style={styles.coinCountPill}>{p1WhiteLeft} left</Text>
            </View>
          </View>

          <Text style={styles.playerScoreDisplay}>
            {scores[activePlayers.find((p) => p.seat === 0)?.id ?? '']?.points ?? 0}
          </Text>
        </View>

        {/* CENTER TURN INDICATOR & COUNTDOWN TIMER */}
        <View style={styles.centerTurnBlock}>
          <View
            style={[
              styles.turnStatusPill,
              { backgroundColor: activeSeat === 0 ? 'rgba(43, 214, 123, 0.2)' : 'rgba(233, 185, 73, 0.2)' },
              { borderColor: timerRingColor },
            ]}
          >
            <Text style={[styles.turnStatusText, { color: timerRingColor }]}>
              {activeSeat === 0 ? 'YOUR TURN' : "OPPONENT'S TURN"}
            </Text>
          </View>

          <Text style={[styles.turnTimerClock, { color: timerRingColor }]}>
            0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </Text>

          {queenStatus === 'pending_cover' && (
            <View style={styles.queenCoverBadge}>
              <Text style={styles.queenCoverText}>👑 COVER QUEEN</Text>
            </View>
          )}
        </View>

        {/* PLAYER 2 CARD (OPPONENT / SEAT 2) */}
        <View
          style={[
            styles.playerHudCard,
            activeSeat === 2 && styles.playerHudCardActive,
            activeSeat === 2 && { borderColor: timerRingColor },
          ]}
        >
          <Text style={styles.opponentScoreDisplay}>
            {scores[activePlayers.find((p) => p.seat === 2)?.id ?? '']?.points ?? 0}
          </Text>

          <View style={[styles.playerMetaCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.playerNameText} numberOfLines={1}>
              {activePlayers.find((p) => p.seat === 2)?.name || 'Player 2'}
            </Text>
            <View style={styles.coinBadgeRow}>
              <Text style={styles.coinCountPill}>{p2BlackLeft} left</Text>
              <Text style={styles.coinBadgeText}>⚫ Black</Text>
            </View>
          </View>

          {/* Avatar with Circular Countdown Ring */}
          <View
            style={[
              styles.avatarTimerRing,
              activeSeat === 2 && {
                borderColor: timerRingColor,
                shadowColor: timerRingColor,
              },
            ]}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmojiText}>
                {activePlayers.find((p) => p.seat === 2)?.avatarUrl || '🐯'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CARROM BOARD AREA WITH SIDE POWER METER (CARROM POOL STYLE) */}
      <View style={styles.boardAndControlsArea}>
        <View style={styles.boardCenterWrapper}>
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
            strikerSkin="emerald"
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
                triggerFloatingScore('⚪ +10', '#2BD67B');
                showToast('⚪ White Coin Pocketed!');
              } else if (details.type === 'black') {
                AudioManager.getInstance().playSound('COIN_POCKET', 0.85);
                triggerFloatingScore('⚫ +10', '#E9B949');
                showToast('⚫ Black Coin Pocketed!');
              } else if (details.type === 'queen') {
                AudioManager.getInstance().playSound('QUEEN_POCKET', 1.0);
                triggerFloatingScore('👑 QUEEN +25', '#E9B949');
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
                  showToast('👑 QUEEN COVERED! +25 Points');
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

          {/* FLOATING QUICK EMOTE BUTTON (CARROM POOL BOTTOM-LEFT CORNER) */}
          <TouchableOpacity
            style={styles.floatingEmoteBtn}
            activeOpacity={0.8}
            onPress={() => {
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
              setShowStickersModal(true);
            }}
          >
            <Text style={styles.floatingEmoteIcon}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* SPRING-LOADED SIDE POWER METER (CARROM POOL VERTICAL FORCE GAUGE) */}
        <View style={styles.sideMeterWrapper}>
          <View
            style={styles.sideMeterTrack}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleSideMeterTouch}
            onResponderMove={handleSideMeterTouch}
            onResponderRelease={handleSideMeterRelease}
          >
            {/* Background force gradations */}
            <View style={styles.meterGripMark} />
            <View style={styles.meterGripMark} />
            <View style={styles.meterGripMark} />

            {/* Glowing Power Fill */}
            <View
              style={[
                styles.sideMeterFill,
                {
                  height: `${Math.round(sidePower * 100)}%`,
                  backgroundColor:
                    sidePower > 0.75
                      ? '#EF4444'
                      : sidePower > 0.4
                      ? '#E9B949'
                      : '#2BD67B',
                },
              ]}
            />

            {/* Draggable Force Knob */}
            <View
              style={[
                styles.sideMeterKnob,
                {
                  top: `${Math.min(88, Math.max(0, sidePower * 88))}%`,
                  borderColor:
                    sidePower > 0.75
                      ? '#EF4444'
                      : sidePower > 0.4
                      ? '#E9B949'
                      : '#2BD67B',
                },
              ]}
            >
              <Text style={styles.sideMeterKnobIcon}>⚡</Text>
            </View>
          </View>
          <Text style={styles.sideMeterTitle}>FORCE</Text>
        </View>
      </View>

      {/* CARROM POOL TACTILE BASELINE SLIDER */}
      <View style={styles.baselineControlWrap}>
        <View style={styles.baselineSliderRow}>
          <TouchableOpacity
            style={styles.nudgeBtn}
            onPress={() => handleNudgeStriker(-0.12)}
            disabled={isShotActive || isHandoverPending}
            activeOpacity={0.7}
          >
            <Text style={styles.nudgeBtnText}>◀</Text>
          </TouchableOpacity>

          {/* Interactive Brushed Metal Baseline Rail */}
          <View
            style={[
              styles.baselineTrack,
              isStrikerOverlapping && styles.baselineTrackOverlap,
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleSliderTouch}
            onResponderMove={handleSliderTouch}
          >
            {/* Glowing Striker Knob */}
            <View
              style={[
                styles.baselineKnob,
                {
                  left: `${((strikerOffsetRatio + 0.92) / 1.84) * 88 + 2}%`,
                },
                isStrikerOverlapping && styles.baselineKnobOverlap,
              ]}
            >
              <View
                style={[
                  styles.baselineKnobCore,
                  isStrikerOverlapping && styles.baselineKnobCoreOverlap,
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.nudgeBtn}
            onPress={() => handleNudgeStriker(0.12)}
            disabled={isShotActive || isHandoverPending}
            activeOpacity={0.7}
          >
            <Text style={styles.nudgeBtnText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Real-time Status / Guidance Pill */}
        <View style={[styles.guidePill, isStrikerOverlapping && styles.guidePillOverlap]}>
          <Text style={[styles.guidePillText, isStrikerOverlapping && styles.guidePillTextOverlap]}>
            {isStrikerOverlapping
              ? '⚠️ Strikeline blocked · Reposition striker away from coin'
              : '🎯 Drag striker or slider · Pull back to shoot'}
          </Text>
        </View>
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
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  bokehTop: {
    position: 'absolute',
    top: 50,
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
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  stakesPill: {
    backgroundColor: 'rgba(7, 38, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(233, 185, 73, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  stakesPillText: {
    color: '#E9B949',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerPauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(7, 38, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPauseIcon: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: '900',
  },
  topHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 4,
  },
  playerHudCard: {
    flex: 1,
    height: 52,
    backgroundColor: '#07261C',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  playerHudCardActive: {
    backgroundColor: 'rgba(43, 214, 123, 0.12)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarTimerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  avatarInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(7, 38, 28, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiText: {
    fontSize: 17,
  },
  playerMetaCol: {
    flex: 1,
  },
  playerNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  coinBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  coinBadgeText: {
    color: '#9FD8B8',
    fontSize: 9,
    fontWeight: '700',
  },
  coinCountPill: {
    color: '#E9B949',
    fontSize: 9,
    fontWeight: '800',
  },
  playerScoreDisplay: {
    color: '#2BD67B',
    fontSize: 18,
    fontWeight: '900',
  },
  opponentScoreDisplay: {
    color: '#E9B949',
    fontSize: 18,
    fontWeight: '900',
  },
  centerTurnBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  turnStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  turnStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  turnTimerClock: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  queenCoverBadge: {
    backgroundColor: 'rgba(233, 185, 73, 0.25)',
    borderColor: '#E9B949',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  queenCoverText: {
    color: '#E9B949',
    fontSize: 8,
    fontWeight: '900',
  },
  boardAndControlsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 'auto',
  },
  boardCenterWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingEmoteBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 38, 28, 0.88)',
    borderWidth: 1.5,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    elevation: 6,
  },
  floatingEmoteIcon: {
    fontSize: 18,
  },
  sideMeterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: '84%',
  },
  sideMeterTrack: {
    width: 14,
    flex: 1,
    backgroundColor: 'rgba(7, 38, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.4)',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  meterGripMark: {
    width: 8,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  sideMeterFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 6,
  },
  sideMeterKnob: {
    position: 'absolute',
    left: -7,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#07261C',
    borderWidth: 2,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  sideMeterKnobIcon: {
    color: '#E9B949',
    fontSize: 12,
    fontWeight: '900',
  },
  sideMeterTitle: {
    color: '#648A79',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  baselineControlWrap: {
    width: '100%',
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 4,
  },
  baselineSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nudgeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 90, 62, 0.8)',
    borderWidth: 1.5,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeBtnText: {
    color: '#2BD67B',
    fontSize: 13,
    fontWeight: '900',
  },
  baselineTrack: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(7, 38, 28, 0.95)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 214, 123, 0.4)',
    justifyContent: 'center',
    position: 'relative',
  },
  baselineTrackOverlap: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(50, 10, 10, 0.9)',
  },
  baselineKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#07261C',
    borderWidth: 2,
    borderColor: '#2BD67B',
    position: 'absolute',
    top: -6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  baselineKnobOverlap: {
    borderColor: '#EF4444',
  },
  baselineKnobCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2BD67B',
  },
  baselineKnobCoreOverlap: {
    backgroundColor: '#EF4444',
  },
  guidePill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(7, 38, 28, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  guidePillOverlap: {
    backgroundColor: 'rgba(60, 12, 12, 0.9)',
    borderColor: '#EF4444',
  },
  guidePillText: {
    color: '#9FD8B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  guidePillTextOverlap: {
    color: '#FF6B6B',
    fontWeight: '800',
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
    backgroundColor: 'rgba(7, 38, 28, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2BD67B',
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
    backgroundColor: 'rgba(7, 38, 28, 0.92)',
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
