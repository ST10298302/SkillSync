import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'darker' | 'auto';

interface ThemeContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark' | 'darker';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_KEY = 'userThemePreference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'darker'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  // Load theme preference from storage
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'darker' || stored === 'auto') {
        setThemeState(stored);
      }
    });
  }, []);

  // Listen to device color scheme changes
  useEffect(() => {
    const update = () => {
      if (theme === 'auto') {
        setResolvedTheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };
    update();
    const sub = Appearance.addChangeListener(update);
    return () => sub.remove();
  }, [theme]);

  // Persist theme preference
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};