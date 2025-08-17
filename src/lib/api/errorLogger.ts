import { ErrorContext, StandardErrorResponse } from './errorHandler';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error types for logging
export enum LoggedErrorType {
  JAVASCRIPT = 'javascript',
  API = 'api',
  NETWORK = 'network',
  USER_ACTION = 'user_action',
  PERFORMANCE = 'performance'
}

// User context interface
export interface UserContext {
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  sessionId?: string;
  userRole?: string;
  browserInfo: {
    name: string;
    version: string;
    platform: string;
  };
  screenResolution: string;
  viewportSize: string;
  memoryUsage?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number; };
  connectionType?: string;
}

// Error log entry interface
export interface ErrorLogEntry {
  id: string;
  type: LoggedErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  sessionId: string;
  fingerprint?: string;
  lineNumber?: number;
  userContext?: UserContext;
  additionalData?: Record<string, unknown>;
}

// Error log configuration
export interface ErrorLoggerConfig {
  endpoint?: string;
  apiKey?: string;
  maxLogSize: number;
  batchSize: number;
  flushInterval: number;
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  sensitiveDataPatterns: RegExp[];
  ignoredErrors: RegExp[];
}

// Default configuration
const DEFAULT_CONFIG: ErrorLoggerConfig = {
  maxLogSize: 100,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  enableConsoleLogging: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  enableLocalStorage: true,
  sensitiveDataPatterns: [
    /password/i,
    /ssn/i,
    /social.security/i,
    /credit.card/i,
    /api.key/i,
    /token/i,
    /secret/i,
    /medical.record/i,
    /patient.id/i
  ],
  ignoredErrors: [
    /Script error/i,
    /Non-Error promise rejection captured/i,
    /ResizeObserver loop limit exceeded/i,
    /Loading chunk \d+ failed/i,
    /Performance impact:.*ms task/i // Ignore performance logs in ignored patterns
  ]
};

class ErrorLogger {
  private config: ErrorLoggerConfig;
  private logs: ErrorLogEntry[] = [];
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;
  private isSetup = false;
  private maxLogs = 100;

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    if (this.isSetup) return;
    this.isSetup = true;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: LoggedErrorType.JAVASCRIPT,
        severity: ErrorSeverity.HIGH,
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: LoggedErrorType.JAVASCRIPT,
        severity: ErrorSeverity.HIGH,
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href
      });
    });

    // Handle React errors (will be integrated with ErrorBoundary)
    this.setupReactErrorHandler();

    // Performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupReactErrorHandler(): void {
    // This will be called from the ErrorBoundary component
    (window as { __MEDIMIND_ERROR_LOGGER__?: ErrorLogger }).__MEDIMIND_ERROR_LOGGER__ = this;
  }

  private setupPerformanceMonitoring(): void {
    // Skip performance monitoring if disabled via environment variable
    if (import.meta.env.VITE_DISABLE_PERFORMANCE_MONITORING === 'true') {
      console.log('Performance monitoring disabled via VITE_DISABLE_PERFORMANCE_MONITORING');
      return;
    }

    // Monitor long tasks with improved filtering
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Only report truly critical performance issues:
            // - High: 2000ms+ (significantly impacts UX)
            // - Critical: 5000ms+ (unacceptable delays)
            if (entry.duration > 2000) {
              // Enhanced filtering for expected long tasks
              const isExpectedLongTask = 
                // Initialization tasks
                entry.name?.includes('script') || 
                entry.name?.includes('translation') ||
                entry.name?.includes('load') ||
                entry.name?.includes('compile') ||
                entry.startTime < 30000 || // First 30 seconds of page load
                
                // Development mode overhead
                (process.env.NODE_ENV === 'development' && entry.startTime < 60000) ||
                
                // Known acceptable long tasks
                entry.name === 'self' || // Browser internal processing
                entry.name?.includes('import') ||
                entry.name?.includes('bundle') ||
                
                // Network-related delays (expected for search, API calls)
                window.location.pathname.includes('/search') ||
                
                // Language loading (expected to be slow)
                document.querySelector('[data-loading="language"]');
              
              if (!isExpectedLongTask) {
                this.logError({
                  type: LoggedErrorType.PERFORMANCE,
                  severity: entry.duration > 5000 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
                  message: `Performance impact: ${Math.round(entry.duration)}ms task`,
                  additionalData: {
                    duration: Math.round(entry.duration),
                    startTime: Math.round(entry.startTime),
                    name: entry.name,
                    context: 'longtask',
                    url: window.location.pathname
                  }
                });
              }
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  private getUserContext(): UserContext {
    const navigator = window.navigator;
    const screen = window.screen;
    
    // Parse user agent for browser info
    const userAgent = navigator.userAgent;
    const browserInfo = this.parseBrowserInfo(userAgent);
    
    return {
      userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      browserInfo,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      memoryUsage: (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory ? {
        usedJSHeapSize: (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.jsHeapSizeLimit
      } : undefined,
      connectionType: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
    };
  }

  private parseBrowserInfo(userAgent: string): { name: string; version: string; platform: string } {
    const browsers = [
      { name: 'Chrome', regex: /Chrome\/(\d+)/ },
      { name: 'Firefox', regex: /Firefox\/(\d+)/ },
      { name: 'Safari', regex: /Safari\/(\d+)/ },
      { name: 'Edge', regex: /Edge\/(\d+)/ },
      { name: 'Opera', regex: /Opera\/(\d+)/ }
    ];

    for (const browser of browsers) {
      const match = userAgent.match(browser.regex);
      if (match) {
        return {
          name: browser.name,
          version: match[1],
          platform: navigator.platform
        };
      }
    }

    return {
      name: 'Unknown',
      version: 'Unknown',
      platform: navigator.platform
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Remove sensitive information
      let sanitized = data;
      this.config.sensitiveDataPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      });
      return sanitized;
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.config.sensitiveDataPatterns.some(pattern => pattern.test(key))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoredErrors.some(pattern => pattern.test(message));
  }

  private generateFingerprint(entry: Partial<ErrorLogEntry>): string {
    const components = [
      entry.type,
      entry.message,
      entry.url,
      entry.lineNumber?.toString() || '',
      entry.stack?.split('\n')[0] || ''
    ];
    
    return btoa(components.join('|')).substr(0, 16);
  }

  public logError(errorData: {
    type: LoggedErrorType;
    severity: ErrorSeverity;
    message: string;
    stack?: string;
    url?: string;
    additionalData?: Record<string, unknown>;
  }): void {
    // Check if error should be ignored
    if (this.shouldIgnoreError(errorData.message)) {
      return;
    }

    const userContext = this.getUserContext();
    
    const logEntry: ErrorLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: errorData.type,
      severity: errorData.severity,
      message: this.sanitizeData(errorData.message),
      stack: errorData.stack ? this.sanitizeData(errorData.stack) : undefined,
      url: errorData.url || userContext.url,
      timestamp: new Date().toISOString(),
      userAgent: userContext.userAgent,
      sessionId: this.sessionId,
      userContext: userContext,
      additionalData: errorData.additionalData ? this.sanitizeData(errorData.additionalData) : undefined
    };

    logEntry.fingerprint = this.generateFingerprint(logEntry);

    this.addLogEntry(logEntry);
  }

  public logAPIError(standardError: StandardErrorResponse, requestData?: Record<string, unknown>): void {
    this.logError({
      type: LoggedErrorType.API,
      severity: standardError.statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      message: `API Error: ${standardError.message}`,
      additionalData: {
        statusCode: standardError.statusCode,
        errorType: standardError.type,
        context: standardError.context,
        requestData: requestData ? this.sanitizeData(requestData) : undefined
      }
    });
  }

  public logUserAction(action: string, context?: Record<string, unknown>): void {
    this.logError({
      type: LoggedErrorType.USER_ACTION,
      severity: ErrorSeverity.LOW,
      message: `User Action: ${action}`,
      additionalData: context ? this.sanitizeData(context) : undefined
    });
  }

  private addLogEntry(entry: ErrorLogEntry): void {
    if (this.config.enableConsoleLogging) {
      console.group(`🚨 Error Logger [${entry.severity.toUpperCase()}]`);
      console.error('Message:', entry.message);
      console.error('Type:', entry.type);
      console.error('Stack:', entry.stack);
      console.error('Context:', entry.userContext);
      console.error('Additional Data:', entry.additionalData);
      console.groupEnd();
    }

    this.logs.push(entry);

    // Maintain max log size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage if enabled
    if (this.config.enableLocalStorage) {
      try {
        localStorage.setItem('medimind_error_logs', JSON.stringify(this.logs.slice(-50))); // Store last 50 logs
      } catch (error) {
        console.warn('Failed to store error logs in localStorage:', error);
      }
    }

    // Auto-flush critical errors
    if (entry.severity === ErrorSeverity.CRITICAL) {
      this.flush();
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  public async flush(): Promise<void> {
    if (!this.config.enableRemoteLogging || this.logs.length === 0) {
      return;
    }

    const logsToSend = this.logs.splice(0, this.config.batchSize);
    
    try {
      await this.sendLogs(logsToSend);
    } catch (error) {
      console.error('[ErrorLogger] Failed to send error logs:', error);
      // Re-add logs to the beginning of the queue for retry
      this.logs.unshift(...logsToSend);
    }
  }

  private async sendLogs(logs: ErrorLogEntry[]): Promise<void> {
    if (!this.config.endpoint) {
      console.warn('[ErrorLogger] No logging endpoint configured');
      return;
    }

    const payload = {
      logs,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      }
    };

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  public getLogsSummary(): { total: number; bySeverity: Record<ErrorSeverity, number>; byType: Record<LoggedErrorType, number> } {
    const summary = {
      total: this.logs.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0
      },
      byType: {
        [LoggedErrorType.JAVASCRIPT]: 0,
        [LoggedErrorType.API]: 0,
        [LoggedErrorType.NETWORK]: 0,
        [LoggedErrorType.USER_ACTION]: 0,
        [LoggedErrorType.PERFORMANCE]: 0
      }
    };

    this.logs.forEach(log => {
      summary.bySeverity[log.severity]++;
      summary.byType[log.type]++;
    });

    return summary;
  }

  public clearLogs(): void {
    this.logs = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('medimind_error_logs');
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Send any remaining logs
  }

  public getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger({
  endpoint: process.env.VITE_ERROR_LOGGING_ENDPOINT,
  apiKey: process.env.VITE_ERROR_LOGGING_API_KEY,
  enableRemoteLogging: process.env.NODE_ENV === 'production'
});

// React hook for error logging
export const useErrorLogger = () => {
  return {
    logError: errorLogger.logError.bind(errorLogger),
    logAPIError: errorLogger.logAPIError.bind(errorLogger),
    logUserAction: errorLogger.logUserAction.bind(errorLogger),
    getLogs: errorLogger.getLogs.bind(errorLogger),
    getLogsSummary: errorLogger.getLogsSummary.bind(errorLogger),
    clearLogs: errorLogger.clearLogs.bind(errorLogger)
  };
};

// Helper function to integrate with ErrorBoundary
export const logReactError = (error: Error, errorInfo: React.ErrorInfo, additionalData?: Record<string, unknown>) => {
  errorLogger.logError({
    type: LoggedErrorType.JAVASCRIPT,
    severity: ErrorSeverity.CRITICAL,
    message: `React Error: ${error.message}`,
    stack: error.stack,
    additionalData: {
      componentStack: errorInfo.componentStack,
      ...additionalData
    }
  });
};

export default errorLogger; 