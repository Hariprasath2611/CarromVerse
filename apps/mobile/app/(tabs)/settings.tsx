import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Header, ScreenContainer } from '../../src/components';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { SyncService } from '../../src/services/sync/syncService';
import { LocalDatabaseService } from '../../src/services/database/localDatabaseService';
import { APP_CONFIG } from '../../src/constants/config';
import { THEME } from '../../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, toggleSound, toggleMusic, toggleHaptics, toggleAimAssist, updateSettings } =
    useSettingsStore();
  const { user, logout } = useAuthStore();

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check pending sync records
    LocalDatabaseService.getPendingSyncQueue()
      .then((items) => setPendingCount(items.length))
      .catch(() => {});

    const unsubscribe = SyncService.addSyncListener((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!APP_CONFIG.isFirebaseConfigured) {
      Alert.alert(
        'Firebase Setup Needed',
        'Configure your Firebase API keys in .env to enable cloud synchronization.'
      );
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to sync your local records with your cloud account.');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await SyncService.processPendingSyncQueue();
      Alert.alert(
        'Synchronization Complete',
        `Synced: ${res.synced} records.\nFailed: ${res.failed} records.`
      );
    } catch (err: any) {
      Alert.alert('Sync Error', err?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
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
      <Header title="Game Settings" />

      {/* Audio & Haptics Section */}
      <Text style={styles.sectionTitle}>AUDIO & FEEDBACK</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound Effects (SFX)</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.goldPrimary }}
            thumbColor={settings.soundEnabled ? THEME.colors.goldBright : THEME.colors.textMuted}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Background Music</Text>
          <Switch
            value={settings.musicEnabled}
            onValueChange={toggleMusic}
            trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.goldPrimary }}
            thumbColor={settings.musicEnabled ? THEME.colors.goldBright : THEME.colors.textMuted}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptic Feedback</Text>
          <Switch
            value={settings.hapticEnabled}
            onValueChange={toggleHaptics}
            trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.goldPrimary }}
            thumbColor={settings.hapticEnabled ? THEME.colors.goldBright : THEME.colors.textMuted}
          />
        </View>
      </Card>

      {/* Gameplay Section */}
      <Text style={styles.sectionTitle}>GAMEPLAY ASSISTANCE</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Aim Guide Trajectory</Text>
            <Text style={styles.rowSubLabel}>Shows laser direction vector during strike</Text>
          </View>
          <Switch
            value={settings.aimAssistEnabled}
            onValueChange={toggleAimAssist}
            trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.goldPrimary }}
            thumbColor={settings.aimAssistEnabled ? THEME.colors.goldBright : THEME.colors.textMuted}
          />
        </View>
      </Card>

      {/* Graphics Quality */}
      <Text style={styles.sectionTitle}>GRAPHICS QUALITY</Text>
      <Card style={styles.card}>
        <View style={styles.qualityRow}>
          {(['low', 'medium', 'high'] as const).map((q) => (
            <TouchableOpacity
              key={q}
              onPress={() => updateSettings({ graphicsQuality: q })}
              style={[
                styles.qualityBtn,
                settings.graphicsQuality === q && styles.qualityBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.qualityText,
                  settings.graphicsQuality === q && styles.qualityTextActive,
                ]}
              >
                {q.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Offline & Cloud Sync Foundation */}
      <Text style={styles.sectionTitle}>OFFLINE STORAGE & CLOUD SYNC</Text>
      <Card elevated style={styles.card}>
        <View style={styles.syncHeader}>
          <Text style={styles.rowLabel}>Pending Cloud Records</Text>
          <Badge
            label={`${pendingCount} Pending`}
            variant={pendingCount > 0 ? 'warning' : 'success'}
          />
        </View>

        <Text style={styles.syncSubtext}>
          Offline matches are recorded in local SQLite database. They synchronize automatically
          when an internet connection and active Firebase account are present.
        </Text>

        <Button
          title={isSyncing ? 'Synchronizing...' : 'Sync Pending Records Now'}
          variant="secondary"
          onPress={handleManualSync}
          loading={isSyncing}
          style={styles.syncButton}
        />
      </Card>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>ACCOUNT & SESSIONS</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Badge
            label={user ? 'Signed In' : 'Guest Account'}
            variant={user ? 'gold' : 'muted'}
          />
        </View>

        <View style={styles.divider} />

        {user ? (
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            style={styles.accountBtn}
          />
        ) : (
          <Button
            title="Sign In with Email"
            variant="primary"
            onPress={() => router.push('/(auth)/login')}
            style={styles.accountBtn}
          />
        )}
      </Card>

      {/* App Version Info */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>
          CarromVerse v{APP_CONFIG.version} • {APP_CONFIG.env.toUpperCase()}
        </Text>
        <Text style={styles.versionSubtext}>Phase 1.1 Foundation Active</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.md,
  },
  sectionTitle: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 1.5,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  card: {
    marginBottom: THEME.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.xs,
  },
  rowLabel: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  rowSubLabel: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.surfaceBorder,
    marginVertical: THEME.spacing.sm,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  qualityBtnActive: {
    borderColor: THEME.colors.goldPrimary,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  qualityText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  qualityTextActive: {
    color: THEME.colors.goldBright,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  syncSubtext: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    lineHeight: 18,
    marginVertical: THEME.spacing.sm,
  },
  syncButton: {
    marginTop: THEME.spacing.xs,
  },
  accountBtn: {
    marginTop: THEME.spacing.xs,
  },
  versionBox: {
    alignItems: 'center',
    marginVertical: THEME.spacing.xl,
  },
  versionText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    letterSpacing: 0.5,
  },
  versionSubtext: {
    color: THEME.colors.woodLight,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
