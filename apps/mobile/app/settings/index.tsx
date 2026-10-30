import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  GameCard,
  Modal,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  Toggle,
} from '../../src/components';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { SyncService } from '../../src/services/sync/syncService';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { THEME } from '../../src/constants/theme';

const LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'es', name: 'Español (Spanish)' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    toggleSound,
    toggleMusic,
    toggleHaptics,
    toggleAimAssist,
  } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    LocalDatabaseService.getPendingSyncQueue()
      .then((items) => setPendingSyncCount(items.length))
      .catch(() => {});

    const unsubscribe = SyncService.addSyncListener((syncing, count) => {
      setIsSyncing(syncing);
      setPendingSyncCount(count);
    });

    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to sync your local match statistics with your cloud profile.'
      );
      return;
    }

    setIsSyncing(true);
    try {
      const res = await SyncService.processPendingSyncQueue();
      Alert.alert(
        'Cloud Sync Completed',
        `Successfully synced ${res.synced} match records to Firebase Firestore.`
      );
    } catch (err: any) {
      Alert.alert('Sync Error', err?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out Confirmation',
      'Are you sure you want to sign out? Your offline match history stored in SQLite will remain preserved on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Game Settings</Text>
          <Text style={styles.headerSub}>Audio, graphics, language & accounts</Text>
        </View>
      </View>

      {/* AUDIO & FEEDBACK */}
      <Text style={styles.sectionTitle}>AUDIO & TACTILE FEEDBACK</Text>
      <GameCard style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Sound Effects (SFX)</Text>
            <Text style={styles.settingDesc}>Striker rebounds, pocket clicks & coin collisions</Text>
          </View>
          <Toggle value={settings.soundEnabled} onValueChange={toggleSound} />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Background Music</Text>
            <Text style={styles.settingDesc}>Calm forest ambient acoustic music</Text>
          </View>
          <Toggle value={settings.musicEnabled} onValueChange={toggleMusic} />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingDesc}>Vibration pulse on pockets and cushion bounces</Text>
          </View>
          <Toggle value={settings.hapticEnabled} onValueChange={toggleHaptics} />
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Aim Assist Guide Line</Text>
            <Text style={styles.settingDesc}>Display projected striker trajectory on board</Text>
          </View>
          <Toggle value={settings.aimAssistEnabled} onValueChange={toggleAimAssist} />
        </View>
      </GameCard>

      {/* PREFERENCES */}
      <Text style={styles.sectionTitle}>PREFERENCES & NOTIFICATIONS</Text>
      <GameCard style={styles.card}>
        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingDesc}>Select display language</Text>
          </View>
          <View style={styles.rowRightPill}>
            <Text style={styles.rowRightPillText}>{selectedLanguage}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Daily rewards, season cups & friend challenges</Text>
          </View>
          <Toggle
            value={pushNotifications}
            onValueChange={(val) => setPushNotifications(val)}
          />
        </View>
      </GameCard>

      {/* CLOUD & OFFLINE SYNC */}
      <Text style={styles.sectionTitle}>CLOUD & OFFLINE DATA</Text>
      <GameCard style={styles.card}>
        <View style={styles.syncRow}>
          <View style={styles.settingMeta}>
            <Text style={styles.settingLabel}>SQLite Local Database</Text>
            <Text style={styles.settingDesc}>
              {pendingSyncCount > 0
                ? `${pendingSyncCount} match logs pending cloud sync`
                : 'All local records synchronized with cloud'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        </View>
      </GameCard>

      {/* ABOUT & LEGAL */}
      <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
      <GameCard style={styles.card}>
        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => setShowHelpModal(true)}
        >
          <Text style={styles.settingLabel}>Help & Carrom Rules</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => setShowTermsModal(true)}
        >
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <TouchableOpacity
          style={styles.clickableRow}
          onPress={() => setShowPrivacyModal(true)}
        >
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.versionText}>v1.0.0 (Forest Emerald)</Text>
        </View>
      </GameCard>

      {/* ACCOUNT & SIGN OUT */}
      <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
      <SecondaryButton
        title={user ? `Sign Out (${user.email || 'Champion'})` : 'Sign Out'}
        onPress={handleSignOut}
        variant="outline"
        size="large"
        style={styles.signOutBtn}
      />

      {/* LANGUAGE MODAL */}
      <Modal
        visible={showLanguageModal}
        title="Select Language"
        onClose={() => setShowLanguageModal(false)}
      >
        <ScrollView style={styles.modalScroll}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                selectedLanguage === lang.name && styles.languageOptionActive,
              ]}
              onPress={() => {
                setSelectedLanguage(lang.name);
                setShowLanguageModal(false);
              }}
            >
              <Text
                style={[
                  styles.languageName,
                  selectedLanguage === lang.name && styles.languageNameActive,
                ]}
              >
                {lang.name}
              </Text>
              {selectedLanguage === lang.name && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>

      {/* TERMS MODAL */}
      <Modal
        visible={showTermsModal}
        title="Terms of Service"
        onClose={() => setShowTermsModal(false)}
      >
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.legalBody}>
            Welcome to CarromVerse! By playing CarromVerse, you agree to abide by international carrom sportsmanship rules.
            {'\n\n'}
            1. FAIR PLAY: Virtual currencies and trophies are earned through competitive play. Any tampering with match logs or engine states is strictly prohibited.
            {'\n\n'}
            2. VIRTUAL ITEMS: All board skins, strikers, and virtual coins remain in-game cosmetics and have no real-world cash equivalence.
            {'\n\n'}
            3. MULTIPLAYER CONDUCT: Phase 2 multiplayer will enforce zero-tolerance harassment policies across in-game chat and stickers.
          </Text>
        </ScrollView>
      </Modal>

      {/* PRIVACY MODAL */}
      <Modal
        visible={showPrivacyModal}
        title="Privacy Policy"
        onClose={() => setShowPrivacyModal(false)}
      >
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.legalBody}>
            CarromVerse respects your privacy and ensures your game data remains secure.
            {'\n\n'}
            1. OFFLINE DATA STORAGE: All offline match history, scores, and custom settings are stored locally on your device in a secure SQLite database.
            {'\n\n'}
            2. FIREBASE AUTHENTICATION: If you sign in, your email and user ID are securely stored with Firebase Auth. We never sell or share player personal data.
            {'\n\n'}
            3. TELEMETRY: We only collect anonymous performance and crash logs to improve striker physics and app responsiveness.
          </Text>
        </ScrollView>
      </Modal>

      {/* HELP & SUPPORT MODAL */}
      <Modal
        visible={showHelpModal}
        title="Carrom Rules & Help"
        onClose={() => setShowHelpModal(false)}
      >
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.helpTitle}>Official Carrom Rules Quick Guide</Text>
          <Text style={styles.legalBody}>
            • WHITE COIN: Worth 1 point (or 10 in standard point systems).
            {'\n'}• BLACK COIN: Worth 1 point (or 5 points).
            {'\n'}• RED QUEEN: Worth 3 points. The Queen must be followed by a cover (pocketing another carrom man in the same or immediately next turn).
            {'\n'}• FOUL / PENALTY: Pocketing the striker returns one of your pocketed coins back to the center circle.
            {'\n\n'}
            Need support? Email support@carromverse.com
          </Text>
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: THEME.colors.textPrimary,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  headerSub: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  card: {
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  clickableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingMeta: {
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  settingLabel: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.sm,
  },
  rowRightPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRightPillText: {
    fontSize: 12,
    color: THEME.colors.accent,
    fontWeight: 'bold',
    marginRight: 6,
  },
  chevron: {
    fontSize: 18,
    color: THEME.colors.textMuted,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: 'bold',
  },
  signOutBtn: {
    marginTop: THEME.spacing.xs,
    borderColor: THEME.colors.danger,
  },
  modalScroll: {
    maxHeight: 380,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  languageName: {
    fontSize: THEME.typography.fontSize.bodySm,
    color: THEME.colors.textPrimary,
  },
  languageNameActive: {
    color: THEME.colors.accent,
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 16,
    color: THEME.colors.accent,
    fontWeight: 'bold',
  },
  helpTitle: {
    fontSize: THEME.typography.fontSize.bodyMd,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: 8,
  },
  legalBody: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
});
