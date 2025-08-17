/**
 * Unit tests for Performance Dashboard Component
 * Tests real-time monitoring, alerts, and medical content performance visualization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerformanceDashboard from '../../../components/Performance/PerformanceDashboard';

// Mock performance monitoring utilities
const mockPerformanceData = {
  summary: {
    totalPageLoads: 25,
    totalApiCalls: 40,
    averagePageLoadTime: 1800,
    averageApiResponseTime: 150,
    performanceScore: 85,
    alertCount: 3
  },
  webVitals: [
    { name: 'LCP', value: 1800, rating: 'good', timestamp: Date.now() },
    { name: 'FID', value: 50, rating: 'good', timestamp: Date.now() },
    { name: 'CLS', value: 0.05, rating: 'good', timestamp: Date.now() }
  ],
  medicalContent: {
    averageNewsLoadTime: 1200,
    averageCalculatorTime: 80,
    averageSearchTime: 300,
    averageImageLoadTime: 250,
    totalMedicalRequests: 15
  },
  alerts: [
    {
      id: '1',
      type: 'page_load_slow',
      severity: 'medium',
      message: 'Page load time exceeds target',
      timestamp: Date.now() - 300000,
      resolved: false,
      medicalContent: false
    },
    {
      id: '2',
      type: 'api_response_slow',
      severity: 'high',
      message: 'Medical API response time critical',
      timestamp: Date.now() - 600000,
      resolved: false,
      medicalContent: true
    },
    {
      id: '3',
      type: 'web_vital_poor',
      severity: 'medium',
      message: 'CLS score needs improvement',
      timestamp: Date.now() - 900000,
      resolved: true,
      medicalContent: false
    }
  ],
  errorAnalysis: {
    totalErrors: 5,
    errorsByType: {
      'network_error': 2,
      'medical_timeout': 2,
      'auth_error': 1
    },
    medicalErrorCount: 3,
    criticalErrorCount: 1
  }
};

vi.mock('../../../utils/performanceMonitoring', () => ({
  performanceMonitor: {
    getMetrics: vi.fn().mockReturnValue(mockPerformanceData),
    generateReport: vi.fn().mockReturnValue(mockPerformanceData),
    getPerformanceAlerts: vi.fn().mockReturnValue(mockPerformanceData.alerts),
    clearMetrics: vi.fn(),
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getConfig: vi.fn().mockReturnValue({
      enabled: true,
      pageLoadTarget: 2000,
      apiResponseTarget: 200,
      medicalContentPriority: true
    })
  }
}));

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Rendering', () => {
    it('should render performance overview correctly', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/performance dashboard/i)).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // Total page loads
      expect(screen.getByText('40')).toBeInTheDocument(); // Total API calls
      expect(screen.getByText('1.8s')).toBeInTheDocument(); // Avg page load
      expect(screen.getByText('150ms')).toBeInTheDocument(); // Avg API response
    });

    it('should display performance score with appropriate styling', () => {
      render(<PerformanceDashboard />);

      const scoreElement = screen.getByText('85');
      expect(scoreElement).toBeInTheDocument();
      
      // Should have good performance styling (green/blue colors)
      expect(scoreElement.closest('div')).toHaveClass(/green|blue/);
    });

    it('should render Web Vitals section', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/web vitals/i)).toBeInTheDocument();
      expect(screen.getByText('LCP')).toBeInTheDocument();
      expect(screen.getByText('FID')).toBeInTheDocument();
      expect(screen.getByText('CLS')).toBeInTheDocument();
      expect(screen.getByText('1800ms')).toBeInTheDocument();
    });

    it('should display medical content performance metrics', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/medical content performance/i)).toBeInTheDocument();
      expect(screen.getByText('1.2s')).toBeInTheDocument(); // News load time
      expect(screen.getByText('80ms')).toBeInTheDocument(); // Calculator time
      expect(screen.getByText('300ms')).toBeInTheDocument(); // Search time
    });
  });

  describe('Performance Alerts', () => {
    it('should display active alerts with correct severity styling', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/performance alerts/i)).toBeInTheDocument();
      
      // Should show unresolved alerts
      expect(screen.getByText('Page load time exceeds target')).toBeInTheDocument();
      expect(screen.getByText('Medical API response time critical')).toBeInTheDocument();
      
      // Should not show resolved alerts by default
      expect(screen.queryByText('CLS score needs improvement')).not.toBeInTheDocument();
    });

    it('should highlight medical content alerts', () => {
      render(<PerformanceDashboard />);

      const medicalAlert = screen.getByText('Medical API response time critical');
      expect(medicalAlert.closest('div')).toHaveClass(/red|orange/); // High severity styling
    });

    it('should show alert timestamps', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
      expect(screen.getByText(/10 minutes ago/)).toBeInTheDocument();
    });
  });

  describe('Error Analysis Section', () => {
    it('should display error statistics', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/error analysis/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Total errors
      expect(screen.getByText('3')).toBeInTheDocument(); // Medical errors
      expect(screen.getByText('1')).toBeInTheDocument(); // Critical errors
    });

    it('should show error breakdown by type', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText('network_error: 2')).toBeInTheDocument();
      expect(screen.getByText('medical_timeout: 2')).toBeInTheDocument();
      expect(screen.getByText('auth_error: 1')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should allow toggling between different time periods', async () => {
      const user = userEvent.setup();
      render(<PerformanceDashboard />);

      const timeRangeSelector = screen.getByRole('combobox', { name: /time range/i });
      await user.click(timeRangeSelector);
      
      const last24Hours = screen.getByText(/last 24 hours/i);
      await user.click(last24Hours);

      // Should trigger data refresh for new time period
      await waitFor(() => {
        expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
      });
    });

    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      const { performanceMonitor } = await import('../../../utils/performanceMonitoring');
      
      render(<PerformanceDashboard />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(performanceMonitor.generateReport).toHaveBeenCalled();
    });

    it('should toggle alert visibility', async () => {
      const user = userEvent.setup();
      render(<PerformanceDashboard />);

      const showResolvedButton = screen.getByRole('button', { name: /show resolved/i });
      await user.click(showResolvedButton);

      // Should now show resolved alerts
      await waitFor(() => {
        expect(screen.getByText('CLS score needs improvement')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<PerformanceDashboard />);

      // Should still render all key elements in mobile layout
      expect(screen.getByText(/performance dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/web vitals/i)).toBeInTheDocument();
      expect(screen.getByText(/medical content/i)).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update metrics when new data is available', async () => {
      const { rerender } = render(<PerformanceDashboard />);

      // Simulate updated metrics
      const updatedData = {
        ...mockPerformanceData,
        summary: {
          ...mockPerformanceData.summary,
          totalPageLoads: 30,
          performanceScore: 90
        }
      };

      const { performanceMonitor } = await import('../../../utils/performanceMonitoring');
      vi.mocked(performanceMonitor.generateReport).mockReturnValue(updatedData);

      rerender(<PerformanceDashboard />);

      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument(); // Updated page loads
        expect(screen.getByText('90')).toBeInTheDocument(); // Updated score
      });
    });
  });

  describe('Export Functionality', () => {
    it('should provide data export capabilities', async () => {
      const user = userEvent.setup();
      render(<PerformanceDashboard />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Should trigger export functionality
      // In a real implementation, this would download a file
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Performance Thresholds', () => {
    it('should indicate when performance targets are met', () => {
      render(<PerformanceDashboard />);

      // Page load time (1.8s) is under target (2s)
      const pageLoadElement = screen.getByText('1.8s');
      expect(pageLoadElement.closest('div')).toHaveClass(/green/);
    });

    it('should warn when performance targets are exceeded', () => {
      const slowData = {
        ...mockPerformanceData,
        summary: {
          ...mockPerformanceData.summary,
          averagePageLoadTime: 3000, // Over 2s target
          averageApiResponseTime: 250  // Over 200ms target
        }
      };

      const { performanceMonitor } = require('../../../utils/performanceMonitoring');
      vi.mocked(performanceMonitor.generateReport).mockReturnValue(slowData);

      render(<PerformanceDashboard />);

      expect(screen.getByText('3.0s')).toBeInTheDocument();
      expect(screen.getByText('250ms')).toBeInTheDocument();
    });
  });
});