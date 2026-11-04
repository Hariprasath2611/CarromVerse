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
  FloatingReaction,
  PauseModal,
  PhaserCarromView,
  PhaserCarromViewRef,
  ScreenContainer,
  StickerItem,
  StickersModal,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { AudioManager } from '../src/services/audio/AudioManager';
import { Player, PlayerSeat } from '@carromverse/shared-types';
import { createDefaultGameConfig } from '@carromverse/game-logic';
import { LAYOUT_CONFIG, DEFAULT_PIECE_CONFIG } from '@carromverse/game-engine';

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
    activePlayers,
    restartSession,
    abandonSession,
    endSession,
    isPaused,
    pauseSession,
    resumeSession,
  } = useGameSessionStore();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Reference coordinate scaling factor s = screenWidth / 390
  const s = Math.min(screenWidth / LAYOUT_CONFIG.DESIGN_FRAME.width, 1.4);

  // Derive board dimensions: strictly square, centered with at least 8 units margin
  const reservedHudHeight = Math.round(240 * s);
  const reservedBottomHeight = Math.round(180 * s);
  const availableBoardHeight = screenHeight - reservedHudHeight - reservedBottomHeight - 16;
  const availableBoardWidth = screenWidth - 8;
  const BOARD_SIZE = Math.floor(
    Math.min(LAYOUT_CONFIG.BOARD.frameWidth * s, availableBoardHeight, availableBoardWidth)
  );

  // Slider geometry matching LayoutConfig.ts
  const sliderTrackWidth = Math.round(LAYOUT_CONFIG.SLIDER.trackWidth * s);
  const sliderTrackHeight = Math.round(LAYOUT_CONFIG.SLIDER.trackHeight * s);
  const knobRadius = Math.round(LAYOUT_CONFIG.SLIDER.knobRadius * s);
  const maxKnobTravel = LAYOUT_CONFIG.SLIDER.knobMaxOffset * s;

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<StickerItem | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec || 25);
  const [isShotActive, setIsShotActive] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0);
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
        turnTimeLimitSeconds: turnTimeLimitSec || 15,
        handoverConfirmationEnabled: false,
      };
      startSession(config, defaultPlayers);
    }
  }, [stateMachine, startSession, selectedMode, boardTheme, targetPoints, turnTimeLimitSec, teamAName, teamBName]);

  // Active player seat lookup
  const activeSeat: PlayerSeat = (currentTurn?.activeSeat as PlayerSeat) ?? 0;

  // Turn state derived for bridge & visuals
  const turnState: 'MY_TURN' | 'AIMING' | 'SHOT_IN_PROGRESS' | 'OPPONENT_TURN' =
    activeSeat !== 0
      ? 'OPPONENT_TURN'
      : isShotActive
        ? 'SHOT_IN_PROGRESS'
        : isAiming
          ? 'AIMING'
          : 'MY_TURN';

  // Turn timer countdown (reset on turn change)
  useEffect(() => {
    if (turnTimeLimitSec <= 0 || isPaused || isShotActive) return;

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
  }, [currentTurn?.turnNumber, turnTimeLimitSec, isPaused, isShotActive]);

  // Handle turn timeout foul
  useEffect(() => {
    if (turnTimeLimitSec > 0 && secondsRemaining === 0 && !isPaused && !isShotActive) {
      showToast('Time expired! Turn passed');
      processSettledShot({
        pocketedCoins: [],
        strikerPocketed: false,
        durationMs: (turnTimeLimitSec || 25) * 1000,
      });
    }
  }, [secondsRemaining, turnTimeLimitSec, isPaused, isShotActive]);

  const handleRestartMatch = () => {
    setShowPauseModal(false);
    restartSession();
    setStrikerOffsetRatio(0);
    setIsStrikerOverlapping(false);
    setIsAiming(false);
    setPowerRatio(0);
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

  const handleStickerSelected = (sticker: StickerItem) => {
    setActiveReaction(sticker);
    AudioManager.getInstance().playSound('BUTTON_CLICK', 0.6);
  };

  // Slider touch handling linearly mapped to striker lane
  const handleSliderTouch = (evt: GestureResponderEvent) => {
    if (isShotActive || isPaused) return;
    const { locationX } = evt.nativeEvent;
    const centerTrack = sliderTrackWidth / 2;
    const diff = locationX - centerTrack;
    const clampedDiff = Math.max(-maxKnobTravel, Math.min(maxKnobTravel, diff));
    const newRatio = clampedDiff / maxKnobTravel;
    setStrikerOffsetRatio(newRatio);
  };

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
  };

  // Turn timer ring color
  const timerRingColor =
    secondsRemaining > 10 ? '#2BD67B' : secondsRemaining > 5 ? '#FFD84A' : '#EF4444';

  const p1 = activePlayers.find((p) => p.seat === 0);
  const p2 = activePlayers.find((p) => p.seat === 2);
  const p1Score = scores[p1?.id ?? '']?.points ?? 0;
  const p2Score = scores[p2?.id ?? '']?.points ?? 0;
  const targetTotal = targetPoints || 115;

  // Knob left position inside track
  const knobCenterTrack = sliderTrackWidth / 2;
  const knobLeft = knobCenterTrack - knobRadius + strikerOffsetRatio * maxKnobTravel;

  // Value legend points from piece config
  const queenPoints = DEFAULT_PIECE_CONFIG.points?.queen || 50;
  const blackPoints = DEFAULT_PIECE_CONFIG.points?.black || 10;
  const whitePoints = DEFAULT_PIECE_CONFIG.points?.white || 20;

  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* 1. HUD SECTION (React Native - Reference Layout) */}
      <View style={[styles.hudContainer, { height: reservedHudHeight }]}>
        {/* Left Player (Hari) */}
        <View style={[styles.playerAvatarContainer, { left: 16 * s, top: 20 * s }]}>
          <View
            style={[
              styles.avatarBox,
              {
                width: 55 * s,
                height: 55 * s,
                borderRadius: 6 * s,
                borderWidth: 2.4 * s,
                borderColor: activeSeat === 0 ? '#2BD67B' : '#FFD84A',
              },
            ]}
          >
            <Text style={[styles.avatarEmoji, { fontSize: 26 * s }]}>
              {p1?.avatarUrl || '👑'}
            </Text>
          </View>
          <Text
            style={[styles.playerName, { fontSize: 11 * s, marginTop: 4 * s }]}
            numberOfLines={1}
          >
            {p1?.name || 'Hari'}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { fontSize: 19 * s }]}>{p1Score}</Text>
            <Text style={[styles.scoreTotal, { fontSize: 14 * s }]}>/{targetTotal}</Text>
          </View>
        </View>

        {/* Center Pot: 3D Stack of Gold Medallions & Amount (400) */}
        <View style={[styles.centerPotWrapper, { top: 12 * s }]}>
          <View style={[styles.goldCoinPile, { width: 58 * s, height: 44 * s }]}>
            {/* Background Soft Brass Glow */}
            <View style={styles.potGlowHalo} />
            {/* Coin 1: Bottom Left */}
            <View
              style={[
                styles.pileCoin,
                {
                  left: 6 * s,
                  top: 14 * s,
                  width: 28 * s,
                  height: 28 * s,
                  borderRadius: 14 * s,
                },
              ]}
            >
              <Text style={{ fontSize: 13 * s }}>👑</Text>
            </View>
            {/* Coin 2: Top Left */}
            <View
              style={[
                styles.pileCoin,
                {
                  left: 6 * s,
                  top: 2 * s,
                  width: 28 * s,
                  height: 28 * s,
                  borderRadius: 14 * s,
                },
              ]}
            >
              <Text style={{ fontSize: 13 * s }}>👑</Text>
            </View>
            {/* Coin 3: Right Stack Head */}
            <View
              style={[
                styles.pileCoin,
                styles.pileCoinRight,
                {
                  left: 22 * s,
                  top: 6 * s,
                  width: 30 * s,
                  height: 30 * s,
                  borderRadius: 15 * s,
                },
              ]}
            >
              <Text style={{ fontSize: 14 * s }}>👑</Text>
            </View>
          </View>
          <Text style={[styles.potAmountText, { fontSize: 26 * s, marginTop: 2 * s }]}>
            400
          </Text>
        </View>

        {/* Right Player (Ramesh Mendis) */}
        <View style={[styles.playerAvatarContainer, { right: 16 * s, top: 20 * s }]}>
          <View
            style={[
              styles.avatarBox,
              {
                width: 55 * s,
                height: 55 * s,
                borderRadius: 6 * s,
                borderWidth: 2.4 * s,
                borderColor: activeSeat === 2 ? '#2BD67B' : '#FFD84A',
              },
            ]}
          >
            <Text style={[styles.avatarEmoji, { fontSize: 26 * s }]}>
              {p2?.avatarUrl || '🐯'}
            </Text>
          </View>
          <Text
            style={[styles.playerName, { fontSize: 11 * s, marginTop: 4 * s }]}
            numberOfLines={1}
          >
            {p2?.name || 'Ramesh Mendis'}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { fontSize: 19 * s }]}>{p2Score}</Text>
            <Text style={[styles.scoreTotal, { fontSize: 14 * s }]}>/{targetTotal}</Text>
          </View>
        </View>

        {/* Value Legend Row (Queen 50 · Black 10 · White 20) */}
        <View style={[styles.valueLegendRow, { top: 185 * s }]}>
          {/* Queen 50 */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendCoin,
                styles.legendCoinQueen,
                { width: 19 * s, height: 19 * s, borderRadius: 9.5 * s },
              ]}
            >
              <View
                style={[
                  styles.legendCoinInner,
                  styles.legendCoinInnerQueen,
                  { width: 7 * s, height: 7 * s, borderRadius: 3.5 * s },
                ]}
              />
            </View>
            <Text style={[styles.legendValueText, { fontSize: 16 * s }]}>{queenPoints}</Text>
          </View>

          {/* Black 10 */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendCoin,
                styles.legendCoinBlack,
                { width: 19 * s, height: 19 * s, borderRadius: 9.5 * s },
              ]}
            >
              <View
                style={[
                  styles.legendCoinInner,
                  styles.legendCoinInnerBlack,
                  { width: 7 * s, height: 7 * s, borderRadius: 3.5 * s },
                ]}
              />
            </View>
            <Text style={[styles.legendValueText, { fontSize: 16 * s }]}>{blackPoints}</Text>
          </View>

          {/* White 20 */}
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendCoin,
                styles.legendCoinWhite,
                { width: 19 * s, height: 19 * s, borderRadius: 9.5 * s },
              ]}
            >
              <View
                style={[
                  styles.legendCoinInner,
                  styles.legendCoinInnerWhite,
                  { width: 7 * s, height: 7 * s, borderRadius: 3.5 * s },
                ]}
              />
            </View>
            <Text style={[styles.legendValueText, { fontSize: 16 * s }]}>{whitePoints}</Text>
          </View>
        </View>
      </View>

      {/* 2. BOARD SECTION (Phaser 3 Canvas - Centered Square) */}
      <View style={[styles.boardWrapper, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        <FloatingReaction
          sticker={activeReaction}
          onDismiss={() => setActiveReaction(null)}
        />

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
          turnState={turnState}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume}
          onStrikerDragged={(offset, isOverlapping) => {
            setStrikerOffsetRatio(offset);
            if (typeof isOverlapping === 'boolean') {
              setIsStrikerOverlapping(isOverlapping);
            }
          }}
          onShotStarted={() => {
            setIsShotActive(true);
            setIsAiming(false);
            setPowerRatio(0);
          }}
          onAimChanged={(details: any) => {
            setPowerRatio(details?.powerRatio ?? 0);
            setAimAngle(details?.angle ?? -Math.PI / 2);
            setIsAiming(!!details?.isAiming && (details?.powerRatio ?? 0) > 0.02);
          }}
          onObjectPocketed={(details) => {
            if (details.type === 'white') {
              AudioManager.getInstance().playSound('COIN_POCKET', 0.85);
              triggerFloatingScore(`⚪ +${whitePoints}`, '#FFFFFF');
              showToast('⚪ White Coin Pocketed!');
            } else if (details.type === 'black') {
              AudioManager.getInstance().playSound('COIN_POCKET', 0.85);
              triggerFloatingScore(`⚫ +${blackPoints}`, '#FFD84A');
              showToast('⚫ Black Coin Pocketed!');
            } else if (details.type === 'queen') {
              AudioManager.getInstance().playSound('QUEEN_POCKET', 1.0);
              triggerFloatingScore(`👑 QUEEN +${queenPoints}`, '#EF4444');
              showToast('👑 QUEEN Pocketed!');
            }
          }}
          onStrikerPocketed={() => {
            AudioManager.getInstance().playSound('FOUL', 0.9);
            triggerFloatingScore('⚠️ FOUL (Striker Pocketed)', '#EF4444');
            showToast('⚠️ Striker Pocketed (Scratch Foul)');
          }}
          onShotSettled={(details: any) => {
            setIsShotActive(false);
            setIsAiming(false);
            setPowerRatio(0);
            setStrikerOffsetRatio(0);
            setIsStrikerOverlapping(false);
            const evalResult = processSettledShot({
              pocketedCoins: details?.pocketed ?? [],
              strikerPocketed: !!details?.strikerPocketed,
              durationMs: details?.duration_ms,
            });

            if (evalResult) {
              if (evalResult.coinsToReturnToBoard && evalResult.coinsToReturnToBoard.length > 0) {
                carromRef.current?.returnCoinsToBoard(evalResult.coinsToReturnToBoard);
              }

              if (evalResult.foulOccurred) {
                AudioManager.getInstance().playSound('FOUL', 0.9);
                showToast(
                  `FOUL: ${evalResult.primaryFoulType === 'striker_pocketed' ? 'Striker Scratch' : 'Foul committed'}`
                );
              } else if (evalResult.queenCoveredThisShot) {
                AudioManager.getInstance().playSound('QUEEN_POCKET', 1.0);
                triggerFloatingScore(`👑 QUEEN COVERED! +${queenPoints}`, '#FFD84A');
                showToast(`👑 QUEEN COVERED! +${queenPoints} Points`);
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

        {/* Right-Edge Vertical Power Bar (Mirrors Phaser power) */}
        <View
          style={[
            styles.rightPowerBarContainer,
            {
              width: Math.max(4, Math.round(4 * s)),
              height: Math.round(24 * s),
              right: 6 * s,
              bottom: 24 * s,
              opacity: isAiming ? 0.95 : 0.4,
            },
          ]}
        >
          <View
            style={[
              styles.rightPowerBarFill,
              {
                height: `${Math.min(100, Math.round(powerRatio * 100))}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* 3. RECESSED WOODEN SLIDER TRACK & BOTTOM CONTROLS */}
      <View style={[styles.bottomControlsSection, { height: reservedBottomHeight }]}>
        {/* Recessed Wooden Baseline Slider Track */}
        <View
          style={[
            styles.sliderArea,
            {
              opacity: isAiming ? 0.55 : 1.0,
            },
          ]}
        >
          <View
            style={[
              styles.woodenSliderTrack,
              {
                width: sliderTrackWidth,
                height: sliderTrackHeight,
                borderRadius: sliderTrackHeight / 2,
              },
              isStrikerOverlapping && styles.woodenSliderTrackOverlap,
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleSliderTouch}
            onResponderMove={handleSliderTouch}
          >
            {/* Inner Trough Guide Line */}
            <View style={styles.innerTroughLine} />

            {/* Draggable Striker Knob */}
            <View
              style={[
                styles.strikerKnob,
                {
                  left: knobLeft,
                  width: knobRadius * 2,
                  height: knobRadius * 2,
                  borderRadius: knobRadius,
                  opacity: isAiming ? 0.45 : 1.0,
                },
                isStrikerOverlapping && styles.strikerKnobOverlap,
              ]}
            >
              {/* Emerald Rim */}
              <View
                style={[
                  styles.strikerKnobRim,
                  {
                    width: knobRadius * 1.6,
                    height: knobRadius * 1.6,
                    borderRadius: knobRadius * 0.8,
                  },
                ]}
              >
                {/* Brass Center Pip */}
                <View
                  style={[
                    styles.strikerKnobCenter,
                    {
                      width: knobRadius * 0.7,
                      height: knobRadius * 0.7,
                      borderRadius: knobRadius * 0.35,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {isStrikerOverlapping && (
            <View style={styles.overlapWarningBadge}>
              <Text style={styles.overlapWarningBadgeText}>
                ⚠️ Striker blocked · Slide away from coin
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Actions Row: Chat (left), Turn Timer (center), Menu (right) */}
        <View style={styles.bottomButtonsRow}>
          {/* Circular Glowing Gold Chat Button */}
          <TouchableOpacity
            style={[
              styles.goldCircleButton,
              {
                width: Math.max(44, Math.round(50 * s)),
                height: Math.max(44, Math.round(50 * s)),
                borderRadius: Math.max(22, Math.round(25 * s)),
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
              setShowStickersModal(true);
            }}
          >
            <View
              style={[
                styles.goldCircleButtonInner,
                {
                  width: Math.max(34, Math.round(38 * s)),
                  height: Math.max(34, Math.round(38 * s)),
                  borderRadius: Math.max(17, Math.round(19 * s)),
                },
              ]}
            >
              <Text style={[styles.goldCircleButtonIcon, { fontSize: 20 * s }]}>💬</Text>
            </View>
          </TouchableOpacity>

          {/* Turn Countdown Display Pill */}
          <View style={styles.turnTimerPill}>
            <Text style={[styles.turnTimerText, { color: timerRingColor, fontSize: 12 * s }]}>
              {activeSeat === 0 ? 'YOUR TURN' : "OPPONENT'S TURN"} · 0:
              {secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </Text>
          </View>

          {/* Circular Glowing Gold Menu Button */}
          <TouchableOpacity
            style={[
              styles.goldCircleButton,
              {
                width: Math.max(44, Math.round(50 * s)),
                height: Math.max(44, Math.round(50 * s)),
                borderRadius: Math.max(22, Math.round(25 * s)),
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
              pauseSession();
              carromRef.current?.pauseGame();
              setShowPauseModal(true);
            }}
          >
            <View
              style={[
                styles.goldCircleButtonInner,
                {
                  width: Math.max(34, Math.round(38 * s)),
                  height: Math.max(34, Math.round(38 * s)),
                  borderRadius: Math.max(17, Math.round(19 * s)),
                },
              ]}
            >
              <Text style={[styles.goldCircleButtonIcon, { fontSize: 20 * s }]}>☰</Text>
            </View>
          </TouchableOpacity>
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
          setIsAiming(false);
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
  },
  hudContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  playerAvatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  avatarBox: {
    backgroundColor: '#3D150B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD84A',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  avatarEmoji: {
    textAlign: 'center',
  },
  playerName: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scoreTotal: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  centerPotWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  potGlowHalo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 216, 74, 0.18)',
    top: -8,
    left: -1,
  },
  goldCoinPile: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pileCoin: {
    position: 'absolute',
    backgroundColor: '#E9B949',
    borderWidth: 1.8,
    borderColor: '#FFEC8B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD84A',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  pileCoinRight: {
    backgroundColor: '#FFD84A',
    borderColor: '#FFF8DC',
    zIndex: 2,
  },
  potAmountText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  valueLegendRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    alignSelf: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendCoin: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendCoinQueen: {
    backgroundColor: '#E23B5A',
    borderColor: '#FFA0B0',
  },
  legendCoinBlack: {
    backgroundColor: '#1B2420',
    borderColor: '#4A524D',
  },
  legendCoinWhite: {
    backgroundColor: '#F5ECD2',
    borderColor: '#FFFFFF',
  },
  legendCoinInner: {
    borderWidth: 1,
  },
  legendCoinInnerQueen: {
    backgroundColor: '#8E162D',
    borderColor: '#FFD84A',
  },
  legendCoinInnerBlack: {
    backgroundColor: '#0A0D0C',
    borderColor: '#2BD67B',
  },
  legendCoinInnerWhite: {
    backgroundColor: '#D4C5A3',
    borderColor: '#2BD67B',
  },
  legendValueText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  boardWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  rightPowerBarContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  rightPowerBarFill: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  bottomControlsSection: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  sliderArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  woodenSliderTrack: {
    backgroundColor: '#5A3012',
    borderWidth: 2,
    borderColor: '#8B5226',
    position: 'relative',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  woodenSliderTrackOverlap: {
    borderColor: '#EF4444',
    backgroundColor: '#3D0D0D',
  },
  innerTroughLine: {
    height: 2,
    width: '88%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  strikerKnob: {
    position: 'absolute',
    backgroundColor: '#FFF8E7',
    borderWidth: 2,
    borderColor: '#2BD67B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2BD67B',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  strikerKnobOverlap: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  strikerKnobRim: {
    borderWidth: 1.5,
    borderColor: '#FFD84A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikerKnobCenter: {
    backgroundColor: '#FFD84A',
  },
  overlapWarningBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(80, 10, 10, 0.88)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  overlapWarningBadgeText: {
    color: '#FF8888',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  goldCircleButton: {
    backgroundColor: '#FFD84A',
    borderWidth: 2.4,
    borderColor: '#FFE27A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD84A',
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  goldCircleButtonInner: {
    backgroundColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldCircleButtonIcon: {
    color: '#FFFFFF',
  },
  turnTimerPill: {
    backgroundColor: 'rgba(25, 6, 4, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 74, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  turnTimerText: {
    fontWeight: '800',
    letterSpacing: 0.5,
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
    borderColor: '#FFD84A',
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
