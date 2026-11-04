import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DEFAULT_PRESET_AVATARS } from '@carromverse/shared-types';
import {
  Button,
  Card,
  Header,
  Input,
  LoadingOverlay,
  PlayerAvatar,
  ScreenContainer,
} from '../src/components';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { THEME } from '../src/constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, checkUsername, updateAvatar, removeAvatar, isLoading } =
    useUserStore();

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.displayName || ''
  );
  const [username, setUsername] = useState(profile?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatarUrl || null
  );
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Username validation & availability state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced username availability checker
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    // If identical to existing username, no need to check remote
    if (trimmed === (profile?.username || '').toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, message: 'Current username' });
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Must be at least 3 characters',
      });
      return;
    }

    if (trimmed.length > 20) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Must be at most 20 characters',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Only letters, numbers, and underscores allowed',
      });
      return;
    }

    setUsernameStatus({ checking: true, message: 'Checking availability...' });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await checkUsername(trimmed);
        if (res.available) {
          setUsernameStatus({
            checking: false,
            available: true,
            message: '✓ Username is available',
          });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            message: `✕ ${res.reason || 'Username is taken'}`,
          });
        }
      } catch (err: any) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: 'Error verifying username',
        });
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [username, profile?.username]);

  const handleSave = async () => {
    const trimmedDisplay = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedDisplay || trimmedDisplay.length < 1 || trimmedDisplay.length > 30) {
      Alert.alert('Validation Error', 'Display name must be between 1 and 30 characters.');
      return;
    }

    if (trimmedUsername !== (profile?.username || '').toLowerCase()) {
      if (!usernameStatus.available) {
        Alert.alert(
          'Invalid Username',
          usernameStatus.message || 'Please choose an available username.'
        );
        return;
      }
    }

    try {
      // 1. Update text profile attributes
      await updateProfile({
        displayName: trimmedDisplay,
        username: trimmedUsername,
      });

      // 2. Handle avatar changes if modified
      if (selectedAvatar !== profile?.avatarUrl) {
        if (!selectedAvatar) {
          await removeAvatar();
        } else {
          await updateAvatar({
            avatarUrl: selectedAvatar,
            format: 'url',
          });
        }
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update profile.');
    }
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customAvatarInput.trim();
    if (!trimmed) return;
    setSelectedAvatar(trimmed);
    setCustomAvatarInput('');
    setShowCustomInput(false);
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.container}
    >
      <LoadingOverlay visible={isLoading} message="Saving changes..." />

      <Header title="EDIT PROFILE" showBack />

      {/* Live Avatar Preview Hero */}
      <View style={styles.previewHero}>
        <PlayerAvatar
          name={displayName || 'Player'}
          avatarUrl={selectedAvatar}
          size={90}
          colorVariant="gold"
          ringColor="#2BD67B"
        />
        <Text style={styles.previewHint}>Avatar Preview</Text>
      </View>

      {/* Avatar Presets Selection */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>CHOOSE AVATAR ICON</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarList}
        >
          {DEFAULT_PRESET_AVATARS.map((emoji) => {
            const isSelected = selectedAvatar === emoji;
            return (
              <TouchableOpacity
                key={emoji}
                style={[styles.presetItem, isSelected && styles.presetItemSelected]}
                onPress={() => setSelectedAvatar(emoji)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetEmoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Custom URL or Reset Controls */}
        <View style={styles.avatarControlsRow}>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Text style={styles.controlPillText}>
              {showCustomInput ? 'Hide URL Input' : 'Use Custom URL / Icon'}
            </Text>
          </TouchableOpacity>

          {selectedAvatar !== null && (
            <TouchableOpacity
              style={[styles.controlPill, styles.removePill]}
              onPress={() => setSelectedAvatar(null)}
            >
              <Text style={[styles.controlPillText, styles.removePillText]}>
                Reset to Initial
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showCustomInput && (
          <View style={styles.customUrlContainer}>
            <Input
              placeholder="Paste Image URL (https://...) or emoji"
              value={customAvatarInput}
              onChangeText={setCustomAvatarInput}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.customInputStyle}
            />
            <Button
              title="Apply"
              size="small"
              variant="secondary"
              onPress={handleApplyCustomUrl}
              style={styles.applyBtn}
            />
          </View>
        )}
      </Card>

      {/* Profile Details Form */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>PROFILE DETAILS</Text>

        {/* Display Name Input */}
        <Input
          label="Display Name"
          placeholder="Enter display name"
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={30}
          autoCorrect={false}
        />
        <Text style={styles.inputCounter}>{displayName.length}/30 characters</Text>

        {/* Username Input */}
        <Input
          label="Unique Username"
          placeholder="e.g. striker_pro"
          value={username}
          onChangeText={setUsername}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Real-time Username Availability Feedback */}
        {!!usernameStatus.message && (
          <Text
            style={[
              styles.usernameStatusText,
              usernameStatus.available === true && styles.statusAvailable,
              usernameStatus.available === false && styles.statusUnavailable,
              usernameStatus.checking && styles.statusChecking,
            ]}
          >
            {usernameStatus.message}
          </Text>
        )}

        {/* Account Email (Read-only) */}
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Account Email (Linked)</Text>
          <Text style={styles.emailValue}>
            {user?.email || profile?.email || 'Not available'}
          </Text>
        </View>
      </Card>

      {/* Save Button */}
      <View style={styles.footerContainer}>
        <Button
          title="SAVE CHANGES"
          variant="primary"
          onPress={handleSave}
          disabled={isLoading}
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
  previewHero: {
    alignItems: 'center',
    marginVertical: 18,
  },
  previewHint: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    color: '#9FD8B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  avatarList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  presetItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetItemSelected: {
    borderColor: '#2BD67B',
    backgroundColor: '#11573C',
    transform: [{ scale: 1.08 }],
  },
  presetEmoji: {
    fontSize: 22,
  },
  avatarControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  controlPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#11573C',
    borderColor: '#1B7050',
    borderWidth: 1,
  },
  controlPillText: {
    color: '#F5ECD2',
    fontSize: 12,
    fontWeight: '700',
  },
  removePill: {
    backgroundColor: 'rgba(226, 59, 90, 0.15)',
    borderColor: '#E23B5A',
  },
  removePillText: {
    color: '#E23B5A',
  },
  customUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  customInputStyle: {
    flex: 1,
    marginBottom: 0,
  },
  applyBtn: {
    height: 44,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  inputCounter: {
    color: '#9FD8B8',
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 12,
  },
  usernameStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
  statusAvailable: {
    color: '#2BD67B',
  },
  statusUnavailable: {
    color: '#E23B5A',
  },
  statusChecking: {
    color: '#E9B949',
  },
  emailContainer: {
    marginTop: 6,
    padding: 12,
    backgroundColor: '#07261C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B7050',
  },
  emailLabel: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  emailValue: {
    color: '#F5ECD2',
    fontSize: 13,
    fontWeight: '700',
  },
  footerContainer: {
    marginTop: 4,
    marginBottom: 20,
  },
});
