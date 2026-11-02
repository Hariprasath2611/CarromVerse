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
              title="EQUIP"
              variant="forest"
              onPress={handleEquip}
              style={styles.actionBtn}
            />
          )
        ) : (
          <PrimaryButton
            title={`UNLOCK ${item.price.toLocaleString()} 🪙`}
            variant="gold"
            disabled={!canAfford}
            onPress={handleUnlock}
            style={styles.actionBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0E4A33',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1B7050',
    padding: 16,
    marginBottom: 14,
    ...THEME.shadows.card,
  },
  equippedCard: {
    borderColor: THEME.colors.neonEmerald,
    backgroundColor: '#125239',
    ...THEME.shadows.glowEmerald,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1B7050',
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
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  desc: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    lineHeight: 18,
  },
  footer: {
    marginTop: 4,
  },
  actionBtn: {
    width: '100%',
  },
  equippedBadge: {
    backgroundColor: THEME.colors.neonEmerald,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#169352',
  },
  equippedText: {
    color: '#07261C',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.8,
  },
});
