import * as Sentry from '@sentry/react';

// Production monitoring configuration for medical application
export const initializeMonitoring = () => {
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (isProduction && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: 'production',
      integrations: [
        new Sentry.BrowserTracing({
          // Medical workflow tracking
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
        new Sentry.Replay({
          // Mask sensitive medical data
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      ],
      // Performance monitoring for medical workflows
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Medical data protection
      beforeSend(event) {
        // Filter out sensitive medical information
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('patient') || error?.value?.includes('medical')) {
            return null; // Don't send medical data to Sentry
          }
        }
        return event;
      },
      
      // Tag medical events for filtering
      initialScope: {
        tags: {
          application: 'medimind-expert',
          type: 'medical-platform'
        }
      }
    });
  }
};

// Medical-specific error tracking
export const trackMedicalError = (error: Error, context: {
  calculatorType?: string;
  specialty?: string;
  userId?: string;
  sessionId?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'medical_operation');
    scope.setContext('medical_context', {
      calculator: context.calculatorType,
      specialty: context.specialty,
      // Never include actual medical data
      has_user_id: !!context.userId,
      session_id: context.sessionId?.substring(0, 8) // Partial session ID only
    });
    Sentry.captureException(error);
  });
};

// Performance monitoring for medical workflows
export const trackPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${operation}`,
    level: 'info',
    data: {
      duration_ms: duration,
      operation_type: 'medical_workflow',
      ...metadata
    }
  });

  // Log slow medical operations
  if (duration > 3000) {
    console.warn(`Slow medical operation: ${operation} took ${duration}ms`);
  }
};

// User interaction tracking (privacy-compliant)
export const trackUserInteraction = (action: string, component: string, metadata?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: `User interaction: ${action}`,
    level: 'info',
    data: {
      component,
      action,
      timestamp: Date.now(),
      ...metadata
    }
  });
};

// API performance monitoring
export const trackApiCall = (endpoint: string, duration: number, status: number) => {
  Sentry.addBreadcrumb({
    message: `API call: ${endpoint}`,
    level: status >= 400 ? 'error' : 'info',
    data: {
      endpoint,
      duration_ms: duration,
      status_code: status,
      type: 'api_call'
    }
  });
  
  // Alert on API performance issues
  if (duration > 5000 || status >= 500) {
    Sentry.captureMessage(`API performance issue: ${endpoint} - ${duration}ms - ${status}`, 'warning');
  }
};

// Medical calculator validation tracking
export const trackCalculatorValidation = (calculatorType: string, result: any, isValid: boolean) => {
  Sentry.addBreadcrumb({
    message: `Calculator validation: ${calculatorType}`,
    level: isValid ? 'info' : 'error',
    data: {
      calculator_type: calculatorType,
      validation_result: isValid,
      has_result: !!result,
      timestamp: Date.now()
    }
  });
  
  if (!isValid) {
    Sentry.captureMessage(`Calculator validation failed: ${calculatorType}`, 'error');
  }
};