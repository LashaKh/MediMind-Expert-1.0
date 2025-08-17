import React from 'react';
import { TrendingUp, TrendingDown, Activity, Stethoscope, Droplets, Wind, Heart, Gauge } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { ABGSearchFilters, ABGType } from '../../../../types/abg';
import { ParameterCard } from '../shared/ParameterCard';

interface ClinicalSectionProps {
  filters: ABGSearchFilters;
  updateFilter: (key: keyof ABGSearchFilters, value: any) => void;
}

const abgTypes = [
  { value: 'Arterial Blood Gas', label: 'Arterial', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'Venous Blood Gas', label: 'Venous', icon: <TrendingDown className="h-4 w-4" /> }
];

export const ClinicalSection: React.FC<ClinicalSectionProps> = ({
  filters,
  updateFilter
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-3">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Clinical Parameters</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Search by pH levels, gas concentrations, and other clinical values with precision ranges
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* pH Range */}
        <ParameterCard
          title="pH Range"
          description="Normal: 7.35-7.45"
          icon={<Droplets className="h-4 w-4" />}
          color="red"
          minValue={filters.phMin}
          maxValue={filters.phMax}
          onMinChange={(value) => updateFilter('phMin', value)}
          onMaxChange={(value) => updateFilter('phMax', value)}
          placeholder={{ min: '7.35', max: '7.45' }}
          step="0.01"
          inputProps={{ min: '6.8', max: '7.8' }}
        />

        {/* PaCO2 Range */}
        <ParameterCard
          title="PaCO2 (mmHg)"
          description="Normal: 35-45"
          icon={<Wind className="h-4 w-4" />}
          color="blue"
          minValue={filters.paco2Min}
          maxValue={filters.paco2Max}
          onMinChange={(value) => updateFilter('paco2Min', value)}
          onMaxChange={(value) => updateFilter('paco2Max', value)}
          placeholder={{ min: '35', max: '45' }}
        />

        {/* HCO3 Range */}
        <ParameterCard
          title="HCO3 (mEq/L)"
          description="Normal: 22-26"
          icon={<Heart className="h-4 w-4" />}
          color="emerald"
          minValue={filters.hco3Min}
          maxValue={filters.hco3Max}
          onMinChange={(value) => updateFilter('hco3Min', value)}
          onMaxChange={(value) => updateFilter('hco3Max', value)}
          placeholder={{ min: '22', max: '26' }}
        />

        {/* PaO2 Range */}
        <ParameterCard
          title="PaO2 (mmHg)"
          description="Normal: 80-100"
          icon={<Gauge className="h-4 w-4" />}
          color="amber"
          minValue={filters.pao2Min}
          maxValue={filters.pao2Max}
          onMinChange={(value) => updateFilter('pao2Min', value)}
          onMaxChange={(value) => updateFilter('pao2Max', value)}
          placeholder={{ min: '80', max: '100' }}
        />
      </div>

      {/* ABG Type Selection */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <Label className="text-sm font-bold text-slate-800">ABG Type</Label>
            <p className="text-xs text-slate-600">Filter by blood gas type</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {abgTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateFilter('type', filters.type === type.value ? undefined : type.value as ABGType)}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 text-left group",
                filters.type === type.value
                  ? "bg-purple-100 border-purple-300 text-purple-800"
                  : "bg-white/70 border-purple-200/60 hover:bg-purple-50 hover:border-purple-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  filters.type === type.value
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                )}>
                  {type.icon}
                </div>
                <span className="font-medium">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};