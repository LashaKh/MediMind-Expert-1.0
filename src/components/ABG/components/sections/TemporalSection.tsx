import React from 'react';
import { Calendar, Clock3, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { ABGSearchFilters } from '../../../../types/abg';
import { quickDateRanges, processingTimeRanges } from '../config/searchConfig';

interface TemporalSectionProps {
  filters: ABGSearchFilters;
  updateFilter: (key: keyof ABGSearchFilters, value: any) => void;
}

export const TemporalSection: React.FC<TemporalSectionProps> = ({
  filters,
  updateFilter
}) => {
  const handleQuickDateRange = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = days === 0 ? endDate : new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    updateFilter('startDate', startDate);
    updateFilter('endDate', endDate);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
          <Clock3 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Time & Quality Metrics</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Filter by date ranges, processing times, and system performance metrics
        </p>
      </div>

      {/* Date Range Selection */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <Label className="text-lg font-bold text-slate-800">Date Range</Label>
            <p className="text-sm text-slate-600">Filter results by analysis date</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
              className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
              className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Quick Date Ranges */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700">Quick Select</Label>
          <div className="grid grid-cols-4 gap-3">
            {quickDateRanges.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickDateRange(range.days)}
                className="bg-white/70 border-blue-200 hover:bg-blue-50 hover:border-blue-300 flex-col h-auto py-3"
              >
                {range.icon}
                <span className="text-xs mt-1">{range.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Processing Performance */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <Label className="text-lg font-bold text-slate-800">Processing Performance</Label>
            <p className="text-sm text-slate-600">Filter by AI processing time</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {processingTimeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateFilter('processingTimeMax', 
                filters.processingTimeMax === range.value ? undefined : range.value
              )}
              className={cn(
                "p-4 rounded-xl border transition-all text-left group",
                filters.processingTimeMax === range.value
                  ? `bg-${range.color}-50 border-${range.color}-300 text-${range.color}-800 shadow-lg`
                  : "bg-white/70 border-emerald-200/60 hover:bg-emerald-50 hover:shadow-md"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm">{range.label}</div>
                {filters.processingTimeMax === range.value && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </div>
              <div className="text-xs text-slate-600">{range.description}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};