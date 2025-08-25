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
      '^expo/virtual/.*$': '<rootDir>/__mocks__/empty.js',
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