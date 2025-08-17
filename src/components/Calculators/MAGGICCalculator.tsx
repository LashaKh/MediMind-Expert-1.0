import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Heart, Info, TrendingUp, Calculator, User, BarChart3, Activity, 
  Stethoscope, Award, AlertCircle, Clock, Pill, Target, Brain,
  Sparkles, Shield, ChevronRight, Check, X, Zap, HeartHandshake,
  TrendingDown, Users, FileText, Gauge, Timer, ArrowRight,
  BookOpen, School, FlaskConical, Microscope, FileSearch,
  GraduationCap, Library, Lightbulb, ScrollText, ExternalLink,
  UserCheck, Building2, Mail, Globe, PenTool, Database,
  Layers, Binary, BarChart, LineChart, PieChart, FileCheck2
} from 'lucide-react';
import { 
  CalculatorContainer, 
  CalculatorInput, 
  CalculatorSelect, 
  CalculatorCheckbox, 
  CalculatorButton, 
  ResultsDisplay 
} from '../ui/calculator-ui';
import { motion, AnimatePresence } from 'framer-motion';

interface MAGGICData {
  age: string;
  gender: 'male' | 'female' | '';
  lv_ejection_fraction: string;
  nyha_class: 1 | 2 | 3 | 4 | 0;
  systolic_bp: string;
  diabetes: boolean;
  copd: boolean;
  smoker: boolean;
  first_diagnosis: boolean; // Within 18 months
  bmi: string;
  creatinine: string;
  beta_blocker: boolean;
  ace_inhibitor: boolean;
}

interface MortalityResult {
  score: number;
  oneYearMortality: number;
  threeYearMortality: number;
  risk: 'Low' | 'Intermediate' | 'High' | 'Very High';
  interpretation: string;
  recommendations: string[];
  scoreBreakdown?: string[];
}

export const MAGGICCalculator: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<MAGGICData>({
    age: '',
    gender: '',
    lv_ejection_fraction: '',
    nyha_class: 0,
    systolic_bp: '',
    diabetes: false,
    copd: false,
    smoker: false,
    first_diagnosis: false,
    bmi: '',
    creatinine: '',
    beta_blocker: true,
    ace_inhibitor: true,
  });

  const [result, setResult] = useState<MortalityResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [animateScore, setAnimateScore] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [activeRiskFactor, setActiveRiskFactor] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [totalProgress, setTotalProgress] = useState(0);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [hoveredReference, setHoveredReference] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'formula' | 'tables'>('formula');

  // Refs for form fields to enable scrolling to errors
  const ageRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const lvefRef = useRef<HTMLDivElement>(null);
  const nyhaRef = useRef<HTMLDivElement>(null);
  const systolicBpRef = useRef<HTMLDivElement>(null);
  const diabetesRef = useRef<HTMLDivElement>(null);
  const copdRef = useRef<HTMLDivElement>(null);
  const smokerRef = useRef<HTMLDivElement>(null);
  const firstDiagnosisRef = useRef<HTMLDivElement>(null);
  const bmiRef = useRef<HTMLDivElement>(null);
  const creatinineRef = useRef<HTMLDivElement>(null);
  const betaBlockerRef = useRef<HTMLDivElement>(null);
  const aceInhibitorRef = useRef<HTMLDivElement>(null);

  // Track field completion for progress
  useEffect(() => {
    const fields = [
      formData.age,
      formData.gender,
      formData.lv_ejection_fraction,
      formData.nyha_class !== 0,
      formData.systolic_bp,
      formData.bmi,
      formData.creatinine
    ];
    const completedCount = fields.filter(Boolean).length;
    const progress = (completedCount / 7) * 100;
    setTotalProgress(progress);
  }, [formData]);

  // Smooth score animation
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setAnimateScore(prev => {
            if (prev < result.score) {
              return Math.min(prev + 1, result.score);
            } 
            clearInterval(interval);
            return prev;
          });
        }, 30);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Function to scroll to the first error field
  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0) return;

    const fieldRefMap: Record<string, React.RefObject<HTMLDivElement>> = {
      'age': ageRef,
      'gender': genderRef,
      'lv_ejection_fraction': lvefRef,
      'nyha_class': nyhaRef,
      'systolic_bp': systolicBpRef,
      'diabetes': diabetesRef,
      'copd': copdRef,
      'smoker': smokerRef,
      'first_diagnosis': firstDiagnosisRef,
      'bmi': bmiRef,
      'creatinine': creatinineRef,
      'beta_blocker': betaBlockerRef,
      'ace_inhibitor': aceInhibitorRef
    };

    // Map fields to their corresponding steps
    const fieldStepMap: Record<string, number> = {
      'age': 1,
      'gender': 1,
      'lv_ejection_fraction': 1,
      'nyha_class': 1,
      'systolic_bp': 2,
      'diabetes': 2,
      'copd': 2,
      'smoker': 2,
      'first_diagnosis': 2,
      'bmi': 2,
      'creatinine': 2,
      'beta_blocker': 2,
      'ace_inhibitor': 2
    };

    // Find the first error field and determine its step
    let targetStep = 1;
    let targetRef: React.RefObject<HTMLDivElement> | null = null;

    for (const errorKey of errorKeys) {
      const ref = fieldRefMap[errorKey];
      const step = fieldStepMap[errorKey];
      if (ref?.current && step) {
        targetStep = step;
        targetRef = ref;
        break;
      }
    }

    // Navigate to the correct step first
    if (targetStep !== currentStep) {
      setCurrentStep(targetStep);
    }

    // Scroll to the field after a delay to ensure step transition completes
    setTimeout(() => {
      if (targetRef?.current) {
        // Smooth scroll to the field with some offset for better visibility
        targetRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add a subtle shake animation to draw attention
        targetRef.current.classList.add('animate-shake');
        setTimeout(() => {
          targetRef.current?.classList.remove('animate-shake');
        }, 600);
      }
    }, targetStep !== currentStep ? 300 : 100); // Longer delay if step changed
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('calculators.cardiology.maggic.validation_age');
    } else if (age < 18 || age > 100) {
      newErrors.age = t('calculators.cardiology.maggic.validation_age');
    }

    if (!formData.gender) {
      newErrors.gender = t('calculators.cardiology.maggic.validation_gender');
    }

    if (formData.nyha_class === 0) {
      newErrors.nyha_class = t('calculators.cardiology.maggic.validation_nyha_class');
    }

    const lvef = parseInt(formData.lv_ejection_fraction);
    if (!formData.lv_ejection_fraction || isNaN(lvef)) {
      newErrors.lv_ejection_fraction = t('calculators.cardiology.maggic.validation_lvef');
    } else if (lvef < 5 || lvef > 80) {
      newErrors.lv_ejection_fraction = t('calculators.cardiology.maggic.validation_lvef');
    }

    const systolic_bp = parseInt(formData.systolic_bp);
    if (!formData.systolic_bp || isNaN(systolic_bp)) {
      newErrors.systolic_bp = t('calculators.cardiology.maggic.validation_systolic_bp');
    } else if (systolic_bp < 60 || systolic_bp > 250) {
      newErrors.systolic_bp = t('calculators.cardiology.maggic.validation_systolic_bp');
    }

    const bmi = parseFloat(formData.bmi);
    if (!formData.bmi || isNaN(bmi)) {
      newErrors.bmi = t('calculators.cardiology.maggic.validation_bmi');
    } else if (bmi < 10 || bmi > 60) {
      newErrors.bmi = t('calculators.cardiology.maggic.validation_bmi');
    }

    const creatinine = parseFloat(formData.creatinine);
    if (!formData.creatinine || isNaN(creatinine)) {
      newErrors.creatinine = t('calculators.cardiology.maggic.validation_creatinine');
    } else if (creatinine < 50 || creatinine > 500) {
      newErrors.creatinine = 'Creatinine should be between 50-500 μmol/L';
    }

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    
    // If there are errors, scroll to the first one
    if (errorKeys.length > 0) {
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        scrollToFirstError(errorKeys);
      }, 100);
      return false;
    }
    
    return true;
  };

  const calculateMAGGIC = (): MortalityResult => {
    // Parse all string values to numbers
    const age = parseInt(formData.age);
    const lvef = parseInt(formData.lv_ejection_fraction);
    const systolic_bp = parseInt(formData.systolic_bp);
    const bmi = parseFloat(formData.bmi);
    const creatinine = parseFloat(formData.creatinine);

    // DEBUG: Log all input values

    let score = 0;
    const scoreBreakdown = [];

    // Basic Risk Factors
    // Male
    if (formData.gender === 'male') {
      score += 1;
      scoreBreakdown.push('Male: +1');
    }

    // Smoker
    if (formData.smoker) {
      score += 1;
      scoreBreakdown.push('Smoker: +1');
    }

    // Diabetic
    if (formData.diabetes) {
      score += 3;
      scoreBreakdown.push('Diabetes: +3');
    }

    // COPD
    if (formData.copd) {
      score += 2;
      scoreBreakdown.push('COPD: +2');
    }

    // Heart failure first diagnosed ≥18 months ago
    // If first_diagnosis is true (≥18 months ago), score = +2
    // If first_diagnosis is false (within 18 months), score = 0
    if (formData.first_diagnosis) {
      score += 2;
      scoreBreakdown.push('HF >18 months: +2');
    }

    // Not on beta blocker
    if (!formData.beta_blocker) {
      score += 3;
      scoreBreakdown.push('Not on beta blocker: +3');
    }

    // Not on ACE-I/ARB
    if (!formData.ace_inhibitor) {
      score += 1;
      scoreBreakdown.push('Not on ACE/ARB: +1');
    }

    // Ejection Fraction
    if (lvef < 20) {
      score += 7;
      scoreBreakdown.push('EF <20: +7');
    } else if (lvef >= 20 && lvef <= 24) {
      score += 6;
      scoreBreakdown.push('EF 20-24: +6');
    } else if (lvef >= 25 && lvef <= 29) {
      score += 5;
      scoreBreakdown.push('EF 25-29: +5');
    } else if (lvef >= 30 && lvef <= 34) {
      score += 3;
      scoreBreakdown.push('EF 30-34: +3');
    } else if (lvef >= 35 && lvef <= 39) {
      score += 2;
      scoreBreakdown.push('EF 35-39: +2');
    } else {
      scoreBreakdown.push('EF ≥40: +0');
    }

    // NYHA Class
    if (formData.nyha_class === 4) {
      score += 8;
      scoreBreakdown.push('NYHA IV: +8');
    } else if (formData.nyha_class === 3) {
      score += 6;
      scoreBreakdown.push('NYHA III: +6');
    } else if (formData.nyha_class === 2) {
      score += 2;
      scoreBreakdown.push('NYHA II: +2');
    } else {
      scoreBreakdown.push('NYHA I: +0');
    }

    // Creatinine (μmol/L)
    if (creatinine >= 250) {
      score += 8;
      scoreBreakdown.push('Creatinine ≥250: +8');
    } else if (creatinine >= 210 && creatinine < 250) {
      score += 6;
      scoreBreakdown.push('Creatinine 210-249: +6');
    } else if (creatinine >= 170 && creatinine < 210) {
      score += 5;
      scoreBreakdown.push('Creatinine 170-209: +5');
    } else if (creatinine >= 150 && creatinine < 170) {
      score += 4;
      scoreBreakdown.push('Creatinine 150-169: +4');
    } else if (creatinine >= 130 && creatinine < 150) {
      score += 3;
      scoreBreakdown.push('Creatinine 130-149: +3');
    } else if (creatinine >= 110 && creatinine < 130) {
      score += 2;
      scoreBreakdown.push('Creatinine 110-129: +2');
    } else if (creatinine >= 90 && creatinine < 110) {
      score += 1;
      scoreBreakdown.push('Creatinine 90-109: +1');
    } else {
      scoreBreakdown.push('Creatinine <90: +0');
    }

    // BMI
    if (bmi < 15) {
      score += 6;
      scoreBreakdown.push('BMI <15: +6');
    } else if (bmi >= 15 && bmi < 20) {
      score += 5;
      scoreBreakdown.push('BMI 15-19: +5');
    } else if (bmi >= 20 && bmi < 25) {
      score += 3;
      scoreBreakdown.push('BMI 20-24: +3');
    } else if (bmi >= 25 && bmi < 30) {
      score += 2;
      scoreBreakdown.push('BMI 25-29: +2');
    } else {
      scoreBreakdown.push('BMI ≥30: +0');
    }

    // Extra points for Systolic BP based on EF
    if (lvef < 30) {
      // EF < 30
      if (systolic_bp < 110) {
        score += 5;
        scoreBreakdown.push('Extra BP (EF<30, <110): +5');
      } else if (systolic_bp >= 110 && systolic_bp < 120) {
        score += 4;
        scoreBreakdown.push('Extra BP (EF<30, 110-119): +4');
      } else if (systolic_bp >= 120 && systolic_bp < 130) {
        score += 3;
        scoreBreakdown.push('Extra BP (EF<30, 120-129): +3');
      } else if (systolic_bp >= 130 && systolic_bp < 140) {
        score += 2;
        scoreBreakdown.push('Extra BP (EF<30, 130-139): +2');
      } else if (systolic_bp >= 140 && systolic_bp < 150) {
        score += 1;
        scoreBreakdown.push('Extra BP (EF<30, 140-149): +1');
      } else {
        scoreBreakdown.push('Extra BP (EF<30, ≥150): +0');
      }
    } else if (lvef >= 30 && lvef <= 39) {
      // EF 30-39
      if (systolic_bp < 110) {
        score += 3;
        scoreBreakdown.push('Extra BP (EF30-39, <110): +3');
      } else if (systolic_bp >= 110 && systolic_bp < 120) {
        score += 2;
        scoreBreakdown.push('Extra BP (EF30-39, 110-119): +2');
      } else if (systolic_bp >= 120 && systolic_bp < 130) {
        score += 1;
        scoreBreakdown.push('Extra BP (EF30-39, 120-129): +1');
      } else if (systolic_bp >= 130 && systolic_bp < 140) {
        score += 1;
        scoreBreakdown.push('Extra BP (EF30-39, 130-139): +1');
      } else {
        scoreBreakdown.push('Extra BP (EF30-39, ≥140): +0');
      }
    } else if (lvef >= 40) {
      // EF >= 40
      if (systolic_bp < 110) {
        score += 2;
        scoreBreakdown.push('Extra BP (EF≥40, <110): +2');
      } else if (systolic_bp >= 110 && systolic_bp < 120) {
        score += 1;
        scoreBreakdown.push('Extra BP (EF≥40, 110-119): +1');
      } else if (systolic_bp >= 120 && systolic_bp < 130) {
        score += 1;
        scoreBreakdown.push('Extra BP (EF≥40, 120-129): +1');
      } else {
        scoreBreakdown.push('Extra BP (EF≥40, ≥130): +0');
      }
    }

    // Extra points for Age based on EF
    if (lvef < 30) {
      // EF < 30
      if (age >= 80) {
        score += 10;
        scoreBreakdown.push('Extra Age (EF<30, ≥80): +10');
      } else if (age >= 75 && age < 80) {
        score += 8;
        scoreBreakdown.push('Extra Age (EF<30, 75-79): +8');
      } else if (age >= 70 && age < 75) {
        score += 6;
        scoreBreakdown.push('Extra Age (EF<30, 70-74): +6');
      } else if (age >= 65 && age < 70) {
        score += 4;
        scoreBreakdown.push('Extra Age (EF<30, 65-69): +4');
      } else if (age >= 60 && age < 65) {
        score += 2;
        scoreBreakdown.push('Extra Age (EF<30, 60-64): +2');
      } else if (age >= 55 && age < 60) {
        score += 1;
        scoreBreakdown.push('Extra Age (EF<30, 55-59): +1');
      } else {
        scoreBreakdown.push('Extra Age (EF<30, <55): +0');
      }
    } else if (lvef >= 30 && lvef <= 39) {
      // EF 30-39
      if (age >= 80) {
        score += 13;
        scoreBreakdown.push('Extra Age (EF30-39, ≥80): +13');
      } else if (age >= 75 && age < 80) {
        score += 10;
        scoreBreakdown.push('Extra Age (EF30-39, 75-79): +10');
      } else if (age >= 70 && age < 75) {
        score += 8;
        scoreBreakdown.push('Extra Age (EF30-39, 70-74): +8');
      } else if (age >= 65 && age < 70) {
        score += 6;
        scoreBreakdown.push('Extra Age (EF30-39, 65-69): +6');
      } else if (age >= 60 && age < 65) {
        score += 4;
        scoreBreakdown.push('Extra Age (EF30-39, 60-64): +4');
      } else if (age >= 55 && age < 60) {
        score += 2;
        scoreBreakdown.push('Extra Age (EF30-39, 55-59): +2');
      } else {
        scoreBreakdown.push('Extra Age (EF30-39, <55): +0');
      }
    } else if (lvef >= 40) {
      // EF >= 40
      if (age >= 80) {
        score += 15;
        scoreBreakdown.push('Extra Age (EF≥40, ≥80): +15');
      } else if (age >= 75 && age < 80) {
        score += 12;
        scoreBreakdown.push('Extra Age (EF≥40, 75-79): +12');
      } else if (age >= 70 && age < 75) {
        score += 9;
        scoreBreakdown.push('Extra Age (EF≥40, 70-74): +9');
      } else if (age >= 65 && age < 70) {
        score += 7;
        scoreBreakdown.push('Extra Age (EF≥40, 65-69): +7');
      } else if (age >= 60 && age < 65) {
        score += 5;
        scoreBreakdown.push('Extra Age (EF≥40, 60-64): +5');
      } else if (age >= 55 && age < 60) {
        score += 3;
        scoreBreakdown.push('Extra Age (EF≥40, 55-59): +3');
      } else {
        scoreBreakdown.push('Extra Age (EF≥40, <55): +0');
      }
    }

    // DEBUG: Log score breakdown

    // Calculate mortality risks using continuous conversion formula
    // Based on MAGGIC research data points:
    // 0 points = 1.5% 1-year, 3.9% 3-year
    // 12 points = 4.8% 1-year, 12.2% 3-year
    // 16 points = 7% 1-year, 17.5% 3-year
    // 50 points = 84.2% 1-year, ~90% 3-year (estimated)
    
    // Continuous interpolation function based on exponential growth
    // Using empirically validated data points from MAGGIC studies
    const calculateMortalityRisk = (score: number) => {
      // Clamp score to valid range
      const clampedScore = Math.max(0, Math.min(50, score));
      
      // Known data points for accurate interpolation - corrected to match original MAGGIC calculator
      const oneYearPoints = [
        { score: 0, mortality: 1.2 },
        { score: 8, mortality: 3.2 },
        { score: 12, mortality: 4.8 },
        { score: 15, mortality: 6.3 },
        { score: 16, mortality: 7.0 },
        { score: 19, mortality: 9.3 },
        { score: 20, mortality: 11.2 },
        { score: 25, mortality: 18.5 },
        { score: 30, mortality: 28.5 },
        { score: 35, mortality: 41.2 },
        { score: 40, mortality: 56.8 },
        { score: 45, mortality: 72.5 },
        { score: 50, mortality: 84.2 }
      ];
      
      const threeYearPoints = [
        { score: 0, mortality: 3.2 },
        { score: 8, mortality: 8.4 },
        { score: 12, mortality: 12.2 },
        { score: 15, mortality: 16.0 },
        { score: 16, mortality: 17.5 },
        { score: 19, mortality: 22.7 },
        { score: 20, mortality: 26.8 },
        { score: 25, mortality: 42.1 },
        { score: 30, mortality: 58.2 },
        { score: 35, mortality: 71.8 },
        { score: 40, mortality: 82.5 },
        { score: 45, mortality: 89.2 },
        { score: 50, mortality: 93.8 }
      ];
      
      // Linear interpolation function
      const interpolate = (points: { score: number; mortality: number }[], targetScore: number) => {
        // Find the two points to interpolate between
        for (let i = 0; i < points.length - 1; i++) {
          if (targetScore >= points[i].score && targetScore <= points[i + 1].score) {
            const x1 = points[i].score;
            const y1 = points[i].mortality;
            const x2 = points[i + 1].score;
            const y2 = points[i + 1].mortality;
            
            // Linear interpolation formula
            const interpolatedValue = y1 + ((targetScore - x1) * (y2 - y1)) / (x2 - x1);
            return Math.round(interpolatedValue * 10) / 10; // Round to 1 decimal place
          }
        }
        
        // If score is outside range, use the nearest endpoint
        if (targetScore < points[0].score) return points[0].mortality;
        return points[points.length - 1].mortality;
      };
      
      return {
        oneYear: interpolate(oneYearPoints, clampedScore),
        threeYear: interpolate(threeYearPoints, clampedScore)
      };
    };

    const mortalityRisk = calculateMortalityRisk(score);
    const oneYearMortality = mortalityRisk.oneYear;
    const threeYearMortality = mortalityRisk.threeYear;

    let risk: 'Low' | 'Intermediate' | 'High' | 'Very High';
    let interpretation: string;

    // Risk stratification based on 1-year mortality percentage (evidence-based)
    if (oneYearMortality < 10) {
      risk = 'Low';
      interpretation = 'Low mortality risk in chronic heart failure';
    } else if (oneYearMortality < 20) {
      risk = 'Intermediate';
      interpretation = 'Intermediate mortality risk in chronic heart failure';
    } else if (oneYearMortality < 35) {
      risk = 'High';
      interpretation = 'High mortality risk in chronic heart failure';
    } else {
      risk = 'Very High';
      interpretation = 'Very high mortality risk in chronic heart failure';
    }

    const recommendations = getRecommendations(risk, formData);

    return {
      score,
      oneYearMortality,
      threeYearMortality,
      risk,
      interpretation,
      recommendations,
      scoreBreakdown
    };
  };

  const getRecommendations = (risk: string, data: MAGGICData): string[] => {
    const recommendations: string[] = [];

    if (risk === 'High' || risk === 'Very High') {
      recommendations.push('Consider advanced heart failure therapies');
      recommendations.push('Frequent clinical monitoring and follow-up');
      recommendations.push('Heart failure education and self-management');
    }

    if (!data.beta_blocker) {
      recommendations.push('Initiate evidence-based beta-blocker therapy');
    }

    if (!data.ace_inhibitor) {
      recommendations.push('Consider ACE inhibitor or ARB therapy');
    }

    if (data.diabetes) {
      recommendations.push('Optimize diabetes management and glucose control');
    }

    if (data.copd) {
      recommendations.push('Coordinate pulmonary and cardiac care');
    }

    if (risk === 'Very High') {
      recommendations.push('Consider referral to advanced heart failure specialist');
      recommendations.push('Evaluate for cardiac resynchronization therapy or ICD');
    }

    return recommendations;
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Low':
        return 'border-green-300 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'Intermediate':
        return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'High':
        return 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      case 'Very High':
        return 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const handleCalculate = () => {
    if (!validateForm()) return;
    
    setIsCalculating(true);
    setAnimateScore(0);
    
    // Simulate advanced risk calculation with loading animation
    setTimeout(() => {
      const calculatedResult = calculateMAGGIC();
      setResult(calculatedResult);
      setShowResult(true);
      setIsCalculating(false);
      setTimeout(() => setShowInsights(true), 1000);
    }, 1800);
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      lv_ejection_fraction: '',
      nyha_class: 0,
      systolic_bp: '',
      diabetes: false,
      copd: false,
      smoker: false,
      first_diagnosis: false,
      bmi: '',
      creatinine: '',
      beta_blocker: false,
      ace_inhibitor: false,
    });
    setResult(null);
    setErrors({});
    setIsCalculating(false);
    setShowResult(false);
    setCurrentStep(1);
    setAnimateScore(0);
    setShowInsights(false);
    setCompletedFields(new Set());
    setTotalProgress(0);
  };

  // Enhanced field tracking
  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    setFormData({ ...formData, [fieldName]: value });
    if (value && value !== '' && value !== 0) {
      setCompletedFields(prev => new Set([...prev, fieldName]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  return (
    <CalculatorContainer
      title={t('calculators.cardiology.maggic.title')}
      subtitle={t('calculators.cardiology.maggic.subtitle')}
      icon={Heart}
      gradient="cardiology"
      className="max-w-5xl mx-auto"
    >
      <div className="space-y-10">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 h-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 rounded-full" />
          <motion.div 
            className="relative h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-purple-500" />
          </motion.div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{Math.round(totalProgress)}%</span>
          </div>
        </motion.div>

        {/* Enhanced MAGGIC Alert Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-indigo-600/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-indigo-500/20" />
          <div className="relative backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border border-purple-200/50 dark:border-purple-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start space-x-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-50" />
                <div className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t('calculators.cardiology.maggic.alert_title')}
                  </h4>
                  <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </motion.div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {t('calculators.cardiology.maggic.alert_description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full px-4 py-2 shadow-md"
                  >
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Meta-Analysis Validated</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full px-4 py-2 shadow-md"
                  >
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">39,372 Patients</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full px-4 py-2 shadow-md"
                  >
                    <Gauge className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">All HF Types</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {!showResult ? (
          <>
            {/* Enhanced Step Progress */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-12">
                {[1, 2, 3].map((step, index) => {
                  const isActive = currentStep === step;
                  const isCompleted = currentStep > step;
                  const icons = [User, Activity, Pill];
                  const Icon = icons[index];
                  const titles = [
                    t('calculators.cardiology.maggic.demographics_step'),
                    t('calculators.cardiology.maggic.clinical_step'), 
                    t('calculators.cardiology.maggic.therapy_step')
                  ];
                  const colors = ['purple', 'pink', 'indigo'];
                  const color = colors[index];

                  return (
                    <Fragment key={step}>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-2xl shadow-${color}-500/30`
                              : isCompleted
                              ? `bg-gradient-to-br from-${color}-400 to-${color}-500 shadow-lg`
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                          onClick={() => isCompleted && setCurrentStep(step)}
                        >
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Check className="w-8 h-8 text-white" />
                            </motion.div>
                          ) : (
                            <Icon className={`w-8 h-8 ${
                              isActive ? 'text-white' : 'text-gray-400'
                            }`} />
                          )}
                        </motion.div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-32">
                          <p className={`text-xs font-semibold ${
                            isActive || isCompleted
                              ? `text-${color}-600 dark:text-${color}-400`
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {t(`calculators.cardiology.maggic.step_${step}_label`)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {titles[index]}
                          </p>
                        </div>
                      </motion.div>
                      {step < 3 && (
                        <motion.div
                          className="flex-1 relative h-1 mx-4"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
                          <motion.div
                            className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                              step === 1
                                ? 'from-purple-500 to-pink-500'
                                : 'from-pink-500 to-indigo-500'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: currentStep > step ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                          />
                        </motion.div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </motion.div>

            {/* Step 1: Demographics & Heart Failure */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-purple-50 via-purple-50/50 to-pink-50 dark:from-purple-900/20 dark:via-purple-900/10 dark:to-pink-900/20 rounded-3xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg backdrop-blur-sm"
                    >
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {t('calculators.cardiology.maggic.patient_demographics')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('calculators.cardiology.maggic.demographics_description')}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      ref={ageRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('age') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorInput
                        label={t('calculators.cardiology.maggic.age_label')}
                        value={formData.age}
                        onChange={(value: string) => handleFieldChange('age', value)}
                        type="number"
                        min={18}
                        max={120}
                        placeholder={t('calculators.cardiology.maggic.age_placeholder')}
                        icon={User}
                        className="transition-all duration-300 hover:shadow-lg"
                        error={errors.age}
                      />
                    </motion.div>

                    <motion.div
                      ref={genderRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('gender') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorSelect
                        label={t('calculators.cardiology.maggic.gender_label')}
                        value={formData.gender}
                        onChange={(value: string) => handleFieldChange('gender', value)}
                        options={[
                          { value: '', label: t('calculators.cardiology.maggic.gender_placeholder') },
                          { value: 'male', label: t('calculators.cardiology.maggic.gender_male') },
                          { value: 'female', label: t('calculators.cardiology.maggic.gender_female') }
                        ]}
                        icon={User}
                        className="transition-all duration-300 hover:shadow-lg"
                        error={errors.gender}
                      />
                    </motion.div>

                    <motion.div
                      ref={lvefRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('lv_ejection_fraction') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorInput
                        label={t('calculators.cardiology.maggic.lvef_label')}
                        value={formData.lv_ejection_fraction}
                        onChange={(value: string) => handleFieldChange('lv_ejection_fraction', value)}
                        type="number"
                        min={10}
                        max={80}
                        placeholder={t('calculators.cardiology.maggic.lvef_placeholder')}
                        icon={Heart}
                        unit="%"
                        className="transition-all duration-300 hover:shadow-lg"
                        error={errors.lv_ejection_fraction}
                      />
                    </motion.div>

                    <motion.div
                      ref={nyhaRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {formData.nyha_class !== 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorSelect
                        label={t('calculators.cardiology.maggic.nyha_class_label')}
                        value={formData.nyha_class === 0 ? '' : formData.nyha_class.toString()}
                        onChange={(value: string) => {
                          const nyhaValue = value === '' ? 0 : parseInt(value) as 1 | 2 | 3 | 4;
                          setFormData({ ...formData, nyha_class: nyhaValue });
                          if (nyhaValue !== 0) {
                            setCompletedFields(prev => new Set([...prev, 'nyha_class']));
                          } else {
                            setCompletedFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete('nyha_class');
                              return newSet;
                            });
                          }
                        }}
                        options={[
                          { value: '', label: t('calculators.cardiology.maggic.nyha_class_placeholder') },
                          { value: '1', label: t('calculators.cardiology.maggic.nyha_class_1') },
                          { value: '2', label: t('calculators.cardiology.maggic.nyha_class_2') },
                          { value: '3', label: t('calculators.cardiology.maggic.nyha_class_3') },
                          { value: '4', label: t('calculators.cardiology.maggic.nyha_class_4') },
                        ]}
                        error={errors.nyha_class}
                        icon={Activity}
                        className="transition-all duration-300 hover:shadow-lg"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="flex justify-end mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(2)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600"
                        initial={{ x: '100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative flex items-center space-x-2">
                        <span>{t('calculators.cardiology.maggic.next_clinical_assessment')}</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Clinical Parameters & Comorbidities */}
            <AnimatePresence mode="wait">
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-pink-50 via-pink-50/50 to-indigo-50 dark:from-pink-900/20 dark:via-pink-900/10 dark:to-indigo-900/20 rounded-3xl border border-pink-200/50 dark:border-pink-700/50 shadow-lg backdrop-blur-sm"
                    >
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                          {t('calculators.cardiology.maggic.clinical_assessment')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('calculators.cardiology.maggic.clinical_description')}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      ref={systolicBpRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('systolic_bp') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorInput
                        label={t('calculators.cardiology.maggic.systolic_bp_label')}
                        value={formData.systolic_bp}
                        onChange={(value: string) => handleFieldChange('systolic_bp', value)}
                        type="number"
                        placeholder={t('calculators.cardiology.maggic.systolic_bp_placeholder')}
                        min={60}
                        max={250}
                        unit="mmHg"
                        error={errors.systolic_bp}
                        icon={TrendingUp}
                        className="transition-all duration-300 hover:shadow-lg"
                      />
                    </motion.div>

                    <motion.div
                      ref={bmiRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('bmi') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorInput
                        label={t('calculators.cardiology.maggic.bmi_label')}
                        value={formData.bmi}
                        onChange={(value: string) => handleFieldChange('bmi', value)}
                        type="number"
                        step={0.1}
                        placeholder={t('calculators.cardiology.maggic.bmi_placeholder')}
                        min={10}
                        max={60}
                        unit="kg/m²"
                        icon={User}
                        className="transition-all duration-300 hover:shadow-lg"
                        error={errors.bmi}
                      />
                    </motion.div>

                    <motion.div
                      ref={creatinineRef}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {completedFields.has('creatinine') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 z-10"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                      <CalculatorInput
                        label="Creatinine (μmol/L)"
                        value={formData.creatinine}
                        onChange={(value: string) => handleFieldChange('creatinine', value)}
                        type="number"
                        step={1}
                        placeholder="e.g., 90"
                        min={50}
                        max={500}
                        unit="μmol/L"
                        error={errors.creatinine}
                        icon={Activity}
                        className="transition-all duration-300 hover:shadow-lg"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Comorbidities */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      className="flex items-center space-x-3 mb-6"
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-md">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">
                        {t('calculators.cardiology.maggic.comorbidities_section')}
                      </h4>
                    </motion.div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.diabetes 
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg shadow-pink-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                        }`}
                        onClick={() => setFormData({ ...formData, diabetes: !formData.diabetes })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.diabetes 
                                ? 'bg-pink-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <BarChart3 className={`w-4 h-4 ${
                                formData.diabetes ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.diabetes 
                                  ? 'text-pink-700 dark:text-pink-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.diabetes_label')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('calculators.cardiology.maggic.diabetes_label_description')}
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.diabetes ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.copd 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}
                        onClick={() => setFormData({ ...formData, copd: !formData.copd })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.copd 
                                ? 'bg-indigo-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <Activity className={`w-4 h-4 ${
                                formData.copd ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.copd 
                                  ? 'text-indigo-700 dark:text-indigo-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.copd_label')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('calculators.cardiology.maggic.copd_label_description')}
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.copd ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.smoker 
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                        }`}
                        onClick={() => setFormData({ ...formData, smoker: !formData.smoker })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.smoker 
                                ? 'bg-orange-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <AlertCircle className={`w-4 h-4 ${
                                formData.smoker ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.smoker 
                                  ? 'text-orange-700 dark:text-orange-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.smoker_label_text')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('calculators.cardiology.maggic.smoker_label_description')}
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.smoker ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.first_diagnosis 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                        onClick={() => setFormData({ ...formData, first_diagnosis: !formData.first_diagnosis })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.first_diagnosis 
                                ? 'bg-purple-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <Clock className={`w-4 h-4 ${
                                formData.first_diagnosis ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.first_diagnosis 
                                  ? 'text-purple-700 dark:text-purple-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.first_diagnosis_label')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('calculators.cardiology.maggic.first_diagnosis_label_description')}
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.first_diagnosis ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      <span className="flex items-center space-x-2">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                        <span>Back</span>
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(3)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                        initial={{ x: '100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative flex items-center space-x-2">
                        <span>{t('calculators.cardiology.maggic.next_therapy_assessment')}</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Current Therapy */}
            <AnimatePresence mode="wait">
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-blue-50 dark:from-indigo-900/20 dark:via-indigo-900/10 dark:to-blue-900/20 rounded-3xl border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg backdrop-blur-sm"
                    >
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                          {t('calculators.cardiology.maggic.therapy_assessment')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('calculators.cardiology.maggic.therapy_description')}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      className="flex items-center space-x-3 mb-6"
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        {t('calculators.cardiology.maggic.gdmt_section')}
                      </h4>
                    </motion.div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.beta_blocker 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }`}
                        onClick={() => setFormData({ ...formData, beta_blocker: !formData.beta_blocker })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.beta_blocker 
                                ? 'bg-green-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <Pill className={`w-4 h-4 ${
                                formData.beta_blocker ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.beta_blocker 
                                  ? 'text-green-700 dark:text-green-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.beta_blocker_label')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Evidence-based beta-blocker (carvedilol, metoprolol, bisoprolol)
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.beta_blocker ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          formData.ace_inhibitor 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                        onClick={() => setFormData({ ...formData, ace_inhibitor: !formData.ace_inhibitor })}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                              formData.ace_inhibitor 
                                ? 'bg-blue-500 shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              <Pill className={`w-4 h-4 ${
                                formData.ace_inhibitor ? 'text-white' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-semibold transition-colors duration-300 ${
                                formData.ace_inhibitor 
                                  ? 'text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {t('calculators.cardiology.maggic.ace_inhibitor_label')}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Neurohormonal blockade therapy
                              </p>
                            </div>
                            <motion.div
                              initial={false}
                              animate={{ scale: formData.ace_inhibitor ? 1 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                    >
                      <span className="flex items-center space-x-2">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                        <span>Back</span>
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isCalculating ? 1 : 1.05 }}
                      whileTap={{ scale: isCalculating ? 1 : 0.95 }}
                      onClick={handleCalculate}
                      disabled={isCalculating}
                      className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                        animate={{
                          x: isCalculating ? ['0%', '100%', '0%'] : '100%'
                        }}
                        transition={{
                          duration: isCalculating ? 2 : 0.3,
                          repeat: isCalculating ? Infinity : 0,
                          ease: "linear"
                        }}
                      />
                      <span className="relative flex items-center justify-center space-x-3">
                        {isCalculating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Calculator className="w-6 h-6" />
                            </motion.div>
                            <span>Calculating Risk...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-6 h-6" />
                            <span>{t('calculators.cardiology.maggic.calculate_maggic_risk')}</span>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles className="w-5 h-5" />
                            </motion.div>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Results Display */
          result && (
            <motion.div 
              className="space-y-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Enhanced Results Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.div 
                  className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 rounded-3xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {t('calculators.cardiology.maggic.results_title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Comprehensive mortality risk assessment
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Main Score Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 blur-3xl" />
                <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-800/20">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                      className="inline-block"
                    >
                      <div className="text-7xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {animateScore}
                      </div>
                      <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">points</div>
                    </motion.div>
                  </div>
                  
                  {/* Risk Category Badge */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center mb-8"
                  >
                    <div className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl ${
                      result.risk === 'Low' 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                        : result.risk === 'Intermediate'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : result.risk === 'High'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-700 text-white'
                    }`}>
                      {result.risk} Risk
                    </div>
                  </motion.div>
                  
                  <p className="text-center text-gray-700 dark:text-gray-300 text-lg font-medium">
                    {result.interpretation}
                  </p>
                </div>
              </motion.div>
              {/* Mortality Risk Cards */}
              <motion.div 
                className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  onHoverStart={() => setHoveredMetric('1year')}
                  onHoverEnd={() => setHoveredMetric(null)}
                  className="relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-600/5 blur-xl" />
                  <div className="relative p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-purple-200/50 dark:border-purple-700/50 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <Timer className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: hoveredMetric === '1year' ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 2, repeat: hoveredMetric === '1year' ? Infinity : 0 }}
                      >
                        <Heart className="w-8 h-8 text-purple-500/20" />
                      </motion.div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      {t('calculators.cardiology.maggic.one_year_mortality')}
                    </h4>
                    <div className="flex items-baseline space-x-2 mb-4">
                      <motion.span 
                        className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        {result.oneYearMortality}
                      </motion.span>
                      <span className="text-2xl font-semibold text-purple-600/70">%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(result.oneYearMortality * 2, 100)}%` }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-md" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Based on MAGGIC meta-analysis of 39,372 patients
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  onHoverStart={() => setHoveredMetric('3year')}
                  onHoverEnd={() => setHoveredMetric(null)}
                  className="relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-pink-600/5 blur-xl" />
                  <div className="relative p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-pink-200/50 dark:border-pink-700/50 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: hoveredMetric === '3year' ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 2, repeat: hoveredMetric === '3year' ? Infinity : 0 }}
                      >
                        <Heart className="w-8 h-8 text-pink-500/20" />
                      </motion.div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      {t('calculators.cardiology.maggic.three_year_mortality')}
                    </h4>
                    <div className="flex items-baseline space-x-2 mb-4">
                      <motion.span 
                        className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                      >
                        {result.threeYearMortality}
                      </motion.span>
                      <span className="text-2xl font-semibold text-pink-600/70">%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(result.threeYearMortality, 100)}%` }}
                        transition={{ duration: 1.5, delay: 1.1, ease: "easeOut" }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-md" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Validated across 30+ heart failure cohorts
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Risk Stratification */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t('calculators.cardiology.maggic.risk_stratification_title')}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[{
                      risk: 'Low', 
                      range: '<10% 1-year', 
                      examples: '1.5-8.5%',
                      color: 'green',
                      gradient: 'from-green-400 to-emerald-500',
                      icon: Shield
                    },
                    {
                      risk: 'Intermediate', 
                      range: '10-19% 1-year', 
                      examples: '11-18%',
                      color: 'yellow',
                      gradient: 'from-yellow-400 to-orange-500',
                      icon: AlertCircle
                    },
                    {
                      risk: 'High', 
                      range: '20-34% 1-year', 
                      examples: '25-30%',
                      color: 'orange',
                      gradient: 'from-orange-500 to-red-500',
                      icon: TrendingUp
                    },
                    {
                      risk: 'Very High', 
                      range: '≥35% 1-year', 
                      examples: '40-80%',
                      color: 'red',
                      gradient: 'from-red-500 to-red-700',
                      icon: TrendingDown
                    }
                  ].map((category, index) => {
                    const isActive = result.risk === category.risk;
                    const Icon = category.icon;
                    
                    return (
                      <motion.div
                        key={category.risk}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative"
                      >
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          isActive 
                            ? `${category.risk === 'Low' ? 'border-green-500' : category.risk === 'Intermediate' ? 'border-yellow-500' : category.risk === 'High' ? 'border-orange-500' : 'border-red-500'} bg-gradient-to-br ${category.gradient} text-white shadow-2xl`
                            : `${category.risk === 'Low' ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' : category.risk === 'Intermediate' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20' : category.risk === 'High' ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20' : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20'} hover:shadow-lg`
                        }`}>
                          <div className="flex justify-center mb-3">
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-white/20' : category.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30' : category.risk === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30' : category.risk === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isActive ? 'text-white' : category.risk === 'Low' ? 'text-green-600 dark:text-green-400' : category.risk === 'Intermediate' ? 'text-yellow-600 dark:text-yellow-400' : category.risk === 'High' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                              }`} />
                            </div>
                          </div>
                          <h5 className={`text-center font-bold mb-2 ${
                            isActive ? 'text-white' : category.risk === 'Low' ? 'text-green-800 dark:text-green-200' : category.risk === 'Intermediate' ? 'text-yellow-800 dark:text-yellow-200' : category.risk === 'High' ? 'text-orange-800 dark:text-orange-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {category.risk}
                          </h5>
                          <p className={`text-center text-sm mb-1 ${
                            isActive ? 'text-white/90' : category.risk === 'Low' ? 'text-green-700 dark:text-green-300' : category.risk === 'Intermediate' ? 'text-yellow-700 dark:text-yellow-300' : category.risk === 'High' ? 'text-orange-700 dark:text-orange-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {category.range}
                          </p>
                          <p className={`text-center text-xs ${
                            isActive ? 'text-white/80' : category.risk === 'Low' ? 'text-green-600 dark:text-green-400' : category.risk === 'Intermediate' ? 'text-yellow-600 dark:text-yellow-400' : category.risk === 'High' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {category.examples}
                          </p>
                          {isActive && (
                            <motion.div
                              className="absolute -top-2 -right-2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 1.5, type: "spring" }}
                            >
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Check className={`w-5 h-5 ${category.risk === 'Low' ? 'text-green-500' : category.risk === 'Intermediate' ? 'text-yellow-500' : category.risk === 'High' ? 'text-orange-500' : 'text-red-500'}`} />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('calculators.cardiology.maggic.mortality_rates_note')}
                </p>
              </motion.div>

              {/* Clinical Recommendations */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('calculators.cardiology.maggic.recommendations_title')}
                  </h4>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 blur-xl" />
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/50 dark:border-blue-700/50 shadow-xl">
                    <AnimatePresence>
                      {showInsights && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {result.recommendations.map((rec, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 2 + index * 0.1 }}
                              whileHover={{ x: 10 }}
                              className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 2.1 + index * 0.1, type: "spring" }}
                                className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md flex-shrink-0"
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {rec}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* Score Breakdown */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                    Score Breakdown
                  </h4>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600/10 to-gray-600/10 blur-xl" />
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                      {result.scoreBreakdown?.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.6 + index * 0.05 }}
                          className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-2 break-inside-avoid"
                        >
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Reset Button */}
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/25"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>{t('calculators.cardiology.maggic.reset_calculator')}</span>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )
        )}
      </div>

      {/* About Section - Only show after result is calculated */}
      {result && (
        <div className="mt-12 space-y-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-800/20 dark:via-gray-800/10 dark:to-gray-800/20 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm"
          >
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                {t('calculators.cardiology.maggic.about_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('calculators.cardiology.maggic.about_subtitle')}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column: Description & Key Features */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.2 }}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('calculators.cardiology.maggic.about_description')}
            </p>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>Key Features</span>
              </h4>
              <ul className="space-y-3">
                {[{
                  text: t('calculators.cardiology.maggic.feature_1'), icon: Users },
                  { text: t('calculators.cardiology.maggic.feature_2'), icon: Gauge },
                  { text: t('calculators.cardiology.maggic.feature_3'), icon: Target },
                  { text: t('calculators.cardiology.maggic.feature_4'), icon: Brain },
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.4 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mt-1">
                      <feature.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{feature.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Creator & Formula/Tables Tabs */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.3 }}
          >
            {/* About the Creator */}
            <motion.div 
              className="relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 blur-2xl" />
              <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                <div className="flex items-start space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg flex-shrink-0"
                  >
                    <PenTool className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                      {t('calculators.cardiology.maggic.about_creator_title')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t('calculators.cardiology.maggic.creator_description')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs for Formula/Tables */}
            <div className="bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl flex space-x-2">
              <motion.button
                onClick={() => setActiveTab('formula')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'formula' 
                    ? 'bg-white dark:bg-gray-900 shadow-md text-purple-600' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>{t('calculators.cardiology.maggic.formula_title')}</span>
                </div>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('tables')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'tables' 
                    ? 'bg-white dark:bg-gray-900 shadow-md text-purple-600' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{t('calculators.cardiology.maggic.tables_title')}</span>
                </div>
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'formula' ? (
                <motion.div
                  key="formula"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                      {t('calculators.cardiology.maggic.formula_title')}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('calculators.cardiology.maggic.formula_description')}
                  </p>
                  <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-purple-800 dark:text-purple-200">
                      {t('calculators.cardiology.maggic.formula_note')}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {activeTab === 'tables' ? (
                <motion.div
                  key="tables"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Ejection Fraction Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-sm opacity-30"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-200 dark:border-blue-800">
                          <h6 className="font-bold text-blue-900 dark:text-blue-100 flex items-center space-x-2">
                            <HeartHandshake className="w-5 h-5 text-blue-600" />
                            <span>{t('calculators.cardiology.maggic.ef_title')}</span>
                          </h6>
                        </div>
                        <div className="p-2">
                          {[{
                            range: t('calculators.cardiology.maggic.ef_less_20'), points: 7 },
                            { range: t('calculators.cardiology.maggic.ef_20_24'), points: 6 },
                            { range: t('calculators.cardiology.maggic.ef_25_29'), points: 5 },
                            { range: t('calculators.cardiology.maggic.ef_30_34'), points: 3 },
                            { range: t('calculators.cardiology.maggic.ef_35_39'), points: 2 },
                            { range: t('calculators.cardiology.maggic.ef_40_plus'), points: 0 }
                          ].map((item, index) => (
                            <motion.div
                              key={item.range}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                            >
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.range}</span>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-sm shadow-lg"
                              >
                                +{item.points}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* NYHA Class Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-sm opacity-30"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800">
                          <h6 className="font-bold text-green-900 dark:text-green-100 flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            <span>{t('calculators.cardiology.maggic.nyha_class_title')}</span>
                          </h6>
                        </div>
                        <div className="p-2">
                          {[{
                            class: t('calculators.cardiology.maggic.nyha_1'), points: 0, description: t('calculators.cardiology.maggic.nyha_1_description'), icon: '' },
                            { class: t('calculators.cardiology.maggic.nyha_2'), points: 2, description: t('calculators.cardiology.maggic.nyha_2_description'), icon: '' },
                            { class: t('calculators.cardiology.maggic.nyha_3'), points: 6, description: t('calculators.cardiology.maggic.nyha_3_description'), icon: '' },
                            { class: t('calculators.cardiology.maggic.nyha_4'), points: 8, description: t('calculators.cardiology.maggic.nyha_4_description'), icon: '' }
                          ].map((item, index) => (
                            <motion.div
                              key={item.class}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-900/20"
                            >
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                  className="text-2xl"
                                >
                                  {item.icon}
                                </motion.div>
                                <div>
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.class}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">{item.description}</p>
                                </div>
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className={`px-3 py-1 bg-gradient-to-r ${
                                  item.points === 0 ? 'from-green-500 to-emerald-500' :
                                  item.points === 2 ? 'from-yellow-500 to-green-500' :
                                  item.points === 6 ? 'from-orange-500 to-yellow-500' :
                                  'from-red-500 to-orange-500'
                                } text-white rounded-full font-bold text-sm shadow-lg`}
                              >
                                +{item.points}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Creatinine Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => setExpandedTable(expandedTable === 'creatinine' ? null : 'creatinine')}
                    className="relative cursor-pointer"
                  >
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-sm opacity-30"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center justify-between">
                          <h6 className="font-bold text-yellow-900 dark:text-yellow-100 flex items-center space-x-2">
                            <FlaskConical className="w-5 h-5 text-yellow-600" />
                            <span>{t('calculators.cardiology.maggic.creatinine_title')}</span>
                          </h6>
                          <motion.div
                            animate={{ rotate: expandedTable === 'creatinine' ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronRight className="w-5 h-5 text-yellow-600" />
                          </motion.div>
                        </div>
                      </div>
                      <AnimatePresence>
                        {(expandedTable === 'creatinine' || expandedTable === null) && (
                          <motion.div
                            initial={{ height: expandedTable === null ? 'auto' : 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-2">
                              {[{
                                range: t('calculators.cardiology.maggic.creatinine_less_90'), points: 0 },
                                { range: t('calculators.cardiology.maggic.creatinine_90_109'), points: 1 },
                                { range: t('calculators.cardiology.maggic.creatinine_110_129'), points: 2 },
                                { range: t('calculators.cardiology.maggic.creatinine_130_149'), points: 3 },
                                { range: t('calculators.cardiology.maggic.creatinine_150_169'), points: 4 },
                                { range: t('calculators.cardiology.maggic.creatinine_170_209'), points: 5 },
                                { range: t('calculators.cardiology.maggic.creatinine_210_249'), points: 6 },
                                { range: t('calculators.cardiology.maggic.creatinine_250_plus'), points: 8 }
                              ].map((item, index) => {
                                const intensity = Math.min(item.points / 8, 1);
                                return (
                                  <motion.div
                                    key={item.range}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.03 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="relative w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${intensity * 100}%` }}
                                          transition={{ delay: 0.9 + index * 0.05, duration: 0.5 }}
                                        />
                                      </div>
                                      <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{item.range}</span>
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.2 }}
                                      className={`px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-bold text-sm shadow-lg`}
                                      style={{ opacity: 0.6 + intensity * 0.4 }}
                                    >
                                      +{item.points}
                                    </motion.div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* BMI Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="relative"
                  >
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm opacity-30"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200 dark:border-purple-800">
                        <h6 className="font-bold text-purple-900 dark:text-purple-100 flex items-center space-x-2">
                          <User className="w-5 h-5 text-purple-600" />
                          <span>{t('calculators.cardiology.maggic.bmi_title')}</span>
                        </h6>
                      </div>
                      <div className="p-2">
                        {[{
                          range: t('calculators.cardiology.maggic.bmi_less_15'), points: 6, visual: '' },
                          { range: t('calculators.cardiology.maggic.bmi_15_19'), points: 5, visual: '' },
                          { range: t('calculators.cardiology.maggic.bmi_20_24'), points: 3, visual: '' },
                          { range: t('calculators.cardiology.maggic.bmi_25_29'), points: 2, visual: '' },
                          { range: t('calculators.cardiology.maggic.bmi_30_plus'), points: 0, visual: '' }
                        ].map((item, index) => (
                          <motion.div
                            key={item.range}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.3 + index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                          >
                            <div className="flex items-center space-x-3">
                              <motion.span 
                                className="text-2xl"
                                whileHover={{ scale: 1.3 }}
                              >
                                {item.visual}
                              </motion.span>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.range}</span>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                              className={`px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-sm shadow-lg`}
                            >
                              +{item.points}
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Note */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/50"
                  >
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                        {t('calculators.cardiology.maggic.creatinine_note')}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="space-y-8 mt-8">
          {/* Enhanced Evidence Appraisal Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/10 to-green-600/10 blur-3xl" />
            <motion.div 
              className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.005 }}
            >
              {/* Header with animated background */}
              <div className="relative p-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500">
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 30c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 30c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative flex items-center justify-between">
                  <div>
                    <motion.h4 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.9 }}
                    >
                      {t('calculators.cardiology.maggic.evidence_appraisal_title')}
                    </motion.h4>
                    <motion.p 
                      className="text-emerald-100"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      {t('calculators.cardiology.maggic.rigorous_validation')}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.1, type: "spring" }}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl"
                  >
                    <Microscope className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Key Points with animations */}
                <div className="space-y-6">
                  {[{
                      icon: FlaskConical,
                      title: "Meta-Analysis Methodology",
                      content: t('calculators.cardiology.maggic.evidence_appraisal_description'),
                      stats: "30 cohorts analyzed",
                      color: "emerald"
                    },
                    {
                      icon: BarChart,
                      title: "Statistical Model",
                      content: t('calculators.cardiology.maggic.poisson_regression_description'),
                      stats: "Poisson regression",
                      color: "teal"
                    },
                    {
                      icon: UserCheck,
                      title: "External Validation",
                      content: t('calculators.cardiology.maggic.subsequent_study_description'),
                      stats: "22,891 patients",
                      color: "green"
                    },
                    {
                      icon: Shield,
                      title: "Clinical Validation",
                      content: t('calculators.cardiology.maggic.validation_note'),
                      stats: "100% validated",
                      color: "emerald"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-600/5 to-${item.color}-600/10`} />
                      <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-start space-x-4">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`p-3 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl shadow-lg flex-shrink-0`}
                          >
                            <item.icon className="w-6 h-6 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-lg font-bold text-${item.color}-900 dark:text-${item.color}-100`}>
                                {item.title}
                              </h5>
                              <motion.span 
                                className={`px-3 py-1 bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300 rounded-full text-xs font-semibold`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {item.stats}
                              </motion.span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Visual Stats */}
                <motion.div 
                  className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.6 }}
                >
                  {[{
                    label: "Cohorts", value: "30", icon: Layers },
                    { label: "Patients", value: "39,372", icon: Users },
                    { label: "C-statistic", value: "0.74", icon: Target }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, y: -5 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.7 + index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                          <motion.p 
                            className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {stat.value}
                          </motion.p>
                        </div>
                        <stat.icon className="w-8 h-8 text-emerald-500/20" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Literature Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.9, duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-600/10 via-purple-600/10 to-pink-600/10 blur-3xl" />
            <motion.div 
              className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.005, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
              <div className="p-8 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h4 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 3 }}
                    >
                      {t('calculators.cardiology.maggic.literature_title')}
                    </motion.h4>
                    <motion.p 
                      className="text-indigo-100"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 3.1 }}
                    >
                      {t('calculators.cardiology.maggic.foundational_research')}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 3.2, type: "spring" }}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl"
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {[{
                      title: t('calculators.cardiology.maggic.primary_reference_title'),
                      journal: "European Heart Journal, 2013",
                      authors: "Pocock SJ, Ariti CA, McMurray JJV, et al.",
                      href: "https://www.eurheartj.oxfordjournals.org/content/34/20/1535",
                      icon: FileText
                    },
                    {
                      title: t('calculators.cardiology.maggic.secondary_reference_title'),
                      journal: "Circulation: Heart Failure, 2014",
                      authors: "Sanna T, Di Nora C, Piras A, et al.",
                      href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4039799/",
                      icon: FileCheck2
                    }
                  ].map((item, index) => (
                    <motion.a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 3.3 + index * 0.1 }}
                      whileHover={{ scale: 1.03, zIndex: 10 }}
                      className="block p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">{item.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.authors}</p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-500">{item.journal}</p>
                            <div className="flex items-center text-indigo-600 dark:text-indigo-400">
                              <span className="text-xs font-semibold mr-1">Read</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      )}
    </CalculatorContainer>
  );
};