import { create } from 'zustand';

export type CustomizationCategory = 'boards' | 'coins' | 'strikers' | 'board' | 'coin' | 'striker';

export interface CustomizationItem {
  id: string;
  category: 'board' | 'coin' | 'striker';
  name: string;
  description: string;
  previewColor: string;
  price: number;
  isUnlocked: boolean;
  isEquipped?: boolean;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date?: string;
  timestamp?: string;
  read: boolean;
  type: 'reward' | 'system' | 'challenge';
}

export const RAW_CUSTOMIZATION_ITEMS: Record<'board' | 'coin' | 'striker', CustomizationItem[]> = {
  board: [
    {
      id: 'board_classic',
      category: 'board',
      name: 'Classic Teak',
      description: 'Traditional handcrafted Indian rosewood & polished maple.',
      previewColor: '#8B4513',
      price: 0,
      isUnlocked: true,
      rarity: 'Common',
    },
    {
      id: 'board_forest',
      category: 'board',
      name: 'Forest Emerald',
      description: 'Lush dark pine frame with jade inlays and precision baselines.',
      previewColor: '#16A34A',
      price: 1000,
      isUnlocked: true,
      rarity: 'Rare',
    },
    {
      id: 'board_royal',
      category: 'board',
      name: 'Royal Mahogany',
      description: 'Deep mahogany wood with burnished brass corner rings.',
      previewColor: '#5C2C16',
      price: 2500,
      isUnlocked: false,
      rarity: 'Rare',
    },
    {
      id: 'board_marble',
      category: 'board',
      name: 'White Marble',
      description: 'Smooth polished Italian marble surface for ultra-glide speed.',
      previewColor: '#E2E8F0',
      price: 5000,
      isUnlocked: false,
      rarity: 'Epic',
    },
    {
      id: 'board_premium',
      category: 'board',
      name: 'Imperial Gold',
      description: 'Solid gilded ebony wood engraved with royal motifs.',
      previewColor: '#F59E0B',
      price: 10000,
      isUnlocked: false,
      rarity: 'Legendary',
    },
  ],
  coin: [
    {
      id: 'coin_classic',
      category: 'coin',
      name: 'Classic Boxwood',
      description: 'Smooth wooden carrom men with traditional concentric rings.',
      previewColor: '#F5F5DC',
      price: 0,
      isUnlocked: true,
      rarity: 'Common',
    },
    {
      id: 'coin_wooden',
      category: 'coin',
      name: 'Dark Walnut',
      description: 'Dark stained walnut carrom men with polished edges.',
      previewColor: '#451F0D',
      price: 800,
      isUnlocked: true,
      rarity: 'Rare',
    },
    {
      id: 'coin_gold',
      category: 'coin',
      name: 'Gold Inlay',
      description: 'Fine metallic coins lined with glittering gold lacquer.',
      previewColor: '#FBBF24',
      price: 3000,
      isUnlocked: false,
      rarity: 'Epic',
    },
    {
      id: 'coin_diamond',
      category: 'coin',
      name: 'Diamond Crystal',
      description: 'Faceted crystalline coins refracting light across the board.',
      previewColor: '#38BDF8',
      price: 7500,
      isUnlocked: false,
      rarity: 'Legendary',
    },
  ],
  striker: [
    {
      id: 'striker_classic',
      category: 'striker',
      name: 'Classic Acrylic',
      description: 'High-density tournament-grade polished white acrylic.',
      previewColor: '#F8FAFC',
      price: 0,
      isUnlocked: true,
      rarity: 'Common',
    },
    {
      id: 'striker_emerald',
      category: 'striker',
      name: 'Emerald Onyx',
      description: 'Luminous green gemstone core encased in dark resin.',
      previewColor: '#10B981',
      price: 1200,
      isUnlocked: true,
      rarity: 'Rare',
    },
    {
      id: 'striker_royal',
      category: 'striker',
      name: 'Royal Sapphire',
      description: 'Sapphire jewel core with circular laser-guided rim.',
      previewColor: '#3B82F6',
      price: 3500,
      isUnlocked: false,
      rarity: 'Epic',
    },
    {
      id: 'striker_premium',
      category: 'striker',
      name: 'Imperial Sunburst',
      description: 'Gilded gold striker calibrated for maximum rebound velocity.',
      previewColor: '#F59E0B',
      price: 8000,
      isUnlocked: false,
      rarity: 'Legendary',
    },
  ],
};

export const CUSTOMIZATION_ITEMS = RAW_CUSTOMIZATION_ITEMS;

interface EconomyState {
  coins: number;
  selectedBoardId: string;
  selectedCoinId: string;
  selectedStrikerId: string;
  unlockedItems: string[];
  dailyRewardClaimed: boolean;
  dailyRewardStreak: number;
  lastClaimDate: string | null;
  hasUnclaimedDailyReward: boolean;
  notifications: NotificationItem[];

  boards: CustomizationItem[];
  coinsItems: CustomizationItem[];
  strikers: CustomizationItem[];

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  equipItem: (category: CustomizationCategory, id: string) => void;
  unlockItem: (categoryOrId: CustomizationCategory | string, idOrPrice?: string | number) => boolean;
  claimDailyReward: () => number;
  markNotificationsAsRead: () => void;
}

function resolveItems(
  cat: 'board' | 'coin' | 'striker',
  unlockedIds: string[],
  selectedId: string
): CustomizationItem[] {
  return RAW_CUSTOMIZATION_ITEMS[cat].map((item) => ({
    ...item,
    isUnlocked: item.price === 0 || unlockedIds.includes(item.id),
    isEquipped: selectedId === item.id,
  }));
}

const INITIAL_UNLOCKED = [
  'board_classic',
  'board_forest',
  'coin_classic',
  'coin_wooden',
  'striker_classic',
  'striker_emerald',
];

export const useEconomyStore = create<EconomyState>((set, get) => {
  const selectedBoard = 'board_forest';
  const selectedCoin = 'coin_classic';
  const selectedStriker = 'striker_emerald';

  return {
    coins: 2500,
    selectedBoardId: selectedBoard,
    selectedCoinId: selectedCoin,
    selectedStrikerId: selectedStriker,
    unlockedItems: INITIAL_UNLOCKED,
    dailyRewardClaimed: false,
    dailyRewardStreak: 3,
    lastClaimDate: null,
    hasUnclaimedDailyReward: true,
    notifications: [
      {
        id: 'notif_1',
        title: 'Welcome Champion!',
        message: 'Claim 500 bonus coins to kickstart your CarromVerse journey.',
        date: 'Just now',
        timestamp: 'Just now',
        read: false,
        type: 'reward',
      },
      {
        id: 'notif_2',
        title: 'Forest Emerald Theme',
        message: 'The new Forest Emerald board has been unlocked for your account.',
        date: '2 hours ago',
        timestamp: '2 hours ago',
        read: false,
        type: 'system',
      },
    ],

    boards: resolveItems('board', INITIAL_UNLOCKED, selectedBoard),
    coinsItems: resolveItems('coin', INITIAL_UNLOCKED, selectedCoin),
    strikers: resolveItems('striker', INITIAL_UNLOCKED, selectedStriker),

    addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

    spendCoins: (amount) => {
      if (get().coins < amount) return false;
      set((s) => ({ coins: s.coins - amount }));
      return true;
    },

    equipItem: (category, id) => {
      const state = get();
      if (!state.unlockedItems.includes(id)) return;

      let bId = state.selectedBoardId;
      let cId = state.selectedCoinId;
      let sId = state.selectedStrikerId;

      if (category === 'board' || category === 'boards') bId = id;
      if (category === 'coin' || category === 'coins') cId = id;
      if (category === 'striker' || category === 'strikers') sId = id;

      set({
        selectedBoardId: bId,
        selectedCoinId: cId,
        selectedStrikerId: sId,
        boards: resolveItems('board', state.unlockedItems, bId),
        coinsItems: resolveItems('coin', state.unlockedItems, cId),
        strikers: resolveItems('striker', state.unlockedItems, sId),
      });
    },

    unlockItem: (categoryOrId, idOrPrice) => {
      const state = get();
      let itemId = '';
      let itemPrice = 0;

      if (typeof idOrPrice === 'string') {
        itemId = idOrPrice;
        // lookup item price
        const allItems = [
          ...RAW_CUSTOMIZATION_ITEMS.board,
          ...RAW_CUSTOMIZATION_ITEMS.coin,
          ...RAW_CUSTOMIZATION_ITEMS.striker,
        ];
        const match = allItems.find((i) => i.id === itemId);
        itemPrice = match ? match.price : 0;
      } else if (typeof idOrPrice === 'number') {
        itemId = categoryOrId;
        itemPrice = idOrPrice;
      } else {
        itemId = categoryOrId;
      }

      if (state.unlockedItems.includes(itemId)) return true;
      if (state.coins < itemPrice) return false;

      const newUnlocked = [...state.unlockedItems, itemId];
      set({
        coins: state.coins - itemPrice,
        unlockedItems: newUnlocked,
        boards: resolveItems('board', newUnlocked, state.selectedBoardId),
        coinsItems: resolveItems('coin', newUnlocked, state.selectedCoinId),
        strikers: resolveItems('striker', newUnlocked, state.selectedStrikerId),
      });
      return true;
    },

    claimDailyReward: () => {
      if (get().dailyRewardClaimed) return 0;
      const reward = 300 * (get().dailyRewardStreak + 1);
      set((s) => ({
        coins: s.coins + reward,
        dailyRewardClaimed: true,
        hasUnclaimedDailyReward: false,
        dailyRewardStreak: (s.dailyRewardStreak % 7) + 1,
        lastClaimDate: new Date().toISOString(),
      }));
      return reward;
    },

    markNotificationsAsRead: () => {
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }));
    },
  };
});
