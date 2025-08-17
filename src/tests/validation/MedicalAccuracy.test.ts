/**
 * Medical Accuracy Validation Tests
 * Validates evidence-based search results against medical standards
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { SearchOrchestrator } from '@/utils/search/apiOrchestration';
import type { SearchQuery, SearchResult } from '@/utils/search/apiOrchestration';

// Medical validation utilities
interface MedicalValidationCriteria {
  evidenceHierarchy: string[];
  trustedSources: string[];
  requiredFields: string[];
  qualityIndicators: string[];
  specialtyKeywords: Record<string, string[]>;
}

interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
}

interface ValidationIssue {
  type: 'critical' | 'warning' | 'info';
  message: string;
  field?: string;
  suggestion?: string;
}

const MEDICAL_VALIDATION_CRITERIA: MedicalValidationCriteria = {
  evidenceHierarchy: [
    'systematic-review',
    'meta-analysis', 
    'rct',
    'cohort',
    'case-control',
    'case-series',
    'expert-opinion'
  ],
  trustedSources: [
    'pubmed.ncbi.nlm.nih.gov',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'bmj.com',
    'nature.com',
    'acc.org',
    'heart.org',
    'acog.org',
    'uptodate.com',
    'cochranelibrary.com',
    'guidelines.gov'
  ],
  requiredFields: [
    'title',
    'url', 
    'snippet',
    'source',
    'evidenceLevel',
    'contentType'
  ],
  qualityIndicators: [
    'peer-reviewed',
    'randomized',
    'controlled',
    'systematic',
    'meta-analysis',
    'guideline',
    'consensus',
    'evidence-based'
  ],
  specialtyKeywords: {
    cardiology: [
      'cardiovascular', 'cardiac', 'heart', 'coronary', 'myocardial',
      'arrhythmia', 'hypertension', 'atherosclerosis', 'echocardiogram',
      'electrocardiogram', 'angiography', 'stent', 'bypass'
    ],
    obgyn: [
      'obstetric', 'gynecologic', 'pregnancy', 'maternal', 'fetal',
      'prenatal', 'postpartum', 'cesarean', 'delivery', 'contraception',
      'menopause', 'ovarian', 'uterine', 'cervical', 'endometrial'
    ]
  }
};

class MedicalAccuracyValidator {
  private criteria: MedicalValidationCriteria;

  constructor(criteria: MedicalValidationCriteria = MEDICAL_VALIDATION_CRITERIA) {
    this.criteria = criteria;
  }

  /**
   * Validate search results for medical accuracy and evidence quality
   */
  validateSearchResults(results: SearchResult[], query: SearchQuery): ValidationResult {
    const issues: ValidationIssue[] = [];
    let totalScore = 0;
    const validResults = results.filter(result => this.isValidResult(result));

    if (validResults.length === 0) {
      issues.push({
        type: 'critical',
        message: 'No valid medical results found',
        suggestion: 'Refine search query or check API responses'
      });
      return { isValid: false, score: 0, issues, recommendations: [] };
    }

    // Validate each result
    const resultScores = validResults.map(result => {
      const resultValidation = this.validateSingleResult(result, query);
      issues.push(...resultValidation.issues);
      return resultValidation.score;
    });

    totalScore = resultScores.reduce((sum, score) => sum + score, 0) / resultScores.length;

    // Check evidence hierarchy distribution
    const evidenceDistribution = this.analyzeEvidenceDistribution(validResults);
    if (evidenceDistribution.highQualityPercentage < 30) {
      issues.push({
        type: 'warning',
        message: `Low high-quality evidence (${evidenceDistribution.highQualityPercentage}%)`,
        suggestion: 'Consider refining search to prioritize systematic reviews and RCTs'
      });
    }

    // Check source diversity
    const sourceDiversity = this.analyzeSourceDiversity(validResults);
    if (sourceDiversity.trustedSourcePercentage < 60) {
      issues.push({
        type: 'warning',  
        message: `Low trusted sources (${sourceDiversity.trustedSourcePercentage}%)`,
        suggestion: 'Expand search to include more peer-reviewed sources'
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(validResults, query, issues);

    return {
      isValid: issues.filter(i => i.type === 'critical').length === 0,
      score: Math.round(totalScore),
      issues,
      recommendations
    };
  }

  /**
   * Validate a single search result
   */
  private validateSingleResult(result: SearchResult, query: SearchQuery): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check required fields
    for (const field of this.criteria.requiredFields) {
      if (!result[field as keyof SearchResult]) {
        issues.push({
          type: 'critical',
          message: `Missing required field: ${field}`,
          field
        });
        score -= 20;
      }
    }

    // Validate evidence level
    if (result.evidenceLevel && !this.criteria.evidenceHierarchy.includes(result.evidenceLevel)) {
      issues.push({
        type: 'warning',
        message: `Unknown evidence level: ${result.evidenceLevel}`,
        field: 'evidenceLevel'
      });
      score -= 10;
    }

    // Check source trustworthiness
    const sourceTrusted = this.criteria.trustedSources.some(source => 
      result.url.includes(source) || result.source.includes(source)
    );
    if (!sourceTrusted) {
      issues.push({
        type: 'info',
        message: 'Source not in trusted medical sources list',
        field: 'source',
        suggestion: 'Verify source credibility manually'
      });
      score -= 5;
    }

    // Check specialty relevance
    if (query.specialty) {
      const specialtyKeywords = this.criteria.specialtyKeywords[query.specialty] || [];
      const relevantKeywords = specialtyKeywords.filter(keyword =>
        result.title.toLowerCase().includes(keyword) ||
        result.snippet.toLowerCase().includes(keyword)
      );
      
      if (relevantKeywords.length === 0) {
        issues.push({
          type: 'warning',
          message: `Low specialty relevance for ${query.specialty}`,
          field: 'specialty'
        });
        score -= 15;
      }
    }

    // Check quality indicators
    const qualityIndicators = this.criteria.qualityIndicators.filter(indicator =>
      result.title.toLowerCase().includes(indicator) ||
      result.snippet.toLowerCase().includes(indicator)
    );
    
    if (qualityIndicators.length === 0) {
      issues.push({
        type: 'info',
        message: 'No explicit quality indicators found',
        suggestion: 'Verify study methodology manually'
      });
      score -= 5;
    }

    // Validate confidence score
    if (result.confidence < 0.7) {
      issues.push({
        type: 'warning',
        message: `Low confidence score: ${result.confidence}`,
        field: 'confidence'
      });
      score -= 10;
    }

    return {
      isValid: issues.filter(i => i.type === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: []
    };
  }

  /**
   * Check if result meets minimum validity criteria
   */
  private isValidResult(result: SearchResult): boolean {
    return !!(
      result.title &&
      result.url &&
      result.snippet &&
      result.source &&
      result.title.length > 10 &&
      result.snippet.length > 20
    );
  }

  /**
   * Analyze evidence level distribution
   */
  private analyzeEvidenceDistribution(results: SearchResult[]) {
    const evidenceCounts = new Map<string, number>();
    const highQualityLevels = ['systematic-review', 'meta-analysis', 'rct'];
    
    results.forEach(result => {
      const level = result.evidenceLevel || 'unknown';
      evidenceCounts.set(level, (evidenceCounts.get(level) || 0) + 1);
    });

    const highQualityCount = Array.from(evidenceCounts.entries())
      .filter(([level]) => highQualityLevels.includes(level))
      .reduce((sum, [, count]) => sum + count, 0);

    return {
      distribution: Object.fromEntries(evidenceCounts),
      highQualityCount,
      highQualityPercentage: Math.round((highQualityCount / results.length) * 100)
    };
  }

  /**
   * Analyze source diversity and trustworthiness
   */
  private analyzeSourceDiversity(results: SearchResult[]) {
    const sources = new Set(results.map(r => r.source));
    const trustedSources = results.filter(result =>
      this.criteria.trustedSources.some(trusted =>
        result.url.includes(trusted) || result.source.includes(trusted)
      )
    );

    return {
      totalSources: sources.size,
      uniqueSources: Array.from(sources),
      trustedSourceCount: trustedSources.length,
      trustedSourcePercentage: Math.round((trustedSources.length / results.length) * 100)
    };
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(
    results: SearchResult[], 
    query: SearchQuery, 
    issues: ValidationIssue[]
  ): string[] {
    const recommendations: string[] = [];

    // Evidence quality recommendations
    const evidenceDistribution = this.analyzeEvidenceDistribution(results);
    if (evidenceDistribution.highQualityPercentage < 50) {
      recommendations.push(
        'Add systematic review and RCT filters to improve evidence quality'
      );
    }

    // Source diversity recommendations
    const sourceDiversity = this.analyzeSourceDiversity(results);
    if (sourceDiversity.trustedSourcePercentage < 70) {
      recommendations.push(
        'Include more results from peer-reviewed medical journals'
      );
    }

    // Specialty-specific recommendations
    if (query.specialty && results.length > 0) {
      const specialtyKeywords = this.criteria.specialtyKeywords[query.specialty] || [];
      const avgSpecialtyRelevance = results.reduce((sum, result) => {
        const relevantKeywords = specialtyKeywords.filter(keyword =>
          result.title.toLowerCase().includes(keyword) ||
          result.snippet.toLowerCase().includes(keyword)
        );
        return sum + relevantKeywords.length;
      }, 0) / results.length;

      if (avgSpecialtyRelevance < 2) {
        recommendations.push(
          `Add more ${query.specialty}-specific search terms for better relevance`
        );
      }
    }

    // Critical issue recommendations
    const criticalIssues = issues.filter(i => i.type === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(
        'Review API responses for missing required fields'
      );
    }

    return recommendations;
  }
}

describe('Medical Accuracy Validation Tests', () => {
  let searchOrchestrator: SearchOrchestrator;
  let validator: MedicalAccuracyValidator;

  beforeAll(() => {
    searchOrchestrator = new SearchOrchestrator();
    validator = new MedicalAccuracyValidator();
  });

  describe('Evidence-Based Result Validation', () => {
    test('should validate systematic review results for cardiology queries', async () => {
      const query: SearchQuery = {
        query: 'atrial fibrillation anticoagulation systematic review',
        specialty: 'cardiology',
        evidenceLevel: ['systematic-review'],
        contentType: ['journal-article'],
        limit: 10
      };

      // Mock high-quality results
      const mockResults: SearchResult[] = [
        {
          id: 'result-1',
          title: 'Systematic Review of Anticoagulation in Atrial Fibrillation',
          url: 'https://pubmed.ncbi.nlm.nih.gov/12345678',
          snippet: 'This systematic review and meta-analysis examines anticoagulation strategies in atrial fibrillation patients...',
          source: 'PubMed',
          provider: 'exa',
          relevanceScore: 0.95,
          confidence: 0.9,
          evidenceLevel: 'systematic-review',
          contentType: 'journal-article',
          specialty: 'cardiology',
          publicationDate: '2023-06-15'
        },
        {
          id: 'result-2', 
          title: 'Meta-analysis of Novel Oral Anticoagulants vs Warfarin',
          url: 'https://nejm.org/doi/full/10.1056/NEJMoa2023456',
          snippet: 'Meta-analysis comparing efficacy and safety of NOACs versus warfarin in AF patients...',
          source: 'New England Journal of Medicine',
          provider: 'exa',
          relevanceScore: 0.92,
          confidence: 0.88,
          evidenceLevel: 'meta-analysis',
          contentType: 'journal-article',
          specialty: 'cardiology',
          publicationDate: '2023-08-20'
        }
      ];

      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(80);
      expect(validation.issues.filter(i => i.type === 'critical')).toHaveLength(0);

      // Should have high evidence quality
      const evidenceTypes = mockResults.map(r => r.evidenceLevel);
      expect(evidenceTypes).toContain('systematic-review');

      // Should include trusted sources
      const trustedSources = mockResults.filter(r => 
        r.url.includes('pubmed.ncbi.nlm.nih.gov') || r.url.includes('nejm.org')
      );
      expect(trustedSources).toHaveLength(2);
    });

    test('should flag low-quality evidence results', async () => {
      const query: SearchQuery = {
        query: 'heart disease treatment',
        specialty: 'cardiology',
        limit: 5
      };

      // Mock low-quality results
      const mockResults: SearchResult[] = [
        {
          id: 'result-1',
          title: 'Heart Disease Blog Post',
          url: 'https://healthblog.com/heart-disease',
          snippet: 'Personal experience with heart disease treatment...',
          source: 'Health Blog',
          provider: 'brave',
          relevanceScore: 0.7,
          confidence: 0.5,
          evidenceLevel: 'expert-opinion',
          contentType: 'other'
        },
        {
          id: 'result-2',
          title: 'Case Report: Unusual Heart Condition',
          url: 'https://obscurejournal.com/case-123',
          snippet: 'Case report of rare cardiac condition in single patient...',
          source: 'Obscure Medical Journal',
          provider: 'brave',
          relevanceScore: 0.6,
          confidence: 0.45,
          evidenceLevel: 'case-series',
          contentType: 'case-report'
        }
      ];

      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.score).toBeLessThan(70);
      
      // Should flag low evidence quality
      const evidenceWarnings = validation.issues.filter(i => 
        i.message.includes('Low high-quality evidence')
      );
      expect(evidenceWarnings.length).toBeGreaterThan(0);

      // Should recommend improvements
      expect(validation.recommendations).toContain(
        'Add systematic review and RCT filters to improve evidence quality'
      );
    });

    test('should validate OB/GYN specialty relevance', async () => {
      const query: SearchQuery = {
        query: 'preeclampsia management guidelines',
        specialty: 'obgyn',
        evidenceLevel: ['clinical-guideline'],
        limit: 8
      };

      const mockResults: SearchResult[] = [
        {
          id: 'result-1',
          title: 'ACOG Practice Bulletin: Preeclampsia and Hypertensive Disorders',
          url: 'https://acog.org/clinical/practice-bulletins/pb-222',
          snippet: 'Clinical practice guidelines for the management of preeclampsia and gestational hypertension...',
          source: 'American College of Obstetricians and Gynecologists',
          provider: 'exa',
          relevanceScore: 0.98,
          confidence: 0.95,
          evidenceLevel: 'clinical-guideline',
          contentType: 'practice-bulletin',
          specialty: 'obgyn',
          publicationDate: '2023-05-01'
        },
        {
          id: 'result-2',
          title: 'Maternal-Fetal Medicine Guidelines for Severe Preeclampsia',
          url: 'https://pubmed.ncbi.nlm.nih.gov/34567890',
          snippet: 'Evidence-based guidelines for management of severe preeclampsia and HELLP syndrome...',
          source: 'Maternal-Fetal Medicine Journal',
          provider: 'exa',
          relevanceScore: 0.94,
          confidence: 0.91,
          evidenceLevel: 'clinical-guideline',
          contentType: 'consensus-statement',
          specialty: 'obgyn',
          publicationDate: '2023-07-12'
        }
      ];

      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(85);

      // Should validate specialty keywords
      const obgynKeywords = ['preeclampsia', 'gestational', 'maternal', 'obstetric'];
      const hasRelevantKeywords = mockResults.every(result =>
        obgynKeywords.some(keyword =>
          result.title.toLowerCase().includes(keyword) ||
          result.snippet.toLowerCase().includes(keyword)
        )
      );
      expect(hasRelevantKeywords).toBe(true);
    });

    test('should handle mixed quality result sets', async () => {
      const query: SearchQuery = {
        query: 'diabetes mellitus type 2 management',
        specialty: 'endocrinology',
        limit: 10
      };

      const mockResults: SearchResult[] = [
        // High quality
        {
          id: 'high-1',
          title: 'ADA Standards of Medical Care in Diabetes 2023',
          url: 'https://diabetesjournals.org/care/article/46/1/S1',
          snippet: 'Evidence-based clinical practice recommendations for diabetes care...',
          source: 'American Diabetes Association',
          provider: 'exa',
          relevanceScore: 0.96,
          confidence: 0.93,
          evidenceLevel: 'clinical-guideline',
          contentType: 'clinical-guideline'
        },
        // Medium quality
        {
          id: 'medium-1',
          title: 'Cohort Study: Diabetes Outcomes in Primary Care',
          url: 'https://bmj.com/content/378/diabetes-outcomes',
          snippet: 'Prospective cohort study of diabetes management outcomes...',
          source: 'BMJ',
          provider: 'exa',
          relevanceScore: 0.82,
          confidence: 0.78,
          evidenceLevel: 'cohort',
          contentType: 'journal-article'
        },
        // Low quality
        {
          id: 'low-1',
          title: 'Diabetes Tips and Tricks Blog',
          url: 'https://diabeteshelp.com/tips',
          snippet: 'Personal tips for managing diabetes from patient experience...',
          source: 'Diabetes Help Blog',
          provider: 'brave',
          relevanceScore: 0.55,
          confidence: 0.45,
          evidenceLevel: 'expert-opinion',
          contentType: 'other'
        }
      ];

      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(60);
      expect(validation.score).toBeLessThan(90);

      // Should identify quality distribution issues
      const qualityWarnings = validation.issues.filter(i =>
        i.message.includes('trusted sources') || i.message.includes('quality evidence')
      );
      expect(qualityWarnings.length).toBeGreaterThan(0);

      // Should provide specific recommendations
      expect(validation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Source Credibility Validation', () => {
    test('should prioritize trusted medical sources', async () => {
      const trustedSources = [
        'https://pubmed.ncbi.nlm.nih.gov/12345',
        'https://nejm.org/doi/full/10.1056/NEJMoa123',
        'https://jamanetwork.com/journals/jama/article/456',
        'https://thelancet.com/journals/lancet/article/789',
        'https://bmj.com/content/370/bmj.m123'
      ];

      const mockResults: SearchResult[] = trustedSources.map((url, index) => ({
        id: `trusted-${index}`,
        title: `High Quality Medical Research ${index}`,
        url,
        snippet: 'Peer-reviewed medical research from trusted source...',
        source: new URL(url).hostname,
        provider: 'exa',
        relevanceScore: 0.9,
        confidence: 0.85,
        evidenceLevel: 'journal-article',
        contentType: 'journal-article'
      }));

      const query: SearchQuery = { query: 'medical research', limit: 5 };
      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.score).toBeGreaterThan(90);
      
      // Should have no trust-related warnings
      const trustIssues = validation.issues.filter(i =>
        i.message.includes('Source not in trusted')
      );
      expect(trustIssues).toHaveLength(0);
    });

    test('should flag untrusted or questionable sources', async () => {
      const untrustedSources = [
        'https://medicalnews.blog/article123',
        'https://healthtips.com/diabetes-cure',
        'https://naturopathy.org/miracle-treatment',
        'https://alternativemedicine.net/study'
      ];

      const mockResults: SearchResult[] = untrustedSources.map((url, index) => ({
        id: `untrusted-${index}`,
        title: `Medical Article ${index}`,
        url,
        snippet: 'Health information from various sources...',
        source: new URL(url).hostname,
        provider: 'brave',
        relevanceScore: 0.7,
        confidence: 0.6,
        evidenceLevel: 'other',
        contentType: 'other'
      }));

      const query: SearchQuery = { query: 'medical treatment', limit: 4 };
      const validation = validator.validateSearchResults(mockResults, query);

      expect(validation.score).toBeLessThan(70);

      // Should flag source trust issues
      const trustIssues = validation.issues.filter(i =>
        i.message.includes('Source not in trusted')
      );
      expect(trustIssues.length).toBeGreaterThan(0);

      // Should recommend source verification
      expect(validation.recommendations).toContain(
        'Include more results from peer-reviewed medical journals'
      );
    });
  });

  describe('Data Completeness Validation', () => {
    test('should require essential medical metadata', async () => {
      const incompleteResults: SearchResult[] = [
        {
          id: 'incomplete-1',
          title: '', // Missing title
          url: 'https://example.com/article',
          snippet: 'Medical research snippet...',
          source: 'Medical Journal',
          provider: 'brave',
          relevanceScore: 0.8,
          confidence: 0.7
          // Missing evidenceLevel and contentType
        },
        {
          id: 'incomplete-2',
          title: 'Valid Medical Article',
          url: '', // Missing URL
          snippet: 'Research about medical conditions...',
          source: 'Journal',
          provider: 'exa',
          relevanceScore: 0.75,
          confidence: 0.72,
          evidenceLevel: 'journal-article',
          contentType: 'research-paper'
        }
      ];

      const query: SearchQuery = { query: 'medical research', limit: 2 };
      const validation = validator.validateSearchResults(incompleteResults, query);

      expect(validation.isValid).toBe(false);

      // Should identify missing required fields
      const criticalIssues = validation.issues.filter(i => i.type === 'critical');
      expect(criticalIssues.length).toBeGreaterThan(0);

      const missingFieldIssues = criticalIssues.filter(i =>
        i.message.includes('Missing required field')
      );
      expect(missingFieldIssues.length).toBeGreaterThan(0);
    });

    test('should validate result content quality', async () => {
      const poorQualityResults: SearchResult[] = [
        {
          id: 'poor-1',
          title: 'X', // Too short
          url: 'https://example.com/1',
          snippet: 'Short.', // Too short
          source: 'Source',
          provider: 'brave',
          relevanceScore: 0.3,
          confidence: 0.2,
          evidenceLevel: 'other',
          contentType: 'other'
        }
      ];

      const query: SearchQuery = { query: 'medical information', limit: 1 };
      const validation = validator.validateSearchResults(poorQualityResults, query);

      // Should filter out invalid results
      expect(validation.score).toBe(0);
      expect(validation.issues.some(i => 
        i.message.includes('No valid medical results found')
      )).toBe(true);
    });
  });

  describe('Specialty-Specific Validation', () => {
    test('should validate cardiology terminology and relevance', async () => {
      const cardiologyResults: SearchResult[] = [
        {
          id: 'cardio-1',
          title: 'Cardiovascular Risk Assessment in Coronary Artery Disease',
          url: 'https://heart.org/guidelines/coronary-assessment',
          snippet: 'Systematic approach to cardiac risk stratification using echocardiography and stress testing...',
          source: 'American Heart Association',
          provider: 'exa',
          relevanceScore: 0.94,
          confidence: 0.9,
          evidenceLevel: 'clinical-guideline',
          contentType: 'clinical-guideline',
          specialty: 'cardiology'
        }
      ];

      const query: SearchQuery = {
        query: 'cardiac risk assessment',
        specialty: 'cardiology',
        limit: 1
      };

      const validation = validator.validateSearchResults(cardiologyResults, query);

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(85);

      // Should not flag specialty relevance issues
      const relevanceIssues = validation.issues.filter(i =>
        i.message.includes('Low specialty relevance')
      );
      expect(relevanceIssues).toHaveLength(0);
    });

    test('should detect specialty mismatch', async () => {
      const mismatchedResults: SearchResult[] = [
        {
          id: 'mismatch-1',
          title: 'Orthopedic Surgery Techniques for Knee Replacement',
          url: 'https://orthopedics.com/knee-surgery',
          snippet: 'Surgical approaches for total knee arthroplasty in elderly patients...',
          source: 'Orthopedic Journal',
          provider: 'brave',
          relevanceScore: 0.85,
          confidence: 0.8,
          evidenceLevel: 'journal-article',
          contentType: 'surgical-technique',
          specialty: 'orthopedics'
        }
      ];

      const query: SearchQuery = {
        query: 'knee replacement',
        specialty: 'cardiology', // Mismatch
        limit: 1
      };

      const validation = validator.validateSearchResults(mismatchedResults, query);

      // Should flag specialty relevance issues
      const relevanceIssues = validation.issues.filter(i =>
        i.message.includes('Low specialty relevance for cardiology')
      );
      expect(relevanceIssues.length).toBeGreaterThan(0);

      expect(validation.score).toBeLessThan(80);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty result sets gracefully', async () => {
      const emptyResults: SearchResult[] = [];
      const query: SearchQuery = { query: 'nonexistent medical term', limit: 10 };

      const validation = validator.validateSearchResults(emptyResults, query);

      expect(validation.isValid).toBe(false);
      expect(validation.score).toBe(0);
      expect(validation.issues.some(i => 
        i.message.includes('No valid medical results found')
      )).toBe(true);
    });

    test('should validate large result sets efficiently', async () => {
      // Generate 100 mock results
      const largeResultSet: SearchResult[] = Array.from({ length: 100 }, (_, i) => ({
        id: `result-${i}`,
        title: `Medical Research Article ${i}`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${1000 + i}`,
        snippet: `Research findings about medical condition ${i}. This study examines...`,
        source: 'PubMed',
        provider: 'exa',
        relevanceScore: 0.9 - (i * 0.005),
        confidence: 0.85,
        evidenceLevel: i < 20 ? 'systematic-review' : 'journal-article',
        contentType: 'journal-article'
      }));

      const query: SearchQuery = { query: 'medical research', limit: 100 };
      
      const startTime = performance.now();
      const validation = validator.validateSearchResults(largeResultSet, query);
      const endTime = performance.now();

      // Should complete validation quickly
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second

      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(80);
    });
  });
});