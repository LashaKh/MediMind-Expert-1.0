/**
 * ProviderSelection Component
 * Allows users to select which search providers to use and view their performance metrics
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckIcon,
  BoltIcon,
  ChartBarIcon,
  CpuChipIcon,
  BeakerIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import type { SearchProvider } from '@/utils/search/apiOrchestration';

interface ProviderPerformance {
  providerId: SearchProvider['id'];
  successRate: number;
  averageResponseTime: number;
  totalSearches: number;
  lastError?: string;
  lastErrorTime?: number;
}

interface ProviderSelectionProps {
  selectedProviders: SearchProvider['id'][];
  onProvidersChange: (providers: SearchProvider['id'][]) => void;
  performanceMetrics?: ProviderPerformance[];
  className?: string;
}

const PROVIDER_CONFIGS = {
  brave: {
    name: 'Brave Search',
    description: 'Fast web search with medical content filtering',
    icon: GlobeAltIcon,
    badge: 'Fast',
    badgeColor: 'bg-green-500',
    features: ['Real-time results', 'Privacy focused', 'Medical filtering']
  },
  exa: {
    name: 'Exa AI',
    description: 'AI-powered search for high-quality medical content',
    icon: CpuChipIcon,
    badge: 'AI-Powered',
    badgeColor: 'bg-blue-500',
    features: ['Quality ranking', 'Domain filtering', 'Semantic search']
  },
  perplexity: {
    name: 'Perplexity AI',
    description: 'Advanced AI research with medical synthesis',
    icon: BoltIcon,
    badge: 'Research',
    badgeColor: 'bg-purple-500',
    features: ['AI synthesis', 'Citation analysis', 'Medical domains']
  },
  clinicaltrials: {
    name: 'ClinicalTrials.gov',
    description: 'Official clinical trials database',
    icon: BeakerIcon,
    badge: 'Official',
    badgeColor: 'bg-orange-500',
    features: ['Phase filtering', 'Location search', 'Recruitment status']
  }
} as const;

export const ProviderSelection: React.FC<ProviderSelectionProps> = ({
  selectedProviders,
  onProvidersChange,
  performanceMetrics = [],
  className = ''
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleProvider = (providerId: SearchProvider['id']) => {
    if (selectedProviders.includes(providerId)) {
      // Allow disabling providers even if only one is left
      onProvidersChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onProvidersChange([...selectedProviders, providerId]);
    }
  };

  const getProviderMetrics = (providerId: SearchProvider['id']) => {
    return performanceMetrics.find(m => m.providerId === providerId);
  };

  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) return `${Math.round(timeMs)}ms`;
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  const getPerformanceColor = (successRate: number) => {
    if (successRate >= 95) return 'text-green-600';
    if (successRate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Collapsed Header with Floating Button */}
      {isCollapsed ? (
        <div className="relative">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-indigo-600" />
              {t('search.providers.title', 'Search Providers')}
            </h3>
            <span className="text-sm text-gray-500">
              {selectedProviders.length} {t('search.providers.of', 'of')} {Object.keys(PROVIDER_CONFIGS).length} {t('search.providers.selected', 'selected')}
            </span>
          </div>
          
          {/* Floating Expand Button */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            title={t('search.providers.expand', 'Expand search providers')}
          >
            <ChevronDownIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // Expanded View
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-indigo-600" />
              {t('search.providers.title', 'Search Providers')}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {selectedProviders.length} {t('search.providers.of', 'of')} {Object.keys(PROVIDER_CONFIGS).length} {t('search.providers.selected', 'selected')}
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title={t('search.providers.collapse', 'Collapse search providers')}
              >
                <ChevronUpIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {Object.entries(PROVIDER_CONFIGS).map(([providerId, config]) => {
              const isSelected = selectedProviders.includes(providerId as SearchProvider['id']);
              const metrics = getProviderMetrics(providerId as SearchProvider['id']);
              const IconComponent = config.icon;
              // Allow all providers to be deselected - no longer prevent last provider deselection
              const isLastProvider = false;

              return (
                <div
                  key={providerId}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-300 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{config.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${config.badgeColor}`}>
                            {config.badge}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {config.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Performance Metrics */}
                        {metrics && (
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <CheckIcon className={`w-3 h-3 ${getPerformanceColor(metrics.successRate)}`} />
                               <span>{metrics.successRate.toFixed(1)}% {t('search.providers.metrics.success', 'success')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatResponseTime(metrics.averageResponseTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ChartBarIcon className="w-3 h-3" />
                               <span>{metrics.totalSearches} {t('search.providers.metrics.searches', 'searches')}</span>
                            </div>
                            
                            {metrics.lastError && Date.now() - (metrics.lastErrorTime || 0) < 300000 && (
                               <div className="flex items-center gap-1 text-red-600">
                                 <ExclamationTriangleIcon className="w-3 h-3" />
                                 <span>{t('search.providers.metrics.recentIssue', 'Recent issue')}</span>
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleProvider(providerId as SearchProvider['id'])}
                      disabled={isLastProvider}
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${
                        isLastProvider ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title={isLastProvider ? t('search.providers.requireOne', 'At least one provider must be selected') : undefined}
                    >
                      {isSelected ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selection Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            {selectedProviders.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                <span>{t('search.providers.noneSelected', 'No providers selected. Please select at least one provider to search.')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {t('search.providers.summary', 'Selected providers will search in parallel for comprehensive results')}
                </span>
                <span className="font-medium text-indigo-600">
                  {selectedProviders.length} {t('search.providers.active', 'active')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSelection;