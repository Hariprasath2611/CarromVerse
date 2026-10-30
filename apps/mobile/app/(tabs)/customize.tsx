import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CoinBalance,
  CustomizationCard,
  GameCard,
  ScreenContainer,
} from '../../src/components';
import { CustomizationCategory, CustomizationItem, useEconomyStore } from '../../src/store/economyStore';
import { THEME } from '../../src/constants/theme';

export default function CustomizeScreen() {
  const { coins, boards, coinsItems, strikers, equipItem, unlockItem, addCoins } =
    useEconomyStore();

  const [activeTab, setActiveTab] = useState<CustomizationCategory>('boards');

  const currentItems =
    activeTab === 'boards' ? boards : activeTab === 'coins' ? coinsItems : strikers;

  const equippedBoard = boards.find((b) => b.isEquipped) || boards[0];
  const equippedStriker = strikers.find((s) => s.isEquipped) || strikers[0];
  const equippedCoins = coinsItems.find((c) => c.isEquipped) || coinsItems[0];

  const handleAction = (item: CustomizationItem) => {
    if (item.isEquipped) return;

    if (item.isUnlocked) {
      equipItem(activeTab, item.id);
      return;
    }

    // Attempt to unlock
    if (coins < item.price) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${item.price} coins to unlock "${item.name}". Your current balance is ${coins} coins.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Get +1000 Coins',
            onPress: () => addCoins(1000),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Unlock Gear',
      `Unlock "${item.name}" for ${item.price} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock & Equip',
          onPress: () => {
            const success = unlockItem(activeTab, item.id);
            if (success) {
              equipItem(activeTab, item.id);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header & Coin Counter */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Armory & Gear</Text>
          <Text style={styles.screenSubtitle}>Customize your playing equipment</Text>
        </View>
        <CoinBalance balance={coins} onAddPress={() => addCoins(500)} />
      </View>

      {/* Currently Equipped Loadout Showcase */}
      <GameCard style={styles.loadoutCard}>
        <Text style={styles.loadoutTitle}>CURRENT LOADOUT</Text>
        <View style={styles.loadoutGrid}>
          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedBoard.previewColor || '#D27D2D' },
              ]}
            >
              <Text style={styles.swatchIcon}>🪵</Text>
            </View>
            <Text style={styles.loadoutLabel}>Board</Text>
            <Text style={styles.loadoutName} numberOfLines={1}>
              {equippedBoard.name}
            </Text>
          </View>

          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedStriker.previewColor || '#DC2626' },
              ]}
            >
              <Text style={styles.swatchIcon}>🔴</Text>
            </View>
            <Text style={styles.loadoutLabel}>Striker</Text>
            <Text style={styles.loadoutName} numberOfLines={1}>
              {equippedStriker.name}
            </Text>
          </View>

          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedCoins.previewColor || '#F5F5F0' },
              ]}
            >
              <Text style={styles.swatchIcon}>⚪</Text>
            </View>
            <Text style={styles.loadoutLabel}>Coins</Text>
            <Text style={styles.loadoutName} numberOfLines={1}>
              {equippedCoins.name}
            </Text>
          </View>
        </View>
      </GameCard>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'boards' && styles.activeTabButton]}
          onPress={() => setActiveTab('boards')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'boards' && styles.activeTabText]}
          >
            🪵 Boards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'strikers' && styles.activeTabButton]}
          onPress={() => setActiveTab('strikers')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'strikers' && styles.activeTabText]}
          >
            🔴 Strikers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'coins' && styles.activeTabButton]}
          onPress={() => setActiveTab('coins')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'coins' && styles.activeTabText]}
          >
            ⚪ Coins
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <FlatList
        data={currentItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomizationCard item={item} onAction={() => handleAction(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  screenTitle: {
    fontSize: THEME.typography.fontSize.h2,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: THEME.typography.fontSize.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  loadoutCard: {
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    borderColor: THEME.colors.border,
  },
  loadoutTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: THEME.spacing.xs,
  },
  loadoutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loadoutItem: {
    alignItems: 'center',
    flex: 1,
  },
  previewMiniSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: THEME.colors.border,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  swatchIcon: {
    fontSize: 16,
  },
  loadoutLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  loadoutName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.textPrimary,
    marginTop: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 4,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  activeTabButton: {
    backgroundColor: THEME.colors.primary,
  },
  tabButtonText: {
    fontSize: THEME.typography.fontSize.bodySm,
    fontWeight: 'bold',
    color: THEME.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: THEME.spacing.xxl,
  },
});
