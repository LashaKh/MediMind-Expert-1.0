import React from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, Info, Lightbulb, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { CalculatorRecommendation } from '../../services/calculatorRecommendation';

interface ClinicalPathway {
  id: string;
  title: string;
  description: string;
  steps: PathwayStep[];
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface PathwayStep {
  id: string;
  title: string;
  action: string;
  timeframe?: string;
  calculators?: string[];
  type: 'assessment' | 'intervention' | 'monitoring' | 'calculation';
}

interface ClinicalPathwaysProps {
  currentCalculator?: string;
  calculatorResult?: any;
  riskLevel?: 'low' | 'intermediate' | 'high';
  relatedCalculators?: CalculatorRecommendation[];
  onCalculatorSelect?: (calculatorId: string) => void;
  className?: string;
}

export const ClinicalPathways: React.FC<ClinicalPathwaysProps> = ({
  currentCalculator,
  calculatorResult,
  riskLevel = 'intermediate',
  relatedCalculators = [],
  onCalculatorSelect,
  className = ''
}) => {
  
  // Define clinical pathways based on calculator results
  const getPathwaysForCalculator = (calculatorId?: string, risk?: string): ClinicalPathway[] => {
    const pathways: Record<string, ClinicalPathway[]> = {
      'ascvd': [
        {
          id: 'ascvd-prevention',
          title: 'Primary Prevention Pathway',
          description: 'Evidence-based approach to cardiovascular risk reduction',
          priority: riskLevel === 'high' ? 'high' : 'medium',
          timeframe: '3-6 months',
          steps: [
            {
              id: 'lifestyle',
              title: 'Lifestyle Interventions',
              action: 'Implement diet, exercise, smoking cessation counseling',
              timeframe: 'Immediate',
              type: 'intervention'
            },
            {
              id: 'statin',
              title: 'Statin Therapy Assessment',
              action: 'Consider moderate to high-intensity statin based on risk level',
              timeframe: '2-4 weeks',
              type: 'intervention'
            },
            {
              id: 'monitoring',
              title: 'Follow-up Assessment',
              action: 'Lipid panel, medication tolerance, lifestyle adherence',
              timeframe: '6-12 weeks',
              type: 'monitoring'
            }
          ]
        }
      ],
      'timi-risk': [
        {
          id: 'acs-management',
          title: 'Acute Coronary Syndrome Management',
          description: 'Risk-stratified approach to ACS management',
          priority: 'high',
          timeframe: '24-48 hours',
          steps: [
            {
              id: 'initial-care',
              title: 'Initial Stabilization',
              action: 'Antiplatelet therapy, anticoagulation, symptom control',
              timeframe: 'Immediate',
              type: 'intervention'
            },
            {
              id: 'grace-assessment',
              title: 'GRACE Risk Assessment',
              action: 'Calculate GRACE score for additional risk stratification',
              calculators: ['grace-risk'],
              timeframe: '6-12 hours',
              type: 'calculation'
            },
            {
              id: 'invasive-strategy',
              title: 'Invasive Strategy Decision',
              action: 'Determine timing of cardiac catheterization based on risk',
              timeframe: '24-48 hours',
              type: 'assessment'
            }
          ]
        }
      ],
      'atrial-fibrillation': [
        {
          id: 'afib-management',
          title: 'Atrial Fibrillation Management',
          description: 'Comprehensive approach to AF stroke prevention',
          priority: riskLevel === 'high' ? 'high' : 'medium',
          timeframe: '2-4 weeks',
          steps: [
            {
              id: 'anticoagulation',
              title: 'Anticoagulation Decision',
              action: 'Initiate OAC based on CHA₂DS₂-VASc and HAS-BLED scores',
              timeframe: 'Immediate',
              type: 'intervention'
            },
            {
              id: 'rate-rhythm',
              title: 'Rate vs Rhythm Control',
              action: 'Determine optimal heart rate/rhythm management strategy',
              timeframe: '1-2 weeks',
              type: 'assessment'
            },
            {
              id: 'followup',
              title: 'Anticoagulation Monitoring',
              action: 'Regular INR monitoring (warfarin) or clinical assessment (DOAC)',
              timeframe: 'Ongoing',
              type: 'monitoring'
            }
          ]
        }
      ],
      'heart-failure-staging': [
        {
          id: 'hf-management',
          title: 'Heart Failure Management Pathway',
          description: 'Stage-based approach to heart failure management',
          priority: 'medium',
          timeframe: '4-8 weeks',
          steps: [
            {
              id: 'guideline-therapy',
              title: 'Guideline-Directed Medical Therapy',
              action: 'Initiate ACE-I/ARB, beta-blocker, aldosterone antagonist',
              timeframe: '2-4 weeks',
              type: 'intervention'
            },
            {
              id: 'prognosis',
              title: 'Prognostic Assessment',
              action: 'Calculate MAGGIC or SHFM score for risk stratification',
              calculators: ['maggic', 'shfm'],
              timeframe: '4-6 weeks',
              type: 'calculation'
            },
            {
              id: 'device-therapy',
              title: 'Device Therapy Evaluation',
              action: 'Assess need for ICD/CRT based on guidelines',
              timeframe: '6-8 weeks',
              type: 'assessment'
            }
          ]
        }
      ]
    };

    return pathways[currentCalculator || ''] || [];
  };

  const pathways = getPathwaysForCalculator(currentCalculator, riskLevel);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'calculation':
        return '🧮';
      case 'intervention':
        return '💊';
      case 'monitoring':
        return '📊';
      default:
        return '🔍';
    }
  };

  if (pathways.length === 0 && relatedCalculators.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clinical Pathways */}
      {pathways.map((pathway) => (
        <div key={pathway.id} className={`border rounded-lg p-4 ${getPriorityColor(pathway.priority)}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getPriorityIcon(pathway.priority)}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {pathway.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {pathway.description} • {pathway.timeframe}
                </p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              pathway.priority === 'high' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : pathway.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}>
              {pathway.priority.toUpperCase()}
            </span>
          </div>

          {/* Pathway Steps */}
          <div className="space-y-3">
            {pathway.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-lg">{getStepIcon(step.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {index + 1}. {step.title}
                    </h5>
                    {step.timeframe && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {step.timeframe}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.action}
                  </p>
                  
                  {/* Related Calculators */}
                  {step.calculators && step.calculators.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Lightbulb className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Suggested calculators:
                      </span>
                      {step.calculators.map((calcId) => {
                        const calc = relatedCalculators.find(c => c.id === calcId);
                        return calc ? (
                          <Button
                            key={calcId}
                            variant="ghost"
                            size="sm"
                            onClick={() => onCalculatorSelect?.(calcId)}
                            className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                          >
                            {calc.name}
                          </Button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                {index < pathway.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Related Calculators */}
      {relatedCalculators.length > 0 && (
        <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Related Clinical Calculators
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {relatedCalculators.map((calc) => (
              <Button
                key={calc.id}
                variant="outline"
                size="sm"
                onClick={() => onCalculatorSelect?.(calc.id)}
                className="justify-start text-left h-auto py-2 px-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">🧮</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {calc.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {calc.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 