/**
 * Migration Helper for Netlify to Supabase Edge Functions
 * Provides seamless transition with feature flags and monitoring
 */

// Configuration
const MIGRATION_CONFIG = {
  // Feature flag for gradual migration
  USE_SUPABASE_FUNCTIONS: import.meta.env.VITE_USE_SUPABASE_FUNCTIONS === 'true',
  
  // Rollout percentage (0-100)
  ROLLOUT_PERCENTAGE: parseInt(import.meta.env.VITE_SUPABASE_ROLLOUT_PERCENTAGE || '0'),
  
  // URLs
  NETLIFY_BASE: 'https://medimindexpert.netlify.app/.netlify/functions',
  SUPABASE_BASE: 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1',
  
  // Monitoring
  ENABLE_MONITORING: import.meta.env.VITE_ENABLE_API_MONITORING === 'true'
};

// API endpoints
const ENDPOINTS = {
  UPLOAD_DOCUMENT: {
    netlify: `${MIGRATION_CONFIG.NETLIFY_BASE}/uploadDocumentToOpenAI-v2`,
    supabase: `${MIGRATION_CONFIG.SUPABASE_BASE}/upload-document-to-openai`
  },
  OPENAI_ASSISTANT: {
    netlify: `${MIGRATION_CONFIG.NETLIFY_BASE}/openai-assistant`,
    supabase: `${MIGRATION_CONFIG.SUPABASE_BASE}/openai-assistant`
  }
};

// User-based rollout logic
function shouldUseSupabaseFunctions(userId?: string): boolean {
  // Always respect explicit feature flag
  if (MIGRATION_CONFIG.USE_SUPABASE_FUNCTIONS) {
    return true;
  }
  
  // If no rollout percentage set, use Netlify
  if (MIGRATION_CONFIG.ROLLOUT_PERCENTAGE <= 0) {
    return false;
  }
  
  // If no user ID, use random assignment
  if (!userId) {
    return Math.random() * 100 < MIGRATION_CONFIG.ROLLOUT_PERCENTAGE;
  }
  
  // Use consistent hash-based assignment for users
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const userPercentage = hash % 100;
  
  return userPercentage < MIGRATION_CONFIG.ROLLOUT_PERCENTAGE;
}

// API monitoring wrapper
async function monitoredFetch(
  url: string, 
  options: RequestInit, 
  functionType: string
): Promise<Response> {
  const startTime = Date.now();
  const provider = url.includes('supabase') ? 'supabase' : 'netlify';
  
  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log metrics if monitoring enabled
    if (MIGRATION_CONFIG.ENABLE_MONITORING) {
      console.log('API_METRICS', {
        functionType,
        provider,
        responseTime: duration,
        status: response.status,
        success: response.ok,
        timestamp: new Date().toISOString(),
        url: url.replace(/\/\/(.*?)\./, '//***.')  // Mask domain for privacy
      });
    }
    
    // Track performance for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {\n      (window as any).gtag('event', 'api_call', {\n        custom_parameter_1: functionType,\n        custom_parameter_2: provider,\n        custom_parameter_3: duration,\n        custom_parameter_4: response.status\n      });\n    }\n    \n    // Alert on slow responses\n    if (duration > 10000) {\n      console.warn('SLOW_API_RESPONSE', {\n        functionType,\n        provider,\n        duration,\n        url\n      });\n    }\n    \n    return response;\n  } catch (error) {\n    const endTime = Date.now();\n    const duration = endTime - startTime;\n    \n    // Log error metrics\n    if (MIGRATION_CONFIG.ENABLE_MONITORING) {\n      console.error('API_ERROR', {\n        functionType,\n        provider,\n        responseTime: duration,\n        error: error instanceof Error ? error.message : 'Unknown error',\n        timestamp: new Date().toISOString(),\n        url: url.replace(/\/\/(.*?)\./, '//***.')\n      });\n    }\n    \n    throw error;\n  }\n}\n\n// Smart URL selection with fallback\nfunction getEndpointURL(endpointType: keyof typeof ENDPOINTS, userId?: string): string {\n  const endpoint = ENDPOINTS[endpointType];\n  \n  if (shouldUseSupabaseFunctions(userId)) {\n    return endpoint.supabase;\n  }\n  \n  return endpoint.netlify;\n}\n\n// Enhanced API call wrapper with retry logic\nasync function apiCallWithRetry(\n  endpointType: keyof typeof ENDPOINTS,\n  options: RequestInit,\n  userId?: string,\n  maxRetries: number = 2\n): Promise<Response> {\n  let lastError: Error;\n  \n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    try {\n      const url = getEndpointURL(endpointType, userId);\n      const response = await monitoredFetch(url, options, endpointType);\n      \n      // If successful or client error (4xx), don't retry\n      if (response.ok || (response.status >= 400 && response.status < 500)) {\n        return response;\n      }\n      \n      // For server errors (5xx), try the other provider\n      if (attempt < maxRetries) {\n        console.warn(`API_RETRY: Attempt ${attempt + 1} failed with ${response.status}, trying alternate provider`);\n        \n        // Switch to alternate provider for retry\n        const isCurrentlySupabase = url.includes('supabase');\n        const fallbackUrl = isCurrentlySupabase ? \n          ENDPOINTS[endpointType].netlify : \n          ENDPOINTS[endpointType].supabase;\n        \n        const fallbackResponse = await monitoredFetch(fallbackUrl, options, `${endpointType}_fallback`);\n        \n        if (fallbackResponse.ok) {\n          return fallbackResponse;\n        }\n      }\n      \n      throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n      \n    } catch (error) {\n      lastError = error instanceof Error ? error : new Error('Unknown error');\n      \n      if (attempt < maxRetries) {\n        console.warn(`API_RETRY: Attempt ${attempt + 1} failed:`, lastError.message);\n        // Wait before retry (exponential backoff)\n        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));\n      }\n    }\n  }\n  \n  throw lastError!;\n}\n\n// Public API functions\nexport class MigrationAPI {\n  /**\n   * Upload document to OpenAI Vector Store\n   */\n  static async uploadDocument(\n    data: {\n      supabaseFilePath: string;\n      vectorStoreId: string;\n      title: string;\n      description?: string;\n      category?: string;\n      tags?: string[];\n      fileName: string;\n      fileType: string;\n      fileSize: number;\n    },\n    authToken: string,\n    userId?: string\n  ): Promise<any> {\n    const response = await apiCallWithRetry(\n      'UPLOAD_DOCUMENT',\n      {\n        method: 'POST',\n        headers: {\n          'Authorization': `Bearer ${authToken}`,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify(data)\n      },\n      userId\n    );\n    \n    if (!response.ok) {\n      const error = await response.text();\n      throw new Error(`Upload failed: ${error}`);\n    }\n    \n    return response.json();\n  }\n  \n  /**\n   * Send message to OpenAI Assistant\n   */\n  static async sendToAssistant(\n    data: {\n      message: string;\n      conversationId?: string;\n      caseContext?: any;\n      threadId?: string;\n    },\n    authToken: string,\n    userId?: string\n  ): Promise<any> {\n    const response = await apiCallWithRetry(\n      'OPENAI_ASSISTANT',\n      {\n        method: 'POST',\n        headers: {\n          'Authorization': `Bearer ${authToken}`,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify(data)\n      },\n      userId\n    );\n    \n    if (!response.ok) {\n      const error = await response.text();\n      throw new Error(`Assistant request failed: ${error}`);\n    }\n    \n    return response.json();\n  }\n  \n  /**\n   * Get migration status for debugging\n   */\n  static getMigrationStatus(userId?: string) {\n    return {\n      useSupabaseFunctions: shouldUseSupabaseFunctions(userId),\n      rolloutPercentage: MIGRATION_CONFIG.ROLLOUT_PERCENTAGE,\n      explicitFlag: MIGRATION_CONFIG.USE_SUPABASE_FUNCTIONS,\n      monitoringEnabled: MIGRATION_CONFIG.ENABLE_MONITORING,\n      endpoints: {\n        upload: getEndpointURL('UPLOAD_DOCUMENT', userId),\n        assistant: getEndpointURL('OPENAI_ASSISTANT', userId)\n      }\n    };\n  }\n  \n  /**\n   * Force switch to specific provider (for testing)\n   */\n  static async testProvider(\n    provider: 'netlify' | 'supabase',\n    endpointType: keyof typeof ENDPOINTS,\n    data: any,\n    authToken: string\n  ): Promise<any> {\n    const url = ENDPOINTS[endpointType][provider];\n    \n    const response = await monitoredFetch(\n      url,\n      {\n        method: 'POST',\n        headers: {\n          'Authorization': `Bearer ${authToken}`,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify(data)\n      },\n      `${endpointType}_test_${provider}`\n    );\n    \n    if (!response.ok) {\n      const error = await response.text();\n      throw new Error(`${provider} test failed: ${error}`);\n    }\n    \n    return response.json();\n  }\n}\n\n// Export configuration for debugging\nexport { MIGRATION_CONFIG, ENDPOINTS, shouldUseSupabaseFunctions };\n\n// Default export for backward compatibility\nexport default MigrationAPI;