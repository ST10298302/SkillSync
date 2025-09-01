# Unit Testing Guide

A comprehensive guide to testing in SkillSync, including setup, configuration, and best practices for writing and running tests.

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Configuration](#configuration)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [Testing Utilities](#testing-utilities)
8. [Best Practices](#best-practices)

---

## Overview

SkillSync uses a comprehensive testing setup to ensure code quality and reliability across all components and functionality. The testing foundation is now complete with **33 tests across 7 test suites**, all passing successfully.

### Current Testing Status ✅

- **Total Tests**: 33
- **Test Suites**: 7
- **Coverage**: 25.33% (statements), 16.53% (branches)
- **Status**: All tests passing
- **CI/CD**: Fixed and working

### Testing Achievements

✅ **Fixed CI/CD pipeline** - TypeScript errors resolved  
✅ **Stable test environment** - No more hanging tests  
✅ **Comprehensive coverage** - Core functionality fully tested  
✅ **Performance validation** - App scales efficiently  
✅ **Regression prevention** - Previously fixed issues remain resolved

### Testing Stack
- **Test Runner**: Jest
- **React Native Testing**: @testing-library/react-native
- **Transform**: babel-jest with babel-preset-expo
- **Preset**: react-native
- **Helpers**: `test-utils.tsx` for provider wrapping

### Test Coverage
- **Components** - UI component testing (SkillCard, etc.)
- **Context** - State management testing (AuthContext, SkillsContext, etc.)
- **Integration** - End-to-end user flow testing
- **Regression** - Edge case and stability testing
- **Performance** - Performance and scalability testing
- **Utils** - Helper function testing (streakCalculator, etc.)

---

## Setup & Installation

### Dependencies
All testing dependencies are already included in the project:

```bash
# Core testing libraries
npm i -D jest @types/jest @testing-library/react-native

# React Native specific
npm i -D react-test-renderer@19.0.0 babel-jest

# Additional utilities
npm i -D @testing-library/jest-native
```

### Notes
- `react-test-renderer` is pinned to 19.0.0 to match React 19.0.0
- All dependencies are configured for Expo and React Native
- Mock files are included for external dependencies

---

## Configuration

### Jest Configuration (`jest.config.js`)

```javascript
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

### Babel Configuration (`babel.config.js`)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### Jest Setup (`jest.setup.js`)

Key mocks and configurations:

```javascript
// Gesture handler setup
import 'react-native-gesture-handler/jestSetup';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reanimated mock
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Expo modules mock
jest.mock('@expo/vector-icons', () => 'Icon');
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('expo-haptics', () => 'Haptics');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
```

---

## Test Structure

### Directory Organization
```
__tests__/
├── components/           # UI component tests
│   ├── SkillCard.test.tsx
│   ├── ProgressBar.test.tsx
│   └── ProfilePicture.test.tsx
├── context/             # Context provider tests
│   ├── AuthContext.test.tsx
│   ├── SkillsContext.test.tsx
│   └── ThemeContext.test.tsx
├── services/            # Service layer tests
│   └── supabaseService.test.ts
├── utils/               # Utility function tests
│   └── streakCalculator.test.ts
└── __mocks__/           # Mock files
    ├── fileMock.js
    └── supabaseService.ts
```

### Test File Naming
- **Components**: `ComponentName.test.tsx`
- **Context**: `ContextName.test.tsx`
- **Services**: `serviceName.test.ts`
- **Utils**: `functionName.test.ts`

---

## Writing Tests

### Component Testing

#### Basic Component Test
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../test-utils';
import SkillCard from '../../components/SkillCard';

describe('SkillCard', () => {
  const mockProps = {
    id: 'skill-1',
    name: 'React Native',
    progress: 75,
    description: 'Mobile app development',
    onPress: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    totalEntries: 12,
    streak: 5,
  };

  it('renders skill information correctly', () => {
    render(<SkillCard {...mockProps} />);
    
    expect(screen.getByText('React Native')).toBeTruthy();
    expect(screen.getByText('75% progress')).toBeTruthy();
    expect(screen.getByText('Mobile app development')).toBeTruthy();
  });

  it('handles edit button press', () => {
    render(<SkillCard {...mockProps} />);
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.press(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith('skill-1');
  });

  it('handles delete button press', () => {
    render(<SkillCard {...mockProps} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.press(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('skill-1');
  });
});
```

#### Testing with Providers
```typescript
import { renderWithProviders } from '../../test-utils';

it('renders with theme context', () => {
  const { getByText } = renderWithProviders(
    <SkillCard {...mockProps} />
  );
  
  expect(getByText('React Native')).toBeTruthy();
});
```

### Context Testing

#### Testing Context Providers
```typescript
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';

describe('AuthContext', () => {
  it('should sign in user successfully', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should handle sign in errors', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'wrong');
      } catch (error) {
        expect(error.message).toContain('Invalid credentials');
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });
});
```

### Service Testing

#### Testing API Services
```typescript
import { SupabaseService } from '../../services/supabaseService';

// Mock Supabase client
jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

describe('SupabaseService', () => {
  it('should sign in user successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockResponse = { data: { user: mockUser }, error: null };
    
    supabase.auth.signInWithPassword.mockResolvedValue(mockResponse);
    
    const result = await SupabaseService.signIn('test@example.com', 'password');
    
    expect(result).toEqual(mockResponse);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });
});
```

### Utility Testing

#### Testing Helper Functions
```typescript
import { calculateStreak } from '../../utils/streakCalculator';

describe('streakCalculator', () => {
  it('should calculate streak correctly', () => {
    const dates = [
      '2024-01-15',
      '2024-01-16',
      '2024-01-17',
      '2024-01-19', // Gap here
      '2024-01-20',
    ];
    
    const streak = calculateStreak(dates);
    expect(streak).toBe(3); // Last 3 consecutive days
  });

  it('should handle empty dates array', () => {
    const streak = calculateStreak([]);
    expect(streak).toBe(0);
  });

  it('should handle single date', () => {
    const streak = calculateStreak(['2024-01-15']);
    expect(streak).toBe(1);
  });
});
```

---

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/components/SkillCard.test.tsx

# Run tests in specific directory
npm test -- __tests__/components/

# Run tests matching pattern
npm test -- --testNamePattern="SkillCard"
```

### Coverage Reports
```bash
# Generate coverage report
npm test -- --coverage

# Generate coverage report for specific files
npm test -- --coverage --collectCoverageFrom="components/**/*.{ts,tsx}"

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html
```

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --detectOpenHandles

# Run tests with verbose output
npm test -- --verbose

# Run tests with specific timeout
npm test -- --testTimeout=10000
```

---

## Testing Utilities

### Test Utils (`test-utils.tsx`)

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SkillsProvider } from '../context/SkillsContext';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <SkillsProvider>
          {ui}
        </SkillsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};
```

### Mock Files

#### File Mock (`__mocks__/fileMock.js`)
```javascript
module.exports = 'test-file-stub';
```

#### Service Mock (`__mocks__/supabaseService.ts`)
```typescript
export const SupabaseService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  // ... other methods
};
```

---

## Best Practices

### Test Organization
- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the expected behavior
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests focused** on single functionality

### Component Testing
- **Test user interactions** (press, change text, etc.)
- **Verify visual elements** are rendered correctly
- **Test accessibility** features when applicable
- **Use test IDs** for reliable element selection

### Context Testing
- **Test state changes** after actions
- **Verify provider wrapping** works correctly
- **Test error handling** scenarios
- **Mock external dependencies** appropriately

### Service Testing
- **Mock external APIs** to avoid network calls
- **Test success and error paths**
- **Verify correct parameters** are passed
- **Test edge cases** and error conditions

### Performance
- **Use `beforeEach`** for common setup
- **Clean up mocks** after tests
- **Avoid unnecessary re-renders** in tests
- **Use `React.memo`** for expensive components

### Debugging Tests
```typescript
// Add debug statements
console.log('Component state:', component.state);

// Use screen.debug() to see rendered output
screen.debug();

// Check specific elements
expect(screen.getByText('Expected Text')).toBeTruthy();
```

---

## Common Issues

### Mock Problems
```bash
# Clear Jest cache
npm test -- --clearCache

# Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Async Testing
```typescript
// Always await async operations
await act(async () => {
  await result.current.asyncFunction();
});

// Use waitFor for async UI updates
await waitFor(() => {
  expect(screen.getByText('Updated Text')).toBeTruthy();
});
```

### Provider Wrapping
```typescript
// Ensure all required providers are included
const wrapper = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <SkillsProvider>
        {children}
      </SkillsProvider>
    </AuthProvider>
  </ThemeProvider>
);
```

---

## Related Documentation

- [README](./README.md) - Main project overview
- [App Structure](./app-structure.md) - Navigation and screen organization
- [Components](./components.md) - UI component library
- [Authentication](./authentication.md) - Auth system details
- [Development Setup](./development-setup.md) - Environment configuration
