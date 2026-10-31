import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, PlayerAvatar, ScreenContainer } from '../../src/components';
import { THEME } from '../../src/constants/theme';

interface FriendItem {
  id: string;
  name: string;
  initial: string;
  colorVariant: 'emerald' | 'pink' | 'mint' | 'gold';
  status: 'Online' | 'In Match' | 'Offline';
}

const FRIENDS_LIST: FriendItem[] = [
  { id: '1', name: 'Arun', initial: 'A', colorVariant: 'emerald', status: 'Online' },
  { id: '2', name: 'Meera', initial: 'M', colorVariant: 'pink', status: 'In Match' },
  { id: '3', name: 'Kabir', initial: 'K', colorVariant: 'mint', status: 'Online' },
  { id: '4', name: 'Divya', initial: 'D', colorVariant: 'emerald', status: 'Offline' },
];

export default function FriendsScreen() {
  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>FRIENDS</Text>
      </View>

      {/* Friends List */}
      <View style={styles.list}>
        {FRIENDS_LIST.map((friend) => (
          <Card key={friend.id} style={styles.friendCard}>
            <PlayerAvatar
              name={friend.initial}
              size={48}
              colorVariant={friend.colorVariant}
            />

            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text
                style={[
                  styles.friendStatus,
                  friend.status === 'Online'
                    ? styles.statusOnline
                    : friend.status === 'In Match'
                    ? styles.statusMatch
                    : styles.statusOffline,
                ]}
              >
                {friend.status}
              </Text>
            </View>

            <Button
              title="INVITE"
              variant={friend.status === 'Online' ? 'primary' : 'secondary'}
              disabled={friend.status !== 'Online'}
              onPress={() => {}}
              style={styles.inviteBtn}
            />
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
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
  list: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 14,
  },
  friendName: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOnline: {
    color: '#2BD67B',
  },
  statusMatch: {
    color: '#E9B949',
  },
  statusOffline: {
    color: '#9FD8B8',
    opacity: 0.7,
  },
  inviteBtn: {
    height: 42,
    paddingHorizontal: 16,
  },
});
