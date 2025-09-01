import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SkillsProvider } from './context/SkillsContext';
import { ThemeProvider } from './context/ThemeContext';

// Mock browser environment for tests
beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {},
    writable: true,
  });
  
  const g: any = globalThis as any;
  g.process = g.process || {};
  g.process.env = g.process.env || {};
  g.process.env.EXPO_PUBLIC_SUPABASE_URL = 'dummy';
  g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'dummy';
  g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBZaJmEhGIVZEev8LAWlYd5HrKEvHu2eg0';
});

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <SkillsProvider>
          <LanguageProvider>
            {ui}
          </LanguageProvider>
        </SkillsProvider>
      </AuthProvider>
    </ThemeProvider>,
    options as any
  );
};

export * from '@testing-library/react-native';


