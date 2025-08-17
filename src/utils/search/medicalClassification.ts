/**
 * Medical Classification Utilities
 * Handles evidence level determination and medical content classification
 */

export enum EvidenceLevel {
  SYSTEMATIC_REVIEW = 'systematic_review',
  RANDOMIZED_CONTROLLED_TRIAL = 'randomized_controlled_trial',
  COHORT_STUDY = 'cohort_study',
  CASE_CONTROL_STUDY = 'case_control_study',
  CASE_SERIES = 'case_series',
  EXPERT_OPINION = 'expert_opinion',
  GUIDELINE = 'guideline',
  REVIEW_ARTICLE = 'review_article'
}

export enum MedicalSpecialty {
  CARDIOLOGY = 'cardiology',
  OBSTETRICS_GYNECOLOGY = 'obstetrics_gynecology',
  INTERNAL_MEDICINE = 'internal_medicine',
  EMERGENCY_MEDICINE = 'emergency_medicine',
  PEDIATRICS = 'pediatrics',
  SURGERY = 'surgery',
  RADIOLOGY = 'radiology',
  PATHOLOGY = 'pathology'
}

export enum ContentType {
  RESEARCH_PAPER = 'research_paper',
  CLINICAL_GUIDELINE = 'clinical_guideline',
  CASE_REPORT = 'case_report',
  MEDICAL_NEWS = 'medical_news',
  EDUCATIONAL_MATERIAL = 'educational_material',
  DRUG_INFORMATION = 'drug_information',
  CALCULATOR = 'calculator'
}

export interface ClassificationResult {
  evidenceLevel: EvidenceLevel;
  confidence: number;
  specialty: MedicalSpecialty[];
  contentType: ContentType;
  reasoning: string;
}

export class MedicalClassifier {
  
  /**
   * Classify medical content based on title, snippet, and source
   */
  static classifyContent(
    title: string,
    snippet: string,
    source: string,
    url: string
  ): ClassificationResult {
    const evidenceLevel = this.determineEvidenceLevel(title, snippet, source);
    const specialties = this.identifySpecialties(title, snippet);
    const contentType = this.classifyContentType(title, snippet, source, url);
    
    // Generate reasoning based on classification factors
    const reasoning = this.generateClassificationReasoning(
      evidenceLevel, specialties, contentType, source
    );
    
    return {
      evidenceLevel: evidenceLevel.level,
      confidence: (evidenceLevel.confidence + specialties.confidence + contentType.confidence) / 3,
      specialty: specialties.specialties,
      contentType: contentType.type,
      reasoning
    };
  }

  /**
   * Determine evidence level from publication characteristics
   */
  static determineEvidenceLevel(
    title: string,
    snippet: string,
    source: string
  ): { level: EvidenceLevel; confidence: number } {
    const text = `${title} ${snippet} ${source}`.toLowerCase();
    
    // High confidence evidence patterns
    if (this.matchesPattern(text, [
      'systematic review', 'meta-analysis', 'cochrane', 'systematic literature review'
    ])) {
      return { level: EvidenceLevel.SYSTEMATIC_REVIEW, confidence: 0.95 };
    }
    
    if (this.matchesPattern(text, [
      'randomized controlled trial', 'rct', 'double-blind', 'placebo-controlled',
      'randomized trial', 'clinical trial'
    ])) {
      return { level: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL, confidence: 0.9 };
    }
    
    // Guidelines and recommendations
    if (this.matchesPattern(text, [
      'guideline', 'recommendation', 'consensus', 'statement', 'practice parameter',
      'clinical practice', 'aha/acc', 'esc guideline', 'acog'
    ]) || source.includes('guidelines')) {
      return { level: EvidenceLevel.GUIDELINE, confidence: 0.85 };
    }
    
    // Cohort studies
    if (this.matchesPattern(text, [
      'cohort study', 'prospective study', 'longitudinal study', 'follow-up study'
    ])) {
      return { level: EvidenceLevel.COHORT_STUDY, confidence: 0.8 };
    }
    
    // Case-control studies
    if (this.matchesPattern(text, [
      'case-control', 'case control', 'retrospective study'
    ])) {
      return { level: EvidenceLevel.CASE_CONTROL_STUDY, confidence: 0.75 };
    }
    
    // Case series/reports
    if (this.matchesPattern(text, [
      'case series', 'case report', 'case study'
    ])) {
      return { level: EvidenceLevel.CASE_SERIES, confidence: 0.7 };
    }
    
    // Review articles
    if (this.matchesPattern(text, [
      'review', 'literature review', 'narrative review', 'overview'
    ])) {
      return { level: EvidenceLevel.REVIEW_ARTICLE, confidence: 0.6 };
    }
    
    // Expert opinion (default for authoritative sources)
    if (this.isAuthoritativeSource(source)) {
      return { level: EvidenceLevel.EXPERT_OPINION, confidence: 0.5 };
    }
    
    return { level: EvidenceLevel.EXPERT_OPINION, confidence: 0.3 };
  }

  /**
   * Identify medical specialties relevant to the content
   */
  static identifySpecialties(
    title: string,
    snippet: string
  ): { specialties: MedicalSpecialty[]; confidence: number } {
    const text = `${title} ${snippet}`.toLowerCase();
    const specialties: MedicalSpecialty[] = [];
    let totalConfidence = 0;
    
    // Cardiology keywords
    if (this.matchesPattern(text, [
      'cardiac', 'cardiology', 'heart', 'cardiovascular', 'coronary', 'myocardial',
      'atrial', 'ventricular', 'ecg', 'ekg', 'echocardiogram', 'angiogram',
      'stent', 'bypass', 'arrhythmia', 'hypertension', 'heart failure', 'mi',
      'acs', 'stemi', 'nstemi', 'pci', 'cabg', 'valve', 'aortic', 'mitral'
    ])) {
      specialties.push(MedicalSpecialty.CARDIOLOGY);
      totalConfidence += 0.9;
    }
    
    // OB/GYN keywords
    if (this.matchesPattern(text, [
      'obstetric', 'gynecologic', 'pregnancy', 'pregnant', 'maternal', 'fetal',
      'prenatal', 'antenatal', 'labor', 'delivery', 'cesarean', 'c-section',
      'preeclampsia', 'gestational', 'ovarian', 'uterine', 'cervical',
      'endometrial', 'menstrual', 'contraception', 'fertility', 'menopause',
      'pap smear', 'mammography', 'breast cancer', 'hpv'
    ])) {
      specialties.push(MedicalSpecialty.OBSTETRICS_GYNECOLOGY);
      totalConfidence += 0.9;
    }
    
    // Internal Medicine keywords
    if (this.matchesPattern(text, [
      'internal medicine', 'diabetes', 'hypertension', 'hyperlipidemia',
      'metabolic', 'endocrine', 'thyroid', 'kidney', 'renal', 'liver',
      'hepatic', 'pulmonary', 'respiratory', 'copd', 'asthma'
    ])) {
      specialties.push(MedicalSpecialty.INTERNAL_MEDICINE);
      totalConfidence += 0.8;
    }
    
    // Emergency Medicine keywords
    if (this.matchesPattern(text, [
      'emergency', 'trauma', 'acute', 'critical', 'resuscitation', 'shock',
      'sepsis', 'emergency department', 'ed', 'triage'
    ])) {
      specialties.push(MedicalSpecialty.EMERGENCY_MEDICINE);
      totalConfidence += 0.85;
    }
    
    // Default to internal medicine if no specific specialty identified
    if (specialties.length === 0) {
      specialties.push(MedicalSpecialty.INTERNAL_MEDICINE);
      totalConfidence = 0.3;
    }
    
    return {
      specialties,
      confidence: Math.min(totalConfidence / specialties.length, 1.0)
    };
  }

  /**
   * Classify content type based on source and content characteristics
   */
  static classifyContentType(
    title: string,
    snippet: string,
    source: string,
    url: string
  ): { type: ContentType; confidence: number } {
    const text = `${title} ${snippet} ${source}`.toLowerCase();
    
    // Research papers
    if (this.matchesPattern(text, [
      'study', 'trial', 'research', 'analysis', 'investigation'
    ]) || source.includes('pubmed') || source.includes('journal')) {
      return { type: ContentType.RESEARCH_PAPER, confidence: 0.9 };
    }
    
    // Clinical guidelines
    if (this.matchesPattern(text, [
      'guideline', 'recommendation', 'consensus', 'practice parameter'
    ]) || source.includes('guideline')) {
      return { type: ContentType.CLINICAL_GUIDELINE, confidence: 0.95 };
    }
    
    // Case reports
    if (this.matchesPattern(text, [
      'case report', 'case study', 'case presentation'
    ])) {
      return { type: ContentType.CASE_REPORT, confidence: 0.85 };
    }
    
    // Medical calculators
    if (this.matchesPattern(text, [
      'calculator', 'score', 'index', 'risk assessment', 'prediction'
    ]) || url.includes('calculator')) {
      return { type: ContentType.CALCULATOR, confidence: 0.9 };
    }
    
    // Drug information
    if (this.matchesPattern(text, [
      'drug', 'medication', 'pharmaceutical', 'dosing', 'pharmacology'
    ])) {
      return { type: ContentType.DRUG_INFORMATION, confidence: 0.8 };
    }
    
    // Educational material
    if (this.matchesPattern(text, [
      'education', 'learning', 'tutorial', 'guide', 'overview'
    ])) {
      return { type: ContentType.EDUCATIONAL_MATERIAL, confidence: 0.7 };
    }
    
    // Default to research paper for medical content
    return { type: ContentType.RESEARCH_PAPER, confidence: 0.5 };
  }

  /**
   * Calculate overall relevance score for medical queries
   */
  static calculateMedicalRelevance(
    query: string,
    title: string,
    snippet: string,
    classification: ClassificationResult
  ): number {
    let relevance = 0.5; // Base relevance
    
    // Query term matching
    const queryTerms = query.toLowerCase().split(/\s+/);
    const content = `${title} ${snippet}`.toLowerCase();
    
    queryTerms.forEach(term => {
      if (content.includes(term)) {
        relevance += 0.1;
      }
    });
    
    // Evidence level bonus
    const evidenceBonus = this.getEvidenceLevelBonus(classification.evidenceLevel);
    relevance += evidenceBonus;
    
    // Specialty match bonus (if query contains specialty-specific terms)
    if (this.hasSpecialtyMatch(query, classification.specialty)) {
      relevance += 0.2;
    }
    
    // Content type relevance
    relevance += this.getContentTypeBonus(classification.contentType);
    
    // Confidence penalty for low-confidence classifications
    relevance *= classification.confidence;
    
    return Math.min(relevance, 1.0);
  }

  /**
   * Helper method to match text patterns
   */
  private static matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Check if source is from an authoritative medical organization
   */
  private static isAuthoritativeSource(source: string): boolean {
    const authoritativeSources = [
      'nejm.org', 'jamanetwork.com', 'thelancet.com', 'bmj.com',
      'ahajournals.org', 'acc.org', 'heart.org', 'acog.org',
      'cdc.gov', 'nih.gov', 'who.int', 'uptodate.com',
      'mayoclinic.org', 'clevelandclinic.org'
    ];
    
    return authoritativeSources.some(domain => source.includes(domain));
  }

  /**
   * Generate human-readable reasoning for classification
   */
  private static generateClassificationReasoning(
    evidenceLevel: { level: EvidenceLevel; confidence: number },
    specialties: { specialties: MedicalSpecialty[]; confidence: number },
    contentType: { type: ContentType; confidence: number },
    source: string
  ): string {
    const reasons: string[] = [];
    
    if (evidenceLevel.confidence > 0.8) {
      reasons.push(`High-quality evidence (${evidenceLevel.level.replace(/_/g, ' ')})`);
    }
    
    if (this.isAuthoritativeSource(source)) {
      reasons.push('Authoritative medical source');
    }
    
    if (specialties.confidence > 0.8) {
      const specialtyNames = specialties.specialties.map(s => 
        s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      reasons.push(`Relevant to ${specialtyNames.join(', ')}`);
    }
    
    if (contentType.confidence > 0.8) {
      reasons.push(`${contentType.type.replace(/_/g, ' ')} content`);
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'General medical content';
  }

  /**
   * Get evidence level bonus for relevance scoring
   */
  private static getEvidenceLevelBonus(level: EvidenceLevel): number {
    const bonuses = {
      [EvidenceLevel.SYSTEMATIC_REVIEW]: 0.3,
      [EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL]: 0.25,
      [EvidenceLevel.GUIDELINE]: 0.3,
      [EvidenceLevel.COHORT_STUDY]: 0.2,
      [EvidenceLevel.CASE_CONTROL_STUDY]: 0.15,
      [EvidenceLevel.CASE_SERIES]: 0.1,
      [EvidenceLevel.REVIEW_ARTICLE]: 0.15,
      [EvidenceLevel.EXPERT_OPINION]: 0.05
    };
    
    return bonuses[level] || 0;
  }

  /**
   * Check if query has specialty-specific terms that match classification
   */
  private static hasSpecialtyMatch(query: string, specialties: MedicalSpecialty[]): boolean {
    const queryLower = query.toLowerCase();
    
    return specialties.some(specialty => {
      switch (specialty) {
        case MedicalSpecialty.CARDIOLOGY:
          return /cardiac|cardio|heart|coronary/.test(queryLower);
        case MedicalSpecialty.OBSTETRICS_GYNECOLOGY:
          return /obstetric|gynecologic|pregnancy|maternal|fetal/.test(queryLower);
        case MedicalSpecialty.EMERGENCY_MEDICINE:
          return /emergency|trauma|acute|critical/.test(queryLower);
        default:
          return false;
      }
    });
  }

  /**
   * Get content type bonus for relevance scoring
   */
  private static getContentTypeBonus(type: ContentType): number {
    const bonuses = {
      [ContentType.CLINICAL_GUIDELINE]: 0.25,
      [ContentType.RESEARCH_PAPER]: 0.2,
      [ContentType.CALCULATOR]: 0.15,
      [ContentType.DRUG_INFORMATION]: 0.15,
      [ContentType.EDUCATIONAL_MATERIAL]: 0.1,
      [ContentType.CASE_REPORT]: 0.1,
      [ContentType.MEDICAL_NEWS]: 0.05
    };
    
    return bonuses[type] || 0.05;
  }
}