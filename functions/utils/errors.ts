import { HandlerResponse } from '@netlify/functions';
import { STATUS_CODES, ERROR_MESSAGES } from './constants';
import { errorResponse } from './response';

// Custom Error Classes
export class ValidationError extends Error {
  public statusCode: number = STATUS_CODES.BAD_REQUEST;
  public fields: string[];

  constructor(message: string, fields: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class AuthenticationError extends Error {
  public statusCode: number = STATUS_CODES.UNAUTHORIZED;

  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED_ACCESS) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  public statusCode: number = STATUS_CODES.FORBIDDEN;

  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  public statusCode: number = STATUS_CODES.NOT_FOUND;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  public statusCode: number = STATUS_CODES.CONFLICT;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error {
  public statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR;

  constructor(message: string = ERROR_MESSAGES.INTERNAL_ERROR) {
    super(message);
    this.name = 'InternalServerError';
  }
}

// Error Handler Function
export function handleError(error: unknown): HandlerResponse {
  console.error('Function error:', error);

  // Handle custom errors
  if (error instanceof ValidationError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.fields.length > 0 ? `Missing fields: ${error.fields.join(', ')}` : undefined
    );
  }

  if (error instanceof AuthenticationError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof AuthorizationError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof NotFoundError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ConflictError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof InternalServerError) {
    return errorResponse(error.message, error.statusCode);
  }

  // Handle generic errors
  if (error instanceof Error) {
    return errorResponse(
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }

  // Handle unknown errors
  return errorResponse(
    ERROR_MESSAGES.INTERNAL_ERROR,
    STATUS_CODES.INTERNAL_SERVER_ERROR
  );
}

// Async error wrapper
export function withErrorHandling<T>(
  handler: (event: any) => Promise<HandlerResponse>
) {
  return async (event: any): Promise<HandlerResponse> => {
    try {
      return await handler(event);
    } catch (error) {
      return handleError(error);
    }
  };
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 