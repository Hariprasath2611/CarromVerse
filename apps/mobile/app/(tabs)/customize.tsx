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
        `You need ${item.price} coins to unlock "${item.name}". Your current vault balance is ${coins} coins.`,
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
          <Text style={styles.screenTitle}>GEAR VAULT</Text>
          <Text style={styles.screenSubtitle}>Customize your playing equipment</Text>
        </View>
        <CoinBalance balance={coins} onAddPress={() => addCoins(500)} />
      </View>

      {/* Currently Equipped Loadout Showcase */}
      <GameCard style={styles.loadoutCard}>
        <Text style={styles.loadoutTitle}>EQUIPPED LOADOUT</Text>
        <View style={styles.loadoutGrid}>
          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedBoard.previewColor || '#7A431C' },
              ]}
            >
              <Text style={styles.swatchIcon}>🪵</Text>
            </View>
            <Text style={styles.loadoutLabel}>BOARD</Text>
            <Text style={styles.loadoutName} numberOfLines={1}>
              {equippedBoard.name}
            </Text>
          </View>

          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedStriker.previewColor || '#2BD67B' },
              ]}
            >
              <Text style={styles.swatchIcon}>⭐</Text>
            </View>
            <Text style={styles.loadoutLabel}>STRIKER</Text>
            <Text style={styles.loadoutName} numberOfLines={1}>
              {equippedStriker.name}
            </Text>
          </View>

          <View style={styles.loadoutItem}>
            <View
              style={[
                styles.previewMiniSwatch,
                { backgroundColor: equippedCoins.previewColor || '#F5ECD2' },
              ]}
            >
              <Text style={styles.swatchIcon}>⚪</Text>
            </View>
            <Text style={styles.loadoutLabel}>COINS</Text>
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
            🪵 BOARDS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'strikers' && styles.activeTabButton]}
          onPress={() => setActiveTab('strikers')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'strikers' && styles.activeTabText]}
          >
            ⭐ STRIKERS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'coins' && styles.activeTabButton]}
          onPress={() => setActiveTab('coins')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'coins' && styles.activeTabText]}
          >
            ⚪ COINS
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
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    color: THEME.colors.mutedMint,
    marginTop: 2,
  },
  loadoutCard: {
    padding: 12,
    marginBottom: 14,
  },
  loadoutTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.brass,
    letterSpacing: 1.2,
    marginBottom: 8,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#1B7050',
    borderWidth: 2,
    marginBottom: 6,
  },
  swatchIcon: {
    fontSize: 18,
  },
  loadoutLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
    letterSpacing: 0.5,
  },
  loadoutName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.cream,
    marginTop: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#07261C',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#1B7050',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: THEME.colors.neonEmerald,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.mutedMint,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#07261C',
  },
  listContent: {
    paddingBottom: 40,
  },
});
