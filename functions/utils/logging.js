/**
 * Logging utilities wrapper for JavaScript imports
 * Re-exports from logger.ts for compatibility
 */

// Import TypeScript utilities
import { 
  logger,
  LogLevel,
  LogSensitivity,
  generateRequestId,
  withRequestLogging,
  logPerformance,
  logDatabaseQuery,
  logApiCall
} from './logger.js';

// Simple logging functions
export function logInfo(message, metadata = {}) {
  return logger.info(message, metadata);
}

export function logError(message, error = null, metadata = {}) {
  return logger.error(message, { error, ...metadata });
}

export function logWarning(message, metadata = {}) {
  return logger.warn(message, metadata);
}

export function logDebug(message, metadata = {}) {
  return logger.debug(message, metadata);
}

export function logApiRequest(endpoint, method, duration, statusCode, metadata = {}) {
  return logApiCall(endpoint, method, duration, statusCode, metadata);
}

// Re-export all logging utilities
export {
  logger,
  LogLevel,
  LogSensitivity,
  generateRequestId,
  withRequestLogging,
  logPerformance,
  logDatabaseQuery,
  logApiCall
};