import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { GameCard, PrimaryButton, ScreenContainer } from '../../src/components';
import { THEME } from '../../src/constants/theme';

export default function FriendsScreen() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyToggle = () => {
    setIsSubscribed(!isSubscribed);
    Alert.alert(
      isSubscribed ? 'Alerts Disabled' : 'Early Access Alert Active! 🚀',
      isSubscribed
        ? 'You have unsubscribed from Phase 2 early access notifications.'
        : 'You will receive an instant notification when Online Private Rooms and Matchmaking launch in Phase 2!'
    );
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.headerEmoji}>👥</Text>
        </View>
        <Text style={styles.title}>FRIENDS & ONLINE CLUB</Text>
        <Text style={styles.subtitle}>
          Connect, challenge friends, and climb global multiplayer rankings.
        </Text>
      </View>

      {/* Phase 2 Feature Showcase Card */}
      <GameCard elevated highlighted style={styles.roadmapCard}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>PHASE 2 ROADMAP</Text>
          </View>
          <Text style={styles.sparkle}>✨</Text>
        </View>

        <Text style={styles.roadmapHeading}>ONLINE ARENA INCOMING</Text>
        <Text style={styles.roadmapDesc}>
          Real-time synchronized multiplayer is actively architected on our modular Phaser 3 Matter engine.
          Stay tuned for private code rooms and tournament circuits!
        </Text>

        <PrimaryButton
          title={isSubscribed ? 'SUBSCRIBED FOR EARLY ACCESS ✓' : 'NOTIFY ME AT LAUNCH'}
          onPress={handleNotifyToggle}
          variant={isSubscribed ? 'forest' : 'emerald'}
          size="medium"
          style={styles.notifyBtn}
        />
      </GameCard>

      {/* Feature Teasers */}
      <Text style={styles.sectionHeader}>PLANNED ONLINE FEATURES</Text>

      <GameCard style={styles.featureCard}>
        <View style={styles.featureIconBox}>
          <Text style={styles.featureEmoji}>🔑</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Private Rooms & Room Codes</Text>
          <Text style={styles.featureSub}>
            Create custom private tables and share a 6-digit room code with friends anywhere in the world.
          </Text>
        </View>
      </GameCard>

      <GameCard style={styles.featureCard}>
        <View style={styles.featureIconBox}>
          <Text style={styles.featureEmoji}>🌐</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Global Skill Matchmaking</Text>
          <Text style={styles.featureSub}>
            Instant 1v1 and 2v2 matchmaking matched fairly by ELO rating and board proficiency.
          </Text>
        </View>
      </GameCard>

      <GameCard style={styles.featureCard}>
        <View style={styles.featureIconBox}>
          <Text style={styles.featureEmoji}>🎭</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Animated Stickers & Reactions</Text>
          <Text style={styles.featureSub}>
            Taunt, praise, and celebrate great shots with animated table reactions and custom sound effects.
          </Text>
        </View>
      </GameCard>

      <GameCard style={styles.featureCard}>
        <View style={styles.featureIconBox}>
          <Text style={styles.featureEmoji}>🏆</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Clan Battles & 2v2 Teams</Text>
          <Text style={styles.featureSub}>
            Form permanent duos with your partner, compete in weekend cups, and win limited-edition skins.
          </Text>
        </View>
      </GameCard>

      {/* Local Pass & Play Friends Tip */}
      <GameCard style={styles.localTipCard}>
        <Text style={styles.localTipTitle}>💡 Playing Couch Multiplayer Right Now?</Text>
        <Text style={styles.localTipBody}>
          You don't need internet! Head over to the Home screen and select "Play Offline" to play 2, 3, or 4-player games on this shared device right away.
        </Text>
      </GameCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#07261C',
    borderColor: THEME.colors.neonEmerald,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...THEME.shadows.glowEmerald,
  },
  headerEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    textAlign: 'center',
    marginTop: 4,
  },
  roadmapCard: {
    padding: 18,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#07261C',
    borderColor: THEME.colors.brass,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 0.8,
  },
  sparkle: {
    fontSize: 18,
  },
  roadmapHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  roadmapDesc: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
    lineHeight: 20,
    marginTop: 6,
  },
  notifyBtn: {
    marginTop: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.cream,
  },
  featureSub: {
    fontSize: 11,
    color: THEME.colors.mutedMint,
    lineHeight: 16,
    marginTop: 2,
  },
  localTipCard: {
    padding: 14,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    marginTop: 10,
  },
  localTipTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    marginBottom: 4,
  },
  localTipBody: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    lineHeight: 18,
  },
});
