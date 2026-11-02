import { create } from 'zustand';
import { DEFAULT_GAME_SETTINGS, GameSettings } from '@carromverse/shared-types';
import { LocalStorageService } from '../services/storage/localStorageService';
import { AudioManager } from '../services/audio/AudioManager';

interface SettingsState {
  settings: GameSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<GameSettings>) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleMusic: () => Promise<void>;
  setSoundVolume: (volume: number) => Promise<void>;
  setMusicVolume: (volume: number) => Promise<void>;
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
    const settings = { ...loaded, onboarded };
    set({
      settings,
      isLoading: false,
    });

    // Synchronize audio manager
    const audio = AudioManager.getInstance();
    audio.setSoundEnabled(settings.soundEnabled);
    audio.setSoundVolume(settings.soundVolume);
    audio.setMusicEnabled(settings.musicEnabled);
    audio.setMusicVolume(settings.musicVolume);
  },

  updateSettings: async (partial) => {
    const current = get().settings;
    const updated = { ...current, ...partial };
    set({ settings: updated });
    await LocalStorageService.saveSettings(partial);

    const audio = AudioManager.getInstance();
    if (partial.soundEnabled !== undefined) audio.setSoundEnabled(partial.soundEnabled);
    if (partial.soundVolume !== undefined) audio.setSoundVolume(partial.soundVolume);
    if (partial.musicEnabled !== undefined) audio.setMusicEnabled(partial.musicEnabled);
    if (partial.musicVolume !== undefined) audio.setMusicVolume(partial.musicVolume);
  },

  toggleSound: async () => {
    const current = get().settings.soundEnabled;
    await get().updateSettings({ soundEnabled: !current });
  },

  toggleMusic: async () => {
    const current = get().settings.musicEnabled;
    await get().updateSettings({ musicEnabled: !current });
  },

  setSoundVolume: async (volume: number) => {
    await get().updateSettings({ soundVolume: Math.max(0, Math.min(1, volume)) });
  },

  setMusicVolume: async (volume: number) => {
    await get().updateSettings({ musicVolume: Math.max(0, Math.min(1, volume)) });
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

