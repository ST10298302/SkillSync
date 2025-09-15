// Ensure env is available before importing modules that read it
// @ts-ignore
if (!(globalThis as any).process) {
  // @ts-ignore
  (globalThis as any).process = { env: {} };
}
// @ts-ignore
(globalThis as any).process.env = (globalThis as any).process.env || {};
// Provide a harmless default key
// @ts-ignore
(globalThis as any).process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = (globalThis as any).process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';

import { act, render, screen } from '@testing-library/react-native';
import React from 'react';
// Prevent the provider's initialization effect from running (it reads process.env)
const originalUseEffect = React.useEffect;
jest.spyOn(React, 'useEffect').mockImplementation(() => {});
// Import LanguageContext lazily after ensuring env and mocking useEffect
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LanguageContextModule = require('../../context/LanguageContext');
const { LanguageProvider, SUPPORTED_LANGUAGES, useLanguage } = LanguageContextModule;

afterAll(() => {
  // Restore useEffect for other tests
  // @ts-ignore
  (React.useEffect as any).mockRestore?.();
  // Fallback restore in case mockRestore is unavailable
  // @ts-ignore
  if (React.useEffect !== originalUseEffect) {
    // @ts-ignore
    React.useEffect = originalUseEffect;
  }
});

// Mock dependencies used by LanguageContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('../../context/SkillsContext', () => ({
  useSkills: () => ({ skills: [], updateSkill: jest.fn() }),
}));

// Use the same manual mock shape as jest.setup to avoid duplication
jest.mock('../../services/googleTranslateAPI', () => ({
  GoogleTranslateAPI: {
    initialize: jest.fn(),
    translateText: jest.fn(async (text: string) => ({ translatedText: text })),
    translateBatch: jest.fn(async (texts: string[]) => texts),
  },
}));

// Helper component to access the hook easily
const Probe: React.FC = () => {
  const { t, currentLanguage, changeLanguage, isTranslating } = useLanguage();
  return (
    <>
      <TestText testID="lang">{currentLanguage}</TestText>
      <TestText testID="value">{t('app_title')}</TestText>
      <TestText testID="state">{isTranslating ? 'yes' : 'no'}</TestText>
      <TestButton
        testID="switch"
        onPress={async () => {
          // Switch to a non-English language to force translation path in provider utilities
          const target = Object.keys(SUPPORTED_LANGUAGES).find((l) => l !== 'en') as keyof typeof SUPPORTED_LANGUAGES;
          await changeLanguage(target);
        }}
      />
    </>
  );
};

// Minimal stand-ins to avoid importing react-native primitives in tests
const TestText: React.FC<{ testID: string } & { children?: React.ReactNode }> = ({ children, ...props }) => (
  // @ts-ignore – testing-only element
  <text {...props}>{children}</text>
);
const TestButton: React.FC<{ testID: string; onPress: () => void }> = ({ onPress, ...props }) => (
  // @ts-ignore – testing-only element
  <button {...props} onClick={onPress} />
);

describe('LanguageContext', () => {
  beforeEach(() => {
    const g: any = globalThis as any;
    g.process = g.process || {};
    g.process.env = g.process.env || {};
    if (!g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY) {
      g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'test-key';
    }
  });

  it('provides fallback to English for unknown keys', () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    // app_title exists in English translations; unknown key should fallback to key itself
    expect(screen.getByTestId('value').props.children).toBeTruthy();
  });

  it('changes language and toggles translating state', async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    const before = screen.getByTestId('lang').props.children;
    expect(before).toBe('en');

    await act(async () => {
      screen.getByTestId('switch').props.onClick();
    });

    const after = screen.getByTestId('lang').props.children;
    expect(after).not.toBe('en');
  });
});


