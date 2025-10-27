/**
 * Metallic UI Color Palette for SkillSync
 * Supports both light and dark modes, with gradients and semantic roles
 */

export const Colors = {
  light: {
    // Core metallic colors - Futuristic clean white theme
    background: '#ffffff', // Pure white base
    backgroundSecondary: '#fafafa', // Very subtle off-white
    backgroundTertiary: '#f0f0f0', // Light metallic gray
    surface: '#ffffff',
    surfaceShadow: 'inset 0 2px 8px #f5f5f5',
    border: '#e0e0e0', // Clean metallic border
    borderSecondary: '#f0f0f0',
    text: '#000000', // Pure black (maximum contrast)
    textSecondary: '#4a4a4a', // Medium gray
    textTertiary: '#7a7a7a',
    black: '#000000', // Pure black for high contrast
    accentBlue: '#0066ff', // Futuristic blue
    accentGold: '#ff9500', // Modern orange-gold
    accentEmerald: '#00c853', // Vibrant green
    accent: '#0066ff', // Default accent (futuristic blue)
    error: '#ff3b30',
    success: '#00c853',
    info: '#0066ff',
    warning: '#ff9500',
    // Gradients
    gradient: {
      background: ['#f5f5f7', '#fafafa'] as const, // Metallic gray gradient
      primary: ['#3b82f6', '#f59e0b'] as const, // Blue to gold
      stats: ['#3b82f6', '#f59e0b'] as const, // For progress/stats
      surface: ['#fafafa', '#f5f5f7'] as const,
      accent: ['#3b82f6', '#10b981'] as const,
    },
    shadow: {
      light: 'rgba(0,0,0,0.04)', // Very subtle
      medium: 'rgba(0,0,0,0.08)', // Soft shadow
      heavy: 'rgba(0,0,0,0.15)', // Defined shadow
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(0,0,0,0.04)',
    shadowMedium: 'rgba(0,0,0,0.08)',
    shadowHeavy: 'rgba(0,0,0,0.15)',
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
      primary: ['#1d4ed8', '#f59e0b'] as const, // Darker blue to rich gold
      stats: ['#1d4ed8', '#f59e0b'] as const, // For progress/stats (darker blue to gold)
      surface: ['#111827', '#1e293b'] as const,
      accent: ['#1d4ed8', '#10b981'] as const, // Darker blue accent gradient
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
