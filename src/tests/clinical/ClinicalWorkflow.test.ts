/**
 * Clinical Workflow Testing Suite
 * Tests real-world healthcare professional use cases and clinical decision support workflows
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Clinical workflow components
import { MediSearchPage } from '@/components/MediSearch/MediSearchPage';
import { CalculatorsPage } from '@/components/Calculators/CalculatorsPage';
import { AICopilot } from '@/components/AICopilot/AICopilot';

// Context providers
import { AuthContextProvider } from '@/contexts/AuthContext';
import { SpecialtyContextProvider } from '@/contexts/SpecialtyContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SearchContextProvider } from '@/components/MediSearch/contexts/SearchContextProvider';

// Clinical scenario utilities
import { createClinicalScenario, createHealthcareProfessional } from '../utils/clinicalTestUtils';
import { setupMockMedicalAPIs } from '../utils/medicalMocks';

// Clinical workflow interfaces
interface ClinicalScenario {
  id: string;
  title: string;
  specialty: 'cardiology' | 'obgyn';
  patientPresentation: {
    age: number;
    sex: 'male' | 'female';
    chiefComplaint: string;
    vitalSigns?: Record<string, number>;
    symptoms: string[];
    riskFactors: string[];
    medications?: string[];
  };
  clinicalQuestions: string[];
  expectedWorkflow: ClinicalWorkflowStep[];
  learningObjectives: string[];
  evidenceLevel: string;
  timeConstraint?: number; // minutes
}

interface ClinicalWorkflowStep {
  step: number;
  action: 'search' | 'calculate' | 'consult-ai' | 'review-guidelines' | 'document';
  description: string;
  expectedOutcome: string;
  timeLimit?: number; // seconds
  criticalPath: boolean;
}

interface HealthcareProfessional {
  id: string;
  name: string;
  specialty: string;
  experienceLevel: 'resident' | 'attending' | 'specialist';
  institution: string;
  preferences: {
    evidenceLevels: string[];
    searchFilters: Record<string, any>;
    calculatorDefaults: Record<string, any>;
  };
}

interface ClinicalDecisionPoint {
  scenario: string;
  question: string;
  options: string[];
  evidenceRequired: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeToDecision: number; // minutes
}

describe('Clinical Workflow Testing', () => {
  let queryClient: QueryClient;
  let mockMedicalAPIs: any;

  beforeAll(async () => {
    mockMedicalAPIs = setupMockMedicalAPIs();
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  afterAll(() => {
    mockMedicalAPIs?.close();
  });

  const renderClinicalWorkspace = (
    professional: HealthcareProfessional,
    scenario?: ClinicalScenario
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthContextProvider initialUser={professional}>
            <SpecialtyContextProvider initialSpecialty={professional.specialty}>
              <LanguageProvider>
                <SearchContextProvider>
                  <div data-testid="clinical-workspace">
                    <MediSearchPage />
                    <CalculatorsPage />
                    <AICopilot />
                    {scenario && (
                      <div data-testid="clinical-scenario" data-scenario={scenario.id}>
                        <h3>{scenario.title}</h3>
                        <div data-testid="patient-presentation">
                          {scenario.patientPresentation.chiefComplaint}
                        </div>
                      </div>
                    )}
                  </div>
                </SearchContextProvider>
              </LanguageProvider>
            </SpecialtyContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Cardiology Clinical Workflows', () => {
    test('should support acute coronary syndrome evaluation workflow', async () => {
      const cardiologist = createHealthcareProfessional('cardiology', 'attending');
      const acsScenario: ClinicalScenario = {
        id: 'acs-evaluation-001',
        title: 'Acute Coronary Syndrome Evaluation',
        specialty: 'cardiology',
        patientPresentation: {
          age: 58,
          sex: 'male',
          chiefComplaint: 'Chest pain for 2 hours',
          vitalSigns: { bp: 145, hr: 88, rr: 18, temp: 98.6 },
          symptoms: ['chest pain', 'diaphoresis', 'nausea'],
          riskFactors: ['diabetes', 'smoking', 'family history'],
          medications: ['metformin', 'lisinopril']
        },
        clinicalQuestions: [
          'What is the TIMI risk score for this patient?',
          'Should this patient receive immediate PCI?',
          'What antiplatelet therapy is recommended?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'calculate',
            description: 'Calculate TIMI Risk Score',
            expectedOutcome: 'Risk stratification completed',
            timeLimit: 120,
            criticalPath: true
          },
          {
            step: 2,
            action: 'search',
            description: 'Review ACS management guidelines',
            expectedOutcome: 'Current treatment protocols found',
            timeLimit: 180,
            criticalPath: true
          },
          {
            step: 3,
            action: 'consult-ai',
            description: 'Discuss antiplatelet therapy options',
            expectedOutcome: 'Treatment recommendations received',
            timeLimit: 90,
            criticalPath: false
          }
        ],
        learningObjectives: [
          'Apply risk stratification tools appropriately',
          'Identify evidence-based treatment protocols',
          'Make time-sensitive clinical decisions'
        ],
        evidenceLevel: 'clinical-guideline',
        timeConstraint: 10 // 10 minutes for critical decision
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(cardiologist, acsScenario);

      // Step 1: Calculate TIMI Risk Score
      const calculatorButton = screen.getByRole('button', { name: /calculators/i });
      await user.click(calculatorButton);

      const timiCalculator = screen.getByText(/timi risk score/i);
      await user.click(timiCalculator);

      // Fill patient data from scenario
      const ageInput = screen.getByLabelText(/age/i);
      await user.type(ageInput, acsScenario.patientPresentation.age.toString());

      // Select risk factors
      const diabetesCheckbox = screen.getByLabelText(/diabetes/i);
      await user.click(diabetesCheckbox);

      const smokingCheckbox = screen.getByLabelText(/smoking/i);
      await user.click(smokingCheckbox);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      const calculationStart = performance.now();
      await user.click(calculateButton);

      // Verify calculation results
      await waitFor(() => {
        expect(screen.getByTestId('timi-results')).toBeInTheDocument();
      });

      const calculationTime = performance.now() - calculationStart;
      expect(calculationTime).toBeLessThan(2000); // Within 2 seconds

      const riskResult = screen.getByTestId('risk-score');
      expect(riskResult).toHaveTextContent(/moderate|high/i);

      // Step 2: Search for ACS guidelines
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'acute coronary syndrome management guidelines 2023');

      const executeSearchButton = screen.getByRole('button', { name: /search/i });
      const searchStart = performance.now();
      await user.click(executeSearchButton);

      // Verify search results are clinically relevant
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const searchTime = performance.now() - searchStart;
      expect(searchTime).toBeLessThan(3000); // Within 3 seconds

      const searchResults = screen.getAllByTestId('result-card');
      expect(searchResults.length).toBeGreaterThan(0);

      // Verify results contain relevant guidelines
      const firstResult = searchResults[0];
      const resultText = within(firstResult).getByTestId('result-title').textContent;
      expect(resultText).toMatch(/acs|coronary|guideline|management/i);

      // Step 3: AI consultation for treatment options
      const aiButton = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(aiButton);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 
        'Based on TIMI score and current guidelines, what antiplatelet therapy do you recommend for this ACS patient?'
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      const consultStart = performance.now();
      await user.click(sendButton);

      // Verify AI provides relevant recommendations
      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const consultTime = performance.now() - consultStart;
      expect(consultTime).toBeLessThan(5000); // Within 5 seconds

      const aiResponse = screen.getByTestId('chat-message');
      expect(aiResponse).toHaveTextContent(/antiplatelet|aspirin|clopidogrel|prasugrel/i);

      // Verify total workflow time meets clinical requirements
      const totalWorkflowTime = (calculationTime + searchTime + consultTime) / 1000 / 60;
      expect(totalWorkflowTime).toBeLessThan(acsScenario.timeConstraint!);

      console.log(`ACS workflow completed in ${totalWorkflowTime.toFixed(2)} minutes`);
    });

    test('should support heart failure management workflow', async () => {
      const cardiologist = createHealthcareProfessional('cardiology', 'specialist');
      const hfScenario: ClinicalScenario = {
        id: 'hf-management-001',
        title: 'Heart Failure with Reduced Ejection Fraction Management',
        specialty: 'cardiology',
        patientPresentation: {
          age: 72,
          sex: 'female',
          chiefComplaint: 'Shortness of breath and ankle swelling',
          vitalSigns: { bp: 110, hr: 95, rr: 22, temp: 98.4 },
          symptoms: ['dyspnea', 'orthopnea', 'peripheral edema'],
          riskFactors: ['hypertension', 'diabetes', 'prior MI'],
          medications: ['lisinopril', 'metoprolol', 'furosemide']
        },
        clinicalQuestions: [
          'What is optimal guideline-directed medical therapy?',
          'Should we consider device therapy?',
          'What are the latest HFrEF management recommendations?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'search',
            description: 'Review current HFrEF guidelines',
            expectedOutcome: 'Updated treatment protocols identified',
            timeLimit: 240,
            criticalPath: true
          },
          {
            step: 2,
            action: 'calculate',
            description: 'Assess CRT/ICD candidacy',
            expectedOutcome: 'Device therapy recommendations',
            timeLimit: 180,
            criticalPath: false
          },
          {
            step: 3,
            action: 'consult-ai',
            description: 'Optimize medication regimen',
            expectedOutcome: 'Personalized therapy plan',
            timeLimit: 120,
            criticalPath: false
          }
        ],
        learningObjectives: [
          'Apply guideline-directed medical therapy',
          'Evaluate device therapy candidacy',
          'Optimize medication dosing'
        ],
        evidenceLevel: 'systematic-review',
        timeConstraint: 15
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(cardiologist, hfScenario);

      // Step 1: Search for current HFrEF guidelines
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'heart failure reduced ejection fraction guidelines GDMT 2023');

      // Apply evidence-level filter
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      const guidelinesFilter = screen.getByLabelText(/clinical guidelines/i);
      await user.click(guidelinesFilter);

      const executeSearch = screen.getByRole('button', { name: /search/i });
      await user.click(executeSearch);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Verify guidelines are found
      const results = screen.getAllByTestId('result-card');
      const guidelineResult = results.find(result => 
        within(result).getByTestId('result-title').textContent?.includes('guideline')
      );
      expect(guidelineResult).toBeDefined();

      // Step 2: Device therapy calculation
      const calculatorTab = screen.getByRole('tab', { name: /calculators/i });
      await user.click(calculatorTab);

      // Look for CRT/ICD assessment tools
      const deviceAssessment = screen.getByText(/device therapy/i);
      await user.click(deviceAssessment);

      // Enter patient parameters for device candidacy
      const ejectionFraction = screen.getByLabelText(/ejection fraction/i);
      await user.type(ejectionFraction, '25');

      const qrsWidth = screen.getByLabelText(/qrs width/i);
      await user.type(qrsWidth, '150');

      const assessButton = screen.getByRole('button', { name: /assess/i });
      await user.click(assessButton);

      await waitFor(() => {
        expect(screen.getByTestId('device-recommendation')).toBeInTheDocument();
      });

      // Step 3: AI consultation for medication optimization
      const aiTab = screen.getByRole('tab', { name: /ai copilot/i });
      await user.click(aiTab);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 
        'Patient with HFrEF, EF 25%, on lisinopril, metoprolol, furosemide. How can I optimize GDMT?'
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const aiResponse = screen.getByTestId('chat-message');
      expect(aiResponse).toHaveTextContent(/SGLT2|ARB|sacubitril|spironolactone/i);

      // Verify clinical decision support quality
      const clinicalRelevance = screen.getByTestId('clinical-relevance-score');
      expect(clinicalRelevance).toHaveAttribute('data-score', expect.stringMatching(/[8-9]\d|100/)); // 80-100% relevance
    });

    test('should handle time-critical cardiac emergency workflow', async () => {
      const emergencyCardiologist = createHealthcareProfessional('cardiology', 'attending');
      const stemiScenario: ClinicalScenario = {
        id: 'stemi-emergency-001',
        title: 'STEMI Emergency Management',
        specialty: 'cardiology',
        patientPresentation: {
          age: 45,
          sex: 'male',
          chiefComplaint: 'Severe chest pain 30 minutes',
          vitalSigns: { bp: 160, hr: 110, rr: 24, temp: 99.2 },
          symptoms: ['severe chest pain', 'diaphoresis', 'ST elevation'],
          riskFactors: ['smoking', 'hyperlipidemia'],
        },
        clinicalQuestions: [
          'Door-to-balloon time optimization?',
          'Contraindications to primary PCI?',
          'Immediate anticoagulation protocol?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'search',
            description: 'STEMI protocol quick reference',
            expectedOutcome: 'Treatment algorithm accessed',
            timeLimit: 60, // 1 minute critical
            criticalPath: true
          },
          {
            step: 2,
            action: 'calculate',
            description: 'Bleeding risk assessment',
            expectedOutcome: 'Anticoagulation dosing determined',
            timeLimit: 90,
            criticalPath: true
          }
        ],
        learningObjectives: [
          'Execute time-critical protocols',
          'Minimize door-to-balloon time',
          'Apply emergency anticoagulation'
        ],
        evidenceLevel: 'clinical-guideline',
        timeConstraint: 5 // 5 minutes critical window
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(emergencyCardiologist, stemiScenario);

      // Enable emergency mode
      const emergencyMode = screen.getByRole('button', { name: /emergency mode/i });
      await user.click(emergencyMode);

      // Should show streamlined interface
      expect(screen.getByTestId('emergency-workflow')).toBeInTheDocument();

      // Quick protocol search
      const quickSearch = screen.getByPlaceholderText(/emergency search/i);
      await user.type(quickSearch, 'STEMI primary PCI protocol');

      const emergencySearchButton = screen.getByRole('button', { name: /quick search/i });
      const searchStart = performance.now();
      await user.click(emergencySearchButton);

      // Should return results very quickly in emergency mode
      await waitFor(() => {
        expect(screen.getByTestId('emergency-results')).toBeInTheDocument();
      }, { timeout: 2000 });

      const searchTime = performance.now() - searchStart;
      expect(searchTime).toBeLessThan(1000); // Less than 1 second

      // Quick calculator access
      const bleedingRiskCalc = screen.getByRole('button', { name: /bleeding risk/i });
      await user.click(bleedingRiskCalc);

      // Pre-populated with emergency defaults
      const calculateNow = screen.getByRole('button', { name: /calculate now/i });
      await user.click(calculateNow);

      await waitFor(() => {
        expect(screen.getByTestId('emergency-calculation-result')).toBeInTheDocument();
      });

      // Should provide immediate actionable results
      const actionableResult = screen.getByTestId('emergency-action-items');
      expect(actionableResult).toHaveTextContent(/anticoagulation|dosing|contraindication/i);

      // Total emergency workflow time verification
      const totalEmergencyTime = searchTime / 1000 / 60; // Convert to minutes
      expect(totalEmergencyTime).toBeLessThan(stemiScenario.timeConstraint!);

      console.log(`Emergency STEMI workflow completed in ${totalEmergencyTime.toFixed(2)} minutes`);
    });
  });

  describe('OB/GYN Clinical Workflows', () => {
    test('should support preeclampsia management workflow', async () => {
      const obgynSpecialist = createHealthcareProfessional('obgyn', 'specialist');
      const preeclampsiaScenario: ClinicalScenario = {
        id: 'preeclampsia-mgmt-001',
        title: 'Severe Preeclampsia Management',
        specialty: 'obgyn',
        patientPresentation: {
          age: 32,
          sex: 'female',
          chiefComplaint: 'Headache and visual changes at 34 weeks gestation',
          vitalSigns: { bp: 165, hr: 95, rr: 20, temp: 98.8 },
          symptoms: ['severe headache', 'scotomata', 'RUQ pain'],
          riskFactors: ['nulliparity', 'obesity', 'chronic hypertension'],
        },
        clinicalQuestions: [
          'What are the criteria for severe preeclampsia?',
          'When should delivery be considered?',
          'What is the magnesium sulfate protocol?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'search',
            description: 'Review ACOG preeclampsia guidelines',
            expectedOutcome: 'Diagnostic criteria confirmed',
            timeLimit: 180,
            criticalPath: true
          },
          {
            step: 2,
            action: 'calculate',
            description: 'Assess fetal maturity and delivery timing',
            expectedOutcome: 'Delivery decision support',
            timeLimit: 120,
            criticalPath: true
          },
          {
            step: 3,
            action: 'consult-ai',
            description: 'Magnesium sulfate dosing protocol',
            expectedOutcome: 'Treatment protocol guidance',
            timeLimit: 90,
            criticalPath: false
          }
        ],
        learningObjectives: [
          'Apply ACOG preeclampsia criteria',
          'Determine optimal delivery timing',
          'Implement seizure prophylaxis protocols'
        ],
        evidenceLevel: 'clinical-guideline',
        timeConstraint: 12
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(obgynSpecialist, preeclampsiaScenario);

      // Step 1: Search ACOG guidelines
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'ACOG preeclampsia severe features management 2023');

      // Set OB/GYN specific filters
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      const acogFilter = screen.getByLabelText(/ACOG guidelines/i);
      await user.click(acogFilter);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Verify ACOG guidelines found
      const acogResult = screen.getByText(/ACOG.*preeclampsia/i);
      expect(acogResult).toBeInTheDocument();

      // Step 2: Fetal maturity and delivery timing assessment
      const calculatorTab = screen.getByRole('tab', { name: /calculators/i });
      await user.click(calculatorTab);

      const fetalMaturityCalc = screen.getByText(/fetal maturity/i);
      await user.click(fetalMaturityCalc);

      // Enter gestational age
      const gestationalAge = screen.getByLabelText(/gestational age/i);
      await user.type(gestationalAge, '34');

      // Enter severity indicators
      const bpSystolic = screen.getByLabelText(/systolic bp/i);
      await user.type(bpSystolic, '165');

      const assessMaturity = screen.getByRole('button', { name: /assess/i });
      await user.click(assessMaturity);

      await waitFor(() => {
        expect(screen.getByTestId('delivery-recommendation')).toBeInTheDocument();
      });

      // Should recommend delivery for severe preeclampsia at 34 weeks
      const deliveryRec = screen.getByTestId('delivery-recommendation');
      expect(deliveryRec).toHaveTextContent(/deliver|steroid.*delivery/i);

      // Step 3: AI consultation for magnesium sulfate protocol
      const aiTab = screen.getByRole('tab', { name: /ai copilot/i });
      await user.click(aiTab);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 
        'Severe preeclampsia at 34 weeks, BP 165/110. What is the magnesium sulfate loading and maintenance dose?'
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const protocolResponse = screen.getByTestId('chat-message');
      expect(protocolResponse).toHaveTextContent(/6.*gram.*loading|2.*gram.*maintenance/i);

      // Verify obstetric emergency protocols are accessible
      const emergencyProtocols = screen.getByTestId('emergency-protocols');
      expect(emergencyProtocols).toHaveTextContent(/eclampsia|HELLP|emergency delivery/i);
    });

    test('should support labor and delivery workflow', async () => {
      const obgynResident = createHealthcareProfessional('obgyn', 'resident');
      const laborScenario: ClinicalScenario = {
        id: 'labor-delivery-001',
        title: 'Active Labor Management',
        specialty: 'obgyn',
        patientPresentation: {
          age: 28,
          sex: 'female',
          chiefComplaint: 'Regular contractions, G1P0 at 39 weeks',
          vitalSigns: { bp: 120, hr: 85, rr: 18, temp: 98.6 },
          symptoms: ['regular contractions', 'bloody show', 'ruptured membranes'],
          riskFactors: ['nulliparity'],
        },
        clinicalQuestions: [
          'What is the Bishop Score?',
          'Should labor be augmented?',
          'When to consider cesarean delivery?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'calculate',
            description: 'Calculate Bishop Score',
            expectedOutcome: 'Cervical assessment completed',
            timeLimit: 120,
            criticalPath: true
          },
          {
            step: 2,
            action: 'search',
            description: 'Review labor management protocols',
            expectedOutcome: 'Evidence-based labor management',
            timeLimit: 200,
            criticalPath: false
          },
          {
            step: 3,
            action: 'consult-ai',
            description: 'Labor augmentation decision support',
            expectedOutcome: 'Personalized management plan',
            timeLimit: 150,
            criticalPath: false
          }
        ],
        learningObjectives: [
          'Apply Bishop Score in clinical context',
          'Understand labor progression patterns',
          'Make evidence-based delivery decisions'
        ],
        evidenceLevel: 'practice-bulletin',
        timeConstraint: 20
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(obgynResident, laborScenario);

      // Step 1: Bishop Score calculation
      const calculatorButton = screen.getByRole('button', { name: /calculators/i });
      await user.click(calculatorButton);

      const bishopScore = screen.getByText(/bishop score/i);
      await user.click(bishopScore);

      // Fill cervical exam findings
      const dilation = screen.getByLabelText(/dilation/i);
      await user.type(dilation, '4');

      const effacement = screen.getByLabelText(/effacement/i);
      await user.type(effacement, '80');

      const station = screen.getByLabelText(/station/i);
      await user.select(station, '0');

      const consistency = screen.getByLabelText(/consistency/i);
      await user.select(consistency, 'soft');

      const position = screen.getByLabelText(/position/i);
      await user.select(position, 'anterior');

      const calculateBishop = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateBishop);

      await waitFor(() => {
        expect(screen.getByTestId('bishop-result')).toBeInTheDocument();
      });

      const bishopResult = screen.getByTestId('bishop-result');
      expect(bishopResult).toHaveTextContent(/score.*[8-9]|favorable/i);

      // Step 2: Search labor management guidelines
      const searchTab = screen.getByRole('tab', { name: /search/i });
      await user.click(searchTab);

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'ACOG labor management nulliparous');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should find relevant labor management guidelines
      const laborGuidelines = screen.getAllByTestId('result-card');
      const relevantGuideline = laborGuidelines.find(card =>
        within(card).getByTestId('result-title').textContent?.includes('labor')
      );
      expect(relevantGuideline).toBeDefined();

      // Step 3: AI consultation for labor management
      const aiTab = screen.getByRole('tab', { name: /ai copilot/i });
      await user.click(aiTab);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 
        'G1P0 at 39 weeks, Bishop score 8, ROM 2 hours ago, contractions q3min. Should I augment labor?'
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const laborAdvice = screen.getByTestId('chat-message');
      expect(laborAdvice).toHaveTextContent(/pitocin|augmentation|watch.*progress/i);

      // Verify resident-appropriate educational content
      const educationalContext = screen.getByTestId('educational-context');
      expect(educationalContext).toHaveTextContent(/learning.*objective|teaching.*point/i);
    });

    test('should handle obstetric emergency workflow', async () => {
      const obgynAttending = createHealthcareProfessional('obgyn', 'attending');
      const emergencyScenario: ClinicalScenario = {
        id: 'obstetric-emergency-001',
        title: 'Shoulder Dystocia Emergency',
        specialty: 'obgyn',
        patientPresentation: {
          age: 35,
          sex: 'female',
          chiefComplaint: 'Shoulder dystocia during delivery',
          vitalSigns: { bp: 140, hr: 110, rr: 24, temp: 99.0 },
          symptoms: ['turtle sign', 'fetal head retraction', 'failed delivery'],
          riskFactors: ['macrosomia', 'diabetes', 'prolonged second stage'],
        },
        clinicalQuestions: [
          'What is the McRoberts maneuver protocol?',
          'When to perform episiotomy?',
          'Brachial plexus injury prevention?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'search',
            description: 'Emergency shoulder dystocia protocol',
            expectedOutcome: 'Step-by-step management algorithm',
            timeLimit: 30, // 30 seconds - emergency
            criticalPath: true
          },
          {
            step: 2,
            action: 'consult-ai',
            description: 'Real-time procedural guidance',
            expectedOutcome: 'Immediate action steps',
            timeLimit: 60,
            criticalPath: true
          }
        ],
        learningObjectives: [
          'Execute emergency obstetric procedures',
          'Minimize fetal injury risk',
          'Document emergency interventions'
        ],
        evidenceLevel: 'emergency-protocol',
        timeConstraint: 3 // 3 minutes critical
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(obgynAttending, emergencyScenario);

      // Activate obstetric emergency mode
      const emergencyButton = screen.getByRole('button', { name: /emergency/i });
      await user.click(emergencyButton);

      const obEmergency = screen.getByRole('button', { name: /shoulder dystocia/i });
      await user.click(obEmergency);

      // Should immediately show emergency protocol
      await waitFor(() => {
        expect(screen.getByTestId('emergency-protocol')).toBeInTheDocument();
      }, { timeout: 1000 });

      const protocolSteps = screen.getByTestId('protocol-steps');
      expect(protocolSteps).toHaveTextContent(/HELPERR|McRoberts|pressure|episiotomy/i);

      // Real-time AI guidance
      const emergencyAI = screen.getByTestId('emergency-ai');
      expect(emergencyAI).toBeInTheDocument();

      const guidanceInput = screen.getByPlaceholderText(/describe current situation/i);
      await user.type(guidanceInput, 'Performed McRoberts, suprapubic pressure, head still stuck');

      const getGuidance = screen.getByRole('button', { name: /get guidance/i });
      const guidanceStart = performance.now();
      await user.click(getGuidance);

      await waitFor(() => {
        expect(screen.getByTestId('real-time-guidance')).toBeInTheDocument();
      }, { timeout: 2000 });

      const guidanceTime = performance.now() - guidanceStart;
      expect(guidanceTime).toBeLessThan(1500); // Less than 1.5 seconds

      const guidance = screen.getByTestId('real-time-guidance');
      expect(guidance).toHaveTextContent(/episiotomy|Woods|Rubin|Zavanelli/i);

      // Emergency documentation
      const quickDoc = screen.getByTestId('emergency-documentation');
      expect(quickDoc).toBeInTheDocument();

      // Should auto-populate based on scenario
      const autoDoc = within(quickDoc).getByTestId('auto-generated-note');
      expect(autoDoc).toHaveTextContent(/shoulder dystocia.*McRoberts.*maneuver/i);

      console.log(`Emergency obstetric protocol accessed in ${guidanceTime.toFixed(0)}ms`);
    });
  });

  describe('Cross-Specialty Clinical Decision Support', () => {
    test('should support multidisciplinary consultation workflow', async () => {
      const cardiologist = createHealthcareProfessional('cardiology', 'attending');
      const multidisciplinaryScenario: ClinicalScenario = {
        id: 'multi-consult-001',
        title: 'Pregnant Patient with Cardiac Disease',
        specialty: 'cardiology',
        patientPresentation: {
          age: 30,
          sex: 'female',
          chiefComplaint: 'Shortness of breath in pregnancy',
          vitalSigns: { bp: 110, hr: 100, rr: 24, temp: 98.6 },
          symptoms: ['dyspnea on exertion', 'orthopnea', 'known mitral stenosis'],
          riskFactors: ['rheumatic heart disease', '24 weeks pregnant'],
        },
        clinicalQuestions: [
          'How does pregnancy affect mitral stenosis?',
          'What cardiac interventions are safe in pregnancy?',
          'When should delivery be planned?'
        ],
        expectedWorkflow: [
          {
            step: 1,
            action: 'search',
            description: 'Cardiac disease in pregnancy guidelines',
            expectedOutcome: 'Multidisciplinary management protocols',
            timeLimit: 300,
            criticalPath: true
          },
          {
            step: 2,
            action: 'consult-ai',
            description: 'Risk stratification and delivery planning',
            expectedOutcome: 'Integrated care recommendations',
            timeLimit: 180,
            criticalPath: false
          }
        ],
        learningObjectives: [
          'Understand physiologic changes in pregnancy',
          'Apply multidisciplinary care principles',
          'Plan timing of interventions'
        ],
        evidenceLevel: 'consensus-statement',
        timeConstraint: 25
      };

      const user = userEvent.setup();
      renderClinicalWorkspace(cardiologist, multidisciplinaryScenario);

      // Search for multidisciplinary guidelines
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'cardiac disease pregnancy multidisciplinary team');

      // Enable cross-specialty search
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      const crossSpecialtyFilter = screen.getByLabelText(/all specialties/i);
      await user.click(crossSpecialtyFilter);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should find both cardiology and obstetric guidelines
      const results = screen.getAllByTestId('result-card');
      const cardiologyResult = results.find(card =>
        within(card).getByTestId('result-title').textContent?.includes('cardiac')
      );
      const obstetricResult = results.find(card =>
        within(card).getByTestId('result-title').textContent?.includes('pregnancy')
      );

      expect(cardiologyResult).toBeDefined();
      expect(obstetricResult).toBeDefined();

      // AI consultation with multidisciplinary context
      const aiTab = screen.getByRole('tab', { name: /ai copilot/i });
      await user.click(aiTab);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 
        'Pregnant patient 24 weeks with mitral stenosis, increasing dyspnea. Multidisciplinary management plan?'
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const multiResponse = screen.getByTestId('chat-message');
      expect(multiResponse).toHaveTextContent(/cardiology.*obstetric|maternal.*fetal|team.*approach/i);

      // Should show consultation recommendations
      const consultRecs = screen.getByTestId('consultation-recommendations');
      expect(consultRecs).toHaveTextContent(/MFM|anesthesia|cardiothoracic/i);
    });

    test('should provide clinical decision support for complex cases', async () => {
      const resident = createHealthcareProfessional('cardiology', 'resident');
      
      const user = userEvent.setup();
      renderClinicalWorkspace(resident);

      // Complex case presentation
      const caseInput = screen.getByPlaceholderText(/enter clinical case/i);
      await user.type(caseInput, 
        '65yo M with chest pain, diabetes, CKD stage 3, on warfarin for AFib. Troponin elevated. Management?'
      );

      const analyzeCaseButton = screen.getByRole('button', { name: /analyze case/i });
      await user.click(analyzeCaseButton);

      // Should provide structured decision support
      await waitFor(() => {
        expect(screen.getByTestId('clinical-decision-support')).toBeInTheDocument();
      });

      const decisionSupport = screen.getByTestId('clinical-decision-support');
      
      // Should identify key clinical issues
      const clinicalIssues = within(decisionSupport).getByTestId('clinical-issues');
      expect(clinicalIssues).toHaveTextContent(/ACS|bleeding risk|renal function/i);

      // Should provide risk assessments
      const riskAssessment = within(decisionSupport).getByTestId('risk-assessment');
      expect(riskAssessment).toHaveTextContent(/TIMI|GRACE|bleeding/i);

      // Should suggest relevant calculators
      const suggestedCalcs = within(decisionSupport).getByTestId('suggested-calculators');
      expect(suggestedCalcs).toHaveTextContent(/TIMI|GRACE|HAS-BLED/i);

      // Should provide educational content for resident
      const educationalTips = within(decisionSupport).getByTestId('educational-tips');
      expect(educationalTips).toHaveTextContent(/learning.*point|remember|consider/i);
    });
  });

  describe('Clinical Performance Metrics', () => {
    test('should track clinical decision-making efficiency', async () => {
      const attendingPhysician = createHealthcareProfessional('cardiology', 'attending');
      
      const user = userEvent.setup();
      renderClinicalWorkspace(attendingPhysician);

      // Enable performance tracking
      const performanceTracker = screen.getByTestId('performance-tracker');
      expect(performanceTracker).toBeInTheDocument();

      // Simulate clinical workflow
      const startTime = performance.now();

      // 1. Clinical question
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'acute MI primary PCI vs thrombolysis');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // 2. Risk calculation
      const calculatorTab = screen.getByRole('button', { name: /calculators/i });
      await user.click(calculatorTab);

      const timiCalc = screen.getByText(/TIMI/i);
      await user.click(timiCalc);

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      // 3. Decision reached
      const decisionButton = screen.getByRole('button', { name: /make decision/i });
      await user.click(decisionButton);

      const endTime = performance.now();
      const totalDecisionTime = (endTime - startTime) / 1000; // seconds

      // Verify performance metrics
      const metrics = screen.getByTestId('clinical-metrics');
      expect(metrics).toBeInTheDocument();

      const decisionTime = within(metrics).getByTestId('decision-time');
      expect(parseInt(decisionTime.textContent!)).toBeLessThan(300); // Under 5 minutes

      const evidenceQuality = within(metrics).getByTestId('evidence-quality');
      expect(evidenceQuality).toHaveAttribute('data-score', expect.stringMatching(/[7-9]\d|100/)); // 70-100%

      console.log(`Clinical decision completed in ${totalDecisionTime.toFixed(1)} seconds`);
    });
  });
});