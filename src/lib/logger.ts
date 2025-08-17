/**
 * Client-side logger service for MediMind Expert
 * Provides environment-aware logging with sensitive data protection
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogSensitivity {
  PUBLIC = 0,
  INTERNAL = 1,
  SENSITIVE = 2,
  RESTRICTED = 3
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  userId?: string;
  data?: any;
  sensitivity?: LogSensitivity;
  context?: {
    component?: string;
    action?: string;
    specialty?: string;
  };
}

// Patterns for detecting sensitive information
const SENSITIVE_PATTERNS = [
  /key/i, /secret/i, /token/i, /password/i, /auth/i, /credential/i,
  /api[-_]?key/i, /access[-_]?token/i, /refresh[-_]?token/i, /jwt/i,
  /bearer/i, /authorization/i, /x-api-key/i, /openai/i, /elevenlabs/i,
  /supabase/i, /service[-_]?role/i, /patient/i, /medical[-_]?record/i
];

// Specific field names that should always be redacted
const SENSITIVE_FIELD_NAMES = [
  'apiKey', 'api_key', 'accessToken', 'access_token', 'refreshToken', 'refresh_token',
  'password', 'secret', 'jwtSecret', 'jwt_secret', 'bearerToken', 'bearer_token',
  'authorization', 'x-api-key', 'openai_api_key', 'elevenlabs_api_key', 'supabase_key',
  'service_role_key', 'anon_key', 'patientId', 'patient_id', 'medicalRecordNumber',
  'mrn', 'ssn', 'dob', 'dateOfBirth'
];

// URLs that may contain sensitive information
const SENSITIVE_URL_PATTERNS = [
  /api\.openai\.com/i, /api\.play\.ai/i, /supabase\.co/i,
  /flowise/i, /brave\.com/i, /perplexity\.ai/i
];

class ClientLogger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private userId: string | null = null;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Sanitizes log data by redacting sensitive information
   */
  private sanitizeLogData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle strings - check for URLs and sensitive patterns
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeLogData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const sanitized: any = {};
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Check if the key itself is sensitive
          if (this.isSensitiveField(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            // Recursively sanitize the value
            sanitized[key] = this.sanitizeLogData(data[key]);
          }
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Checks if a field name is sensitive
   */
  private isSensitiveField(fieldName: string): boolean {
    // Check exact matches first
    if (SENSITIVE_FIELD_NAMES.includes(fieldName)) {
      return true;
    }

    // Check pattern matches
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(fieldName));
  }

  /**
   * Sanitizes strings that may contain sensitive information
   */
  private sanitizeString(str: string): string {
    let sanitized = str;

    // Redact URLs that may contain sensitive information
    SENSITIVE_URL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED_URL]');
    });

    // Redact potential API keys, tokens, etc. in string content
    sanitized = sanitized.replace(/(\w*(?:key|token|secret|password|auth)\w*)[=:\s]+[\w\-_.]+/gi, '$1=[REDACTED]');
    
    // Redact bearer tokens
    sanitized = sanitized.replace(/bearer\s+[\w\-_.]+/gi, 'Bearer [REDACTED]');
    
    // Redact basic auth
    sanitized = sanitized.replace(/basic\s+[\w\-_.]+/gi, 'Basic [REDACTED]');

    return sanitized;
  }

  /**
   * Determines if data should be logged based on sensitivity and environment
   */
  private shouldLogSensitiveData(sensitivity: LogSensitivity): boolean {
    // In production, never log RESTRICTED data
    if (!this.isDevelopment && sensitivity === LogSensitivity.RESTRICTED) {
      return false;
    }

    // In production, limit SENSITIVE data logging
    if (!this.isDevelopment && sensitivity === LogSensitivity.SENSITIVE) {
      return false;
    }

    return true;
  }

  private formatLog(
    level: string, 
    message: string, 
    data?: any, 
    sensitivity: LogSensitivity = LogSensitivity.INTERNAL,
    context?: LogEntry['context']
  ): LogEntry {
    // Sanitize the message itself
    const sanitizedMessage = this.sanitizeString(message);
    
    // Sanitize the data if present
    const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
    
    return {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      ...(this.userId && { userId: this.userId }),
      ...(sanitizedData && { data: sanitizedData }),
      ...(context && { context }),
      sensitivity
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private output(logEntry: LogEntry): void {
    // In development, use pretty console output
    if (this.isDevelopment) {
      const contextStr = logEntry.context 
        ? ` [${logEntry.context.component || ''}${logEntry.context.action ? ':' + logEntry.context.action : ''}]`
        : '';
      
      const prefix = `[${logEntry.timestamp}] ${logEntry.level}${contextStr}:`;
      
      switch (logEntry.level) {
        case 'ERROR':
          console.error(prefix, logEntry.message, logEntry.data || '');
          break;
        case 'WARN':
          console.warn(prefix, logEntry.message, logEntry.data || '');
          break;
        case 'INFO':
          console.info(prefix, logEntry.message, logEntry.data || '');
          break;
        case 'DEBUG':
        default:
          console.log(prefix, logEntry.message, logEntry.data || '');
          break;
      }
    } else {
      // In production, output structured JSON (if needed for remote logging)
      // For now, we'll suppress debug logs in production
      if (logEntry.level !== 'DEBUG') {
        const logString = JSON.stringify(logEntry);
        
        // In future, this could send to a remote logging service
        // For now, we'll just output to console in production
        switch (logEntry.level) {
          case 'ERROR':
            console.error(logString);
            break;
          case 'WARN':
            console.warn(logString);
            break;
          case 'INFO':
            console.info(logString);
            break;
        }
      }
    }
  }

  debug(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logEntry = this.formatLog('DEBUG', message, data, LogSensitivity.INTERNAL, context);
      this.output(logEntry);
    }
  }

  info(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = this.formatLog('INFO', message, data, LogSensitivity.INTERNAL, context);
      this.output(logEntry);
    }
  }

  warn(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logEntry = this.formatLog('WARN', message, data, LogSensitivity.SENSITIVE, context);
      this.output(logEntry);
    }
  }

  error(message: string, error?: Error | any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const data = error instanceof Error 
        ? { 
            name: error.name, 
            message: error.message, 
            stack: this.isDevelopment ? error.stack : '[REDACTED]'
          }
        : error;
      
      const logEntry = this.formatLog('ERROR', message, data, LogSensitivity.SENSITIVE, context);
      this.output(logEntry);
    }
  }

  // Convenience methods for different sensitivity levels
  public(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logEntry = this.formatLog('INFO', message, data, LogSensitivity.PUBLIC, context);
      this.output(logEntry);
    }
  }

  sensitive(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.INFO) && this.shouldLogSensitiveData(LogSensitivity.SENSITIVE)) {
      const logEntry = this.formatLog('INFO', message, data, LogSensitivity.SENSITIVE, context);
      this.output(logEntry);
    }
  }

  restricted(message: string, data?: any, context?: LogEntry['context']): void {
    if (this.shouldLog(LogLevel.INFO) && this.shouldLogSensitiveData(LogSensitivity.RESTRICTED)) {
      const logEntry = this.formatLog('INFO', message, data, LogSensitivity.RESTRICTED, context);
      this.output(logEntry);
    }
  }

  // Performance monitoring helpers
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Medical-specific logging helpers
  clinical(message: string, data?: any, context?: LogEntry['context']): void {
    this.info(message, data, { ...context, component: 'clinical' });
  }

  calculator(calculatorName: string, action: string, data?: any): void {
    this.info(`Calculator: ${action}`, data, { 
      component: 'calculator', 
      action: calculatorName 
    });
  }

  api(endpoint: string, method: string, status?: number, duration?: number): void {
    this.debug('API call', {
      endpoint,
      method,
      status,
      duration: duration ? `${duration}ms` : undefined
    }, { component: 'api', action: method });
  }
}

// Create singleton logger instance
export const logger = new ClientLogger();

// Export convenience functions
export const logDebug = (message: string, data?: any, context?: LogEntry['context']) => 
  logger.debug(message, data, context);

export const logInfo = (message: string, data?: any, context?: LogEntry['context']) => 
  logger.info(message, data, context);

export const logWarn = (message: string, data?: any, context?: LogEntry['context']) => 
  logger.warn(message, data, context);

export const logError = (message: string, error?: Error | any, context?: LogEntry['context']) => 
  logger.error(message, error, context);

// Performance helpers
export const startTimer = (label: string) => logger.time(label);
export const endTimer = (label: string) => logger.timeEnd(label);

// Medical-specific helpers
export const logClinical = (message: string, data?: any, context?: LogEntry['context']) => 
  logger.clinical(message, data, context);

export const logCalculator = (calculatorName: string, action: string, data?: any) => 
  logger.calculator(calculatorName, action, data);

export const logApi = (endpoint: string, method: string, status?: number, duration?: number) => 
  logger.api(endpoint, method, status, duration);

export default logger;