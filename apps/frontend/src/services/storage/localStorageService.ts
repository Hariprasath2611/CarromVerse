import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GAME_SETTINGS, GameSettings, UserProfile } from '@carromverse/shared-types';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export class LocalStorageService {
  public static async getSettings(): Promise<GameSettings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (raw) {
        return { ...DEFAULT_GAME_SETTINGS, ...JSON.parse(raw) };
      }
      return DEFAULT_GAME_SETTINGS;
    } catch (error) {
      console.warn('[LocalStorage] Failed to load settings:', error);
      return DEFAULT_GAME_SETTINGS;
    }
  }

  public static async saveSettings(settings: Partial<GameSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('[LocalStorage] Failed to save settings:', error);
    }
  }

  public static async hasOnboarded(): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
      return raw === 'true';
    } catch {
      return false;
    }
  }

  public static async setOnboarded(value: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
    } catch (error) {
      console.error('[LocalStorage] Failed to save onboarding status:', error);
    }
  }

  public static async getCachedProfile(): Promise<UserProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static async setCachedProfile(profile: UserProfile | null): Promise<void> {
    try {
      if (!profile) {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      }
    } catch (error) {
      console.error('[LocalStorage] Failed to cache profile:', error);
    }
  }

  public static async getRecentPlayerNames(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_PLAYER_NAMES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async saveRecentPlayerName(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || trimmed.startsWith('Player ') || trimmed.startsWith('Team ')) return;
    try {
      const current = await this.getRecentPlayerNames();
      const filtered = current.filter((n) => n.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_PLAYER_NAMES, JSON.stringify(updated));
    } catch (error) {
      console.warn('[LocalStorage] Failed to save recent player name:', error);
    }
  }

  public static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[LocalStorage] Failed to clear storage:', error);
    }
  }
}

