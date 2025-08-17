import React from 'react';
import { 
  Activity,
  AlertCircle,
  RefreshCw,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '../../ui/button';
import { ABGResultsList } from './ABGResultsList';
import { ABGResult, ABGFilters } from '../../../types/abg';

interface ContentViewProps {
  viewMode: 'list';
  isLoading: boolean;
  error: string | null;
  results: ABGResult[];
  filters: ABGFilters;
  compact?: boolean;
  selectionMode?: boolean;
  selectedResults?: Set<string>;
  onResultSelect: (result: ABGResult) => void;
  onResultToggle?: (resultId: string) => void;
  onSingleDelete?: (resultId: string) => void;
  onExportRequest: () => void;
  onNewAnalysis: () => void;
  onRetry: () => void;
}

export const ContentView: React.FC<ContentViewProps> = ({
  viewMode,
  isLoading,
  error,
  results,
  filters,
  compact = false,
  selectionMode = false,
  selectedResults = new Set(),
  onResultSelect,
  onResultToggle,
  onSingleDelete,
  onExportRequest,
  onNewAnalysis,
  onRetry
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="abg-card p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Activity className="h-16 w-16 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Your History</h3>
        <p className="text-slate-600">Fetching your ABG analysis results...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="abg-card border-red-200 bg-red-50 p-12 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-red-800 mb-2">Loading Failed</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty State
  if (results.length === 0) {
    return (
      <div className="abg-card p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center">
            <FileText className="h-12 w-12 text-slate-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">No Results Found</h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          {filters && Object.keys(filters).length > 0
            ? 'Try adjusting your filters or search criteria to find more results'
            : 'Get started by creating your first ABG analysis'
          }
        </p>
        <Button 
          onClick={onNewAnalysis}
          className="abg-btn-primary"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Start First Analysis
        </Button>
      </div>
    );
  }

  // Content - Always List View
  return (
    <ABGResultsList
      onResultSelect={onResultSelect}
      onResultToggle={onResultToggle}
      onSingleDelete={onSingleDelete}
      onExportRequest={onExportRequest}
      initialFilters={filters}
      showFilters={!compact}
      showSearch={!compact}
      compact={compact}
      pageSize={compact ? 10 : 20}
      selectionMode={selectionMode}
      selectedResults={selectedResults}
    />
  );
};