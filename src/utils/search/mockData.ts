/**
 * Mock Data for Development and Testing
 * Provides sample search results and test data for development
 */

import type { SearchResult, SearchResponse } from './apiOrchestration';
import { EvidenceLevel, MedicalSpecialty, ContentType } from './medicalClassification';

export const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Preeclampsia Risk Assessment: Recent Guidelines and Clinical Implementation',
    url: 'https://acog.org/preeclampsia-guidelines-2023',
    snippet: 'Updated ACOG guidelines for preeclampsia screening recommend low-dose aspirin for high-risk patients. Evidence from recent systematic reviews supports early identification...',
    source: 'American College of Obstetricians and Gynecologists',
    provider: 'brave',
    relevanceScore: 0.95,
    evidenceLevel: EvidenceLevel.GUIDELINE,
    publicationDate: '2023-10-15',
    specialty: MedicalSpecialty.OBSTETRICS_GYNECOLOGY,
    contentType: ContentType.CLINICAL_GUIDELINE
  },
  {
    id: '2', 
    title: 'Cardiac Risk Stratification in Non-Cardiac Surgery: A Systematic Review',
    url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
    snippet: 'Meta-analysis of 47 studies examining perioperative cardiac risk assessment tools including Lee revised cardiac risk index and NSQIP calculator...',
    source: 'Journal of the American College of Cardiology',
    provider: 'exa',
    relevanceScore: 0.89,
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    publicationDate: '2023-09-22',
    specialty: MedicalSpecialty.CARDIOLOGY,
    contentType: ContentType.RESEARCH_PAPER
  },
  {
    id: '3',
    title: 'ASCVD Risk Calculator Updates and Clinical Application',
    url: 'https://tools.acc.org/ascvd-risk-estimator',
    snippet: 'The 2023 update to the ASCVD risk calculator incorporates new risk enhancers and provides more accurate cardiovascular risk assessment for primary prevention...',
    source: 'American College of Cardiology',
    provider: 'perplexity',
    relevanceScore: 0.87,
    evidenceLevel: EvidenceLevel.EXPERT_OPINION,
    publicationDate: '2023-08-30',
    specialty: MedicalSpecialty.CARDIOLOGY,
    contentType: ContentType.CALCULATOR
  }
];

export const mockSearchResponse: SearchResponse = {
  results: mockSearchResults,
  totalCount: 3,
  searchTime: 450,
  provider: 'brave',
  query: 'cardiovascular risk assessment tools'
};

export const mockSpecialtyQueries = {
  cardiology: [
    'ASCVD risk calculator',
    'heart failure staging NYHA',
    'atrial fibrillation anticoagulation',
    'STEMI treatment guidelines',
    'heart transplant eligibility'
  ],
  obgyn: [
    'preeclampsia screening guidelines',
    'gestational diabetes diagnosis',
    'cervical cancer screening',
    'VBAC success calculator',
    'ovarian cancer risk assessment'
  ]
};

export const mockEvidenceLevels = [
  { id: EvidenceLevel.SYSTEMATIC_REVIEW, label: 'Systematic Review', count: 12 },
  { id: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL, label: 'RCT', count: 8 },
  { id: EvidenceLevel.GUIDELINE, label: 'Clinical Guidelines', count: 15 },
  { id: EvidenceLevel.COHORT_STUDY, label: 'Cohort Study', count: 6 },
  { id: EvidenceLevel.CASE_CONTROL_STUDY, label: 'Case-Control', count: 4 },
  { id: EvidenceLevel.EXPERT_OPINION, label: 'Expert Opinion', count: 3 }
];

export const mockContentTypes = [
  { id: ContentType.CLINICAL_GUIDELINE, label: 'Clinical Guidelines', count: 18 },
  { id: ContentType.RESEARCH_PAPER, label: 'Research Papers', count: 24 },
  { id: ContentType.CALCULATOR, label: 'Medical Calculators', count: 7 },
  { id: ContentType.EDUCATIONAL_MATERIAL, label: 'Educational', count: 9 },
  { id: ContentType.DRUG_INFORMATION, label: 'Drug Information', count: 5 }
];

export function generateMockResponse(
  query: string,
  provider: 'brave' | 'exa' | 'perplexity' = 'brave',
  count: number = 5
): SearchResponse {
  const baseResults = mockSearchResults.slice(0, count);
  
  return {
    results: baseResults.map(result => ({
      ...result,
      provider,
      id: `${provider}_${result.id}`
    })),
    totalCount: count,
    searchTime: Math.floor(Math.random() * 500) + 200,
    provider,
    query
  };
}