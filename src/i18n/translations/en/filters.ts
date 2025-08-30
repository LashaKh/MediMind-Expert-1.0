export const filters = {
  // Modal
  modal: {
    title: 'Advanced Medical Filters',
    subtitle: 'Refine your search with precision filtering'
  },

  // Filter Categories
  categories: {
    quickFilters: 'Quick Filters',
    quickFiltersDesc: 'Popular filter combinations for common searches',
    contentFormat: 'Content & Format',
    contentFormatDesc: 'Filter by content type, file format, and document structure',
    authorityQuality: 'Authority & Quality',
    authorityQualityDesc: 'Source credibility, peer review status, and evidence quality',
    medicalDomain: 'Medical Domain',
    medicalDomainDesc: 'Medical specialties, subspecialties, and clinical topics',
    publicationAccess: 'Publication & Access',
    publicationAccessDesc: 'Publication date, access type, and availability',
    geographicContext: 'Geographic & Context',
    geographicContextDesc: 'Geographic relevance, practice settings, and patient populations',
    advancedOptions: 'Advanced Options',
    advancedOptionsDesc: 'Clinical trials, research parameters, and specialized filters'
  },

  // Extended Content Format translations
  contentFormat: {
    title: 'Content Type & Format',
    description: 'Filter by specific types of medical content and file formats',
    sections: {
      researchLiterature: {
        title: 'Research Literature',
        options: {
          studies: { label: 'Clinical Studies', description: 'Observational and interventional studies' },
          trials: { label: 'Clinical Trials', description: 'Randomized controlled trials and interventional studies' },
          metaAnalyses: { label: 'Meta-Analyses', description: 'Statistical analysis of multiple studies' },
          systematicReviews: { label: 'Systematic Reviews', description: 'Comprehensive evidence synthesis' }
        }
      },
      clinicalGuidelines: {
        title: 'Clinical Guidelines',
        options: {
          treatmentGuidelines: { label: 'Treatment Guidelines', description: 'Evidence-based treatment recommendations' },
          diagnosticProtocols: { label: 'Diagnostic Protocols', description: 'Standardized diagnostic procedures' },
          bestPractices: { label: 'Best Practices', description: 'Professional practice standards' }
        }
      },
      medicalReferences: {
        title: 'Medical References',
        options: {
          textbooks: { label: 'Medical Textbooks', description: 'Comprehensive medical reference books' },
          handbooks: { label: 'Clinical Handbooks', description: 'Practical clinical reference guides' },
          medicalDictionaries: { label: 'Medical Dictionaries', description: 'Medical terminology and definitions' }
        }
      },
      educationalContent: {
        title: 'Educational Content',
        options: {
          cmeMaterials: { label: 'CME Materials', description: 'Continuing medical education resources' },
          caseStudies: { label: 'Case Studies', description: 'Clinical case presentations and analysis' },
          learningModules: { label: 'Learning Modules', description: 'Structured educational content' }
        }
      },
      regulatoryDocs: {
        title: 'Regulatory Documents',
        options: {
          fdaApprovals: { label: 'FDA Approvals', description: 'Drug and device approval documents' },
          drugLabels: { label: 'Drug Labels', description: 'Official prescribing information' },
          safetyCommunications: { label: 'Safety Communications', description: 'FDA safety alerts and communications' }
        }
      },
      patientResources: {
        title: 'Patient Resources',
        options: {
          patientEducation: { label: 'Patient Education', description: 'Educational materials for patients' },
          factSheets: { label: 'Fact Sheets', description: 'Quick reference information sheets' },
          brochures: { label: 'Brochures', description: 'Patient information brochures' }
        }
      }
    }
  },

  fileFormats: {
    title: 'File Formats',
    options: {
      pdf: { label: 'PDF Documents', description: 'Portable document format files' },
      html: { label: 'Web Pages', description: 'HTML web content' },
      doc: { label: 'Word Documents', description: 'Microsoft Word documents' },
      ppt: { label: 'Presentations', description: 'PowerPoint presentations' },
      video: { label: 'Videos', description: 'Educational and clinical videos' },
      audio: { label: 'Audio', description: 'Podcasts and audio content' }
    }
  },

  summary: {
    title: 'Filter Summary',
    fileFormatsLabel: 'File formats:',
    activeFilters: 'Active filters',
    categories: 'Categories',
    none: 'No filters active',
    one: '1 filter active',
    many: '{{count}} filters active'
  },

  // Button labels and actions
  button: {
    label: 'Filters'
  },

  clearAll: 'Clear All Filters',
  
  // Missing filter translations
  preview: {
    results: 'Preview Results',
    previewShort: 'Preview'
  },
  changesNotApplied: 'Changes not yet applied',
  save: 'Save Filters',
  filterCategories: {
    all: 'All Filters',
    specialty: 'Medical Specialties',
    content: 'Content Types',
    quality: 'Quality & Authority',
    audience: 'Audience',
    recent: 'Recent',
    access: 'Access'
  },
  active: 'filters active',

  // Quick Filters
  quickFilters: {
    title: 'Quick Filters',
    subtitle: 'Popular filter combinations for common medical searches'
  },

  // Filter Options
  specialty: {
    label: 'Medical Specialty',
    all: 'All Specialties',
    cardiology: 'Cardiology',
    obgyn: 'Obstetrics & Gynecology',
    internalMedicine: 'Internal Medicine',
    emergencyMedicine: 'Emergency Medicine',
    pediatrics: 'Pediatrics',
    surgery: 'Surgery',
    radiology: 'Radiology',
    pathology: 'Pathology'
  },

  evidenceLevel: {
    label: 'Evidence Level',
    all: 'All Evidence Levels',
    systematicReview: 'Systematic Reviews',
    rct: 'Randomized Controlled Trials',
    cohortStudy: 'Cohort Studies',
    caseControl: 'Case-Control Studies',
    caseSeries: 'Case Series',
    expertOpinion: 'Expert Opinion',
    guideline: 'Clinical Guidelines',
    reviewArticle: 'Review Articles'
  },

  contentType: {
    label: 'Content Type',
    all: 'All Content Types',
    researchPaper: 'Research Papers',
    clinicalGuideline: 'Clinical Guidelines',
    caseReport: 'Case Reports',
    medicalNews: 'Medical News',
    educationalMaterial: 'Educational Material',
    drugInformation: 'Drug Information',
    calculator: 'Medical Calculators'
  },

  recency: {
    label: 'Publication Date',
    all: 'All Dates',
    pastWeek: 'Past Week',
    pastMonth: 'Past Month',
    past3Months: 'Past 3 Months',
    pastYear: 'Past Year',
    past5Years: 'Past 5 Years'
  },

  source: {
    label: 'Source',
    all: 'All Sources',
    pubmed: 'PubMed',
    cochrane: 'Cochrane Library',
    uptodate: 'UpToDate',
    guidelines: 'Clinical Guidelines',
    journals: 'Medical Journals'
  }
};

export default filters;