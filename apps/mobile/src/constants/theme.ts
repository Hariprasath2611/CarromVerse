/**
 * CarromVerse Premium Dark Theme Design System
 * Aesthetic: Regal Dark Woods, Polished Ivory & Royal Gold Highlights
 */

export const THEME = {
  colors: {
    // Backgrounds
    background: '#0D0A08',        // Obsidian Dark Wood
    backgroundSecondary: '#16110E',
    surface: '#201814',           // Polished Rosewood surface
    surfaceElevated: '#2A1F1A',   // Elevated card container
    surfaceHighlight: '#3B2C24',  // Active/pressed surface
    surfaceBorder: '#48352A',     // Subtle dark wood border

    // Wooden Accents
    woodDark: '#3D2314',
    woodPrimary: '#8B4513',       // Saddle Wood
    woodMedium: '#A0522D',       // Sienna
    woodLight: '#CD853F',        // Peru Wood
    woodGlow: '#DEB887',         // Burlywood highlight

    // Royal Gold Highlights
    goldPrimary: '#D4AF37',      // Metallic Gold
    goldBright: '#FFD700',       // Vivid Imperial Gold
    goldLight: '#F5E086',        // Soft Gold Tint
    goldDark: '#8C7322',         // Antique Bronze Gold
    goldBorder: 'rgba(212, 175, 55, 0.35)',

    // Typography
    textPrimary: '#FFF9EC',      // Warm Ivory
    textSecondary: '#C8BEB2',    // Polished Bone
    textMuted: '#7D7166',        // Ash Muted
    textGold: '#FFD700',
    textInverse: '#0D0A08',

    // Game Elements
    queenRed: '#C0292B',
    queenGlow: 'rgba(192, 41, 43, 0.4)',
    coinWhite: '#F8F6F0',
    coinBlack: '#1C1512',

    // Feedback & System
    success: '#27AE60',
    successBg: 'rgba(39, 174, 96, 0.15)',
    error: '#E74C3C',
    errorBg: 'rgba(231, 76, 60, 0.15)',
    warning: '#F39C12',
    warningBg: 'rgba(243, 156, 18, 0.15)',
    info: '#3498DB',

    // Overlays
    overlay: 'rgba(13, 10, 8, 0.75)',
    overlayHeavy: 'rgba(13, 10, 8, 0.92)',
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
      subtitle: 18,
      title: 22,
      headline: 28,
      display: 34,
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
    goldGlow: {
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

export type AppTheme = typeof THEME;

