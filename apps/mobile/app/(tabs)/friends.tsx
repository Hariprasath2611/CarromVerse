import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCard, PrimaryButton, ScreenContainer, SecondaryButton } from '../../src/components';
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
        <Text style={styles.title}>Friends & Online Hub</Text>
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

        <Text style={styles.roadmapHeading}>Online Arena Incoming</Text>
        <Text style={styles.roadmapDesc}>
          Real-time synchronized multiplayer is actively architected on our modular game engine.
          Stay tuned for competitive rooms and tournament circuits!
        </Text>

        <PrimaryButton
          title={isSubscribed ? 'Subscribed for Early Access ✓' : 'Notify Me at Launch'}
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
            Create custom private lobbies and share a 6-digit room code with friends anywhere in the world.
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
            Taunt, praise, and celebrate great shots with animated table reactions and custom sound emojis.
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
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  headerEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  roadmapCard: {
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  statusBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderColor: THEME.colors.primary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  sparkle: {
    fontSize: 18,
  },
  roadmapHeading: {
    fontSize: THEME.typography.fontSize.h3,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginTop: THEME.spacing.xs,
  },
  roadmapDesc: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  notifyBtn: {
    marginTop: THEME.spacing.md,
  },
  sectionHeader: {
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderColor: THEME.colors.border,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: THEME.typography.fontSize.bodyMd,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  featureSub: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  localTipCard: {
    padding: THEME.spacing.md,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderColor: THEME.colors.secondary,
    borderWidth: 1,
    marginTop: THEME.spacing.sm,
  },
  localTipTitle: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.accent,
    marginBottom: 4,
  },
  localTipBody: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});
