import { create } from 'zustand';
import { UserGameStatistics, UserProfile } from '@carromverse/shared-types';
import {
  getGameStatistics,
  getUserProfile,
  updateUserProfile as updateFirestoreProfile,
} from '../services/firebase/firebase.firestore';
import { LocalStorageService } from '../services/storage/localStorageService';

interface UserState {
  profile: UserProfile | null;
  statistics: UserGameStatistics | null;
  isLoading: boolean;
  error: string | null;

  loadUserProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, partial: Partial<UserProfile>) => Promise<void>;
  loadUserStatistics: (userId: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  statistics: null,
  isLoading: false,
  error: null,

  loadUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Try local cache first
      const cached = await LocalStorageService.getCachedProfile();
      if (cached && cached.userId === userId) {
        set({ profile: cached });
      }

      // 2. Fetch fresh from Firestore if online
      const remote = await getUserProfile(userId);
      if (remote) {
        set({ profile: remote, isLoading: false });
        await LocalStorageService.setCachedProfile(remote);
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load profile', isLoading: false });
    }
  },

  updateProfile: async (userId: string, partial: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      await updateFirestoreProfile(userId, partial);
      const current = get().profile;
      if (current) {
        const updated = { ...current, ...partial };
        set({ profile: updated, isLoading: false });
        await LocalStorageService.setCachedProfile(updated);
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  loadUserStatistics: async (userId: string) => {
    try {
      const stats = await getGameStatistics(userId);
      set({ statistics: stats });
    } catch (error: any) {
      console.warn('[UserStore] Failed to fetch statistics:', error);
    }
  },

  clearUser: () => {
    set({ profile: null, statistics: null, error: null });
    LocalStorageService.setCachedProfile(null).catch(() => {});
  },
}));

