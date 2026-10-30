import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { Badge } from './Badge';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { CustomizationItem } from '../store/economyStore';

export interface CustomizationCardProps {
  item: CustomizationItem;
  isEquipped: boolean;
  canAfford: boolean;
  onEquip: () => void;
  onUnlock: () => void;
  style?: ViewStyle;
}

export const CustomizationCard: React.FC<CustomizationCardProps> = ({
  item,
  isEquipped,
  canAfford,
  onEquip,
  onUnlock,
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
              onPress={onEquip}
              style={styles.actionBtn}
            />
          )
        ) : (
          <PrimaryButton
            title={`Unlock ${item.price.toLocaleString()} 🪙`}
            variant="gold"
            disabled={!canAfford}
            onPress={onUnlock}
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
    backgroundColor: THEME.colors.surfaceHighlight,
    ...THEME.shadows.emeraldGlow,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  colorPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.borderHighlight,
  },
  categorySymbol: {
    fontSize: 22,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
  },
  details: {
    marginBottom: THEME.spacing.md,
  },
  name: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.fontSize.subtitle,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: 4,
  },
  desc: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.fontSize.caption,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
  },
  actionBtn: {
    height: 44,
  },
  equippedBadge: {
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.secondary,
    borderWidth: 1,
    borderColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedText: {
    color: THEME.colors.accent,
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: THEME.typography.fontWeight.heavy,
    letterSpacing: 1,
  },
  unlockText: {
    fontSize: THEME.typography.fontSize.bodySm,
  },
});
