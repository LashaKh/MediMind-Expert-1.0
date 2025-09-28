/**
 * Template API Client
 * 
 * Client-side API methods for template operations with proper error handling,
 * caching, and retry logic for improved reliability.
 */

import { templateService, TemplateServiceError } from '../../services/templateService';
import type {
  UserReportTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateListResponse,
  TemplateUsageResponse,
  TemplateSearchFilters,
} from '../../types/templates';

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * API client configuration
 */
interface ApiClientConfig {
  retryAttempts: number;
  retryDelay: number;
  cacheTimeout: number;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

/**
 * Simple in-memory cache for template data
 */
class TemplateCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private timeout: number;

  constructor(timeout: number) {
    this.timeout = timeout;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.timeout;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Template API Client Class
 */
export class TemplateApiClient {
  private config: ApiClientConfig;
  private cache: TemplateCache;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new TemplateCache(this.config.cacheTimeout);
  }

  /**
   * Retry wrapper for API calls
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ApiResponse<T>> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error instanceof TemplateServiceError) {
          const shouldNotRetry = [
            'NOT_FOUND',
            'DUPLICATE_NAME',
            'TEMPLATE_LIMIT_EXCEEDED',
            'INVALID_MEDICAL_CONTENT',
          ].includes(error.code);

          if (shouldNotRetry) {
            break;
          }
        }

        // Wait before retrying (except on last attempt)
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * attempt)
          );
        }
      }
    }

    // All attempts failed
    return {
      success: false,
      error: {
        code: lastError instanceof TemplateServiceError ? lastError.code : 'UNKNOWN_ERROR',
        message: lastError instanceof Error ? lastError.message : 'Unknown error occurred',
        details: lastError instanceof TemplateServiceError ? lastError.details : undefined,
      },
    };
  }

  /**
   * Get all user templates with caching
   */
  async getTemplates(filters?: Partial<TemplateSearchFilters>): Promise<ApiResponse<TemplateListResponse>> {
    const cacheKey = `templates_${JSON.stringify(filters || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
      };
    }

    const result = await this.withRetry(
      () => templateService.getUserTemplates(filters),
      'Get templates'
    );

    if (result.success && result.data) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Get template by ID with caching
   */
  async getTemplate(templateId: string): Promise<ApiResponse<UserReportTemplate>> {
    const cacheKey = `template_${templateId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
      };
    }

    const result = await this.withRetry(
      () => templateService.getTemplate(templateId),
      `Get template ${templateId}`
    );

    if (result.success && result.data) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Create new template
   */
  async createTemplate(templateData: CreateTemplateRequest): Promise<ApiResponse<UserReportTemplate>> {
    const result = await this.withRetry(
      () => templateService.createTemplate(templateData),
      'Create template'
    );

    if (result.success) {
      // Invalidate templates list cache
      this.cache.invalidate('templates_');
    }

    return result;
  }

  /**
   * Update existing template
   */
  async updateTemplate(
    templateId: string, 
    updateData: UpdateTemplateRequest
  ): Promise<ApiResponse<UserReportTemplate>> {
    const result = await this.withRetry(
      () => templateService.updateTemplate(templateId, updateData),
      `Update template ${templateId}`
    );

    if (result.success) {
      // Invalidate specific template and list caches
      this.cache.invalidate(`template_${templateId}`);
      this.cache.invalidate('templates_');
    }

    return result;
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<boolean>> {
    const result = await this.withRetry(
      () => templateService.deleteTemplate(templateId),
      `Delete template ${templateId}`
    );

    if (result.success) {
      // Invalidate specific template and list caches
      this.cache.invalidate(`template_${templateId}`);
      this.cache.invalidate('templates_');
    }

    return result;
  }

  /**
   * Record template usage
   */
  async recordTemplateUsage(templateId: string): Promise<ApiResponse<TemplateUsageResponse>> {
    const result = await this.withRetry(
      () => templateService.recordTemplateUsage(templateId),
      `Record usage for template ${templateId}`
    );

    if (result.success) {
      // Invalidate specific template and list caches to reflect updated usage
      this.cache.invalidate(`template_${templateId}`);
      this.cache.invalidate('templates_');
    }

    return result;
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<ApiResponse<any>> {
    const cacheKey = 'template_stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
      };
    }

    const result = await this.withRetry(
      () => templateService.getTemplateStats(),
      'Get template statistics'
    );

    if (result.success && result.data) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Search templates with advanced filtering
   */
  async searchTemplates(
    searchQuery: string = '',
    orderBy: string = 'created_at',
    orderDirection: string = 'desc',
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<UserReportTemplate[]>> {
    const cacheKey = `search_${searchQuery}_${orderBy}_${orderDirection}_${limit}_${offset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        data: cached,
      };
    }

    const result = await this.withRetry(
      () => templateService.searchTemplates(searchQuery, orderBy, orderDirection, limit, offset),
      'Search templates'
    );

    if (result.success && result.data) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; timeout: number } {
    return {
      size: (this.cache as any).cache.size,
      timeout: this.config.cacheTimeout,
    };
  }
}

// Export singleton instance
export const templateApiClient = new TemplateApiClient();

// Export class for testing and custom configurations
export type { TemplateApiClient };