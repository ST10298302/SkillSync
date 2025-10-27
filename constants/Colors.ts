/**
 * Metallic UI Color Palette for SkillSync
 * Supports both light and dark modes, with gradients and semantic roles
 */

export const Colors = {
  light: {
    // Core metallic colors
    background: '#f3f4f6', // Aluminum
    backgroundSecondary: '#ffffff', // Surface
    backgroundTertiary: '#d1d5db', // Metal Silver
    surface: '#ffffff',
    surfaceShadow: 'inset 0 2px 8px #e5e7eb',
    border: '#cbd5e1', // Soft silver
    borderSecondary: '#e5e7eb',
    text: '#1e293b', // Gunmetal text
    textSecondary: '#374151', // Gunmetal
    textTertiary: '#6b7280',
    black: '#000000', // Pure black for high contrast
    accentBlue: '#60a5fa', // Metallic blue
    accentGold: '#f59e42', // Gold
    accentEmerald: '#10b981', // Emerald
    accent: '#60a5fa', // Default accent
    error: '#ef4444',
    success: '#22c55e',
    info: '#60a5fa',
    warning: '#f59e42',
    // Gradients
    gradient: {
      background: ['#f3f4f6', '#d1d5db'] as const, // Light metallic gradient
      primary: ['#60a5fa', '#f59e42'] as const, // Blue to gold
      stats: ['#60a5fa', '#f59e42'] as const, // For progress/stats
      surface: ['#ffffff', '#f3f4f6'] as const,
      accent: ['#60a5fa', '#10b981'] as const,
    },
    shadow: {
      light: 'rgba(209,213,219,0.2)', // Metal Silver
      medium: 'rgba(55,65,81,0.15)', // Gunmetal
      heavy: 'rgba(17,24,39,0.25)', // Charcoal
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(209,213,219,0.2)',
    shadowMedium: 'rgba(55,65,81,0.15)',
    shadowHeavy: 'rgba(17,24,39,0.25)',
  },
  dark: {
    // Core metallic colors
    background: '#111827', // Charcoal
    backgroundSecondary: '#1e293b', // Surface
    backgroundTertiary: '#374151', // Gunmetal
    surface: '#1e293b',
    surfaceShadow: '0 1px 12px #0f172a inset',
    border: '#374151', // Gunmetal
    borderSecondary: 'rgba(255,255,255,0.07)',
    text: '#f3f4f6', // Aluminum text
    textSecondary: '#d1d5db', // Metal Silver
    textTertiary: '#9ca3af',
    black: '#ffffff', // Pure white for dark theme (inverted black)
    accentBlue: '#60a5fa', // Metallic blue
    accentGold: '#f59e42', // Gold
    accentEmerald: '#10b981', // Emerald
    accent: '#60a5fa', // Default accent
    error: '#ef4444',
    success: '#22c55e',
    info: '#60a5fa',
    warning: '#f59e42',
    // Gradients
    gradient: {
      background: ['#111827', '#374151'] as const, // Dark metallic gradient
      primary: ['#60a5fa', '#f59e42'] as const, // Blue to gold
      stats: ['#60a5fa', '#f59e42'] as const, // For progress/stats
      surface: ['#1e293b', '#374151'] as const,
      accent: ['#60a5fa', '#10b981'] as const,
    },
    shadow: {
      light: 'rgba(60,72,100,0.15)', // Gunmetal
      medium: 'rgba(17,24,39,0.25)', // Charcoal
      heavy: 'rgba(0,0,0,0.4)',
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(60,72,100,0.15)',
    shadowMedium: 'rgba(17,24,39,0.25)',
    shadowHeavy: 'rgba(0,0,0,0.4)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 50,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};
