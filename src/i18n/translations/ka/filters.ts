export const filters = {
  // Modal
  modal: {
    title: 'გაფართოებული სამედიცინო ფილტრები',
    subtitle: 'გააზუსტეთ ძიება ზუსტი ფილტრებით'
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
    subtitle: 'პოპულარული კომბინაციები გავრცელებული სამედიცინო ძიებებისთვის'
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
  }
};

export default filters;

