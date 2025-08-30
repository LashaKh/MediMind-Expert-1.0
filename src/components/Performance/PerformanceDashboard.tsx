/**
 * Performance Dashboard Component for Medical News Monitoring
 * Displays real-time performance metrics and alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { performanceMonitor, PerformanceReport, WebVital } from '../../utils/performanceMonitoring';

interface PerformanceStats {
  sessionId: string;
  metricsCount: number;
  vitalsCount: number;
  errorsCount: number;
  isMonitoring: boolean;
  medicalContentMetrics: number;
}

interface AlertThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  errorRate: number;
  clsScore: number;
  lcpTime: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;  
  metric?: string;
  value?: number;
  medicalContent?: boolean;
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const thresholds: AlertThresholds = {
    pageLoadTime: 2000, // 2 seconds
    apiResponseTime: 200, // 200ms
    errorRate: 0.05, // 5%
    clsScore: 0.25, // Poor CLS threshold
    lcpTime: 4000 // Poor LCP threshold
  };

  /**
   * Refresh performance data
   */
  const refreshData = useCallback(() => {
    try {
      const currentStats = performanceMonitor.getStats();
      setStats(currentStats);

      const currentReport = performanceMonitor.generateReport();
      setReport(currentReport);
      
      // Check for new alerts
      checkForAlerts(currentReport);
    } catch (error) {

    }
  }, []);

  /**
   * Check for performance alerts
   */
  const checkForAlerts = (report: PerformanceReport) => {
    const newAlerts: PerformanceAlert[] = [];

    // Check page load times
    const avgPageLoad = report.pageLoadMetrics
      .filter(m => m.name === 'full_page_load')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    if (avgPageLoad > thresholds.pageLoadTime) {
      newAlerts.push({
        id: `page-load-${Date.now()}`,
        type: avgPageLoad > thresholds.pageLoadTime * 2 ? 'critical' : 'warning',
        message: `Slow page load detected: ${Math.round(avgPageLoad)}ms`,
        timestamp: Date.now(),
        metric: 'page_load',
        value: avgPageLoad
      });
    }

    // Check API response times
    const avgApiResponse = report.apiMetrics
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    if (avgApiResponse > thresholds.apiResponseTime) {
      newAlerts.push({
        id: `api-response-${Date.now()}`,
        type: avgApiResponse > thresholds.apiResponseTime * 5 ? 'error' : 'warning',
        message: `Slow API responses: ${Math.round(avgApiResponse)}ms average`,
        timestamp: Date.now(),
        metric: 'api_response',
        value: avgApiResponse
      });
    }

    // Check Web Vitals
    report.webVitals.forEach(vital => {
      if (vital.rating === 'poor') {
        newAlerts.push({
          id: `vital-${vital.name}-${Date.now()}`,
          type: 'error',
          message: `Poor ${vital.name}: ${Math.round(vital.value)}${vital.name === 'CLS' ? '' : 'ms'}`,
          timestamp: Date.now(),
          metric: vital.name.toLowerCase(),
          value: vital.value
        });
      }
    });

    // Check medical content performance
    const medicalMetrics = report.pageLoadMetrics.filter(m => m.medicalContent);
    if (medicalMetrics.length > 0) {
      const avgMedicalLoad = medicalMetrics
        .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

      if (avgMedicalLoad > thresholds.pageLoadTime * 1.5) {
        newAlerts.push({
          id: `medical-content-${Date.now()}`,
          type: 'warning',
          message: `Slow medical content loading: ${Math.round(avgMedicalLoad)}ms`,
          timestamp: Date.now(),
          metric: 'medical_content',
          value: avgMedicalLoad,
          medicalContent: true
        });
      }
    }

    // Update alerts (keep only recent alerts)
    const recentAlerts = alerts.filter(alert => Date.now() - alert.timestamp < 300000); // 5 minutes
    setAlerts([...recentAlerts, ...newAlerts]);
  };

  /**
   * Get alert color class
   */
  const getAlertColorClass = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'error': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  /**
   * Get Web Vital rating color
   */
  const getVitalRatingColor = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  /**
   * Format time duration
   */
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  /**
   * Format percentage
   */
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Setup auto-refresh
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshInterval]);

  if (!stats || !report) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.slice(0, 3).map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${getAlertColorClass(alert.type)} shadow-lg max-w-sm`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{alert.message}</p>
                  {alert.medicalContent && (
                    <p className="text-xs mt-1 opacity-75">Medical Content</p>
                  )}
                </div>
                <button
                  onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${stats.isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div>
              <h3 className="font-medium text-gray-900">Performance</h3>
              <p className="text-xs text-gray-500">
                {stats.medicalContentMetrics} medical metrics tracked
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {alerts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            )}
            <svg 
              className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 max-w-md">
            {/* Session Info */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Session</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>ID: {stats.sessionId.split('_')[2]}</p>
                <p>Total Metrics: {stats.metricsCount}</p>
                <p>Medical Content: {stats.medicalContentMetrics}</p>
                <p>Errors: {stats.errorsCount}</p>
              </div>
            </div>

            {/* Web Vitals */}
            {report.webVitals.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Web Vitals</h4>
                <div className="space-y-2">
                  {report.webVitals.map(vital => (
                    <div key={vital.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{vital.name}</span>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getVitalRatingColor(vital.rating)}`}>
                          {vital.name === 'CLS' ? vital.value.toFixed(3) : formatDuration(vital.value)}
                        </span>
                        <p className={`text-xs ${getVitalRatingColor(vital.rating)}`}>
                          {vital.rating}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Content Performance */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Medical Content</h4>
              <div className="space-y-2 text-sm">
                {report.medicalContentPerformance.newsLoadTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">News Load</span>
                    <span className="font-medium">
                      {formatDuration(report.medicalContentPerformance.newsLoadTime)}
                    </span>
                  </div>
                )}
                {report.medicalContentPerformance.calculatorResponseTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calculator</span>
                    <span className="font-medium">
                      {formatDuration(report.medicalContentPerformance.calculatorResponseTime)}
                    </span>
                  </div>
                )}
                {report.medicalContentPerformance.searchResultsTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Search</span>
                    <span className="font-medium">
                      {formatDuration(report.medicalContentPerformance.searchResultsTime)}
                    </span>
                  </div>
                )}
                {report.medicalContentPerformance.imageLoadTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images</span>
                    <span className="font-medium">
                      {formatDuration(report.medicalContentPerformance.imageLoadTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Network & Device Info */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Connection: {report.networkInfo.effectiveType}</p>
                <p>RTT: {report.networkInfo.rtt}ms</p>
                {report.deviceInfo.memory && (
                  <p>Memory: {report.deviceInfo.memory}GB</p>
                )}
                {report.deviceInfo.cores && (
                  <p>Cores: {report.deviceInfo.cores}</p>
                )}
                <p>Device: {report.deviceInfo.isMobile ? 'Mobile' : report.deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  performanceMonitor.reportMetrics();
                  setAlerts([]);
                }}
                className="flex-1 bg-gray-600 text-white text-sm py-2 px-3 rounded hover:bg-gray-700 transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;