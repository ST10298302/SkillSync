/**
 * Metallic UI Color Palette for SkillSync
 * Supports both light and dark modes, with gradients and semantic roles
 */

export const Colors = {
  light: {
    // Core metallic colors - Clean, modern light theme
    background: '#ffffff', // Pure white base
    backgroundSecondary: '#f8fafc', // Very light blue-gray
    backgroundTertiary: '#e2e8f0', // Soft silver
    surface: '#ffffff',
    surfaceShadow: 'inset 0 2px 8px #f1f5f9',
    border: '#e2e8f0', // Soft silver border
    borderSecondary: '#f1f5f9',
    text: '#0f172a', // Deep slate (better contrast)
    textSecondary: '#475569', // Medium slate
    textTertiary: '#64748b',
    black: '#000000', // Pure black for high contrast
    accentBlue: '#3b82f6', // Vibrant blue
    accentGold: '#f59e0b', // Rich gold
    accentEmerald: '#10b981', // Emerald
    accent: '#3b82f6', // Default accent (vibrant blue)
    error: '#ef4444',
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b',
    // Gradients
    gradient: {
      background: ['#ffffff', '#f8fafc'] as const, // Clean white to light
      primary: ['#3b82f6', '#f59e0b'] as const, // Blue to gold
      stats: ['#3b82f6', '#f59e0b'] as const, // For progress/stats
      surface: ['#ffffff', '#f8fafc'] as const,
      accent: ['#3b82f6', '#10b981'] as const,
    },
    shadow: {
      light: 'rgba(148,163,184,0.08)', // Very subtle
      medium: 'rgba(100,116,139,0.12)', // Soft shadow
      heavy: 'rgba(51,65,85,0.18)', // Defined shadow
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(148,163,184,0.08)',
    shadowMedium: 'rgba(100,116,139,0.12)',
    shadowHeavy: 'rgba(51,65,85,0.18)',
  },
  dark: {
    // Core metallic colors - Dark theme with good contrast
    background: '#0a0e1a', // Almost black background
    backgroundSecondary: '#111827', // Dark charcoal
    backgroundTertiary: '#1e293b', // Gunmetal
    surface: '#111827',
    surfaceShadow: '0 1px 12px #000000 inset',
    border: '#1e293b', // Darker border
    borderSecondary: 'rgba(255,255,255,0.05)',
    text: '#f1f5f9', // Bright text
    textSecondary: '#cbd5e1', // Light gray
    textTertiary: '#94a3b8',
    black: '#ffffff', // Pure white for dark theme (inverted black)
    accentBlue: '#60a5fa', // Bright blue
    accentGold: '#fbbf24', // Bright gold
    accentEmerald: '#34d399', // Bright emerald
    accent: '#60a5fa', // Default accent
    error: '#f87171',
    success: '#34d399',
    info: '#60a5fa',
    warning: '#fbbf24',
    // Gradients
    gradient: {
      background: ['#0a0e1a', '#1e293b'] as const, // Very dark gradient
      primary: ['#60a5fa', '#fbbf24'] as const, // Blue to gold
      stats: ['#60a5fa', '#fbbf24'] as const, // For progress/stats
      surface: ['#111827', '#1e293b'] as const,
      accent: ['#60a5fa', '#34d399'] as const,
    },
    shadow: {
      light: 'rgba(0,0,0,0.2)', // Dark shadow
      medium: 'rgba(0,0,0,0.4)', // Medium dark shadow
      heavy: 'rgba(0,0,0,0.6)', // Heavy shadow
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(0,0,0,0.2)',
    shadowMedium: 'rgba(0,0,0,0.4)',
    shadowHeavy: 'rgba(0,0,0,0.6)',
  },
  darker: {
    // Core metallic colors - Ultra dark theme with maximum contrast
    background: '#000000', // Pure black background
    backgroundSecondary: '#0a0a0a', // Near black
    backgroundTertiary: '#141414', // Very dark gray
    surface: '#0a0a0a',
    surfaceShadow: '0 1px 12px #000000 inset',
    border: '#1a1a1a', // Very dark border
    borderSecondary: 'rgba(255,255,255,0.03)',
    text: '#ffffff', // Pure white text
    textSecondary: '#e5e5e5', // Very light gray
    textTertiary: '#b0b0b0',
    black: '#ffffff', // Pure white for dark theme (inverted black)
    accentBlue: '#70b5ff', // Even brighter blue
    accentGold: '#fcd34d', // Even brighter gold
    accentEmerald: '#4ade80', // Even brighter emerald
    accent: '#70b5ff', // Default accent
    error: '#fca5a5',
    success: '#4ade80',
    info: '#70b5ff',
    warning: '#fcd34d',
    // Gradients
    gradient: {
      background: ['#000000', '#141414'] as const, // Pure black gradient
      primary: ['#70b5ff', '#fcd34d'] as const, // Bright blue to gold
      stats: ['#70b5ff', '#fcd34d'] as const, // For progress/stats
      surface: ['#0a0a0a', '#141414'] as const,
      accent: ['#70b5ff', '#4ade80'] as const,
    },
    shadow: {
      light: 'rgba(0,0,0,0.3)', // Darker shadow
      medium: 'rgba(0,0,0,0.5)', // Very dark shadow
      heavy: 'rgba(0,0,0,0.8)', // Maximum shadow
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(0,0,0,0.3)',
    shadowMedium: 'rgba(0,0,0,0.5)',
    shadowHeavy: 'rgba(0,0,0,0.8)',
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
