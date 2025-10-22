export const diseases = {
  detailPage: {
    idNotProvided: 'Disease ID not provided',
    notFound: 'Disease not found',
    loadError: 'Failed to load disease content: {errorMessage}',
    backButton: 'Back to Diseases',
    loadingTitle: 'Loading Medical Document',
    loadingSubtext: 'Preparing clinical content...', 
    errorTitle: 'Disease Not Found',
    errorMessage: 'The requested disease could not be found in our medical database.',
    returnButton: 'Return to Disease List',
    readTime: 'Read Time',
    lastUpdated: 'Last Updated',
    prevalence: 'Prevalence',
    evidenceLevel: 'Evidence Level',
    gradeA: 'Grade A',
    bookmarked: 'Bookmarked',
    bookmark: 'Bookmark',
    share: 'Share',
    proContent: 'Professional medical content',
    contentNotAvailable: 'Content Not Available',
    contentNotAvailableMessage: 'The clinical content for this disease is not yet available. Please check back later or contact support.',
    medicalDocument: 'Medical Document',
    severity: {
      critical: 'Critical Condition',
      criticalDesc: 'Requires immediate medical attention',
      moderate: 'Moderate Severity',
      moderateDesc: 'Requires careful monitoring',
      stable: 'Stable Condition',
      stableDesc: 'Generally manageable',
      unknown: 'Unknown',
      unknownDesc: 'Severity not specified'
    }
  },
  evidenceLevels: {
    header: {
      title: 'Evidence-Based Medicine Reference',
      titleExpanded: 'Evidence Levels Overview',
      subtitle: 'Click to view evidence levels, Oxford CEBM standards & clinical guidelines',
      subtitleExpanded: 'Quality Grades & Clinical Applications - Click to hide',
      stats: {
        levels: '6 Evidence Levels',
        tables: '3 Reference Tables'
      }
    },
    slides: {
      overview: {
        title: 'Evidence Levels Overview',
        subtitle: 'Quality Grades & Clinical Applications'
      },
      oxford: {
        title: 'Oxford CEBM Levels',
        subtitle: 'Therapy, Prognosis & Diagnosis'
      },
      notes: {
        title: 'Clinical Application',
        subtitle: 'Usage Notes & Abbreviations'
      }
    },
    table: {
      headers: {
        evidenceLevel: 'Evidence Level',
        qualityGrade: 'Quality Grade',
        studyTypes: 'Study Types',
        clinicalApplication: 'Clinical Application'
      }
    },
    levels: {
      levelA: {
        level: 'Level A',
        grade: 'High Quality',
        quality: 'Strong Evidence',
        description: 'A preponderance of level I and/or level II studies supports the recommendation. Must include at least 1 level I study.',
        studyTypes: 'Multiple high-quality RCTs, systematic reviews with homogeneity',
        clinicalApplication: 'Strong recommendations for clinical practice'
      },
      levelB: {
        level: 'Level B',
        grade: 'Moderate Quality',
        quality: 'Moderate Evidence',
        description: 'A single high-quality randomised controlled trial or a preponderance of level II studies supports the recommendation.',
        studyTypes: 'Single high-quality RCT, well-conducted meta-analyses, limited RCTs',
        clinicalApplication: 'Moderate recommendations with clinical judgment'
      },
      levelC: {
        level: 'Level C',
        grade: 'Limited Quality',
        quality: 'Weak Evidence',
        description: 'A single level II study or a preponderance of level III and IV studies, including statements of consensus by content experts.',
        studyTypes: 'Non-randomized studies, observational data, case-control studies',
        clinicalApplication: 'Weak recommendations requiring careful consideration'
      },
      levelD: {
        level: 'Level D',
        grade: 'Very Limited',
        quality: 'Conflicting Evidence',
        description: 'Higher-quality studies conducted on this topic disagree concerning their conclusions. Based on conflicting studies.',
        studyTypes: 'Case series, case reports, conflicting studies',
        clinicalApplication: 'Expert opinion-based recommendations'
      },
      levelE: {
        level: 'Level E',
        grade: 'Theoretical',
        quality: 'Expert Opinion',
        description: 'A preponderance of evidence from animal or cadaver studies, conceptual models/principles, or basic sciences/bench research.',
        studyTypes: 'Animal studies, theoretical models, bench research',
        clinicalApplication: 'Guidance only, requires clinical validation'
      },
      levelI: {
        level: 'Level I',
        grade: 'Insufficient',
        quality: 'Insufficient Evidence',
        description: 'Evidence is insufficient or unavailable. No reliable studies exist, or existing studies have major methodological flaws.',
        studyTypes: 'No studies, poor quality studies, insufficient data',
        clinicalApplication: 'Cannot make evidence-based recommendations'
      }
    },
    oxford: {
      table: {
        headers: {
          level: 'Level',
          therapy: 'Therapy/Prevention',
          prognosis: 'Prognosis',
          diagnosis: 'Diagnosis'
        }
      },
      levels: {
        level1A: {
          level: '1A',
          therapy: 'Systematic reviews of randomised controlled trials',
          prognosis: 'SR of inception cohort studies; CDR validated in different populations',
          diagnosis: 'SR of Level 1 diagnostic studies; CDR with 1b studies from different centres'
        },
        level1B: {
          level: '1B',
          therapy: 'Individual RCT with narrow Confidence Interval',
          prognosis: 'Individual inception cohort study with >80% follow-up',
          diagnosis: 'Validating cohort study with good reference standards'
        },
        level1C: {
          level: '1C',
          therapy: 'All or none case series',
          prognosis: 'All or none case series',
          diagnosis: 'Absolute SpPins and SnNouts'
        },
        level2A: {
          level: '2A',
          therapy: 'SR (with homogeneity) of cohort studies',
          prognosis: 'SR of retrospective cohort studies or untreated control groups',
          diagnosis: 'SR of Level >2 diagnostic studies'
        },
        level2B: {
          level: '2B',
          therapy: 'Individual cohort study (including low quality RCT)',
          prognosis: 'Retrospective cohort study or follow-up of untreated controls',
          diagnosis: 'Exploratory cohort study with good reference standards'
        }
      }
    },
    clinicalApplication: {
      significance: {
        title: 'Clinical Significance',
        description: 'Levels of evidence help target your search at the type of evidence most likely to provide a reliable answer. Designed as a shortcut for busy clinicians, researchers, and patients to find the likely best evidence.'
      },
      abbreviations: {
        title: 'Key Abbreviations',
        items: {
          sr: 'SR: Systematic Review',
          rct: 'RCT: Randomised Controlled Trial',
          cdr: 'CDR: Clinical Decision Rule',
          ci: 'CI: Confidence Interval',
          sppin: 'SpPin: Specific test rules in',
          snnout: 'SnNout: Sensitive test rules out',
          cebm: 'CEBM: Centre for Evidence-based Medicine'
        }
      },
      usage: {
        title: 'Clinical Application',
        quote: '"What are we to do when the irresistible force of the need to offer clinical advice meets the immovable object of flawed evidence? All we can do is our best: give the advice, but alert the advisees to the flaws in the evidence on which it is based."',
        attribution: '— Adapted from Sackett, Straus and Richardson (2000)'
      }
    }
  },
  specialties: {
    cardiology: 'Cardiology',
    obgyn: 'Obstetrics and Gynecology',
  },
  indexPage: {
    hero: {
      title: 'Disease Guidelines & Pathways',
      subtitle: 'Comprehensive medical guidelines and clinical pathways for evidence-based practice',
      knowledgeBase: 'Medical Knowledge Base'
    },
    search: {
      placeholder: 'Search diseases, symptoms, treatments, or guidelines...'
    },
    filters: {
      allCategories: 'All Categories',
      cardiomyopathy: 'Cardiomyopathy',
      electrophysiology: 'Electrophysiology',
      heartFailure: 'Heart Failure',
      valvular: 'Valvular Disease',
      emergency: 'Emergency',
      electrolyte: 'Electrolyte Disorders'
    },
    sort: {
      title: 'Title A-Z',
      severity: 'Severity',
      readTime: 'Read Time',
      updated: 'Last Updated'
    },
    results: {
      found_one: '{{count}} Disease Found',
      found_other: '{{count}} Diseases Found',
      clearSearch: 'Clear search'
    },
    empty: {
      title: 'No diseases found',
      message: 'Try adjusting your search terms or filters to find the medical guidelines you\'re looking for.',
      button: 'View All Diseases'
    },
    card: {
      more_one: '+{{count}} more',
      more_other: '+{{count}} more'
    },
    severityLabels: {
      critical: 'Critical',
      moderate: 'Moderate',
      stable: 'Stable',
      unknown: 'Unknown'
    }
  },
  registry: {
    'evidence-based-medicine-guide': {
      title: 'Evidence-Based Medicine Guide',
      category: 'Reference',
      description: 'Comprehensive guide to levels of evidence and grades of recommendation for evidence-based clinical practice.',
      tags: ['Evidence', 'Guidelines', 'Research', 'Clinical Practice'],
      readTime: '15 min',
      lastUpdated: 'July 21, 2025'
    },
    'hypertrophic-cardiomyopathy': {
      title: 'Hypertrophic Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'A genetic disorder characterized by left ventricular hypertrophy and preserved ejection fraction. Associated with sudden cardiac death risk.',
      tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Family Screening'],
      readTime: '25 min',
      lastUpdated: 'May 31, 2025',
      prevalence: '200 per 100,000'
    },
    'atrial-fibrillation': {
      title: 'Atrial Fibrillation',
      category: 'Electrophysiology',
      description: 'The most common sustained cardiac arrhythmia. Increases stroke risk 5-fold and requires comprehensive management.',
      tags: ['Arrhythmia', 'Stroke Prevention', 'Anticoagulation', 'Rate Control'],
      readTime: '20 min',
      lastUpdated: 'June 19, 2025',
      prevalence: '700-775 per 100,000'
    },
    'heart-failure': {
      title: 'Heart Failure',
      category: 'Heart Failure',
      description: 'A clinical syndrome resulting from structural or functional cardiac abnormalities that impair ventricular function.',
      tags: ['Heart Failure', 'HFrEF', 'HFpEF', 'Medical Management'],
      readTime: '30 min',
      lastUpdated: 'May 31, 2025',
      prevalence: '1,000 per 100,000'
    },
    'aortic-stenosis': {
      title: 'Aortic Stenosis',
      category: 'Valvular Heart Disease',
      description: 'A chronic fibrocalcific disease resulting in aortic valve narrowing. Severe AS has 3-year survival without intervention.',
      tags: ['Valvular Disease', 'TAVR', 'SAVR', 'Stenosis'],
      readTime: '30 min',
      lastUpdated: 'June 13, 2025',
      prevalence: '400 per 100,000'
    },
    'cardiac-arrest': {
      title: 'Cardiac Arrest',
      category: 'Emergency Cardiology',
      description: 'Sudden cessation of cardiac activity with hemodynamic collapse. Requires immediate CPR and advanced life support.',
      tags: ['Emergency', 'CPR', 'ACLS', 'Resuscitation'],
      readTime: '35 min',
      prevalence: '350 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'chest-pain': {
      title: 'Chest Pain',
      category: 'Emergency Cardiology',
      description: 'A common presenting symptom requiring systematic evaluation to rule out acute coronary syndromes.',
      tags: ['Emergency', 'ACS', 'Diagnosis', 'Risk Stratification'],
      readTime: '25 min',
      prevalence: 'Common presentation',
      lastUpdated: 'May 31, 2025'
    },
    'hyperkalemia': {
      title: 'Hyperkalemia',
      category: 'Electrolyte Disorders',
      description: 'Elevated serum potassium levels that can cause life-threatening cardiac arrhythmias.',
      tags: ['Electrolytes', 'Arrhythmia', 'Emergency', 'Dialysis'],
      readTime: '20 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'hypokalemia': {
      title: 'Hypokalemia',
      category: 'Electrolyte Disorders',
      description: 'Low serum potassium levels that can cause muscle weakness and cardiac arrhythmias.',
      tags: ['Electrolytes', 'Arrhythmia', 'Muscle Weakness'],
      readTime: '15 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'hypernatremia': {
      title: 'Hypernatremia',
      category: 'Electrolyte Disorders',
      description: 'Elevated serum sodium levels often associated with dehydration and neurological complications.',
      tags: ['Electrolytes', 'Dehydration', 'Neurological'],
      readTime: '12 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'hyponatremia': {
      title: 'Hyponatremia',
      category: 'Electrolyte Disorders',
      description: 'Low serum sodium levels that can cause cerebral edema and neurological complications.',
      tags: ['Electrolytes', 'Cerebral Edema', 'Neurological'],
      readTime: '18 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'abdominal-aortic-aneurysm': {
      title: 'Abdominal Aortic Aneurysm',
      category: 'Vascular Disease',
      description: 'Localized dilation of the abdominal aorta with risk of rupture. Screening and surgical management guidelines.',
      tags: ['Vascular', 'Aneurysm', 'Surgery', 'Screening'],
      readTime: '45 min',
      prevalence: '200 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'aortic-intramural-hematoma': {
      title: 'Aortic Intramural Hematoma',
      category: 'Aortic Disease',
      description: 'Hemorrhage within the aortic wall without intimal tear. Variant of acute aortic syndrome.',
      tags: ['Aortic', 'Emergency', 'Imaging', 'Surgery'],
      readTime: '18 min',
      prevalence: 'Rare',
      lastUpdated: 'May 31, 2025'
    },
    'aortic-regurgitation': {
      title: 'Aortic Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Diastolic filling of the left ventricle due to incompetent aortic valve. Can be acute or chronic.',
      tags: ['Valvular Disease', 'Regurgitation', 'Surgery', 'Echo'],
      readTime: '20 min',
      prevalence: '300 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'antidromic-atrioventricular-reentrant-tachycardia': {
      title: 'Antidromic AVRT',
      category: 'Electrophysiology',
      description: 'Wide complex tachycardia using accessory pathway for antegrade conduction.',
      tags: ['Arrhythmia', 'WPW', 'Electrophysiology', 'Ablation'],
      readTime: '10 min',
      prevalence: 'Rare',
      lastUpdated: 'May 31, 2025'
    },
    'arrhythmogenic-right-ventricular-cardiomyopathy': {
      title: 'ARVC',
      category: 'Cardiomyopathy',
      description: 'Genetic cardiomyopathy with fibrofatty replacement of RV myocardium. High sudden death risk.',
      tags: ['Cardiomyopathy', 'Genetic', 'Sudden Death', 'Arrhythmia'],
      readTime: '25 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'aspirin-overdose': {
      title: 'Aspirin Overdose',
      category: 'Toxicology',
      description: 'Salicylate poisoning causing metabolic acidosis and altered mental status.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Metabolic'],
      readTime: '15 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'atrial-flutter': {
      title: 'Atrial Flutter',
      category: 'Electrophysiology',
      description: 'Organized atrial tachycardia with characteristic sawtooth pattern. Often amenable to ablation.',
      tags: ['Arrhythmia', 'Ablation', 'Anticoagulation', 'Cardioversion'],
      readTime: '20 min',
      prevalence: '200 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'atrioventricular-nodal-reentrant-tachycardia': {
      title: 'AVNRT',
      category: 'Electrophysiology',
      description: 'Most common paroxysmal supraventricular tachycardia. Uses dual AV nodal pathways.',
      tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation'],
      readTime: '12 min',
      prevalence: '300 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'beta-blocker-toxicity': {
      title: 'Beta-Blocker Toxicity',
      category: 'Toxicology',
      description: 'Overdose causing bradycardia, hypotension, and altered mental status.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Bradycardia'],
      readTime: '12 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'bicuspid-aortic-valve': {
      title: 'Bicuspid Aortic Valve',
      category: 'Congenital Heart Disease',
      description: 'Most common congenital heart defect. Associated with aortic stenosis and regurgitation.',
      tags: ['Congenital', 'Valvular Disease', 'Screening', 'Surgery'],
      readTime: '18 min',
      prevalence: '1,000 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'blood-gas-analysis': {
      title: 'Blood Gas Analysis',
      category: 'Diagnostics',
      description: 'Systematic approach to arterial blood gas interpretation in cardiac patients.',
      tags: ['Diagnostics', 'ABG', 'Acid-Base', 'Interpretation'],
      readTime: '8 min',
      prevalence: 'Diagnostic tool',
      lastUpdated: 'May 31, 2025'
    },
    'blunt-cardiac-injury': {
      title: 'Blunt Cardiac Injury',
      category: 'Trauma',
      description: 'Cardiac trauma from blunt chest injury. Spectrum from contusion to rupture.',
      tags: ['Trauma', 'Emergency', 'Injury', 'Surgery'],
      readTime: '12 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'brugada-syndrome': {
      title: 'Brugada Syndrome',
      category: 'Electrophysiology',
      description: 'Genetic disorder with characteristic ECG pattern and sudden cardiac death risk.',
      tags: ['Genetic', 'Sudden Death', 'ICD', 'Electrophysiology'],
      readTime: '16 min',
      prevalence: '50 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'calcium-channel-blocker-toxicity': {
      title: 'CCB Toxicity',
      category: 'Toxicology',
      description: 'Overdose causing bradycardia, hypotension, and metabolic acidosis.',
      tags: ['Toxicology', 'Emergency', 'Overdose', 'Hypotension'],
      readTime: '10 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'cardiac-amyloidosis': {
      title: 'Cardiac Amyloidosis',
      category: 'Cardiomyopathy',
      description: 'Infiltrative cardiomyopathy with extracellular amyloid protein deposition.',
      tags: ['Cardiomyopathy', 'Infiltrative', 'Heart Failure', 'Diagnosis'],
      readTime: '20 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'cardiogenic-shock': {
      title: 'Cardiogenic Shock',
      category: 'Emergency Cardiology',
      description: 'Severe heart failure with inadequate cardiac output and tissue hypoperfusion.',
      tags: ['Emergency', 'Heart Failure', 'Shock', 'Mechanical Support'],
      readTime: '16 min',
      prevalence: '50 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'cardiotoxicity-of-cancer-therapy': {
      title: 'Cardiotoxicity of Cancer Therapy',
      category: 'Cardio-Oncology',
      description: 'Cardiac complications from chemotherapy, radiation, and targeted cancer therapies.',
      tags: ['Cardio-Oncology', 'Chemotherapy', 'Heart Failure', 'Monitoring'],
      readTime: '40 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'chagas-cardiomyopathy': {
      title: 'Chagas Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'Chronic cardiac manifestation of Chagas disease caused by Trypanosoma cruzi.',
      tags: ['Cardiomyopathy', 'Infectious', 'Chagas', 'Heart Failure'],
      readTime: '12 min',
      prevalence: 'Endemic areas',
      lastUpdated: 'May 31, 2025'
    },
    'chronic-thromboembolic-pulmonary-hypertension': {
      title: 'CTEPH',
      category: 'Pulmonary Hypertension',
      description: 'Pulmonary hypertension from chronic thromboembolic obstruction. Potentially curable.',
      tags: ['Pulmonary Hypertension', 'Thromboembolism', 'Surgery', 'PEA'],
      readTime: '25 min',
      prevalence: '50 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'coarctation-of-aorta': {
      title: 'Coarctation of Aorta',
      category: 'Congenital Heart Disease',
      description: 'Congenital narrowing of the aorta causing upper extremity hypertension.',
      tags: ['Congenital', 'Hypertension', 'Surgery', 'Intervention'],
      readTime: '18 min',
      prevalence: '40 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'digoxin-toxicity': {
      title: 'Digoxin Toxicity',
      category: 'Toxicology',
      description: 'Overdose of cardiac glycoside causing arrhythmias and GI symptoms.',
      tags: ['Toxicology', 'Arrhythmia', 'Emergency', 'Antidote'],
      readTime: '10 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'disseminated-intravascular-coagulation': {
      title: 'DIC',
      category: 'Hematology',
      description: 'Systemic coagulation disorder with bleeding and thrombosis.',
      tags: ['Hematology', 'Coagulation', 'Emergency', 'Bleeding'],
      readTime: '15 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'focal-atrial-tachycardia': {
      title: 'Focal Atrial Tachycardia',
      category: 'Electrophysiology',
      description: 'Atrial tachycardia from abnormal automaticity or triggered activity.',
      tags: ['Arrhythmia', 'Electrophysiology', 'Ablation', 'Tachycardia'],
      readTime: '10 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'heparin-induced-thrombocytopenia': {
      title: 'Heparin-Induced Thrombocytopenia (HIT)',
      category: 'Hematology',
      description: 'Immune-mediated thrombocytopenia with paradoxical thrombosis risk from heparin exposure.',
      tags: ['Hematology', 'Thrombocytopenia', 'Thrombosis', 'Anticoagulation', 'Heparin', 'HIT'],
      readTime: '25 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'dilated-cardiomyopathy': {
      title: 'Dilated Cardiomyopathy',
      category: 'Cardiomyopathy',
      description: 'Cardiomyopathy characterized by ventricular chamber enlargement and systolic dysfunction.',
      tags: ['Cardiomyopathy', 'Heart Failure', 'Genetic', 'Transplant'],
      readTime: '35 min',
      prevalence: '200 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'dyslipidemia': {
      title: 'Dyslipidemia',
      category: 'Preventive Cardiology',
      description: 'Abnormal lipid levels associated with increased cardiovascular risk.',
      tags: ['Lipids', 'Prevention', 'Statin', 'ASCVD Risk'],
      readTime: '45 min',
      prevalence: '2,000 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'hypertension': {
      title: 'Hypertension',
      category: 'Hypertension',
      description: 'Elevated blood pressure, major risk factor for cardiovascular disease.',
      tags: ['Hypertension', 'Blood Pressure', 'Prevention', 'Medication'],
      readTime: '60 min',
      prevalence: '4,500 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'hypertension-in-pregnancy': {
      title: 'Hypertension in Pregnancy',
      category: 'Maternal Cardiology',
      description: 'Hypertensive disorders complicating pregnancy including preeclampsia.',
      tags: ['Pregnancy', 'Hypertension', 'Preeclampsia', 'Maternal'],
      readTime: '30 min',
      prevalence: '800 per 100,000 pregnancies',
      lastUpdated: 'May 31, 2025'
    },
    'hypoplastic-left-heart-syndrome': {
      title: 'Hypoplastic Left Heart Syndrome',
      category: 'Congenital Heart Disease',
      description: 'Complex congenital heart defect with underdeveloped left heart structures.',
      tags: ['Congenital', 'Surgery', 'Pediatric', 'Complex'],
      readTime: '15 min',
      prevalence: '2 per 100,000 births',
      lastUpdated: 'May 31, 2025'
    },
    'infective-endocarditis': {
      title: 'Infective Endocarditis',
      category: 'Infectious Disease',
      description: 'Infection of the endocardium, particularly heart valves, with high morbidity.',
      tags: ['Infection', 'Valvular Disease', 'Surgery', 'Antibiotics'],
      readTime: '40 min',
      prevalence: '15 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'long-qt-syndrome': {
      title: 'Long QT Syndrome',
      category: 'Electrophysiology',
      description: 'Genetic or acquired condition with prolonged QT interval and sudden death risk.',
      tags: ['Genetic', 'QT Prolongation', 'Sudden Death', 'Arrhythmia'],
      readTime: '20 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'metabolic-acidosis': {
      title: 'Metabolic Acidosis',
      category: 'Electrolyte Disorders',
      description: 'Primary decrease in serum bicarbonate with cardiac implications.',
      tags: ['Electrolytes', 'Acid-Base', 'Emergency', 'Metabolism'],
      readTime: '12 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'mitral-regurgitation': {
      title: 'Mitral Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Backflow of blood from left ventricle to left atrium due to mitral valve dysfunction.',
      tags: ['Valvular Disease', 'Surgery', 'Echo', 'Repair'],
      readTime: '25 min',
      prevalence: '500 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'myocarditis': {
      title: 'Myocarditis',
      category: 'Inflammatory Heart Disease',
      description: 'Inflammation of the myocardium often caused by viral infections or autoimmune conditions.',
      tags: ['Inflammation', 'Viral', 'Heart Failure', 'Biopsy'],
      readTime: '30 min',
      prevalence: '50 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'non-st-elevation-myocardial-infarction': {
      title: 'NSTEMI',
      category: 'Acute Coronary Syndrome',
      description: 'Non-ST elevation myocardial infarction requiring urgent intervention.',
      tags: ['ACS', 'NSTEMI', 'Troponin', 'Catheterization'],
      readTime: '50 min',
      prevalence: '200 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'perioperative-cardiac-risk-management': {
      title: 'Perioperative Cardiac Risk Management',
      category: 'Perioperative Care',
      description: 'Assessment and management of cardiac risk in non-cardiac surgery.',
      tags: ['Surgery', 'Risk Assessment', 'Perioperative', 'Guidelines'],
      readTime: '40 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'periprocedural-management-antithrombotic-therapy': {
      title: 'Periprocedural Antithrombotic Management',
      category: 'Anticoagulation',
      description: 'Management of anticoagulant and antiplatelet therapy around procedures.',
      tags: ['Anticoagulation', 'Procedure', 'Bleeding Risk', 'Bridging'],
      readTime: '25 min',
      prevalence: 'Variable',
      lastUpdated: 'May 31, 2025'
    },
    'pleural-effusion': {
      title: 'Pleural Effusion',
      category: 'Pulmonary',
      description: 'Accumulation of fluid in the pleural space with cardiac causes.',
      tags: ['Pleural', 'Heart Failure', 'Drainage', 'Diagnosis'],
      readTime: '20 min',
      prevalence: '300 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'postural-orthostatic-tachycardia-syndrome': {
      title: 'POTS',
      category: 'Autonomic Disorders',
      description: 'Disorder of autonomic function causing orthostatic tachycardia.',
      tags: ['Autonomic', 'Tachycardia', 'Syncope', 'Orthostatic'],
      readTime: '15 min',
      prevalence: '170 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'prosthetic-heart-valves': {
      title: 'Prosthetic Heart Valves',
      category: 'Valvular Heart Disease',
      description: 'Comprehensive guidelines for evaluation and management of prosthetic heart valves, including anticoagulation, antiplatelet therapy, thrombosis management, infective endocarditis protocols, and perioperative care.',
      tags: ['Valvular Disease', 'Prosthetic', 'Anticoagulation', 'Surgery', 'Endocarditis', 'Thrombosis'],
      readTime: '45 min',
      prevalence: '50 per 100,000',
      lastUpdated: 'January 20, 2025'
    },
    'pulmonary-embolism': {
      title: 'Pulmonary Embolism',
      category: 'Thromboembolism',
      description: 'Blockage of pulmonary arteries by blood clots with high mortality risk.',
      tags: ['PE', 'Anticoagulation', 'Emergency', 'Thrombolysis'],
      readTime: '40 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'pulmonary-hypertension': {
      title: 'Pulmonary Hypertension',
      category: 'Pulmonary Hypertension',
      description: 'Elevated pressure in pulmonary arteries with multiple etiologies.',
      tags: ['Pulmonary Hypertension', 'Right Heart', 'Vasodilators', 'Transplant'],
      readTime: '45 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'st-elevation-myocardial-infarction': {
      title: 'STEMI',
      category: 'Acute Coronary Syndrome',
      description: 'ST-elevation myocardial infarction requiring emergency reperfusion therapy.',
      tags: ['ACS', 'STEMI', 'Primary PCI', 'Thrombolysis'],
      readTime: '50 min',
      prevalence: '150 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'statin-induced-myopathy': {
      title: 'Statin-Induced Myopathy',
      category: 'Drug Toxicity',
      description: 'Muscle-related side effects from statin therapy including myalgia and rhabdomyolysis.',
      tags: ['Statin', 'Myopathy', 'Drug Toxicity', 'Rhabdomyolysis'],
      readTime: '15 min',
      prevalence: '100 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'subclavian-and-brachiocephalic-artery-stenosis': {
      title: 'Subclavian Artery Stenosis',
      category: 'Vascular Disease',
      description: 'Narrowing of subclavian or brachiocephalic arteries causing arm claudication.',
      tags: ['Vascular', 'Stenosis', 'Intervention', 'Surgery'],
      readTime: '12 min',
      prevalence: '20 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'supraventricular-tachyarrhythmias': {
      title: 'Supraventricular Tachyarrhythmias',
      category: 'Electrophysiology',
      description: 'Rapid heart rhythms originating above the ventricles.',
      tags: ['Arrhythmia', 'SVT', 'Electrophysiology', 'Ablation'],
      readTime: '20 min',
      prevalence: '400 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'syncope': {
      title: 'Syncope',
      category: 'Syncope',
      description: 'Transient loss of consciousness due to cerebral hypoperfusion.',
      tags: ['Syncope', 'Diagnosis', 'Risk Stratification', 'Tilt Table'],
      readTime: '35 min',
      prevalence: '620 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'thoracic-aortic-aneurysm': {
      title: 'Thoracic Aortic Aneurysm',
      category: 'Aortic Disease',
      description: 'Dilation of the thoracic aorta with risk of rupture or dissection.',
      tags: ['Aortic', 'Aneurysm', 'Surgery', 'Screening'],
      readTime: '50 min',
      prevalence: '60 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'thoracic-aortic-dissection': {
      title: 'Thoracic Aortic Dissection',
      category: 'Aortic Disease',
      description: 'Tear in the aortic intima causing false lumen formation.',
      tags: ['Aortic', 'Dissection', 'Emergency', 'Surgery'],
      readTime: '35 min',
      prevalence: '30 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'tobacco-use': {
      title: 'Tobacco Use and Cardiovascular Disease',
      category: 'Prevention',
      description: 'Impact of tobacco use on cardiovascular health and cessation strategies.',
      tags: ['Tobacco', 'Prevention', 'Cessation', 'Risk Factor'],
      readTime: '25 min',
      prevalence: '1,400 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'transient-ischemic-attack': {
      title: 'Transient Ischemic Attack (TIA)',
      category: 'Cerebrovascular Disease',
      description: 'Temporary neurological deficits due to focal brain ischemia.',
      tags: ['TIA', 'Stroke', 'Prevention', 'Anticoagulation'],
      readTime: '40 min',
      prevalence: '240 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'traumatic-thoracic-aortic-injury': {
      title: 'Traumatic Thoracic Aortic Injury',
      category: 'Trauma',
      description: 'Aortic injury from blunt chest trauma requiring emergency intervention.',
      tags: ['Trauma', 'Aortic', 'Emergency', 'Surgery'],
      readTime: '20 min',
      prevalence: 'Trauma-related',
      lastUpdated: 'May 31, 2025'
    },
    'tricuspid-regurgitation': {
      title: 'Tricuspid Regurgitation',
      category: 'Valvular Heart Disease',
      description: 'Backflow through the tricuspid valve often secondary to left heart disease.',
      tags: ['Valvular Disease', 'Right Heart', 'Surgery', 'Echo'],
      readTime: '15 min',
      prevalence: '400 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'ventricular-arrhythmias': {
      title: 'Ventricular Arrhythmias',
      category: 'Electrophysiology',
      description: 'Life-threatening arrhythmias originating from the ventricles.',
      tags: ['Arrhythmia', 'VT', 'VF', 'ICD', 'Sudden Death'],
      readTime: '45 min',
      prevalence: '200 per 100,000',
      lastUpdated: 'May 31, 2025'
    },
    'wolff-parkinson-white-syndrome': {
      title: 'Wolff-Parkinson-White Syndrome',
      category: 'Electrophysiology',
      description: 'Pre-excitation syndrome with accessory pathway and arrhythmia risk.',
      tags: ['Pre-excitation', 'WPW', 'Ablation', 'Sudden Death'],
      readTime: '12 min',
      prevalence: '150 per 100,000',
      lastUpdated: 'May 31, 2025'
    }
  }
};

export default diseases;
