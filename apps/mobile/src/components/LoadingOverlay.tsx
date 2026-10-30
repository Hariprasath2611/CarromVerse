import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={THEME.colors.goldBright} />
          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.colors.overlayHeavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.goldBorder,
    ...THEME.shadows.card,
    minWidth: 160,
  },
  message: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.body,
    marginTop: THEME.spacing.md,
    fontWeight: THEME.typography.fontWeight.medium,
  },
});

