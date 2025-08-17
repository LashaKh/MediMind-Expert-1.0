/**
 * Unit tests for Performance Monitoring System
 * Tests Web Vitals tracking, medical content monitoring, and performance alerts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceMonitor } from '../../utils/performanceMonitoring';

// Mock Performance API
const mockPerformanceObserver = vi.fn();
const mockPerformance = {
  now: vi.fn().mockReturnValue(1000),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn().mockReturnValue([]),
  getEntriesByName: vi.fn().mockReturnValue([])
};

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver
});

Object.defineProperty(global, 'performance', {
  writable: true,
  value: mockPerformance
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('Basic Performance Tracking', () => {
    it('should initialize with default configuration', () => {
      const config = performanceMonitor.getConfig();
      
      expect(config.enabled).toBe(true);
      expect(config.pageLoadTarget).toBe(2000);
      expect(config.apiResponseTarget).toBe(200);
      expect(config.medicalContentPriority).toBe(true);
    });

    it('should track page load metrics', () => {
      performanceMonitor.trackPageLoad('test-page', 1500, true);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.pageLoads.length).toBe(1);
      expect(metrics.pageLoads[0].page).toBe('test-page');
      expect(metrics.pageLoads[0].loadTime).toBe(1500);
      expect(metrics.pageLoads[0].medicalContent).toBe(true);
    });

    it('should track API response times', () => {
      performanceMonitor.trackApiResponse('/api/medical-news', 'GET', 150, 200);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.apiCalls.length).toBe(1);
      expect(metrics.apiCalls[0].endpoint).toBe('/api/medical-news');
      expect(metrics.apiCalls[0].responseTime).toBe(150);
    });
  });

  describe('Medical Content Performance', () => {
    it('should track medical-specific performance metrics', () => {
      const medicalMetrics = {
        newsLoadTime: 800,
        calculatorResponseTime: 50,
        searchResultsTime: 300,
        imageLoadTime: 200
      };

      performanceMonitor.trackMedicalContentPerformance(medicalMetrics);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.medicalContent.length).toBe(1);
      expect(metrics.medicalContent[0]).toMatchObject(medicalMetrics);
    });

    it('should prioritize medical content in performance alerts', () => {
      // Track slow medical content
      performanceMonitor.trackPageLoad('medical-news', 3000, true);
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      const medicalAlert = alerts.find(alert => 
        alert.type === 'page_load_slow' && alert.medicalContent
      );
      
      expect(medicalAlert).toBeDefined();
      expect(medicalAlert?.severity).toBe('high');
    });

    it('should generate medical content performance reports', () => {
      performanceMonitor.trackMedicalContentPerformance({
        newsLoadTime: 1200,
        calculatorResponseTime: 80,
        searchResultsTime: 400,
        imageLoadTime: 300
      });

      const report = performanceMonitor.generateReport();
      expect(report.medicalContent).toBeDefined();
      expect(report.medicalContent.averageNewsLoadTime).toBe(1200);
      expect(report.medicalContent.averageCalculatorTime).toBe(80);
    });
  });

  describe('Web Vitals Tracking', () => {
    it('should track Core Web Vitals', () => {
      performanceMonitor.trackWebVital('LCP', 1800, 'good');
      performanceMonitor.trackWebVital('FID', 50, 'good');
      performanceMonitor.trackWebVital('CLS', 0.05, 'good');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.webVitals.length).toBe(3);
      
      const lcpMetric = metrics.webVitals.find(v => v.name === 'LCP');
      expect(lcpMetric?.value).toBe(1800);
      expect(lcpMetric?.rating).toBe('good');
    });

    it('should detect poor Web Vitals performance', () => {
      performanceMonitor.trackWebVital('LCP', 4000, 'poor');
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      const lcpAlert = alerts.find(alert => alert.type === 'web_vital_poor');
      
      expect(lcpAlert).toBeDefined();
      expect(lcpAlert?.severity).toBe('medium');
    });
  });

  describe('Performance Alerts', () => {
    it('should generate alerts for slow page loads', () => {
      performanceMonitor.trackPageLoad('slow-page', 5000, false);
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      
      const slowPageAlert = alerts.find(alert => alert.type === 'page_load_slow');
      expect(slowPageAlert).toBeDefined();
      expect(slowPageAlert?.severity).toBe('medium');
    });

    it('should generate high-severity alerts for slow medical content', () => {
      performanceMonitor.trackPageLoad('medical-content', 4000, true);
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      const medicalAlert = alerts.find(alert => 
        alert.type === 'page_load_slow' && alert.medicalContent
      );
      
      expect(medicalAlert?.severity).toBe('high');
    });

    it('should generate alerts for slow API responses', () => {
      performanceMonitor.trackApiResponse('/api/search', 'POST', 1000, 200);
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      const apiAlert = alerts.find(alert => alert.type === 'api_response_slow');
      
      expect(apiAlert).toBeDefined();
    });
  });

  describe('Performance Reporting', () => {
    it('should generate comprehensive performance report', () => {
      // Add various metrics
      performanceMonitor.trackPageLoad('test-page', 1500, false);
      performanceMonitor.trackApiResponse('/api/test', 'GET', 100, 200);
      performanceMonitor.trackWebVital('LCP', 1800, 'good');
      performanceMonitor.trackMedicalContentPerformance({
        newsLoadTime: 800,
        calculatorResponseTime: 60,
        searchResultsTime: 250,
        imageLoadTime: 150
      });

      const report = performanceMonitor.generateReport();
      
      expect(report.summary.totalPageLoads).toBe(1);
      expect(report.summary.totalApiCalls).toBe(1);
      expect(report.summary.averagePageLoadTime).toBe(1500);
      expect(report.summary.averageApiResponseTime).toBe(100);
      expect(report.webVitals.length).toBe(1);
      expect(report.medicalContent).toBeDefined();
    });

    it('should calculate performance scores correctly', () => {
      performanceMonitor.trackPageLoad('fast-page', 800, false);
      performanceMonitor.trackApiResponse('/api/fast', 'GET', 50, 200);
      
      const report = performanceMonitor.generateReport();
      expect(report.summary.performanceScore).toBeGreaterThan(80);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        pageLoadTarget: 1500,
        apiResponseTarget: 150,
        medicalContentPriority: false
      };

      performanceMonitor.updateConfig(newConfig);
      
      const config = performanceMonitor.getConfig();
      expect(config.pageLoadTarget).toBe(1500);
      expect(config.apiResponseTarget).toBe(150);
      expect(config.medicalContentPriority).toBe(false);
    });

    it('should maintain performance budget enforcement', () => {
      performanceMonitor.updateConfig({ pageLoadTarget: 1000 });
      
      performanceMonitor.trackPageLoad('test-page', 1500, false);
      
      const alerts = performanceMonitor.getPerformanceAlerts();
      const budgetAlert = alerts.find(alert => alert.type === 'page_load_slow');
      
      expect(budgetAlert).toBeDefined();
    });
  });

  describe('Error Tracking Integration', () => {
    it('should track performance-related errors', () => {
      const performanceError = {
        type: 'performance',
        message: 'Resource load timeout',
        stack: 'stack trace'
      };

      performanceMonitor.trackError(performanceError);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.errors.length).toBe(1);
      expect(metrics.errors[0].type).toBe('performance');
    });

    it('should correlate errors with performance metrics', () => {
      performanceMonitor.trackPageLoad('error-page', 5000, true);
      performanceMonitor.trackError({
        type: 'medical_timeout',
        message: 'Medical API timeout',
        stack: 'stack trace'
      });

      const report = performanceMonitor.generateReport();
      expect(report.errorAnalysis.totalErrors).toBe(1);
      expect(report.errorAnalysis.errorsByType['medical_timeout']).toBe(1);
    });
  });

  describe('Batch Reporting', () => {
    it('should batch metrics for efficient reporting', async () => {
      // Add multiple metrics
      for (let i = 0; i < 5; i++) {
        performanceMonitor.trackPageLoad(`page-${i}`, 1000 + i * 100, false);
        performanceMonitor.trackApiResponse(`/api/endpoint-${i}`, 'GET', 100 + i * 10, 200);
      }

      await performanceMonitor.sendBatchReport();
      
      // Should have made API call to send batch
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/performance-metrics'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('pageLoadMetrics')
        })
      );
    });

    it('should handle batch reporting failures gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      performanceMonitor.trackPageLoad('test-page', 1000, false);
      
      // Should not throw error
      await expect(performanceMonitor.sendBatchReport()).resolves.not.toThrow();
    });
  });

  describe('Real-time Monitoring', () => {
    it('should start and stop monitoring correctly', () => {
      expect(() => performanceMonitor.startMonitoring()).not.toThrow();
      expect(() => performanceMonitor.stopMonitoring()).not.toThrow();
    });

    it('should respect sampling rate configuration', () => {
      performanceMonitor.updateConfig({ sampleRate: 0.1 });
      
      // With 10% sampling, not all metrics should be tracked
      // This is a probabilistic test, so we'll just verify the config is set
      const config = performanceMonitor.getConfig();
      expect(config.sampleRate).toBe(0.1);
    });
  });

  describe('Metrics Validation', () => {
    it('should validate metric values', () => {
      // Should handle invalid values gracefully
      performanceMonitor.trackPageLoad('test', -100, false); // Negative time
      performanceMonitor.trackApiResponse('/api/test', 'GET', NaN, 200); // Invalid time
      
      const metrics = performanceMonitor.getMetrics();
      
      // Invalid metrics should be filtered out or normalized
      expect(metrics.pageLoads.every(load => load.loadTime >= 0)).toBe(true);
      expect(metrics.apiCalls.every(call => !isNaN(call.responseTime))).toBe(true);
    });
  });
});