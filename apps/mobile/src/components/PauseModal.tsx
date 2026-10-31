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
      subtitle="Take a breather or adjust game audio"
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
            title="RESUME MATCH"
            variant="emerald"
            onPress={onResume}
            style={styles.actionBtn}
          />
          <SecondaryButton
            title="RESTART MATCH"
            variant="brass"
            onPress={onRestart}
            style={styles.actionBtn}
          />
          <PrimaryButton
            title="EXIT TO MENU"
            variant="danger"
            onPress={onExit}
            style={styles.actionBtn}
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
    backgroundColor: '#07261C',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1B7050',
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
