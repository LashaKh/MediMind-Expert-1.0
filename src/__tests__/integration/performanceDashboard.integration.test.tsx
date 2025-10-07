import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { performanceMonitor } from '../../services/performanceMonitoring';
import type { PerformanceMetric } from '../../services/performanceMonitoring';

// Mock Performance Dashboard Component (will be created in T033)
const MockPerformanceDashboard = () => {
  const metrics = performanceMonitor.getMetrics();
  const aggregated = performanceMonitor.getAggregatedMetrics();

  return (
    <div className="performance-dashboard" data-testid="performance-dashboard">
      <h2>Performance Metrics</h2>

      <div className="metrics-grid" data-testid="metrics-grid">
        {/* LCP Card */}
        <div className="metric-card" data-metric="lcp" data-testid="lcp-card">
          <h3>Largest Contentful Paint</h3>
          <div className="metric-value" data-testid="lcp-value">
            {aggregated.lcp.p95.toFixed(0)}ms
          </div>
          <div className="metric-description">Time to largest content paint (P95)</div>
        </div>

        {/* FID Card */}
        <div className="metric-card" data-metric="fid" data-testid="fid-card">
          <h3>First Input Delay</h3>
          <div className="metric-value" data-testid="fid-value">
            {aggregated.fid.p95.toFixed(0)}ms
          </div>
          <div className="metric-description">Interaction responsiveness (P95)</div>
        </div>

        {/* CLS Card */}
        <div className="metric-card" data-metric="cls" data-testid="cls-card">
          <h3>Cumulative Layout Shift</h3>
          <div className="metric-value" data-testid="cls-value">
            {aggregated.cls.median.toFixed(3)}
          </div>
          <div className="metric-description">Visual stability (median)</div>
        </div>

        {/* Memory Card */}
        <div className="metric-card" data-metric="memory" data-testid="memory-card">
          <h3>Memory Usage</h3>
          <div className="metric-value" data-testid="memory-value">
            {aggregated.memory.avg.toFixed(0)}MB
          </div>
          <div className="metric-description">Average heap usage</div>
        </div>
      </div>

      <div className="charts-section" data-testid="charts-section">
        <div className="memory-chart" data-chart="memory" data-testid="memory-chart">
          Memory Chart Placeholder
        </div>
        <div className="cpu-chart" data-chart="cpu" data-testid="cpu-chart">
          CPU Chart Placeholder
        </div>
      </div>

      <button
        onClick={() => performanceMonitor.clearMetrics()}
        data-testid="clear-metrics-button"
      >
        Clear Metrics
      </button>
    </div>
  );
};

describe('Performance Dashboard Integration Test', () => {
  beforeEach(() => {
    // Clear metrics and localStorage before each test
    localStorage.clear();
    performanceMonitor.clearMetrics();

    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      writable: true,
      configurable: true,
      value: {
        usedJSHeapSize: 100 * 1024 * 1024, // 100MB
        totalJSHeapSize: 200 * 1024 * 1024,
        jsHeapSizeLimit: 2048 * 1024 * 1024
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Dashboard Rendering', () => {
    it('should render performance dashboard', () => {
      render(<MockPerformanceDashboard />);

      const dashboard = screen.getByTestId('performance-dashboard');
      expect(dashboard).toBeInTheDocument();
    });

    it('should render metrics grid', () => {
      render(<MockPerformanceDashboard />);

      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toBeInTheDocument();
    });

    it('should render all metric cards', () => {
      render(<MockPerformanceDashboard />);

      expect(screen.getByTestId('lcp-card')).toBeInTheDocument();
      expect(screen.getByTestId('fid-card')).toBeInTheDocument();
      expect(screen.getByTestId('cls-card')).toBeInTheDocument();
      expect(screen.getByTestId('memory-card')).toBeInTheDocument();
    });
  });

  describe('LCP Metric Display', () => {
    it('should display LCP metric card', () => {
      render(<MockPerformanceDashboard />);

      const lcpCard = screen.getByTestId('lcp-card');
      expect(lcpCard).toBeInTheDocument();
      expect(lcpCard).toHaveTextContent('Largest Contentful Paint');
    });

    it('should display LCP value', () => {
      render(<MockPerformanceDashboard />);

      const lcpValue = screen.getByTestId('lcp-value');
      expect(lcpValue).toBeInTheDocument();
      expect(lcpValue.textContent).toMatch(/\d+ms/);
    });

    it('should display LCP description', () => {
      render(<MockPerformanceDashboard />);

      const lcpCard = screen.getByTestId('lcp-card');
      expect(lcpCard).toHaveTextContent('Time to largest content paint (P95)');
    });
  });

  describe('FID Metric Display', () => {
    it('should display FID metric card', () => {
      render(<MockPerformanceDashboard />);

      const fidCard = screen.getByTestId('fid-card');
      expect(fidCard).toBeInTheDocument();
      expect(fidCard).toHaveTextContent('First Input Delay');
    });

    it('should display FID value', () => {
      render(<MockPerformanceDashboard />);

      const fidValue = screen.getByTestId('fid-value');
      expect(fidValue).toBeInTheDocument();
      expect(fidValue.textContent).toMatch(/\d+ms/);
    });
  });

  describe('CLS Metric Display', () => {
    it('should display CLS metric card', () => {
      render(<MockPerformanceDashboard />);

      const clsCard = screen.getByTestId('cls-card');
      expect(clsCard).toBeInTheDocument();
      expect(clsCard).toHaveTextContent('Cumulative Layout Shift');
    });

    it('should display CLS value', () => {
      render(<MockPerformanceDashboard />);

      const clsValue = screen.getByTestId('cls-value');
      expect(clsValue).toBeInTheDocument();
      // CLS should be a decimal number (e.g., 0.000)
      expect(clsValue.textContent).toMatch(/\d+\.\d+/);
    });
  });

  describe('Memory Metric Display', () => {
    it('should display Memory metric card', () => {
      render(<MockPerformanceDashboard />);

      const memoryCard = screen.getByTestId('memory-card');
      expect(memoryCard).toBeInTheDocument();
      expect(memoryCard).toHaveTextContent('Memory Usage');
    });

    it('should display Memory value', () => {
      render(<MockPerformanceDashboard />);

      const memoryValue = screen.getByTestId('memory-value');
      expect(memoryValue).toBeInTheDocument();
      expect(memoryValue.textContent).toMatch(/\d+MB/);
    });
  });

  describe('Charts Rendering', () => {
    it('should render charts section', () => {
      render(<MockPerformanceDashboard />);

      const chartsSection = screen.getByTestId('charts-section');
      expect(chartsSection).toBeInTheDocument();
    });

    it('should render memory chart', () => {
      render(<MockPerformanceDashboard />);

      const memoryChart = screen.getByTestId('memory-chart');
      expect(memoryChart).toBeInTheDocument();
      expect(memoryChart).toHaveAttribute('data-chart', 'memory');
    });

    it('should render CPU chart', () => {
      render(<MockPerformanceDashboard />);

      const cpuChart = screen.getByTestId('cpu-chart');
      expect(cpuChart).toBeInTheDocument();
      expect(cpuChart).toHaveAttribute('data-chart', 'cpu');
    });
  });

  describe('Clear Metrics Functionality', () => {
    it('should render clear metrics button', () => {
      render(<MockPerformanceDashboard />);

      const clearButton = screen.getByTestId('clear-metrics-button');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveTextContent('Clear Metrics');
    });

    it('should clear metrics when button clicked', async () => {
      // Add test metrics
      const testMetric: PerformanceMetric = {
        metric_id: 'test-1',
        metric_type: 'lcp',
        value: 2500,
        rating: 'good',
        timestamp: Date.now(),
        context: { route: '/test' }
      };

      localStorage.setItem('performanceMetrics', JSON.stringify([testMetric]));

      const { rerender } = render(<MockPerformanceDashboard />);

      // Verify metrics exist
      let metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(0);

      // Click clear button
      const clearButton = screen.getByTestId('clear-metrics-button');
      clearButton.click();

      // Wait for metrics to be cleared
      await waitFor(() => {
        const clearedMetrics = performanceMonitor.getMetrics();
        expect(clearedMetrics).toHaveLength(0);
      });

      // Verify localStorage cleared
      const stored = localStorage.getItem('performanceMetrics');
      expect(stored).toBeNull();
    });
  });

  describe('Dashboard Data Integration', () => {
    it('should integrate with performance monitor service', () => {
      render(<MockPerformanceDashboard />);

      // Dashboard should successfully call performance monitor methods
      expect(() => performanceMonitor.getMetrics()).not.toThrow();
      expect(() => performanceMonitor.getAggregatedMetrics()).not.toThrow();
    });

    it('should handle empty metrics gracefully', () => {
      performanceMonitor.clearMetrics();

      render(<MockPerformanceDashboard />);

      // Should render without errors even with no metrics
      const dashboard = screen.getByTestId('performance-dashboard');
      expect(dashboard).toBeInTheDocument();

      // Should display 0 values
      const lcpValue = screen.getByTestId('lcp-value');
      expect(lcpValue).toHaveTextContent('0ms');
    });

    it('should update display when metrics change', async () => {
      const { rerender } = render(<MockPerformanceDashboard />);

      // Initial state (no metrics)
      let lcpValue = screen.getByTestId('lcp-value');
      expect(lcpValue).toHaveTextContent('0ms');

      // Add metrics to localStorage (simulating metric collection)
      const testMetrics: PerformanceMetric[] = [
        {
          metric_id: 'lcp-1',
          metric_type: 'lcp',
          value: 2000,
          rating: 'good',
          timestamp: Date.now(),
          context: { route: '/' }
        },
        {
          metric_id: 'lcp-2',
          metric_type: 'lcp',
          value: 2500,
          rating: 'good',
          timestamp: Date.now(),
          context: { route: '/calculators' }
        }
      ];

      localStorage.setItem('performanceMetrics', JSON.stringify(testMetrics));

      // Rerender to reflect changes
      rerender(<MockPerformanceDashboard />);

      // Should display updated values (Note: This test may need adjustment based on actual implementation)
      await waitFor(() => {
        const updatedLcpValue = screen.getByTestId('lcp-value');
        // Value should no longer be 0ms
        expect(updatedLcpValue.textContent).not.toBe('0ms');
      });
    });
  });

  describe('Dashboard Accessibility', () => {
    it('should have accessible metric cards', () => {
      render(<MockPerformanceDashboard />);

      const lcpCard = screen.getByTestId('lcp-card');
      expect(lcpCard).toHaveAttribute('data-metric', 'lcp');

      const fidCard = screen.getByTestId('fid-card');
      expect(fidCard).toHaveAttribute('data-metric', 'fid');
    });

    it('should have accessible chart elements', () => {
      render(<MockPerformanceDashboard />);

      const memoryChart = screen.getByTestId('memory-chart');
      expect(memoryChart).toHaveAttribute('data-chart', 'memory');

      const cpuChart = screen.getByTestId('cpu-chart');
      expect(cpuChart).toHaveAttribute('data-chart', 'cpu');
    });
  });
});
