#!/usr/bin/env node

/**
 * Comprehensive Performance Testing Script
 * Runs all performance tests and generates detailed reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      },
      performance: {
        memoryUsage: [],
        queryTimes: [],
        cacheEfficiency: []
      }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive performance testing...\n');
    
    const startTime = Date.now();
    
    try {
      // Run basic performance tests
      await this.runTestSuite('Basic Performance Tests', 'npm run test:performance');
      
      // Run advanced performance tests
      await this.runTestSuite('Advanced Performance Tests', 'npm run test:performance -- __tests__/performance/AdvancedPerformanceTests.test.tsx');
      
      // Run memory leak tests
      await this.runTestSuite('Memory Leak Tests', 'npm run test:performance -- --testNamePattern="Memory"');
      
      // Run caching tests
      await this.runTestSuite('Caching Performance Tests', 'npm run test:performance -- --testNamePattern="Cache"');
      
      // Run pagination tests
      await this.runTestSuite('Pagination Performance Tests', 'npm run test:performance -- --testNamePattern="Pagination"');
      
      // Run concurrent request tests
      await this.runTestSuite('Concurrent Request Tests', 'npm run test:performance -- --testNamePattern="Concurrent"');
      
      // Run error handling tests
      await this.runTestSuite('Error Handling Performance Tests', 'npm run test:performance -- --testNamePattern="Error"');
      
      // Run real-time performance tests
      await this.runTestSuite('Real-time Performance Tests', 'npm run test:performance -- --testNamePattern="Real-time"');
      
      const endTime = Date.now();
      this.results.summary.duration = endTime - startTime;
      
      // Generate performance report
      this.generateReport();
      
      console.log('\n✅ All performance tests completed successfully!');
      console.log(`📊 Total duration: ${(this.results.summary.duration / 1000).toFixed(2)}s`);
      
    } catch (error) {
      console.error('\n❌ Performance testing failed:', error.message);
      process.exit(1);
    }
  }

  async runTestSuite(suiteName, command) {
    console.log(`\n🧪 Running ${suiteName}...`);
    
    const startTime = Date.now();
    let passed = false;
    let output = '';
    let error = null;

    try {
      output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      passed = true;
    } catch (err) {
      error = err.message;
      output = err.stdout || '';
    }

    const duration = Date.now() - startTime;
    
    const testResult = {
      name: suiteName,
      command,
      passed,
      duration,
      output: output.substring(0, 1000), // Truncate output
      error: error ? error.substring(0, 500) : null
    };

    this.results.tests.push(testResult);
    this.results.summary.total++;
    
    if (passed) {
      this.results.summary.passed++;
      console.log(`✅ ${suiteName} passed (${duration}ms)`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${suiteName} failed (${duration}ms)`);
      if (error) {
        console.log(`   Error: ${error.substring(0, 200)}...`);
      }
    }

    // Extract performance metrics from output
    this.extractPerformanceMetrics(output);
  }

  extractPerformanceMetrics(output) {
    // Extract memory usage
    const memoryMatches = output.match(/Memory increase: ([\d.]+)MB/g);
    if (memoryMatches) {
      memoryMatches.forEach(match => {
        const value = Number.parseFloat(match.match(/([\d.]+)/)[1]);
        this.results.performance.memoryUsage.push(value);
      });
    }

    // Extract query times
    const queryTimeMatches = output.match(/(\d+\.?\d*)ms/g);
    if (queryTimeMatches) {
      queryTimeMatches.forEach(match => {
        const value = Number.parseFloat(match);
        if (value > 0 && value < 10000) { // Filter reasonable values
          this.results.performance.queryTimes.push(value);
        }
      });
    }

    // Extract cache efficiency
    const cacheMatches = output.match(/Cache hit ratio: ([\d.]+)%/g);
    if (cacheMatches) {
      cacheMatches.forEach(match => {
        const value = Number.parseFloat(match.match(/([\d.]+)/)[1]);
        this.results.performance.cacheEfficiency.push(value);
      });
    }
  }

  generateReport() {
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    const htmlReportPath = path.join(__dirname, '..', 'performance-report.html');
    
    // Generate JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 JSON report saved to: ${reportPath}`);
    
    // Generate HTML report
    this.generateHtmlReport(htmlReportPath);
    console.log(`📄 HTML report saved to: ${htmlReportPath}`);
    
    // Generate performance recommendations
    this.generateRecommendations();
  }

  generateHtmlReport(htmlPath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-results { margin-bottom: 30px; }
        .test-item { background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #007bff; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.passed { border-left-color: #28a745; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-duration { color: #666; font-size: 0.9em; }
        .performance-metrics { margin-top: 30px; }
        .metric-chart { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .recommendations h3 { color: #1976d2; margin-top: 0; }
        .recommendation-item { margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p>Generated on ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.results.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">${this.results.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">${this.results.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="value">${(this.results.summary.duration / 1000).toFixed(2)}s</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Results</h2>
            ${this.results.tests.map(test => `
                <div class="test-item ${test.passed ? 'passed' : 'failed'}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-duration">Duration: ${test.duration}ms</div>
                    ${test.error ? `<div style="color: #dc3545; margin-top: 5px;">Error: ${test.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="performance-metrics">
            <h2>Performance Metrics</h2>
            <div class="metric-chart">
                <h3>Memory Usage</h3>
                <p>Average: ${this.calculateAverage(this.results.performance.memoryUsage).toFixed(2)}MB</p>
                <p>Max: ${Math.max(...this.results.performance.memoryUsage, 0).toFixed(2)}MB</p>
            </div>
            <div class="metric-chart">
                <h3>Query Times</h3>
                <p>Average: ${this.calculateAverage(this.results.performance.queryTimes).toFixed(2)}ms</p>
                <p>Max: ${Math.max(...this.results.performance.queryTimes, 0).toFixed(2)}ms</p>
            </div>
            <div class="metric-chart">
                <h3>Cache Efficiency</h3>
                <p>Average: ${this.calculateAverage(this.results.performance.cacheEfficiency).toFixed(2)}%</p>
                <p>Min: ${Math.min(...this.results.performance.cacheEfficiency, 100).toFixed(2)}%</p>
            </div>
        </div>
        
        <div class="recommendations">
            <h3>🎯 Performance Recommendations</h3>
            ${this.generateRecommendationsHtml()}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html);
  }

  calculateAverage(arr) {
    return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Memory usage recommendations
    const avgMemory = this.calculateAverage(this.results.performance.memoryUsage);
    if (avgMemory > 100) {
      recommendations.push('Consider implementing memory optimization strategies');
    }
    
    // Query time recommendations
    const avgQueryTime = this.calculateAverage(this.results.performance.queryTimes);
    if (avgQueryTime > 500) {
      recommendations.push('Optimize database queries and implement better caching');
    }
    
    // Cache efficiency recommendations
    const avgCacheEfficiency = this.calculateAverage(this.results.performance.cacheEfficiency);
    if (avgCacheEfficiency < 70) {
      recommendations.push('Improve cache hit ratio by optimizing cache strategies');
    }
    
    // General recommendations
    if (this.results.summary.failed > 0) {
      recommendations.push('Address failing tests to improve overall performance');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Continue monitoring for any regressions.');
    }
    
    console.log('\n🎯 Performance Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    return recommendations;
  }

  generateRecommendationsHtml() {
    const recommendations = this.generateRecommendations();
    return recommendations.map(rec => 
      `<div class="recommendation-item">${rec}</div>`
    ).join('');
  }
}

// Run the performance tests
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = PerformanceTestRunner;
