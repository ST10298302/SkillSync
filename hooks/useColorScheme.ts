import { useTheme } from '../context/ThemeContext';

export function useColorScheme() {
  // Always call useTheme to avoid conditional hook calls
  const { resolvedTheme } = useTheme();
  return resolvedTheme || 'light';
}
