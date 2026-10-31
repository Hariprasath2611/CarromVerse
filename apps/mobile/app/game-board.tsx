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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 24, 370);

export default function GameBoardScreen() {
  const router = useRouter();
  const carromRef = useRef<PhaserCarromViewRef>(null);
  const { players, boardTheme, turnTimeLimitSec } = useGameSetupStore();
  const { endSession } = useGameSessionStore();

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>('GG!');
  const [secondsRemaining, setSecondsRemaining] = useState(18);
  const [isShotActive, setIsShotActive] = useState(false);
  const [powerRatio, setPowerRatio] = useState(0.65);

  const [playerScore, setPlayerScore] = useState(5);
  const [opponentScore, setOpponentScore] = useState(3);

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
      carromRef.current.shoot(powerRatio);
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

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
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

        <PhaserCarromView
          ref={carromRef}
          size={BOARD_SIZE}
          themeId={boardTheme}
          strikerSkin="emerald"
          activeSeat={0}
          strikerOffset={0}
          onShotStarted={() => setIsShotActive(true)}
          onAimChanged={(details) => setPowerRatio(details.powerRatio)}
          onObjectPocketed={(details) => {
            if (details.type === 'white') {
              setPlayerScore((s) => s + 1);
            } else if (details.type === 'black') {
              setOpponentScore((s) => s + 1);
            } else if (details.type === 'queen') {
              setPlayerScore((s) => s + 3);
            }
          }}
          onShotSettled={() => setIsShotActive(false)}
        />
      </View>

      {/* POWER BAR SECTION */}
      <View style={styles.powerSection}>
        <Text style={styles.powerLabel}>POWER</Text>
        <View style={styles.powerTrack}>
          <View style={[styles.powerFill, { width: `${Math.round(powerRatio * 100)}%` }]} />
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
          title="SHOOT"
          variant="primary"
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
    paddingTop: 12,
    paddingBottom: 20,
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
    height: 52,
    backgroundColor: '#07261C',
    borderColor: '#E9B949',
    borderWidth: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  youCard: {
    flex: 1,
    height: 52,
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 2,
    borderRadius: 20,
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
    marginVertical: 4,
  },
  turnTitleText: {
    color: '#2BD67B',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
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
  powerSection: {
    width: '100%',
    paddingHorizontal: 4,
  },
  powerLabel: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  powerTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  powerFill: {
    height: '100%',
    backgroundColor: '#2BD67B',
    borderRadius: 6,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  controlBtnSide: {
    flex: 1,
  },
  shootBtn: {
    flex: 1.5,
  },
});
