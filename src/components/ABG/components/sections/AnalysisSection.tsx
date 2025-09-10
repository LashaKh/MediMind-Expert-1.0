import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, BarChart3, CheckCircle2, Target, Gauge } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { ABGSearchFilters } from '../../../../types/abg';
import { interpretationOptions, severityLevels } from '../config/searchConfig';

interface AnalysisSectionProps {
  filters: ABGSearchFilters;
  updateFilter: (key: keyof ABGSearchFilters, value: any) => void;
}

export const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  filters,
  updateFilter
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl mb-4">
          <Brain className="h-8 w-8 text-[var(--foreground)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">AI Analysis Results</h2>
        <p className="text-[var(--foreground-tertiary)] max-w-md mx-auto">
          Filter by AI interpretations, confidence levels, and clinical assessments
        </p>
      </div>

      {/* Interpretation Types */}
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-bold text-[var(--foreground)] mb-4 block flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Primary Interpretation
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {interpretationOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('interpretation', 
                  filters.interpretation === option.value ? undefined : option.value
                )}
                className={cn(
                  "p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                  filters.interpretation === option.value
                    ? `bg-${option.color}-50 border-${option.color}-300 shadow-lg scale-105`
                    : "bg-[var(--component-card)]/70 border-[var(--glass-border-light)]/60 hover:bg-[var(--component-surface-primary)] hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-all",
                    filters.interpretation === option.value
                      ? `bg-${option.color}-500 text-[var(--foreground)] shadow-lg`
                      : `bg-${option.color}-50 text-${option.color}-600 group-hover:bg-${option.color}-100`
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--foreground)] mb-1">{option.label}</div>
                    <div className="text-xs text-[var(--foreground-tertiary)] leading-relaxed">{option.description}</div>
                  </div>
                </div>
                {filters.interpretation === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Severity Levels */}
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-[var(--glass-border-light)]/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl">
              <BarChart3 className="h-6 w-6 text-[var(--foreground)]" />
            </div>
            <div>
              <Label className="text-lg font-bold text-[var(--foreground)]">Severity Classification</Label>
              <p className="text-sm text-[var(--foreground-tertiary)]">Filter by clinical severity level</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {severityLevels.map((severity) => (
              <button
                key={severity.value}
                onClick={() => updateFilter('severity', 
                  filters.severity === severity.value ? undefined : severity.value
                )}
                className={cn(
                  "p-4 rounded-xl border transition-all text-center group",
                  filters.severity === severity.value
                    ? `bg-${severity.color}-50 border-${severity.color}-300 text-${severity.color}-800 shadow-lg`
                    : "bg-[var(--component-card)]/70 border-[var(--glass-border-light)]/60 hover:bg-[var(--component-surface-primary)] hover:shadow-md"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mx-auto mb-2 w-fit transition-colors",
                  filters.severity === severity.value
                    ? `bg-${severity.color}-500 text-[var(--foreground)]`
                    : `bg-${severity.color}-50 text-${severity.color}-600 group-hover:bg-${severity.color}-100`
                )}>
                  {severity.icon}
                </div>
                <div className="font-bold text-sm">{severity.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Analysis Features & Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-[var(--foreground)]" />
                </div>
                <Label className="text-base font-bold text-[var(--foreground)]">Analysis Features</Label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasInterpretation || false}
                    onChange={(e) => updateFilter('hasInterpretation', e.target.checked || undefined)}
                    className="rounded border-green-300 text-green-600 focus:ring-green-200"
                  />
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Has AI Interpretation</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasActionPlan || false}
                    onChange={(e) => updateFilter('hasActionPlan', e.target.checked || undefined)}
                    className="rounded border-green-300 text-green-600 focus:ring-green-200"
                  />
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Has Action Plan</span>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* AI Confidence Range */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Gauge className="h-5 w-5 text-[var(--foreground)]" />
              </div>
              <div>
                <Label className="text-base font-bold text-[var(--foreground)]">AI Confidence</Label>
                <p className="text-xs text-[var(--foreground-tertiary)]">Analysis certainty level</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--foreground)]">Min %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.confidenceMin ? (filters.confidenceMin * 100).toFixed(0) : ''}
                  onChange={(e) => updateFilter('confidenceMin', 
                    e.target.value ? parseFloat(e.target.value) / 100 : undefined
                  )}
                  className="bg-[var(--component-card)]/80 border-blue-200 focus:border-[var(--cardiology-accent-blue)] focus:ring-blue-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--foreground)]">Max %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.confidenceMax ? (filters.confidenceMax * 100).toFixed(0) : ''}
                  onChange={(e) => updateFilter('confidenceMax', 
                    e.target.value ? parseFloat(e.target.value) / 100 : undefined
                  )}
                  className="bg-[var(--component-card)]/80 border-blue-200 focus:border-[var(--cardiology-accent-blue)] focus:ring-blue-200"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};