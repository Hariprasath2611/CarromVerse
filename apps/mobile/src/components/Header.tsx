import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    marginBottom: THEME.spacing.md,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: THEME.spacing.md,
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  backArrow: {
    color: THEME.colors.goldBright,
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.title,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: THEME.spacing.md,
  },
});
