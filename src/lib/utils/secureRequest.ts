import type { ApiError } from '../../types/api-responses';

interface SecureRequestOptions extends RequestInit {
  requireCSRF?: boolean;
  retryCount?: number;
  timeout?: number;
}

interface SecureResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

class CSRFTokenManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  async getToken(): Promise<string> {
    const now = Date.now();
    
    // Check if we have a valid token
    if (this.token && now < this.tokenExpiry) {
      return this.token;
    }

    // Generate new token from server
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.csrfToken;
        this.tokenExpiry = now + (30 * 60 * 1000); // 30 minutes
        return this.token!;
      }
    } catch (error) {

    }

    // Fallback: generate client-side token
    this.token = this.generateClientToken();
    this.tokenExpiry = now + (30 * 60 * 1000);
    return this.token;
  }

  private generateClientToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}

const csrfManager = new CSRFTokenManager();

/**
 * Secure request utility with CSRF protection and enhanced error handling
 */
export async function secureRequest<T = unknown>(
  url: string,
  options: SecureRequestOptions = {}
): Promise<SecureResponse<T>> {
  const {
    requireCSRF = true,
    retryCount = 1,
    timeout = 30000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Prepare headers
    const headers = new Headers(fetchOptions.headers);
    
    // Add CSRF token for state-changing operations
    if (requireCSRF && fetchOptions.method && fetchOptions.method !== 'GET') {
      const csrfToken = await csrfManager.getToken();
      headers.set('X-CSRF-Token', csrfToken);
    }

    // Ensure we send credentials for authentication
    const finalOptions: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
      signal: controller.signal
    };

    // Make the request
    const response = await fetch(url, finalOptions);
    
    // Clear timeout
    clearTimeout(timeoutId);

    // Parse response
    let responseData: SecureResponse<T>;
    
    try {
      responseData = await response.json();
    } catch (parseError) {
      // Handle non-JSON responses
      responseData = {
        success: false,
        error: 'Invalid response format',
        statusCode: response.status
      };
    }

    // Handle specific status codes
    if (response.status === 403 && responseData.error?.includes('CSRF')) {
      // CSRF token invalid, clear and retry
      csrfManager.clearToken();
      
      if (retryCount > 0) {
        return secureRequest<T>(url, { ...options, retryCount: retryCount - 1 });
      }
    }

    if (response.status === 429) {
      // Rate limited
      const retryAfter = response.headers.get('Retry-After');
      const message = retryAfter 
        ? `Rate limited. Try again in ${retryAfter} seconds.`
        : 'Rate limited. Please try again later.';
      
      throw new Error(message);
    }

    if (response.status === 401) {
      // Authentication failed
      window.location.href = '/auth/signin';
      throw new Error('Authentication required');
    }

    return responseData;

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const secureAPI = {
  get: <T = unknown>(url: string, options?: SecureRequestOptions) =>
    secureRequest<T>(url, { ...options, method: 'GET', requireCSRF: false }),

  post: <T = unknown>(url: string, data?: unknown, options?: SecureRequestOptions) =>
    secureRequest<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T = unknown>(url: string, data?: unknown, options?: SecureRequestOptions) =>
    secureRequest<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T = unknown>(url: string, options?: SecureRequestOptions) =>
    secureRequest<T>(url, { ...options, method: 'DELETE' }),

  patch: <T = unknown>(url: string, data?: unknown, options?: SecureRequestOptions) =>
    secureRequest<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    })
};

/**
 * Input sanitization utility for frontend
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate if content might contain PHI before submission
 */
export function containsPotentialPHI(text: string): boolean {
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{10,}\b/, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b(?:mr|mrs|ms|dr|prof)\.?\s+[a-z]+\b/i, // Titles with names
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // Dates
  ];
  
  return phiPatterns.some(pattern => pattern.test(text));
}

/**
 * Secure form submission with PHI validation
 */
export async function submitSecureForm<T = any>(
  url: string,
  formData: Record<string, any>,
  options?: {
    validatePHI?: boolean;
    confirmPHI?: boolean;
  }
): Promise<SecureResponse<T>> {
  const { validatePHI = true, confirmPHI = true } = options || {};

  // Check for potential PHI if validation is enabled
  if (validatePHI) {
    const textValues = Object.values(formData)
      .filter(value => typeof value === 'string')
      .join(' ');

    if (containsPotentialPHI(textValues)) {
      if (confirmPHI) {
        const confirmed = window.confirm(
          'This form may contain personal health information (PHI). Are you sure you want to submit?'
        );
        if (!confirmed) {
          throw new Error('Form submission cancelled by user');
        }
      } else {
        throw new Error('Form contains potential PHI and cannot be submitted');
      }
    }
  }

  return secureAPI.post<T>(url, formData);
} 