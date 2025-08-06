/**
 * Enhanced color system for SkillSync app with modern design principles
 * Includes semantic colors, gradients, and proper light/dark mode support
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    background: '#fff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f1f3f4',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e1e5e9',
    borderSecondary: '#f1f3f4',
    success: '#34c759',
    warning: '#ff9500',
    error: '#ff3b30',
    info: '#007AFF',
    primary: '#0a7ea4',
    primaryLight: '#4da6d1',
    primaryDark: '#075a7a',
    secondary: '#6c757d',
    accent: '#ff6b35',
    gradient: {
      primary: ['#0a7ea4', '#4da6d1'] as const,
      secondary: ['#ff6b35', '#ff8a65'] as const,
      success: ['#34c759', '#4caf50'] as const,
      background: ['#ffffff', '#f8f9fa'] as const,
    },
    shadow: {
      light: '#000000',
      medium: '#000000',
      heavy: '#000000',
    },
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',
    background: '#151718',
    backgroundSecondary: '#1c1e1f',
    backgroundTertiary: '#2c2e2f',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2c2e2f',
    borderSecondary: '#3c3e3f',
    success: '#30d158',
    warning: '#ff9f0a',
    error: '#ff453a',
    info: '#0a84ff',
    primary: '#4da6d1',
    primaryLight: '#6bb8e0',
    primaryDark: '#0a7ea4',
    secondary: '#8e8e93',
    accent: '#ff6b35',
    gradient: {
      primary: ['#4da6d1', '#0a7ea4'] as const,
      secondary: ['#ff8a65', '#ff6b35'] as const,
      success: ['#30d158', '#34c759'] as const,
      background: ['#151718', '#1c1e1f'] as const,
    },
    shadow: {
      light: '#000000',
      medium: '#000000',
      heavy: '#000000',
    },
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
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
