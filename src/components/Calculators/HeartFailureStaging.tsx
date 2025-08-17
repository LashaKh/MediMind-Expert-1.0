import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calculator, Info, Heart, AlertTriangle, Activity, TrendingUp, User, Target, 
  Stethoscope, Clock, Pill, CheckCircle, AlertCircle, XCircle, Lightbulb, 
  CheckCircle2, UserCheck, ExternalLink, BookOpen, Sparkles, Award, Shield, 
  Brain, Zap, Star, ArrowRight, ChevronDown, ChevronUp 
} from 'lucide-react';

interface StagingData {
  stageA_riskFactors: boolean;
  stageA_cardiotoxins: boolean;
  stageA_genetic: boolean;
  stageB_structural: boolean;
  stageB_filling: boolean;
  stageB_biomarkers: boolean;
  stageC_symptoms: boolean;
  stageD_advanced: boolean;
}

interface CalculationResult {
  stage: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  recommendations: string[];
  nextSteps: string[];
  riskLevel: 'low' | 'intermediate' | 'high';
}

const AnimatedCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  index: number;
}> = ({ label, checked, onChange, description, icon: Icon, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 ease-out cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 ${
        checked 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-blue-300/50 dark:border-blue-600/50 shadow-lg shadow-blue-500/10' 
          : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-700/60 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onChange(!checked)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
      
      {/* Content */}
      <div className="relative flex items-start space-x-4">
        {/* Custom animated checkbox */}
        <div className="relative flex-shrink-0 mt-1">
          <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
            checked 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg shadow-blue-500/25' 
              : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
          }`}>
            <CheckCircle2 className={`w-4 h-4 text-white absolute top-0.5 left-0.5 transition-all duration-300 ${
              checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`} />
          </div>
          {/* Animated ripple effect */}
          <div className={`absolute inset-0 rounded-lg bg-blue-500/20 transition-all duration-300 ${
            checked ? 'animate-ping' : 'opacity-0'
          }`} style={{ animationIterationCount: 1 }} />
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className={`p-3 rounded-xl transition-all duration-300 ${
            checked 
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' 
              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20'
          }`}>
            <Icon className={`w-5 h-5 transition-all duration-300 ${
              checked 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }`} />
          </div>
        )}
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-lg leading-tight transition-all duration-300 ${
            checked 
              ? 'text-gray-900 dark:text-gray-100' 
              : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
          }`}>
            {label}
          </h4>
          {description && (
            <p className={`mt-2 text-sm leading-relaxed transition-all duration-300 ${
              checked 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'
            }`}>
              {description}
            </p>
          )}
        </div>
        
        {/* Hover indicator */}
        <div className={`absolute top-4 right-4 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <ArrowRight className="w-4 h-4 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

const StageSection: React.FC<{
  stage: string;
  title: string;
  description: string;
  children: React.ReactNode;
  isVisible: boolean;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ stage, title, description, children, isVisible, color, icon: Icon }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!isVisible) return null;
  
  const colorClasses = {
    green: {
      bg: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20',
      border: 'border-emerald-200/60 dark:border-emerald-800/60',
      icon: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-800 dark:text-emerald-300'
    },
    yellow: {
      bg: 'from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20',
      border: 'border-amber-200/60 dark:border-amber-800/60',
      icon: 'from-amber-500 to-orange-500',
      text: 'text-amber-800 dark:text-amber-300'
    },
    orange: {
      bg: 'from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20',
      border: 'border-orange-200/60 dark:border-orange-800/60',
      icon: 'from-orange-500 to-red-500',
      text: 'text-orange-800 dark:text-orange-300'
    },
    red: {
      bg: 'from-red-50 via-rose-50 to-pink-50 dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20',
      border: 'border-red-200/60 dark:border-red-800/60',
      icon: 'from-red-500 to-pink-500',
      text: 'text-red-800 dark:text-red-300'
    }
  };
  
  const colorClass = colorClasses[color as keyof typeof colorClasses];
  
  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 ${colorClass.border} backdrop-blur-xl bg-gradient-to-br ${colorClass.bg} transition-all duration-700 ease-out animate-in slide-in-from-bottom-8 fade-in`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 dark:from-gray-900/40 dark:to-gray-900/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl" />
      
      {/* Header */}
      <div 
        className="relative p-8 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Stage badge */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${colorClass.icon} shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent" />
              <span className="text-2xl font-bold text-white relative z-10">{stage}</span>
              <div className="absolute inset-0 rounded-2xl shadow-lg shadow-black/20" />
            </div>
            
            {/* Icon */}
            <div className={`p-4 rounded-xl bg-gradient-to-r ${colorClass.icon} shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            
            {/* Title and description */}
            <div>
              <h3 className={`text-2xl font-bold ${colorClass.text} mb-2`}>
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {description}
              </p>
            </div>
          </div>
          
          {/* Expand/collapse button */}
          <button className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-8 pb-8">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const CalculatorButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}> = ({ onClick, disabled = false, className = '', variant = 'primary', size = 'md', children }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const baseClasses = "relative overflow-hidden font-semibold rounded-2xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-blue-500/25 focus:ring-blue-500/50",
    secondary: "bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 shadow-xl focus:ring-gray-500/50"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-12 py-6 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:-translate-y-1'} ${className}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
    >
      {/* Background animation */}
      <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Ripple effect */}
      {isPressed && (
        <div className="absolute inset-0 bg-white/20 animate-ping rounded-2xl" />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-3">
        {children}
      </span>
    </button>
  );
};

const ResultCard: React.FC<{
  result: CalculationResult;
  t: (key: string, options?: { returnObjects?: boolean }) => string | string[];
}> = ({ result, t }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const colorClasses = {
    low: 'from-emerald-400 to-teal-400',
    intermediate: 'from-amber-400 to-orange-400',
    high: 'from-red-500 to-pink-500',
  };
  
  const Icon = {
    A: Target,
    B: UserCheck,
    C: Activity,
    D: AlertTriangle,
  }[result.stage];
  
  return (
    <div className={`relative overflow-hidden w-full max-w-4xl mx-auto rounded-3xl border-2 border-gray-200/20 dark:border-gray-700/50 bg-gradient-to-br from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-800/80 dark:via-gray-900/80 dark:to-gray-800/80 p-8 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95`}>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5" />
      <div className="relative">
        <div className="flex items-center space-x-6 mb-6">
          <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-r ${colorClasses[result.riskLevel]} text-white flex items-center justify-center shadow-lg`}>
            <span className="text-4xl font-bold">{result.stage}</span>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{result.title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{result.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Pill className="mr-3 text-blue-500" />
              <span>{t('calculators.heartFailureStaging.results.recommendations.title')}</span>
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 mt-1 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <TrendingUp className="mr-3 text-purple-500" />
              <span>{t('calculators.heartFailureStaging.results.nextSteps.title')}</span>
            </h3>
            <ul className="space-y-3">
              {result.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 text-purple-500 mt-1 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeartFailureStagingCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [stagingData, setStagingData] = useState<StagingData>({
    stageA_riskFactors: false,
    stageA_cardiotoxins: false,
    stageA_genetic: false,
    stageB_structural: false,
    stageB_filling: false,
    stageB_biomarkers: false,
    stageC_symptoms: false,
    stageD_advanced: false,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = useCallback((field: keyof StagingData) => (value: boolean) => {
    setStagingData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateStage = (): CalculationResult => {
    if (stagingData.stageD_advanced) {
      return {
        stage: 'D',
        title: t('calculators.heartFailureStaging.results.stageD.title'),
        description: t('calculators.heartFailureStaging.results.stageD.description'),
        recommendations: t('calculators.heartFailureStaging.results.stageD.recommendations', { returnObjects: true }) as string[],
        nextSteps: t('calculators.heartFailureStaging.results.stageD.nextSteps', { returnObjects: true }) as string[],
        riskLevel: 'high',
      };
    }
    if (stagingData.stageC_symptoms) {
      return {
        stage: 'C',
        title: t('calculators.heartFailureStaging.results.stageC.title'),
        description: t('calculators.heartFailureStaging.results.stageC.description'),
        recommendations: t('calculators.heartFailureStaging.results.stageC.recommendations', { returnObjects: true }) as string[],
        nextSteps: t('calculators.heartFailureStaging.results.stageC.nextSteps', { returnObjects: true }) as string[],
        riskLevel: 'intermediate',
      };
    }
    if (stagingData.stageB_structural || stagingData.stageB_filling || stagingData.stageB_biomarkers) {
      return {
        stage: 'B',
        title: t('calculators.heartFailureStaging.results.stageB.title'),
        description: t('calculators.heartFailureStaging.results.stageB.description'),
        recommendations: t('calculators.heartFailureStaging.results.stageB.recommendations', { returnObjects: true }) as string[],
        nextSteps: t('calculators.heartFailureStaging.results.stageB.nextSteps', { returnObjects: true }) as string[],
        riskLevel: 'low',
      };
    }
    if (stagingData.stageA_riskFactors || stagingData.stageA_cardiotoxins || stagingData.stageA_genetic) {
      return {
        stage: 'A',
        title: t('calculators.heartFailureStaging.results.stageA.title'),
        description: t('calculators.heartFailureStaging.results.stageA.description'),
        recommendations: t('calculators.heartFailureStaging.results.stageA.recommendations', { returnObjects: true }) as string[],
        nextSteps: t('calculators.heartFailureStaging.results.stageA.nextSteps', { returnObjects: true }) as string[],
        riskLevel: 'low',
      };
    }
    // Default case, though should not be reached if at least one checkbox is ticked
    return {
      stage: 'A',
      title: t('calculators.heartFailureStaging.results.stageA.title'),
      description: t('calculators.heartFailureStaging.results.stageA.description'),
      recommendations: t('calculators.heartFailureStaging.results.stageA.recommendations', { returnObjects: true }) as string[],
      nextSteps: t('calculators.heartFailureStaging.results.stageA.nextSteps', { returnObjects: true }) as string[],
      riskLevel: 'low',
    };
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setResult(null);
    await new Promise(res => setTimeout(res, 1200));
    const finalResult = calculateStage();
    setResult(finalResult);
    setIsLoading(false);
    // Scroll to result
    const resultElement = document.getElementById('result-card');
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReset = () => {
    setStagingData({
      stageA_riskFactors: false,
      stageA_cardiotoxins: false,
      stageA_genetic: false,
      stageB_structural: false,
      stageB_filling: false,
      stageB_biomarkers: false,
      stageC_symptoms: false,
      stageD_advanced: false,
    });
    setResult(null);
  };

  const isAnyCheckboxChecked = Object.values(stagingData).some(v => v);

  return (
    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top' }}>
      <div className="p-4 sm:p-6 md:p-8 pb-32 font-sans bg-gray-50/50 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 pb-2">
            {t('calculators.heartFailureStaging.title')}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('calculators.heartFailureStaging.description')}
          </p>
        </header>

        {/* Staging Sections */}
        <div className="space-y-8">
          <StageSection 
            stage="A" 
            title={t('calculators.heartFailureStaging.sections.stageA.title')}
            description={t('calculators.heartFailureStaging.sections.stageA.description')}
            isVisible={true}
            color="green"
            icon={Target}
          >
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageA_riskFactors.label')}
              checked={stagingData.stageA_riskFactors} 
              onChange={handleCheckboxChange('stageA_riskFactors')} 
              description={t('calculators.heartFailureStaging.questions.stageA_riskFactors.description')}
              icon={Heart}
              index={0}
            />
             <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageA_cardiotoxins.label')}
              checked={stagingData.stageA_cardiotoxins} 
              onChange={handleCheckboxChange('stageA_cardiotoxins')} 
              description={t('calculators.heartFailureStaging.questions.stageA_cardiotoxins.description')}
              icon={Pill}
              index={1}
            />
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageA_genetic.label')}
              checked={stagingData.stageA_genetic} 
              onChange={handleCheckboxChange('stageA_genetic')} 
              description={t('calculators.heartFailureStaging.questions.stageA_genetic.description')}
              icon={Brain}
              index={2}
            />
          </StageSection>

          <StageSection 
            stage="B" 
            title={t('calculators.heartFailureStaging.sections.stageB.title')}
            description={t('calculators.heartFailureStaging.sections.stageB.description')}
            isVisible={stagingData.stageA_riskFactors || stagingData.stageA_cardiotoxins || stagingData.stageA_genetic}
            color="yellow"
            icon={UserCheck}
          >
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageB_structural.label')}
              checked={stagingData.stageB_structural} 
              onChange={handleCheckboxChange('stageB_structural')}
              description={t('calculators.heartFailureStaging.questions.stageB_structural.description')}
              icon={Stethoscope}
              index={3}
            />
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageB_filling.label')}
              checked={stagingData.stageB_filling} 
              onChange={handleCheckboxChange('stageB_filling')}
              description={t('calculators.heartFailureStaging.questions.stageB_filling.description')}
              icon={Zap}
              index={4}
            />
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageB_biomarkers.label')}
              checked={stagingData.stageB_biomarkers} 
              onChange={handleCheckboxChange('stageB_biomarkers')}
              description={t('calculators.heartFailureStaging.questions.stageB_biomarkers.description')}
              icon={Award}
              index={5}
            />
          </StageSection>

          <StageSection 
            stage="C" 
            title={t('calculators.heartFailureStaging.sections.stageC.title')}
            description={t('calculators.heartFailureStaging.sections.stageC.description')}
            isVisible={stagingData.stageB_structural || stagingData.stageB_filling || stagingData.stageB_biomarkers}
            color="orange"
            icon={Activity}
          >
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageC_symptoms.label')}
              checked={stagingData.stageC_symptoms} 
              onChange={handleCheckboxChange('stageC_symptoms')}
              description={t('calculators.heartFailureStaging.questions.stageC_symptoms.description')}
              icon={AlertCircle}
              index={6}
            />
          </StageSection>

          <StageSection 
            stage="D" 
            title={t('calculators.heartFailureStaging.sections.stageD.title')}
            description={t('calculators.heartFailureStaging.sections.stageD.description')}
            isVisible={stagingData.stageC_symptoms}
            color="red"
            icon={AlertTriangle}
          >
            <AnimatedCheckbox 
              label={t('calculators.heartFailureStaging.questions.stageD_advanced.label')}
              checked={stagingData.stageD_advanced} 
              onChange={handleCheckboxChange('stageD_advanced')}
              description={t('calculators.heartFailureStaging.questions.stageD_advanced.description')}
              icon={XCircle}
              index={7}
            />
          </StageSection>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <CalculatorButton
            onClick={handleCalculate}
            disabled={!isAnyCheckboxChecked || isLoading}
            size="lg"
            variant="primary"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                {t('calculators.heartFailureStaging.calculatingButton')}
              </>
            ) : (
              <>
                <Sparkles className="mr-3 h-6 w-6" />
                {t('calculators.heartFailureStaging.calculateButton')}
              </>
            )}
          </CalculatorButton>

          {isAnyCheckboxChecked && !isLoading && (
            <CalculatorButton
              onClick={handleReset}
              className="ml-4"
              variant="secondary"
              size="lg"
            >
              {t('calculators.heartFailureStaging.resetButton')}
            </CalculatorButton>
          )}
        </div>

        {/* Result Card */}
        {result && !isLoading && (
          <div id="result-card" className="mt-16">
            <ResultCard result={result} t={t} />
          </div>
        )}

        {/* Educational Content */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="mr-3 text-indigo-500"/>
              <span>{t('calculators.heartFailureStaging.evidence.title')}</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('calculators.heartFailureStaging.evidence.description')}
            </p>
            <a 
              href="https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 inline-flex items-center transition-transform hover:translate-x-1"
            >
              {t('calculators.heartFailureStaging.evidence.link')}
              <ExternalLink className="ml-2 w-4 h-4"/>
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {t('common.appName')}. {t('common.allRightsReserved')}</p>
          <p className="mt-1">{t('common.calculatorDisclaimer')}</p>
        </footer>
      </div>
    </div>
    </div>
  );
};

const SuspendedHeartFailureStagingCalculator = () => (
  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900"><p className="text-lg">Loading Calculator...</p></div>}>
    <HeartFailureStagingCalculator />
  </Suspense>
);

export default SuspendedHeartFailureStagingCalculator; 