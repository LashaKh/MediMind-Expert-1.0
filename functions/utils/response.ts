import { HandlerResponse } from '@netlify/functions';
import { getSecurityHeaders, SecurityOptions } from './security';
import { getCorsHeaders } from './cors';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export function createResponse<T = any>(
  statusCode: number,
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  origin?: string,
  securityOptions?: SecurityOptions
): HandlerResponse {
  const response: ApiResponse<T> = {
    success,
    statusCode,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error })
  };

  // Get security headers
  const securityHeaders = getSecurityHeaders(securityOptions);
  
  // Get CORS headers with proper origin validation (fix wildcard vulnerability)
  const corsHeaders = getCorsHeaders(origin);

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...securityHeaders,
      ...corsHeaders
    },
    body: JSON.stringify(response)
  };
}

export function successResponse<T = any>(
  data?: T,
  message?: string,
  statusCode: number = 200,
  origin?: string,
  securityOptions?: SecurityOptions
): HandlerResponse {
  return createResponse(statusCode, true, data, message, undefined, origin, securityOptions);
}

export function errorResponse(
  error: string,
  statusCode: number = 400,
  message?: string,
  origin?: string,
  securityOptions?: SecurityOptions
): HandlerResponse {
  return createResponse(statusCode, false, undefined, message, error, origin, securityOptions);
}

// Aliases for compatibility with search functions
export const createSuccessResponse = successResponse;
export const createErrorResponse = errorResponse; 