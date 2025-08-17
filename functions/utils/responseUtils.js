/**
 * Response utilities wrapper for JavaScript imports
 * Re-exports from response.ts for compatibility
 */

// Import TypeScript utilities
import { 
  createResponse,
  successResponse,
  errorResponse,
  createSuccessResponse,
  createErrorResponse
} from './response.js';

// Simple API response formatter
export function formatApiResponse(data, statusCode = 200, message = null) {
  return successResponse(data, message, statusCode);
}

export function formatErrorResponse(error, statusCode = 400, message = null) {
  return errorResponse(error, statusCode, message);
}

// Re-export all response utilities
export {
  createResponse,
  successResponse,
  errorResponse,
  createSuccessResponse,
  createErrorResponse
};