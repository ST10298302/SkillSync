/**
 * Performance Monitoring and Auto-scaling Service
 * Tracks memory usage, query performance, and implements auto-scaling
 * Implements memory leak prevention strategies (Mandalchandan, 2024)
 */
interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: number;
  queryCount: number;
  averageQueryTime: number;
  cacheHitRatio: number;
  errorRate: number;
  concurrentUsers: number;
}

interface ScalingThresholds {
  memoryUsage: number; // MB
  queryTime: number; // ms
  errorRate: number; // percentage
  cacheHitRatio: number; // percentage
}

interface AutoScalingConfig {
  enabled: boolean;
  thresholds: ScalingThresholds;
  scaleUpDelay: number; // ms
  scaleDownDelay: number; // ms
  maxInstances: number;
  minInstances: number;
  currentInstances: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config: AutoScalingConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((message: string, severity: 'info' | 'warning' | 'error') => void)[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      thresholds: {
        memoryUsage: 500, // 500MB
        queryTime: 1000, // 1 second
        errorRate: 5, // 5%
        cacheHitRatio: 70 // 70%
      },
      scaleUpDelay: 30000, // 30 seconds
      scaleDownDelay: 300000, // 5 minutes
      maxInstances: 10,
      minInstances: 1,
      currentInstances: 1
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start monitoring performance metrics
  startMonitoring(intervalMs: number = 10000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.checkScalingNeeds();
    }, intervalMs);

    console.log('Performance monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Performance monitoring stopped');
  }

  // Collect current performance metrics
  private collectMetrics(): void {
    const memoryInfo = (performance as any).memory;
    const currentMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0, // MB
      queryCount: this.getQueryCount(),
      averageQueryTime: this.getAverageQueryTime(),
      cacheHitRatio: this.getCacheHitRatio(),
      errorRate: this.getErrorRate(),
      concurrentUsers: this.getConcurrentUsers()
    };

    this.metrics.push(currentMetrics);
    
    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Analyze performance and trigger alerts if needed
  private analyzePerformance(): void {
    if (this.metrics.length === 0) return;

    const latest = this.metrics[this.metrics.length - 1];
    const thresholds = this.config.thresholds;

    // Check memory usage
    if (latest.memoryUsage > thresholds.memoryUsage) {
      this.triggerAlert(
        `High memory usage: ${latest.memoryUsage.toFixed(2)}MB`,
        'warning'
      );
    }

    // Check query performance
    if (latest.averageQueryTime > thresholds.queryTime) {
      this.triggerAlert(
        `Slow queries detected: ${latest.averageQueryTime.toFixed(2)}ms average`,
        'warning'
      );
    }

    // Check error rate
    if (latest.errorRate > thresholds.errorRate) {
      this.triggerAlert(
        `High error rate: ${latest.errorRate.toFixed(2)}%`,
        'error'
      );
    }

    // Check cache efficiency
    if (latest.cacheHitRatio < thresholds.cacheHitRatio) {
      this.triggerAlert(
        `Low cache hit ratio: ${latest.cacheHitRatio.toFixed(2)}%`,
        'info'
      );
    }
  }

  // Check if auto-scaling is needed
  private checkScalingNeeds(): void {
    if (!this.config.enabled) return;

    const latest = this.metrics[this.metrics.length - 1];
    const shouldScaleUp = this.shouldScaleUp(latest);
    const shouldScaleDown = this.shouldScaleDown(latest);

    if (shouldScaleUp && this.config.currentInstances < this.config.maxInstances) {
      this.scaleUp();
    } else if (shouldScaleDown && this.config.currentInstances > this.config.minInstances) {
      this.scaleDown();
    }
  }

  // Determine if we should scale up
  private shouldScaleUp(metrics: PerformanceMetrics): boolean {
    const thresholds = this.config.thresholds;
    
    return (
      metrics.memoryUsage > thresholds.memoryUsage * 0.8 ||
      metrics.averageQueryTime > thresholds.queryTime * 0.8 ||
      metrics.errorRate > thresholds.errorRate * 0.8 ||
      metrics.cacheHitRatio < thresholds.cacheHitRatio * 0.9
    );
  }

  // Determine if we should scale down
  private shouldScaleDown(metrics: PerformanceMetrics): boolean {
    const thresholds = this.config.thresholds;
    
    return (
      metrics.memoryUsage < thresholds.memoryUsage * 0.5 &&
      metrics.averageQueryTime < thresholds.queryTime * 0.5 &&
      metrics.errorRate < thresholds.errorRate * 0.5 &&
      metrics.cacheHitRatio > thresholds.cacheHitRatio * 1.1
    );
  }

  // Scale up the system
  private scaleUp(): void {
    this.config.currentInstances = Math.min(
      this.config.currentInstances + 1,
      this.config.maxInstances
    );
    
    this.triggerAlert(
      `Scaling up to ${this.config.currentInstances} instances`,
      'info'
    );
    
    // In a real implementation, this would trigger actual scaling
    console.log(`Auto-scaling: Scaled up to ${this.config.currentInstances} instances`);
  }

  // Scale down the system
  private scaleDown(): void {
    this.config.currentInstances = Math.max(
      this.config.currentInstances - 1,
      this.config.minInstances
    );
    
    this.triggerAlert(
      `Scaling down to ${this.config.currentInstances} instances`,
      'info'
    );
    
    // In a real implementation, this would trigger actual scaling
    console.log(`Auto-scaling: Scaled down to ${this.config.currentInstances} instances`);
  }

  // Get current query count (mock implementation)
  private getQueryCount(): number {
    // In a real implementation, this would track actual query counts
    return Math.floor(Math.random() * 100); // NOSONAR - test-only synthetic metric
  }

  // Get average query time (mock implementation)
  private getAverageQueryTime(): number {
    // In a real implementation, this would calculate from actual query times
    return Math.random() * 500 + 100; // NOSONAR - synthetic metric for demo (100-600ms)
  }

  // Get cache hit ratio (mock implementation)
  private getCacheHitRatio(): number {
    // In a real implementation, this would calculate from actual cache hits/misses
    return Math.random() * 30 + 70; // NOSONAR - synthetic metric (70-100%)
  }

  // Get error rate (mock implementation)
  private getErrorRate(): number {
    // In a real implementation, this would track actual errors
    return Math.random() * 5; // NOSONAR - synthetic metric (0-5%)
  }

  // Get concurrent users (mock implementation)
  private getConcurrentUsers(): number {
    // In a real implementation, this would track actual concurrent users
    return Math.floor(Math.random() * 1000) + 100; // NOSONAR - synthetic metric (100-1100 users)
  }

  // Trigger an alert
  private triggerAlert(message: string, severity: 'info' | 'warning' | 'error'): void {
    console.log(`[${severity.toUpperCase()}] ${message}`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(message, severity);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  // Add alert callback
  addAlertCallback(callback: (message: string, severity: 'info' | 'warning' | 'error') => void): void {
    this.alertCallbacks.push(callback);
  }

  // Remove alert callback
  removeAlertCallback(callback: (message: string, severity: 'info' | 'warning' | 'error') => void): void {
    this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // Get metrics history
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageMemoryUsage: number;
    averageQueryTime: number;
    averageCacheHitRatio: number;
    averageErrorRate: number;
    totalAlerts: number;
    uptime: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageMemoryUsage: 0,
        averageQueryTime: 0,
        averageCacheHitRatio: 0,
        averageErrorRate: 0,
        totalAlerts: 0,
        uptime: 0
      };
    }

    const total = this.metrics.reduce((acc, metric) => ({
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      queryTime: acc.queryTime + metric.averageQueryTime,
      cacheHitRatio: acc.cacheHitRatio + metric.cacheHitRatio,
      errorRate: acc.errorRate + metric.errorRate
    }), { memoryUsage: 0, queryTime: 0, cacheHitRatio: 0, errorRate: 0 });

    const count = this.metrics.length;
    const uptime = this.metrics.length > 0 
      ? Date.now() - this.metrics[0].timestamp 
      : 0;

    return {
      averageMemoryUsage: total.memoryUsage / count,
      averageQueryTime: total.queryTime / count,
      averageCacheHitRatio: total.cacheHitRatio / count,
      averageErrorRate: total.errorRate / count,
      totalAlerts: this.alertCallbacks.length,
      uptime
    };
  }

  // Update auto-scaling configuration
  updateScalingConfig(config: Partial<AutoScalingConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Auto-scaling configuration updated:', this.config);
  }

  // Get current configuration
  getScalingConfig(): AutoScalingConfig {
    return { ...this.config };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = [];
    console.log('Performance metrics reset');
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify({
      config: this.config,
      metrics: this.metrics,
      summary: this.getPerformanceSummary()
    }, null, 2);
  }
}

export default PerformanceMonitor;
