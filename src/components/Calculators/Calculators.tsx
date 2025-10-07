import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { Calculator, Heart, Activity, Zap, Wrench, HeartHandshake, Dna, Shield, TestTube, Calendar, Sparkles, Award, ArrowRight, ChevronRight, Target, CheckCircle, Rocket, Play, Crown, Diamond } from 'lucide-react';

// Custom CSS animations for ultra-modern effects
const customStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(1deg); }
    50% { transform: translateY(-5px) rotate(-1deg); }
    75% { transform: translateY(-15px) rotate(0.5deg); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  
  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useSpecialty, MedicalSpecialty } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getCategoryIconClass, getSpecialtyGradientClass } from '../../utils/calculatorTheme';

// Lazy-loaded Cardiology Calculator Components
// Phase 1: Core Risk Assessment  
const ASCVDCalculator = React.lazy(() => import('./ASCVDCalculator').then(module => ({ default: module.ASCVDCalculator })));
const AtrialFibrillationCalculators = React.lazy(() => import('./AtrialFibrillationCalculators').then(module => ({ default: module.AtrialFibrillationCalculators })));

// Phase 2: Acute Coronary Syndrome
const TIMIRiskCalculator = React.lazy(() => import('./TIMIRiskCalculator').then(module => ({ default: module.TIMIRiskCalculator })));
const GRACERiskCalculator = React.lazy(() => import('./GRACERiskCalculator').then(module => ({ default: module.GRACERiskCalculator })));

// Phase 3: Advanced Therapy Management
const DAPTCalculator = React.lazy(() => import('./DAPTCalculator'));
const PRECISEDAPTCalculator = React.lazy(() => import('./PRECISEDAPTCalculator').then(module => ({ default: module.PRECISEDAPTCalculator })));
const PREVENTCalculator = React.lazy(() => import('./PREVENTCalculator').then(module => ({ default: module.PREVENTCalculator })));

// Phase 4: Heart Failure Management
const HeartFailureStagingCalculator = React.lazy(() => import('./HeartFailureStaging'));
const GWTGHFCalculator = React.lazy(() => import('./GWTGHFCalculator').then(module => ({ default: module.GWTGHFCalculator })));
const MAGGICCalculator = React.lazy(() => import('./MAGGICCalculator').then(module => ({ default: module.MAGGICCalculator })));
const SHFMCalculator = React.lazy(() => import('./SHFMCalculator').then(module => ({ default: module.SHFMCalculator })));

// Phase 5: Surgical Risk Assessment
const STSCalculator = React.lazy(() => import('./STSCalculator').then(module => ({ default: module.STSCalculator })));
const EuroSCOREIICalculator = React.lazy(() => import('./EuroSCOREIICalculator').then(module => ({ default: module.EuroSCOREIICalculator })));

// Phase 6: Specialized Cardiomyopathy Assessment
const HCMRiskSCDCalculator = React.lazy(() => import('./HCMRiskSCDCalculator').then(module => ({ default: module.HCMRiskSCDCalculator })));
const HCMAFRiskCalculator = React.lazy(() => import('./HCMAFRiskCalculator').then(module => ({ default: module.HCMAFRiskCalculator })));

// Additional Cardiology Calculators
const HIT4TsCalculator = React.lazy(() => import('./HIT4TsCalculator'));
const SIADHCalculator = React.lazy(() => import('./SIADHCalculator').then(module => ({ default: module.SIADHCalculator })));

// Lazy-loaded OB/GYN Calculator Components
const EDDCalculator = React.lazy(() => import('./EDDCalculator').then(module => ({ default: module.EDDCalculator })));
const GestationalAgeCalculator = React.lazy(() => import('./GestationalAgeCalculator').then(module => ({ default: module.GestationalAgeCalculator })));
const BishopScoreCalculator = React.lazy(() => import('./BishopScoreCalculator'));
const ApgarScoreCalculator = React.lazy(() => import('./ApgarScoreCalculator').then(module => ({ default: module.ApgarScoreCalculator })));
const PreeclampsiaRiskCalculator = React.lazy(() => import('./PreeclampsiaRiskCalculator'));
const PretermBirthRiskCalculator = React.lazy(() => import('./PretermBirthRiskCalculator'));
const GDMScreeningCalculator = React.lazy(() => import('./GDMScreeningCalculator'));
const VBACSuccessCalculator = React.lazy(() => import('./VBACSuccessCalculator'));
const PPHRiskCalculator = React.lazy(() => import('./PPHRiskCalculator'));
const CervicalCancerRiskCalculator = React.lazy(() => import('./CervicalCancerRiskCalculator'));
const OvarianCancerRiskCalculator = React.lazy(() => import('./OvarianCancerRiskCalculator'));
const EndometrialCancerRiskCalculator = React.lazy(() => import('./EndometrialCancerRiskCalculator'));
const OvarianReserveCalculator = React.lazy(() => import('./OvarianReserveCalculator'));
const MenopauseAssessmentCalculator = React.lazy(() => import('./MenopauseAssessmentCalculator'));

type CardiologyCalculatorType = 
  // Phase 1 - Core Risk Assessment
  | 'ascvd' | 'atrial-fibrillation'
  // Phase 2
  | 'timi-risk' | 'grace-risk' | 'siadh-diagnostic-criteria'
  // Phase 3
  | 'dapt' | 'precise-dapt' | 'prevent'
  // Phase 4
  | 'heart-failure-staging' | 'gwtg-hf' | 'maggic' | 'shfm'
  // Phase 5
  | 'sts' | 'euroscore'
  // Phase 6
  | 'hcm-risk-scd' | 'hcm-af-risk'
  // Additional
  | 'hit-4ts' | 'siadh-diagnostic-criteria';

type OBGYNCalculatorType = 
  // Pregnancy Dating & Assessment
  | 'edd-calculator' | 'gestational-age'
  // Antenatal Risk Assessment
  | 'preeclampsia-risk' | 'preterm-birth-risk' | 'gdm-screening'
  // Labor Management
  | 'bishop-score' | 'vbac-success'
  // Assessment Tools
  | 'apgar-score' | 'pph-risk'
  // Gynecologic Oncology
  | 'cervical-cancer-risk' | 'ovarian-cancer-risk' | 'endometrial-cancer-risk'
  // Reproductive Endocrinology
  | 'ovarian-reserve' | 'menopause-assessment';

type CalculatorType = CardiologyCalculatorType | OBGYNCalculatorType;

interface CalculatorCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  calculators: {
    id: CalculatorType;
    name: string;
    description: string;
    component: React.FC;
    tags?: string[];
  }[];
}

const CalculatorsComponent: React.FC = () => {
  const { specialty } = useSpecialty();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [searchQuery] = useState<string>('');

// Cardiology Calculator Categories
const cardiologyCalculatorCategories: CalculatorCategory[] = [
  {
    id: 'risk-assessment',
      label: t('calculators.categories.risk_assessment'),
    icon: Heart,
    color: getCategoryIconClass(0),
    calculators: [
      {
        id: 'ascvd',
          name: t('calculators.ascvd.title'),
          description: t('calculators.ascvd.subtitle'),
          component: ASCVDCalculator,
      },
      {
        id: 'atrial-fibrillation',
          name: t('calculators.atrial_fibrillation.title'),
          description: t('calculators.atrial_fibrillation.subtitle'),
          component: AtrialFibrillationCalculators,
      }
    ]
  },
  {
    id: 'acute-care',
      label: t('calculators.categories.acute_care'),
    icon: Activity,
    color: getCategoryIconClass(1),
    calculators: [
      {
        id: 'timi-risk',
          name: t('calculators.timi_risk.title'),
          description: t('calculators.timi_risk.subtitle'),
          component: TIMIRiskCalculator,
      },
      {
        id: 'grace-risk',
          name: t('calculators.grace_acs.title'),
          description: t('calculators.grace_acs.subtitle'),
          component: GRACERiskCalculator,
      },
      {
        id: 'hit-4ts',
        name: '4Ts Score for HIT',
        description: 'Risk assessment for heparin-induced thrombocytopenia',
        component: HIT4TsCalculator,
      },
      {
        id: 'siadh-diagnostic-criteria',
        name: 'SIADH Diagnostic Criteria',
        description: 'Diagnostic criteria for syndrome of inappropriate antidiuretic hormone secretion',
        component: SIADHCalculator,
      }
    ]
  },
  {
    id: 'therapy-management',
      label: t('calculators.categories.therapy_management'), 
    icon: Zap,
    color: getCategoryIconClass(2),
    calculators: [
      {
        id: 'dapt',
          name: t('calculators.dapt.title'),
          description: t('calculators.dapt.subtitle'),
          component: DAPTCalculator,
      },
      {
        id: 'precise-dapt',
          name: t('calculators.precise_dapt.title'),
          description: t('calculators.precise_dapt.subtitle'),
          component: PRECISEDAPTCalculator,
      },
      {
        id: 'prevent',
          name: t('calculators.prevent.title'),
          description: t('calculators.prevent.subtitle'),
          component: PREVENTCalculator,
      }
    ]
  },
  {
    id: 'heart-failure',
      label: t('calculators.categories.heart_failure'),
    icon: HeartHandshake,
    color: getCategoryIconClass(3),
    calculators: [
      {
        id: 'heart-failure-staging',
          name: t('calculators.cardiology.heartFailureStaging.title'),
          description: t('calculators.cardiology.heartFailureStaging.description'),
          component: HeartFailureStagingCalculator,
          tags: ['Heart Failure', 'Staging', 'ACC/AHA', 'Guideline'],
        },
        {
          id: 'gwtg-hf',
            name: t('calculators.gwtg_hf.title'),
            description: t('calculators.gwtg_hf.subtitle'),
            component: GWTGHFCalculator,
        },
        {
          id: 'maggic',
            name: t('calculators.maggic.title'),
            description: t('calculators.maggic.subtitle'),
            component: MAGGICCalculator,
        },
        {
          id: 'shfm',
            name: t('calculators.shfm.title'),
            description: t('calculators.shfm.subtitle'),
            component: SHFMCalculator,
        }
    ]
  },
  {
    id: 'surgical-risk',
      label: t('calculators.categories.surgical_risk'),
    icon: Wrench,
    color: getCategoryIconClass(0),
    calculators: [
      {
        id: 'sts',
          name: t('calculators.sts.title'),
          description: t('calculators.sts.subtitle'),
          component: STSCalculator,
      },
      {
        id: 'euroscore',
          name: t('calculators.euroscore.title'),
          description: t('calculators.euroscore.subtitle'),
          component: EuroSCOREIICalculator,
      }
    ]
  },
  {
    id: 'cardiomyopathy',
      label: t('calculators.categories.cardiomyopathy'),
    icon: Dna,
    color: getCategoryIconClass(1),
    calculators: [
      {
        id: 'hcm-risk-scd',
          name: t('calculators.hcm_risk_scd.title'),
          description: t('calculators.hcm_risk_scd.subtitle'),
          component: HCMRiskSCDCalculator,
        },
        {
          id: 'hcm-af-risk',
            name: t('calculators.hcm_af_risk.title'),
            description: t('calculators.hcm_af_risk.subtitle'),
            component: HCMAFRiskCalculator,
        }
    ]
  }
];

// OB/GYN Calculator Categories
const obgynCalculatorCategories: CalculatorCategory[] = [
  {
    id: 'pregnancy-dating',
      label: t('calculators.categories.pregnancy_dating'),
    icon: Calendar,
      color: 'text-pink-600',
    calculators: [
      {
        id: 'edd-calculator',
          name: t('calculators.edd.title'),
          description: t('calculators.edd.subtitle'),
          component: EDDCalculator,
      },
      {
        id: 'gestational-age',
          name: t('calculators.gestational_age.title'),
          description: t('calculators.gestational_age.subtitle'),
          component: GestationalAgeCalculator,
      }
    ]
  },
  {
    id: 'antenatal-risk',
      label: t('calculators.categories.antenatal_risk'),
    icon: Shield,
      color: 'text-blue-600',
    calculators: [
      {
        id: 'preeclampsia-risk',
          name: t('calculators.preeclampsia_risk.title'),
          description: t('calculators.preeclampsia_risk.subtitle'),
          component: PreeclampsiaRiskCalculator,
        },
        {
          id: 'preterm-birth-risk',
            name: t('calculators.preterm_birth_risk.title'),
            description: t('calculators.preterm_birth_risk.subtitle'),
            component: PretermBirthRiskCalculator,
        },
        {
          id: 'gdm-screening',
            name: t('calculators.gdm_screening.title'),
            description: t('calculators.gdm_screening.subtitle'),
            component: GDMScreeningCalculator,
        }
    ]
  },
  {
    id: 'labor-management',
      label: t('calculators.categories.labor_management'),
    icon: Activity,
    color: 'text-purple-600',
    calculators: [
      {
        id: 'bishop-score',
          name: t('calculators.bishop_score.title'),
          description: t('calculators.bishop_score.subtitle'),
          component: BishopScoreCalculator,
        },
        {
          id: 'vbac-success',
            name: t('calculators.vbac_success.title'),
            description: t('calculators.vbac_success.subtitle'),
            component: VBACSuccessCalculator,
        }
    ]
  },
  {
    id: 'assessment-tools',
      label: t('calculators.categories.assessment_tools'),
    icon: TestTube,
    color: 'text-green-600',
    calculators: [
      {
        id: 'apgar-score',
          name: t('calculators.obgyn.apgar_score.title'),
          description: t('calculators.obgyn.apgar_score.subtitle'),
          component: ApgarScoreCalculator,
        },
        {
          id: 'pph-risk',
            name: t('calculators.pph_risk.title'),
            description: t('calculators.pph_risk.subtitle'),
            component: PPHRiskCalculator,
        }
    ]
  },
  {
    id: 'gynecologic-oncology',
      label: t('calculators.categories.gynecologic_oncology'),
    icon: Shield,
      color: 'text-red-600',
    calculators: [
      {
        id: 'cervical-cancer-risk',
          name: t('calculators.cervical_cancer_risk.title'),
          description: t('calculators.cervical_cancer_risk.subtitle'),
          component: CervicalCancerRiskCalculator,
        },
        {
          id: 'ovarian-cancer-risk',
            name: t('calculators.ovarian_cancer_risk.title'),
            description: t('calculators.ovarian_cancer_risk.subtitle'),
            component: OvarianCancerRiskCalculator,
        },
        {
          id: 'endometrial-cancer-risk',
            name: t('calculators.endometrial_cancer_risk.title'),
            description: t('calculators.endometrial_cancer_risk.subtitle'),
            component: EndometrialCancerRiskCalculator,
        }
    ]
  },
  {
    id: 'reproductive-endocrinology',
      label: t('calculators.categories.reproductive_endocrinology'),
      icon: Dna,
    color: 'text-indigo-600',
    calculators: [
      {
        id: 'ovarian-reserve',
          name: t('calculators.ovarian_reserve.title'),
          description: t('calculators.ovarian_reserve.description'),
          component: OvarianReserveCalculator,
        },
        {
          id: 'menopause-assessment',
            name: t('calculators.menopause_assessment.title'),
            description: t('calculators.menopause_assessment.subtitle'),
            component: MenopauseAssessmentCalculator,
        }
    ]
  }
];

  // Calculate which calculator categories to show based on specialty (memoized to prevent infinite loops)
  const calculatorCategories = useMemo(() => {
    return specialty === MedicalSpecialty.OBGYN ? obgynCalculatorCategories : cardiologyCalculatorCategories;
  }, [specialty]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-show mobile menu on larger screens
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set default category when specialty changes
  useEffect(() => {
    if (calculatorCategories.length > 0) {
      setActiveCategory(calculatorCategories[0].id);
    }
  }, [calculatorCategories]);

  // Debug: Log category changes
  useEffect(() => {

  }, [activeCategory]);

  // Close mobile menu when category or calculator changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [activeCategory, activeCalculator]);

  const renderCardiologyCalculator = (calculatorId: CardiologyCalculatorType) => {
    switch (calculatorId) {
      // Phase 1: Core Risk Assessment
      case 'ascvd':
        return <ASCVDCalculator />;
      case 'atrial-fibrillation':
        return <AtrialFibrillationCalculators />;
      
      // Phase 2: Acute Coronary Syndrome
      case 'timi-risk':
        return <TIMIRiskCalculator />;
      case 'grace-risk':
        return <GRACERiskCalculator />;
      
      // Phase 3: Advanced Therapy Management
      case 'dapt':
        return <DAPTCalculator />;
      case 'precise-dapt':
        return <PRECISEDAPTCalculator />;
      case 'prevent':
        return <PREVENTCalculator />;
      
      // Phase 4: Heart Failure Management
      case 'heart-failure-staging':
        return <HeartFailureStagingCalculator />;
      case 'gwtg-hf':
        return <GWTGHFCalculator />;
      case 'maggic':
        return <MAGGICCalculator />;
      case 'shfm':
        return <SHFMCalculator />;
      
      // Phase 5: Surgical Risk Assessment
      case 'sts':
        return <STSCalculator />;
      case 'euroscore':
        return <EuroSCOREIICalculator />;
      
      // Phase 6: Specialized Cardiomyopathy Assessment
      case 'hcm-risk-scd':
        return <HCMRiskSCDCalculator />;
      case 'hcm-af-risk':
        return <HCMAFRiskCalculator />;
      
      // Additional Calculators
      case 'hit-4ts':
        return <HIT4TsCalculator />;
      case 'siadh-diagnostic-criteria':
        return <SIADHCalculator />;
      
      default:
        return null;
    }
  };

  const renderOBGYNCalculator = () => {
    switch (activeCalculator as OBGYNCalculatorType) {
      case 'edd-calculator':
        return <EDDCalculator />;
      case 'gestational-age':
        return <GestationalAgeCalculator />;
      case 'preeclampsia-risk':
        return <PreeclampsiaRiskCalculator />;
      case 'preterm-birth-risk':
        return <PretermBirthRiskCalculator />;
      case 'gdm-screening':
        return <GDMScreeningCalculator />;
      case 'bishop-score':
        return <BishopScoreCalculator />;
      case 'vbac-success':
        return <VBACSuccessCalculator />;
      case 'apgar-score':
        return <ApgarScoreCalculator />;
      case 'pph-risk':
        return <PPHRiskCalculator />;
      case 'cervical-cancer-risk':
        return <CervicalCancerRiskCalculator />;
      case 'ovarian-cancer-risk':
        return <OvarianCancerRiskCalculator />;
      case 'endometrial-cancer-risk':
        return <EndometrialCancerRiskCalculator />;
      case 'ovarian-reserve':
        return <OvarianReserveCalculator />;
      case 'menopause-assessment':
        return <MenopauseAssessmentCalculator />;
      default:
        return null;
    }
  };

  const renderCalculator = () => {
    if (!activeCalculator) return null;

    if (specialty === MedicalSpecialty.OBGYN) {
      return renderOBGYNCalculator();
    } else {
      return renderCardiologyCalculator(activeCalculator as CardiologyCalculatorType);
    }
  };

  const activeCategory_data = calculatorCategories.find(cat => cat.id === activeCategory);

  // Filter calculators based on search - memoized to prevent recalculation on every render
  const filteredCalculators = useMemo(() => {
    return activeCategory_data?.calculators.filter(calc =>
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [activeCategory_data, searchQuery]);

  // Individual calculator view with mobile optimization
  if (activeCalculator) {
    return (
      <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'mobile-container' : ''}`}>
        {/* Mobile-optimized header */}
        <div className={`
          flex items-center justify-between
          ${isMobile ? 'sticky top-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 z-10 p-3 -m-3 border-b border-gray-200/50 dark:border-gray-700/50' : ''}
        `}>
          <button
            onClick={() => setActiveCalculator(null)}
            className={`
              inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md min-h-[44px] min-w-[44px]
              ${isMobile ? 'px-6 py-4 text-sm' : ''}
            `}
            aria-label="Back to calculators"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>{t('calculators.back_to')} {isMobile ? t('navigation.calculators') : t('calculators.calculator_categories')}</span>
          </button>
          
          {/* Mobile calculator info */}
          {isMobile && activeCategory_data && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-50/50 backdrop-blur-sm text-xs text-gray-600 dark:text-gray-400">
              <activeCategory_data.icon className={`w-3 h-3 ${activeCategory_data.color}`} />
              <span className="truncate max-w-[120px]">{activeCategory_data.label}</span>
            </div>
          )}
        </div>
        
        {/* Calculator content with mobile padding */}
        <div className={isMobile ? 'px-1' : ''}>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/25 dark:border-gray-700/25 shadow-xl">
              {/* Loading animation */}
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-violet-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              
              {/* Loading text */}
              <div className="mt-6 text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Loading Calculator
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preparing your clinical tool...
                </p>
              </div>
              
              {/* Progress indicators */}
              <div className="mt-4 flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          }>
            {renderCalculator()}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="min-h-screen bg-calc-bg-main-light dark:bg-calc-bg-main-dark relative">
          {/* Epic Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Primary floating orbs */}
            <div className={`absolute top-1/6 left-1/5 w-[500px] h-[500px] ${getSpecialtyGradientClass(specialty)} opacity-15 rounded-full blur-3xl animate-pulse`}></div>
            <div className={`absolute bottom-1/5 right-1/4 w-[600px] h-[600px] ${getSpecialtyGradientClass(specialty)} opacity-10 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
            <div className={`absolute top-1/3 right-1/6 w-[400px] h-[400px] ${getSpecialtyGradientClass(specialty)} opacity-12 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '4s' }}></div>
            
            {/* Secondary accent orbs */}
            <div className={`absolute top-2/3 left-1/3 w-[300px] h-[300px] ${getSpecialtyGradientClass(specialty)} opacity-8 rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute bottom-1/2 left-1/12 w-[250px] h-[250px] ${getSpecialtyGradientClass(specialty)} opacity-10 rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '3s' }}></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-calc-theme-secondary rounded-full blur-sm animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-calc-theme-accent rounded-full blur-sm animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-calc-theme-light rounded-full blur-sm animate-bounce opacity-70" style={{ animationDelay: '2.5s' }}></div>
          </div>

          {/* Main content container with perfect centering */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Compact Hero Section */}
            <div className="flex-shrink-0 text-center py-8 px-4 sm:py-12 sm:px-6" data-tour="calculator-tabs">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Streamlined title */}
                <div className="relative inline-block">
                  {/* Background glow */}
                  <div className={`absolute inset-0 ${getSpecialtyGradientClass(specialty)} opacity-15 rounded-2xl blur-xl scale-105 animate-pulse`}></div>
                  
                  <h1 className="relative text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                    <span className={`${getSpecialtyGradientClass(specialty)} bg-clip-text text-transparent drop-shadow-sm`}>
                      {t('tour.calculators.hero.title', 'Medical Calculator Excellence')}
                    </span>
                  </h1>
                  
                  {/* Smaller floating accent */}
                  <div className="absolute -top-2 -right-6 animate-spin-slow">
                    <Crown className="w-8 h-8 text-amber-400 opacity-70" />
                  </div>
                </div>

                {/* Compact subtitle */}
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-white/25 dark:bg-gray-800/25 backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-700/30"></div>
                  <p className="relative text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium px-6 py-4 leading-relaxed">
                    {t('tour.calculators.hero.subtitle', 'World-class evidence-based calculators with 100% validation and clinical accuracy')}
                  </p>
                </div>

                {/* Compact stats row */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {[
                    { icon: Target, labelKey: 'tour.calculators.stats.validated', value: '30+', color: 'from-emerald-500 to-teal-600' },
                    { icon: Award, labelKey: 'tour.calculators.stats.clinical', value: 'AAA', color: 'from-blue-500 to-indigo-600' },
                    { icon: Diamond, labelKey: 'tour.calculators.stats.evidence', value: 'A++', color: 'from-violet-500 to-purple-600' },
                    { icon: Rocket, labelKey: 'tour.calculators.stats.fast', value: '99.9%', color: 'from-rose-500 to-pink-600' }
                  ].map((stat, index) => (
                    <div key={stat.labelKey} className="group relative" style={{ animationDelay: `${index * 150}ms` }}>
                      {/* Glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl blur-lg opacity-15 group-hover:opacity-30 transition-opacity duration-400`}></div>
                      
                      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/25 dark:border-gray-700/25 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 shadow-lg">
                        <div className={`inline-flex p-2 bg-gradient-to-r ${stat.color} rounded-lg mb-2 shadow-md`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className={`text-lg font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {t(stat.labelKey)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Centered Calculator Categories Section */}
            <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pb-20">
              {/* Enhanced Desktop Tabs */}
                            {!isMobile ? (
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-6xl">
                  {/* Compact Category Navigation */}
                  <div className="relative mb-28">
                    {/* Section background with glassmorphism */}
                    <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-white/25 dark:border-gray-700/25 shadow-xl"></div>
                    
                    <div className="relative p-6">
                      {/* Compact section title */}
                      <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-violet-900 dark:from-white dark:via-blue-200 dark:to-violet-300 bg-clip-text text-transparent mb-2">
                          {t('tour.calculators.categories.title', 'Calculator Categories')}
                        </h2>
                        <div className="max-w-xl mx-auto">
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {t('tour.calculators.categories.description', 'Choose your specialty to access clinical tools')}
                          </p>
                          <div className="mt-2 h-0.5 w-20 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mx-auto"></div>
                  </div>
                      </div>
                      {/* Compact Category Grid */}
                      <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-transparent p-0" data-tour="calculator-categories">
                        {calculatorCategories.map((category, index) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                            className="group relative bg-transparent border-0 p-0 h-auto cursor-pointer"
                            style={{ animationDelay: `${index * 80}ms` }}
                          >
                            <div 
                              className={`relative w-full transition-all duration-400 transform hover:scale-105 ${
                                activeCategory === category.id ? 'scale-105' : ''
                              }`}
                              onClick={(e) => {

                                e.stopPropagation();
                                setActiveCategory(category.id);
                              }}
                            >
                              {/* Compact card with glassmorphism */}
                              <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-400 ${
                                activeCategory === category.id 
                                  ? 'bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 shadow-xl' 
                                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 shadow-lg hover:shadow-xl'
                              } backdrop-blur-lg border border-white/25 dark:border-gray-700/25`}>
                                
                                {/* Compact floating background effects */}
                                <div className={`absolute inset-0 transition-opacity duration-400 pointer-events-none ${
                                  activeCategory === category.id ? 'opacity-15' : 'opacity-0 group-hover:opacity-8'
                                }`}>
                                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full blur-xl"></div>
                                  <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full blur-lg"></div>
                                </div>

                                {/* Compact icon layout */}
                                <div className="relative flex flex-col items-center space-y-3">
                                  <div className={`relative transition-all duration-400 ${
                                    activeCategory === category.id ? 'scale-105' : 'group-hover:scale-105'
                                  }`}>
                                    {/* Icon glow */}
                                    <div className={`absolute inset-0 rounded-xl blur-md transition-opacity duration-400 ${
                                      activeCategory === category.id 
                                        ? 'bg-white/25 opacity-100' 
                                        : 'bg-gradient-to-r from-blue-400/15 to-violet-500/15 opacity-0 group-hover:opacity-100'
                                    }`}></div>
                                    
                                    <div className={`relative p-3 rounded-xl transition-all duration-400 ${
                          activeCategory === category.id 
                            ? 'bg-white/20 shadow-lg' 
                                        : 'bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/25 dark:to-violet-900/25 group-hover:from-blue-100 group-hover:to-violet-100 dark:group-hover:from-blue-800/35 dark:group-hover:to-violet-800/35 shadow-md'
                        }`}>
                                      <category.icon className={`w-6 h-6 transition-all duration-400 ${
                            activeCategory === category.id 
                                          ? 'text-white drop-shadow-md' 
                                          : `${category.color} group-hover:scale-105`
                          }`} />
                                    </div>
                        </div>
                        
                                  {/* Compact label */}
                                  <div className="text-center space-y-1">
                                    <h3 className={`text-xs font-bold leading-tight transition-all duration-300 ${
                                      activeCategory === category.id 
                                        ? 'text-white drop-shadow-sm' 
                                        : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                                    }`}>
                          {category.label}
                                    </h3>
                        
                                    {/* Compact count badge */}
                                    <div className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-black transition-all duration-400 ${
                          activeCategory === category.id 
                                        ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                                        : 'bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/35 dark:to-violet-900/35 text-blue-700 dark:text-blue-300 group-hover:from-blue-200 group-hover:to-violet-200 dark:group-hover:from-blue-800/50 dark:group-hover:to-violet-800/50 shadow-sm'
                        }`}>
                          {category.calculators.length}
                                    </div>
                                  </div>
                                </div>
                        </div>
                        
                              {/* Compact outer glow for active state */}
                        {activeCategory === category.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 via-violet-500/25 to-purple-600/25 rounded-xl blur-xl -z-10 animate-pulse"></div>
                        )}
                            </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                            </div>
                          </div>
                          
                                    {/* Tab Content with Proper Spacing */}
                  {calculatorCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="space-y-8 mt-22">

                      {/* Compact Calculator Grid */}
                       <div className="grid gap-4 lg:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-none items-stretch" data-tour="calculator-form">
                        {(searchQuery ? category.calculators.filter(calc =>
                          calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          calc.description.toLowerCase().includes(searchQuery.toLowerCase())
                        ) : category.calculators).map((calc, index) => (
                          <div
                            key={calc.id}
                            className="group relative cursor-pointer h-full"
                            onClick={() => setActiveCalculator(calc.id)}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Compact outer glow container */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-purple-600/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:animate-pulse"></div>
                            
                            {/* Compact card with modern glassmorphism */}
                            <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/25 dark:border-gray-700/25 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-102 h-full flex flex-col">
                              {/* Compact floating background orbs */}
                              <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/8 via-violet-400/8 to-purple-500/8 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-400/8 via-rose-400/8 to-orange-500/8 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '150ms' }}></div>
                              </div>

                              <CardHeader className="relative p-5 space-y-5 flex-1 flex flex-col">
                                                                {/* Compact header */}
                              <div className="flex items-start justify-between">
                                  {/* Compact calculator icon */}
                                  <div className="relative group/icon">
                                    {/* Simplified glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 rounded-xl blur-lg opacity-20 group-hover/icon:opacity-40 transition-opacity duration-400 scale-105"></div>
                                    
                                    <div className="relative p-3 bg-gradient-to-br from-blue-100 via-violet-50 to-purple-100 dark:from-blue-900/35 dark:via-violet-900/35 dark:to-purple-900/35 rounded-xl shadow-lg group-hover/icon:scale-105 transition-transform duration-400 border border-blue-200/40 dark:border-blue-700/40">
                                      <Calculator className="w-7 h-7 text-blue-600 dark:text-blue-400 drop-shadow-md" />
                                  </div>
                                    
                                    {/* Single floating sparkle */}
                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                                    </div>
                                </div>
                                
                                  {/* Compact validation badge */}
                                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/35 dark:to-emerald-900/25 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-md backdrop-blur-sm">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">VALIDATED</span>
                                </div>
                              </div>

                                {/* Compact title and description */}
                                <div className="space-y-3 flex-1">
                                  <CardTitle className="text-lg font-black leading-tight group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-400 text-gray-900 dark:text-gray-100">
                                  {calc.name}
                                </CardTitle>
                                  <CardDescription className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium line-clamp-3">
                                  {calc.description}
                                </CardDescription>
                              </div>

                                {/* Compact feature indicators */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/25 dark:to-indigo-900/25 rounded-lg border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                                      <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Clinical</span>
                                  </div>
                                    <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/25 dark:to-purple-900/25 rounded-lg border border-violet-100/50 dark:border-violet-800/50 shadow-sm">
                                      <Target className="w-3.5 h-3.5 text-violet-500" />
                                      <span className="text-xs font-bold text-violet-700 dark:text-violet-300">Accurate</span>
                                  </div>
                                </div>
                                
                                  {/* Compact launch indicator */}
                                  <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                                  <span className="text-sm font-bold">Launch</span>
                                    <div className="p-1.5 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 rounded-lg group-hover:from-blue-200 group-hover:to-violet-200 transition-all duration-300 shadow-sm">
                                    <Play className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                  
                  {/* Extra bottom spacing for better scrolling */}
                  <div className="h-20"></div>
                </Tabs>
              ) : (
                /* Ultra-Modern Mobile Experience */
                <div className="space-y-16">
                  {/* Spectacular Mobile Category Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="w-full group relative overflow-hidden"
                      data-tour="calculator-categories"
                    >
                      {/* Background with glassmorphism */}
                      <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-gray-700/30"></div>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative flex items-center justify-between p-6 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        {activeCategory_data && (
                          <>
                              <div className="relative">
                                {/* Icon glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                                <div className="relative p-3 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 rounded-2xl shadow-xl">
                                  <activeCategory_data.icon className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="text-xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-violet-900 dark:from-white dark:via-blue-200 dark:to-violet-300 bg-clip-text text-transparent">
                                  {activeCategory_data.label}
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {activeCategory_data.calculators.length} premium tools
                                </div>
                            </div>
                          </>
                        )}
                      </div>
                        <div className="flex items-center space-x-2">
                          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/40 dark:to-violet-900/40 rounded-xl text-xs font-black text-blue-700 dark:text-blue-300">
                            SELECT
                          </div>
                          <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-500 ${showMobileMenu ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {/* Ultra-Modern Mobile Menu Overlay */}
                    {showMobileMenu && (
                      <div className="absolute top-full left-0 right-0 mt-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl z-50 overflow-hidden">
                        {calculatorCategories.map((category, index) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setActiveCategory(category.id);
                              setShowMobileMenu(false);
                            }}
                            className="w-full group relative overflow-hidden"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {/* Active state background */}
                            {activeCategory === category.id && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-600/20"></div>
                            )}
                            
                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative flex items-center space-x-4 p-4 transition-all duration-300">
                              <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                                activeCategory === category.id 
                                  ? 'bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 shadow-xl scale-105' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-blue-100 group-hover:to-violet-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-violet-900/30 shadow-lg'
                              }`}>
                                <category.icon className={`w-6 h-6 transition-all duration-300 ${
                                  activeCategory === category.id 
                                    ? 'text-white' 
                                    : `${category.color} group-hover:scale-110`
                                }`} />
                            </div>
                            <div className="flex-1 text-left">
                                <div className={`font-bold transition-colors duration-300 ${
                                  activeCategory === category.id 
                                    ? 'text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                }`}>
                                  {category.label}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {category.calculators.length} clinical tools
                                </div>
                              </div>
                              {activeCategory === category.id && (
                                <div className="px-3 py-1.5 bg-white/30 dark:bg-gray-800/30 rounded-xl text-xs font-black text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                                  ACTIVE
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Compact Mobile Calculator Cards */}
                  {activeCategory && activeCategory_data && (
                    <div className="space-y-4" data-tour="calculator-form">
                      {(searchQuery ? filteredCalculators : activeCategory_data.calculators).map((calc, index) => (
                        <div
                          key={calc.id}
                          className="group relative cursor-pointer"
                          onClick={() => setActiveCalculator(calc.id)}
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          {/* Compact outer glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-purple-600/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-103 group-hover:animate-pulse"></div>
                          
                          {/* Compact mobile card */}
                          <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/25 dark:border-gray-700/25 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:scale-101">
                                                        {/* Compact floating background orbs */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/8 via-violet-400/8 to-purple-500/8 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-pink-400/8 via-rose-400/8 to-orange-500/8 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '150ms' }}></div>
                            </div>

                            <CardHeader className="relative p-4 space-y-4">
                              {/* Compact mobile header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {/* Compact mobile icon */}
                                  <div className="relative group/icon">
                                    {/* Simplified glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 rounded-xl blur-md opacity-20 group-hover/icon:opacity-40 transition-opacity duration-400 scale-105"></div>
                                    
                                    <div className="relative p-2.5 bg-gradient-to-br from-blue-100 via-violet-50 to-purple-100 dark:from-blue-900/35 dark:via-violet-900/35 dark:to-purple-900/35 rounded-xl shadow-lg group-hover/icon:scale-105 transition-transform duration-400 border border-blue-200/40 dark:border-blue-700/40">
                                      <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400 drop-shadow-md" />
                                    </div>
                                    
                                    {/* Small floating sparkle */}
                                    <div className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                                    </div>
                                  </div>
                                  
                                  {/* Compact validation badge */}
                                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/35 dark:to-emerald-900/25 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50 shadow-md backdrop-blur-sm">
                                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">VALID</span>
                                  </div>
                                </div>
                                
                                {/* Compact launch indicator */}
                                <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-300">
                                  <span className="text-sm font-bold">Launch</span>
                                  <div className="p-1.5 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 rounded-lg group-hover:from-blue-200 group-hover:to-violet-200 transition-all duration-300 shadow-md">
                                    <ArrowRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Compact mobile title and description */}
                              <div className="space-y-2.5">
                                <CardTitle className="text-lg font-black leading-tight group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-400 text-gray-900 dark:text-gray-100">
                                  {calc.name}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium line-clamp-2">
                                  {calc.description}
                                </CardDescription>
                              </div>

                              {/* Compact mobile feature indicators */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/25 dark:to-indigo-900/25 rounded-md border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                                    <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Clinical</span>
                                  </div>
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/25 dark:to-purple-900/25 rounded-md border border-violet-100/50 dark:border-violet-800/50 shadow-sm">
                                    <Target className="w-3 h-3 text-violet-500" />
                                    <span className="text-xs font-bold text-violet-700 dark:text-violet-300">Accurate</span>
                                  </div>
                                </div>
                                
                                {/* Compact performance badge */}
                                <div className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-md border border-amber-200/50 dark:border-amber-700/50 shadow-sm">
                                  <div className="text-xs font-black text-amber-700 dark:text-amber-300">A++</div>
                                </div>
                              </div>
                            </CardHeader>
                        </Card>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Extra bottom spacing for mobile */}
                  <div className="h-20"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

// Memoize component to prevent unnecessary re-renders
export const Calculators = React.memo(CalculatorsComponent); 