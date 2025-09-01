#!/usr/bin/env node

/**
 * Test Runner Script for SkillSync App
 * 
 * Usage:
 *   npm run test:unit      - Run only unit tests
 *   npm run test:integration - Run only integration tests
 *   npm run test:regression - Run only regression tests
 *   npm run test:performance - Run only performance tests
 *   npm run test:all       - Run all tests
 *   npm run test:coverage  - Run all tests with coverage
 */

const { spawn } = require('child_process');
const path = require('path');

const testTypes = {
  unit: 'unit',
  integration: 'integration', 
  regression: 'regression',
  performance: 'performance',
  all: 'all'
};

function runTests(testType, options = {}) {
  const args = ['test'];
  
  if (testType !== 'all') {
    args.push('--selectProjects', testType);
  }
  
  if (options.watch) {
    args.push('--watch');
  }
  
  if (options.coverage) {
    args.push('--coverage');
  }
  
  if (options.verbose) {
    args.push('--verbose');
  }
  
  console.log(`Running ${testType} tests...`);
  console.log(`Command: npx jest ${args.join(' ')}`);
  
  const child = spawn('npx', args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log(`\n✅ ${testType} tests completed successfully!`);
    } else {
      console.log(`\n❌ ${testType} tests failed with exit code ${code}`);
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error(`Failed to start test process: ${error.message}`);
    process.exit(1);
  });
}

function showUsage() {
  console.log(`
Test Runner for SkillSync App

Usage:
  npm run test:unit          - Run only unit tests
  npm run test:integration   - Run only integration tests  
  npm run test:regression    - Run only regression tests
  npm run test:performance   - Run only performance tests
  npm run test:all           - Run all tests
  npm run test:coverage      - Run all tests with coverage
  npm run test:watch         - Run all tests in watch mode

Test Types:
  - Unit: Individual component and utility tests
  - Integration: Tests that verify multiple components work together
  - Regression: Tests that prevent previously fixed bugs from reoccurring
  - Performance: Tests that verify app performance under various conditions

Examples:
  npm run test:unit
  npm run test:integration -- --watch
  npm run test:performance -- --verbose
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0];
const options = {
  watch: args.includes('--watch') || args.includes('-w'),
  coverage: args.includes('--coverage') || args.includes('-c'),
  verbose: args.includes('--verbose') || args.includes('-v')
};

// Validate test type
if (!testType || !testTypes[testType]) {
  if (testType === '--help' || testType === '-h') {
    showUsage();
    process.exit(0);
  }
  
  console.error(`❌ Invalid test type: ${testType}`);
  console.log('Valid test types:', Object.keys(testTypes).join(', '));
  console.log('Use --help for more information');
  process.exit(1);
}

// Run the tests
runTests(testType, options);
