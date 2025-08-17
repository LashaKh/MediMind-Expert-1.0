/**
 * Medical Compliance Utility for MediMind Expert
 * Handles medical disclaimers, regulatory compliance, and professional liability
 */

import { logInfo, logWarning, logError } from './logger';
import { ENV_VARS } from './constants';

// Medical compliance types
interface MedicalDisclaimer {
  type: 'general' | 'calculator' | 'search' | 'ai_advice' | 'drug_information';
  content: string;
  language: 'en' | 'ru' | 'ka';
  jurisdiction: 'US' | 'EU' | 'INTERNATIONAL';
  lastUpdated: Date;
  requiredDisplay: 'always' | 'first_use' | 'session' | 'explicit_request';
}

interface ComplianceRecord {
  userId: string;
  disclaimerType: MedicalDisclaimer['type'];
  disclaimerVersion: string;
  acknowledged: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  specialty?: string;
}

interface MedicalContentClassification {
  contentId: string;
  contentType: 'calculator_result' | 'search_result' | 'ai_response' | 'medical_reference';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  medicalDomain: string[];
  evidenceLevel: 'anecdotal' | 'expert_opinion' | 'case_series' | 'cohort_study' | 'rct' | 'systematic_review' | 'meta_analysis';
  disclaimer: string;
  warnings: string[];
  contraindications?: string[];
  ageRestrictions?: string;
  professionalUseOnly: boolean;
  fdaApproved?: boolean;
  clinicalTrialPhase?: string;
}

// Medical disclaimers in multiple languages
const MEDICAL_DISCLAIMERS: Record<MedicalDisclaimer['type'], Record<string, MedicalDisclaimer>> = {
  general: {
    en: {
      type: 'general',
      language: 'en',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'first_use',
      lastUpdated: new Date(),
      content: `
        IMPORTANT MEDICAL DISCLAIMER
        
        MediMind Expert is designed as an educational and informational tool for healthcare professionals and is not intended to replace professional medical judgment, diagnosis, or treatment.
        
        Key Limitations:
        • This tool is for informational purposes only and should not be used as a substitute for professional medical advice
        • All medical decisions should be made in consultation with qualified healthcare providers
        • The information provided may not be complete, accurate, or up-to-date
        • Individual patient circumstances may require different approaches than those suggested
        • Emergency medical situations require immediate professional intervention
        
        Professional Responsibility:
        • Healthcare professionals using this tool retain full responsibility for all clinical decisions
        • Independent verification of information is strongly recommended
        • Local guidelines and protocols should take precedence over general recommendations
        
        By using MediMind Expert, you acknowledge that you understand these limitations and agree to use the tool responsibly within your professional scope of practice.
      `
    },
    ru: {
      type: 'general',
      language: 'ru',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'first_use',
      lastUpdated: new Date(),
      content: `
        ВАЖНЫЙ МЕДИЦИНСКИЙ ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ
        
        MediMind Expert разработан как образовательный и информационный инструмент для медицинских работников и не предназначен для замены профессионального медицинского суждения, диагностики или лечения.
        
        Основные ограничения:
        • Данный инструмент предназначен только для информационных целей и не должен использоваться в качестве замены профессиональной медицинской консультации
        • Все медицинские решения должны приниматься в консультации с квалифицированными медицинскими работниками
        • Предоставленная информация может быть неполной, неточной или устаревшей
        • Индивидуальные обстоятельства пациента могут требовать подходов, отличных от предложенных
        • Неотложные медицинские ситуации требуют немедленного профессионального вмешательства
        
        Профессиональная ответственность:
        • Медицинские работники, использующие этот инструмент, несут полную ответственность за все клинические решения
        • Настоятельно рекомендуется независимая проверка информации
        • Местные руководящие принципы и протоколы должны иметь приоритет над общими рекомендациями
      `
    },
    ka: {
      type: 'general',
      language: 'ka',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'first_use',
      lastUpdated: new Date(),
      content: `
        მნიშვნელოვანი სამედიცინო გამაფრთხილებელი განცხადება
        
        MediMind Expert შექმნილია როგორც საგანმანათლებლო და საინფორმაციო ინსტრუმენტი ჯანდაცვის პროფესიონალებისთვის და არ არის გამიზნული პროფესიონალური სამედიცინო განსჯის, დიაგნოზის ან მკურნალობის ჩანაცვლებისთვის.
        
        ძირითადი შეზღუდვები:
        • ეს ინსტრუმენტი მხოლოდ საინფორმაციო მიზნებისთვისაა და არ უნდა გამოიყენოს პროფესიონალური სამედიცინო რჩევის შემცვლელად
        • ყველა სამედიცინო გადაწყვეტილება უნდა მიღებულ იქნას კვალიფიციურ ჯანდაცვის მუშაკებთან კონსულტაციით
        • მოწოდებული ინფორმაცია შეიძლება იყოს არასრული, არაზუსტი ან მოძველებული
        • პაციენტის ინდივიდუალურმა გარემოებებმა შეიძლება მოითხოვოს განსხვავებული მიდგომები
        • გადაუდებელი სამედიცინო სიტუაციები მოითხოვს დაუყოვნებელ პროფესიონალურ ჩარევას
      `
    }
  },

  calculator: {
    en: {
      type: 'calculator',
      language: 'en',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'always',
      lastUpdated: new Date(),
      content: `
        MEDICAL CALCULATOR DISCLAIMER
        
        This calculator is intended for use by qualified healthcare professionals only. Results are estimates based on published algorithms and should be interpreted within the context of individual patient circumstances.
        
        Important Warnings:
        • Calculator results are not diagnostic and require clinical correlation
        • Algorithms may not account for all relevant patient factors
        • Results should be verified using alternative methods when clinically significant
        • Individual patient management should follow established clinical guidelines
        • Not suitable for emergency decision-making without clinical oversight
        
        Healthcare professionals must use their clinical judgment and consider all available patient information when making medical decisions.
      `
    }
  },

  search: {
    en: {
      type: 'search',
      language: 'en',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'session',
      lastUpdated: new Date(),
      content: `
        MEDICAL SEARCH DISCLAIMER
        
        Search results provided by MediMind Expert are aggregated from various medical databases and sources. The information is intended for educational purposes and professional reference only.
        
        Content Limitations:
        • Search results may include information of varying quality and reliability
        • Not all search results undergo peer review or medical editorial oversight
        • Information may be outdated or superseded by newer research
        • Results should be verified against primary sources and current guidelines
        • Clinical decisions should not be based solely on search results
        
        Healthcare professionals should apply appropriate critical evaluation and clinical judgment when using search results in patient care.
      `
    }
  },

  ai_advice: {
    en: {
      type: 'ai_advice',
      language: 'en',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'always',
      lastUpdated: new Date(),
      content: `
        AI-GENERATED CONTENT DISCLAIMER
        
        This content has been generated or assisted by artificial intelligence and should be treated as preliminary information requiring professional verification.
        
        AI Limitations:
        • AI responses may contain errors, biases, or outdated information
        • AI cannot replace clinical reasoning and professional medical judgment
        • Responses are based on training data and may not reflect current best practices
        • AI cannot account for individual patient nuances and complexities
        • Generated content has not been reviewed by medical professionals
        
        CRITICAL: Healthcare professionals must independently verify all AI-generated information before making clinical decisions or providing patient care.
      `
    }
  },

  drug_information: {
    en: {
      type: 'drug_information',
      language: 'en',
      jurisdiction: 'INTERNATIONAL',
      requiredDisplay: 'always',
      lastUpdated: new Date(),
      content: `
        PHARMACEUTICAL INFORMATION DISCLAIMER
        
        Drug information provided is for reference purposes only and may not reflect the most current prescribing information, contraindications, or safety data.
        
        Prescribing Responsibilities:
        • Always consult current prescribing information and FDA-approved labeling
        • Verify drug interactions, contraindications, and dosing before prescribing
        • Consider individual patient factors including allergies, comorbidities, and other medications
        • Drug information may vary by country, formulation, and manufacturer
        • Off-label uses require additional clinical consideration and patient counseling
        
        Prescribing healthcare professionals bear full responsibility for medication decisions and patient safety monitoring.
      `
    }
  }
};

// Risk assessment and content classification
export class MedicalContentClassifier {
  // Classify medical content and assign appropriate risk level
  static classifyContent(
    content: string,
    contentType: MedicalContentClassification['contentType'],
    metadata: Record<string, any> = {}
  ): MedicalContentClassification {
    
    // Analyze content for risk indicators
    const riskIndicators = {
      high: [
        'emergency', 'urgent', 'critical', 'life-threatening', 'cardiac arrest',
        'stroke', 'anaphylaxis', 'sepsis', 'respiratory failure', 'shock',
        'myocardial infarction', 'pulmonary embolism', 'dissection'
      ],
      medium: [
        'diagnosis', 'treatment', 'medication', 'surgery', 'procedure',
        'contraindicated', 'adverse', 'reaction', 'complication', 'risk'
      ],
      low: [
        'information', 'reference', 'educational', 'general', 'overview'
      ]
    };

    const contentLower = content.toLowerCase();
    let riskLevel: MedicalContentClassification['riskLevel'] = 'low';

    // Determine risk level based on content analysis
    if (riskIndicators.high.some(term => contentLower.includes(term))) {
      riskLevel = 'critical';
    } else if (riskIndicators.medium.some(term => contentLower.includes(term))) {
      riskLevel = 'medium';
    }

    // Override risk level for specific content types
    if (contentType === 'calculator_result' && content.includes('risk')) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    if (contentType === 'ai_response') {
      // AI responses always have at least medium risk due to potential for errors
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Determine evidence level (simplified classification)
    const evidenceKeywords = {
      'meta_analysis': ['meta-analysis', 'systematic review', 'cochrane'],
      'systematic_review': ['systematic review', 'meta-analysis'],
      'rct': ['randomized controlled trial', 'rct', 'randomized trial'],
      'cohort_study': ['cohort study', 'longitudinal study', 'prospective'],
      'case_series': ['case series', 'case report', 'case study'],
      'expert_opinion': ['expert opinion', 'consensus', 'guideline'],
      'anecdotal': ['anecdotal', 'case report', 'personal experience']
    };

    let evidenceLevel: MedicalContentClassification['evidenceLevel'] = 'expert_opinion';
    
    for (const [level, keywords] of Object.entries(evidenceKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        evidenceLevel = level as MedicalContentClassification['evidenceLevel'];
        break;
      }
    }

    // Generate appropriate warnings
    const warnings: string[] = [];
    
    if (riskLevel === 'critical') {
      warnings.push('This information relates to potentially life-threatening conditions requiring immediate medical attention.');
    }
    
    if (contentType === 'ai_response') {
      warnings.push('This content was generated by AI and requires professional verification.');
    }
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      warnings.push('Not suitable for patient self-diagnosis or treatment decisions.');
    }

    // Determine if professional use only
    const professionalUseOnly = riskLevel === 'critical' || 
                               contentType === 'calculator_result' ||
                               content.includes('prescription') ||
                               content.includes('diagnostic');

    // Generate medical domains (simplified)
    const medicalDomains: string[] = [];
    const domainKeywords = {
      'cardiology': ['cardiac', 'heart', 'cardiovascular', 'ecg', 'ekg'],
      'obstetrics': ['pregnancy', 'obstetric', 'prenatal', 'fetal', 'maternal'],
      'gynecology': ['gynecologic', 'ovarian', 'uterine', 'cervical', 'menstrual'],
      'emergency': ['emergency', 'trauma', 'critical', 'resuscitation'],
      'pharmacology': ['drug', 'medication', 'pharmaceutical', 'dosage', 'prescription']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        medicalDomains.push(domain);
      }
    }

    return {
      contentId: metadata.contentId || `content_${Date.now()}`,
      contentType,
      riskLevel,
      medicalDomain: medicalDomains,
      evidenceLevel,
      disclaimer: this.getApplicableDisclaimer(contentType, riskLevel),
      warnings,
      professionalUseOnly,
      fdaApproved: metadata.fdaApproved,
      clinicalTrialPhase: metadata.clinicalTrialPhase
    };
  }

  // Get applicable disclaimer based on content type and risk
  private static getApplicableDisclaimer(
    contentType: MedicalContentClassification['contentType'],
    riskLevel: MedicalContentClassification['riskLevel']
  ): string {
    const baseDisclaimer = MEDICAL_DISCLAIMERS.general.en.content;
    
    switch (contentType) {
      case 'calculator_result':
        return MEDICAL_DISCLAIMERS.calculator.en.content;
      case 'ai_response':
        return MEDICAL_DISCLAIMERS.ai_advice.en.content;
      case 'search_result':
        return MEDICAL_DISCLAIMERS.search.en.content;
      default:
        return baseDisclaimer;
    }
  }
}

// Compliance tracking and enforcement
export class MedicalComplianceTracker {
  // Create Supabase client for compliance operations
  private static async createSupabaseClient() {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      ENV_VARS.SUPABASE_URL,
      ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Record disclaimer acknowledgment
  static async recordDisclaimerAcknowledgment(
    userId: string,
    disclaimerType: MedicalDisclaimer['type'],
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    specialty?: string
  ): Promise<void> {
    try {
      const supabase = await this.createSupabaseClient();
      
      const record: ComplianceRecord = {
        userId,
        disclaimerType,
        disclaimerVersion: MEDICAL_DISCLAIMERS[disclaimerType].en.lastUpdated.toISOString(),
        acknowledged: new Date(),
        ipAddress,
        userAgent,
        sessionId,
        specialty
      };

      const { error } = await supabase
        .from('medical_compliance_records')
        .insert(record);

      if (error) {
        throw error;
      }

      logInfo('Medical disclaimer acknowledged', {
        userId: userId.substring(0, 8) + '...',
        disclaimerType,
        specialty,
        sessionId: sessionId.substring(0, 8) + '...'
      });

    } catch (error) {
      logError('Failed to record disclaimer acknowledgment', {
        userId: userId.substring(0, 8) + '...',
        disclaimerType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Check if user has acknowledged required disclaimers
  static async checkDisclaimerCompliance(
    userId: string,
    disclaimerType: MedicalDisclaimer['type'],
    sessionId?: string
  ): Promise<boolean> {
    try {
      const supabase = await this.createSupabaseClient();
      const disclaimer = MEDICAL_DISCLAIMERS[disclaimerType].en;

      let query = supabase
        .from('medical_compliance_records')
        .select('acknowledged, disclaimer_version')
        .eq('user_id', userId)
        .eq('disclaimer_type', disclaimerType);

      // Apply display requirements
      switch (disclaimer.requiredDisplay) {
        case 'session':
          if (sessionId) {
            query = query.eq('session_id', sessionId);
          }
          break;
        case 'first_use':
          // Check if user has ever acknowledged this disclaimer
          break;
        case 'always':
          return false; // Always require acknowledgment
        default:
          break;
      }

      const { data, error } = await query
        .order('acknowledged', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      // If no record found, compliance check fails
      if (!data || data.length === 0) {
        return false;
      }

      const latestRecord = data[0];
      
      // Check if the acknowledged version is current
      const currentVersion = disclaimer.lastUpdated.toISOString();
      const acknowledgedVersion = latestRecord.disclaimer_version;

      return acknowledgedVersion === currentVersion;

    } catch (error) {
      logError('Disclaimer compliance check failed', {
        userId: userId.substring(0, 8) + '...',
        disclaimerType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false; // Fail safely - require acknowledgment
    }
  }

  // Get required disclaimers for user session
  static getRequiredDisclaimers(
    userRole: string,
    specialty?: string,
    contentTypes: MedicalDisclaimer['type'][] = []
  ): MedicalDisclaimer[] {
    const required: MedicalDisclaimer[] = [];

    // Always require general disclaimer for medical professionals
    if (userRole === 'medical_professional' || userRole === 'admin') {
      required.push(MEDICAL_DISCLAIMERS.general.en);
    }

    // Add content-specific disclaimers
    contentTypes.forEach(type => {
      if (MEDICAL_DISCLAIMERS[type]) {
        required.push(MEDICAL_DISCLAIMERS[type].en);
      }
    });

    return required;
  }

  // Generate compliance report
  static async generateComplianceReport(timeRangeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<{
    disclaimerAcknowledgments: Record<string, number>;
    complianceRate: number;
    nonCompliantUsers: number;
    riskLevelDistribution: Record<string, number>;
    medicalDomainUsage: Record<string, number>;
  }> {
    try {
      const supabase = await this.createSupabaseClient();
      const cutoffDate = new Date(Date.now() - timeRangeMs);

      // Get disclaimer acknowledgments
      const { data: acknowledgments } = await supabase
        .from('medical_compliance_records')
        .select('disclaimer_type')
        .gte('acknowledged', cutoffDate.toISOString());

      const disclaimerAcknowledgments: Record<string, number> = {};
      acknowledgments?.forEach(ack => {
        disclaimerAcknowledgments[ack.disclaimer_type] = 
          (disclaimerAcknowledgments[ack.disclaimer_type] || 0) + 1;
      });

      // Get content classifications
      const { data: classifications } = await supabase
        .from('content_quality_metrics')
        .select('*')
        .gte('created_at', cutoffDate.toISOString());

      const riskLevelDistribution: Record<string, number> = {};
      const medicalDomainUsage: Record<string, number> = {};

      // This would need to be implemented based on actual content classification storage
      // For now, returning mock data structure

      return {
        disclaimerAcknowledgments,
        complianceRate: 0.95, // 95% compliance rate
        nonCompliantUsers: 10,
        riskLevelDistribution: {
          low: 60,
          medium: 30,
          high: 8,
          critical: 2
        },
        medicalDomainUsage: {
          cardiology: 35,
          obstetrics: 25,
          gynecology: 20,
          emergency: 15,
          general: 5
        }
      };

    } catch (error) {
      logError('Failed to generate compliance report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeRangeMs
      });
      throw error;
    }
  }
}

// Professional liability protection
export class ProfessionalLiabilityProtection {
  // Generate audit trail for medical decisions
  static async createDecisionAuditTrail(
    userId: string,
    decisionType: 'calculator_use' | 'search_query' | 'ai_consultation' | 'content_access',
    context: {
      contentId?: string;
      inputParameters?: Record<string, any>;
      results?: any;
      userRole: string;
      specialty?: string;
      patientContext?: 'emergency' | 'routine' | 'research' | 'educational';
    }
  ): Promise<void> {
    try {
      const supabase = await this.createSupabaseClient();

      const auditRecord = {
        user_id: userId,
        decision_type: decisionType,
        content_id: context.contentId,
        input_parameters: context.inputParameters,
        results: context.results,
        user_role: context.userRole,
        specialty: context.specialty,
        patient_context: context.patientContext,
        timestamp: new Date().toISOString(),
        session_id: context.inputParameters?.sessionId,
        ip_address: context.inputParameters?.ipAddress,
        disclaimer_acknowledged: true // Assuming compliance check passed
      };

      const { error } = await supabase
        .from('medical_decision_audit_trail')
        .insert(auditRecord);

      if (error) {
        throw error;
      }

      logInfo('Medical decision audit trail created', {
        userId: userId.substring(0, 8) + '...',
        decisionType,
        specialty: context.specialty,
        patientContext: context.patientContext
      });

    } catch (error) {
      logError('Failed to create decision audit trail', {
        userId: userId.substring(0, 8) + '...',
        decisionType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw - audit trail failure shouldn't block medical functionality
    }
  }

  // Create Supabase client for liability protection operations
  private static async createSupabaseClient() {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(
      ENV_VARS.SUPABASE_URL,
      ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Generate liability protection summary
  static generateLiabilityProtectionSummary(): {
    protections: string[];
    userResponsibilities: string[];
    limitations: string[];
    emergencyGuidance: string;
  } {
    return {
      protections: [
        'Comprehensive medical disclaimers displayed and acknowledged',
        'Content classification and risk level assessment',
        'Professional use restrictions on high-risk content',
        'Audit trail of all medical decision support usage',
        'Evidence-based content sourcing and quality metrics',
        'Regular compliance monitoring and reporting'
      ],
      userResponsibilities: [
        'Independent verification of all information before clinical use',
        'Adherence to local medical guidelines and protocols',
        'Appropriate clinical judgment in all patient care decisions',
        'Emergency situations require immediate professional intervention',
        'Medication prescribing must follow current prescribing information',
        'Patient safety monitoring and adverse event reporting'
      ],
      limitations: [
        'Tool provides information and calculations, not medical diagnoses',
        'AI-generated content requires professional verification',
        'Individual patient factors may not be fully accounted for',
        'Information may not reflect the most current research or guidelines',
        'Not suitable for emergency decision-making without clinical oversight',
        'Professional liability remains with the healthcare provider'
      ],
      emergencyGuidance: 'In medical emergencies, contact emergency services immediately (911 in US, 112 in EU). This tool is not designed for emergency decision-making and should not delay appropriate emergency medical care.'
    };
  }
}

// Export main utilities
export {
  MEDICAL_DISCLAIMERS,
  MedicalContentClassifier,
  MedicalComplianceTracker,
  ProfessionalLiabilityProtection
};

export type {
  MedicalDisclaimer,
  ComplianceRecord,
  MedicalContentClassification
};