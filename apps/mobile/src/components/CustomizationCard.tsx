import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { Badge } from './Badge';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { CustomizationItem } from '../store/economyStore';

export interface CustomizationCardProps {
  item: CustomizationItem;
  isEquipped?: boolean;
  canAfford?: boolean;
  onEquip?: () => void;
  onUnlock?: () => void;
  onAction?: () => void;
  style?: ViewStyle;
}

export const CustomizationCard: React.FC<CustomizationCardProps> = ({
  item,
  isEquipped = item.isEquipped ?? false,
  canAfford = true,
  onEquip,
  onUnlock,
  onAction,
  style,
}) => {
  const getRarityVariant = (rarity: CustomizationItem['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return 'gold';
      case 'Epic':
        return 'wood';
      case 'Rare':
        return 'success';
      case 'Common':
      default:
        return 'muted';
    }
  };

  const handleEquip = onAction || onEquip || (() => {});
  const handleUnlock = onAction || onUnlock || (() => {});

  return (
    <View style={[styles.card, isEquipped && styles.equippedCard, style]}>
      {/* Top Preview Circle */}
      <View style={styles.previewContainer}>
        <View style={[styles.colorPreview, { backgroundColor: item.previewColor }]}>
          {item.category === 'board' && <Text style={styles.categorySymbol}>🎯</Text>}
          {item.category === 'striker' && <Text style={styles.categorySymbol}>⭐</Text>}
          {item.category === 'coin' && <Text style={styles.categorySymbol}>⚪</Text>}
        </View>
        <Badge
          label={item.rarity}
          variant={getRarityVariant(item.rarity) as any}
          style={styles.rarityBadge}
        />
      </View>

      {/* Item Details */}
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        {item.isUnlocked ? (
          isEquipped ? (
            <View style={styles.equippedBadge}>
              <Text style={styles.equippedText}>✓ EQUIPPED</Text>
            </View>
          ) : (
            <SecondaryButton
              title="Equip"
              onPress={handleEquip}
              style={styles.actionBtn}
            />
          )
        ) : (
          <PrimaryButton
            title={`Unlock ${item.price.toLocaleString()} 🪙`}
            variant="gold"
            disabled={!canAfford}
            onPress={handleUnlock}
            style={styles.actionBtn}
            textStyle={styles.unlockText}
          />
        )}
      </View>
    </View>
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
  equippedCard: {
    borderColor: THEME.colors.accent,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: THEME.colors.borderHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySymbol: {
    fontSize: 22,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  details: {
    marginBottom: THEME.spacing.md,
  },
  name: {
    fontSize: THEME.typography.fontSize.bodyLg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: THEME.spacing.xs,
  },
  actionBtn: {
    width: '100%',
  },
  equippedBadge: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedText: {
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  unlockText: {
    fontSize: 13,
  },
});
