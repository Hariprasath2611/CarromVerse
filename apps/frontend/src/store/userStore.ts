import { create } from 'zustand';
import {
  AvatarUploadDto,
  UpdateProfileDto,
  UserGameStatistics,
  UserProfile,
  UsernameAvailabilityResponse,
} from '@carromverse/shared-types';
import { ProfileApiService } from '../services/api/profileApi';
import { getGameStatistics } from '../services/firebase/firebase.firestore';
import { LocalStorageService } from '../services/storage/localStorageService';

interface UserState {
  profile: UserProfile | null;
  statistics: UserGameStatistics | null;
  isLoading: boolean;
  error: string | null;

  loadUserProfile: (userId?: string) => Promise<void>;
  updateProfile: (partial: UpdateProfileDto) => Promise<void>;
  checkUsername: (username: string) => Promise<UsernameAvailabilityResponse>;
  updateAvatar: (avatarData: AvatarUploadDto) => Promise<void>;
  removeAvatar: () => Promise<void>;
  loadUserStatistics: (userId: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  statistics: null,
  isLoading: false,
  error: null,

  loadUserProfile: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Try local cache first for instantaneous offline/initial load
      const cached = await LocalStorageService.getCachedProfile();
      if (cached && (!userId || cached.userId === userId)) {
        set({ profile: cached });
      }

      // 2. Fetch fresh profile from API
      try {
        const remote = await ProfileApiService.getMyProfile();
        set({ profile: remote, isLoading: false });
      } catch (apiErr) {
        // If API is unavailable, keep cached profile
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load profile', isLoading: false });
    }
  },

  updateProfile: async (partial: UpdateProfileDto) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await ProfileApiService.updateMyProfile(partial);
      set({ profile: updated, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  checkUsername: async (username: string) => {
    return await ProfileApiService.checkUsernameAvailability(username);
  },

  updateAvatar: async (avatarData: AvatarUploadDto) => {
    set({ isLoading: true, error: null });
    try {
      const res = await ProfileApiService.uploadAvatar(avatarData);
      const current = get().profile;
      if (current) {
        const updated: UserProfile = { ...current, avatarUrl: res.avatarUrl };
        set({ profile: updated, isLoading: false });
        await LocalStorageService.setCachedProfile(updated);
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update avatar', isLoading: false });
      throw error;
    }
  },

  removeAvatar: async () => {
    set({ isLoading: true, error: null });
    try {
      await ProfileApiService.deleteAvatar();
      const current = get().profile;
      if (current) {
        const updated: UserProfile = { ...current, avatarUrl: null };
        set({ profile: updated, isLoading: false });
        await LocalStorageService.setCachedProfile(updated);
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error?.message || 'Failed to remove avatar', isLoading: false });
      throw error;
    }
  },

  loadUserStatistics: async (userId: string) => {
    try {
      const stats = await getGameStatistics(userId);
      if (stats) {
        set({ statistics: stats });
      }
    } catch (error) {
      console.warn('[UserStore] Failed to fetch statistics:', error);
    }
  },

  clearUser: () => {
    set({ profile: null, statistics: null, error: null, isLoading: false });
  },
}));
