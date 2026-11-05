import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Card,
  Header,
  Input,
  LoadingOverlay,
  ScreenContainer,
} from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { useMultiplayerRoomStore } from '../../src/store/multiplayerRoomStore';
import { PrivateRoomApiService } from '../../src/services/multiplayer/privateRoomApi';
import { RoomLookupResponse } from '@carromverse/shared-types';
import { THEME } from '../../src/constants/theme';

export default function JoinRoomScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { joinPrivateRoom, isLoading } = useMultiplayerRoomStore();

  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [lookupResult, setLookupResult] = useState<RoomLookupResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Room Code Lookup
  useEffect(() => {
    const cleanCode = roomCode.trim().replace(/[\s\-_]/g, '').toUpperCase();

    if (cleanCode.length < 6) {
      setLookupResult(null);
      setLookupError(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLookingUp(true);
    setLookupError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await PrivateRoomApiService.lookupRoomCode(cleanCode);
        setLookupResult(res);
        setLookupError(null);
      } catch (err: any) {
        setLookupResult(null);
        setLookupError(err.message || 'Room not found. Check code and try again.');
      } finally {
        setIsLookingUp(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [roomCode]);

  const handleJoin = async () => {
    const cleanCode = roomCode.trim().replace(/[\s\-_]/g, '').toUpperCase();
    if (cleanCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character room code.');
      return;
    }

    if (lookupResult?.hasPassword && (!password || password.trim().length === 0)) {
      Alert.alert('Password Required', 'This room requires a password to enter.');
      return;
    }

    try {
      await joinPrivateRoom(cleanCode, password.trim(), profile);
      router.replace('/multiplayer/room');
    } catch (err: any) {
      Alert.alert('Cannot Join Room', err?.message || 'Failed to connect to the multiplayer room.');
    }
  };

  const getModeTitle = (mode?: string) => {
    switch (mode) {
      case 'three_player_individual':
        return '3 Players · Points Carrom';
      case 'four_player_team':
        return '4 Players · 2v2 Team Match';
      case 'four_player_individual':
        return '4 Players · Free For All';
      case 'two_player_individual':
      default:
        return '2 Players · 1v1 Classic';
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.container}>
      <LoadingOverlay visible={isLoading} message="Connecting to room lobby..." />

      <Header title="JOIN WITH ROOM CODE" showBack />

      <Text style={styles.promptText}>
        Enter the 6-character room code shared by the match host:
      </Text>

      {/* Styled Large Code Input Box */}
      <View style={styles.codeBoxContainer}>
        <TextInput
          style={styles.codeTextInput}
          value={roomCode}
          onChangeText={(val) => setRoomCode(val.toUpperCase())}
          placeholder="E.G. CV8M4K"
          placeholderTextColor="rgba(159, 216, 184, 0.3)"
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
        />
      </View>

      {/* Looking up indicator */}
      {isLookingUp && (
        <Text style={styles.searchingText}>Searching for room...</Text>
      )}

      {/* Lookup Error Message */}
      {!!lookupError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>✕ {lookupError}</Text>
        </View>
      )}

      {/* Found Room Preview Card */}
      {lookupResult && (
        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>ROOM FOUND</Text>
            </View>
            <Text style={styles.previewCapacity}>
              {lookupResult.currentPlayers}/{lookupResult.maxPlayers} Players
            </Text>
          </View>

          <Text style={styles.previewModeTitle}>
            {getModeTitle(lookupResult.gameMode)}
          </Text>
          <Text style={styles.previewMeta}>
            Host: <Text style={styles.previewMetaBold}>{lookupResult.hostDisplayName}</Text> · Theme:{' '}
            <Text style={styles.previewMetaBold}>{lookupResult.boardTheme.toUpperCase()}</Text>
          </Text>

          {lookupResult.hasPassword && (
            <View style={styles.passwordBanner}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.passwordBannerText}>This private room is password protected</Text>
            </View>
          )}
        </Card>
      )}

      {/* Password Input if Room Requires Password */}
      {lookupResult?.hasPassword && (
        <Card style={styles.passwordCard}>
          <Input
            label="Room Password"
            placeholder="Enter room password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </Card>
      )}

      {/* Join Action Button */}
      <View style={styles.btnContainer}>
        <Button
          title="ENTER ROOM LOBBY"
          variant="primary"
          onPress={handleJoin}
          disabled={isLoading || roomCode.trim().length < 6}
        />
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
  promptText: {
    color: '#9FD8B8',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  codeBoxContainer: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#2BD67B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  codeTextInput: {
    color: '#F5ECD2',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    width: '100%',
  },
  searchingText: {
    color: '#E9B949',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  errorBanner: {
    backgroundColor: 'rgba(226, 59, 90, 0.15)',
    borderColor: '#E23B5A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#E23B5A',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#2BD67B',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewBadge: {
    backgroundColor: '#07261C',
    borderColor: '#2BD67B',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBadgeText: {
    color: '#2BD67B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  previewCapacity: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '800',
  },
  previewModeTitle: {
    color: '#F5ECD2',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  previewMeta: {
    color: '#9FD8B8',
    fontSize: 13,
  },
  previewMetaBold: {
    color: '#F5ECD2',
    fontWeight: '700',
  },
  passwordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 185, 73, 0.15)',
    borderColor: '#E9B949',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  lockIcon: {
    fontSize: 14,
  },
  passwordBannerText: {
    color: '#E9B949',
    fontSize: 12,
    fontWeight: '700',
  },
  passwordCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  btnContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
});

