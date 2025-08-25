import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SkillsProvider } from './context/SkillsContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

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


