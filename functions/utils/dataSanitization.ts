/**
 * Data Sanitization Utilities for HIPAA Compliance
 * Ensures medical data protection and privacy compliance
 */

import DOMPurify from 'isomorphic-dompurify';

// Sensitive data patterns for medical applications
const SENSITIVE_PATTERNS = {
  // Personal identifiers
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Medical identifiers
  mrn: /\b(MRN|Medical Record|Patient ID):?\s*[A-Z0-9-]{5,15}\b/gi,
  npi: /\b\d{10}\b/g, // National Provider Identifier
  dea: /\b[A-Z]{2}\d{7}\b/g, // DEA number
  
  // Date patterns that could reveal patient information
  dob: /\b(DOB|Date of Birth):?\s*\d{1,2}\/\d{1,2}\/\d{4}\b/gi,
  
  // Medical terms that might contain PHI
  patientData: /(patient|diagnosis|treatment|prescription|medical history|symptoms)/gi
};

// Allowed HTML tags for medical content
const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody',
  'tr', 'td', 'th', 'span', 'div', 'a', 'sub', 'sup'
];

// Allowed HTML attributes
const ALLOWED_ATTRIBUTES = [
  'href', 'title', 'target', 'rel', 'class', 'id', 'style'
];

// HIPAA-compliant data sanitization
export class MedicalDataSanitizer {
  
  // Sanitize text content for medical safety
  static sanitizeText(text: string, options: {
    preserveFormatting?: boolean;
    removeSensitiveData?: boolean;
    logSanitization?: boolean;
  } = {}): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let sanitized = text;
    const sanitizationLog: string[] = [];

    // Remove sensitive data patterns if requested
    if (options.removeSensitiveData) {
      Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
        const matches = sanitized.match(pattern);
        if (matches) {
          sanitized = sanitized.replace(pattern, `[REDACTED_${type.toUpperCase()}]`);
          sanitizationLog.push(`Removed ${matches.length} ${type} pattern(s)`);
        }
      });
    }

    // HTML sanitization for user-generated content
    if (options.preserveFormatting) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ALLOWED_HTML_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        SANITIZE_NAMED_PROPS: true,
        KEEP_CONTENT: true,
        // Medical-specific sanitization
        FORBID_CONTENTS: ['script', 'object', 'embed', 'applet'],
        FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'iframe', 'form', 'input']
      });
    } else {
      // Strip all HTML for plain text
      sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
    }

    // Basic XSS protection
    sanitized = sanitized
      .replace(/javascript:/gi, '[BLOCKED]')
      .replace(/data:/gi, '[BLOCKED]')
      .replace(/vbscript:/gi, '[BLOCKED]')
      .replace(/on\w+\s*=/gi, '[BLOCKED]');

    // Log sanitization actions if requested
    if (options.logSanitization && sanitizationLog.length > 0) {
      console.log('Data sanitization applied:', sanitizationLog);
    }

    return sanitized.trim();
  }

  // Sanitize medical search queries
  static sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    // Remove potential injection attempts
    let sanitized = query
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/data:/gi, '') // Remove data protocol
      .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
      .trim();

    // Limit query length for performance
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500);
    }

    return sanitized;
  }

  // Sanitize medical calculator inputs
  static sanitizeCalculatorInput(input: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.entries(input).forEach(([key, value]) => {
      // Only allow safe key names
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      
      if (typeof value === 'string') {
        // Sanitize string values
        sanitized[safeKey] = this.sanitizeText(value, { removeSensitiveData: false });
      } else if (typeof value === 'number') {
        // Validate numeric values for medical calculations
        if (isFinite(value) && !isNaN(value)) {
          sanitized[safeKey] = value;
        } else {
          sanitized[safeKey] = 0; // Default to safe value
        }
      } else if (typeof value === 'boolean') {
        sanitized[safeKey] = Boolean(value);
      } else if (Array.isArray(value)) {
        // Sanitize arrays
        sanitized[safeKey] = value
          .filter(item => typeof item === 'string' || typeof item === 'number')
          .map(item => typeof item === 'string' ? this.sanitizeText(item) : item);
      } else {
        // Skip complex objects to prevent injection
        console.warn(`Skipping complex object in calculator input: ${key}`);
      }
    });

    return sanitized;
  }

  // Sanitize file uploads
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
    content?: Buffer | string;
  }): { valid: boolean; reason?: string; sanitizedName?: string } {
    
    // File size limits (50MB for medical documents)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, reason: 'File size exceeds 50MB limit' };
    }

    // Allowed file types for medical documents
    const ALLOWED_TYPES = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/tiff' // Medical imaging
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, reason: `File type ${file.type} not allowed` };
    }

    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
      .replace(/\.{2,}/g, '.') // Remove directory traversal
      .substring(0, 100); // Limit filename length

    // Basic content scanning for PDF files
    if (file.type === 'application/pdf' && file.content) {
      const contentStr = file.content.toString();
      
      // Check for potentially malicious content
      const maliciousPatterns = [
        /javascript/gi,
        /action.*submit/gi,
        /<script/gi,
        /eval\(/gi
      ];

      if (maliciousPatterns.some(pattern => pattern.test(contentStr))) {
        return { valid: false, reason: 'File contains potentially malicious content' };
      }
    }

    return { valid: true, sanitizedName };
  }

  // Remove PHI from logs and error messages
  static sanitizeForLogging(data: any): any {
    if (typeof data === 'string') {
      let sanitized = data;
      
      // Replace sensitive patterns
      Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
        sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
      });
      
      return sanitized;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogging(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      
      Object.entries(data).forEach(([key, value]) => {
        // Skip keys that might contain sensitive data
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'mrn'];
        if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  // Validate and sanitize API request body
  static sanitizeApiRequest(body: any, allowedFields: string[]): any {
    if (!body || typeof body !== 'object') {
      return {};
    }

    const sanitized: any = {};
    
    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        const value = body[field];
        
        if (typeof value === 'string') {
          sanitized[field] = this.sanitizeText(value, { 
            preserveFormatting: true,
            removeSensitiveData: true 
          });
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[field] = value;
        } else if (Array.isArray(value)) {
          sanitized[field] = value
            .filter(item => typeof item === 'string' || typeof item === 'number')
            .map(item => typeof item === 'string' ? this.sanitizeText(item) : item);
        }
      }
    });

    return sanitized;
  }
}

// HIPAA compliance utilities
export class HIPAACompliance {
  
  // Check if data contains PHI (Protected Health Information)
  static containsPHI(data: string): boolean {
    if (!data || typeof data !== 'string') return false;
    
    // Check for obvious PHI patterns
    const phiPatterns = [
      SENSITIVE_PATTERNS.ssn,
      SENSITIVE_PATTERNS.mrn,
      SENSITIVE_PATTERNS.dob,
      /patient.*name/gi,
      /medical.*record/gi,
      /diagnosis/gi,
      /prescription/gi
    ];

    return phiPatterns.some(pattern => pattern.test(data));
  }

  // Generate audit log entry for PHI access
  static auditPHIAccess(event: {
    userId: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
    timestamp?: string;
  }) {
    const auditEntry = {
      timestamp: event.timestamp || new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      compliance: 'HIPAA',
      category: 'PHI_ACCESS'
    };

    // In production, this would write to a secure audit log
    console.log('HIPAA Audit:', JSON.stringify(auditEntry));
    
    return auditEntry;
  }

  // Validate data retention compliance
  static validateDataRetention(createdAt: string, retentionDays: number = 2555): boolean {
    const created = new Date(createdAt);
    const retentionPeriod = retentionDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const expiryDate = new Date(created.getTime() + retentionPeriod);
    
    return new Date() < expiryDate;
  }

  // Create privacy-compliant error response
  static createPrivacyCompliantError(originalError: Error, context: string): {
    message: string;
    code: string;
    context: string;
  } {
    // Sanitize error message to remove any potential PHI
    const sanitizedMessage = MedicalDataSanitizer.sanitizeForLogging(originalError.message);
    
    return {
      message: typeof sanitizedMessage === 'string' ? sanitizedMessage : 'An error occurred',
      code: 'MEDICAL_OPERATION_ERROR',
      context: context
    };
  }
}

// Medical content validation
export class MedicalContentValidator {
  
  // Validate medical search content before display
  static validateSearchContent(content: {
    title?: string;
    description?: string;
    url?: string;
    source?: string;
  }): { valid: boolean; sanitized?: any; issues?: string[] } {
    const issues: string[] = [];
    const sanitized: any = {};

    // Validate and sanitize title
    if (content.title) {
      if (content.title.length > 200) {
        issues.push('Title too long');
        sanitized.title = content.title.substring(0, 200) + '...';
      } else {
        sanitized.title = MedicalDataSanitizer.sanitizeText(content.title);
      }
    }

    // Validate and sanitize description
    if (content.description) {
      if (content.description.length > 2000) {
        issues.push('Description too long');
        sanitized.description = content.description.substring(0, 2000) + '...';
      } else {
        sanitized.description = MedicalDataSanitizer.sanitizeText(content.description, {
          preserveFormatting: true
        });
      }
    }

    // Validate URL
    if (content.url) {
      try {
        const url = new URL(content.url);
        if (['http:', 'https:'].includes(url.protocol)) {
          sanitized.url = content.url;
        } else {
          issues.push('Invalid URL protocol');
        }
      } catch {
        issues.push('Invalid URL format');
      }
    }

    // Validate source
    if (content.source) {
      sanitized.source = MedicalDataSanitizer.sanitizeText(content.source);
    }

    return {
      valid: issues.length === 0,
      sanitized: issues.length === 0 ? sanitized : undefined,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  // Validate medical calculator result
  static validateCalculatorResult(result: any, calculatorType: string): {
    valid: boolean;
    sanitized?: any;
    medicalWarnings?: string[];
  } {
    const medicalWarnings: string[] = [];
    
    // Basic validation
    if (!result || typeof result !== 'object') {
      return { valid: false };
    }

    // Validate numeric results are within medical ranges
    if (typeof result.score === 'number') {
      if (!isFinite(result.score) || isNaN(result.score)) {
        return { valid: false };
      }
      
      // Medical range validations based on calculator type
      if (calculatorType.includes('blood-pressure')) {
        if (result.score < 60 || result.score > 300) {
          medicalWarnings.push('Blood pressure value outside normal physiological range');
        }
      }
    }

    // Sanitize text fields in result
    const sanitized = { ...result };
    if (result.interpretation) {
      sanitized.interpretation = MedicalDataSanitizer.sanitizeText(result.interpretation, {
        preserveFormatting: true
      });
    }

    return {
      valid: true,
      sanitized,
      medicalWarnings: medicalWarnings.length > 0 ? medicalWarnings : undefined
    };
  }
}

// Middleware for automatic request sanitization
export function createSanitizationMiddleware(allowedFields: string[]) {
  return function sanitizationMiddleware(
    handler: (event: any, context: any) => Promise<any>
  ) {
    return async (event: any, context: any) => {
      try {
        // Parse and sanitize request body
        if (event.body) {
          const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
          event.sanitizedBody = MedicalDataSanitizer.sanitizeApiRequest(body, allowedFields);
        }

        // Sanitize query parameters
        if (event.queryStringParameters) {
          const sanitizedQuery: Record<string, string> = {};
          Object.entries(event.queryStringParameters).forEach(([key, value]) => {
            if (typeof value === 'string') {
              sanitizedQuery[key] = MedicalDataSanitizer.sanitizeText(value);
            }
          });
          event.sanitizedQuery = sanitizedQuery;
        }

        // Execute handler with sanitized data
        const response = await handler(event, context);
        
        // Sanitize response if it contains user-generated content
        if (response.body && typeof response.body === 'string') {
          try {
            const responseData = JSON.parse(response.body);
            if (responseData.message || responseData.content) {
              // Sanitize response content
              if (responseData.message) {
                responseData.message = MedicalDataSanitizer.sanitizeText(responseData.message);
              }
              if (responseData.content) {
                responseData.content = MedicalDataSanitizer.sanitizeText(responseData.content, {
                  preserveFormatting: true
                });
              }
              
              response.body = JSON.stringify(responseData);
            }
          } catch {
            // Response is not JSON, leave as-is
          }
        }

        return response;

      } catch (error) {
        console.error('Sanitization middleware error:', error);
        // Continue with original handler if sanitization fails
        return handler(event, context);
      }
    };
  };
}

// Export main sanitization function
export const sanitizeText = MedicalDataSanitizer.sanitizeText;
export const sanitizeSearchQuery = MedicalDataSanitizer.sanitizeSearchQuery;
export const sanitizeCalculatorInput = MedicalDataSanitizer.sanitizeCalculatorInput;
export const containsPHI = HIPAACompliance.containsPHI;
export const auditPHIAccess = HIPAACompliance.auditPHIAccess;