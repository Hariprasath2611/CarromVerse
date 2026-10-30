import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, Card, Header, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useGameSetupStore } from '../../src/store/gameSetupStore';
import { useGameSessionStore } from '../../src/store/gameSessionStore';
import { GameMode } from '@carromverse/shared-types';
import { GAME_MODE_DEFINITIONS, createDefaultGameConfig } from '@carromverse/game-logic';
import { THEME } from '../../src/constants/theme';
import { NetworkService } from '../../src/services/sync/networkService';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const { selectedMode, setGameMode, players } = useGameSetupStore();
  const { isPlaying, startSession, endSession, currentTurn, scores } = useGameSessionStore();

  const isOnline = NetworkService.isOnline();
  const displayName = profile?.username || user?.displayName || 'Guest Player';

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    const config = createDefaultGameConfig(mode);
    startSession(config, players);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Top Profile / Status Bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>

        <View style={styles.statusBadges}>
          <Badge
            label={isOnline ? 'Online' : 'Offline'}
            variant={isOnline ? 'success' : 'wood'}
          />
          {user ? (
            <Badge label="Cloud Active" variant="gold" />
          ) : (
            <Badge label="Guest Mode" variant="muted" />
          )}
        </View>
      </View>

      {/* Active Game Banner if session is currently active */}
      {isPlaying && (
        <Card elevated highlighted style={styles.activeGameCard}>
          <View style={styles.activeHeader}>
            <Text style={styles.activeTitle}>Active Match in Progress</Text>
            <Badge label={selectedMode.replace(/_/g, ' ')} variant="gold" />
          </View>
          <Text style={styles.activeTurn}>
            Turn #{currentTurn?.turnNumber} • Player {currentTurn?.activePlayerId}
          </Text>
          <Button
            title="Conclude / Forfeit Match"
            variant="danger"
            onPress={endSession}
            style={styles.concludeButton}
          />
        </Card>
      )}

      {/* Game Mode Selector Cards */}
      <Text style={styles.sectionTitle}>SELECT GAME MODE</Text>

      <Card
        elevated
        highlighted={selectedMode === 'two_player_individual'}
        style={styles.modeCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleStartGame('two_player_individual')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeName}>2-Player Duel</Text>
            <Badge label="2 Players" variant="gold" />
          </View>
          <Text style={styles.modeDesc}>
            Classic head-to-head showdown. White vs Black, battle for the Queen with cover.
          </Text>
          <Button
            title="Play 2-Player Duel"
            variant={selectedMode === 'two_player_individual' ? 'primary' : 'wood'}
            onPress={() => handleStartGame('two_player_individual')}
            style={styles.playButton}
          />
        </TouchableOpacity>
      </Card>

      <Card
        elevated
        highlighted={selectedMode === 'three_player_individual'}
        style={styles.modeCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleStartGame('three_player_individual')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeName}>3-Player Free-for-All</Text>
            <Badge label="3 Players" variant="wood" />
          </View>
          <Text style={styles.modeDesc}>
            Dynamic points carrom. Every coin pocketed counts towards your personal score.
          </Text>
          <Button
            title="Play 3-Player Match"
            variant={selectedMode === 'three_player_individual' ? 'primary' : 'wood'}
            onPress={() => handleStartGame('three_player_individual')}
            style={styles.playButton}
          />
        </TouchableOpacity>
      </Card>

      <Card
        elevated
        highlighted={selectedMode === 'four_player_team'}
        style={styles.modeCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleStartGame('four_player_team')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeName}>4-Player Doubles (2 vs 2)</Text>
            <Badge label="Team Mode" variant="gold" />
          </View>
          <Text style={styles.modeDesc}>
            Team A vs Team B. Partners sit opposite each other sharing points and coordinating shots.
          </Text>
          <Button
            title="Play Team Doubles"
            variant={selectedMode === 'four_player_team' ? 'primary' : 'wood'}
            onPress={() => handleStartGame('four_player_team')}
            style={styles.playButton}
          />
        </TouchableOpacity>
      </Card>

      <Card
        elevated
        highlighted={selectedMode === 'four_player_individual'}
        style={styles.modeCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleStartGame('four_player_individual')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeName}>4-Player Individual</Text>
            <Badge label="4 Players" variant="wood" />
          </View>
          <Text style={styles.modeDesc}>
            Four competitors around all four baselines. High tension free-for-all carrom.
          </Text>
          <Button
            title="Play 4-Player Battle"
            variant={selectedMode === 'four_player_individual' ? 'primary' : 'wood'}
            onPress={() => handleStartGame('four_player_individual')}
            style={styles.playButton}
          />
        </TouchableOpacity>
      </Card>

      <Card
        elevated
        highlighted={selectedMode === 'practice'}
        style={styles.modeCard}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleStartGame('practice')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeName}>Solo Practice Mode</Text>
            <Badge label="Solo" variant="muted" />
          </View>
          <Text style={styles.modeDesc}>
            Unlimited practice turns. Refine striker placement, rebound angles, and trick shots.
          </Text>
          <Button
            title="Start Solo Practice"
            variant={selectedMode === 'practice' ? 'primary' : 'outline'}
            onPress={() => handleStartGame('practice')}
            style={styles.playButton}
          />
        </TouchableOpacity>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  sectionTitle: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
  modeCard: {
    marginBottom: THEME.spacing.md,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  modeName: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.subtitle,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  modeDesc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  playButton: {
    height: 44,
  },
  activeGameCard: {
    marginBottom: THEME.spacing.lg,
    borderColor: THEME.colors.goldBright,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTitle: {
    color: THEME.colors.goldBright,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  activeTurn: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    marginVertical: THEME.spacing.sm,
  },
  concludeButton: {
    height: 38,
    marginTop: THEME.spacing.xs,
  },
});

