// Form 100 Diagnosis Configuration
// Evidence-based ICD-10 codes for Georgian ER consultations
// Medical validation with published literature references

import { DiagnosisCode, DiagnosisCategory } from '../../../types/form100';

// Diagnosis Categories - Hierarchical structure for medical specialties
export const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  {
    id: 'emergency',
    name: 'სასწრაფო მედიცინა',
    nameEn: 'Emergency Medicine',
    code: 'EMRG',
    description: 'გადაუდებელი სამედიცინო მდგომარეობები',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'cardiology',
    name: 'კარდიოლოგია',
    nameEn: 'Cardiology',
    code: 'CARD',
    description: 'გულ-სისხლძარღვთა დაავადებები',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'respiratory',
    name: 'რესპირატორული',
    nameEn: 'Respiratory',
    code: 'RESP',
    description: 'სუნთქვის სისტემის დაავადებები',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'neurological',
    name: 'ნევროლოგია',
    nameEn: 'Neurology',
    code: 'NEUR',
    description: 'ნერვული სისტემის დაავადებები',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'gastrointestinal',
    name: 'გასტროენტეროლოგია',
    nameEn: 'Gastroenterology',
    code: 'GAST',
    description: 'საჭმლის მომნელებელი სისტემის დაავადებები',
    displayOrder: 5,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'trauma',
    name: 'ტრავმატოლოგია',
    nameEn: 'Trauma',
    code: 'TRAU',
    description: 'ტრავმები და დაზიანებები',
    displayOrder: 6,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Evidence-based ICD-10 diagnosis codes with medical literature references
export const DIAGNOSIS_CODES: DiagnosisCode[] = [
  // Emergency Medicine
  {
    id: 'r57.0',
    code: 'R57.0',
    name: 'კარდიოგენური შოკი',
    nameEn: 'Cardiogenic shock',
    category: 'emergency',
    description: 'გულის მუშაობის აუტანელობის მწვავე მდგომარეობა',
    severity: 'critical',
    isActive: true,
    references: [
      'ESC Guidelines for Heart Failure 2021',
      'AHA/ACC Heart Failure Guidelines 2022'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'r57.1',
    code: 'R57.1',
    name: 'ჰიპოვოლემიური შოკი',
    nameEn: 'Hypovolemic shock',
    category: 'emergency',
    description: 'სისხლის მოცულობის კრიტიკული შემცირება',
    severity: 'critical',
    isActive: true,
    references: [
      'Advanced Trauma Life Support (ATLS) 10th Edition',
      'Shock Resuscitation Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  
  // Cardiology
  {
    id: 'i21.9',
    code: 'I21.9',
    name: 'მიოკარდიუმის მწვავე დაუზუსტებელი ინფარქტი(MINOCA)',
    nameEn: 'Acute myocardial infarction, unspecified',
    category: 'cardiology',
    description: 'მიოკარდიუმის მწვავე ინფარქტი ნორმალური კორონარული არტერიებით',
    severity: 'critical',
    isActive: true,
    references: [
      'ESC Guidelines for MINOCA 2023',
      'AHA/ACC MINOCA Scientific Statement',
      'Universal Definition of MI (4th Edition)'
    ],
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/77a48098-671d-4dea-b476-fcea11cd1b5a',
    isForm100Eligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i24.9',
    code: 'I24.9',
    name: 'გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
    nameEn: 'Acute ischemic heart disease, unspecified',
    category: 'cardiology',
    description: 'NSTEMI სპეციალიზებული დიაგნოზი და მენეჯმენტის პროტოკოლი ICD-10 კოდირებით',
    severity: 'critical',
    isActive: true,
    references: [
      'ESC Guidelines for NSTEMI 2023',
      'Universal Definition of MI (4th Edition)',
      'AHA/ACC NSTE-ACS Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.0',
    code: 'I20.0',
    name: 'არასტაბილური სტენოკარდია(Troponin+ Braunwald III)',
    nameEn: 'Unstable angina (Troponin + Braunwald III)',
    category: 'cardiology',
    description: 'კორონარული არტერიის მწვავე სინდრომი',
    severity: 'severe',
    isActive: true,
    references: [
      'ESC Guidelines for ACS 2023',
      'NSTE-ACS Management Guidelines 2023'
    ],
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/6dc8bb6d-ce79-4a40-9561-9108ba05e7c7',
    isForm100Eligible: true,
    troponinStatus: 'positive',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i21.4',
    code: 'I21.4',
    name: 'მიოკარდიუმის მწვავე სუბენდოკარდიული ინფარქტი',
    nameEn: 'Acute subendocardial myocardial infarction',
    category: 'cardiology',
    description: 'მიოკარდიუმის სუბენდოკარდიული ინფარქტი',
    severity: 'critical',
    isActive: true,
    references: [
      'ESC Guidelines for STEMI/NSTEMI 2023',
      'Universal Definition of MI (4th Edition)'
    ],
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/b7a97ee2-31f1-4a68-a80a-83142c3c2d6e',
    isForm100Eligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.8',
    code: 'I20.8',
    name: 'სტენოკარდიის სხვა ფორმები',
    nameEn: 'Other forms of angina pectoris',
    category: 'cardiology',
    description: 'სტენოკარდიის სხვადასხვა ფორმები',
    severity: 'moderate',
    isActive: true,
    references: [
      'ESC Guidelines for Chronic Coronary Syndromes 2023',
      'AHA/ACC Stable Ischemic Heart Disease Guidelines'
    ],
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/26c0feef-1d01-4350-8bdd-be6b0a315ac0',
    isForm100Eligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i20.0-tn-negative',
    code: 'I20.0',
    name: 'არასტაბილური სტენოკარდია',
    nameEn: 'Unstable angina (Troponin negative)',
    category: 'cardiology',
    description: 'კორონარული არტერიის მწვავე სინდრომი, ტროპონინი უარყოფითი',
    severity: 'moderate',
    isActive: true,
    references: [
      'ESC Guidelines for ACS 2023',
      'NSTE-ACS Management Guidelines 2023'
    ],
    flowiseEndpoint: 'https://flowise-2-0.onrender.com/api/v1/prediction/99079fbc-b9cf-4c9c-832c-ac71c864d9fb',
    isForm100Eligible: true,
    troponinStatus: 'negative',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'i48.91',
    code: 'I48.91',
    name: 'წინაგულების ფიბრილაცია',
    nameEn: 'Atrial fibrillation',
    category: 'cardiology',
    description: 'წინაგულების რიტმის მოშლა',
    severity: 'moderate',
    isActive: true,
    references: [
      'ESC Guidelines for AF 2024',
      'AHA/ACC/HRS AF Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  
  // Respiratory
  {
    id: 'j44.1',
    code: 'J44.1',
    name: 'ქრონიკული ობსტრუქციული ფილტვის დაავადების მწვავე გამწვავება',
    nameEn: 'COPD exacerbation',
    category: 'respiratory',
    description: 'ᲥᲝᲤᲓ-ის მწვავე გამწვავება',
    severity: 'severe',
    isActive: true,
    references: [
      'GOLD Guidelines for COPD 2024',
      'ATS/ERS COPD Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'j18.9',
    code: 'J18.9',
    name: 'პნევმონია',
    nameEn: 'Pneumonia',
    category: 'respiratory',
    description: 'ფილტვის ანთებითი დაავადება',
    severity: 'moderate',
    isActive: true,
    references: [
      'IDSA/ATS CAP Guidelines 2019',
      'BTS Pneumonia Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'j93.1',
    code: 'J93.1',
    name: 'სპონტანური პნევმოთორაქსი',
    nameEn: 'Spontaneous pneumothorax',
    category: 'respiratory',
    description: 'ფილტვისა და გულმკერდის კედლის შორის ჰაერის შეგროვება',
    severity: 'severe',
    isActive: true,
    references: [
      'BTS Pneumothorax Guidelines 2023',
      'ATS Pneumothorax Management 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  
  // Neurological
  {
    id: 'g93.1',
    code: 'G93.1',
    name: 'მწვავე ცერებროვასკულარული ინსულტი',
    nameEn: 'Acute stroke',
    category: 'neurological',
    description: 'ტვინის მწვავე სისხლმიმოქცევის დარღვევა',
    severity: 'critical',
    isActive: true,
    references: [
      'AHA/ASA Stroke Guidelines 2024',
      'ESO Stroke Guidelines 2023'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'g40.9',
    code: 'G40.9',
    name: 'ეპილეფსია',
    nameEn: 'Epilepsy',
    category: 'neurological',
    description: 'ქრონიკული ნევროლოგიური დაავადება კრუნჩხვებით',
    severity: 'moderate',
    isActive: true,
    references: [
      'ILAE Epilepsy Guidelines 2023',
      'AAN Epilepsy Management 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  
  // Gastrointestinal
  {
    id: 'k92.2',
    code: 'K92.2',
    name: 'საჭმლის მომნელებელი ტრაქტის სისხლდენა',
    nameEn: 'GI bleeding',
    category: 'gastrointestinal',
    description: 'საჭმლის მომნელებელი სისტემის სისხლდენა',
    severity: 'severe',
    isActive: true,
    references: [
      'ACG Lower GI Bleeding Guidelines 2023',
      'ESGE Upper GI Bleeding Guidelines 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'k35.9',
    code: 'K35.9',
    name: 'მწვავე აპენდიციტი',
    nameEn: 'Acute appendicitis',
    category: 'gastrointestinal',
    description: 'ხორკლისებრი მნიშვნელობის მწვავე ანთება',
    severity: 'severe',
    isActive: true,
    references: [
      'WSES Appendicitis Guidelines 2023',
      'ACG Appendicitis Management 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  
  // Trauma
  {
    id: 's06.9',
    code: 'S06.9',
    name: 'ტვინის ტრავმა',
    nameEn: 'Traumatic brain injury',
    category: 'trauma',
    description: 'თავის ტრავმის შედეგად ტვინის დაზიანება',
    severity: 'critical',
    isActive: true,
    references: [
      'Brain Trauma Foundation Guidelines 2023',
      'NICE Head Injury Guidelines 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 's32.0',
    code: 'S32.0',
    name: 'მენჯის ძვლის მოტეხილობა',
    nameEn: 'Pelvic fracture',
    category: 'trauma',
    description: 'მენჯის რგოლის ძვლების მოტეხილობა',
    severity: 'severe',
    isActive: true,
    references: [
      'AO Trauma Pelvic Fracture Guidelines 2023',
      'ATLS Pelvic Trauma Management 2024'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Helper functions for diagnosis management
export const getDiagnosisByCategory = (categoryId: string): DiagnosisCode[] => {
  return DIAGNOSIS_CODES.filter(diagnosis => 
    diagnosis.category === categoryId && diagnosis.isActive
  );
};

export const getDiagnosisByCode = (code: string): DiagnosisCode | undefined => {
  return DIAGNOSIS_CODES.find(diagnosis => 
    diagnosis.code === code && diagnosis.isActive
  );
};

export const searchDiagnoses = (query: string): DiagnosisCode[] => {
  const lowerQuery = query.toLowerCase();
  return DIAGNOSIS_CODES.filter(diagnosis => 
    diagnosis.isActive && (
      diagnosis.name.toLowerCase().includes(lowerQuery) ||
      diagnosis.nameEn.toLowerCase().includes(lowerQuery) ||
      diagnosis.code.toLowerCase().includes(lowerQuery) ||
      diagnosis.description?.toLowerCase().includes(lowerQuery)
    )
  );
};

export const getDiagnosesBySeverity = (severity: DiagnosisCode['severity']): DiagnosisCode[] => {
  return DIAGNOSIS_CODES.filter(diagnosis => 
    diagnosis.severity === severity && diagnosis.isActive
  );
};

export const getActiveCategories = (): DiagnosisCategory[] => {
  return DIAGNOSIS_CATEGORIES
    .filter(category => category.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

// Medical validation functions
export const validateDiagnosisCode = (code: string): boolean => {
  // ICD-10 format validation (basic pattern)
  const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,2})?$/;
  return icd10Pattern.test(code);
};

export const getMandatoryDiagnoses = (): DiagnosisCode[] => {
  // Return diagnoses that require immediate attention
  return DIAGNOSIS_CODES.filter(diagnosis => 
    diagnosis.severity === 'critical' && diagnosis.isActive
  );
};

// Get specialized NSTEMI diagnosis list for I24.9 reports
export const getNSTEMIDiagnoses = (): DiagnosisCode[] => {
  const nstemiCodes = ['I24.9', 'I20.0', 'I21.4', 'I20.8', 'I21.9'];
  return DIAGNOSIS_CODES.filter(diagnosis => 
    nstemiCodes.includes(diagnosis.code) && diagnosis.isActive
  );
};

// Export configuration defaults
export const DIAGNOSIS_CONFIG = {
  maxPrimaryDiagnoses: 1,
  maxSecondaryDiagnoses: 5,
  requireEvidence: true,
  validateReferences: true,
  defaultSeverity: 'moderate' as const,
  mandatoryFields: ['code', 'name', 'category'] as const
} as const;