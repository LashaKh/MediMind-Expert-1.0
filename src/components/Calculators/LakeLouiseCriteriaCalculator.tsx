import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, 
  RotateCcw, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Zap,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Stethoscope,
  Brain,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LakeLouiseData {
  t2WeightedSignal: boolean | null;
  gadoliniumEnhancement: boolean | null;
  focalLesion: boolean | null;
}

interface LakeLouiseResult {
  score: number;
  interpretation: string;
  recommendation: string;
  riskLevel: 'low' | 'intermediate' | 'high';
}

const LakeLouiseCriteriaCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<LakeLouiseData>({
    t2WeightedSignal: null,
    gadoliniumEnhancement: null,
    focalLesion: null,
  });
  const [result, setResult] = useState<LakeLouiseResult | null>(null);
  const [showWhenToUse, setShowWhenToUse] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');

  const parameters = [
    {
      key: 't2WeightedSignal' as keyof LakeLouiseData,
      title: 'T2-Weighted Signal Enhancement',
      label: 'Regional or global myocardial signal intensity increase in T2-weighted images',
      description: 'Increased signal intensity on T2-weighted cardiac MRI images indicating myocardial edema and tissue inflammation',
      icon: Activity,
      points: 1,
    },
    {
      key: 'gadoliniumEnhancement' as keyof LakeLouiseData,
      title: 'Early Gadolinium Enhancement',
      label: 'Increased global myocardial early gadolinium enhancement ratio',
      description: 'Enhanced ratio between myocardium and skeletal muscle in gadolinium-enhanced T1-weighted images indicating hyperemia and capillary leak',
      icon: Zap,
      points: 1,
    },
    {
      key: 'focalLesion' as keyof LakeLouiseData,
      title: 'Late Gadolinium Enhancement',
      label: 'Focal lesion with non-ischemic regional distribution',
      description: 'At least one focal lesion in inversion recovery-prepared gadolinium-enhanced T1-weighted images indicating myocyte necrosis and/or fibrosis',
      icon: Target,
      points: 1,
    },
  ];

  const calculateScore = useCallback((formData: LakeLouiseData): LakeLouiseResult => {
    const score = Object.values(formData).reduce((sum, value) => sum + (value ? 1 : 0), 0);
    
    let interpretation: string;
    let recommendation: string;
    let riskLevel: 'low' | 'intermediate' | 'high';

    switch (score) {
      case 0:
      case 1:
        interpretation = 'CMR findings do not meet criteria for myocardial inflammation';
        recommendation = 'Consider repeat CMR in 1-2 weeks if recent symptom onset (<2 weeks) with strong clinical suspicion. Alternative diagnoses should be considered.';
        riskLevel = 'low';
        break;
      case 2:
        interpretation = 'CMR findings consistent with myocardial inflammation';
        recommendation = 'Findings support myocarditis diagnosis. Clinical correlation recommended. Consider endomyocardial biopsy if clinically indicated.';
        riskLevel = 'intermediate';
        break;
      case 3:
        interpretation = 'CMR findings highly consistent with myocyte injury and/or scar due to myocardial inflammation';
        recommendation = 'High likelihood of myocarditis. Initiate appropriate treatment per current guidelines. Consider tissue characterization and follow-up imaging.';
        riskLevel = 'high';
        break;
      default:
        interpretation = 'Invalid score calculation';
        recommendation = 'Please verify all inputs and recalculate';
        riskLevel = 'low';
    }

    return { score, interpretation, recommendation, riskLevel };
  }, []);

  const handleInputChange = useCallback((key: keyof LakeLouiseData, value: boolean) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    
    // Trigger animation
    setAnimationPhase('calculating');
    
    // Auto-calculate if all fields are filled
    if (Object.values(newData).every(val => val !== null)) {
      setTimeout(() => {
        setResult(calculateScore(newData));
        setAnimationPhase('complete');
      }, 600);
    } else {
      setAnimationPhase('idle');
    }
  }, [data, calculateScore]);

  const handleCalculate = useCallback(() => {
    if (Object.values(data).some(val => val === null)) {
      // Add shake animation for incomplete form
      setAnimationPhase('error');
      setTimeout(() => setAnimationPhase('idle'), 600);
      return;
    }
    
    setAnimationPhase('calculating');
    setTimeout(() => {
      setResult(calculateScore(data));
      setAnimationPhase('complete');
    }, 800);
  }, [data, calculateScore]);

  const handleReset = useCallback(() => {
    setAnimationPhase('reset');
    setTimeout(() => {
      setData({
        t2WeightedSignal: null,
        gadoliniumEnhancement: null,
        focalLesion: null,
      });
      setResult(null);
      setAnimationPhase('idle');
    }, 300);
  }, []);

  const getRiskConfig = useMemo(() => (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': 
        return {
          color: 'from-emerald-500 to-green-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          icon: Shield,
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'intermediate': 
        return {
          color: 'from-amber-500 to-orange-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: AlertTriangle,
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'high': 
        return {
          color: 'from-red-500 to-rose-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: Heart,
          badge: 'bg-red-100 text-red-800 border-red-300'
        };
      default: 
        return {
          color: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: Info,
          badge: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  }, []);

  const allFieldsFilled = useMemo(() => Object.values(data).every(val => val !== null), [data]);
  const currentScore = useMemo(() => Object.values(data).reduce((sum, value) => sum + (value ? 1 : 0), 0), [data]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        
        <Card className="relative border-0 shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-8 pt-8 text-center relative">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20">
                  <Heart className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Lake Louise Criteria
            </CardTitle>
            <CardDescription className="text-xl text-gray-800 font-medium mb-4">
              MRI Diagnosis of Myocarditis
            </CardDescription>
            <p className="text-gray-700 text-sm max-w-2xl mx-auto leading-relaxed">
              Advanced cardiac magnetic resonance imaging diagnostic criteria for standardized myocarditis assessment
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* When to Use Section */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-blue-50">
        <CardContent className="p-6">
          <button
            onClick={() => setShowWhenToUse(!showWhenToUse)}
            className="w-full flex items-center justify-between text-left group transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">When to Use</h3>
                <p className="text-sm text-gray-600">Clinical application and criteria</p>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/50 group-hover:bg-white transition-colors">
              {showWhenToUse ? 
                <ChevronUp className="h-5 w-5 text-gray-600" /> : 
                <ChevronDown className="h-5 w-5 text-gray-600" />
              }
            </div>
          </button>
          
          <div className={`mt-6 space-y-4 transition-all duration-500 ease-in-out overflow-hidden ${
            showWhenToUse ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Brain className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Clinical Application</h4>
                  <p className="text-gray-700 leading-relaxed">
                    The Lake Louise Criteria for Magnetic Resonance Imaging Diagnosis of Myocarditis is a diagnostic tool used specifically in the field of cardiology. This calculator is applied to patients suspected of having myocarditis, an inflammation of the heart muscle. The Lake Louise Criteria utilizes cardiac magnetic resonance imaging (MRI) findings to aid in the diagnosis of myocarditis.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Stethoscope className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Clinical Utility</h4>
                  <p className="text-gray-700 leading-relaxed">
                    The clinical utility of this calculator lies in its ability to provide a standardized approach to the interpretation of cardiac MRI findings in suspected myocarditis, thereby aiding in the accurate diagnosis and subsequent management of this condition.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Exclusion Criteria</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Exclusion criteria for the use of the Lake Louise Criteria include patients who are contraindicated for MRI such as those with certain types of implanted medical devices (e.g., certain pacemakers or neurostimulators), severe kidney disease, or claustrophobia. Additionally, it may not be applicable in cases where myocarditis is not the primary differential diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Assessment */}
      <Card className="shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">MRI Criteria Assessment</h3>
              <p className="text-gray-600">Evaluate each cardiac MRI finding</p>
            </div>
            
            {/* Live Score Display */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Current Score</p>
                <div className={`text-3xl font-bold transition-all duration-500 ${
                  animationPhase === 'calculating' ? 'scale-110' : 'scale-100'
                } ${
                  currentScore === 0 ? 'text-gray-400' :
                  currentScore === 1 ? 'text-amber-600' :
                  currentScore === 2 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {currentScore}/3
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {parameters.map((param, index) => {
              const IconComponent = param.icon;
              const isSelected = data[param.key] !== null;
              const isPositive = data[param.key] === true;
              
              return (
                <div 
                  key={param.key} 
                  className={`group relative transition-all duration-500 transform ${
                    animationPhase === 'calculating' ? 'scale-[0.98]' : 'scale-100'
                  } ${isSelected ? 'hover:scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                    isSelected 
                      ? isPositive 
                        ? 'border-red-200 bg-red-50/50' 
                        : 'border-green-200 bg-green-50/50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  } p-6 shadow-sm hover:shadow-lg`}>
                    
                    {/* Criterion Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                          isSelected
                            ? isPositive
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                        }`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{param.title}</h4>
                          <p className="text-gray-700 text-sm font-medium mb-2">{param.label}</p>
                          <p className="text-gray-600 text-sm leading-relaxed">{param.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {param.points} point
                        </Badge>
                        {isSelected && (
                          <div className="flex items-center space-x-1 text-sm font-medium">
                            {isPositive ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-red-600" />
                                <span className="text-red-700">Present</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700">Absent</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Selection Buttons */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange(param.key, true)}
                        className={`flex-1 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                          data[param.key] === true
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white shadow-lg transform scale-105'
                            : 'bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md'
                        } focus:outline-none focus:ring-4 focus:ring-red-200`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Present</span>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleInputChange(param.key, false)}
                        className={`flex-1 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                          data[param.key] === false
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-lg transform scale-105'
                            : 'bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md'
                        } focus:outline-none focus:ring-4 focus:ring-green-200`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <XCircle className="h-4 w-4" />
                          <span>Absent</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="shadow-xl border-0">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleCalculate}
              disabled={!allFieldsFilled}
              className={`flex-1 h-14 text-lg font-semibold transition-all duration-300 ${
                allFieldsFilled 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl' 
                  : 'bg-gray-300 cursor-not-allowed'
              } ${animationPhase === 'calculating' ? 'animate-pulse' : ''}`}
            >
              {animationPhase === 'calculating' ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Calculate Score</span>
                </div>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="h-14 px-8 border-2 hover:border-gray-400 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className={`transition-all duration-700 ease-out transform ${
          animationPhase === 'complete' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <Card className={`shadow-2xl border-0 overflow-hidden ${getRiskConfig(result.riskLevel).bg}`}>
            <div className={`h-2 bg-gradient-to-r ${getRiskConfig(result.riskLevel).color}`}></div>
            
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Score Display */}
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getRiskConfig(result.riskLevel).color} shadow-2xl transform transition-all duration-500 ${
                    animationPhase === 'complete' ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
                  }`}>
                    <span className="text-3xl font-bold text-white">
                      {result.score}
                    </span>
                  </div>
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-ping"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <Badge className={`px-4 py-2 text-lg font-semibold ${getRiskConfig(result.riskLevel).badge}`}>
                      {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900">
                    Score: {result.score}/3 Points
                  </h3>
                </div>
                
                {/* Interpretation */}
                <div className="grid xl:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-left">
                    <div className="flex items-start space-x-3 mb-3">
                      <Brain className={`h-6 w-6 mt-1 ${getRiskConfig(result.riskLevel).text}`} />
                      <h4 className="font-bold text-gray-900 text-lg">Clinical Interpretation</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{result.interpretation}</p>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-left">
                    <div className="flex items-start space-x-3 mb-3">
                      <Stethoscope className={`h-6 w-6 mt-1 ${getRiskConfig(result.riskLevel).text}`} />
                      <h4 className="font-bold text-gray-900 text-lg">Clinical Recommendation</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Disclaimer */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Clinical Advisory</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>For Healthcare Professionals:</strong> The Lake Louise Criteria should be interpreted within the appropriate clinical context and used in conjunction with comprehensive clinical assessment. This tool is designed to support, not replace, clinical judgment. Always consider patient history, symptoms, and other diagnostic findings when making treatment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const LakeLouiseCriteriaCalculator = React.memo(LakeLouiseCriteriaCalculatorComponent);

export default LakeLouiseCriteriaCalculator;