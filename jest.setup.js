import '@testing-library/jest-native/extend-expect';

// RN Gesture Handler testing utilities
import 'react-native-gesture-handler/jestSetup';

// Silence React Native warnings in test output (RN 0.79 may not expose this helper path)
try {
  // Older RN versions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require.resolve('react-native/Libraries/Animated/NativeAnimatedHelper');
  // If resolvable, mock it
  // eslint-disable-next-line no-undef
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


