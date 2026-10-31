import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Card,
  Modal,
  ScreenContainer,
  Toggle,
} from '../../src/components';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { THEME } from '../../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    toggleSound,
    toggleMusic,
    toggleHaptics,
    toggleAimAssist,
  } = useSettingsStore();
  const { logout } = useAuthStore();

  const [showNotifications, setShowNotifications] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>SETTINGS</Text>
      </View>

      {/* 5 Setting Toggles */}
      <View style={styles.settingsList}>
        <Card style={styles.settingCard}>
          <Text style={styles.settingText}>Music</Text>
          <Toggle value={settings.musicEnabled} onValueChange={toggleMusic} />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.settingText}>Sound effects</Text>
          <Toggle value={settings.soundEnabled} onValueChange={toggleSound} />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.settingText}>Vibration</Text>
          <Toggle value={settings.hapticEnabled} onValueChange={toggleHaptics} />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.settingText}>Aim assist line</Text>
          <Toggle value={settings.aimAssistEnabled} onValueChange={toggleAimAssist} />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.settingText}>Show notifications</Text>
          <Toggle
            value={showNotifications}
            onValueChange={setShowNotifications}
          />
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsList}>
        <Button
          title="LANGUAGE"
          variant="secondary"
          onPress={() => setShowLanguageModal(true)}
          style={styles.actionBtn}
        />

        <Button
          title="PRIVACY POLICY"
          variant="secondary"
          onPress={() => setShowPrivacyModal(true)}
          style={styles.actionBtn}
        />

        <Button
          title="LOGOUT"
          variant="gold"
          onPress={handleLogout}
          style={styles.actionBtn}
        />
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="LANGUAGE"
        subtitle="Select interface language"
      >
        <View style={styles.modalContent}>
          <Button
            title="English"
            variant="primary"
            onPress={() => setShowLanguageModal(false)}
            style={styles.modalBtn}
          />
          <Button
            title="हिन्दी (Hindi)"
            variant="secondary"
            onPress={() => setShowLanguageModal(false)}
            style={styles.modalBtn}
          />
          <Button
            title="தமிழ் (Tamil)"
            variant="secondary"
            onPress={() => setShowLanguageModal(false)}
            style={styles.modalBtn}
          />
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="PRIVACY POLICY"
        subtitle="CarromVerse User Data Commitment"
      >
        <View style={styles.modalContent}>
          <Text style={styles.privacyBody}>
            CarromVerse respects player data. Offline matches and SQLite databases remain securely on your device. Only authenticated multiplayer match stats are synced via Google Firebase Cloud Firestore.
          </Text>
          <Button
            title="CLOSE"
            variant="primary"
            onPress={() => setShowPrivacyModal(false)}
            style={styles.modalBtn}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
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
  settingsList: {
    gap: 12,
    marginBottom: 24,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  settingText: {
    color: '#F5ECD2',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsList: {
    gap: 12,
    marginTop: 'auto',
  },
  actionBtn: {
    width: '100%',
  },
  modalContent: {
    paddingVertical: 10,
    gap: 10,
  },
  modalBtn: {
    width: '100%',
  },
  privacyBody: {
    color: '#9FD8B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
});
