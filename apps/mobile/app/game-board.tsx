import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  PauseModal,
  PhaserCarromView,
  PhaserCarromViewRef,
  PlayerAvatar,
  ScreenContainer,
  StickersModal,
} from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { useGameSessionStore } from '../src/store/gameSessionStore';
import { THEME } from '../src/constants/theme';

export default function GameBoardScreen() {
  const router = useRouter();
  const carromRef = useRef<PhaserCarromViewRef>(null);
  const { boardTheme } = useGameSetupStore();
  const { endSession } = useGameSessionStore();

  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => sub?.remove();
  }, []);

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;
  // Dynamically calculate board size so HUD, board, power bar, and controls fit comfortably on any screen
  const availableBoardHeight = screenHeight - 310;
  const BOARD_SIZE = Math.floor(Math.min(screenWidth - 24, availableBoardHeight, 355));

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>('GG!');
  const [secondsRemaining, setSecondsRemaining] = useState(18);
  const [isShotActive, setIsShotActive] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0.65);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0);

  const [playerScore, setPlayerScore] = useState(5);
  const [opponentScore, setOpponentScore] = useState(3);
  const [pocketToast, setPocketToast] = useState<string | null>(null);

  // Turn timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShoot = () => {
    if (isShotActive) return;
    if (carromRef.current) {
      carromRef.current.shoot(powerRatio, aimAngle);
    }
  };

  const handleFinishMatch = () => {
    endSession();
    router.replace('/game-result');
  };

  const handleStickerSelected = (sticker: { text: string }) => {
    setActiveReaction(sticker.text);
    setTimeout(() => {
      setActiveReaction(null);
    }, 3000);
  };

  const handleNudgeStriker = (delta: number) => {
    if (isShotActive) return;
    const newOffset = Math.max(-0.92, Math.min(0.92, strikerOffsetRatio + delta));
    setStrikerOffsetRatio(newOffset);
  };

  const handlePowerTouch = (locationX: number, totalWidth: number) => {
    if (isShotActive || totalWidth <= 0) return;
    const ratio = Math.max(0.15, Math.min(1.0, locationX / totalWidth));
    setPowerRatio(ratio);
  };

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
  };

  const getPowerColor = () => {
    if (powerRatio > 0.75) return '#E23B5A'; // Fiery red
    if (powerRatio > 0.45) return '#E9B949'; // Gold
    return '#2BD67B'; // Emerald
  };

  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* TOP PLAYERS HUD */}
      <View style={styles.topHudRow}>
        {/* Opponent Card (Arun) */}
        <View style={styles.opponentCard}>
          <View style={styles.playerInfoLeft}>
            <PlayerAvatar
              name="Arun"
              size={36}
              colorVariant="gold"
              ringColor="#E9B949"
            />
            <Text style={styles.playerNameText}>ARUN</Text>
          </View>
          <Text style={styles.opponentScoreText}>{opponentScore}</Text>
        </View>

        {/* You Card */}
        <View style={styles.youCard}>
          <View style={styles.playerInfoLeft}>
            <PlayerAvatar
              name="You"
              size={36}
              colorVariant="emerald"
              ringColor="#2BD67B"
            />
            <Text style={styles.playerNameText}>YOU</Text>
          </View>
          <Text style={styles.youScoreText}>{playerScore}</Text>
        </View>
      </View>

      {/* TURN & TIMER TITLE */}
      <View style={styles.turnTitleWrap}>
        <Text style={styles.turnTitleText}>
          YOUR TURN · 0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
        </Text>
      </View>

      {/* CARROM BOARD CONTAINER (WITH PHASER ENGINE & REACTION BUBBLE) */}
      <View style={styles.boardContainer}>
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

        <PhaserCarromView
          ref={carromRef}
          size={BOARD_SIZE}
          themeId={boardTheme}
          strikerSkin="emerald"
          activeSeat={0}
          strikerOffset={strikerOffsetRatio}
          onStrikerDragged={(offset) => setStrikerOffsetRatio(offset)}
          onShotStarted={() => setIsShotActive(true)}
          onAimChanged={(details) => {
            setPowerRatio(details.powerRatio);
            setAimAngle(details.angle);
          }}
          onObjectPocketed={(details) => {
            if (details.type === 'white') {
              setPlayerScore((s) => s + 1);
              showToast('White Coin Pocketed! +1');
            } else if (details.type === 'black') {
              setOpponentScore((s) => s + 1);
              showToast('Black Coin Pocketed! +1');
            } else if (details.type === 'queen') {
              setPlayerScore((s) => s + 3);
              showToast('QUEEN Pocketed! +3');
            }
          }}
          onStrikerPocketed={() => {
            showToast('Striker Foul! Penalty');
          }}
          onShotSettled={() => {
            setIsShotActive(false);
          }}
        />
      </View>

      {/* TACTILE BASELINE POSITIONER */}
      <View style={styles.baselineControllerRow}>
        <TouchableOpacity
          style={styles.nudgeBtn}
          onPress={() => handleNudgeStriker(-0.12)}
          disabled={isShotActive}
          hitSlop={8}
        >
          <Text style={styles.nudgeBtnText}>◀</Text>
        </TouchableOpacity>

        <View style={styles.baselineTrack}>
          <View
            style={[
              styles.baselineMarker,
              {
                left: `${((strikerOffsetRatio + 1) / 2) * 88 + 6}%`,
              },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.nudgeBtn}
          onPress={() => handleNudgeStriker(0.12)}
          disabled={isShotActive}
          hitSlop={8}
        >
          <Text style={styles.nudgeBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* INTERACTIVE POWER BAR SECTION */}
      <View style={styles.powerSection}>
        <View style={styles.powerHeaderRow}>
          <Text style={styles.powerLabel}>POWER</Text>
          <Text style={[styles.powerPercentText, { color: getPowerColor() }]}>
            {Math.round(powerRatio * 100)}%
          </Text>
        </View>

        <View
          style={styles.powerTouchArea}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            const { locationX } = e.nativeEvent;
            handlePowerTouch(locationX, screenWidth - 40);
          }}
          onResponderMove={(e) => {
            const { locationX } = e.nativeEvent;
            handlePowerTouch(locationX, screenWidth - 40);
          }}
        >
          <View style={styles.powerTrack}>
            <View
              style={[
                styles.powerFill,
                {
                  width: `${Math.round(powerRatio * 100)}%`,
                  backgroundColor: getPowerColor(),
                },
              ]}
            />
            {/* Glowing tactile slider thumb */}
            <View
              style={[
                styles.powerThumb,
                {
                  left: `${Math.max(0, Math.min(96, powerRatio * 100 - 2))}%`,
                  borderColor: getPowerColor(),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* BOTTOM CONTROLS: EMOTE | SHOOT | PAUSE */}
      <View style={styles.bottomControlsRow}>
        <Button
          title="EMOTE"
          variant="secondary"
          onPress={() => setShowStickersModal(true)}
          style={styles.controlBtnSide}
        />

        <Button
          title={isShotActive ? 'MOVING...' : 'SHOOT'}
          variant="primary"
          disabled={isShotActive}
          onPress={handleShoot}
          style={styles.shootBtn}
        />

        <Button
          title="PAUSE"
          variant="secondary"
          onPress={() => setShowPauseModal(true)}
          style={styles.controlBtnSide}
        />
      </View>

      {/* MODALS */}
      <PauseModal
        visible={showPauseModal}
        onResume={() => setShowPauseModal(false)}
        onExit={handleFinishMatch}
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
    flex: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  topHudRow: {
    flexDirection: 'row',
    gap: 12,
  },
  opponentCard: {
    flex: 1,
    height: 50,
    backgroundColor: '#07261C',
    borderColor: '#E9B949',
    borderWidth: 2,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  youCard: {
    flex: 1,
    height: 50,
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 2,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  playerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerNameText: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  opponentScoreText: {
    color: '#E9B949',
    fontSize: 20,
    fontWeight: '900',
  },
  youScoreText: {
    color: '#2BD67B',
    fontSize: 20,
    fontWeight: '900',
  },
  turnTitleWrap: {
    alignItems: 'center',
    marginVertical: 2,
  },
  turnTitleText: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  reactionBubble: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F5ECD2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 10,
    elevation: 8,
  },
  reactionText: {
    color: '#07261C',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toastBubble: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'rgba(7, 38, 28, 0.94)',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 12,
    elevation: 10,
  },
  toastText: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  baselineControllerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 10,
    marginVertical: 2,
  },
  nudgeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeBtnText: {
    color: '#2BD67B',
    fontSize: 14,
    fontWeight: '900',
  },
  baselineTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  baselineMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2BD67B',
    borderColor: '#169352',
    borderWidth: 2,
    top: -4,
  },
  powerSection: {
    width: '100%',
    paddingHorizontal: 4,
  },
  powerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  powerLabel: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  powerPercentText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  powerTouchArea: {
    paddingVertical: 4,
  },
  powerTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    position: 'relative',
    justifyContent: 'center',
  },
  powerFill: {
    height: '100%',
    borderRadius: 6,
  },
  powerThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F5ECD2',
    borderWidth: 2.5,
    top: -3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  controlBtnSide: {
    flex: 1,
  },
  shootBtn: {
    flex: 1.5,
  },
});
