import React from 'react';
import { 
  Heart, 
  Target, 
  Clock, 
  Shield, 
  Stethoscope, 
  Check,
  Brain,
  BookOpen,
  Star
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export interface GRACEResult {
  score: number;
  inHospitalMortality: number;
  oneYearMortality: number;
  sixMonthMortality: number;
  riskCategory: 'low' | 'intermediate' | 'high';
  invasiveStrategy: string;
  recommendation: string;
  urgency: 'low' | 'moderate' | 'high';
  validationStatus: string;
  riskDetails: {
    shortTermRisk: number;
    longTermRisk: number;
    interventionWindow: string;
  };
}

interface GraceResultDisplayProps {
  result: GRACEResult;
}

export const GraceResultDisplay: React.FC<GraceResultDisplayProps> = ({ result }) => {
  const { t } = useTranslation();

  const expertInsights = [
    {
      icon: Brain,
      title: t('calculators.cardiology.grace.interpretation_title'),
      content: `Based on the GRACE 2.0 score of ${result.score}, this patient falls into the ${result.riskCategory} risk category with ${result.sixMonthMortality}% 6-month mortality risk. Clinical decision-making should focus on ${result.invasiveStrategy.toLowerCase()}.`
    },
    {
      icon: Stethoscope,
      title: t('calculators.cardiology.grace.clinical_context_title'),
      content: `The ${result.riskCategory} risk stratification indicates ${result.recommendation.toLowerCase()}. Consider patient comorbidities, bleeding risk, and individual clinical circumstances when interpreting these results.`
    },
    {
      icon: BookOpen,
      title: t('calculators.cardiology.grace.evidence_base_title'),
      content: t('calculators.cardiology.grace.grace_validation_note')
    }
  ];

  const clinicalPearls = [
    {
      icon: Star,
      title: t('calculators.cardiology.grace.risk_stratification_title'),
      content: t('calculators.cardiology.grace.risk_stratification_note')
    },
    {
      icon: Target,
      title: t('calculators.cardiology.grace.timing_considerations_title'),
      content: t('calculators.cardiology.grace.timing_considerations_note')
    },
    {
      icon: Shield,
      title: t('calculators.cardiology.grace.clinical_integration_title'),
      content: t('calculators.cardiology.grace.clinical_integration_note')
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Results Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
        
        {/* Main Score Display */}
        <div className="relative p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 shadow-2xl shadow-red-500/25 mb-8 animate-pulse">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-rose-800 dark:from-white dark:via-red-300 dark:to-rose-200 bg-clip-text text-transparent mb-4">
              {t('calculators.cardiology.grace.results_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('calculators.cardiology.grace.results_description')}
            </p>
          </div>

          {/* Risk Score Circle */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/25 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl font-black text-white mb-2">
                    {result.score}
                  </div>
                  <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                    {t('calculators.cardiology.grace.grace_score')}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Risk Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {/* In-Hospital Mortality */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-700/50 p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-3xl font-black text-red-600 dark:text-red-400">
                    {result.inHospitalMortality}%
                  </div>
                </div>
                <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">
                  {t('calculators.cardiology.grace.in_hospital_mortality')}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {t('calculators.cardiology.grace.short_term_risk')}
                </p>
              </div>
            </div>

            {/* 1-Year Mortality */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/50 p-6 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                    {result.oneYearMortality}%
                  </div>
                </div>
                <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                  {t('calculators.cardiology.grace.one_year_mortality')}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('calculators.cardiology.grace.long_term_prognosis')}
                </p>
              </div>
            </div>

            {/* Risk Category */}
            <div className={`group relative overflow-hidden rounded-2xl border p-6 hover:scale-105 transition-all duration-300 ${
              result.riskCategory === 'high' 
                ? 'bg-gradient-to-br from-rose-50/80 to-red-50/80 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200/50 dark:border-rose-700/50'
                : result.riskCategory === 'intermediate'
                ? 'bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-700/50'
                : 'bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-700/50'
            }`}>
              <div className={`absolute inset-0 transition-all duration-300 ${
                result.riskCategory === 'high' 
                  ? 'bg-gradient-to-br from-rose-500/5 to-red-500/5 group-hover:from-rose-500/10 group-hover:to-red-500/10'
                  : result.riskCategory === 'intermediate'
                  ? 'bg-gradient-to-br from-amber-500/5 to-yellow-500/5 group-hover:from-amber-500/10 group-hover:to-yellow-500/10'
                  : 'bg-gradient-to-br from-emerald-500/5 to-green-500/5 group-hover:from-emerald-500/10 group-hover:to-green-500/10'
              }`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    result.riskCategory === 'high' 
                      ? 'bg-rose-500/20'
                      : result.riskCategory === 'intermediate'
                      ? 'bg-amber-500/20'
                      : 'bg-emerald-500/20'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      result.riskCategory === 'high' 
                        ? 'text-rose-600 dark:text-rose-400'
                        : result.riskCategory === 'intermediate'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`} />
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    result.riskCategory === 'high' 
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      : result.riskCategory === 'intermediate'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {result.riskCategory.toUpperCase()}
                  </div>
                </div>
                <h4 className={`font-bold mb-2 ${
                  result.riskCategory === 'high' 
                    ? 'text-rose-800 dark:text-rose-200'
                    : result.riskCategory === 'intermediate'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-emerald-800 dark:text-emerald-200'
                }`}>
                  {t('calculators.cardiology.grace.risk_category_label')}
                </h4>
                <p className={`text-sm ${
                  result.riskCategory === 'high' 
                    ? 'text-rose-700 dark:text-rose-300'
                    : result.riskCategory === 'intermediate'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}>
                  {t('calculators.cardiology.grace.clinical_risk_stratification')}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Recommendations */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
                  <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {t('calculators.cardiology.grace.clinical_recommendations_title')}
                </h4>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {result.invasiveStrategy}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {result.recommendation}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {t('calculators.cardiology.grace.intervention_window')}: {result.riskDetails.interventionWindow}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Insights Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-indigo-500/10 border border-blue-200/50 dark:border-blue-400/30 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-500/10"></div>
        <div className="relative p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {t('calculators.cardiology.grace.expert_insights')}
            </h3>
          </div>
          
          <div className="grid gap-4">
            {expertInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-6 hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
                  <div className="relative flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        {insight.title}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clinical Pearls */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-400/30 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-emerald-500/10"></div>
        <div className="relative p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
              <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {t('calculators.cardiology.grace.clinical_pearls')}
            </h3>
          </div>
          
          <div className="grid gap-4">
            {clinicalPearls.map((pearl, index) => {
              const IconComponent = pearl.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 p-6 hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
                  <div className="relative flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                        {pearl.title}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {pearl.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};