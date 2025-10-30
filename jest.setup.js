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
g.process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBZaJmEhGIVZEev8LAWlYd5HrKEvHu2eg0'; // NOSONAR - test stub, not a real key

// Also set it on the global process object
if (typeof process !== 'undefined') {
  process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBZaJmEhGIVZEev8LAWlYd5HrKEvHu2eg0'; // NOSONAR - test stub, not a real key
}

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

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/document/directory/',
  cacheDirectory: '/mock/cache/directory/',
  bundleDirectory: '/mock/bundle/directory/',
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

// Mock SupabaseService with a simple mock
jest.mock('./services/supabaseService', () => ({
  SupabaseService: {
    signUp: jest.fn(() => Promise.resolve({ user: { id: 'test-user', email: 'test@example.com' } })),
    signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-user', email: 'test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    getCurrentUser: jest.fn(() => Promise.resolve({ id: 'test-user', email: 'test@example.com' })),
    getSkills: jest.fn(() => Promise.resolve([])),
    createSkill: jest.fn((skill) => Promise.resolve({ id: 'test-skill', ...skill })),
    updateSkill: jest.fn(() => Promise.resolve({ id: 'test-skill', name: 'Updated Skill' })),
    deleteSkill: jest.fn(() => Promise.resolve()),
    createSkillEntry: jest.fn(() => Promise.resolve({ id: 'test-entry' })),
    getProgressUpdates: jest.fn(() => Promise.resolve([])),
    createProgressUpdate: jest.fn(() => Promise.resolve({ id: 'test-progress' })),
  },
}));

// Mock GoogleTranslateAPI
jest.mock('./services/googleTranslateAPI', () => ({
  GoogleTranslateAPI: {
    initialize: jest.fn(),
    translateText: jest.fn(async (text: string) => text),
    translateBatch: jest.fn(async (texts: string[]) => texts),
  },
}));

// Reduce noisy warnings/errors in CI output that don't affect assertions
const originalWarn = console.warn;
const originalError = console.error;

const suppressPatterns = [
  /react-native-reanimated\/plugin.*react-native-worklets\/plugin/i,
  /not wrapped in act\(\)/i,
  /"useNativeDriver" was not specified/i,
];

console.warn = (...args) => {
  const message = args?.[0]?.toString?.() || '';
  if (suppressPatterns.some((p) => p.test(message))) return;
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args?.[0]?.toString?.() || '';
  if (suppressPatterns.some((p) => p.test(message))) return;
  originalError.apply(console, args);
};


