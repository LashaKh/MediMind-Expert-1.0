import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Filter,
  Calendar,
  User,
  Target,
  Clock,
  Bookmark,
  X,
  RotateCcw,
  Save,
  Star,
  Settings
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { ABGFilters, ABGSearchFilters, PatientInfo, ABGType } from '../../../types/abg';

interface AdvancedFiltersProps {
  filters: ABGFilters;
  onFiltersChange: (filters: Partial<ABGFilters>) => void;
  patients: PatientInfo[];
  onSearch?: (searchFilters: ABGSearchFilters) => void;
  className?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: ABGFilters;
  icon?: React.ElementType;
  color?: string;
  isDefault?: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: ABGSearchFilters;
  createdAt: string;
  useCount: number;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'recent',
    name: 'Recent Analyses',
    description: 'Last 7 days',
    filters: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    icon: Calendar,
    color: 'text-blue-600',
    isDefault: true
  },
  {
    id: 'pending',
    name: 'Pending Review',
    description: 'No interpretation yet',
    filters: {
      hasInterpretation: false
    },
    icon: Clock,
    color: 'text-orange-600'
  },
  {
    id: 'completed',
    name: 'Completed',
    description: 'With interpretation & action plan',
    filters: {
      hasInterpretation: true,
      hasActionPlan: true
    },
    icon: Target,
    color: 'text-green-600'
  },
  {
    id: 'arterial',
    name: 'Arterial Only',
    description: 'Arterial blood gas analyses',
    filters: {
      type: 'Arterial Blood Gas'
    },
    icon: User,
    color: 'text-purple-600'
  },
  {
    id: 'thisMonth',
    name: 'This Month',
    description: 'Current month analyses',
    filters: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    },
    icon: Calendar,
    color: 'text-teal-600'
  }
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  patients,
  onSearch: _onSearch,
  className
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customFilters, setCustomFilters] = useState<ABGSearchFilters>({});
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('abg-saved-searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {

      }
    }
  }, []);

  // Save searches to localStorage
  const saveSavedSearches = useCallback((searches: SavedSearch[]) => {
    localStorage.setItem('abg-saved-searches', JSON.stringify(searches));
    setSavedSearches(searches);
  }, []);

  // Apply preset filter
  const applyPreset = useCallback((preset: FilterPreset) => {
    setActivePreset(preset.id);
    onFiltersChange(preset.filters);
  }, [onFiltersChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActivePreset(null);
    setCustomFilters({});
    onFiltersChange({
      patientId: undefined,
      type: undefined,
      startDate: undefined,
      endDate: undefined,
      hasInterpretation: undefined,
      hasActionPlan: undefined
    });
  }, [onFiltersChange]);

  // Handle custom filter change
  const handleCustomFilterChange = useCallback((key: keyof ABGSearchFilters, value: any) => {
    const newFilters = { ...customFilters, [key]: value };
    setCustomFilters(newFilters);
    
    // Convert to ABGFilters format
    const abgFilters: Partial<ABGFilters> = {
      patientId: newFilters.patientId,
      type: newFilters.type,
      startDate: newFilters.dateRange?.start,
      endDate: newFilters.dateRange?.end,
      hasInterpretation: newFilters.hasInterpretation,
      hasActionPlan: newFilters.hasActionPlan
    };
    
    setActivePreset(null); // Clear active preset when custom filters are applied
    onFiltersChange(abgFilters);
  }, [customFilters, onFiltersChange]);

  // Save current search
  const saveCurrentSearch = useCallback(() => {
    if (!saveSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      filters: {
        ...customFilters,
        ...filters
      },
      createdAt: new Date().toISOString(),
      useCount: 0
    };

    const updated = [...savedSearches, newSearch];
    saveSavedSearches(updated);
    setSaveSearchName('');
    setShowSaveDialog(false);
  }, [saveSearchName, customFilters, filters, savedSearches, saveSavedSearches]);

  // Apply saved search
  const applySavedSearch = useCallback((search: SavedSearch) => {
    const updated = savedSearches.map(s => 
      s.id === search.id ? { ...s, useCount: s.useCount + 1 } : s
    );
    saveSavedSearches(updated);

    // Apply the search
    onFiltersChange({
      patientId: search.filters.patientId,
      type: search.filters.type,
      startDate: search.filters.dateRange?.start,
      endDate: search.filters.dateRange?.end,
      hasInterpretation: search.filters.hasInterpretation,
      hasActionPlan: search.filters.hasActionPlan
    });
    
    setActivePreset(null);
  }, [savedSearches, saveSavedSearches, onFiltersChange]);

  // Delete saved search
  const deleteSavedSearch = useCallback((searchId: string) => {
    const updated = savedSearches.filter(s => s.id !== searchId);
    saveSavedSearches(updated);
  }, [savedSearches, saveSavedSearches]);

  // Get active filters count
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  // Quick date presets
  const datePresets = [
    { label: 'Today', days: 1 },
    { label: 'Last 3 days', days: 3 },
    { label: 'Last week', days: 7 },
    { label: 'Last month', days: 30 },
    { label: 'Last 3 months', days: 90 }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">{t('abg.filtersAdvanced.title', 'Advanced Filters')}</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {t('abg.filtersAdvanced.activeCount', '{{count}} active', { count: activeFiltersCount })}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4" />
              {t('abg.filtersAdvanced.clear', 'Clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="flex flex-wrap gap-2">
        {DEFAULT_PRESETS.map(preset => {
          const Icon = preset.icon || Filter;
          return (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2"
            >
              <Icon className={cn("h-4 w-4", preset.color)} />
              {t(`abg.filtersAdvanced.presets.${preset.id}.name` as any, preset.name)}
            </Button>
          );
        })}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Patient Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                {t('abg.filtersAdvanced.patient', 'Patient')}
              </label>
              <select
                value={filters.patientId || ''}
                onChange={(e) => handleCustomFilterChange('patientId', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('abg.filtersAdvanced.allPatients', 'All Patients')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Analysis Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4 inline mr-1" />
                {t('abg.filtersAdvanced.analysisType', 'Analysis Type')}
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleCustomFilterChange('type', e.target.value as ABGType || undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('abg.results.filters.allTypes', 'All Types')}</option>
                <option value="Arterial Blood Gas">{t('abg.results.filters.types.arterial', 'Arterial Blood Gas')}</option>
                <option value="Venous Blood Gas">{t('abg.results.filters.types.venous', 'Venous Blood Gas')}</option>
              </select>
            </div>

            {/* Quick Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                {t('abg.filtersAdvanced.quickDates', 'Quick Dates')}
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const days = parseInt(e.target.value);
                    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                    handleCustomFilterChange('dateRange', {
                      start: startDate.toISOString().split('T')[0],
                      end: undefined
                    });
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('abg.filtersAdvanced.selectPeriod', 'Select period...')}</option>
                {datePresets.map(preset => (
                  <option key={preset.days} value={preset.days}>
                    {t(`abg.filtersAdvanced.datePresets.${preset.days}` as any, preset.label)}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('abg.results.filters.startDate', 'Start Date')}
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleCustomFilterChange('dateRange', {
                  ...customFilters.dateRange,
                  start: e.target.value || undefined
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('abg.results.filters.endDate', 'End Date')}
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleCustomFilterChange('dateRange', {
                  ...customFilters.dateRange,
                  end: e.target.value || undefined
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('abg.filtersAdvanced.statusFilters', 'Status Filters')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasInterpretation === true}
                    onChange={(e) => handleCustomFilterChange('hasInterpretation', e.target.checked || undefined)}
                  />
                  <span className="text-sm">{t('abg.results.filters.hasInterpretation', 'Has Interpretation')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasActionPlan === true}
                    onChange={(e) => handleCustomFilterChange('hasActionPlan', e.target.checked || undefined)}
                  />
                  <span className="text-sm">{t('abg.results.filters.hasActionPlan', 'Has Action Plan')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Search */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                {t('abg.filtersAdvanced.saveSearch.title', 'Save Search')}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={activeFiltersCount === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('abg.filtersAdvanced.saveSearch.saveCurrent', 'Save Current')}
              </Button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('abg.filtersAdvanced.saveSearch.placeholder', 'Search name...')}
                    value={saveSearchName}
                    onChange={(e) => setSaveSearchName(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && saveCurrentSearch()}
                  />
                  <Button size="sm" onClick={saveCurrentSearch}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            {t('abg.filtersAdvanced.savedSearches', 'Saved Searches')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches
              .sort((a, b) => b.useCount - a.useCount) // Sort by most used
              .slice(0, 8) // Show only top 8
              .map(search => (
                <div key={search.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySavedSearch(search)}
                    className="flex items-center gap-2"
                  >
                    <Bookmark className="h-3 w-3" />
                    {search.name}
                    {search.useCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {search.useCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSavedSearch(search.id)}
                    className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFilters;