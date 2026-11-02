import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/theme';

export interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart?: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestart,
  onExit,
}) => {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      onClose={onResume}
      title="PAUSED"
    >
      <View style={styles.container}>
        <Button
          title="RESUME"
          variant="primary"
          onPress={onResume}
          style={styles.actionBtn}
        />
        {onRestart && (
          <Button
            title="RESTART MATCH"
            variant="secondary"
            onPress={onRestart}
            style={styles.actionBtn}
          />
        )}
        <Button
          title="SETTINGS"
          variant="secondary"
          onPress={() => router.push('/settings')}
          style={styles.actionBtn}
        />
        <Button
          title="EXIT MATCH"
          variant="gold"
          onPress={onExit}
          style={styles.actionBtn}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
});
