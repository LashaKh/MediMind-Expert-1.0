import React from 'react';
import { 
  ChevronLeft,
  BarChart3,
  List,
  GitCompareArrows,
  Settings,
  SortAsc,
  SortDesc,
  Plus,
  Activity
} from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface HeaderSectionProps {
  compact?: boolean;
  patientId?: string;
  viewMode: 'dashboard' | 'list' | 'comparison';
  sortOrder: 'asc' | 'desc';
  showAdvancedFilters: boolean;
  onBack: () => void;
  onViewModeChange: (mode: 'dashboard' | 'list' | 'comparison') => void;
  onComparisonToggle: () => void;
  onAdvancedFiltersToggle: () => void;
  onSortOrderChange: () => void;
  onNewAnalysis: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  compact = false,
  patientId,
  viewMode,
  sortOrder,
  showAdvancedFilters,
  onBack,
  onViewModeChange,
  onComparisonToggle,
  onAdvancedFiltersToggle,
  onSortOrderChange,
  onNewAnalysis
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
      <div className="flex items-center gap-6">
        {!compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-[var(--component-card)]/50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Activity className="h-8 w-8 text-[var(--foreground)]" />
          </div>
          <div>
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent",
              compact ? "text-xl" : "text-3xl"
            )}>
              ABG Analysis History
            </h1>
            {patientId ? (
              <p className="text-[var(--foreground-tertiary)]">Filtered by patient</p>
            ) : (
              <p className="text-[var(--foreground-tertiary)]">Your complete analysis history</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex bg-[var(--component-card)] rounded-xl border border-[var(--glass-border-light)] p-1">
          <Button
            variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('dashboard')}
            className={cn(
              "h-8 px-3",
              viewMode === 'dashboard' && "bg-gradient-to-r from-blue-500 to-purple-600 text-[var(--foreground)]"
            )}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={cn(
              "h-8 px-3",
              viewMode === 'list' && "bg-gradient-to-r from-blue-500 to-purple-600 text-[var(--foreground)]"
            )}
          >
            <List className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === 'comparison' ? 'default' : 'ghost'}
            size="sm"
            onClick={onComparisonToggle}
            className={cn(
              "h-8 px-3",
              viewMode === 'comparison' && "bg-gradient-to-r from-blue-500 to-purple-600 text-[var(--foreground)]"
            )}
          >
            <GitCompareArrows className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Compare</span>
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAdvancedFiltersToggle}
          className={cn(
            "bg-[var(--component-card)] border-[var(--glass-border-light)] hover:border-blue-400",
            showAdvancedFilters && "border-blue-400 text-[var(--cardiology-accent-blue-dark)]"
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* Sort Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSortOrderChange}
          className="bg-[var(--component-card)] border-[var(--glass-border-light)] hover:border-blue-400"
        >
          {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
        </Button>

        {/* New Analysis Button */}
        <Button
          onClick={onNewAnalysis}
          className="abg-btn-primary"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>
    </div>
  );
};