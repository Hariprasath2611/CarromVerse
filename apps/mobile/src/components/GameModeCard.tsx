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
        <View style={[styles.iconBox, isSelected && styles.selectedIconBox]}>
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
          {isSelected ? 'SELECTED' : 'SELECT MODE'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0E4A33',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1B7050',
    padding: 16,
    marginBottom: 12,
    ...THEME.shadows.card,
  },
  selectedCard: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125239',
    ...THEME.shadows.glowEmerald,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#07261C',
    borderColor: '#1B7050',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconBox: {
    borderColor: THEME.colors.neonEmerald,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  selectedTitle: {
    color: THEME.colors.neonEmerald,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.brass,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    color: THEME.colors.mutedMint,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1B7050',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1B7050',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: THEME.colors.neonEmerald,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.neonEmerald,
  },
  selectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  selectTextActive: {
    color: THEME.colors.neonEmerald,
  },
});
