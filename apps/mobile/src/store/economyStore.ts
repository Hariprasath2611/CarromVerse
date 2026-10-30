import { create } from 'zustand';

export interface CustomizationItem {
  id: string;
  category: 'board' | 'coin' | 'striker';
  name: string;
  description: string;
  previewColor: string;
  price: number;
  isUnlocked: boolean;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reward' | 'system' | 'challenge';
}

interface EconomyState {
  coins: number;
  selectedBoardId: string;
  selectedCoinId: string;
  selectedStrikerId: string;
  unlockedItems: string[];
  dailyRewardClaimed: boolean;
  dailyRewardStreak: number;
  lastClaimDate: string | null;
  notifications: NotificationItem[];

  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  equipItem: (category: 'board' | 'coin' | 'striker', id: string) => void;
  unlockItem: (id: string, price: number) => boolean;
  claimDailyReward: () => number;
  markNotificationsAsRead: () => void;
}

export const CUSTOMIZATION_ITEMS: Record<string, CustomizationItem[]> = {
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

export const useEconomyStore = create<EconomyState>((set, get) => ({
  coins: 2500,
  selectedBoardId: 'board_forest',
  selectedCoinId: 'coin_classic',
  selectedStrikerId: 'striker_emerald',
  unlockedItems: ['board_classic', 'board_forest', 'coin_classic', 'coin_wooden', 'striker_classic', 'striker_emerald'],
  dailyRewardClaimed: false,
  dailyRewardStreak: 3,
  lastClaimDate: null,
  notifications: [
    {
      id: 'notif_1',
      title: 'Welcome Champion!',
      message: 'Claim 500 bonus coins to kickstart your CarromVerse journey.',
      timestamp: 'Just now',
      read: false,
      type: 'reward',
    },
    {
      id: 'notif_2',
      title: 'Forest Emerald Theme',
      message: 'The new Forest Emerald board has been unlocked for your account.',
      timestamp: '2 hours ago',
      read: false,
      type: 'system',
    },
  ],

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  spendCoins: (amount) => {
    if (get().coins < amount) return false;
    set((s) => ({ coins: s.coins - amount }));
    return true;
  },

  equipItem: (category, id) => {
    if (!get().unlockedItems.includes(id)) return;
    if (category === 'board') set({ selectedBoardId: id });
    if (category === 'coin') set({ selectedCoinId: id });
    if (category === 'striker') set({ selectedStrikerId: id });
  },

  unlockItem: (id, price) => {
    if (get().unlockedItems.includes(id)) return true;
    if (get().coins < price) return false;

    set((s) => ({
      coins: s.coins - price,
      unlockedItems: [...s.unlockedItems, id],
    }));
    return true;
  },

  claimDailyReward: () => {
    if (get().dailyRewardClaimed) return 0;
    const reward = 300 * (get().dailyRewardStreak + 1);
    set((s) => ({
      coins: s.coins + reward,
      dailyRewardClaimed: true,
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
}));
