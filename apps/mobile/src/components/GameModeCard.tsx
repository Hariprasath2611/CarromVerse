import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { Badge } from './Badge';

export interface GameModeCardProps {
  id: string;
  title: string;
  playersLabel: string;
  description: string;
  icon: string;
  isSelected: boolean;
  isTeam?: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  playersLabel,
  description,
  icon,
  isSelected,
  isTeam = false,
  onSelect,
  style,
}) => {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selectedCard,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.badges}>
          {isTeam && <Badge label="2 vs 2" variant="wood" style={styles.badge} />}
          <Badge label={playersLabel} variant={isSelected ? 'success' : 'muted'} />
        </View>
      </View>

      <Text style={[styles.title, isSelected && styles.selectedTitle]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
        <Text style={[styles.statusText, isSelected && styles.selectedStatusText]}>
          {isSelected ? 'Mode Selected' : 'Tap to Select'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.card,
  },
  selectedCard: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.surfaceHighlight,
    ...THEME.shadows.emeraldGlow,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    marginRight: 4,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.subtitle,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: 4,
  },
  selectedTitle: {
    color: THEME.colors.accent,
  },
  description: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.bodySm,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: THEME.spacing.xs,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  radioCircleSelected: {
    borderColor: THEME.colors.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.accent,
  },
  statusText: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.fontSize.caption,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  selectedStatusText: {
    color: THEME.colors.accent,
  },
});
