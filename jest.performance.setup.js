// Performance testing setup for Jest
// This file configures the test environment for performance testing

// Mock performance API if not available
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
    clearResourceTimings: () => {},
    memory: {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    }
  };
}

// Add performance measurement utilities
global.measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  return { result, duration };
};

// Add memory usage tracking
global.trackMemoryUsage = (label) => {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    const total = performance.memory.totalJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;
    
    console.log(`Memory [${label}]:`, {
      used: `${(used / 1024 / 1024).toFixed(2)}MB`,
      total: `${(total / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(limit / 1024 / 1024).toFixed(2)}MB`
    });
    
    return { used, total, limit };
  }
  return null;
};

// Performance thresholds for tests
global.PERFORMANCE_THRESHOLDS = {
  AUTH_CYCLE_TIME: 500, // 500ms for auth sign-in/sign-out cycle
  SKILL_ADD_TIME: 100,  // 100ms per skill addition
  SKILL_UPDATE_TIME: 50, // 50ms per skill update
  SKILL_DELETE_TIME: 50, // 50ms per skill deletion
  LARGE_LIST_RENDER: 1000, // 1 second for rendering large lists
  MEMORY_LEAK_THRESHOLD: 10 * 1024 * 1024 // 10MB memory increase threshold
};

// Performance test utilities
global.createPerformanceTest = (name, threshold, testFn) => {
  return async () => {
    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize || 0;
    
    await testFn();
    
    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize || 0;
    
    const duration = endTime - startTime;
    const memoryIncrease = endMemory - startMemory;
    
    console.log(`Performance Test [${name}]:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    console.log(`  Memory: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    expect(duration).toBeLessThan(threshold);
    
    if (startMemory > 0 && endMemory > 0) {
      expect(memoryIncrease).toBeLessThan(global.PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    }
  };
};
