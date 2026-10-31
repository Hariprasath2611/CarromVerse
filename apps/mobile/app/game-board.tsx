import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
import { Player } from '@carromverse/shared-types';
import { createDefaultGameConfig } from '@carromverse/game-logic';

export default function GameBoardScreen() {
  const router = useRouter();
  const carromRef = useRef<PhaserCarromViewRef>(null);
  const { boardTheme } = useGameSetupStore();
  const {
    stateMachine,
    startSession,
    processSettledShot,
    scores,
    currentTurn,
    queenStatus,
    endSession,
  } = useGameSessionStore();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Dynamically calculate board size to maximize the board and coin view across screens
  const availableBoardHeight = screenHeight - 165;
  const BOARD_SIZE = Math.floor(Math.min(screenWidth - 10, availableBoardHeight, 460));

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(18);
  const [isShotActive, setIsShotActive] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0.75);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0);
  const [pocketToast, setPocketToast] = useState<string | null>(null);

  // Initialize rules engine session if not active
  useEffect(() => {
    if (!stateMachine) {
      const defaultPlayers: Player[] = [
        {
          id: 'p1_you',
          name: 'You',
          type: 'human',
          seat: 0,
          position: 'bottom',
          assignedCoinType: 'white',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'p2_arun',
          name: 'Arun',
          type: 'bot',
          seat: 2,
          position: 'top',
          assignedCoinType: 'black',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];
      const config = createDefaultGameConfig('two_player_individual');
      startSession(config, defaultPlayers);
    }
  }, [stateMachine, startSession]);

  const playerScore = scores['p1_you']?.points ?? 0;
  const opponentScore = scores['p2_arun']?.points ?? 0;
  const isYourTurn = !currentTurn || currentTurn.activePlayerId === 'p1_you';

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

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
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
          {isYourTurn ? 'YOUR TURN' : "ARUN'S TURN"}
          {queenStatus === 'pending_cover' ? ' · COVER QUEEN' : ''} · 0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
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
              showToast('White Coin Pocketed!');
            } else if (details.type === 'black') {
              showToast('Black Coin Pocketed!');
            } else if (details.type === 'queen') {
              showToast('QUEEN Pocketed!');
            }
          }}
          onStrikerPocketed={() => {
            showToast('Striker Pocketed (Foul)');
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
                showToast(`FOUL: ${evalResult.primaryFoulType === 'striker_pocketed' ? 'Striker Scratch' : 'Foul committed'}`);
              } else if (evalResult.queenCoveredThisShot) {
                showToast('QUEEN COVERED! +25 Points');
              } else if (evalResult.queenStatusAfter === 'pending_cover') {
                showToast('Queen Pocketed! Pocket assigned coin to cover');
              } else if (evalResult.queenReturnedToCenter) {
                showToast('Failed to cover Queen! Returned to center');
              } else if (evalResult.extraTurnEarned) {
                showToast('Coin Pocketed! Extra Turn');
              } else {
                showToast('Dry shot · Turn passed');
              }

              if (evalResult.isMatchOver) {
                setTimeout(() => {
                  router.replace('/game-result');
                }, 1800);
              }
            }
          }}
        />
      </View>

      {/* TACTILE BASELINE POSITIONER (BROUGHT DOWN NEAR CONTROLS) */}
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

      {/* COMPACT BOTTOM CONTROLS: EMOTE | SHOOT | PAUSE */}
      <View style={styles.bottomControlsRow}>
        <Button
          title="EMOTE"
          variant="secondary"
          size="sm"
          onPress={() => setShowStickersModal(true)}
          style={styles.controlBtnSide}
        />

        <Button
          title={isShotActive ? 'MOVING...' : 'SHOOT'}
          variant="primary"
          size="sm"
          disabled={isShotActive}
          onPress={handleShoot}
          style={styles.shootBtn}
        />

        <Button
          title="PAUSE"
          variant="secondary"
          size="sm"
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
    paddingHorizontal: 8,
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  nudgeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  controlBtnSide: {
    flex: 1,
  },
  shootBtn: {
    flex: 1.4,
  },
});
