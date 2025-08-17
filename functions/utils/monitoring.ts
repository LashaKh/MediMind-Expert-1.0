/**
 * Monitoring and Analytics Utility for MediMind Expert Functions
 * Tracks performance, usage patterns, and medical content quality
 */

import { logInfo, logWarning, logError } from './logger';

// Performance metrics tracking
interface PerformanceMetric {
  functionName: string;
  duration: number;
  timestamp: number;
  success: boolean;
  errorType?: string;
  userId?: string;
  userType?: 'medical_professional' | 'standard' | 'admin';
  metadata?: Record<string, any>;
}

// Search analytics tracking
interface SearchAnalytic {
  userId: string;
  query: string;
  queryLength: number;
  providers: string[];
  resultCount: number;
  searchTime: number;
  cacheHit: boolean;
  specialty?: string;
  filters?: Record<string, any>;
  clickedResults?: string[];
  satisfaction?: number; // 1-5 scale
  timestamp: number;
}

// Medical content quality metrics
interface ContentQualityMetric {
  contentId: string;
  evidenceLevel: string;
  citationAccuracy: number; // 0-1 scale
  medicalAccuracy: number; // 0-1 scale 
  userFeedback?: 'helpful' | 'not_helpful' | 'incorrect';
  specialty: string;
  contentType: 'research_paper' | 'clinical_guideline' | 'drug_info' | 'other';
  timestamp: number;
}

// Error tracking
interface ErrorMetric {
  functionName: string;
  errorType: string;
  errorMessage: string;
  stack?: string;
  userId?: string;
  requestPath: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
}

// In-memory storage for metrics (in production, use proper monitoring service)
const performanceMetrics: PerformanceMetric[] = [];
const searchAnalytics: SearchAnalytic[] = [];
const contentQualityMetrics: ContentQualityMetric[] = [];
const errorMetrics: ErrorMetric[] = [];

// Configuration
const MONITORING_CONFIG = {
  maxMetricsInMemory: 10000,
  cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
  alertThresholds: {
    errorRate: 0.05, // 5%
    avgResponseTime: 10000, // 10 seconds
    searchFailureRate: 0.02, // 2%
    contentQualityScore: 0.8 // 80%
  },
  enabled: process.env.NODE_ENV !== 'test'
};

// Clean up old metrics to prevent memory issues
function cleanupOldMetrics(): void {
  const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
  
  const cleanArray = (arr: any[]) => {
    const originalLength = arr.length;
    const filtered = arr.filter(item => item.timestamp > cutoffTime);
    arr.length = 0;
    arr.push(...filtered);
    return originalLength - filtered.length;
  };
  
  const cleaned = {
    performance: cleanArray(performanceMetrics),
    search: cleanArray(searchAnalytics),
    contentQuality: cleanArray(contentQualityMetrics),
    errors: cleanArray(errorMetrics)
  };
  
  if (Object.values(cleaned).some(count => count > 0)) {
    logInfo('Metrics cleanup completed', cleaned);
  }
}

// Performance monitoring wrapper
export function trackPerformance<T>(
  functionName: string,
  userId?: string,
  userType?: 'medical_professional' | 'standard' | 'admin'
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]): Promise<T> {
      if (!MONITORING_CONFIG.enabled) {
        return method.apply(this, args);
      }
      
      const startTime = Date.now();
      let success = true;
      let errorType: string | undefined;
      let result: T;
      
      try {
        result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        
        const metric: PerformanceMetric = {
          functionName: `${functionName}.${propertyName}`,
          duration,
          timestamp: startTime,
          success,
          errorType,
          userId,
          userType,
          metadata: {
            args: args.length,
            resultSize: result ? JSON.stringify(result).length : 0
          }
        };
        
        trackPerformanceMetric(metric);
        
        // Log slow operations
        if (duration > MONITORING_CONFIG.alertThresholds.avgResponseTime) {
          logWarning('Slow operation detected', {
            function: metric.functionName,
            duration,
            threshold: MONITORING_CONFIG.alertThresholds.avgResponseTime
          });
        }
      }
    };
  };
}

// Track individual performance metric
export function trackPerformanceMetric(metric: PerformanceMetric): void {
  if (!MONITORING_CONFIG.enabled) return;
  
  performanceMetrics.push(metric);
  
  // Trigger cleanup if memory limit reached
  if (performanceMetrics.length > MONITORING_CONFIG.maxMetricsInMemory) {
    cleanupOldMetrics();
  }
  
  logInfo('Performance metric recorded', {
    function: metric.functionName,
    duration: metric.duration,
    success: metric.success
  });
}

// Track search analytics
export function trackSearchAnalytic(analytic: SearchAnalytic): void {
  if (!MONITORING_CONFIG.enabled) return;
  
  searchAnalytics.push(analytic);
  
  logInfo('Search analytic recorded', {
    userId: analytic.userId.substring(0, 8) + '...',
    queryLength: analytic.queryLength,
    providers: analytic.providers,
    resultCount: analytic.resultCount,
    cacheHit: analytic.cacheHit
  });
}

// Track content quality metrics
export function trackContentQuality(metric: ContentQualityMetric): void {
  if (!MONITORING_CONFIG.enabled) return;
  
  contentQualityMetrics.push(metric);
  
  // Alert on low quality content
  const overallQuality = (metric.citationAccuracy + metric.medicalAccuracy) / 2;
  if (overallQuality < MONITORING_CONFIG.alertThresholds.contentQualityScore) {
    logWarning('Low quality content detected', {
      contentId: metric.contentId,
      evidenceLevel: metric.evidenceLevel,
      overallQuality,
      specialty: metric.specialty
    });
  }
  
  logInfo('Content quality metric recorded', {
    contentId: metric.contentId,
    evidenceLevel: metric.evidenceLevel,
    overallQuality,
    specialty: metric.specialty
  });
}

// Track errors with severity levels
export function trackError(error: ErrorMetric): void {
  if (!MONITORING_CONFIG.enabled) return;
  
  errorMetrics.push(error);
  
  // Log based on severity
  const logData = {
    function: error.functionName,
    errorType: error.errorType,
    userId: error.userId?.substring(0, 8) + '...',
    path: error.requestPath,
    severity: error.severity
  };
  
  switch (error.severity) {
    case 'critical':
      logError('Critical error tracked', logData);
      break;
    case 'high':
      logError('High severity error tracked', logData);
      break;
    case 'medium':
      logWarning('Medium severity error tracked', logData);
      break;
    default:
      logInfo('Low severity error tracked', logData);
  }
}

// Get performance analytics
export function getPerformanceAnalytics(timeRangeMs: number = 60 * 60 * 1000): {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorsByType: Record<string, number>;
  slowRequests: number;
  requestsByFunction: Record<string, number>;
} {
  const cutoffTime = Date.now() - timeRangeMs;
  const relevantMetrics = performanceMetrics.filter(m => m.timestamp > cutoffTime);
  
  const totalRequests = relevantMetrics.length;
  const successfulRequests = relevantMetrics.filter(m => m.success).length;
  const avgResponseTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests || 0;
  
  const errorsByType: Record<string, number> = {};
  const requestsByFunction: Record<string, number> = {};
  let slowRequests = 0;
  
  relevantMetrics.forEach(metric => {
    // Count errors by type
    if (!metric.success && metric.errorType) {
      errorsByType[metric.errorType] = (errorsByType[metric.errorType] || 0) + 1;
    }
    
    // Count requests by function
    requestsByFunction[metric.functionName] = (requestsByFunction[metric.functionName] || 0) + 1;
    
    // Count slow requests
    if (metric.duration > MONITORING_CONFIG.alertThresholds.avgResponseTime) {
      slowRequests++;
    }
  });
  
  return {
    totalRequests,
    successRate: successfulRequests / totalRequests || 0,
    avgResponseTime,
    errorsByType,
    slowRequests,
    requestsByFunction
  };
}

// Get search analytics
export function getSearchAnalytics(timeRangeMs: number = 60 * 60 * 1000): {
  totalSearches: number;
  avgResultCount: number;
  avgSearchTime: number;
  cacheHitRate: number;
  topQueries: Array<{ query: string; count: number }>;
  searchesBySpecialty: Record<string, number>;
  providerUsage: Record<string, number>;
} {
  const cutoffTime = Date.now() - timeRangeMs;
  const relevantAnalytics = searchAnalytics.filter(a => a.timestamp > cutoffTime);
  
  const totalSearches = relevantAnalytics.length;
  const avgResultCount = relevantAnalytics.reduce((sum, a) => sum + a.resultCount, 0) / totalSearches || 0;
  const avgSearchTime = relevantAnalytics.reduce((sum, a) => sum + a.searchTime, 0) / totalSearches || 0;
  const cacheHits = relevantAnalytics.filter(a => a.cacheHit).length;
  
  // Top queries
  const queryCount: Record<string, number> = {};
  const searchesBySpecialty: Record<string, number> = {};
  const providerUsage: Record<string, number> = {};
  
  relevantAnalytics.forEach(analytic => {
    // Count queries
    const normalizedQuery = analytic.query.toLowerCase().trim();
    queryCount[normalizedQuery] = (queryCount[normalizedQuery] || 0) + 1;
    
    // Count by specialty
    if (analytic.specialty) {
      searchesBySpecialty[analytic.specialty] = (searchesBySpecialty[analytic.specialty] || 0) + 1;
    }
    
    // Count provider usage
    analytic.providers.forEach(provider => {
      providerUsage[provider] = (providerUsage[provider] || 0) + 1;
    });
  });
  
  const topQueries = Object.entries(queryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  
  return {
    totalSearches,
    avgResultCount,
    avgSearchTime,
    cacheHitRate: cacheHits / totalSearches || 0,
    topQueries,
    searchesBySpecialty,
    providerUsage
  };
}

// Get content quality analytics
export function getContentQualityAnalytics(timeRangeMs: number = 60 * 60 * 1000): {
  totalContentItems: number;
  avgCitationAccuracy: number;
  avgMedicalAccuracy: number;
  contentByEvidenceLevel: Record<string, number>;
  contentBySpecialty: Record<string, number>;
  userFeedbackSummary: Record<string, number>;
} {
  const cutoffTime = Date.now() - timeRangeMs;
  const relevantMetrics = contentQualityMetrics.filter(m => m.timestamp > cutoffTime);
  
  const totalContentItems = relevantMetrics.length;
  const avgCitationAccuracy = relevantMetrics.reduce((sum, m) => sum + m.citationAccuracy, 0) / totalContentItems || 0;
  const avgMedicalAccuracy = relevantMetrics.reduce((sum, m) => sum + m.medicalAccuracy, 0) / totalContentItems || 0;
  
  const contentByEvidenceLevel: Record<string, number> = {};
  const contentBySpecialty: Record<string, number> = {};
  const userFeedbackSummary: Record<string, number> = {};
  
  relevantMetrics.forEach(metric => {
    contentByEvidenceLevel[metric.evidenceLevel] = (contentByEvidenceLevel[metric.evidenceLevel] || 0) + 1;
    contentBySpecialty[metric.specialty] = (contentBySpecialty[metric.specialty] || 0) + 1;
    
    if (metric.userFeedback) {
      userFeedbackSummary[metric.userFeedback] = (userFeedbackSummary[metric.userFeedback] || 0) + 1;
    }
  });
  
  return {
    totalContentItems,
    avgCitationAccuracy,
    avgMedicalAccuracy,
    contentByEvidenceLevel,
    contentBySpecialty,
    userFeedbackSummary
  };
}

// Generate monitoring report
export function generateMonitoringReport(): {
  performance: ReturnType<typeof getPerformanceAnalytics>;
  search: ReturnType<typeof getSearchAnalytics>;
  contentQuality: ReturnType<typeof getContentQualityAnalytics>;
  alerts: string[];
  timestamp: number;
} {
  const performance = getPerformanceAnalytics();
  const search = getSearchAnalytics();
  const contentQuality = getContentQualityAnalytics();
  const alerts: string[] = [];
  
  // Check for alerts
  if (performance.successRate < (1 - MONITORING_CONFIG.alertThresholds.errorRate)) {
    alerts.push(`High error rate: ${((1 - performance.successRate) * 100).toFixed(2)}%`);
  }
  
  if (performance.avgResponseTime > MONITORING_CONFIG.alertThresholds.avgResponseTime) {
    alerts.push(`Slow average response time: ${performance.avgResponseTime.toFixed(0)}ms`);
  }
  
  const overallContentQuality = (contentQuality.avgCitationAccuracy + contentQuality.avgMedicalAccuracy) / 2;
  if (overallContentQuality < MONITORING_CONFIG.alertThresholds.contentQualityScore) {
    alerts.push(`Low content quality score: ${(overallContentQuality * 100).toFixed(1)}%`);
  }
  
  return {
    performance,
    search,
    contentQuality,
    alerts,
    timestamp: Date.now()
  };
}

// Initialize monitoring system
export function initializeMonitoring(): void {
  if (!MONITORING_CONFIG.enabled) {
    logInfo('Monitoring disabled for test environment');
    return;
  }
  
  // Set up periodic cleanup
  setInterval(cleanupOldMetrics, MONITORING_CONFIG.cleanupIntervalMs);
  
  logInfo('Monitoring system initialized', {
    maxMetricsInMemory: MONITORING_CONFIG.maxMetricsInMemory,
    cleanupInterval: MONITORING_CONFIG.cleanupIntervalMs,
    alertThresholds: MONITORING_CONFIG.alertThresholds
  });
}

// Export types for use in other modules
export type {
  PerformanceMetric,
  SearchAnalytic,
  ContentQualityMetric,
  ErrorMetric
};