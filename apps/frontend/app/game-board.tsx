import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
    savedConfig,
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
  // Maximized board size preserving strict 1:1 aspect ratio with compact footer controls
  const availableBoardHeight = screenHeight - 130;
  const BOARD_SIZE = Math.floor(Math.min(screenWidth - 8, availableBoardHeight, 520));

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(turnTimeLimitSec || 25);
  const [isShotActive, setIsShotActive] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0.55);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [strikerOffsetRatio, setStrikerOffsetRatio] = useState(0);
  const [pocketToast, setPocketToast] = useState<string | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ text: string; color: string } | null>(null);

  // Background music management
  useEffect(() => {
    AudioManager.getInstance().playMusic('gameplay');
    return () => {
      AudioManager.getInstance().stopMusic();
    };
  }, []);

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
        boardTheme,
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
    if (turnTimeLimitSec <= 0 || isPaused || isHandoverPending) return;

    setSecondsRemaining(turnTimeLimitSec);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired foul -> Advance turn to next player
          showToast('Time expired! Turn passed');
          processSettledShot({
            pocketedCoins: [],
            strikerPocketed: false,
            durationMs: (turnTimeLimitSec || 25) * 1000,
          });
          return turnTimeLimitSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurn?.turnNumber, turnTimeLimitSec, isPaused, isHandoverPending]);

  const handleShoot = () => {
    if (isShotActive || isHandoverPending || isPaused) return;
    AudioManager.getInstance().playSound('STRIKER_SHOOT', powerRatio);
    if (carromRef.current) {
      carromRef.current.shoot(powerRatio, aimAngle);
    }
  };

  const handleRestartMatch = () => {
    setShowPauseModal(false);
    restartSession();
    setStrikerOffsetRatio(0);
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

  const showToast = (msg: string) => {
    setPocketToast(msg);
    setTimeout(() => setPocketToast(null), 2500);
  };

  // Team scores computation for 2v2
  const teamAScore = (scores['player_0']?.points ?? 0) + (scores['player_2']?.points ?? 0);
  const teamBScore = (scores['player_1']?.points ?? 0) + (scores['player_3']?.points ?? 0);

  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.container}
    >
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* TOP PLAYERS HUD - DYNAMIC ACROSS ALL MODES */}
      {selectedMode === 'four_player_team' ? (
        // 2v2 Team Mode HUD
        <View style={styles.topHudRow}>
          <View
            style={[
              styles.teamCard,
              styles.teamCardA,
              activePlayer.teamId === 'team_a' && styles.activePlayerGlow,
            ]}
          >
            <View style={styles.teamAvatarsRow}>
              <Text style={styles.teamEmoji}>{activePlayers.find((p) => p.seat === 0)?.avatarUrl || '👑'}</Text>
              <Text style={styles.teamEmoji}>{activePlayers.find((p) => p.seat === 2)?.avatarUrl || '🦅'}</Text>
              <View>
                <Text style={styles.teamTitle} numberOfLines={1}>{teamAName}</Text>
                <Text style={styles.teamTargetCoin}>⚪ White</Text>
              </View>
            </View>
            <Text style={styles.teamScoreText}>{teamAScore}</Text>
          </View>

          <View
            style={[
              styles.teamCard,
              styles.teamCardB,
              activePlayer.teamId === 'team_b' && styles.activePlayerGlowGold,
            ]}
          >
            <View style={styles.teamAvatarsRow}>
              <Text style={styles.teamEmoji}>{activePlayers.find((p) => p.seat === 1)?.avatarUrl || '🐯'}</Text>
              <Text style={styles.teamEmoji}>{activePlayers.find((p) => p.seat === 3)?.avatarUrl || '🦁'}</Text>
              <View>
                <Text style={styles.teamTitle} numberOfLines={1}>{teamBName}</Text>
                <Text style={styles.teamTargetCoin}>⚫ Black</Text>
              </View>
            </View>
            <Text style={styles.teamScoreTextGold}>{teamBScore}</Text>
          </View>
        </View>
      ) : selectedMode === 'two_player_individual' ? (
        // 2-Player 1v1 Mode HUD
        <View style={styles.topHudRow}>
          {/* Opponent (North / Seat 2) */}
          <View
            style={[
              styles.opponentCard,
              activeSeat === 2 && styles.activePlayerGlowGold,
            ]}
          >
            <View style={styles.playerInfoLeft}>
              <View style={[styles.avatarBox, styles.avatarBoxGold]}>
                <Text style={styles.avatarEmojiText}>
                  {activePlayers.find((p) => p.seat === 2)?.avatarUrl || '🐯'}
                </Text>
              </View>
              <View>
                <Text style={styles.playerNameText} numberOfLines={1}>
                  {activePlayers.find((p) => p.seat === 2)?.name || 'Player 2'}
                </Text>
                <Text style={styles.coinIndicator}>⚫ Black</Text>
              </View>
            </View>
            <Text style={styles.opponentScoreText}>
              {scores[activePlayers.find((p) => p.seat === 2)?.id ?? '']?.points ?? 0}
            </Text>
          </View>

          {/* You / Player 1 (South / Seat 0) */}
          <View
            style={[
              styles.youCard,
              activeSeat === 0 && styles.activePlayerGlow,
            ]}
          >
            <View style={styles.playerInfoLeft}>
              <View style={[styles.avatarBox, styles.avatarBoxEmerald]}>
                <Text style={styles.avatarEmojiText}>
                  {activePlayers.find((p) => p.seat === 0)?.avatarUrl || '👑'}
                </Text>
              </View>
              <View>
                <Text style={styles.playerNameText} numberOfLines={1}>
                  {activePlayers.find((p) => p.seat === 0)?.name || 'Player 1'}
                </Text>
                <Text style={styles.coinIndicator}>⚪ White</Text>
              </View>
            </View>
            <Text style={styles.youScoreText}>
              {scores[activePlayers.find((p) => p.seat === 0)?.id ?? '']?.points ?? 0}
            </Text>
          </View>
        </View>
      ) : (
        // 3-Player or 4-Player Individual Mode HUD
        <View style={styles.multiPlayerHudRow}>
          {activePlayers.map((p) => {
            const isActive = p.seat === activeSeat;
            const pScore = scores[p.id]?.points ?? 0;
            return (
              <View
                key={p.id}
                style={[
                  styles.multiPlayerChip,
                  isActive && styles.multiPlayerChipActive,
                ]}
              >
                <Text style={styles.multiPlayerEmoji}>{p.avatarUrl || '👑'}</Text>
                <View style={styles.multiPlayerTextCol}>
                  <Text style={styles.multiPlayerName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.multiPlayerScore}>{pScore} pts</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* TURN & TIMER TITLE */}
      <View style={styles.turnTitleWrap}>
        <Text style={styles.turnTitleText}>
          {activePlayer.name.toUpperCase()}'S TURN
          {queenStatus === 'pending_cover' ? ' · 👑 COVER QUEEN' : ''}
          {turnTimeLimitSec > 0
            ? ` · 0:${secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}`
            : ''}
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
          themeId={boardTheme}
          strikerSkin="emerald"
          activeSeat={activeSeat}
          strikerOffset={strikerOffsetRatio}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume}
          onStrikerDragged={(offset) => setStrikerOffsetRatio(offset)}
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
                showToast(`FOUL: ${evalResult.primaryFoulType === 'striker_pocketed' ? 'Striker Scratch' : 'Foul committed'}`);
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
      </View>

      {/* BOTTOM CONTROLS FOOTER: BASELINE POSITIONER & COMPACT ACTIONS */}
      <View style={styles.bottomFooterWrap}>
        {/* TACTILE BASELINE POSITIONER */}
        <View style={styles.baselineControllerRow}>
          <TouchableOpacity
            style={styles.nudgeBtn}
            onPress={() => handleNudgeStriker(-0.12)}
            disabled={isShotActive || isHandoverPending}
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
            disabled={isShotActive || isHandoverPending}
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
            onPress={() => {
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
              setShowStickersModal(true);
            }}
            style={styles.controlBtnSide}
            textStyle={styles.controlBtnText}
          />

          <Button
            title={isShotActive ? 'MOVING...' : 'SHOOT'}
            variant="primary"
            size="sm"
            disabled={isShotActive || isHandoverPending}
            onPress={handleShoot}
            style={styles.shootBtn}
            textStyle={styles.shootBtnText}
          />

          <Button
            title="PAUSE"
            variant="secondary"
            size="sm"
            onPress={() => {
              AudioManager.getInstance().playSound('BUTTON_CLICK', 0.5);
              pauseSession();
              carromRef.current?.pauseGame();
              setShowPauseModal(true);
            }}
            style={styles.controlBtnSide}
            textStyle={styles.controlBtnText}
          />
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
  topHudRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opponentCard: {
    flex: 1,
    height: 48,
    backgroundColor: '#07261C',
    borderColor: '#E9B949',
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  youCard: {
    flex: 1,
    height: 48,
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  teamCard: {
    flex: 1,
    height: 48,
    backgroundColor: '#07261C',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  teamCardA: {
    borderColor: '#2BD67B',
  },
  teamCardB: {
    borderColor: '#E9B949',
  },
  teamAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamEmoji: {
    fontSize: 18,
  },
  teamTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 80,
  },
  teamTargetCoin: {
    color: '#9FD8B8',
    fontSize: 9,
    fontWeight: '700',
  },
  teamScoreText: {
    color: '#2BD67B',
    fontSize: 20,
    fontWeight: '900',
  },
  teamScoreTextGold: {
    color: '#E9B949',
    fontSize: 20,
    fontWeight: '900',
  },
  activePlayerGlow: {
    borderColor: '#2BD67B',
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  activePlayerGlowGold: {
    borderColor: '#E9B949',
    backgroundColor: 'rgba(233, 185, 73, 0.15)',
    shadowColor: '#E9B949',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  playerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  avatarBoxEmerald: {
    backgroundColor: 'rgba(43, 214, 123, 0.2)',
    borderColor: '#2BD67B',
  },
  avatarBoxGold: {
    backgroundColor: 'rgba(233, 185, 73, 0.2)',
    borderColor: '#E9B949',
  },
  avatarEmojiText: {
    fontSize: 18,
  },
  playerNameText: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    maxWidth: 90,
  },
  coinIndicator: {
    color: '#9FD8B8',
    fontSize: 9,
    fontWeight: '700',
  },
  opponentScoreText: {
    color: '#E9B949',
    fontSize: 18,
    fontWeight: '900',
  },
  youScoreText: {
    color: '#2BD67B',
    fontSize: 18,
    fontWeight: '900',
  },
  multiPlayerHudRow: {
    flexDirection: 'row',
    gap: 6,
  },
  multiPlayerChip: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(7, 38, 28, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 6,
  },
  multiPlayerChipActive: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
  },
  multiPlayerEmoji: {
    fontSize: 18,
  },
  multiPlayerTextCol: {
    flex: 1,
  },
  multiPlayerName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  multiPlayerScore: {
    color: '#2BD67B',
    fontSize: 10,
    fontWeight: '700',
  },
  turnTitleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  turnTitleText: {
    color: '#2BD67B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 'auto',
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
  bottomFooterWrap: {
    width: '100%',
    gap: 4,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  baselineControllerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  nudgeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 90, 62, 0.7)',
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
    height: 10,
    backgroundColor: 'rgba(7, 38, 28, 0.85)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(43, 214, 123, 0.4)',
    justifyContent: 'center',
  },
  baselineMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2BD67B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    top: -4,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlBtnSide: {
    flex: 1,
    height: 36,
  },
  shootBtn: {
    flex: 1.5,
    height: 36,
  },
  controlBtnText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  shootBtnText: {
    fontSize: 13,
    letterSpacing: 0.8,
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
