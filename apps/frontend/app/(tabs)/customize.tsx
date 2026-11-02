import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BoardPreview,
  Button,
  Card,
  CoinBalance,
  ScreenContainer,
} from '../../src/components';
import { useEconomyStore } from '../../src/store/economyStore';
import { THEME } from '../../src/constants/theme';

type TabType = 'BOARDS' | 'COINS' | 'STRIKERS' | 'STICKERS';

interface ItemConfig {
  id: string;
  name: string;
  theme: string;
  status: 'equipped' | 'equip' | 'locked';
  price?: number;
}

const BOARDS_DATA: ItemConfig[] = [
  { id: 'classic', name: 'CLASSIC', theme: 'classic', status: 'equipped' },
  { id: 'emerald', name: 'EMERALD', theme: 'emerald', status: 'equip' },
  { id: 'midnight', name: 'MIDNIGHT', theme: 'mahogany', status: 'locked', price: 1500 },
  { id: 'rosewood', name: 'ROSEWOOD', theme: 'rosewood', status: 'locked', price: 2000 },
];

export default function CustomizeScreen() {
  const { coins, addCoins } = useEconomyStore();
  const [activeTab, setActiveTab] = useState<TabType>('BOARDS');
  const [items, setItems] = useState<ItemConfig[]>(BOARDS_DATA);

  const tabs: TabType[] = ['BOARDS', 'COINS', 'STRIKERS', 'STICKERS'];

  const handleAction = (item: ItemConfig) => {
    if (item.status === 'equipped') return;
    if (item.status === 'equip') {
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          status: i.id === item.id ? 'equipped' : i.status === 'equipped' ? 'equip' : i.status,
        }))
      );
    } else if (item.status === 'locked') {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'equipped' }
            : i.status === 'equipped'
            ? { ...i, status: 'equip' }
            : i
        )
      );
    }
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.container}
    >
      {/* Decorative background shapes */}
      <View style={styles.bokehTop} pointerEvents="none" />
      <View style={styles.bokehBottom} pointerEvents="none" />

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>CUSTOMIZE</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2x2 Grid of Items */}
      <View style={styles.grid}>
        {items.map((item) => (
          <Card key={item.id} style={styles.gridCard}>
            {/* Visual Board Swatch */}
            <View style={styles.boardThumbWrap}>
              <BoardPreview size={96} theme={item.theme} />
            </View>

            <Text style={styles.itemName}>{item.name}</Text>

            {item.status === 'equipped' ? (
              <Button
                title="EQUIPPED"
                variant="gold"
                onPress={() => {}}
                style={styles.cardBtn}
              />
            ) : item.status === 'equip' ? (
              <Button
                title="EQUIP"
                variant="secondary"
                onPress={() => handleAction(item)}
                style={styles.cardBtn}
              />
            ) : (
              <Button
                title={item.price ? `${item.price.toLocaleString()}` : 'UNLOCK'}
                variant="gold"
                onPress={() => handleAction(item)}
                style={styles.cardBtn}
              />
            )}
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#07261C',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  bokehTop: {
    position: 'absolute',
    top: 40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(15, 90, 62, 0.25)',
  },
  bokehBottom: {
    position: 'absolute',
    bottom: 80,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 90, 62, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#F5ECD2',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0E4A33',
    borderColor: '#1B7050',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#2BD67B',
    borderColor: '#2BD67B',
  },
  tabText: {
    color: '#9FD8B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#07261C',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  gridCard: {
    width: '47.5%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
  },
  boardThumbWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  itemName: {
    color: '#F5ECD2',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginVertical: 10,
    textAlign: 'center',
  },
  cardBtn: {
    width: '100%',
    height: 44,
  },
});
