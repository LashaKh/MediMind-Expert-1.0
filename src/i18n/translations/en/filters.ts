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
    subtitle: 'Popular filter combinations for common medical searches',
    presets: {
      cardiologyGuidelines: {
        name: 'Cardiology Guidelines',
        description: 'Latest evidence-based cardiology practice guidelines'
      },
      cancerResearch: {
        name: 'Cancer Research',
        description: 'Cutting-edge oncology research and clinical trials'
      },
      neurologyReferences: {
        name: 'Neurology References',
        description: 'Comprehensive neurology textbooks and references'
      },
      systematicReviews: {
        name: 'Systematic Reviews',
        description: 'High-quality systematic reviews and meta-analyses'
      },
      clinicalGuidelines: {
        name: 'Clinical Guidelines',
        description: 'Evidence-based clinical practice guidelines'
      },
      medicalEducation: {
        name: 'Medical Education',
        description: 'CME materials and educational resources'
      },
      highImpactStudies: {
        name: 'High Impact Studies',
        description: 'Research from top-tier medical journals'
      },
      governmentSources: {
        name: 'Government Sources',
        description: 'FDA, CDC, NIH, and official health authorities'
      },
      patientEducation: {
        name: 'Patient Education',
        description: 'Patient-friendly educational materials'
      },
      medicalStudents: {
        name: 'Medical Students',
        description: 'Resources tailored for medical education'
      },
      latestResearch: {
        name: 'Latest Research',
        description: 'Most recent publications from the past month'
      },
      openAccess: {
        name: 'Open Access',
        description: 'Freely accessible full-text articles'
      },
      breakthroughResearch: {
        name: 'Breakthrough Research',
        description: 'Groundbreaking studies and discoveries'
      }
    },
    badges: {
      premium: 'Premium',
      popular: 'Popular'
    }
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
  },

  // Authority & Quality Filters
  authorityQuality: {
    title: 'Authority & Quality',
    description: 'Filter by source credibility, peer review status, and evidence quality',

    sections: {
      government: 'Government Sources',
      professionalSocieties: 'Professional Societies',
      academicInstitutions: 'Academic Institutions',
      publishers: 'Publishers & Journals',
      medicalOrganizations: 'Medical Organizations'
    },

    // Government Sources
    authorities: {
      government: {
        cdc: {
          name: 'CDC',
          description: 'Centers for Disease Control and Prevention',
          examples: ['Disease surveillance', 'Public health guidelines']
        },
        fda: {
          name: 'FDA',
          description: 'Food and Drug Administration',
          examples: ['Drug approvals', 'Safety communications']
        },
        nih: {
          name: 'NIH',
          description: 'National Institutes of Health',
          examples: ['Research funding', 'Clinical guidelines']
        },
        who: {
          name: 'WHO',
          description: 'World Health Organization',
          examples: ['Global health guidelines', 'Disease classification']
        }
      },
      professionalSocieties: {
        aha: {
          name: 'AHA',
          description: 'American Heart Association',
          examples: ['Cardiology guidelines', 'CPR protocols']
        },
        acs: {
          name: 'ACS',
          description: 'American Cancer Society',
          examples: ['Cancer screening', 'Treatment guidelines']
        },
        asco: {
          name: 'ASCO',
          description: 'American Society of Clinical Oncology',
          examples: ['Oncology guidelines', 'Treatment recommendations']
        },
        acp: {
          name: 'ACP',
          description: 'American College of Physicians',
          examples: ['Internal medicine guidelines', 'Best practices']
        }
      },
      academicInstitutions: {
        harvard: {
          name: 'Harvard Medical School',
          description: 'Leading medical education and research',
          examples: ['Medical research', 'Clinical studies']
        },
        mayo: {
          name: 'Mayo Clinic',
          description: 'Integrated clinical practice and research',
          examples: ['Clinical guidelines', 'Patient care protocols']
        },
        hopkins: {
          name: 'Johns Hopkins',
          description: 'Medical research and education leader',
          examples: ['Research publications', 'Clinical protocols']
        }
      },
      publishers: {
        nejm: {
          name: 'New England Journal of Medicine',
          description: 'Premier medical journal',
          examples: ['High-impact research', 'Clinical trials']
        },
        lancet: {
          name: 'The Lancet',
          description: 'Leading international medical journal',
          examples: ['Global health research', 'Clinical studies']
        },
        bmj: {
          name: 'BMJ',
          description: 'British Medical Journal',
          examples: ['Evidence-based medicine', 'Clinical research']
        },
        jama: {
          name: 'JAMA',
          description: 'Journal of the American Medical Association',
          examples: ['Clinical research', 'Medical guidelines']
        }
      },
      medicalOrganizations: {
        uptodate: {
          name: 'UpToDate',
          description: 'Clinical decision support resource',
          examples: ['Clinical guidelines', 'Point-of-care information']
        },
        cochrane: {
          name: 'Cochrane Library',
          description: 'Systematic reviews and evidence synthesis',
          examples: ['Systematic reviews', 'Meta-analyses']
        },
        medscape: {
          name: 'Medscape',
          description: 'Medical information and education',
          examples: ['Medical news', 'Continuing education']
        }
      }
    },

    // Peer Review Options
    peerReviewOptions: {
      peerReviewed: {
        label: 'Peer-Reviewed',
        description: 'Reviewed by independent experts in the field'
      },
      editorialReview: {
        label: 'Editorial Review',
        description: 'Reviewed by editorial staff'
      },
      expertConsensus: {
        label: 'Expert Consensus',
        description: 'Based on expert panel agreement'
      }
    },

    // Citation Tiers
    citationTiers: {
      highlyCited: {
        label: 'Highly Cited',
        impact: 'High Impact',
        description: 'Articles with high citation counts (>100 citations)'
      },
      moderatelyCited: {
        label: 'Moderately Cited',
        impact: 'Good Impact',
        description: 'Articles with moderate citation counts (10-100 citations)'
      }
    },

    peerReview: 'Peer Review Status',
    peerReviewLabel: 'Peer review:',
    citationImpact: 'Citation Impact',
    citationTierLabel: 'Citation tier:',

    tips: {
      title: 'Quality Assessment Tips',
      gov: 'Government sources and major professional societies provide the highest authority',
      peer: 'Peer-reviewed content has undergone independent expert evaluation',
      cited: 'Highly cited articles indicate significant impact in the medical community',
      combine: 'Consider combining multiple quality indicators for best results'
    },

    summary: 'Authority & Quality Summary'
  },

  // Publication & Access Filters
  publicationAccess: {
    title: 'Publication & Access',
    description: 'Filter by publication date, access type, and availability',

    publicationDate: 'Publication Date',
    accessType: 'Access Type',
    language: 'Language',

    // Date Ranges
    dateRanges: {
      lastMonth: {
        label: 'Last Month',
        description: 'Published within the last 30 days'
      },
      last3Months: {
        label: 'Last 3 Months',
        description: 'Published within the last 90 days'
      },
      last6Months: {
        label: 'Last 6 Months',
        description: 'Published within the last 6 months'
      },
      lastYear: {
        label: 'Last Year',
        description: 'Published within the last 12 months'
      },
      last2Years: {
        label: 'Last 2 Years',
        description: 'Published within the last 2 years'
      },
      last5Years: {
        label: 'Last 5 Years',
        description: 'Published within the last 5 years'
      }
    },

    // Access Types
    accessTypes: {
      openAccess: {
        label: 'Open Access',
        description: 'Freely available to everyone',
        badge: 'Free'
      },
      subscription: {
        label: 'Subscription Required',
        description: 'Requires institutional or personal subscription',
        badge: 'Subscription'
      },
      payPerView: {
        label: 'Pay-per-View',
        description: 'Available for individual purchase',
        badge: 'Paid'
      },
      freeWithRegistration: {
        label: 'Free with Registration',
        description: 'Free access after user registration',
        badge: 'Registration'
      }
    },

    // Languages
    languages: {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ja: 'Japanese',
      zh: 'Chinese',
      ru: 'Russian',
      ar: 'Arabic',
      ka: 'Georgian'
    },

    tips: {
      title: 'Publication & Access Tips',
      open: 'Open access content is immediately available without restrictions',
      recent: 'Recent publications may contain the most current treatment recommendations',
      access: 'Some high-quality content may require institutional access',
      ranges: 'Consider multiple date ranges for comprehensive coverage'
    },

    summary: 'Publication & Access Summary',
    summaryRanges: 'Date ranges:',
    summaryAccess: 'Access types:',
    summaryLang: 'Languages:'
  },

  // Geographic & Context Filters
  geographicContext: {
    title: 'Geography & Context',
    description: 'Filter by geographic relevance, practice settings, and patient populations',

    regions: 'Geographic Regions',
    practice: 'Practice Setting',
    populations: 'Patient Populations',

    // Geographic Regions
    geographicRegions: {
      northAmerica: {
        label: 'North America',
        description: 'United States, Canada, Mexico'
      },
      europe: {
        label: 'Europe',
        description: 'European Union and associated countries'
      },
      asiaPacific: {
        label: 'Asia-Pacific',
        description: 'East Asia, Southeast Asia, Oceania'
      },
      latinAmerica: {
        label: 'Latin America',
        description: 'South and Central America'
      },
      middleEastAfrica: {
        label: 'Middle East & Africa',
        description: 'MENA region and Sub-Saharan Africa'
      }
    },

    // Practice Settings
    practiceSettings: {
      hospitalInpatient: {
        label: 'Hospital Inpatient',
        description: 'Acute care, emergency departments, intensive care'
      },
      hospitalOutpatient: {
        label: 'Hospital Outpatient',
        description: 'Ambulatory surgery, specialty clinics'
      },
      primaryCare: {
        label: 'Primary Care',
        description: 'Family medicine, internal medicine, pediatrics'
      },
      specialtyClinic: {
        label: 'Specialty Clinic',
        description: 'Specialized outpatient practices'
      },
      homeCare: {
        label: 'Home Care',
        description: 'Telemedicine, home visits, remote monitoring'
      },
      longTermCare: {
        label: 'Long-term Care',
        description: 'Nursing homes, assisted living, rehabilitation'
      }
    },

    // Patient Populations
    patientPopulations: {
      pediatric: {
        label: 'Pediatric',
        ageRange: '0-18',
        description: 'Children and adolescents (0-18 years)'
      },
      adult: {
        label: 'Adult',
        ageRange: '18-65',
        description: 'Adults (18-65 years)'
      },
      geriatric: {
        label: 'Geriatric',
        ageRange: '65+',
        description: 'Elderly patients (65+ years)'
      },
      pregnantWomen: {
        label: 'Pregnant Women',
        ageRange: 'reproductive',
        description: 'Prenatal, perinatal, and postnatal care'
      },
      immunocompromised: {
        label: 'Immunocompromised',
        ageRange: 'all',
        description: 'Patients with weakened immune systems'
      },
      chronicConditions: {
        label: 'Chronic Conditions',
        ageRange: 'all',
        description: 'Diabetes, hypertension, COPD, etc.'
      }
    },

    tips: {
      title: 'Geography & Context Tips',
      regions: 'Geographic filters help find region-specific recommendations and practices',
      practice: 'Practice setting determines care protocols and resource availability',
      populations: 'Patient populations influence treatment approaches and safety considerations',
      combine: 'Consider combining multiple contexts for comprehensive care guidance'
    },

    summary: 'Geography & Context Summary',
    summaryRegions: 'Geographic regions:',
    summaryPractice: 'Practice settings:',
    summaryPopulations: 'Patient populations:'
  },

  // Medical Domain Filters
  medicalDomain: {
    title: 'Medical Domain & Specialties',
    description: 'Filter by medical specialties, subspecialties, and clinical topics',

    comingSoon: {
      title: 'Coming Soon',
      body: 'Medical specialty filtering with 25+ specialties and subspecialties will be available in the next update.'
    }
  },

  // Audience & Complexity Filters
  audienceComplexity: {
    title: 'Audience & Complexity Level',
    description: 'Filter by target audience, complexity level, and reading difficulty'
  },

  // Advanced Options Filters
  advancedOptions: {
    title: 'Advanced Options',
    description: 'Clinical trials, research parameters, and specialized filtering options',

    trials: 'Clinical Trial Filtering',

    comingSoon: {
      title: 'More Advanced Options Coming Soon',
      body: 'Additional specialized filtering options for research parameters, study design, and advanced search operators will be available in future updates.'
    }
  }
};

export default filters;