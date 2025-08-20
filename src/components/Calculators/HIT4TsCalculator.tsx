import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Droplets, 
  Calculator, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Shield, 
  Target, 
  Activity, 
  Heart,
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  BarChart3,
  Clock,
  User,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ScoreOption {
  points: number;
  description: string;
  color: string;
}

interface Parameter {
  name: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  options: ScoreOption[];
}

interface FormData {
  thrombocytopenia: string;
  timing: string;
  thrombosis: string;
  otherCauses: string;
}

interface HIT4TsResult {
  score: number;
  risk: string;
  percentage: string;
  interpretation: string;
  recommendations: string[];
  riskCategory: 'low' | 'intermediate' | 'high';
}

const HIT4TsCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<FormData>({
    thrombocytopenia: '',
    timing: '',
    thrombosis: '',
    otherCauses: ''
  });

  const [result, setResult] = useState<HIT4TsResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWhenToUse, setShowWhenToUse] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: number}>({});
  
  // Add ref for results section
  const resultsRef = useRef<HTMLDivElement>(null);

  // Enhanced parameters with beautiful design elements
  const parameters: Parameter[] = [
    {
      name: 'thrombocytopenia',
      title: 'Thrombocytopenia Severity',
      subtitle: 'Platelet count reduction assessment',
      icon: Droplets,
      options: [
        { 
          points: 2, 
          description: 'Platelet fall >50% with nadir ≥20×10⁹/L', 
          color: 'from-red-500 to-red-600' 
        },
        { 
          points: 1, 
          description: 'Platelet fall 30-50% or nadir 10-19×10⁹/L', 
          color: 'from-orange-500 to-orange-600' 
        },
        { 
          points: 0, 
          description: 'Platelet fall <30% or nadir <10×10⁹/L', 
          color: 'from-green-500 to-green-600' 
        }
      ]
    },
    {
      name: 'timing',
      title: 'Timing of Onset',
      subtitle: 'When did platelet count fall',
      icon: Clock,
      options: [
        { 
          points: 2, 
          description: 'Days 5-10 or ≤1 day with recent exposure (<30 days)', 
          color: 'from-red-500 to-red-600' 
        },
        { 
          points: 1, 
          description: 'Consistent with days 5-10 or after day 10', 
          color: 'from-orange-500 to-orange-600' 
        },
        { 
          points: 0, 
          description: '<4 days without recent heparin exposure', 
          color: 'from-green-500 to-green-600' 
        }
      ]
    },
    {
      name: 'thrombosis',
      title: 'Thrombosis & Sequelae',
      subtitle: 'Thrombotic events or complications',
      icon: Activity,
      options: [
        { 
          points: 2, 
          description: 'New thrombosis, skin necrosis, or acute systemic reaction', 
          color: 'from-red-500 to-red-600' 
        },
        { 
          points: 1, 
          description: 'Progressive/recurrent thrombosis or erythematous skin lesions', 
          color: 'from-orange-500 to-orange-600' 
        },
        { 
          points: 0, 
          description: 'No thrombosis or skin changes', 
          color: 'from-green-500 to-green-600' 
        }
      ]
    },
    {
      name: 'otherCauses',
      title: 'Alternative Causes',
      subtitle: 'Other explanations for thrombocytopenia',
      icon: Target,
      options: [
        { 
          points: 2, 
          description: 'No other cause for thrombocytopenia evident', 
          color: 'from-red-500 to-red-600' 
        },
        { 
          points: 1, 
          description: 'Possible other cause present', 
          color: 'from-orange-500 to-orange-600' 
        },
        { 
          points: 0, 
          description: 'Definite other cause for thrombocytopenia', 
          color: 'from-green-500 to-green-600' 
        }
      ]
    }
  ];

  const calculateScore = useCallback((): HIT4TsResult => {
    const totalScore = Object.values(selectedOptions).reduce((sum, points) => sum + points, 0);
    
    let risk: string;
    let percentage: string;
    let interpretation: string;
    let recommendations: string[];
    let riskCategory: 'low' | 'intermediate' | 'high';

    if (totalScore <= 3) {
      risk = 'Low';
      percentage = '0.9%';
      riskCategory = 'low';
      interpretation = 'Low probability of HIT. Consider alternative diagnoses.';
      recommendations = [
        'HIT is unlikely - consider other causes of thrombocytopenia',
        'Routine HIT testing is generally not recommended',
        'Continue heparin if clinically indicated'
      ];
    } else if (totalScore <= 5) {
      risk = 'Intermediate';
      percentage = '11.3%';
      riskCategory = 'intermediate';
      interpretation = 'Intermediate probability of HIT. Consider HIT testing and alternative anticoagulation.';
      recommendations = [
        'Consider HIT testing (enzyme immunoassay + functional assay)',
        'Consider alternative anticoagulation while awaiting results',
        'Monitor platelet count closely'
      ];
    } else {
      risk = 'High';
      percentage = '34%';
      riskCategory = 'high';
      interpretation = 'High probability of HIT. Discontinue heparin and start alternative anticoagulation.';
      recommendations = [
        'Stop all heparin products immediately',
        'Start non-heparin anticoagulant (argatroban, bivalirudin, fondaparinux)',
        'Order HIT testing to confirm diagnosis',
        'Avoid platelet transfusions unless life-threatening bleeding'
      ];
    }

    return {
      score: totalScore,
      risk,
      percentage,
      riskCategory,
      interpretation,
      recommendations
    };
  }, [selectedOptions]);

  const handleOptionSelect = useCallback((parameterName: string, points: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [parameterName]: points
    }));
    
    // Update form data for backward compatibility
    setFormData(prev => ({
      ...prev,
      [parameterName]: points.toString()
    }));
  }, []);

  const handleCalculate = useCallback(async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const calculationResult = calculateScore();
      
      setResult(calculationResult);
      setShowResult(true);
      setIsCalculating(false);
      
      // Scroll to results after a brief delay to ensure DOM is updated
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }, 1000);
  }, [calculateScore]);

  const resetCalculator = useCallback(() => {
    setFormData({
      thrombocytopenia: '',
      timing: '',
      thrombosis: '',
      otherCauses: ''
    });
    setSelectedOptions({});
    setResult(null);
    setShowResult(false);
  }, []);

  const isFormValid = useMemo(() => {
    return Object.keys(selectedOptions).length === 4;
  }, [selectedOptions]);

  const getCurrentScore = useMemo(() => {
    return Object.values(selectedOptions).reduce((sum, points) => sum + points, 0);
  }, [selectedOptions]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Compact Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 mb-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  4Ts Score Calculator
                </h1>
                <p className="text-blue-200 text-sm">
                  Heparin-Induced Thrombocytopenia Risk Assessment
                </p>
              </div>
            </div>

            {/* Score Badge */}
            {Object.keys(selectedOptions).length > 0 && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-semibold text-sm">
                  Score: {getCurrentScore()}/8
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact When to Use Collapsible Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/60 overflow-hidden">
        <button
          onClick={() => setShowWhenToUse(!showWhenToUse)}
          className="w-full p-4 text-left hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  When to Use This Calculator
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Clinical guidelines and appropriate patient populations
                </p>
              </div>
            </div>
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {showWhenToUse ? (
                <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>
        
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showWhenToUse ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4 pt-2">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                The 4Ts score for Heparin-Induced Thrombocytopenia (HIT) is a clinical scoring system used to estimate the pretest probability of HIT, a potentially life-threatening condition that can occur in patients receiving heparin therapy.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                This calculator is applicable to patients who have been exposed to heparin and are experiencing a significant drop in platelet count or new thrombosis.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200 text-xs">
                    <strong>Caution:</strong> May need interpretation with caution in patients with other causes of thrombocytopenia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Calculator Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {parameters.map((parameter, index) => {
          const IconComponent = parameter.icon;
          const selectedPoints = selectedOptions[parameter.name];
          
          return (
            <div 
              key={parameter.name}
              className="transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Compact Parameter Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {parameter.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {parameter.subtitle}
                      </p>
                    </div>
                    {selectedPoints !== undefined && (
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {selectedPoints} pts
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Options Grid */}
                <div className="p-4">
                  <div className="space-y-2">
                    {parameter.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleOptionSelect(parameter.name, option.points)}
                        className={`relative w-full p-3 rounded-lg border-2 transition-all duration-300 text-left group ${
                          selectedPoints === option.points
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Points badge */}
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            selectedPoints === option.points
                              ? `bg-gradient-to-r ${option.color} text-white shadow-md`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}>
                            {option.points}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium transition-colors ${
                              selectedPoints === option.points
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {option.description}
                            </p>
                          </div>

                          {/* Selection indicator */}
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                            selectedPoints === option.points
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-500 group-hover:border-blue-400'
                          }`}>
                            {selectedPoints === option.points && (
                              <CheckCircle className="w-5 h-5 text-white -m-0.5" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Calculate Button */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={handleCalculate}
          disabled={!isFormValid() || isCalculating}
          className={`group relative px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
            isFormValid() && !isCalculating
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-blue-500/25 transform hover:scale-105'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-2">
            {isCalculating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Calculate 4Ts Score</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Compact Results Section */}
      {showResult && result && (
        <div ref={resultsRef} className={`transform transition-all duration-700 ${
          showResult ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Compact Results Header */}
            <div className={`p-6 bg-gradient-to-r ${
              result.riskCategory === 'low' ? 'from-green-500 to-emerald-500' :
              result.riskCategory === 'intermediate' ? 'from-yellow-500 to-orange-500' :
              'from-red-500 to-rose-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    4Ts Score Results
                  </h2>
                  <p className="text-white/90">
                    Risk assessment completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {result.score}/8
                  </div>
                  <div className="text-white/90 text-sm font-medium">
                    Total Points
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Results Content */}
            <div className="p-6">
              {/* Risk Level Card */}
              <div className={`p-4 rounded-xl mb-4 ${
                result.riskCategory === 'low' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                result.riskCategory === 'intermediate' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {result.riskCategory === 'low' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : result.riskCategory === 'intermediate' ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${
                      result.riskCategory === 'low' ? 'text-green-800 dark:text-green-200' :
                      result.riskCategory === 'intermediate' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-red-800 dark:text-red-200'
                    }`}>
                      {result.risk} Risk
                    </h3>
                    <p className={`${
                      result.riskCategory === 'low' ? 'text-green-700 dark:text-green-300' :
                      result.riskCategory === 'intermediate' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-red-700 dark:text-red-300'
                    }`}>
                      {result.percentage} probability of HIT
                    </p>
                  </div>
                </div>
                
                <p className={`leading-relaxed ${
                  result.riskCategory === 'low' ? 'text-green-800 dark:text-green-200' :
                  result.riskCategory === 'intermediate' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-red-800 dark:text-red-200'
                }`}>
                  {result.interpretation}
                </p>
              </div>

              {/* Compact Recommendations */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Clinical Recommendations</span>
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share Results */}
              {/* Removed CalculatorResultShare component */}
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {showResult && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetCalculator}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
          >
            Calculate Again
          </button>
        </div>
      )}
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const HIT4TsCalculator = React.memo(HIT4TsCalculatorComponent);

export default HIT4TsCalculator; 

