import { BoardThemeConfig, BoardThemeId } from '../types/GameTypes.js';

export const BOARD_THEMES: Record<BoardThemeId, BoardThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Teak & Maple',
    colors: {
      frameColor: '#5C2C16',
      frameAccent: '#8B4513',
      frameInnerCushion: '#3D1D0E',
      surfaceBg: '#E8D3B0',
      surfaceGlow: 'rgba(232, 211, 176, 0.1)',
      markingsColor: '#3D1D0E',
      pocketColor: '#0A0A0A',
      pocketRimColor: '#A0522D',
      baselineCircleColor: '#B91C1C',
      baselineDotColor: '#DC2626',
      arrowColor: '#5C2C16',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Emerald',
    colors: {
      frameColor: '#071810',
      frameAccent: '#0D3322',
      frameInnerCushion: '#064E3B',
      surfaceBg: '#0F261B',
      surfaceGlow: 'rgba(74, 222, 128, 0.15)',
      markingsColor: '#4ADE80',
      pocketColor: '#040B07',
      pocketRimColor: '#16A34A',
      baselineCircleColor: '#16A34A',
      baselineDotColor: '#4ADE80',
      arrowColor: '#22C55E',
    },
  },
  royal: {
    id: 'royal',
    name: 'Royal Mahogany & Velvet',
    colors: {
      frameColor: '#2A0D08',
      frameAccent: '#4A1D13',
      frameInnerCushion: '#33100B',
      surfaceBg: '#1E1B4B',
      surfaceGlow: 'rgba(129, 140, 248, 0.12)',
      markingsColor: '#C7D2FE',
      pocketColor: '#08081A',
      pocketRimColor: '#D97706',
      baselineCircleColor: '#EF4444',
      baselineDotColor: '#F87171',
      arrowColor: '#818CF8',
    },
  },
  marble: {
    id: 'marble',
    name: 'White Carrara Marble',
    colors: {
      frameColor: '#1E293B',
      frameAccent: '#334155',
      frameInnerCushion: '#0F172A',
      surfaceBg: '#F1F5F9',
      surfaceGlow: 'rgba(255, 255, 255, 0.2)',
      markingsColor: '#475569',
      pocketColor: '#090D14',
      pocketRimColor: '#64748B',
      baselineCircleColor: '#DC2626',
      baselineDotColor: '#EF4444',
      arrowColor: '#334155',
    },
  },
  neon: {
    id: 'neon',
    name: 'Cyberpunk Neon',
    colors: {
      frameColor: '#09090B',
      frameAccent: '#18181B',
      frameInnerCushion: '#27272A',
      surfaceBg: '#090D16',
      surfaceGlow: 'rgba(56, 189, 248, 0.25)',
      markingsColor: '#38BDF8',
      pocketColor: '#000000',
      pocketRimColor: '#06B6D4',
      baselineCircleColor: '#EC4899',
      baselineDotColor: '#F472B6',
      arrowColor: '#A855F7',
    },
  },
  gold: {
    id: 'gold',
    name: 'Imperial Gold & Onyx',
    colors: {
      frameColor: '#181409',
      frameAccent: '#2F250B',
      frameInnerCushion: '#42330D',
      surfaceBg: '#1A1608',
      surfaceGlow: 'rgba(251, 191, 36, 0.2)',
      markingsColor: '#FBBF24',
      pocketColor: '#0A0802',
      pocketRimColor: '#F59E0B',
      baselineCircleColor: '#DC2626',
      baselineDotColor: '#F59E0B',
      arrowColor: '#F59E0B',
    },
  },
};

export function getBoardTheme(themeId: string): BoardThemeConfig {
  const key = (themeId.toLowerCase() in BOARD_THEMES
    ? themeId.toLowerCase()
    : 'forest') as BoardThemeId;
  return BOARD_THEMES[key];
}
