import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeSentry = () => {
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: isProduction ? 'production' : 'development',
    integrations: [
      new BrowserTracing({
        // Medical workflow performance tracking
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          window.React?.useEffect,
          window.ReactRouterDOM?.useLocation,
          window.ReactRouterDOM?.useNavigationType,
          window.ReactRouterDOM?.createRoutesFromChildren,
          window.ReactRouterDOM?.matchRoutes
        ),
      }),
      new Sentry.Replay({
        // Strict privacy for medical applications
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
        // Only capture replays on errors
        sessionSampleRate: 0,
        errorSampleRate: 1.0,
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    
    // Session replay configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Medical data protection
    beforeSend(event, hint) {
      // Filter out sensitive medical information
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value) {
          // Check for medical data patterns
          const sensitivePatterns = [
            /patient/i,
            /medical record/i,
            /diagnosis/i,
            /prescription/i,
            /treatment/i,
            /healthcare/i,
            /phi/i, // Protected Health Information
            /ssn/i,
            /social security/i,
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
            /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card pattern
          ];
          
          if (sensitivePatterns.some(pattern => pattern.test(error.value))) {
            // Sanitize the error message
            event.exception.values[0].value = '[SANITIZED] Medical data error - check logs';
          }
        }
      }
      
      // Filter breadcrumbs for sensitive data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.message?.includes('patient') || breadcrumb.message?.includes('medical')) {
            return {
              ...breadcrumb,
              message: '[SANITIZED] Medical operation',
              data: { sanitized: true }
            };
          }
          return breadcrumb;
        });
      }
      
      return event;
    },
    
    // Tag all events for medical application
    initialScope: {
      tags: {
        application: 'medimind-expert',
        type: 'medical-platform',
        environment: isProduction ? 'production' : 'development'
      }
    }
  });
};

// Medical-specific error tracking
export const captureUserError = (error: Error, context: {
  feature?: string;
  specialty?: string;
  calculatorType?: string;
  searchQuery?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_category', 'user_operation');
    scope.setLevel('warning');
    
    // Safe context that doesn't include medical data
    scope.setContext('operation_context', {
      feature: context.feature,
      specialty: context.specialty,
      calculator_type: context.calculatorType,
      has_search_query: !!context.searchQuery, // Boolean only
      timestamp: Date.now()
    });
    
    Sentry.captureException(error);
  });
};

// System error tracking  
export const captureSystemError = (error: Error, context: {
  component?: string;
  function?: string;
  apiEndpoint?: string;
  operation?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_category', 'system_operation');
    scope.setLevel('error');
    
    scope.setContext('system_context', {
      component: context.component,
      function: context.function,
      api_endpoint: context.apiEndpoint,
      operation: context.operation,
      timestamp: Date.now()
    });
    
    Sentry.captureException(error);
  });
};

// Performance monitoring for critical medical workflows
export const trackPerformanceMetric = (
  operation: string, 
  duration: number, 
  context?: {
    specialty?: string;
    feature?: string;
    resultCount?: number;
  }
) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${operation}`,
    level: 'info',
    category: 'performance',
    data: {
      duration_ms: duration,
      operation,
      specialty: context?.specialty,
      feature: context?.feature,
      result_count: context?.resultCount,
      timestamp: Date.now()
    }
  });

  // Alert on slow medical operations that could impact patient care
  if (duration > 5000) {
    Sentry.captureMessage(
      `Slow medical operation: ${operation} took ${duration}ms`,
      'warning'
    );
  }
};

// Medical calculator accuracy monitoring
export const trackCalculatorMetrics = (
  calculatorType: string,
  executionTime: number,
  inputValidation: boolean,
  resultGenerated: boolean
) => {
  Sentry.addBreadcrumb({
    message: `Calculator: ${calculatorType}`,
    level: 'info',
    category: 'medical_calculator',
    data: {
      calculator_type: calculatorType,
      execution_time_ms: executionTime,
      input_valid: inputValidation,
      result_generated: resultGenerated,
      timestamp: Date.now()
    }
  });

  // Critical alert for calculator failures
  if (!resultGenerated && inputValidation) {
    Sentry.captureMessage(
      `Calculator failure: ${calculatorType} failed to generate result with valid input`,
      'error'
    );
  }
};

// API health monitoring
export const trackApiHealth = (
  endpoint: string,
  responseTime: number,
  statusCode: number,
  provider?: string
) => {
  Sentry.addBreadcrumb({
    message: `API: ${endpoint}`,
    level: statusCode >= 400 ? 'error' : 'info',
    category: 'api_health',
    data: {
      endpoint,
      provider,
      response_time_ms: responseTime,
      status_code: statusCode,
      timestamp: Date.now()
    }
  });

  // Alert on API failures affecting medical workflows
  if (statusCode >= 500) {
    Sentry.captureMessage(
      `API failure: ${endpoint} returned ${statusCode}`,
      'error'
    );
  } else if (responseTime > 10000) {
    Sentry.captureMessage(
      `Slow API response: ${endpoint} took ${responseTime}ms`,
      'warning'
    );
  }
};

// User session monitoring (privacy-compliant)
export const trackUserSession = (action: string, context: {
  specialty?: string;
  feature?: string;
  duration?: number;
}) => {
  Sentry.addBreadcrumb({
    message: `User action: ${action}`,
    level: 'info',
    category: 'user_interaction',
    data: {
      action,
      specialty: context.specialty,
      feature: context.feature,
      duration_ms: context.duration,
      timestamp: Date.now()
    }
  });
};