/**
 * CarromVerse Forest Emerald Design System
 * Theme: FOREST EMERALD
 * Palette:
 * - Primary: #16A34A
 * - Secondary: #064E3B
 * - Accent: #4ADE80
 * - Background: #07130E
 * - Surface: #10251A
 * - Card: #143322
 * - Primary Text: #FFFFFF
 * - Secondary Text: #A7B8AD
 * - Border: #234734
 * - Wood: Natural warm brown (#8B4513, #A0522D, #5C2C16, #D27D2D)
 */

export const THEME = {
  colors: {
    // Dominant Forest Emerald Palette
    primary: '#16A34A',              // Vibrant Emerald Green
    primaryHover: '#15803D',
    primaryGlow: 'rgba(22, 163, 74, 0.35)',

    secondary: '#064E3B',            // Deep Forest Pine Green
    secondaryHover: '#043427',

    accent: '#4ADE80',               // Radiant Mint / Lime Accent
    accentGlow: 'rgba(74, 222, 128, 0.4)',

    background: '#07130E',           // Deep Obsidian Green
    backgroundSecondary: '#0B1C15',
    backgroundGradient: ['#07130E', '#0B1C15'],

    surface: '#10251A',              // Dark Emerald Surface
    surfaceElevated: '#143322',      // Elevated Card Surface
    surfaceHighlight: '#1A3F2B',     // Active / Pressed surface
    card: '#143322',                 // Standard Card Green

    border: '#234734',               // Muted Emerald Border
    borderHighlight: '#2E6145',      // Focused Border
    borderActive: '#4ADE80',

    // Typography
    textPrimary: '#FFFFFF',          // Pure Crisp White
    textSecondary: '#A7B8AD',        // Soft Sage Gray
    textMuted: '#6B8576',            // Muted Moss
    textAccent: '#4ADE80',           // Accent Mint
    textInverse: '#07130E',          // Dark contrast on bright buttons

    // Natural Warm Wood (for Carrom Board and Frame)
    woodDark: '#451F0D',
    woodPrimary: '#8B4513',          // Saddle Brown
    woodMedium: '#A0522D',          // Warm Sienna
    woodLight: '#CD853F',           // Peru Light Wood
    woodWarm: '#D27D2D',            // Lacquered Teak
    woodBorder: '#5C2C16',
    playingSurface: '#E6CCA0',      // Polished Maple Board Face

    // Game Pieces
    queenRed: '#DC2626',
    queenGlow: 'rgba(220, 38, 38, 0.45)',
    coinWhite: '#F8F9FA',
    coinBlack: '#18241C',

    // Gold for rewards, coins balance, and achievements (used sparingly)
    goldPrimary: '#F59E0B',
    goldBright: '#FBBF24',
    goldDark: '#B45309',
    goldGlow: 'rgba(245, 158, 11, 0.35)',
    goldBadgeBg: 'rgba(245, 158, 11, 0.15)',

    // System Status
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    danger: '#EF4444',
    dangerBg: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.15)',

    // Compatibility Tokens
    surfaceBorder: '#234734',
    goldBorder: '#B45309',
    woodGlow: 'rgba(210, 125, 45, 0.35)',

    // Overlays
    overlay: 'rgba(7, 19, 14, 0.75)',
    overlayHeavy: 'rgba(7, 19, 14, 0.92)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  typography: {
    fontSize: {
      caption: 12,
      bodySm: 14,
      body: 16,
      bodyMd: 16,
      bodyLg: 18,
      subtitle: 18,
      title: 22,
      h3: 22,
      headline: 28,
      h2: 28,
      display: 34,
      h1: 34,
    },
    lineHeight: {
      caption: 16,
      bodySm: 20,
      body: 24,
      subtitle: 26,
      title: 30,
      headline: 36,
      display: 42,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
  },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    emeraldGlow: {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
    goldGlow: {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

export type AppTheme = typeof THEME;
