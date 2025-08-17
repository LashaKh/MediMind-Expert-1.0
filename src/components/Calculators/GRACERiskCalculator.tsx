import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { 
  GraceFormStep1, 
  GraceFormStep2, 
  GraceFormStep3, 
  GraceResultDisplay, 
  GraceHeader, 
  type GRACEResult 
} from './GRACE';
import { GRACE2Validator, type GRACEFormData } from '../../utils/grace2Validator';



export const GRACERiskCalculator: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<GRACEFormData>({
    age: '',
    heartRate: '',
    systolicBP: '',
    creatinine: '',
    killipClass: 1,
    cardiacArrest: false,
    stDeviation: false,
    elevatedMarkers: false
  });

  const [result, setResult] = useState<GRACEResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = t('common.required');
    } else if (age < 18 || age > 120) {
      newErrors.age = t('calculators.cardiology.grace.age_error');
    }

    const heartRate = parseInt(formData.heartRate);
    if (!formData.heartRate || isNaN(heartRate)) {
      newErrors.heartRate = t('common.required');
    } else if (heartRate < 30 || heartRate > 300) {
      newErrors.heartRate = t('calculators.cardiology.grace.heart_rate_error');
    }

    const systolicBP = parseInt(formData.systolicBP);
    if (!formData.systolicBP || isNaN(systolicBP)) {
      newErrors.systolicBP = t('common.required');
    } else if (systolicBP < 60 || systolicBP > 300) {
      newErrors.systolicBP = t('calculators.cardiology.grace.systolic_bp_error');
    }

    const creatinine = parseFloat(formData.creatinine);
    if (!formData.creatinine || isNaN(creatinine)) {
      newErrors.creatinine = t('common.required');
    } else if (creatinine < 0.3 || creatinine > 15.0) {
      newErrors.creatinine = t('calculators.cardiology.grace.creatinine_error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateGRACEScore = (): GRACEResult => {
    const validator = new GRACE2Validator();
    
    const patientData = {
      age: parseInt(formData.age),
      heartRate: parseInt(formData.heartRate),
      systolicBP: parseInt(formData.systolicBP),
      creatinine: parseFloat(formData.creatinine),
      killipClass: formData.killipClass,
      cardiacArrest: formData.cardiacArrest,
      stDeviation: formData.stDeviation,
      elevatedMarkers: formData.elevatedMarkers
    };

    const riskCalculation = validator.calculateRisk(patientData);

    // Use the official GRACE 2.0 risk categorization based on 6-month mortality
    // Low: <3%, Intermediate: 3-8%, High: >8%
    const riskCategory = validator.categorizeRisk(riskCalculation.rawScore);
    const recommendations = validator.getRecommendations(riskCategory);

    return {
      score: riskCalculation.rawScore,
      inHospitalMortality: riskCalculation.inHospitalMortality,
      oneYearMortality: riskCalculation.oneYearMortality,
      sixMonthMortality: riskCalculation.sixMonthMortality,
      riskCategory,
      invasiveStrategy: recommendations.strategy,
      recommendation: recommendations.recommendation,
      urgency: recommendations.urgency,
      validationStatus: 'True GRACE 2.0 Algorithm (β Coefficients + Logistic Regression)',
      riskDetails: {
        shortTermRisk: riskCalculation.inHospitalMortality,
        longTermRisk: riskCalculation.oneYearMortality,
        interventionWindow: recommendations.urgency === 'high' ? '< 24 hours' : 
                           recommendations.urgency === 'moderate' ? '24-72 hours' : 
                           'Elective timing'
      }
    };
  };

  const handleCalculate = () => {
    if (validateForm()) {
    setIsCalculating(true);
    
    setTimeout(() => {
      const calculatedResult = calculateGRACEScore();
      setResult(calculatedResult);
      setShowResult(true);
      setIsCalculating(false);
      }, 1500);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      heartRate: '',
      systolicBP: '',
      creatinine: '',
      killipClass: 1,
      cardiacArrest: false,
      stDeviation: false,
      elevatedMarkers: false
    });
    setResult(null);
    setErrors({});
    setCurrentStep(1);
    setShowResult(false);
  };

  const getInterpretation = (category: string, oneYearRisk: number, inHospitalRisk: number) => {
    if (category === 'high') {
      return `High-risk patient requiring urgent intervention. In-hospital mortality risk ${inHospitalRisk}%, 1-year risk ${oneYearRisk}%.`;
    } else if (category === 'intermediate') {
      return `Intermediate-risk patient. Early invasive strategy recommended. In-hospital mortality risk ${inHospitalRisk}%, 1-year risk ${oneYearRisk}%.`;
    }
    return `Low-risk patient. Conservative management appropriate. In-hospital mortality risk ${inHospitalRisk}%, 1-year risk ${oneYearRisk}%.`;
  };

  const getUrgencyInfo = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
      case 'moderate':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock };
      default:
        return { color: 'text-green-600', bg: 'bg-green-50', icon: Shield };
    }
  };

  const getKillipDescription = (killip: number) => {
    const descriptions = [
      t('calculators.cardiology.grace.killip_class_1'),
      t('calculators.cardiology.grace.killip_class_2'), 
      t('calculators.cardiology.grace.killip_class_3'),
      t('calculators.cardiology.grace.killip_class_4')
    ];
    return descriptions[killip - 1];
  };

  return (
    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top' }}>
      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <GraceHeader currentStep={currentStep} />
        {/* Main Calculator Content */}
        <div className="space-y-8">

        {currentStep === 1 && (
          <GraceFormStep1
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <GraceFormStep2
            formData={formData}
            setFormData={setFormData}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <GraceFormStep3
            formData={formData}
            isCalculating={isCalculating}
            onBack={() => setCurrentStep(2)}
            onReset={handleReset}
            onCalculate={handleCalculate}
          />
        )}

        {showResult && result && (
          <GraceResultDisplay result={result} />
        )}
        </div>
      </div>
    </div>
  );
};