/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { 
  MedicalClassifier, 
  EvidenceLevel, 
  MedicalSpecialty, 
  ContentType,
  type ClassificationResult 
} from '../../utils/search/medicalClassification'
import { medicalValidationHelpers } from '../utils'

describe('MedicalClassifier', () => {
  describe('Evidence Level Classification', () => {
    describe('Systematic Reviews and Meta-analyses', () => {
      it('should classify systematic reviews with high confidence', () => {
        const testCases = [
          {
            title: 'Systematic review of cardiovascular outcomes with statins',
            snippet: 'This systematic review analyzes 50 randomized controlled trials',
            source: 'cochrane.org'
          },
          {
            title: 'Meta-analysis of antihypertensive drugs in elderly patients',
            snippet: 'A comprehensive meta-analysis including systematic literature review',
            source: 'nejm.org'
          },
          {
            title: 'Cochrane systematic review: Blood pressure management',
            snippet: 'Systematic review and meta-analysis of RCTs',
            source: 'cochranelibrary.com'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.SYSTEMATIC_REVIEW)
          expect(result.confidence).toBeGreaterThan(0.9)
        })
      })
    })

    describe('Randomized Controlled Trials', () => {
      it('should classify RCTs with high confidence', () => {
        const testCases = [
          {
            title: 'Randomized controlled trial of aspirin for primary prevention',
            snippet: 'Double-blind placebo-controlled randomized trial',
            source: 'nejm.org'
          },
          {
            title: 'Clinical trial results: New diabetes medication',
            snippet: 'Multicenter randomized trial with 10,000 patients',
            source: 'jamanetwork.com'
          },
          {
            title: 'RCT: Effectiveness of telemedicine interventions',
            snippet: 'Randomized controlled trial comparing telemedicine vs usual care',
            source: 'thelancet.com'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL)
          expect(result.confidence).toBeGreaterThan(0.85)
        })
      })
    })

    describe('Clinical Guidelines', () => {
      it('should classify guidelines with appropriate confidence', () => {
        const testCases = [
          {
            title: 'AHA/ACC Guidelines for Cardiovascular Disease Prevention',
            snippet: 'Clinical practice guidelines and recommendations',
            source: 'acc.org'
          },
          {
            title: 'ACOG Practice Bulletin: Gestational Diabetes',
            snippet: 'Consensus statement and practice parameter recommendations',
            source: 'acog.org'
          },
          {
            title: 'ESC Guideline on heart failure management',
            snippet: 'European Society of Cardiology clinical guidelines',
            source: 'escardio.org'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.GUIDELINE)
          expect(result.confidence).toBeGreaterThan(0.8)
        })
      })
    })

    describe('Observational Studies', () => {
      it('should classify cohort studies correctly', () => {
        const testCases = [
          {
            title: 'Prospective cohort study of dietary patterns and cardiovascular risk',
            snippet: 'Longitudinal follow-up study over 20 years',
            source: 'nejm.org'
          },
          {
            title: 'Nurses Health Study: Long-term cardiovascular outcomes',
            snippet: 'Prospective cohort study with 25-year follow-up',
            source: 'jamanetwork.com'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.COHORT_STUDY)
          expect(result.confidence).toBeGreaterThan(0.75)
        })
      })

      it('should classify case-control studies correctly', () => {
        const testCases = [
          {
            title: 'Case-control study of myocardial infarction risk factors',
            snippet: 'Retrospective case control analysis',
            source: 'ahajournals.org'
          },
          {
            title: 'Case control study: Oral contraceptives and stroke risk',
            snippet: 'Retrospective study comparing cases and controls',
            source: 'bmj.com'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.CASE_CONTROL_STUDY)
          expect(result.confidence).toBeGreaterThan(0.7)
        })
      })
    })

    describe('Case Reports and Series', () => {
      it('should classify case reports with moderate confidence', () => {
        const testCases = [
          {
            title: 'Case report: Rare cardiac complication after surgery',
            snippet: 'We report a case of unusual cardiac complication',
            source: 'cardiacjournal.com'
          },
          {
            title: 'Case series of 15 patients with unusual presentation',
            snippet: 'Case series describing clinical presentation and outcomes',
            source: 'medicaljournal.org'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.CASE_SERIES)
          expect(result.confidence).toBeGreaterThan(0.65)
        })
      })
    })

    describe('Review Articles', () => {
      it('should classify review articles appropriately', () => {
        const testCases = [
          {
            title: 'Review of current hypertension management strategies',
            snippet: 'Comprehensive literature review of treatment options',
            source: 'hypertensionjournal.org'
          },
          {
            title: 'Narrative review: Advances in cardiac surgery',
            snippet: 'Overview of recent developments in surgical techniques',
            source: 'surgerjournal.com'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.determineEvidenceLevel(
            testCase.title, 
            testCase.snippet, 
            testCase.source
          )
          
          expect(result.level).toBe(EvidenceLevel.REVIEW_ARTICLE)
          expect(result.confidence).toBeGreaterThan(0.55)
        })
      })
    })

    describe('Authoritative Sources', () => {
      it('should recognize authoritative medical sources', () => {
        const authoritativeSources = [
          'nejm.org',
          'jamanetwork.com', 
          'thelancet.com',
          'bmj.com',
          'ahajournals.org',
          'acc.org',
          'acog.org',
          'cdc.gov',
          'nih.gov',
          'who.int'
        ]

        authoritativeSources.forEach(source => {
          const result = MedicalClassifier.determineEvidenceLevel(
            'Expert commentary on medical practice',
            'Expert opinion from leading specialists',
            source
          )
          
          expect(result.confidence).toBeGreaterThan(0.45)
        })
      })
    })
  })

  describe('Medical Specialty Classification', () => {
    describe('Cardiology', () => {
      it('should identify cardiology content with high confidence', () => {
        const testCases = [
          {
            title: 'Myocardial infarction management in emergency department',
            snippet: 'Acute coronary syndrome treatment protocols with PCI and stent placement'
          },
          {
            title: 'Atrial fibrillation anticoagulation guidelines',
            snippet: 'Heart rhythm disorders and stroke prevention with warfarin and NOACs'
          },
          {
            title: 'Echocardiographic assessment of left ventricular function',
            snippet: 'Cardiac imaging for heart failure evaluation and valve assessment'
          },
          {
            title: 'CABG vs PCI for coronary artery disease',
            snippet: 'Comparison of bypass surgery and angioplasty for CAD treatment'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.identifySpecialties(
            testCase.title, 
            testCase.snippet
          )
          
          expect(result.specialties).toContain(MedicalSpecialty.CARDIOLOGY)
          expect(result.confidence).toBeGreaterThan(0.8)
        })
      })

      it('should recognize cardiac-specific terminology', () => {
        const cardiacTerms = [
          'STEMI', 'NSTEMI', 'ACS', 'CHF', 'EKG', 'ECG', 'echo',
          'angiogram', 'catheterization', 'arrhythmia', 'bradycardia',
          'tachycardia', 'fibrillation', 'flutter', 'block'
        ]

        cardiacTerms.forEach(term => {
          const result = MedicalClassifier.identifySpecialties(
            `Clinical study of ${term} in patients`,
            `Research examining ${term} outcomes and management strategies`
          )
          
          expect(result.specialties).toContain(MedicalSpecialty.CARDIOLOGY)
        })
      })
    })

    describe('Obstetrics and Gynecology', () => {
      it('should identify OB/GYN content with high confidence', () => {
        const testCases = [
          {
            title: 'Preeclampsia screening in high-risk pregnancies',
            snippet: 'Maternal and fetal outcomes in gestational hypertension management'
          },
          {
            title: 'Cervical cancer screening with HPV testing',
            snippet: 'Gynecologic oncology prevention with Pap smear and HPV vaccination'
          },
          {
            title: 'Labor and delivery complications management',
            snippet: 'Obstetric care during cesarean section and vaginal delivery'
          },
          {
            title: 'Endometrial cancer risk factors and prevention',
            snippet: 'Uterine malignancy screening in postmenopausal women'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.identifySpecialties(
            testCase.title, 
            testCase.snippet
          )
          
          expect(result.specialties).toContain(MedicalSpecialty.OBSTETRICS_GYNECOLOGY)
          expect(result.confidence).toBeGreaterThan(0.8)
        })
      })

      it('should recognize OB/GYN-specific terminology', () => {
        const obgynTerms = [
          'gravida', 'para', 'nulliparous', 'multiparous', 'primigravida',
          'antepartum', 'postpartum', 'puerperium', 'lochia', 'episiotomy',
          'amniocentesis', 'chorionic villus', 'nuchal translucency'
        ]

        obgynTerms.forEach(term => {
          const result = MedicalClassifier.identifySpecialties(
            `Clinical assessment of ${term}`,
            `Medical evaluation including ${term} considerations`
          )
          
          expect(result.specialties).toContain(MedicalSpecialty.OBSTETRICS_GYNECOLOGY)
        })
      })
    })

    describe('Emergency Medicine', () => {
      it('should identify emergency medicine content', () => {
        const testCases = [
          {
            title: 'Trauma resuscitation protocols in emergency department',
            snippet: 'Critical care management of shock and acute injuries'
          },
          {
            title: 'Sepsis recognition and treatment in ED',
            snippet: 'Emergency management of severe infection and organ failure'
          },
          {
            title: 'Triage algorithms for chest pain patients',
            snippet: 'Emergency department evaluation of acute cardiac symptoms'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.identifySpecialties(
            testCase.title, 
            testCase.snippet
          )
          
          expect(result.specialties).toContain(MedicalSpecialty.EMERGENCY_MEDICINE)
          expect(result.confidence).toBeGreaterThan(0.8)
        })
      })
    })

    describe('Multiple Specialties', () => {
      it('should identify multiple relevant specialties', () => {
        const result = MedicalClassifier.identifySpecialties(
          'Emergency cesarean section for acute fetal distress',
          'Critical obstetric emergency requiring immediate surgical intervention'
        )
        
        expect(result.specialties).toContain(MedicalSpecialty.OBSTETRICS_GYNECOLOGY)
        expect(result.specialties).toContain(MedicalSpecialty.EMERGENCY_MEDICINE)
        expect(result.specialties.length).toBeGreaterThan(1)
      })

      it('should calculate appropriate confidence for multiple specialties', () => {
        const result = MedicalClassifier.identifySpecialties(
          'Cardiac arrest in pregnant patient emergency management',
          'Resuscitation protocols for maternal cardiac emergencies in labor'
        )
        
        expect(result.specialties.length).toBeGreaterThan(1)
        expect(result.confidence).toBeGreaterThan(0.7)
      })
    })

    describe('Default Classification', () => {
      it('should default to internal medicine for general medical content', () => {
        const result = MedicalClassifier.identifySpecialties(
          'General medical practice guidelines',
          'Healthcare delivery and patient management strategies'
        )
        
        expect(result.specialties).toContain(MedicalSpecialty.INTERNAL_MEDICINE)
        expect(result.confidence).toBeLessThan(0.5)
      })
    })
  })

  describe('Content Type Classification', () => {
    describe('Research Papers', () => {
      it('should classify research papers correctly', () => {
        const testCases = [
          {
            title: 'Longitudinal study of cardiovascular outcomes',
            snippet: 'Research investigation analyzing patient data over 10 years',
            source: 'pubmed.ncbi.nlm.nih.gov',
            url: 'https://pubmed.ncbi.nlm.nih.gov/12345'
          },
          {
            title: 'Analysis of treatment effectiveness in diabetes',
            snippet: 'Clinical trial studying medication efficacy',
            source: 'Journal of Medical Research',
            url: 'https://journal.com/article'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.classifyContentType(
            testCase.title,
            testCase.snippet,
            testCase.source,
            testCase.url
          )
          
          expect(result.type).toBe(ContentType.RESEARCH_PAPER)
          expect(result.confidence).toBeGreaterThan(0.85)
        })
      })
    })

    describe('Clinical Guidelines', () => {
      it('should classify guidelines with high confidence', () => {
        const testCases = [
          {
            title: 'Clinical practice guidelines for hypertension',
            snippet: 'Evidence-based recommendations for blood pressure management',
            source: 'guidelines.org',
            url: 'https://guidelines.org/hypertension'
          },
          {
            title: 'Consensus statement on diabetes care',
            snippet: 'Professional society recommendations and practice parameters',
            source: 'diabetes.org',
            url: 'https://diabetes.org/guidelines'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.classifyContentType(
            testCase.title,
            testCase.snippet,
            testCase.source,
            testCase.url
          )
          
          expect(result.type).toBe(ContentType.CLINICAL_GUIDELINE)
          expect(result.confidence).toBeGreaterThan(0.9)
        })
      })
    })

    describe('Medical Calculators', () => {
      it('should identify calculator content', () => {
        const testCases = [
          {
            title: 'Framingham Risk Score Calculator',
            snippet: 'Risk assessment tool for cardiovascular disease prediction',
            source: 'cardiology.org',
            url: 'https://cardiology.org/calculator/framingham'
          },
          {
            title: 'Bishop Score for cervical ripening',
            snippet: 'Clinical scoring index for labor induction assessment',
            source: 'obgyn.org',
            url: 'https://obgyn.org/bishop-score'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.classifyContentType(
            testCase.title,
            testCase.snippet,
            testCase.source,
            testCase.url
          )
          
          expect(result.type).toBe(ContentType.CALCULATOR)
          expect(result.confidence).toBeGreaterThan(0.85)
        })
      })
    })

    describe('Drug Information', () => {
      it('should classify pharmaceutical content', () => {
        const testCases = [
          {
            title: 'Atorvastatin dosing guidelines',
            snippet: 'Medication information for lipid management',
            source: 'pharmacy.org',
            url: 'https://pharmacy.org/atorvastatin'
          },
          {
            title: 'Pharmacology of ACE inhibitors',
            snippet: 'Drug mechanisms and therapeutic applications',
            source: 'pharmacology.com',
            url: 'https://pharmacology.com/ace-inhibitors'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.classifyContentType(
            testCase.title,
            testCase.snippet,
            testCase.source,
            testCase.url
          )
          
          expect(result.type).toBe(ContentType.DRUG_INFORMATION)
          expect(result.confidence).toBeGreaterThan(0.75)
        })
      })
    })

    describe('Educational Material', () => {
      it('should classify educational content', () => {
        const testCases = [
          {
            title: 'Medical education tutorial on ECG interpretation',
            snippet: 'Learning module for healthcare professionals',
            source: 'medicaleducation.org',
            url: 'https://education.org/ecg-tutorial'
          },
          {
            title: 'Overview of cardiac catheterization procedures',
            snippet: 'Educational guide for understanding cardiac procedures',
            source: 'cardiaccare.org',
            url: 'https://cardiaccare.org/overview'
          }
        ]

        testCases.forEach(testCase => {
          const result = MedicalClassifier.classifyContentType(
            testCase.title,
            testCase.snippet,
            testCase.source,
            testCase.url
          )
          
          expect(result.type).toBe(ContentType.EDUCATIONAL_MATERIAL)
          expect(result.confidence).toBeGreaterThan(0.65)
        })
      })
    })
  })

  describe('Complete Classification Integration', () => {
    it('should provide comprehensive classification with reasoning', () => {
      const result = MedicalClassifier.classifyContent(
        'Systematic review of statin therapy for primary prevention of cardiovascular disease',
        'Meta-analysis of randomized controlled trials examining cardiovascular outcomes with lipid-lowering therapy in patients without prior coronary events',
        'cochrane.org',
        'https://cochrane.org/reviews/statins-primary-prevention'
      )

      expect(result.evidenceLevel).toBe(EvidenceLevel.SYSTEMATIC_REVIEW)
      expect(result.specialty).toContain(MedicalSpecialty.CARDIOLOGY)
      expect(result.contentType).toBe(ContentType.RESEARCH_PAPER)
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(result.reasoning).toContain('High-quality evidence')
      expect(result.reasoning).toContain('Authoritative medical source')
    })

    it('should handle complex multi-specialty content', () => {
      const result = MedicalClassifier.classifyContent(
        'Emergency management of peripartum cardiomyopathy',
        'Clinical guidelines for cardiac complications during pregnancy and delivery in the emergency department',
        'acc.org',
        'https://acc.org/guidelines/peripartum-cardiomyopathy'
      )

      expect(result.evidenceLevel).toBe(EvidenceLevel.GUIDELINE)
      expect(result.specialty).toContain(MedicalSpecialty.CARDIOLOGY)
      expect(result.specialty).toContain(MedicalSpecialty.OBSTETRICS_GYNECOLOGY)
      expect(result.specialty).toContain(MedicalSpecialty.EMERGENCY_MEDICINE)
      expect(result.contentType).toBe(ContentType.CLINICAL_GUIDELINE)
      expect(result.confidence).toBeGreaterThan(0.85)
    })

    it('should provide lower confidence for ambiguous content', () => {
      const result = MedicalClassifier.classifyContent(
        'Medical news update',
        'General healthcare information for patients',
        'healthnews.com',
        'https://healthnews.com/general-update'
      )

      expect(result.confidence).toBeLessThan(0.6)
      expect(result.reasoning).toContain('General medical content')
    })
  })

  describe('Medical Relevance Scoring', () => {
    it('should calculate higher relevance for query-matched content', () => {
      const classification: ClassificationResult = {
        evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
        confidence: 0.9,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'High-quality evidence'
      }

      const relevance = MedicalClassifier.calculateMedicalRelevance(
        'hypertension management guidelines',
        'Clinical guidelines for hypertension management in primary care',
        'Evidence-based recommendations for blood pressure control and cardiovascular risk reduction',
        classification
      )

      expect(relevance).toBeGreaterThan(0.8)
    })

    it('should apply evidence level bonuses correctly', () => {
      const systematicReviewClass: ClassificationResult = {
        evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
        confidence: 0.9,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'Systematic review'
      }

      const expertOpinionClass: ClassificationResult = {
        evidenceLevel: EvidenceLevel.EXPERT_OPINION,
        confidence: 0.9,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'Expert opinion'
      }

      const systematicReviewRelevance = MedicalClassifier.calculateMedicalRelevance(
        'cardiac treatment',
        'Cardiac treatment study',
        'Research on cardiac interventions',
        systematicReviewClass
      )

      const expertOpinionRelevance = MedicalClassifier.calculateMedicalRelevance(
        'cardiac treatment',
        'Cardiac treatment study',
        'Research on cardiac interventions',
        expertOpinionClass
      )

      expect(systematicReviewRelevance).toBeGreaterThan(expertOpinionRelevance)
    })

    it('should boost relevance for specialty matches', () => {
      const cardiologyClass: ClassificationResult = {
        evidenceLevel: EvidenceLevel.RESEARCH_PAPER,
        confidence: 0.8,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'Cardiology content'
      }

      const relevanceWithMatch = MedicalClassifier.calculateMedicalRelevance(
        'cardiac surgery outcomes',
        'Surgical outcomes in cardiac patients',
        'Analysis of cardiovascular surgical procedures',
        cardiologyClass
      )

      const relevanceWithoutMatch = MedicalClassifier.calculateMedicalRelevance(
        'general surgery outcomes',
        'Surgical outcomes in cardiac patients',
        'Analysis of cardiovascular surgical procedures',
        cardiologyClass
      )

      expect(relevanceWithMatch).toBeGreaterThan(relevanceWithoutMatch)
    })

    it('should apply confidence penalties appropriately', () => {
      const highConfidenceClass: ClassificationResult = {
        evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
        confidence: 0.9,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'High confidence'
      }

      const lowConfidenceClass: ClassificationResult = {
        evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
        confidence: 0.3,
        specialty: [MedicalSpecialty.CARDIOLOGY],
        contentType: ContentType.RESEARCH_PAPER,
        reasoning: 'Low confidence'
      }

      const highConfidenceRelevance = MedicalClassifier.calculateMedicalRelevance(
        'clinical trial',
        'Clinical trial results',
        'Randomized controlled trial data',
        highConfidenceClass
      )

      const lowConfidenceRelevance = MedicalClassifier.calculateMedicalRelevance(
        'clinical trial',
        'Clinical trial results',
        'Randomized controlled trial data',
        lowConfidenceClass
      )

      expect(highConfidenceRelevance).toBeGreaterThan(lowConfidenceRelevance)
    })
  })

  describe('Medical Validation Integration', () => {
    it('should validate evidence levels using helper functions', () => {
      const validEvidenceLevels = [
        EvidenceLevel.SYSTEMATIC_REVIEW,
        EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
        EvidenceLevel.COHORT_STUDY,
        EvidenceLevel.CASE_CONTROL_STUDY,
        EvidenceLevel.CASE_SERIES,
        EvidenceLevel.EXPERT_OPINION,
        EvidenceLevel.GUIDELINE,
        EvidenceLevel.REVIEW_ARTICLE
      ]

      validEvidenceLevels.forEach(level => {
        expect(medicalValidationHelpers.validateEvidenceLevel(level)).toBe(true)
      })

      expect(medicalValidationHelpers.validateEvidenceLevel('invalid_level')).toBe(false)
    })

    it('should validate content types using helper functions', () => {
      const validContentTypes = [
        ContentType.RESEARCH_PAPER,
        ContentType.CLINICAL_GUIDELINE,
        ContentType.CASE_REPORT,
        ContentType.MEDICAL_NEWS,
        ContentType.EDUCATIONAL_MATERIAL,
        ContentType.DRUG_INFORMATION,
        ContentType.CALCULATOR
      ]

      validContentTypes.forEach(type => {
        expect(medicalValidationHelpers.validateContentType(type)).toBe(true)
      })

      expect(medicalValidationHelpers.validateContentType('invalid_type')).toBe(false)
    })

    it('should validate medical specialties using helper functions', () => {
      const validSpecialties = [
        MedicalSpecialty.CARDIOLOGY,
        MedicalSpecialty.OBSTETRICS_GYNECOLOGY,
        MedicalSpecialty.INTERNAL_MEDICINE,
        MedicalSpecialty.EMERGENCY_MEDICINE,
        MedicalSpecialty.PEDIATRICS,
        MedicalSpecialty.SURGERY
      ]

      validSpecialties.forEach(specialty => {
        expect(medicalValidationHelpers.validateSpecialty(specialty)).toBe(true)
      })

      expect(medicalValidationHelpers.validateSpecialty('invalid_specialty')).toBe(false)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty inputs gracefully', () => {
      const result = MedicalClassifier.classifyContent('', '', '', '')
      
      expect(result).toBeDefined()
      expect(result.confidence).toBeLessThan(0.5)
      expect(result.evidenceLevel).toBe(EvidenceLevel.EXPERT_OPINION)
      expect(result.specialty).toContain(MedicalSpecialty.INTERNAL_MEDICINE)
    })

    it('should handle null and undefined inputs', () => {
      const result = MedicalClassifier.classifyContent(
        null as any,
        undefined as any,
        '',
        null as any
      )
      
      expect(result).toBeDefined()
      expect(result.confidence).toBeLessThan(0.5)
    })

    it('should handle very long text inputs', () => {
      const longTitle = 'A'.repeat(1000)
      const longSnippet = 'B'.repeat(5000)
      
      const result = MedicalClassifier.classifyContent(
        longTitle,
        longSnippet,
        'nejm.org',
        'https://nejm.org/article'
      )
      
      expect(result).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should handle special characters and formatting', () => {
      const result = MedicalClassifier.classifyContent(
        'Systematic review: β-blockers in CHF patients (2024)',
        'Meta-analysis of β-adrenergic blockers vs. placebo in patients with chronic heart failure [RCT data]',
        'nejm.org',
        'https://nejm.org/beta-blockers-chf'
      )
      
      expect(result.evidenceLevel).toBe(EvidenceLevel.SYSTEMATIC_REVIEW)
      expect(result.specialty).toContain(MedicalSpecialty.CARDIOLOGY)
    })

    it('should provide consistent results for similar inputs', () => {
      const input1 = MedicalClassifier.classifyContent(
        'Randomized trial of aspirin therapy',
        'Clinical trial examining aspirin for prevention',
        'nejm.org',
        'https://nejm.org/aspirin'
      )

      const input2 = MedicalClassifier.classifyContent(
        'Randomized trial of aspirin therapy',
        'Clinical trial examining aspirin for prevention',
        'nejm.org',
        'https://nejm.org/aspirin'
      )

      expect(input1.evidenceLevel).toBe(input2.evidenceLevel)
      expect(input1.contentType).toBe(input2.contentType)
      expect(input1.confidence).toBeCloseTo(input2.confidence, 2)
    })
  })
})