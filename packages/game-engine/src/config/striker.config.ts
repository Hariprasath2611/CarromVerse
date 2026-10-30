export interface LegacyStrikerVisualConfig {
  radius: number;
  primaryColor: number;
  rimColor: number;
  coreColor: number;
  accentColor: number;
  glowColor: number;
  maxForce: number;
  minForce: number;
}

export const STRIKER_CONFIG: LegacyStrikerVisualConfig = {
  radius: 38,
  primaryColor: 0x1f2937,       // Dark polished onyx acrylic
  rimColor: 0xd4af37,           // Brilliant gold edge
  coreColor: 0x3b82f6,          // Sapphire crystal center jewel
  accentColor: 0xffd700,        // Gold sunburst pattern
  glowColor: 0xffd700,          // Aiming glow aura
  maxForce: 0.18,               // Maximum impulse scalar for Matter body
  minForce: 0.015,
};

