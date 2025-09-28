/**
 * Template Error Handling
 * 
 * Centralized error handling for template operations with user-friendly messages,
 * error categorization, and recovery suggestions.
 */

import { TemplateServiceError } from '../../services/templateService';

/**
 * Template error categories for UI handling
 */
export enum TemplateErrorCategory {
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NETWORK = 'network',
  QUOTA = 'quota',
  CONFLICT = 'conflict',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown',
}

/**
 * User-friendly error information
 */
export interface TemplateErrorInfo {
  category: TemplateErrorCategory;
  title: string;
  message: string;
  suggestions: string[];
  recoverable: boolean;
  retryable: boolean;
  technicalDetails?: string;
}

/**
 * Template error code mappings
 */
const ERROR_MAPPINGS: Record<string, TemplateErrorInfo> = {
  // Validation errors
  INVALID_MEDICAL_CONTENT: {
    category: TemplateErrorCategory.VALIDATION,
    title: 'Invalid Medical Content',
    message: 'Template structure must contain appropriate medical keywords and formatting.',
    suggestions: [
      'Include medical terms like "patient", "diagnosis", "symptoms", "treatment"',
      'Use structured sections like "Chief Complaint", "History", "Assessment"',
      'Review example templates for proper medical formatting',
    ],
    recoverable: true,
    retryable: false,
  },

  DUPLICATE_NAME: {
    category: TemplateErrorCategory.CONFLICT,
    title: 'Template Name Already Exists',
    message: 'A template with this name already exists in your account.',
    suggestions: [
      'Choose a different, unique name for your template',
      'Update the existing template instead of creating a new one',
      'Add descriptive words to make the name unique',
    ],
    recoverable: true,
    retryable: false,
  },

  TEMPLATE_LIMIT_EXCEEDED: {
    category: TemplateErrorCategory.QUOTA,
    title: 'Template Limit Reached',
    message: 'You have reached the maximum of 50 templates per account.',
    suggestions: [
      'Delete unused templates to make space for new ones',
      'Archive old templates that you no longer need',
      'Consider consolidating similar templates',
    ],
    recoverable: true,
    retryable: false,
  },

  NOT_FOUND: {
    category: TemplateErrorCategory.NOT_FOUND,
    title: 'Template Not Found',
    message: 'The requested template could not be found or may have been deleted.',
    suggestions: [
      'Check if the template was recently deleted',
      'Refresh the template list to get the latest data',
      'Verify you have permission to access this template',
    ],
    recoverable: false,
    retryable: false,
  },

  // Network and API errors
  FETCH_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Network Error',
    message: 'Unable to connect to the template service. Please check your internet connection.',
    suggestions: [
      'Check your internet connection',
      'Try again in a few moments',
      'Refresh the page if the problem persists',
    ],
    recoverable: true,
    retryable: true,
  },

  CREATE_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Failed to Create Template',
    message: 'There was a problem creating your template. Please try again.',
    suggestions: [
      'Verify all required fields are filled correctly',
      'Check your internet connection',
      'Try saving the template again',
    ],
    recoverable: true,
    retryable: true,
  },

  UPDATE_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Failed to Update Template',
    message: 'There was a problem updating your template. Please try again.',
    suggestions: [
      'Verify your changes are valid',
      'Check your internet connection',
      'Try saving the changes again',
    ],
    recoverable: true,
    retryable: true,
  },

  DELETE_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Failed to Delete Template',
    message: 'There was a problem deleting the template. Please try again.',
    suggestions: [
      'Check your internet connection',
      'Refresh the template list',
      'Try deleting the template again',
    ],
    recoverable: true,
    retryable: true,
  },

  USAGE_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Usage Tracking Failed',
    message: 'Template usage could not be recorded, but your report was generated successfully.',
    suggestions: [
      'The template was still used successfully',
      'Usage statistics may be slightly inaccurate',
      'No action required from you',
    ],
    recoverable: true,
    retryable: false,
  },

  STATS_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Statistics Unavailable',
    message: 'Template statistics could not be loaded at this time.',
    suggestions: [
      'Statistics will be available when the connection is restored',
      'Try refreshing the page',
      'Check back later',
    ],
    recoverable: true,
    retryable: true,
  },

  SEARCH_ERROR: {
    category: TemplateErrorCategory.NETWORK,
    title: 'Search Failed',
    message: 'Unable to search templates at this time. Please try again.',
    suggestions: [
      'Check your internet connection',
      'Try a simpler search term',
      'Refresh the page and try again',
    ],
    recoverable: true,
    retryable: true,
  },

  // Generic errors
  UNKNOWN_ERROR: {
    category: TemplateErrorCategory.UNKNOWN,
    title: 'Unexpected Error',
    message: 'An unexpected error occurred while processing your request.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem persists',
    ],
    recoverable: true,
    retryable: true,
  },
};

/**
 * Template Error Handler Class
 */
export class TemplateErrorHandler {
  /**
   * Process any error and return user-friendly information
   */
  static handleError(error: any): TemplateErrorInfo {

    // Handle TemplateServiceError
    if (error instanceof TemplateServiceError) {
      const errorInfo = ERROR_MAPPINGS[error.code];
      if (errorInfo) {
        return {
          ...errorInfo,
          technicalDetails: `Code: ${error.code}${error.details ? `, Details: ${JSON.stringify(error.details)}` : ''}`,
        };
      }
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        ...ERROR_MAPPINGS.FETCH_ERROR,
        technicalDetails: error.message,
      };
    }

    // Handle validation errors (from Zod)
    if (error?.name === 'ZodError') {
      return {
        category: TemplateErrorCategory.VALIDATION,
        title: 'Validation Error',
        message: 'The template data is not valid. Please check the required fields.',
        suggestions: [
          'Ensure all required fields are filled',
          'Check that field lengths are within limits',
          'Verify the medical content is appropriate',
        ],
        recoverable: true,
        retryable: false,
        technicalDetails: JSON.stringify(error.issues),
      };
    }

    // Fallback for unknown errors
    return {
      ...ERROR_MAPPINGS.UNKNOWN_ERROR,
      technicalDetails: error instanceof Error ? error.message : String(error),
    };
  }

  /**
   * Get user-friendly error message for display
   */
  static getDisplayMessage(error: any): string {
    const errorInfo = this.handleError(error);
    return `${errorInfo.title}: ${errorInfo.message}`;
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: any): boolean {
    const errorInfo = this.handleError(error);
    return errorInfo.retryable;
  }

  /**
   * Check if an error is recoverable (user can fix it)
   */
  static isRecoverable(error: any): boolean {
    const errorInfo = this.handleError(error);
    return errorInfo.recoverable;
  }

  /**
   * Get error category for UI styling/handling
   */
  static getCategory(error: any): TemplateErrorCategory {
    const errorInfo = this.handleError(error);
    return errorInfo.category;
  }

  /**
   * Get recovery suggestions for the user
   */
  static getSuggestions(error: any): string[] {
    const errorInfo = this.handleError(error);
    return errorInfo.suggestions;
  }

  /**
   * Create a formatted error report for logging/debugging
   */
  static createErrorReport(error: any, context?: string): string {
    const errorInfo = this.handleError(error);
    const timestamp = new Date().toISOString();
    
    return `
TEMPLATE ERROR REPORT
====================
Timestamp: ${timestamp}
Context: ${context || 'Unknown'}
Category: ${errorInfo.category}
Title: ${errorInfo.title}
Message: ${errorInfo.message}
Recoverable: ${errorInfo.recoverable}
Retryable: ${errorInfo.retryable}
Technical Details: ${errorInfo.technicalDetails || 'None'}
Suggestions:
${errorInfo.suggestions.map(s => `- ${s}`).join('\n')}
====================
    `.trim();
  }
}

/**
 * React hook for error handling in template components
 */
export function useTemplateErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const errorInfo = TemplateErrorHandler.handleError(error);
    
    // Log detailed error report for debugging
    
    return errorInfo;
  };

  const getDisplayMessage = (error: any) => {
    return TemplateErrorHandler.getDisplayMessage(error);
  };

  const isRetryable = (error: any) => {
    return TemplateErrorHandler.isRetryable(error);
  };

  const isRecoverable = (error: any) => {
    return TemplateErrorHandler.isRecoverable(error);
  };

  return {
    handleError,
    getDisplayMessage,
    isRetryable,
    isRecoverable,
  };
}

// Export types for use in components
export type { TemplateErrorInfo };