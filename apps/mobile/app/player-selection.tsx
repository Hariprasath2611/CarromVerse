import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer } from '../src/components';
import { useGameSetupStore } from '../src/store/gameSetupStore';
import { PlayerCount } from '@carromverse/shared-types';
import { THEME } from '../src/constants/theme';

export default function PlayerSelectionScreen() {
  const router = useRouter();
  const { selectedMode, playerCount, setGameMode, setPlayerCount } =
    useGameSetupStore();

  const isTeamMode = selectedMode === 'four_player_team';

  const handleSelectCount = (count: PlayerCount) => {
    setPlayerCount(count);
    if (count !== 4 && isTeamMode) {
      setGameMode(count === 2 ? 'two_player_individual' : 'three_player_individual');
    }
  };

  const handleSelectGameType = (team: boolean) => {
    if (team) {
      setPlayerCount(4);
      setGameMode('four_player_team');
    } else {
      if (playerCount === 4) {
        setGameMode('four_player_individual');
      } else if (playerCount === 3) {
        setGameMode('three_player_individual');
      } else {
        setGameMode('two_player_individual');
      }
    }
  };

  const handleContinue = () => {
    router.push('/game-config');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFLINE MATCH</Text>
      </View>

      {/* PLAYERS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PLAYERS</Text>
        <View style={styles.playersGrid}>
          {([2, 3, 4] as PlayerCount[]).map((count) => {
            const isActive = playerCount === count;
            return (
              <TouchableOpacity
                key={count}
                style={[
                  styles.playerBox,
                  isActive && styles.playerBoxActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectCount(count)}
              >
                <Text style={[styles.playerNum, isActive && styles.playerNumActive]}>
                  {count}
                </Text>
                <Text style={[styles.playerSub, isActive && styles.playerSubActive]}>
                  players
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* GAME TYPE SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>GAME TYPE</Text>
        <View style={styles.gameTypeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              !isTeamMode && styles.typeBtnIndividualActive,
            ]}
            onPress={() => handleSelectGameType(false)}
          >
            <Text
              style={[
                styles.typeBtnText,
                !isTeamMode && styles.typeBtnTextActive,
              ]}
            >
              INDIVIDUAL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn,
              isTeamMode && styles.typeBtnTeamActive,
            ]}
            onPress={() => handleSelectGameType(true)}
          >
            <Text
              style={[
                styles.typeBtnText,
                isTeamMode && styles.typeBtnTeamTextActive,
              ]}
            >
              TEAM 2 VS 2
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TEAM SETUP EXPLANATION CARD */}
      <Card style={styles.infoCard}>
        <View style={styles.tableDiagram}>
          {/* North - Team A (Green) */}
          <View style={[styles.diagramDot, styles.dotTeamA, { top: 0, left: 32 }]} />
          {/* South - Team A (Green) */}
          <View style={[styles.diagramDot, styles.dotTeamA, { bottom: 0, left: 32 }]} />
          {/* West - Team B (Gold) */}
          <View style={[styles.diagramDot, styles.dotTeamB, { top: 32, left: 0 }]} />
          {/* East - Team B (Gold) */}
          <View style={[styles.diagramDot, styles.dotTeamB, { top: 32, right: 0 }]} />
        </View>

        <Text style={styles.infoText}>
          <Text style={styles.boldText}>Team A</Text> sits opposite each other,{' '}
          <Text style={styles.boldText}>Team B</Text> the sides. Partners' coins count
          together.
        </Text>
      </Card>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  bokehTop: {
    position: 'absolute',
    top: 30,
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#9FD8B8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  playersGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  playerBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBoxActive: {
    backgroundColor: '#2BD67B',
    borderColor: '#2BD67B',
  },
  playerNum: {
    color: '#F5ECD2',
    fontSize: 32,
    fontWeight: '900',
  },
  playerNumActive: {
    color: '#07261C',
  },
  playerSub: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  playerSubActive: {
    color: '#07261C',
  },
  gameTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnIndividualActive: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
  },
  typeBtnTeamActive: {
    backgroundColor: '#E9B949',
    borderColor: '#F7D070',
    borderBottomWidth: 5,
    borderBottomColor: '#A57E24',
  },
  typeBtnText: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  typeBtnTextActive: {
    color: '#2BD67B',
  },
  typeBtnTeamTextActive: {
    color: '#261B04',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderRadius: 18,
    marginBottom: 20,
  },
  tableDiagram: {
    width: 88,
    height: 88,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagramDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dotTeamA: {
    backgroundColor: '#2BD67B',
  },
  dotTeamB: {
    backgroundColor: '#E9B949',
  },
  infoText: {
    flex: 1,
    color: '#F5ECD2',
    fontSize: 13,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#F5ECD2',
  },
  footer: {
    marginTop: 'auto',
  },
  continueBtn: {
    width: '100%',
  },
});
