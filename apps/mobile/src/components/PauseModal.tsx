import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { Toggle } from './Toggle';
import { useSettingsStore } from '../store/settingsStore';
import { THEME } from '../constants/theme';

export interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestart,
  onExit,
}) => {
  const { settings, toggleSound, toggleMusic } = useSettingsStore();

  return (
    <Modal
      visible={visible}
      onClose={onResume}
      title="Match Paused"
      subtitle="Take a breather or adjust game settings"
    >
      <View style={styles.container}>
        <View style={styles.settingsSection}>
          <Toggle
            label="Sound Effects (SFX)"
            value={settings.soundEnabled}
            onValueChange={toggleSound}
          />
          <Toggle
            label="Background Music"
            value={settings.musicEnabled}
            onValueChange={toggleMusic}
          />
        </View>

        <View style={styles.buttonGroup}>
          <PrimaryButton
            title="Resume Match"
            onPress={onResume}
            style={styles.actionBtn}
          />
          <SecondaryButton
            title="Restart Match"
            variant="surface"
            onPress={onRestart}
            style={styles.actionBtn}
          />
          <SecondaryButton
            title="Exit to Main Menu"
            variant="outline"
            onPress={onExit}
            style={styles.actionBtn}
            textStyle={{ color: THEME.colors.error }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.xs,
  },
  settingsSection: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  buttonGroup: {
    gap: 10,
  },
  actionBtn: {
    width: '100%',
  },
});

