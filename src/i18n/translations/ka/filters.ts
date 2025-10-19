export const filters = {
  // Modal
  modal: {
    title: 'გაფართოებული სამედიცინო ფილტრები',
    subtitle: 'დააზუსტეთ ძიება  ფილტრებით'
  },

  // Categories
  categories: {
    quickFilters: 'სწრაფი ფილტრები',
    quickFiltersDesc: 'პოპულარული კომბინაციები გავრცელებული ძიებებისთვის',
    contentFormat: 'კონტენტი და ფორმატი',
    contentFormatDesc: 'გაფილტრეთ კონტენტის ტიპის, ფაილის ფორმატის და სტრუქტურის მიხედვით',
    authorityQuality: 'ავტორიტეტი და ხარისხი',
    authorityQualityDesc: 'წყაროს სანდოობა, რეცენზირება და მტკიცებულების ხარისხი',
    medicalDomain: 'სამედიცინო დომენი',
    medicalDomainDesc: 'სპეციალობები, ქვესპეციალობები და კლინიკური თემები',
    publicationAccess: 'პუბლიკაცია და წვდომა',
    publicationAccessDesc: 'გამოქვეყნების თარიღი, წვდომის ტიპი და ხელმისაწვდომობა',
    geographicContext: 'გეოგრაფია და კონტექსტი',
    geographicContextDesc: 'გეოგრაფიული რელევანტურობა, პრაქტიკის გარემო და პაციენტთა პოპულაციები',
    advancedOptions: 'დამატებითი პარამეტრები',
    advancedOptionsDesc: 'კლინიკური კვლევები, კვლევის პარამეტრები და სპეციალიზებული ფილტრები'
  },

  // Quick filters
  quickFilters: {
    title: 'სწრაფი ფილტრები',
    subtitle: 'პოპულარული კომბინაციები გავრცელებული სამედიცინო ძიებებისთვის',

    // Quick filter presets
    presets: {
      // Medical Specialty Filters
      cardiologyGuidelines: {
        name: 'კარდიოლოგიის რეკომენდაციები',
        description: 'უახლესი კარდიოლოგიური მკურნალობის რეკომენდაციები და პროტოკოლები'
      },
      cancerResearch: {
        name: 'კიბოს კვლევა',
        description: 'უახლესი ონკოლოგიური კვლევითი სტატიები და კლინიკური კვლევები'
      },
      neurologyReferences: {
        name: 'ნევროლოგიის ცნობარები',
        description: 'ყოვლისმომცველი ნევროლოგიის სახელმძღვანელოები და სახელმძღვანელოები'
      },

      // Content Type Filters
      systematicReviews: {
        name: 'სისტემური მიმოხილვები',
        description: 'მაღალი ხარისხის სისტემური მიმოხილვები და მეტა-ანალიზები'
      },
      clinicalGuidelines: {
        name: 'კლინიკური რეკომენდაციები',
        description: 'მტკიცებულებებზე დაფუძნებული კლინიკური პრაქტიკის რეკომენდაციები'
      },
      medicalEducation: {
        name: 'სამედიცინო განათლება',
        description: 'CME მასალები, კლინიკური შემთხვევები და სასწავლო რესურსები'
      },

      // Quality & Authority Filters
      highImpactStudies: {
        name: 'მაღალი ზემოქმედების კვლევები',
        description: 'ძალიან ციტირებული კვლევები წამყვანი ჟურნალებიდან'
      },
      governmentSources: {
        name: 'სამთავრობო წყაროები',
        description: 'ოფიციალური სამთავრობო ჯანმრთელობის ინფორმაცია'
      },

      // Audience-Specific Filters
      patientEducation: {
        name: 'პაციენტების განათლება',
        description: 'პაციენტებისთვის გასაგები ჯანმრთელობის ინფორმაცია და რესურსები'
      },
      medicalStudents: {
        name: 'სამედიცინო სტუდენტები',
        description: 'საგანმანათლებლო კონტენტი სამედიცინო სტუდენტებისთვის'
      },

      // Recent & Access Filters
      latestResearch: {
        name: 'უახლესი კვლევა',
        description: 'უახლესი სამედიცინო კვლევა და აღმოჩენები'
      },
      openAccess: {
        name: 'ღია წვდომა',
        description: 'თავისუფლად ხელმისაწვდომი სამედიცინო ლიტერატურა'
      },

      // Advanced Combinations
      breakthroughResearch: {
        name: 'გარღვევის კვლევა',
        description: 'რევოლუციური სამედიცინო აღმოჩენები და ინოვაციები'
      }
    },

    // Badges
    badges: {
      premium: 'პრემიუმ',
      popular: 'პოპულარული'
    },

    // Save dialog
    saveDialog: {
      title: 'ფილტრების კომბინაციის შენახვა',
      placeholder: 'შეიყვანეთ ფილტრის სახელი...'
    },

    empty: 'არ მოიძებნა სწრაფი ფილტრები ამ კატეგორიისთვის',
    saveCurrent: 'მიმდინარეს შენახვა'
  },

  // Options
  specialty: {
    label: 'სამედიცინო სპეციალობა',
    all: 'ყველა სპეციალობა',
    cardiology: 'კარდიოლოგია',
    obgyn: 'მეანობა-გინეკოლოგია',
    internalMedicine: 'შინაგანი მედიცინა',
    emergencyMedicine: 'გადაუდებელი მედიცინა',
    pediatrics: 'პედიატრია',
    surgery: 'ქირურგია',
    radiology: 'რადიოლოგია',
    pathology: 'პათოლოგია'
  },

  evidenceLevel: {
    label: 'მტკიცებულების დონე',
    all: 'ყველა დონე',
    systematicReview: 'სისტემური მიმოხილვები',
    rct: 'რანდომიზებული კონტროლირებადი კვლევები',
    cohortStudy: 'კოჰორტის კვლევები',
    caseControl: 'შემთხვევა-კონტროლის კვლევები',
    caseSeries: 'შემთხვევების სერიები',
    expertOpinion: 'ექსპერტის მოსაზრება',
    guideline: 'კლინიკური რეკომენდაციები',
    reviewArticle: 'მიმოხილვითი სტატიები'
  },

  contentType: {
    label: 'კონტენტის ტიპი',
    all: 'ყველა ტიპი',
    researchPaper: 'კვლევითი სტატიები',
    clinicalGuideline: 'კლინიკური რეკომენდაციები',
    caseReport: 'შემთხვევების აღწერა',
    medicalNews: 'სამედიცინო სიახლეები',
    educationalMaterial: 'საგანმანათლებლო მასალები',
    drugInformation: 'ინფორმაცია მედიკამენტებზე',
    calculator: 'სამედიცინო კალკულატორები'
  },

  recency: {
    label: 'გამოქვეყნების თარიღი',
    all: 'ყველა თარიღი',
    pastWeek: 'ბოლო კვირა',
    pastMonth: 'ბოლო თვე',
    past3Months: 'ბოლო 3 თვე',
    pastYear: 'ბოლო წელი',
    past5Years: 'ბოლო 5 წელი'
  },

  source: {
    label: 'წყარო',
    all: 'ყველა წყარო',
    pubmed: 'PubMed',
    cochrane: 'კოქრეინის ბიბლიოთეკა',
    uptodate: 'UpToDate',
    guidelines: 'კლინიკური რეკომენდაციები',
    journals: 'სამედიცინო ჟურნალები'
  },

  // Content format (extended)
  contentFormat: {
    title: 'კონტენტის ტიპი და ფორმატი',
    description: 'გაფილტრეთ კონკრეტული სამედიცინო კონტენტის ტიპებისა და ფაილის ფორმატების მიხედვით',
    sections: {
      researchLiterature: {
        title: 'სამედიცინო ლიტერატურა',
        options: {
          studies: { label: 'კლინიკური კვლევები', description: 'დამკვირვებლური და ინტერვენციული კვლევები' },
          trials: { label: 'კლინიკური კვლევები', description: 'რანდომიზებული კვლევები და ინტერვენციული კვლევები' },
          metaAnalyses: { label: 'მეტა-ანალიზები', description: 'რამდენიმე კვლევის სტატისტიკური ანალიზი' },
          systematicReviews: { label: 'სისტემური მიმოხილვები', description: 'მტკიცებულებების ყოვლისმომცველი სინთეზი' }
        }
      },
      clinicalGuidelines: {
        title: 'კლინიკური რეკომენდაციები',
        options: {
          treatmentGuidelines: { label: 'მკურნალობის რეკომენდაციები', description: 'მტკიცებულებებზე დაფუძნებული რეკომენდაციები' },
          diagnosticProtocols: { label: 'დიაგნოსტიკური პროტოკოლები', description: 'სტანდარტიზებული დიაგნოსტიკური პროცედურები' },
          bestPractices: { label: 'საუკეთესო პრაქტიკები', description: 'პრაქტიკის პროფესიული სტანდარტები' }
        }
      },
      medicalReferences: {
        title: 'სამედიცინო ცნობარები',
        options: {
          textbooks: { label: 'სამედიცინო სახელმძღვანელოები', description: 'სამედიცინო ენციკლოპედიური ცნობარები' },
          handbooks: { label: 'კლინიკური სახელმძღვანელოები', description: 'პრაქტიკული კლინიკური გზنماები' },
          medicalDictionaries: { label: 'სამედიცინო ლექსიკონები', description: 'სამედიცინო ტერმინოლოგია და განსაზღვრებები' }
        }
      },
      educationalContent: {
        title: 'საგანმანათლებლო კონტენტი',
        options: {
          cmeMaterials: { label: 'CME მასალები', description: 'განგრძობადი სამედიცინო განათლების რესურსები' },
          caseStudies: { label: 'კლინიკური შემთხვევები', description: 'კლინიკური პრეზენტაციები და ანალიზი' },
          learningModules: { label: 'სასწავლო მოდულები', description: 'სტრუქტურირებული საგანმანათლებლო კონტენტი' }
        }
      },
      regulatoryDocs: {
        title: 'რეგულატორული დოკუმენტები',
        options: {
          fdaApprovals: { label: 'FDA-ის დამტკიცებები', description: 'მედიკამენტებისა და მოწყობილობების დამტკიცება' },
          drugLabels: { label: 'წამლის ინსტრუქციები', description: 'ოფიციალური საინსტრუქციო ინფორმაცია' },
          safetyCommunications: { label: 'უსაფრთხოების კომუნიკაციები', description: 'უსაფრთხოების შეტყობინებები და გაფრთხილებები' }
        }
      },
      patientResources: {
        title: 'პაციენტის რესურსები',
        options: {
          patientEducation: { label: 'პაციენტის განათლება', description: 'საგანმანათლებლო მასალები პაციენტებისთვის' },
          factSheets: { label: 'ინფო ფურცლები', description: 'სწრაფი საინფორმაციო მასალები' },
          brochures: { label: 'ბროშურები', description: 'ინფორმაციული ბროშურები პაციენტებისთვის' }
        }
      }
    }
  },

  fileFormats: {
    title: 'ფაილის ფორმატები',
    options: {
      pdf: { label: 'PDF დოკუმენტები', description: 'Portable Document Format ფაილები' },
      html: { label: 'ვებ-გვერდები', description: 'HTML ვებ-კონტენტი' },
      doc: { label: 'Word დოკუმენტები', description: 'Microsoft Word დოკუმენტები' },
      ppt: { label: 'პრეზენტაციები', description: 'PowerPoint პრეზენტაციები' },
      video: { label: 'ვიდეო', description: 'საგანმანათლებლო და კლინიკური ვიდეოები' },
      audio: { label: 'აუდიო', description: 'პოდკასტები და აუდიო კონტენტი' }
    }
  },

  summary: {
    title: 'ფილტრების შეჯამება',
    fileFormatsLabel: 'ფაილის ფორმატები:',
    activeFilters: 'აქტიური ფილტრები',
    categories: 'კატეგორიები',
    none: 'ფილტრები არ არის აქტიური',
    one: '1 ფილტრი აქტიურია',
    many: '{{count}} ფილტრი აქტიურია'
  },

  // Button labels and actions
  button: {
    label: 'ფილტრები'
  },

  clearAll: 'ყველა ფილტრის გასუფთავება',

  // Filter preview
  preview: {
    results: 'შედეგების გადახედვა',
    previewShort: 'გადახედვა'
  },
  changesNotApplied: 'ცვლილებები ჯერ არ არის გამოყენებული',
  save: 'ფილტრების შენახვა',
  filterCategories: {
    all: 'ყველა ფილტრი',
    specialty: 'სამედიცინო სპეციალობები',
    content: 'კონტენტის ტიპები',
    quality: 'ხარისხი და ავტორიტეტი',
    audience: 'აუდიტორია',
    recent: 'ბოლოდროინდელი',
    access: 'წვდომა'
  },
  active: 'ფილტრი აქტიურია',

  // Authority & Quality Filters
  authorityQuality: {
    title: 'ავტორიტეტი და ხარისხი',
    description: 'გაფილტრეთ წყაროს სანდოობის, რეცენზირების სტატუსისა და მტკიცებულების ხარისხის მიხედვით',

    sections: {
      government: 'სამთავრობო წყაროები',
      professionalSocieties: 'პროფესიული საზოგადოებები',
      academicInstitutions: 'აკადემიური ინსტიტუტები',
      publishers: 'გამომცემლები და ჟურნალები',
      medicalOrganizations: 'სამედიცინო ორგანიზაციები'
    },

    // სამთავრობო წყაროები
    authorities: {
      government: {
        cdc: {
          name: 'CDC',
          description: 'დაავადებათა კონტროლისა და პრევენციის ცენტრები',
          examples: ['დაავადებების ზედამხედველობა', 'საზოგადოებრივი ჯანდაცვის რეკომენდაციები']
        },
        fda: {
          name: 'FDA',
          description: 'კვების პროდუქტებისა და მედიკამენტების ადმინისტრაცია',
          examples: ['მედიკამენტების დამტკიცება', 'უსაფრთხოების შეტყობინებები']
        },
        nih: {
          name: 'NIH',
          description: 'ჯანდაცვის ეროვნული ინსტიტუტები',
          examples: ['კვლევითი დაფინანსება', 'კლინიკური რეკომენდაციები']
        },
        who: {
          name: 'WHO',
          description: 'ჯანდაცვის მსოფლიო ორგანიზაცია',
          examples: ['გლობალური ჯანდაცვის რეკომენდაციები', 'დაავადებების კლასიფიკაცია']
        }
      },
      professionalSocieties: {
        aha: {
          name: 'AHA',
          description: 'ამერიკის გულის ასოციაცია',
          examples: ['კარდიოლოგიის რეკომენდაციები', 'CPR პროტოკოლები']
        },
        acs: {
          name: 'ACS',
          description: 'ამერიკის კიბოს საზოგადოება',
          examples: ['კიბოს სკრინინგი', 'მკურნალობის რეკომენდაციები']
        },
        asco: {
          name: 'ASCO',
          description: 'ამერიკის კლინიკური ონკოლოგიის საზოგადოება',
          examples: ['ონკოლოგიის რეკომენდაციები', 'მკურნალობის რეკომენდაციები']
        },
        acp: {
          name: 'ACP',
          description: 'ამერიკის ექიმთა კოლეჯი',
          examples: ['შინაგანი მედიცინის რეკომენდაციები', 'საუკეთესო პრაქტიკები']
        }
      },
      academicInstitutions: {
        harvard: {
          name: 'ჰარვარდის სამედიცინო სკოლა',
          description: 'წამყვანი სამედიცინო განათლებისა და კვლევის ცენტრი',
          examples: ['სამედიცინო კვლევა', 'კლინიკური კვლევები']
        },
        mayo: {
          name: 'მაიოს კლინიკა',
          description: 'ინტეგრირებული კლინიკური პრაქტიკა და კვლევა',
          examples: ['კლინიკური რეკომენდაციები', 'პაციენტთა მოვლის პროტოკოლები']
        },
        hopkins: {
          name: 'ჯონს ჰოპკინსი',
          description: 'სამედიცინო კვლევისა და განათლების ლიდერი',
          examples: ['კვლევითი პუბლიკაციები', 'კლინიკური პროტოკოლები']
        }
      },
      publishers: {
        nejm: {
          name: 'ნიუ ინგლენდ ჯორნალ ოფ მედისინი',
          description: 'პრემიერ სამედიცინო ჟურნალი',
          examples: ['მაღალი გავლენის კვლევები', 'კლინიკური კვლევები']
        },
        lancet: {
          name: 'ლანსეტი',
          description: 'წამყვანი საერთაშორისო სამედიცინო ჟურნალი',
          examples: ['გლობალური ჯანდაცვის კვლევები', 'კლინიკური კვლევები']
        },
        bmj: {
          name: 'BMJ',
          description: 'ბრიტანული სამედიცინო ჟურნალი',
          examples: ['მტკიცებულებებზე დაფუძნებული მედიცინა', 'კლინიკური კვლევები']
        },
        jama: {
          name: 'JAMA',
          description: 'ამერიკის სამედიცინო ასოციაციის ჟურნალი',
          examples: ['კლინიკური კვლევები', 'სამედიცინო რეკომენდაციები']
        }
      },
      medicalOrganizations: {
        uptodate: {
          name: 'UpToDate',
          description: 'კლინიკური გადაწყვეტილებების მხარდაჭერის რესურსი',
          examples: ['კლინიკური რეკომენდაციები', 'ადგილზე მოვლის ინფორმაცია']
        },
        cochrane: {
          name: 'კოქრეინის ბიბლიოთეკა',
          description: 'სისტემური მიმოხილვები და მტკიცებულებების სინთეზი',
          examples: ['სისტემური მიმოხილვები', 'მეტა-ანალიზები']
        },
        medscape: {
          name: 'Medscape',
          description: 'სამედიცინო ინფორმაცია და განათლება',
          examples: ['სამედიცინო სიახლეები', 'განგრძობადი განათლება']
        }
      }
    },

    // რეცენზირების ვარიანტები
    peerReviewOptions: {
      peerReviewed: {
        label: 'რეცენზირებული',
        description: 'გადახედილი დამოუკიდებელი ექსპერტების მიერ'
      },
      editorialReview: {
        label: 'რედაქტორული მიმოხილვა',
        description: 'გადახედილი რედაქციის პერსონალის მიერ'
      },
      expertConsensus: {
        label: 'ექსპერტთა კონსენსუსი',
        description: 'დაფუძნებული ექსპერტთა პანელის შეთანხმებაზე'
      }
    },

    // ციტირების დონეები
    citationTiers: {
      highlyCited: {
        label: 'ძალიან ციტირებული',
        impact: 'მაღალი გავლენა',
        description: 'სტატიები მაღალი ციტირების რაოდენობით (>100 ციტირება)'
      },
      moderatelyCited: {
        label: 'საშუალოდ ციტირებული',
        impact: 'კარგი გავლენა',
        description: 'სტატიები საშუალო ციტირების რაოდენობით (10-100 ციტირება)'
      }
    },

    peerReview: 'რეცენზირების სტატუსი',
    peerReviewLabel: 'რეცენზირება:',
    citationImpact: 'ციტირების გავლენა',
    citationTierLabel: 'ციტირების დონე:',

    tips: {
      title: 'ხარისხის შეფასების რჩევები',
      gov: 'სამთავრობო წყაროები და მთავარი პროფესიული საზოგადოებები უზრუნველყოფენ უმაღლეს ავტორიტეტს',
      peer: 'რეცენზირებული კონტენტი გაიარა დამოუკიდებელი ექსპერტების შეფასება',
      cited: 'ძალიან ციტირებული სტატიები მიუთითებს მნიშვნელოვან გავლენაზე სამედიცინო საზოგადოებაში',
      combine: 'განიხილეთ რამდენიმე ხარისხის ინდიკატორის კომბინირება საუკეთესო შედეგებისთვის'
    },

    summary: 'ავტორიტეტისა და ხარისხის შეჯამება'
  },

  // Publication & Access Filters
  publicationAccess: {
    title: 'პუბლიკაცია და წვდომა',
    description: 'გაფილტრეთ გამოქვეყნების თარიღის, წვდომის ტიპისა და ხელმისაწვდომობის მიხედვით',

    publicationDate: 'გამოქვეყნების თარიღი',
    accessType: 'წვდომის ტიპი',
    language: 'ენა',

    // თარიღის დიაპაზონები
    dateRanges: {
      lastMonth: {
        label: 'ბოლო თვე',
        description: 'გამოქვეყნებული ბოლო 30 დღის განმავლობაში'
      },
      last3Months: {
        label: 'ბოლო 3 თვე',
        description: 'გამოქვეყნებული ბოლო 90 დღის განმავლობაში'
      },
      last6Months: {
        label: 'ბოლო 6 თვე',
        description: 'გამოქვეყნებული ბოლო 6 თვის განმავლობაში'
      },
      lastYear: {
        label: 'ბოლო წელი',
        description: 'გამოქვეყნებული ბოლო 12 თვის განმავლობაში'
      },
      last2Years: {
        label: 'ბოლო 2 წელი',
        description: 'გამოქვეყნებული ბოლო 2 წლის განმავლობაში'
      },
      last5Years: {
        label: 'ბოლო 5 წელი',
        description: 'გამოქვეყნებული ბოლო 5 წლის განმავლობაში'
      }
    },

    // წვდომის ტიპები
    accessTypes: {
      openAccess: {
        label: 'ღია წვდომა',
        description: 'თავისუფლად ხელმისაწვდომი ყველასთვის',
        badge: 'უფასო'
      },
      subscription: {
        label: 'გამოწერა აუცილებელია',
        description: 'მოითხოვს ინსტიტუციურ ან პირად გამოწერას',
        badge: 'გამოწერა'
      },
      payPerView: {
        label: 'ინდივიდუალური შეძენა',
        description: 'ხელმისაწვდომია ინდივიდუალური შესყიდვისთვის',
        badge: 'ფასიანი'
      },
      freeWithRegistration: {
        label: 'უფასო რეგისტრაციით',
        description: 'უფასო წვდომა მომხმარებლის რეგისტრაციის შემდეგ',
        badge: 'რეგისტრაცია'
      }
    },

    // ენები
    languages: {
      en: 'ინგლისური',
      es: 'ესპანური',
      fr: 'ფრანგული',
      de: 'გერმანული',
      it: 'იტალიური',
      pt: 'პორტუგალიური',
      ja: 'იაპონური',
      zh: 'ჩინური',
      ru: 'რუსული',
      ar: 'არაბული',
      ka: 'ქართული'
    },

    tips: {
      title: 'წვდომისა და პუბლიკაციის რჩევები',
      open: 'ღია წვდომის კონტენტი მყისიერად ხელმისაწვდომია შეზღუდვების გარეშე',
      recent: 'უახლესი პუბლიკაციები შეიძლება შეიცავდეს ყველაზე თანამედროვე მკურნალობის რეკომენდაციებს',
      access: 'ზოგიერთი მაღალი ხარისხის კონტენტი შეიძლება მოითხოვდეს ინსტიტუციურ წვდომას',
      ranges: 'განიხილეთ რამდენიმე თარიღის დიაპაზონი ყოვლისმომცველი დაფარვისთვის'
    },

    summary: 'პუბლიკაციისა და წვდომის შეჯამება',
    summaryRanges: 'თარიღის დიაპაზონები:',
    summaryAccess: 'წვდომის ტიპები:',
    summaryLang: 'ენები:'
  },

  // Geographic & Context Filters
  geographicContext: {
    title: 'გეოგრაფია და კონტექსტი',
    description: 'გაფილტრეთ გეოგრაფიული რელევანტურობის, პრაქტიკის გარემოსა და პაციენტთა პოპულაციების მიხედვით',

    regions: 'გეოგრაფიული რეგიონები',
    practice: 'პრაქტიკის გარემო',
    populations: 'პაციენტთა პოპულაციები',

    // გეოგრაფიული რეგიონები
    geographicRegions: {
      northAmerica: {
        label: 'ჩრდილოეთ ამერიკა',
        description: 'შეერთებული შტატები, კანადა, მექსიკა'
      },
      europe: {
        label: 'ევროპა',
        description: 'ევროკავშირი და ასოცირებული ქვეყნები'
      },
      asiaPacific: {
        label: 'აზია-წყნარი ოკეანე',
        description: 'აღმოსავლეთ აზია, სამხრეთ-აღმოსავლეთ აზია, ოკეანეთი'
      },
      latinAmerica: {
        label: 'ლათინური ამერიკა',
        description: 'სამხრეთ და ცენტრალური ამერიკა'
      },
      middleEastAfrica: {
        label: 'ახლო აღმოსავლეთი და აფრიკა',
        description: 'MENA რეგიონი და სუბსაჰარული აფრიკა'
      }
    },

    // პრაქტიკის გარემო
    practiceSettings: {
      hospitalInpatient: {
        label: 'საავადმყოფოს სტაციონარი',
        description: 'მწვავე მოვლა, გადაუდებელი დეპარტამენტები, ინტენსიური თერაპია'
      },
      hospitalOutpatient: {
        label: 'საავადმყოფოს ამბულატორია',
        description: 'ამბულატორული ქირურგია, სპეციალიზებული კლინიკები'
      },
      primaryCare: {
        label: 'პირველადი მოვლა',
        description: 'საოჯახო მედიცინა, შინაგანი მედიცინა, პედიატრია'
      },
      specialtyClinic: {
        label: 'სპეციალიზებული კლინიკა',
        description: 'სპეციალიზებული ამბულატორიული პრაქტიკები'
      },
      homeCare: {
        label: 'სახლის მოვლა',
        description: 'ტელემედიცინა, სახლის ვიზიტები, დისტანციური მონიტორინგი'
      },
      longTermCare: {
        label: 'გრძელვადიანი მოვლა',
        description: 'მოხუცთა სახლები, დახმარებული ცხოვრება, რეაბილიტაცია'
      }
    },

    // პაციენტთა პოპულაციები
    patientPopulations: {
      pediatric: {
        label: 'პედიატრიული',
        ageRange: '0-18',
        description: 'ბავშვები და მოზარდები (0-18 წელი)'
      },
      adult: {
        label: 'უფროსები',
        ageRange: '18-65',
        description: 'მოზრდილები (18-65 წელი)'
      },
      geriatric: {
        label: 'გერიატრიული',
        ageRange: '65+',
        description: 'ხანდაზმული პაციენტები (65+ წელი)'
      },
      pregnantWomen: {
        label: 'ორსული ქალები',
        ageRange: 'რეპროდუქციული',
        description: 'პრენატალური, პერინატალური და პოსტნატალური მოვლა'
      },
      immunocompromised: {
        label: 'იმუნოკომპრომისირებული',
        ageRange: 'ყველა',
        description: 'პაციენტები დასუსტებული იმუნური სისტემით'
      },
      chronicConditions: {
        label: 'ქრონიკული მდგომარეობები',
        ageRange: 'ყველა',
        description: 'დიაბეტი, ჰიპერტენზია, COPD და ა.შ.'
      }
    },

    tips: {
      title: 'გეოგრაფიისა და კონტექსტის რჩევები',
      regions: 'გეოგრაფიული ფილტრები ეხმარება რეგიონ-სპეციფიკური რეკომენდაციებისა და პრაქტიკის პოვნაში',
      practice: 'პრაქტიკის გარემო განსაზღვრავს მოვლის პროტოკოლებსა და რესურსების ხელმისაწვდომობას',
      populations: 'პაციენტთა პოპულაციები გავლენას ახდენს მკურნალობის მიდგომებსა და უსაფრთხოების მოსაზრებებზე',
      combine: 'განიხილეთ რამდენიმე კონტექსტის კომბინირება ყოვლისმომცველი მოვლის სახელმძღვანელოსთვის'
    },

    summary: 'გეოგრაფიისა და კონტექსტის შეჯამება',
    summaryRegions: 'გეოგრაფიული რეგიონები:',
    summaryPractice: 'პრაქტიკის გარემო:',
    summaryPopulations: 'პაციენტთა პოპულაციები:'
  },

  // Medical Domain Filters
  medicalDomain: {
    title: 'სამედიცინო დომენი და სპეციალობები',
    description: 'გაფილტრეთ სამედიცინო სპეციალობების, ქვესპეციალობებისა და კლინიკური თემების მიხედვით',

    comingSoon: {
      title: 'მალე გამოჩნდება',
      body: 'სამედიცინო სპეციალობების ფილტრაცია 25+ სპეციალობით და ქვესპეციალობებით ხელმისაწვდომი იქნება შემდეგ განახლებაში.'
    }
  },

  // Audience & Complexity Filters
  audienceComplexity: {
    title: 'აუდიტორია და სირთულის დონე',
    description: 'გაფილტრეთ სამიზნე აუდიტორიის, სირთულის დონისა და კითხვის სირთულის მიხედვით'
  },

  // Advanced Options Filters
  advancedOptions: {
    title: 'დამატებითი პარამეტრები',
    description: 'კლინიკური კვლევები, კვლევის პარამეტრები და სპეციალიზებული ფილტრაციის ვარიანტები',

    trials: 'კლინიკური კვლევების ფილტრაცია',

    comingSoon: {
      title: 'მალე მეტი დამატებითი პარამეტრები',
      body: 'კვლევის პარამეტრებისთვის, კვლევის დიზაინისა და მოწინავე საძიებო ოპერატორებისთვის დამატებითი სპეციალიზებული ფილტრაციის ვარიანტები ხელმისაწვდომი იქნება მომავალ განახლებებში.'
    }
  }
};

export default filters;

