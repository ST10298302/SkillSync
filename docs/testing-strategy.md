# Testing Strategy for SkillSync App

This document outlines the comprehensive testing strategy for the SkillSync application, including unit, integration, regression, and performance testing approaches.

## Testing Pyramid

Our testing strategy follows the testing pyramid principle:

```
    /\
   /  \     E2E Tests (Future)
  /____\    
 /      \   Integration Tests
/________\  Unit Tests
```

- **Unit Tests**: 70% - Fast, isolated tests for individual components and functions
- **Integration Tests**: 20% - Tests that verify multiple components work together
- **Regression Tests**: 8% - Tests that prevent previously fixed bugs from reoccurring
- **Performance Tests**: 2% - Tests that verify app performance under various conditions

## Test Types

### 1. Unit Tests (`__tests__/utils/`, `__tests__/components/`, `__tests__/context/`)

**Purpose**: Test individual components, functions, and contexts in isolation.

**Coverage**:
- Component rendering and behavior
- Context state management
- Utility functions
- Service layer functions

**Example**:
```typescript
it('should render skill info correctly', () => {
  const { getByText } = renderWithProviders(<SkillCard {...baseProps} />);
  expect(getByText('React Native')).toBeTruthy();
  expect(getByText('70%\nProgress')).toBeTruthy();
});
```

### 2. Integration Tests (`__tests__/integration/`)

**Purpose**: Test how multiple components and contexts work together.

**Coverage**:
- Complete user journeys
- Context interactions
- Navigation flows
- Data flow between components

**Example**:
```typescript
it('completes full user journey: signup → add skill → update skill → delete skill → signout', async () => {
  // Test complete user workflow
  // Verify state consistency across contexts
  // Test navigation between screens
});
```

### 3. Regression Tests (`__tests__/regression/`)

**Purpose**: Prevent previously fixed bugs from reoccurring.

**Coverage**:
- Edge cases that caused crashes
- Race conditions
- Memory leak scenarios
- Error handling improvements

**Example**:
```typescript
it('should not crash when process.env is undefined (previously caused crashes)', async () => {
  // Temporarily remove process.env
  delete (globalThis as any).process;
  
  // Should not crash, should handle gracefully
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});
```

### 4. Performance Tests (`__tests__/performance/`)

**Purpose**: Ensure the app performs well under various conditions.

**Coverage**:
- Large data set handling
- Concurrent operations
- Memory usage
- Rendering performance

**Example**:
```typescript
it('should handle large numbers of skills efficiently', async () => {
  const startTime = performance.now();
  
  // Add 100 skills
  const addPromises = Array(100).fill(null).map((_, index) => 
    result.current.addSkill({...})
  );
  
  await Promise.all(addPromises);
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Should complete within performance threshold
  expect(totalTime).toBeLessThan(3000); // 3 seconds
});
```

## Running Tests

### Individual Test Types

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only regression tests
npm run test:regression

# Run only performance tests
npm run test:performance

# Run all tests
npm run test:all
```

### Test Options

```bash
# Run tests in watch mode
npm run test:unit -- --watch

# Run with verbose output
npm run test:integration -- --verbose

# Run with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

The Jest configuration is organized into projects for different test types:

```javascript
projects: [
  {
    displayName: 'unit',
    testMatch: ['<rootDir>/__tests__/utils/**/*.test.{ts,tsx}'],
    testTimeout: 10000
  },
  {
    displayName: 'integration',
    testMatch: ['<rootDir>/__tests__/integration/**/*.test.{ts,tsx}'],
    testTimeout: 20000
  },
  // ... other test types
]
```

### Performance Testing Setup (`jest.performance.setup.js`)

Provides utilities for performance testing:

- `performance.now()` for timing measurements
- Memory usage tracking
- Performance thresholds
- Performance test utilities

## Test Utilities

### `test-utils.tsx`

Provides a consistent testing environment:

```typescript
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
    options
  );
};
```

### Mock Services

All external services are mocked for testing:

```typescript
jest.mock('../../services/supabaseService', () => ({
  SupabaseService: {
    signUp: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    signIn: jest.fn(async (email: string) => ({ user: { id: 'u1', email } })),
    // ... other methods
  }
}));
```

## Best Practices

### 1. Async Testing

Always use `act()` and `waitFor()` for async operations:

```typescript
await act(async () => {
  await result.current.signIn('test@example.com', 'password');
});

await waitFor(() => {
  expect(result.current.isLoggedIn).toBe(true);
});
```

### 2. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset mocks and state
  jest.clearAllMocks();
  // Setup test environment
});
```

### 3. Meaningful Assertions

Test behavior, not implementation:

```typescript
// Good: Test user-visible behavior
expect(result.current.isLoggedIn).toBe(true);

// Avoid: Testing internal state
expect(result.current._internalState).toBe('authenticated');
```

### 4. Performance Thresholds

Set realistic performance expectations:

```typescript
// Should complete 10 cycles in reasonable time
expect(totalTime).toBeLessThan(5000); // 5 seconds

// Memory increase should be reasonable
expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
```

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Unit Tests
        run: npm run test:unit
      - name: Run Integration Tests
        run: npm run test:integration
      - name: Run Regression Tests
        run: npm run test:regression
      - name: Run Performance Tests
        run: npm run test:performance
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **Overall Coverage**: 85%+ coverage

## Future Enhancements

### 1. End-to-End Testing
- Add Playwright or Detox for E2E testing
- Test complete user workflows on real devices

### 2. Visual Regression Testing
- Add Storybook for component testing
- Visual diff testing for UI components

### 3. Load Testing
- Test app performance under high user load
- Database performance testing

### 4. Accessibility Testing
- Add axe-core for accessibility testing
- Screen reader compatibility tests

## Troubleshooting

### Common Issues

1. **Async State Updates**: Use `act()` and `waitFor()`
2. **Mock Services**: Ensure all external dependencies are mocked
3. **Environment Setup**: Mock browser environment for Node.js tests
4. **Performance Tests**: Adjust thresholds based on CI environment

### Debug Commands

```bash
# Run tests with verbose output
npm run test:unit -- --verbose

# Run specific test file
npm test -- __tests__/context/AuthContext.test.tsx

# Run tests in debug mode
npm test -- --detectOpenHandles --forceExit
```

## Conclusion

This testing strategy ensures:

- **Reliability**: Comprehensive coverage prevents regressions
- **Performance**: Performance tests catch performance degradation
- **Maintainability**: Well-organized tests are easy to maintain
- **Confidence**: Developers can refactor with confidence

The combination of unit, integration, regression, and performance tests provides a robust foundation for maintaining code quality and preventing issues in production.
