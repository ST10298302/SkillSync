import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options as any);
};

export * from '@testing-library/react-native';


