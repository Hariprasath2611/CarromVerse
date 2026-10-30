export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;         // 0.0 to 1.0
  musicEnabled: boolean;
  musicVolume: number;         // 0.0 to 1.0
  hapticEnabled: boolean;
  aimAssistEnabled: boolean;
  strikerSensitivity: number;  // 0.5 to 2.0 (default: 1.0)
  graphicsQuality: GraphicsQuality;
  showFps: boolean;
  language: string;
  onboarded: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  soundEnabled: true,
  soundVolume: 0.8,
  musicEnabled: true,
  musicVolume: 0.5,
  hapticEnabled: true,
  aimAssistEnabled: true,
  strikerSensitivity: 1.0,
  graphicsQuality: 'high',
  showFps: false,
  language: 'en',
  onboarded: false,
};

