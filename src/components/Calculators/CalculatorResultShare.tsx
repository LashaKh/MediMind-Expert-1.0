import React, { useState } from 'react';
import { Share2, MessageCircle, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useCalculatorIntegration, CalculatorResult } from '../../hooks/useCalculatorIntegration';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, safe, ErrorSeverity } from '../../lib/utils/errorHandling';

interface CalculatorResultShareProps {
  calculatorName: string;
  calculatorId: string;
  results: Record<string, any>;
  interpretation: string;
  recommendations: string[];
  riskLevel?: 'low' | 'intermediate' | 'high';
  className?: string;
}

export const CalculatorResultShare = React.memo<CalculatorResultShareProps>(({
  calculatorName,
  calculatorId,
  results,
  interpretation,
  recommendations,
  riskLevel = 'intermediate',
  className = ''
}) => {
  const { t } = useTranslation();
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  // Get calculator integration, but handle cases where ChatProvider is not available
  const [integration, error] = safe(() => {
    return useCalculatorIntegration();
  }, {
    context: 'calculator integration initialization',
    severity: ErrorSeverity.LOW,
    showToast: false
  });

  const shareCalculatorResults = error ? undefined : integration?.shareCalculatorResults;

  const handleShareWithAI = async () => {
    if (!shareCalculatorResults) {

      return;
    }

    setIsSharing(true);
    
    const [, shareError] = await safeAsync(async () => {
      const resultData: CalculatorResult = {
        calculatorId,
        calculatorName,
        inputs: {}, // Would be populated with actual calculator inputs
        results,
        interpretation,
        recommendations,
        timestamp: new Date()
      };

      shareCalculatorResults(resultData);
      setIsShared(true);
      
      // Reset shared status after a few seconds
      setTimeout(() => {
        setIsShared(false);
      }, 3000);
    }, {
      context: 'sharing calculator results with AI',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    setIsSharing(false);
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
    }
  };

  return (
    <div className={`border-2 rounded-2xl p-4 sm:p-6 mt-6 shadow-lg backdrop-blur-sm ${getRiskColor()} ${className}`}>
      {/* Mobile-first responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 p-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
            {getRiskIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {t('calculators.common.calculator_results_summary')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {calculatorName} • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Mobile-optimized share button */}
        <div className="flex justify-center sm:justify-end">
          {shareCalculatorResults && (
            <Button
              variant="outline"
              onClick={handleShareWithAI}
              disabled={isSharing || isShared}
              className="flex items-center space-x-2 min-h-[44px] min-w-[44px] px-4 py-3 rounded-xl font-semibold border-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isShared ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="hidden sm:inline">{t('calculators.common.shared')}</span>
              </>
            ) : isSharing ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span className="hidden sm:inline">{t('calculators.common.sharing')}</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('calculators.common.share_with_ai')}</span>
              </>
            )}
          </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="space-y-3">
        {/* Key Results - Mobile-optimized layout */}
        <div>
          <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            {t('calculators.common.key_results')}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {Object.entries(results).map(([key, value]) => {
              // Create a mapping for proper translation of field names
              const getTranslatedFieldName = (fieldKey: string): string => {
                const fieldTranslations: Record<string, string> = {
                  // GDM Calculator specific fields
                  screeningTiming: t('calculators.gdm_screening.screening_timing'),
                  riskLevel: t('calculators.gdm_screening.risk_level'),
                  testingProtocol: t('calculators.gdm_screening.testing_protocol'),
                  
                  // VBAC Calculator specific fields
                  successProbability: t('calculators.vbac_success.success_probability'),
                  
                  // Endometrial Cancer Risk Calculator specific fields
                  annualRisk: t('calculators.common.annual_risk'),
                  protectiveFactors: t('calculators.common.protective_factors'),
                  
                  // Common calculator fields
                  ascvdRisk: t('calculators.common.ascvd_risk'),
                  tenYearRisk: t('calculators.common.ten_year_risk'),
                  lifetimeRisk: t('calculators.common.lifetime_risk'),
                  'Lifetime Risk': t('calculators.common.lifetime_risk'),
                  riskMultiplier: t('calculators.common.risk_multiplier'),
                  'Risk Multiplier': t('calculators.common.risk_multiplier'),
                  screeningRecommendation: t('calculators.common.screening_recommendation'),
                  'Screening Recommendation': t('calculators.common.screening_recommendation'),
                  prophylacticSurgeryDiscussion: t('calculators.common.prophylactic_surgery_discussion'),
                  'Prophylactic Surgery Discussion': t('calculators.common.prophylactic_surgery_discussion'),
                  riskCategory: t('calculators.common.risk_category'),
                  recommendations: t('calculators.common.recommendations'),
                  
                  // Fallback to automatic conversion with proper capitalization
                  default: fieldKey.replace(/([A-Z])/g, ' $1').trim()
                };
                
                return fieldTranslations[fieldKey] || fieldTranslations.default;
              };
              
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-600/30 min-h-[44px]">
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium flex-1 pr-3">
                    {getTranslatedFieldName(key)}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm flex-shrink-0">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    {key.includes('percentage') || key.includes('risk') || key.includes('Rate') ? '%' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Interpretation - Mobile-optimized */}
        <div>
          <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
            {t('calculators.common.clinical_interpretation_label')}
          </h5>
          <div className="p-4 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-600/30">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {interpretation}
            </p>
          </div>
        </div>

        {/* Recommendations - Mobile-friendly list */}
        {recommendations.length > 0 && (
          <div>
            <h5 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              {t('calculators.common.recommendations_label')}
            </h5>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-600/30 min-h-[44px]">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</span>
                </div>
              ))}
              {recommendations.length > 3 && (
                <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-600/30 text-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    +{recommendations.length - 3} {t('calculators.common.more_recommendations')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Share Information - Mobile-optimized footer */}
        <div className="pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl">
            <Share2 className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              {t('calculators.common.share_results_description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
CalculatorResultShare.displayName = 'CalculatorResultShare'; 