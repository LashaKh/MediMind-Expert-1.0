/**
 * GDPR Compliance Utility for MediMind Expert
 * Implements comprehensive data protection and privacy controls
 */

import { logInfo, logWarning, logError } from './logger';
import { ENV_VARS } from './constants';

// GDPR-related types
interface PersonalDataRequest {
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  requestDate: Date;
  requestReason?: string;
  dataCategories?: string[];
  completionDeadline: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
}

interface DataProcessingRecord {
  id: string;
  userId: string;
  dataType: string;
  processingPurpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataSource: string;
  recipientCategories?: string[];
  retentionPeriod: number; // in days
  processingDate: Date;
  isAnonymized: boolean;
  consentWithdrawn?: boolean;
}

interface ConsentRecord {
  userId: string;
  consentType: 'functional' | 'analytics' | 'marketing' | 'medical_research' | 'data_sharing';
  consentGiven: boolean;
  consentDate: Date;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  ipAddress?: string;
  userAgent?: string;
  withdrawalDate?: Date;
  isActive: boolean;
}

// Create Supabase client for GDPR operations
async function createSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    ENV_VARS.SUPABASE_URL,
    ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Log GDPR-related activities for audit trail
function logGDPRActivity(
  activity: string,
  userId: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'error' = 'info'
) {
  const logData = {
    gdprActivity: activity,
    userId: userId.substring(0, 8) + '...', // Partial user ID for privacy
    timestamp: new Date().toISOString(),
    compliance_framework: 'GDPR',
    ...details
  };

  switch (severity) {
    case 'error':
      logError(`GDPR: ${activity}`, logData);
      break;
    case 'warning':
      logWarning(`GDPR: ${activity}`, logData);
      break;
    default:
      logInfo(`GDPR: ${activity}`, logData);
  }
}

// Data anonymization functions
export class DataAnonymizer {
  // Anonymize search queries while preserving medical relevance
  static anonymizeSearchQuery(query: string): string {
    // Remove potential personal identifiers
    const anonymized = query
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]') // Likely names
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // Social Security Numbers
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]') // Credit card numbers
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email addresses
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(/\b(?:patient|my|i have|i am)\b/gi, '[PERSONAL]'); // Personal references
    
    return anonymized.trim();
  }

  // Anonymize user feedback while preserving medical context
  static anonymizeFeedback(feedback: string): string {
    return feedback
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
      .replace(/age \d+/gi, 'age [AGE]')
      .replace(/\b\d+ years? old\b/gi, '[AGE] years old')
      .replace(/\b(?:my|i|me|myself)\b/gi, '[USER]');
  }

  // Generate anonymized analytics data
  static createAnonymizedAnalytics(data: any): any {
    return {
      ...data,
      userId: this.hashUserId(data.userId),
      ipAddress: data.ipAddress ? this.anonymizeIP(data.ipAddress) : undefined,
      personalIdentifiers: 'removed',
      anonymizedAt: new Date().toISOString()
    };
  }

  // Hash user ID for analytics while maintaining uniqueness
  static hashUserId(userId: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(userId + ENV_VARS.GDPR_SALT || 'default-salt')
      .digest('hex')
      .substring(0, 16);
  }

  // Anonymize IP address (remove last octet)
  static anonymizeIP(ipAddress: string): string {
    if (ipAddress.includes(':')) {
      // IPv6 - remove last 32 bits
      const parts = ipAddress.split(':');
      return parts.slice(0, -2).join(':') + '::0';
    } else {
      // IPv4 - remove last octet
      const parts = ipAddress.split('.');
      return parts.slice(0, 3).join('.') + '.0';
    }
  }
}

// GDPR consent management
export class ConsentManager {
  // Record user consent
  static async recordConsent(consent: Omit<ConsentRecord, 'isActive'>): Promise<void> {
    try {
      const supabase = await createSupabaseClient();
      
      // Deactivate previous consent records for this type
      await supabase
        .from('user_consent_records')
        .update({ isActive: false })
        .eq('user_id', consent.userId)
        .eq('consent_type', consent.consentType);

      // Insert new consent record
      const { error } = await supabase
        .from('user_consent_records')
        .insert({
          ...consent,
          isActive: true
        });

      if (error) {
        throw error;
      }

      logGDPRActivity('consent_recorded', consent.userId, {
        consentType: consent.consentType,
        consentGiven: consent.consentGiven,
        method: consent.consentMethod
      });

    } catch (error) {
      logGDPRActivity('consent_recording_failed', consent.userId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        consentType: consent.consentType
      }, 'error');
      throw error;
    }
  }

  // Check if user has given consent for specific processing
  static async hasConsent(userId: string, consentType: ConsentRecord['consentType']): Promise<boolean> {
    try {
      const supabase = await createSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_consent_records')
        .select('consent_given')
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data?.consent_given || false;
    } catch (error) {
      logGDPRActivity('consent_check_failed', userId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        consentType
      }, 'error');
      return false; // Fail safely - no consent
    }
  }

  // Withdraw consent
  static async withdrawConsent(userId: string, consentType: ConsentRecord['consentType']): Promise<void> {
    try {
      const supabase = await createSupabaseClient();
      
      const { error } = await supabase
        .from('user_consent_records')
        .update({
          consent_given: false,
          withdrawal_date: new Date().toISOString(),
          is_active: false
        })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      logGDPRActivity('consent_withdrawn', userId, {
        consentType,
        withdrawalDate: new Date().toISOString()
      });

      // Trigger data processing restriction for withdrawn consent
      await this.applyDataProcessingRestriction(userId, consentType);

    } catch (error) {
      logGDPRActivity('consent_withdrawal_failed', userId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        consentType
      }, 'error');
      throw error;
    }
  }

  // Apply data processing restrictions when consent is withdrawn
  private static async applyDataProcessingRestriction(
    userId: string, 
    consentType: ConsentRecord['consentType']
  ): Promise<void> {
    // Mark relevant data processing records as restricted
    const supabase = await createSupabaseClient();
    
    const { error } = await supabase
      .from('data_processing_records')
      .update({ consent_withdrawn: true })
      .eq('user_id', userId)
      .eq('legal_basis', 'consent')
      .contains('processing_purpose', consentType);

    if (error) {
      logGDPRActivity('restriction_application_failed', userId, {
        error: error.message,
        consentType
      }, 'error');
    }
  }
}

// Data subject rights handler
export class DataSubjectRights {
  // Process right of access request (Article 15)
  static async processAccessRequest(userId: string): Promise<{
    personalData: any;
    processingInfo: any;
    exportFormat: 'json' | 'xml' | 'pdf';
  }> {
    try {
      const supabase = await createSupabaseClient();

      // Collect all personal data
      const [profile, searchHistory, documents, consents, processingRecords] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('search_history').select('*').eq('user_id', userId),
        supabase.from('user_documents').select('*').eq('user_id', userId),
        supabase.from('user_consent_records').select('*').eq('user_id', userId),
        supabase.from('data_processing_records').select('*').eq('user_id', userId)
      ]);

      const personalData = {
        profile: profile.data,
        searchHistory: searchHistory.data?.map(sh => ({
          ...sh,
          query: DataAnonymizer.anonymizeSearchQuery(sh.query) // Anonymize other users' data if mixed
        })),
        documents: documents.data,
        consents: consents.data,
        lastUpdated: new Date().toISOString()
      };

      const processingInfo = {
        processingRecords: processingRecords.data,
        dataRetentionInfo: await this.getDataRetentionInfo(userId),
        recipientInfo: await this.getRecipientInfo(userId),
        transferInfo: await this.getTransferInfo(userId)
      };

      logGDPRActivity('access_request_processed', userId, {
        dataCategories: Object.keys(personalData),
        totalRecords: Object.values(personalData).reduce((sum, arr) => 
          sum + (Array.isArray(arr) ? arr.length : 1), 0)
      });

      return {
        personalData,
        processingInfo,
        exportFormat: 'json'
      };

    } catch (error) {
      logGDPRActivity('access_request_failed', userId, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
      throw error;
    }
  }

  // Process right of erasure request (Article 17)
  static async processErasureRequest(
    userId: string, 
    reason: 'withdrawal' | 'no_longer_necessary' | 'unlawful' | 'compliance'
  ): Promise<{ deletedRecords: Record<string, number>; retainedRecords: Record<string, string> }> {
    try {
      const supabase = await createSupabaseClient();
      const deletedRecords: Record<string, number> = {};
      const retainedRecords: Record<string, string> = {};

      // Check if data can be deleted (legal obligations, public interest, etc.)
      const retentionRequirements = await this.checkRetentionRequirements(userId);

      // Delete personal data where legally possible
      const tablesToDelete = [
        'search_history',
        'user_documents', 
        'user_consent_records',
        'content_quality_metrics'
      ];

      for (const table of tablesToDelete) {
        if (retentionRequirements[table]) {
          retainedRecords[table] = retentionRequirements[table];
          continue;
        }

        const { error, count } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        deletedRecords[table] = count || 0;
      }

      // Anonymize data that cannot be deleted
      await this.anonymizeRetainedData(userId, Object.keys(retainedRecords));

      // Delete or anonymize profile last
      if (!retentionRequirements.profiles) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (!error) {
          deletedRecords.profiles = 1;
        }
      } else {
        await this.anonymizeProfile(userId);
        retainedRecords.profiles = retentionRequirements.profiles;
      }

      logGDPRActivity('erasure_request_processed', userId, {
        reason,
        deletedRecords,
        retainedRecords,
        totalDeleted: Object.values(deletedRecords).reduce((sum, count) => sum + count, 0)
      });

      return { deletedRecords, retainedRecords };

    } catch (error) {
      logGDPRActivity('erasure_request_failed', userId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        reason
      }, 'error');
      throw error;
    }
  }

  // Process data portability request (Article 20)
  static async processPortabilityRequest(userId: string, format: 'json' | 'xml' | 'csv' = 'json'): Promise<Buffer> {
    try {
      const accessData = await this.processAccessRequest(userId);
      
      let exportData: Buffer;
      
      switch (format) {
        case 'xml':
          exportData = Buffer.from(this.convertToXML(accessData.personalData));
          break;
        case 'csv':
          exportData = Buffer.from(this.convertToCSV(accessData.personalData));
          break;
        default:
          exportData = Buffer.from(JSON.stringify(accessData.personalData, null, 2));
      }

      logGDPRActivity('portability_request_processed', userId, {
        format,
        dataSize: exportData.length,
        timestamp: new Date().toISOString()
      });

      return exportData;

    } catch (error) {
      logGDPRActivity('portability_request_failed', userId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        format
      }, 'error');
      throw error;
    }
  }

  // Helper methods
  private static async getDataRetentionInfo(userId: string): Promise<Record<string, any>> {
    // Implementation depends on your retention policies
    return {
      searchHistory: '2 years from last activity',
      documents: '5 years for medical records, 2 years for general documents',
      consents: '7 years for legal compliance',
      analytics: '3 years, anonymized after 1 year'
    };
  }

  private static async getRecipientInfo(userId: string): Promise<string[]> {
    return [
      'Internal medical review team',
      'Third-party analytics providers (anonymized data only)',
      'Legal authorities (when required by law)'
    ];
  }

  private static async getTransferInfo(userId: string): Promise<Record<string, any>> {
    return {
      internationalTransfers: false,
      adequacyDecisions: [],
      safeguards: 'EU-US Privacy Framework compliance'
    };
  }

  private static async checkRetentionRequirements(userId: string): Promise<Record<string, string>> {
    // Check legal obligations that prevent data deletion
    return {
      // profiles: 'Medical license verification records must be retained for 7 years',
      // search_history: 'Research data anonymized and retained for medical research'
    };
  }

  private static async anonymizeRetainedData(userId: string, tables: string[]): Promise<void> {
    const supabase = await createSupabaseClient();
    
    for (const table of tables) {
      // Apply anonymization based on table structure
      if (table === 'search_history') {
        await supabase
          .from(table)
          .update({
            query: 'ANONYMIZED',
            user_id: DataAnonymizer.hashUserId(userId)
          })
          .eq('user_id', userId);
      }
      // Add other table-specific anonymization logic
    }
  }

  private static async anonymizeProfile(userId: string): Promise<void> {
    const supabase = await createSupabaseClient();
    
    await supabase
      .from('profiles')
      .update({
        full_name: 'ANONYMIZED USER',
        email: 'anonymized@example.com',
        medical_specialty: null,
        anonymized_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  private static convertToXML(data: any): string {
    // Simple XML conversion - in production, use a proper XML library
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<personalData>\n';
    const xmlFooter = '</personalData>';
    const xmlBody = JSON.stringify(data).replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return char;
      }
    });
    return xmlHeader + `<data>${xmlBody}</data>\n` + xmlFooter;
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - flatten the data structure
    const rows: string[] = ['Category,Field,Value'];
    
    function flatten(obj: any, category: string = '') {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              flatten(item, `${category}${key}[${index}]`);
            } else {
              rows.push(`${category}${key}[${index}],"${key}","${item}"`);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          flatten(value, `${category}${key}.`);
        } else {
          rows.push(`${category},"${key}","${value}"`);
        }
      });
    }
    
    flatten(data);
    return rows.join('\n');
  }
}

// Data retention policy enforcement
export class DataRetentionEnforcer {
  // Enforce retention policies across all user data
  static async enforceRetentionPolicies(): Promise<{
    deleted: Record<string, number>;
    anonymized: Record<string, number>;
    errors: string[];
  }> {
    const results = {
      deleted: {} as Record<string, number>,
      anonymized: {} as Record<string, number>,
      errors: [] as string[]
    };

    try {
      const supabase = await createSupabaseClient();

      // Delete expired search cache entries
      const { count: deletedCache } = await supabase
        .from('search_result_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      results.deleted.search_cache = deletedCache || 0;

      // Anonymize old search history (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { data: oldSearches } = await supabase
        .from('search_history')
        .select('id, user_id, query')
        .lt('created_at', oneYearAgo.toISOString())
        .eq('query', 'ANONYMIZED', false); // Not already anonymized

      if (oldSearches) {
        for (const search of oldSearches) {
          const { error } = await supabase
            .from('search_history')
            .update({
              query: DataAnonymizer.anonymizeSearchQuery(search.query),
              user_id: DataAnonymizer.hashUserId(search.user_id),
              anonymized_at: new Date().toISOString()
            })
            .eq('id', search.id);

          if (error) {
            results.errors.push(`Failed to anonymize search ${search.id}: ${error.message}`);
          }
        }
        
        results.anonymized.search_history = oldSearches.length;
      }

      // Delete old error logs (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { count: deletedLogs } = await supabase
        .from('api_error_logs')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
        .eq('resolved', true);
      
      results.deleted.error_logs = deletedLogs || 0;

      logGDPRActivity('retention_policy_enforced', 'system', {
        deleted: results.deleted,
        anonymized: results.anonymized,
        errorCount: results.errors.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Retention enforcement failed: ${errorMessage}`);
      
      logGDPRActivity('retention_enforcement_failed', 'system', {
        error: errorMessage
      }, 'error');
    }

    return results;
  }
}

// Export main utilities
export {
  DataAnonymizer,
  ConsentManager,
  DataSubjectRights,
  DataRetentionEnforcer,
  logGDPRActivity
};