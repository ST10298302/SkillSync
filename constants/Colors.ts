/**
 * Education-Focused Color Palette for SkillSync
 * Warm, inviting colors optimized for learning and tutoring environments
 */

export const Colors = {
  light: {
    // Core educational colors - Warm, inviting tones with metallic feel
    background: '#fafbfc', // Very soft warm background
    backgroundSecondary: '#f8f9fa', // Metallic silver-gray for cards
    backgroundTertiary: '#eef2f6', // Slightly darker metallic tone
    surface: '#ffffff',
    surfaceShadow: 'inset 0 2px 8px #f1f3f5',
    border: '#e2e8f0', // Metallic border with slight blue tint
    borderSecondary: '#e8ecf0',
    text: '#1a1d29', // Rich soft black
    textSecondary: '#4a5568', // Warm medium gray
    textTertiary: '#718096',
    black: '#1a1d29',
    accentBlue: '#4a90e2', // Softer professional blue
    accentGold: '#f6ad55', // Warmer, softer amber
    accentEmerald: '#48bb78', // Softer educational green
    accent: '#4a90e2', // Default accent (softer blue)
    error: '#fc8181', // Softer red
    success: '#48bb78',
    info: '#4a90e2',
    warning: '#f6ad55',
    // Gradients - Warm and educational
    gradient: {
      background: ['#3b82f6', '#f59e0b'] as const, // Blue to amber gradient (your original favorite!)
      primary: ['#3b82f6', '#f59e0b'] as const, // Professional blue to amber
      stats: ['#3b82f6', '#f59e0b'] as const, // For progress/stats
      surface: ['#fafbfc', '#ffffff'] as const, // Subtle background to white
      accent: ['#4facfe', '#00f2fe'] as const, // Cyan accent
    },
    shadow: {
      light: 'rgba(0,0,0,0.03)', // Softer shadows
      medium: 'rgba(0,0,0,0.06)',
      heavy: 'rgba(0,0,0,0.12)',
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(0,0,0,0.03)',
    shadowMedium: 'rgba(0,0,0,0.06)',
    shadowHeavy: 'rgba(0,0,0,0.12)',
  },
  dark: {
    // Core educational dark colors - Comfortable dark theme
    background: '#1a1d24', // Warm dark gray (was almost black)
    backgroundSecondary: '#232832', // Medium dark gray for cards (was #111827)
    backgroundTertiary: '#2d333f', // Lighter dark gray
    surface: '#232832',
    surfaceShadow: '0 1px 12px #000000 inset',
    border: '#373e4d', // Visible border (was #1e293b)
    borderSecondary: 'rgba(255,255,255,0.08)',
    text: '#f1f5f9', // Bright text
    textSecondary: '#cbd5e1', // Light gray
    textTertiary: '#94a3b8',
    black: '#f1f5f9',
    accentBlue: '#60a5fa', // Bright blue
    accentGold: '#fbbf24', // Bright amber
    accentEmerald: '#34d399', // Bright green
    accent: '#60a5fa', // Default accent
    error: '#f87171',
    success: '#34d399',
    info: '#60a5fa',
    warning: '#fbbf24',
    // Gradients - Warm dark tones
    gradient: {
      background: ['#232832', '#2d333f'] as const, // Medium to lighter dark gray
      primary: ['#1e40af', '#d97706'] as const, // Deep blue to rich amber
      stats: ['#1e40af', '#d97706'] as const, // Deep blue to amber for progress
      surface: ['#1a1d24', '#232832'] as const, // Dark to medium dark
      accent: ['#1e40af', '#059669'] as const, // Deep blue to emerald
    },
    shadow: {
      light: 'rgba(0,0,0,0.3)', // More visible in dark
      medium: 'rgba(0,0,0,0.5)',
      heavy: 'rgba(0,0,0,0.7)',
    },
    // Semantic shadow colors as strings for direct use
    shadowLight: 'rgba(0,0,0,0.3)',
    shadowMedium: 'rgba(0,0,0,0.5)',
    shadowHeavy: 'rgba(0,0,0,0.7)',
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
