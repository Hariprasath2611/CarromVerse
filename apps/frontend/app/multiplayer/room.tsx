import React, { useEffect } from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BoardPreview,
  Button,
  Card,
  Header,
  PlayerAvatar,
  ScreenContainer,
} from '../../src/components';
import { useMultiplayerRoomStore } from '../../src/store/multiplayerRoomStore';
import { useAuthStore } from '../../src/store/authStore';
import { THEME } from '../../src/constants/theme';
import { AudioManager } from '../../src/services/audio/AudioManager';

export default function MultiplayerRoomScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    roomCode,
    status,
    gameMode,
    maxPlayers,
    boardTheme,
    targetScore,
    turnTimeLimitSeconds,
    teamAName,
    teamBName,
    players,
    isHost,
    isReady,
    allPlayersReady,
    countdown,
    matchStarted,
    toggleReady,
    switchTeam,
    kickPlayer,
    startMatch,
    leaveRoom,
  } = useMultiplayerRoomStore();

  // If match started, redirect to game board
  useEffect(() => {
    if (matchStarted) {
      AudioManager.getInstance().playSound('MATCH_START', 0.85);
      router.replace('/game-board');
    }
  }, [matchStarted]);

  const handleShare = async () => {
    if (!roomCode) return;
    try {
      const modeLabel =
        gameMode === 'two_player_individual'
          ? '1v1 Classic'
          : gameMode === 'four_player_team'
          ? '2v2 Doubles'
          : gameMode === 'three_player_individual'
          ? '3-Player Points'
          : 'Free For All';

      await Share.share({
        title: 'CarromVerse Room Invitation',
        message: `Join my CarromVerse match! Room Code: ${roomCode} (${modeLabel}). Open CarromVerse and enter the room code to play!`,
      });
    } catch (err: any) {
      Alert.alert('Share Failed', err?.message || 'Could not trigger native share sheet.');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this multiplayer lobby?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await leaveRoom();
            router.replace('/multiplayer');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleKick = (sessionId: string, playerName: string) => {
    Alert.alert('Kick Player', `Remove ${playerName} from the room?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Kick',
        style: 'destructive',
        onPress: () => kickPlayer(sessionId),
      },
    ]);
  };

  const getPlayerAtSeat = (seat: number) => {
    return players.find((p) => p.seat === seat);
  };

  const southPlayer = getPlayerAtSeat(0);
  const eastPlayer = getPlayerAtSeat(1);
  const northPlayer = getPlayerAtSeat(2);
  const westPlayer = getPlayerAtSeat(3);

  const modeTitle =
    gameMode === 'two_player_individual'
      ? '2 Players · 1v1 Classic'
      : gameMode === 'three_player_individual'
      ? '3 Players · Points Carrom'
      : gameMode === 'four_player_team'
      ? `4 Players · 2v2 (${teamAName} vs ${teamBName})`
      : '4 Players · Free For All';

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.container}>
      {/* Decorative bokeh circles */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Header */}
      <Header
        title="MULTIPLAYER LOBBY"
        subtitle={modeTitle}
        showBack
        rightAction={
          <TouchableOpacity style={styles.leavePill} onPress={handleLeave}>
            <Text style={styles.leaveText}>EXIT</Text>
          </TouchableOpacity>
        }
      />

      {/* ROOM CODE & SHARE HERO CARD */}
      <Card style={styles.codeCard}>
        <View style={styles.codeTextWrapper}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeValue}>{roomCode || '------'}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareBtnText}>SHARE CODE</Text>
        </TouchableOpacity>
      </Card>

      {/* LOBBY STATUS BANNER */}
      <View
        style={[
          styles.statusBanner,
          status === 'STARTING' && styles.statusBannerStarting,
          status === 'READY' && styles.statusBannerReady,
        ]}
      >
        <Text style={styles.statusBannerText}>
          {status === 'STARTING'
            ? `🔥 MATCH STARTING IN ${countdown ?? 3}...`
            : status === 'READY'
            ? '✓ ALL PLAYERS READY! HOST CAN START'
            : `WAITING FOR PLAYERS (${players.length}/${maxPlayers})`}
        </Text>
      </View>

      {/* TABLE VISUALIZATION CARD */}
      <Card style={styles.tableCard}>
        {/* North Player (Seat 2) */}
        <View style={styles.seatRowNorth}>
          {northPlayer ? (
            <View style={styles.playerSlot}>
              <View style={styles.avatarWrapper}>
                <PlayerAvatar
                  name={northPlayer.displayName}
                  avatarUrl={northPlayer.avatar}
                  size={48}
                  colorVariant={northPlayer.teamId === 'team_b' ? 'gold' : 'emerald'}
                  ringColor={northPlayer.isReady ? '#2BD67B' : '#E9B949'}
                />
                {northPlayer.isHost && (
                  <View style={styles.crownBadge}>
                    <Text style={styles.crownText}>👑</Text>
                  </View>
                )}
              </View>
              <Text style={styles.slotName} numberOfLines={1}>{northPlayer.displayName}</Text>
              <View style={[styles.readyTag, northPlayer.isReady ? styles.readyTagOn : styles.readyTagOff]}>
                <Text style={[styles.readyTagText, northPlayer.isReady ? styles.readyTagTextOn : styles.readyTagTextOff]}>
                  {northPlayer.isReady ? 'READY' : 'NOT READY'}
                </Text>
              </View>
              {isHost && !northPlayer.isHost && (
                <TouchableOpacity onPress={() => handleKick(northPlayer.id, northPlayer.displayName)} style={styles.kickBtn}>
                  <Text style={styles.kickText}>Kick</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Waiting for Seat 2...</Text>
            </View>
          )}
        </View>

        {/* Middle Row: West + Board + East */}
        <View style={styles.middleRow}>
          {/* West Player (Seat 3) */}
          <View style={styles.sideSlot}>
            {westPlayer ? (
              <View style={styles.playerSlot}>
                <View style={styles.avatarWrapper}>
                  <PlayerAvatar
                    name={westPlayer.displayName}
                    avatarUrl={westPlayer.avatar}
                    size={44}
                    colorVariant="gold"
                    ringColor={westPlayer.isReady ? '#2BD67B' : '#E9B949'}
                  />
                  {westPlayer.isHost && (
                    <View style={styles.crownBadge}>
                      <Text style={styles.crownText}>👑</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.slotName} numberOfLines={1}>{westPlayer.displayName}</Text>
                <View style={[styles.readyTag, westPlayer.isReady ? styles.readyTagOn : styles.readyTagOff]}>
                  <Text style={[styles.readyTagText, westPlayer.isReady ? styles.readyTagTextOn : styles.readyTagTextOff]}>
                    {westPlayer.isReady ? 'READY' : 'WAITING'}
                  </Text>
                </View>
                {isHost && !westPlayer.isHost && (
                  <TouchableOpacity onPress={() => handleKick(westPlayer.id, westPlayer.displayName)} style={styles.kickBtn}>
                    <Text style={styles.kickText}>Kick</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : maxPlayers >= 4 ? (
              <View style={styles.emptySlotSide}>
                <Text style={styles.emptySlotText}>Seat 3</Text>
              </View>
            ) : null}
          </View>

          {/* Board Center Preview */}
          <View style={styles.boardCenter}>
            <BoardPreview size={120} theme={boardTheme} />
          </View>

          {/* East Player (Seat 1) */}
          <View style={styles.sideSlot}>
            {eastPlayer ? (
              <View style={styles.playerSlot}>
                <View style={styles.avatarWrapper}>
                  <PlayerAvatar
                    name={eastPlayer.displayName}
                    avatarUrl={eastPlayer.avatar}
                    size={44}
                    colorVariant={eastPlayer.teamId === 'team_b' ? 'gold' : 'emerald'}
                    ringColor={eastPlayer.isReady ? '#2BD67B' : '#E9B949'}
                  />
                  {eastPlayer.isHost && (
                    <View style={styles.crownBadge}>
                      <Text style={styles.crownText}>👑</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.slotName} numberOfLines={1}>{eastPlayer.displayName}</Text>
                <View style={[styles.readyTag, eastPlayer.isReady ? styles.readyTagOn : styles.readyTagOff]}>
                  <Text style={[styles.readyTagText, eastPlayer.isReady ? styles.readyTagTextOn : styles.readyTagTextOff]}>
                    {eastPlayer.isReady ? 'READY' : 'WAITING'}
                  </Text>
                </View>
                {isHost && !eastPlayer.isHost && (
                  <TouchableOpacity onPress={() => handleKick(eastPlayer.id, eastPlayer.displayName)} style={styles.kickBtn}>
                    <Text style={styles.kickText}>Kick</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : maxPlayers >= 3 ? (
              <View style={styles.emptySlotSide}>
                <Text style={styles.emptySlotText}>Seat 1</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* South Player (Seat 0 / Creator) */}
        <View style={styles.seatRowSouth}>
          {southPlayer ? (
            <View style={styles.playerSlot}>
              <View style={styles.avatarWrapper}>
                <PlayerAvatar
                  name={southPlayer.displayName}
                  avatarUrl={southPlayer.avatar}
                  size={48}
                  colorVariant="emerald"
                  ringColor={southPlayer.isReady ? '#2BD67B' : '#E9B949'}
                />
                {southPlayer.isHost && (
                  <View style={styles.crownBadge}>
                    <Text style={styles.crownText}>👑</Text>
                  </View>
                )}
              </View>
              <Text style={styles.slotName} numberOfLines={1}>{southPlayer.displayName}</Text>
              <View style={[styles.readyTag, southPlayer.isReady ? styles.readyTagOn : styles.readyTagOff]}>
                <Text style={[styles.readyTagText, southPlayer.isReady ? styles.readyTagTextOn : styles.readyTagTextOff]}>
                  {southPlayer.isReady ? 'READY' : 'NOT READY'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Connecting host...</Text>
            </View>
          )}
        </View>
      </Card>

      {/* 2v2 Team Switch Control */}
      {gameMode === 'four_player_team' && (
        <Card style={styles.teamSwitchCard}>
          <Text style={styles.teamSwitchTitle}>2v2 Team Roster</Text>
          <Text style={styles.teamSwitchDesc}>
            Team A (White): Seats 0 & 2 · Team B (Black): Seats 1 & 3
          </Text>
          <Button
            title="SWITCH MY TEAM"
            size="sm"
            variant="secondary"
            onPress={() => switchTeam()}
            style={styles.switchTeamBtn}
          />
        </Card>
      )}

      {/* Bottom Actions: Ready Toggle & Host Start */}
      <View style={styles.actionsContainer}>
        <Button
          title={isReady ? 'I AM READY ✓' : 'SET AS READY'}
          variant={isReady ? 'primary' : 'secondary'}
          onPress={toggleReady}
          style={styles.actionBtn}
        />

        {isHost && (
          <Button
            title="START MATCH"
            variant="gold"
            disabled={!allPlayersReady || players.length < maxPlayers}
            onPress={startMatch}
            style={styles.actionBtn}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bokehTop: {
    position: 'absolute',
    top: 40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 60,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  leavePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(226, 59, 90, 0.2)',
    borderColor: '#E23B5A',
    borderWidth: 1,
    borderRadius: 8,
  },
  leaveText: {
    color: '#E23B5A',
    fontSize: 11,
    fontWeight: '800',
  },
  codeCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
    borderWidth: 2,
    borderRadius: 18,
    padding: 16,
    marginVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTextWrapper: {
    flex: 1,
  },
  codeLabel: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  codeValue: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11573C',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  shareIcon: {
    fontSize: 16,
  },
  shareBtnText: {
    color: '#2BD67B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusBanner: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  statusBannerReady: {
    backgroundColor: 'rgba(43, 214, 123, 0.15)',
    borderColor: '#2BD67B',
  },
  statusBannerStarting: {
    backgroundColor: 'rgba(233, 185, 73, 0.2)',
    borderColor: '#E9B949',
  },
  statusBannerText: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tableCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  seatRowNorth: {
    alignItems: 'center',
    marginBottom: 10,
  },
  seatRowSouth: {
    alignItems: 'center',
    marginTop: 10,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
  },
  sideSlot: {
    width: 80,
    alignItems: 'center',
  },
  boardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSlot: {
    alignItems: 'center',
    minWidth: 80,
  },
  avatarWrapper: {
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#07261C',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E9B949',
  },
  crownText: {
    fontSize: 12,
  },
  slotName: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    maxWidth: 90,
    textAlign: 'center',
  },
  readyTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  readyTagOn: {
    backgroundColor: 'rgba(43, 214, 123, 0.2)',
  },
  readyTagOff: {
    backgroundColor: 'rgba(233, 185, 73, 0.2)',
  },
  readyTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  readyTagTextOn: {
    color: '#2BD67B',
  },
  readyTagTextOff: {
    color: '#E9B949',
  },
  kickBtn: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(226, 59, 90, 0.2)',
    borderRadius: 6,
  },
  kickText: {
    color: '#E23B5A',
    fontSize: 10,
    fontWeight: '700',
  },
  emptySlot: {
    width: 140,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotSide: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotText: {
    color: 'rgba(159, 216, 184, 0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  teamSwitchCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamSwitchTitle: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  teamSwitchDesc: {
    color: '#9FD8B8',
    fontSize: 11,
    marginBottom: 10,
  },
  switchTeamBtn: {
    width: 180,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  actionBtn: {
    width: '100%',
  },
});

