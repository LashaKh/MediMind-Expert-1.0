// Form 100 Specific Diagnoses Configuration
// Only the 7 cardiac diagnoses needed for Form 100 generation
// Each diagnosis has its dedicated Flowise endpoint

import { DiagnosisCode } from '../../../types/form100';

// Form 100 specific cardiac diagnoses with their dedicated endpoints
export const FORM100_DIAGNOSES: DiagnosisCode[] = [
  {
    id: 'i21.4-form100',
    code: 'I21.4',
    name: 'მიოკარდიუმის მწვავე სუბენდოკარდიული ინფარქტი',
    nameEn: 'Acute subendocardial myocardial infarction',
    category: 'cardiology',
    description: 'Acute subendocardial myocardial infarction',
    severity: 'critical',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/b7a97ee2-31f1-4a68-a80a-83142c3c2d6e',
    isForm100Eligible: true,
    references: ['ESC Guidelines for STEMI/NSTEMI 2023'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.0-troponin-positive-form100',
    code: 'I20.0',
    name: 'არასტაბილური სტენოკარდია Braunwald III Troponin +',
    nameEn: 'Unstable angina Braunwald III Troponin positive',
    category: 'cardiology',
    description: 'Unstable angina with positive troponin Braunwald classification III',
    severity: 'severe',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/6dc8bb6d-ce79-4a40-9561-9108ba05e7c7',
    isForm100Eligible: true,
    troponinStatus: 'positive',
    references: ['ESC Guidelines for ACS 2023'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.0-troponin-negative-form100',
    code: 'I20.0',
    name: 'არასტაბილური სტენოკარდია Tn-',
    nameEn: 'Unstable angina Troponin negative',
    category: 'cardiology',
    description: 'Unstable angina with negative troponin',
    severity: 'moderate',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/99079fbc-b9cf-4c9c-832c-ac71c864d9fb',
    isForm100Eligible: true,
    troponinStatus: 'negative',
    references: ['ESC Guidelines for ACS 2023'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.8-form100',
    code: 'I20.8',
    name: 'სტენოკარდიის სხვა ფორმები',
    nameEn: 'Other forms of angina pectoris',
    category: 'cardiology',
    description: 'Other forms of angina pectoris',
    severity: 'moderate',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/26c0feef-1d01-4350-8bdd-be6b0a315ac0',
    isForm100Eligible: true,
    references: ['ESC Guidelines for Chronic Coronary Syndromes 2023'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i21.9-form100',
    code: 'I21.9',
    name: 'მიოკარდიუმის მწვავე დაუზუსტებელი ინფარქტი',
    nameEn: 'Acute myocardial infarction, unspecified',
    category: 'cardiology',
    description: 'Acute myocardial infarction, unspecified',
    severity: 'critical',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/77a48098-671d-4dea-b476-fcea11cd1b5a',
    isForm100Eligible: true,
    references: ['Universal Definition of MI (4th Edition)'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i21.x-stemi-form100',
    code: 'I21.x',
    name: 'STEMI',
    nameEn: 'ST elevation myocardial infarction',
    category: 'cardiology',
    description: 'ST elevation myocardial infarction',
    severity: 'critical',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/483bb23c-616a-4b49-9bc3-addb24930714',
    isForm100Eligible: true,
    references: ['ESC Guidelines for STEMI 2023'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i50.0-form100',
    code: 'I50.0',
    name: 'გულის შეგუბებითი უკმარისობა',
    nameEn: 'Congestive heart failure',
    category: 'cardiology',
    description: 'Congestive heart failure',
    severity: 'critical',
    isActive: true,
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/a206b4c8-1fb0-4eb5-be41-72f07cf4b8fd',
    isForm100Eligible: true,
    references: ['ESC Guidelines for Heart Failure 2021'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Get diagnosis by code for Form 100
export const getForm100DiagnosisByCode = (code: string): DiagnosisCode | undefined => {
  return FORM100_DIAGNOSES.find(diagnosis => 
    diagnosis.code === code && diagnosis.isActive
  );
};

// Get Flowise endpoint for Form 100 diagnosis
export const getForm100FlowiseEndpoint = (diagnosisCode: string, troponinStatus?: 'positive' | 'negative'): string => {
  // Handle I20.0 variants based on troponin status
  if (diagnosisCode === 'I20.0') {
    const diagnosis = FORM100_DIAGNOSES.find(d => 
      d.code === 'I20.0' && d.troponinStatus === troponinStatus
    );
    return diagnosis?.flowiseEndpoint || FORM100_DIAGNOSES[0].flowiseEndpoint;
  }
  
  // Standard diagnosis lookup
  const diagnosis = FORM100_DIAGNOSES.find(d => d.code === diagnosisCode);
  return diagnosis?.flowiseEndpoint || FORM100_DIAGNOSES[0].flowiseEndpoint;
};

// Check if a diagnosis code is supported in Form 100
export const isForm100SupportedDiagnosis = (code: string): boolean => {
  return FORM100_DIAGNOSES.some(diagnosis => diagnosis.code === code);
};

// Get all Form 100 diagnosis codes
export const getForm100DiagnosisCodes = (): string[] => {
  return [...new Set(FORM100_DIAGNOSES.map(d => d.code))];
};