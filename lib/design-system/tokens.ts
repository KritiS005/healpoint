export const designTokens = {
  colors: {
    primary: "Deep Sapphire Blue",
    secondary: "Medical Cyan",
    accent: "Soft Emerald",
    success: "Calm Green",
    warning: "Amber",
    danger: "Soft Crimson",
    lightBackground: "Warm Off-white",
    darkBackground: "Deep Graphite",
  },
  spacing: {
    unit: 8,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
  },
  radius: {
    default: 24,
    compact: 16,
    pill: 999,
  },
  motion: {
    maxPageTransitionMs: 400,
    reducedMotion: "All decorative motion is disabled through CSS and component guards.",
  },
} as const;

export type DesignTokens = typeof designTokens;
