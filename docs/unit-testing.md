# Unit Testing Guide

This document explains how unit tests are set up in SkillSync, how to run them, and what tests currently exist.

## Overview

- Test runner: Jest
- React Native testing: @testing-library/react-native
- Transform: babel-jest with babel-preset-expo
- Preset: react-native
- Helpers: `test-utils.tsx` wraps components with providers

## Installation

Install dev dependencies (already added in this repo):

```bash
npm i -D jest @types/jest @testing-library/react-native react-test-renderer@19.0.0
npm i -D babel-jest @testing-library/jest-native
```

Notes:
- `react-test-renderer` is pinned to 19.0.0 to match React 19.0.0.

## Configuration

### jest.config.js

```js
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo($|-.+)|@expo/.*|expo-modules-core|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens)/)'
  ],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};
```

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### jest.setup.js (key mocks)

- Gesture handler setup
- AsyncStorage mock
- Reanimated mock
- `@expo/vector-icons` mock
- `expo-linear-gradient`, `expo-haptics`, `expo-router` lightweight mocks

### Asset stubs

`__mocks__/fileMock.js`
```js
module.exports = 'test-file-stub';
```

### Test utilities

`test-utils.tsx` exposes `renderWithProviders` to wrap components in providers (e.g., `ThemeProvider`):
```ts
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

export const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);
```

## Running tests

- All tests:
```bash
npx jest
```
- Single file:
```bash
npx jest __tests__/components/SkillCard.test.tsx
```
- Watch mode:
```bash
npx jest --watch
```
- Coverage:
```bash
npx jest --coverage
```
- Clear cache:
```bash
npx jest --clearCache
```

## Current tests

- `__tests__/utils/streakCalculator.test.ts`
  - Validates streak calculation utilities.
- `__tests__/components/SkillCard.test.tsx`
  - Renders a `SkillCard`, asserts content, and interaction handlers (press/edit).
  - Uses `renderWithProviders` to satisfy `ThemeContext` requirements.

## Troubleshooting

- ERESOLVE peer dependency errors:
  - Use `react-test-renderer@19.0.0` to match React 19.0.0.
- "Cannot use import statement outside a module":
  - Ensure `babel-jest` is configured and `transformIgnorePatterns` includes `expo-modules-core`, `expo`, and RN packages.
- Missing `NativeAnimatedHelper`:
  - Guarded mock is in `jest.setup.js`; ensure setup file runs via `setupFilesAfterEnv`.
- "useTheme must be used within ThemeProvider":
  - Wrap renders with `renderWithProviders` from `test-utils.tsx`.

## Conventions

- Place test files under `__tests__` mirroring source structure.
- Use `renderWithProviders` for components requiring context.
- Add new mocks only when a module causes failures; prefer lightweight stubs.
