import { create } from 'zustand';
import { DEFAULT_GAME_SETTINGS, GameSettings } from '@carromverse/shared-types';
import { LocalStorageService } from '../services/storage/localStorageService';

interface SettingsState {
  settings: GameSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<GameSettings>) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleMusic: () => Promise<void>;
  toggleHaptics: () => Promise<void>;
  toggleAimAssist: () => Promise<void>;
  setOnboarded: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_GAME_SETTINGS,
  isLoading: true,

  loadSettings: async () => {
    const loaded = await LocalStorageService.getSettings();
    const onboarded = await LocalStorageService.hasOnboarded();
    set({
      settings: { ...loaded, onboarded },
      isLoading: false,
    });
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    set({ settings: updated });
    await LocalStorageService.saveSettings(partial);
  },

  toggleSound: async () => {
    const current = get().settings.soundEnabled;
    await get().updateSettings({ soundEnabled: !current });
  },

  toggleMusic: async () => {
    const current = get().settings.musicEnabled;
    await get().updateSettings({ musicEnabled: !current });
  },

  toggleHaptics: async () => {
    const current = get().settings.hapticEnabled;
    await get().updateSettings({ hapticEnabled: !current });
  },

  toggleAimAssist: async () => {
    const current = get().settings.aimAssistEnabled;
    await get().updateSettings({ aimAssistEnabled: !current });
  },

  setOnboarded: async () => {
    await LocalStorageService.setOnboarded(true);
    set((state) => ({
      settings: { ...state.settings, onboarded: true },
    }));
  },
}));
