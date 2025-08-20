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

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  renderTimes: number[];
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private calculatorMetrics: CalculatorLoadMetrics[] = [];
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development' || 
                              localStorage.getItem('enable-performance-monitoring') === 'true';

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
   * Track component render performance
   */
  trackRender(componentName: string, renderTime?: number): void {
    if (!this.isEnabled) return;
    
    const time = renderTime || performance.now();
    const existing = this.renderMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      renderTimes: []
    };

    existing.renderCount++;
    existing.lastRenderTime = time;
    existing.renderTimes.push(time);
    
    // Keep only last 50 render times for memory efficiency
    if (existing.renderTimes.length > 50) {
      existing.renderTimes.shift();
    }
    
    existing.averageRenderTime = existing.renderTimes.reduce((sum, time) => sum + time, 0) / existing.renderTimes.length;
    
    this.renderMetrics.set(componentName, existing);
    
    // Log excessive re-renders (>10 renders in a short time span)
    if (existing.renderCount > 10 && existing.renderTimes.length >= 10) {
      const recentRenders = existing.renderTimes.slice(-10);
      const timespan = recentRenders[recentRenders.length - 1] - recentRenders[0];
      if (timespan < 5000) { // 10 renders in less than 5 seconds
        console.warn(`🔄 Excessive re-renders detected: ${componentName} rendered ${existing.renderCount} times (${recentRenders.length} in last ${(timespan/1000).toFixed(1)}s)`);
      }
    }
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
   * Get render performance report
   */
  getRenderReport(): RenderMetrics[] {
    return Array.from(this.renderMetrics.values()).sort((a, b) => b.renderCount - a.renderCount);
  }

  /**
   * Log performance summary to console
   */
  logPerformanceSummary(): void {
    if (!this.isEnabled) return;
    
    const summary = this.getPerformanceSummary();
    const renderReport = this.getRenderReport();
    
    console.group('📊 Mobile Performance Optimization - Phase 3 Results');
    
    // Calculator loading performance
    if (summary.totalCalculatorsLoaded > 0) {
      console.log(`⚡ Calculator Loading Performance:`);
      console.log(`- Average load time: ${summary.averageLoadTime.toFixed(2)}ms`);
      console.log(`- Cache hit rate: ${summary.cacheHitRate.toFixed(1)}%`);
      console.log(`- Total calculators loaded: ${summary.totalCalculatorsLoaded}`);
    }
    
    // Re-render performance
    if (renderReport.length > 0) {
      console.log(`🔄 Component Re-render Analysis:`);
      const totalRenders = renderReport.reduce((sum, metric) => sum + metric.renderCount, 0);
      const excessiveRerenders = renderReport.filter(metric => metric.renderCount > 20);
      
      console.log(`- Total renders tracked: ${totalRenders}`);
      console.log(`- Components monitored: ${renderReport.length}`);
      console.log(`- Components with >20 renders: ${excessiveRerenders.length}`);
      
      if (excessiveRerenders.length > 0) {
        console.warn('⚠️ Components needing optimization:');
        excessiveRerenders.forEach(metric => {
          console.warn(`  - ${metric.componentName}: ${metric.renderCount} renders`);
        });
      }
      
      // Show performance improvement results
      const wellOptimized = renderReport.filter(metric => metric.renderCount <= 10);
      if (wellOptimized.length > 0) {
        console.log(`✅ Well-optimized components: ${wellOptimized.length}`);
      }
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

// Hook for tracking component re-renders in Phase 3 optimization
export const useRenderTracking = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      performanceMonitor.trackRender(componentName);
    });
  }
};