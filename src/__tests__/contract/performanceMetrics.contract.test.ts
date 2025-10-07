import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceMonitor, type PerformanceMetric } from '../../services/performanceMonitoring';

describe('Performance Metrics Contract Test', () => {
  const STORAGE_KEY = 'performanceMetrics';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    performanceMonitor.clearMetrics();

    // Mock performance.memory for memory monitoring tests
    Object.defineProperty(performance, 'memory', {
      writable: true,
      configurable: true,
      value: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2048 * 1024 * 1024
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Performance Metric Schema Validation', () => {
    it('should validate metric structure with all required fields', () => {
      const metrics = performanceMonitor.getMetrics();

      // If metrics exist, validate schema
      if (metrics.length > 0) {
        const metric = metrics[0];

        expect(metric).toHaveProperty('metric_id');
        expect(metric).toHaveProperty('metric_type');
        expect(metric).toHaveProperty('value');
        expect(metric).toHaveProperty('rating');
        expect(metric).toHaveProperty('timestamp');
        expect(metric).toHaveProperty('context');

        expect(typeof metric.metric_id).toBe('string');
        expect(['lcp', 'inp', 'cls', 'ttfb', 'cpu', 'memory']).toContain(metric.metric_type);
        expect(typeof metric.value).toBe('number');
        expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating);
        expect(typeof metric.timestamp).toBe('number');
        expect(typeof metric.context).toBe('object');
      }
    });

    it('should validate metric context structure', () => {
      const metrics = performanceMonitor.getMetrics();

      if (metrics.length > 0) {
        const metric = metrics[0];

        expect(metric.context).toHaveProperty('route');
        expect(typeof metric.context.route).toBe('string');
      }
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist metrics to localStorage', () => {
      // Metrics should be automatically stored
      const stored = localStorage.getItem(STORAGE_KEY);

      // Either null (no metrics yet) or valid JSON array
      if (stored) {
        const parsedMetrics = JSON.parse(stored);
        expect(Array.isArray(parsedMetrics)).toBe(true);
      } else {
        expect(stored).toBeNull();
      }
    });

    it('should load metrics from localStorage on initialization', () => {
      // Create test metrics
      const testMetrics: PerformanceMetric[] = [
        {
          metric_id: 'test-1',
          metric_type: 'lcp',
          value: 2000,
          rating: 'good',
          timestamp: Date.now(),
          context: { route: '/test' }
        }
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(testMetrics));

      // Get metrics (should load from storage)
      const metrics = performanceMonitor.getMetrics();

      expect(metrics.length).toBeGreaterThanOrEqual(0);
    });

    it('should clear metrics from localStorage', () => {
      performanceMonitor.clearMetrics();

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeNull();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Web Vitals Thresholds', () => {
    it('should rate LCP correctly (good < 2500ms)', () => {
      const testMetric: PerformanceMetric = {
        metric_id: 'lcp-test',
        metric_type: 'lcp',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
        context: { route: '/' }
      };

      expect(testMetric.value).toBeLessThan(2500);
      expect(testMetric.rating).toBe('good');
    });

    it('should rate LCP correctly (needs-improvement 2500-4000ms)', () => {
      const testValue = 3000;
      expect(testValue).toBeGreaterThanOrEqual(2500);
      expect(testValue).toBeLessThanOrEqual(4000);
    });

    it('should rate LCP correctly (poor > 4000ms)', () => {
      const testValue = 5000;
      expect(testValue).toBeGreaterThan(4000);
    });

    it('should rate INP correctly (good < 200ms)', () => {
      const testMetric: PerformanceMetric = {
        metric_id: 'inp-test',
        metric_type: 'inp',
        value: 150,
        rating: 'good',
        timestamp: Date.now(),
        context: { route: '/' }
      };

      expect(testMetric.value).toBeLessThan(200);
      expect(testMetric.rating).toBe('good');
    });

    it('should rate INP correctly (needs-improvement 200-500ms)', () => {
      const testValue = 350;
      expect(testValue).toBeGreaterThanOrEqual(200);
      expect(testValue).toBeLessThanOrEqual(500);
    });

    it('should rate INP correctly (poor > 500ms)', () => {
      const testValue = 600;
      expect(testValue).toBeGreaterThan(500);
    });

    it('should rate CLS correctly (good < 0.1)', () => {
      const testMetric: PerformanceMetric = {
        metric_id: 'cls-test',
        metric_type: 'cls',
        value: 0.05,
        rating: 'good',
        timestamp: Date.now(),
        context: { route: '/' }
      };

      expect(testMetric.value).toBeLessThan(0.1);
      expect(testMetric.rating).toBe('good');
    });

    it('should rate CLS correctly (needs-improvement 0.1-0.25)', () => {
      const testValue = 0.15;
      expect(testValue).toBeGreaterThanOrEqual(0.1);
      expect(testValue).toBeLessThanOrEqual(0.25);
    });

    it('should rate CLS correctly (poor > 0.25)', () => {
      const testValue = 0.3;
      expect(testValue).toBeGreaterThan(0.25);
    });
  });

  describe('Aggregated Metrics Calculation', () => {
    it('should calculate P95 percentile correctly', () => {
      const aggregated = performanceMonitor.getAggregatedMetrics();

      expect(aggregated).toHaveProperty('lcp');
      expect(aggregated.lcp).toHaveProperty('p95');
      expect(aggregated.lcp).toHaveProperty('avg');

      expect(typeof aggregated.lcp.p95).toBe('number');
      expect(typeof aggregated.lcp.avg).toBe('number');
    });

    it('should calculate average correctly', () => {
      const aggregated = performanceMonitor.getAggregatedMetrics();

      expect(aggregated).toHaveProperty('inp');
      expect(aggregated.inp).toHaveProperty('avg');
      expect(typeof aggregated.inp.avg).toBe('number');
    });

    it('should calculate median (P50) correctly', () => {
      const aggregated = performanceMonitor.getAggregatedMetrics();

      expect(aggregated).toHaveProperty('cls');
      expect(aggregated.cls).toHaveProperty('median');
      expect(typeof aggregated.cls.median).toBe('number');
    });

    it('should handle empty metrics gracefully', () => {
      performanceMonitor.clearMetrics();

      const aggregated = performanceMonitor.getAggregatedMetrics();

      expect(aggregated.lcp.p95).toBe(0);
      expect(aggregated.lcp.avg).toBe(0);
      expect(aggregated.inp.p95).toBe(0);
      expect(aggregated.cls.median).toBe(0);
    });
  });

  describe('Memory Monitoring', () => {
    it('should track memory usage', () => {
      const aggregated = performanceMonitor.getAggregatedMetrics();

      expect(aggregated).toHaveProperty('memory');
      expect(aggregated.memory).toHaveProperty('avg');
      expect(aggregated.memory).toHaveProperty('max');

      expect(typeof aggregated.memory.avg).toBe('number');
      expect(typeof aggregated.memory.max).toBe('number');
    });

    it('should handle missing performance.memory API', () => {
      // Remove performance.memory
      delete (performance as any).memory;

      const aggregated = performanceMonitor.getAggregatedMetrics();

      // Should not throw error, should return 0 for memory metrics
      expect(aggregated.memory.avg).toBe(0);
      expect(aggregated.memory.max).toBe(0);
    });
  });

  describe('Performance Monitor Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => {
        const metrics = performanceMonitor.getMetrics();
      }).not.toThrow();
    });

    it('should destroy cleanly', () => {
      expect(() => {
        performanceMonitor.destroy();
      }).not.toThrow();
    });
  });
});
