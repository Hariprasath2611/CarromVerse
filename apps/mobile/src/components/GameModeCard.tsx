import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { Badge } from './Badge';

export interface GameModeCardProps {
  id?: string;
  mode?: string;
  title: string;
  subtitle?: string;
  playersLabel?: string;
  playerCount?: string;
  description: string;
  icon: string;
  isSelected: boolean;
  isTeam?: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  subtitle,
  playersLabel,
  playerCount,
  description,
  icon,
  isSelected,
  isTeam = false,
  onSelect,
  style,
}) => {
  const displayLabel = playerCount || playersLabel || '2 Players';

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
          <Badge label={displayLabel} variant={isSelected ? 'success' : 'muted'} />
        </View>
      </View>

      <Text style={[styles.title, isSelected && styles.selectedTitle]}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.description}>{description}</Text>

      <View style={styles.indicatorRow}>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.selectText, isSelected && styles.selectTextActive]}>
          {isSelected ? 'Selected' : 'Select Mode'}
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
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.card,
  },
  selectedCard: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  pressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    marginRight: 6,
  },
  title: {
    fontSize: THEME.typography.fontSize.bodyLg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginTop: 4,
  },
  selectedTitle: {
    color: THEME.colors.accent,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.accent,
    fontWeight: THEME.typography.fontWeight.medium,
    marginTop: 2,
    marginBottom: 4,
  },
  description: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: THEME.spacing.sm,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: THEME.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.borderHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: THEME.colors.accent,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accent,
  },
  selectText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
  },
  selectTextActive: {
    color: THEME.colors.accent,
  },
});
