/* eslint-env jest */
import '@testing-library/jest-native/extend-expect';

// RN Gesture Handler testing utilities
import 'react-native-gesture-handler/jestSetup';

// Ensure browser-like globals and Expo env defaults for context checks
// @ts-ignore
if (typeof global.window === 'undefined') {
  // @ts-ignore
  global.window = {};
}
// Ensure process/env exist and set harmless defaults using globalThis
const g = globalThis;
g.process = g.process || {};
g.process.env = g.process.env || {};
g.process.env.EXPO_PUBLIC_SUPABASE_URL = g.process.env.EXPO_PUBLIC_SUPABASE_URL || 'dummy';
g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = g.process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

// Silence React Native warnings in test output (RN 0.79 may not expose this helper path)
try {
  // Older RN versions
  require.resolve('react-native/Libraries/Animated/NativeAnimatedHelper');
  // If resolvable, mock it
   
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch {}

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock @expo/vector-icons (avoids NativeModule from expo-modules-core in Node)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Mock expo-secure-store to avoid native module access in tests
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));


