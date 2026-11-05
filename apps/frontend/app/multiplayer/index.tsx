import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Header, PlayerAvatar, ScreenContainer } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { THEME } from '../../src/constants/theme';

export default function MultiplayerHubScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { profile } = useUserStore();

  const displayName = profile?.displayName || user?.displayName || profile?.username || 'Player';
  const username = profile?.username || 'player';
  const avatarUrl = profile?.avatarUrl;

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.container}>
      {/* Decorative bokeh background elements */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      <Header title="ONLINE MULTIPLAYER" showBack />

      {/* Authenticated Player Mini-Banner */}
      <View style={styles.userBadgeRow}>
        <PlayerAvatar
          name={displayName}
          avatarUrl={avatarUrl}
          size={50}
          colorVariant="gold"
          ringColor="#2BD67B"
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName.toUpperCase()}
          </Text>
          <Text style={styles.userHandle}>@{username} · Online</Text>
        </View>
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlinePillText}>CONNECTED</Text>
        </View>
      </View>

      {/* Main Action Cards */}
      <View style={styles.cardsContainer}>
        {/* Create Private Room Card */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => router.push('/multiplayer/create')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>➕</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>CREATE PRIVATE ROOM</Text>
              <Text style={styles.cardSubtitle}>
                Host a game, configure rules and board settings, and invite friends with a unique 6-character room code.
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardActionHint}>Tap to configure room →</Text>
          </View>
        </TouchableOpacity>

        {/* Join With Code Card */}
        <TouchableOpacity
          style={[styles.actionCard, styles.joinCard]}
          activeOpacity={0.85}
          onPress={() => router.push('/multiplayer/join')}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, styles.joinIconCircle]}>
              <Text style={styles.iconEmoji}>🔑</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>JOIN WITH ROOM CODE</Text>
              <Text style={styles.cardSubtitle}>
                Enter a 6-character room code shared by a friend to jump straight into their lobby.
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardActionHint, styles.joinActionHint]}>Enter room code →</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Security & Multi-Device Notice */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌐 Cross-Device Real-Time Gameplay</Text>
        <Text style={styles.infoDesc}>
          Rooms sync in real-time across Android, iOS, and Web. Room codes are private, case-insensitive, and protected by server-authoritative validation.
        </Text>
      </Card>
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
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginVertical: 18,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userHandle: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2BD67B',
  },
  onlinePillText: {
    color: '#2BD67B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  joinCard: {
    borderColor: '#E9B949',
    shadowColor: '#E9B949',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinIconCircle: {
    borderColor: '#E9B949',
  },
  iconEmoji: {
    fontSize: 22,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#F5ECD2',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardSubtitle: {
    color: '#9FD8B8',
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 214, 123, 0.2)',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  cardActionHint: {
    color: '#2BD67B',
    fontSize: 12,
    fontWeight: '700',
  },
  joinActionHint: {
    color: '#E9B949',
  },
  infoCard: {
    backgroundColor: 'rgba(14, 74, 51, 0.5)',
    borderColor: '#1B7050',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  infoTitle: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDesc: {
    color: '#9FD8B8',
    fontSize: 12,
    lineHeight: 16,
  },
});
