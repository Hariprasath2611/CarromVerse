/**
 * CarromVerse "Emerald Club Night" Design System
 * Theme: EMERALD CLUB NIGHT
 * Specifications:
 * - Forest Ground: #07261C -> #0F5A3E
 * - Panels: #0E4A33 with 2px #1B7050 inner edge
 * - Neon Emerald: #2BD67B (Primary actions) + #169352 (6px bottom tactile edge)
 * - Brass: #E9B949 (Rewards, secondary actions) + #A57E24 (6px bottom tactile edge)
 * - Cream: #F5ECD2 (Text, board face)
 * - Muted Mint: #9FD8B8 (Metadata, subtitles)
 * - Coal: #0B0F0D (Deep shadows, black coins, pockets)
 * - Queen Red: #E23B5A (Queen coin, urgency alerts)
 * - Wood Frame: #7A431C with brass #E9B949 inner line
 */

export const THEME = {
  colors: {
    // Primary Emerald Club Palette
    primary: '#2BD67B',              // Neon Emerald
    primaryHover: '#23B969',
    primaryDark: '#169352',           // 6px bottom edge
    primaryGlow: 'rgba(43, 214, 123, 0.4)',

    secondary: '#0E4A33',            // Panel Felt Green
    secondaryHover: '#0A3B29',

    accent: '#2BD67B',               // Neon Emerald Accent
    accentGlow: 'rgba(43, 214, 123, 0.45)',

    // Backgrounds
    background: '#07261C',           // Forest Ground Dark
    backgroundSecondary: '#0F5A3E',  // Forest Ground Light
    backgroundGradient: ['#0F5A3E', '#07261C'],

    // Panels & Surfaces
    surface: '#0E4A33',              // Felt Panel Green
    surfaceElevated: '#11573C',      // Elevated Active Panel
    surfaceHighlight: '#166E4C',     // Hover/Pressed
    card: '#0E4A33',                 // Felt Panel Card

    border: '#1B7050',               // 2px Panel Inner Edge
    borderHighlight: '#2BD67B',      // Active Neon Emerald Border
    borderActive: '#2BD67B',

    // Typography
    textPrimary: '#F5ECD2',          // Tournament Cream
    textSecondary: '#9FD8B8',        // Muted Mint
    textMuted: '#7AA991',            // Deeper Mint
    textAccent: '#2BD67B',           // Neon Emerald
    textInverse: '#07261C',          // Dark contrast on emerald buttons

    // Brass & Rewards
    brass: '#E9B949',                // Brass Gold
    brassDark: '#A57E24',            // 6px bottom edge for brass buttons
    goldPrimary: '#E9B949',
    goldBright: '#F7D070',
    goldDark: '#A57E24',
    goldGlow: 'rgba(233, 185, 73, 0.4)',
    goldBadgeBg: 'rgba(233, 185, 73, 0.18)',

    // Carrom Board Art & Frame
    woodDark: '#4D270E',
    woodPrimary: '#7A431C',          // Rosewood Frame
    woodMedium: '#8C4D20',
    woodLight: '#A35D2A',
    woodWarm: '#7A431C',
    woodBorder: '#5E3113',
    playingSurface: '#F5ECD2',      // Tournament Cream Playing Surface
    frameBrassLine: '#E9B949',      // Brass inner line

    // Game Pieces
    queenRed: '#E23B5A',             // Queen Ruby Red
    queenDark: '#981C33',
    queenGlow: 'rgba(226, 59, 90, 0.45)',
    coinWhite: '#F5ECD2',            // Cream coin
    coinBlack: '#0B0F0D',            // Coal coin
    strikerNeon: '#2BD67B',          // Neon Emerald Striker

    // System Status
    coal: '#0B0F0D',
    success: '#2BD67B',
    successBg: 'rgba(43, 214, 123, 0.18)',
    error: '#E23B5A',
    errorBg: 'rgba(226, 59, 90, 0.18)',
    danger: '#E23B5A',
    dangerBg: 'rgba(226, 59, 90, 0.18)',
    warning: '#E9B949',
    warningBg: 'rgba(233, 185, 73, 0.18)',
    info: '#38BDF8',
    infoBg: 'rgba(56, 189, 248, 0.18)',

    // Compatibility Tokens
    surfaceBorder: '#1B7050',
    goldBorder: '#A57E24',
    woodGlow: 'rgba(122, 67, 28, 0.35)',

    // Overlays
    overlay: 'rgba(7, 38, 28, 0.78)',
    overlayHeavy: 'rgba(7, 38, 28, 0.94)',
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
    md: 12,
    lg: 16,     // 16px standard for chunky tactile buttons
    xl: 20,     // 20px for felt-green cards
    xxl: 28,
    full: 9999,
  },

  // Tactile 3D Button Shadows (6px default, 2px pressed)
  tactile: {
    emerald: {
      backgroundColor: '#2BD67B',
      borderBottomColor: '#169352',
      borderBottomWidth: 6,
      color: '#07261C',
    },
    emeraldPressed: {
      backgroundColor: '#2BD67B',
      borderBottomColor: '#169352',
      borderBottomWidth: 2,
      transform: [{ translateY: 4 }],
      color: '#07261C',
    },
    brass: {
      backgroundColor: '#E9B949',
      borderBottomColor: '#A57E24',
      borderBottomWidth: 6,
      color: '#261B04',
    },
    brassPressed: {
      backgroundColor: '#E9B949',
      borderBottomColor: '#A57E24',
      borderBottomWidth: 2,
      transform: [{ translateY: 4 }],
      color: '#261B04',
    },
    panel: {
      backgroundColor: '#0E4A33',
      borderColor: '#1B7050',
      borderWidth: 2,
      borderBottomColor: '#083021',
      borderBottomWidth: 6,
      color: '#F5ECD2',
    },
    panelPressed: {
      backgroundColor: '#0E4A33',
      borderColor: '#1B7050',
      borderWidth: 2,
      borderBottomColor: '#083021',
      borderBottomWidth: 2,
      transform: [{ translateY: 4 }],
      color: '#F5ECD2',
    },
  },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.55,
      shadowRadius: 16,
      elevation: 8,
    },
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 6,
    },
    glowEmerald: {
      shadowColor: '#2BD67B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.65,
      shadowRadius: 14,
      elevation: 10,
    },
    glowBrass: {
      shadowColor: '#E9B949',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 14,
      elevation: 10,
    },
  },
} as const;

export type ThemeType = typeof THEME;
