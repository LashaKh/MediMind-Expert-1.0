/**
 * Performance monitoring utility for medical calculator loading
 * Tracks lazy loading performance and bundle optimization results
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface CalculatorLoadMetrics {
  calculatorId: string;
  loadTime: number;
  chunkSize?: number;
  cacheHit: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private calculatorMetrics: CalculatorLoadMetrics[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start timing a performance metric
   */
  startTiming(name: string): void {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  /**
   * End timing and calculate duration
   */
  endTiming(name: string): number | null {
    if (!this.isEnabled) return null;
    
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    return duration;
  }

  /**
   * Track calculator loading performance
   */
  trackCalculatorLoad(calculatorId: string, startTime: number): void {
    if (!this.isEnabled) return;
    
    const loadTime = performance.now() - startTime;
    const cacheHit = this.isCalculatorCached(calculatorId);
    
    const metric: CalculatorLoadMetrics = {
      calculatorId,
      loadTime,
      cacheHit,
      timestamp: Date.now()
    };

    this.calculatorMetrics.push(metric);
    
    // Log with performance context
    const status = cacheHit ? '🎯 Cache Hit' : '📦 Fresh Load';
    const performance_level = loadTime < 100 ? '🚀 Excellent' : 
                             loadTime < 300 ? '✅ Good' : 
                             loadTime < 500 ? '⚠️ Fair' : '🐌 Slow';
    
  }

  /**
   * Check if calculator is already cached (loaded before)
   */
  private isCalculatorCached(calculatorId: string): boolean {
    return this.calculatorMetrics.some(m => m.calculatorId === calculatorId);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageLoadTime: number;
    cacheHitRate: number;
    totalCalculatorsLoaded: number;
    slowestCalculator: CalculatorLoadMetrics | null;
    fastestCalculator: CalculatorLoadMetrics | null;
  } {
    if (this.calculatorMetrics.length === 0) {
      return {
        averageLoadTime: 0,
        cacheHitRate: 0,
        totalCalculatorsLoaded: 0,
        slowestCalculator: null,
        fastestCalculator: null
      };
    }

    const totalLoadTime = this.calculatorMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    const cacheHits = this.calculatorMetrics.filter(m => m.cacheHit).length;
    
    const sorted = [...this.calculatorMetrics].sort((a, b) => a.loadTime - b.loadTime);
    
    return {
      averageLoadTime: totalLoadTime / this.calculatorMetrics.length,
      cacheHitRate: (cacheHits / this.calculatorMetrics.length) * 100,
      totalCalculatorsLoaded: this.calculatorMetrics.length,
      slowestCalculator: sorted[sorted.length - 1] || null,
      fastestCalculator: sorted[0] || null
    };
  }

  /**
   * Log performance summary to console
   */
  logPerformanceSummary(): void {
    if (!this.isEnabled) return;
    
    const summary = this.getPerformanceSummary();
    
    console.group('📊 Calculator Performance Summary');
    
    if (summary.fastestCalculator) {
    }
    
    if (summary.slowestCalculator) {
    }
    
    console.groupEnd();
  }

  /**
   * Monitor bundle sizes using ResourceTiming API
   */
  measureBundlePerformance(): void {
    if (!this.isEnabled || !window.performance?.getEntriesByType) return;
    
    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js') && r.name.includes('calculators'));
    
    if (jsResources.length > 0) {
      console.group('📦 Bundle Performance');
      jsResources.forEach(resource => {
        const sizeKB = resource.transferSize ? (resource.transferSize / 1024).toFixed(2) : 'Unknown';
        const loadTime = resource.responseEnd - resource.requestStart;
      });
      console.groupEnd();
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.calculatorMetrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for React components
export const withPerformanceTracking = <T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) => {
  return React.forwardRef<any, T>((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.startTiming(componentName);
      return () => {
        performanceMonitor.endTiming(componentName);
      };
    }, []);

    return <WrappedComponent {...props} ref={ref} />;
  });
};

// Hook for tracking calculator loads
export const useCalculatorPerformanceTracking = () => {
  const trackLoad = React.useCallback((calculatorId: string, startTime: number) => {
    performanceMonitor.trackCalculatorLoad(calculatorId, startTime);
  }, []);

  const showSummary = React.useCallback(() => {
    performanceMonitor.logPerformanceSummary();
  }, []);

  return { trackLoad, showSummary };
};