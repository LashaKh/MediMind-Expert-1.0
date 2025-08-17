import { HandlerEvent } from '@netlify/functions';
import { isDevelopment } from './env';

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
  requestId?: string;
  userId?: string;
  data?: any;
  sensitivity?: LogSensitivity;
}

// Patterns for detecting sensitive information
const SENSITIVE_PATTERNS = [
  /key/i, /secret/i, /token/i, /password/i, /auth/i, /credential/i,
  /api[-_]?key/i, /access[-_]?token/i, /refresh[-_]?token/i, /jwt/i,
  /bearer/i, /authorization/i, /x-api-key/i, /openai/i, /elevenlabs/i,
  /supabase/i, /service[-_]?role/i
];

// Specific field names that should always be redacted
const SENSITIVE_FIELD_NAMES = [
  'apiKey', 'api_key', 'accessToken', 'access_token', 'refreshToken', 'refresh_token',
  'password', 'secret', 'jwtSecret', 'jwt_secret', 'bearerToken', 'bearer_token',
  'authorization', 'x-api-key', 'openai_api_key', 'elevenlabs_api_key', 'supabase_key',
  'service_role_key', 'anon_key', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'JWT_SECRET'
];

// URLs that may contain sensitive information
const SENSITIVE_URL_PATTERNS = [
  /api\.openai\.com/i, /api\.play\.ai/i, /supabase\.co/i
];

class Logger {
  private logLevel: LogLevel;
  private requestId: string | null = null;

  constructor() {
    this.logLevel = isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO;
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
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
    // Match patterns like "key=abc123" or "token: xyz789"
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
    if (!isDevelopment() && sensitivity === LogSensitivity.RESTRICTED) {
      return false;
    }

    // In production, limit SENSITIVE data logging
    if (!isDevelopment() && sensitivity === LogSensitivity.SENSITIVE) {
      return false;
    }

    return true;
  }

  private formatLog(level: string, message: string, data?: any, sensitivity: LogSensitivity = LogSensitivity.INTERNAL): LogEntry {
    // Sanitize the message itself
    const sanitizedMessage = this.sanitizeString(message);
    
    // Sanitize the data if present
    const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
    
    return {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      ...(this.requestId && { requestId: this.requestId }),
      ...(sanitizedData && { data: sanitizedData }),
      sensitivity
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private output(logEntry: LogEntry): void {
    const logString = JSON.stringify(logEntry, null, isDevelopment() ? 2 : 0);
    
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
      case 'DEBUG':
      default:
        console.log(logString);
        break;
    }
  }

  debug(message: string, data?: any, sensitivity: LogSensitivity = LogSensitivity.INTERNAL): void {
    if (this.shouldLog(LogLevel.DEBUG) && this.shouldLogSensitiveData(sensitivity)) {
      const logEntry = this.formatLog('DEBUG', message, data, sensitivity);
      this.output(logEntry);
    }
  }

  info(message: string, data?: any, sensitivity: LogSensitivity = LogSensitivity.INTERNAL): void {
    if (this.shouldLog(LogLevel.INFO) && this.shouldLogSensitiveData(sensitivity)) {
      const logEntry = this.formatLog('INFO', message, data, sensitivity);
      this.output(logEntry);
    }
  }

  warn(message: string, data?: any, sensitivity: LogSensitivity = LogSensitivity.SENSITIVE): void {
    if (this.shouldLog(LogLevel.WARN) && this.shouldLogSensitiveData(sensitivity)) {
      const logEntry = this.formatLog('WARN', message, data, sensitivity);
      this.output(logEntry);
    }
  }

  error(message: string, error?: Error | any, sensitivity: LogSensitivity = LogSensitivity.SENSITIVE): void {
    if (this.shouldLog(LogLevel.ERROR) && this.shouldLogSensitiveData(sensitivity)) {
      const data = error instanceof Error 
        ? { 
            name: error.name, 
            message: error.message, 
            stack: isDevelopment() ? error.stack : '[REDACTED]' // Hide stack traces in production
          }
        : error;
      
      const logEntry = this.formatLog('ERROR', message, data, sensitivity);
      this.output(logEntry);
    }
  }

  // Convenience methods for different sensitivity levels
  public(message: string, data?: any): void {
    this.info(message, data, LogSensitivity.PUBLIC);
  }

  sensitive(message: string, data?: any): void {
    this.info(message, data, LogSensitivity.SENSITIVE);
  }

  restricted(message: string, data?: any): void {
    this.info(message, data, LogSensitivity.RESTRICTED);
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Request logging middleware
export function withRequestLogging<T>(
  handler: (event: HandlerEvent) => Promise<T>
) {
  return async (event: HandlerEvent): Promise<T> => {
    const requestId = generateRequestId();
    logger.setRequestId(requestId);

    const startTime = Date.now();
    
    // Log request start with sanitized headers and params
    logger.info('Request started', {
      method: event.httpMethod,
      path: event.path,
      userAgent: event.headers['user-agent'],
      origin: event.headers.origin,
      queryParams: event.queryStringParameters,
      // Note: headers are already sanitized by the sanitizeLogData method
      headersCount: Object.keys(event.headers || {}).length
    }, LogSensitivity.INTERNAL);

    try {
      const result = await handler(event);
      
      const duration = Date.now() - startTime;
      logger.info('Request completed successfully', {
        duration: `${duration}ms`
      }, LogSensitivity.PUBLIC);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Request failed', {
        duration: `${duration}ms`,
        errorType: error instanceof Error ? error.name : 'Unknown',
        // Error details are handled by the error method's sanitization
      }, error, LogSensitivity.SENSITIVE);
      
      throw error;
    }
  };
}

// Performance monitoring
export function logPerformance(operation: string, startTime: number): void {
  const duration = Date.now() - startTime;
  logger.debug(`Performance: ${operation}`, { duration: `${duration}ms` }, LogSensitivity.INTERNAL);
}

// Database query logging - be careful with sensitive data in queries
export function logDatabaseQuery(query: string, params?: any[], duration?: number): void {
  logger.debug('Database query executed', {
    query: query.replace(/\s+/g, ' ').trim(),
    paramCount: params ? params.length : 0,
    // Note: params are automatically sanitized by sanitizeLogData
    ...(isDevelopment() && params && { params }),
    ...(duration && { duration: `${duration}ms` })
  }, LogSensitivity.RESTRICTED);
}

// API call logging helper
export function logApiCall(url: string, method: string, statusCode?: number, duration?: number): void {
  logger.debug('API call made', {
    method,
    // URL is automatically sanitized to prevent credential exposure
    url,
    ...(statusCode && { statusCode }),
    ...(duration && { duration: `${duration}ms` })
  }, LogSensitivity.SENSITIVE);
}

// Aliases for compatibility with search functions
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarning = (message: string, data?: any) => logger.warn(message, data);
export const logError = (message: string, error?: Error | any) => logger.error(message, error); 