import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { ExportDialog } from './components/ExportDialog';
import { ContentView } from './components/ContentView';
import { DeletionConfirmDialog } from './components/DeletionConfirmDialog';
import { useABGHistory } from './hooks/useABGHistory';
// import { ABGDeletionService } from '../../services/abgDeletionService';
import { ABGResult } from '../../types/abg';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  ArrowLeft,
  Plus,
  Activity,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Target,
  // ChevronRight,
  Sparkles,
  // Filter,
  // Search,
  Download,
  Trash2,
  CheckSquare,
  Square,
  // MoreHorizontal
} from 'lucide-react';

interface PremiumABGHistoryPageProps {
  /** Initial patient filter if coming from patient context */
  patientId?: string;
  /** Compact mode for embedded views */
  compact?: boolean;
  className?: string;
}

export const PremiumABGHistoryPage: React.FC<PremiumABGHistoryPageProps> = ({
  patientId,
  compact = false,
  className
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Use the custom hook for state management
  const {
    results,
    patients,
    // stats,
    filters,
    isLoading,
    error,
    loadResults,
    getSelectedResults
  } = useABGHistory({ patientId });
  
  // Local state for UI with sophisticated animations
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode] = useState<'list'>('list');
  const [pageVisible, setPageVisible] = useState(false);
  // const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletionTarget, setDeletionTarget] = useState<{ ids: string[]; type: 'single' | 'bulk' }>({ ids: [], type: 'single' });

  // Sophisticated page entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setPageVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced analytics with smooth calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekResults = results.filter(r => new Date(r.created_at) > weekAgo);
    const thisMonthResults = results.filter(r => new Date(r.created_at) > monthAgo);
    
    return {
      total: results.length,
      thisWeek: thisWeekResults.length,
      thisMonth: thisMonthResults.length,
      weeklyGrowth: thisWeekResults.length > 0 ? ((thisWeekResults.length / Math.max(1, results.length - thisWeekResults.length)) * 100) : 0,
      avgPerWeek: Math.round(results.length / 4) || 0
    };
  }, [results]);

  // Handle result selection with smooth navigation
  const handleResultSelect = useCallback((result: ABGResult) => {
    navigate('/abg-analysis', { 
      state: { 
        resultId: result.id,
        viewMode: 'history' 
      }
    });
  }, [navigate]);

  // Enhanced refresh with visual feedback
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadResults();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [loadResults]);

  // Selection management
  const toggleResultSelection = useCallback((resultId: string) => {
    setSelectedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      
      // Auto-exit selection mode if no items selected
      if (newSet.size === 0) {
        setSelectionMode(false);
      }
      
      return newSet;
    });
  }, []);

  const selectAllResults = useCallback(() => {
    const allIds = results.map(r => r.id);
    setSelectedResults(new Set(allIds));
    setSelectionMode(true);
  }, [results]);

  const clearSelection = useCallback(() => {
    setSelectedResults(new Set());
    setSelectionMode(false);
  }, []);

  // Deletion handlers
  const handleSingleDelete = useCallback((resultId: string) => {
    setDeletionTarget({ ids: [resultId], type: 'single' });
    setShowDeletionDialog(true);
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedResults.size === 0) return;
    setDeletionTarget({ ids: Array.from(selectedResults), type: 'bulk' });
    setShowDeletionDialog(true);
  }, [selectedResults]);

  const confirmDeletion = useCallback(async () => {
    // The deletion is handled by the DeletionConfirmDialog component
    // After successful deletion, refresh the results
    await handleRefresh();
    clearSelection();
  }, [handleRefresh, clearSelection]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    if (selectionMode) {
      clearSelection();
    } else {
      setSelectionMode(true);
    }
  }, [selectionMode, clearSelection]);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50/80 via-[#90cdf4]/60 to-[#63b3ed]/80",
      "transition-all duration-1000 ease-out transform",
      pageVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      className
    )}>
      {/* Sophisticated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#63b3ed]/10 to-[#2b6cb0]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#90cdf4]/10 to-[#1a365d]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#90cdf4]/20 via-transparent to-[#63b3ed]/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* World-Class Header */}
        <header className={cn(
          "mb-12 transition-all duration-700 ease-out",
          pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header Content */}
            <div className="flex items-start gap-6">
              {!compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className={cn(
                    "group flex items-center gap-2 text-slate-600 hover:text-slate-900",
                    "transition-all duration-200 hover:-translate-x-1 hover:bg-white/60",
                    "rounded-xl border border-transparent hover:border-slate-200/60 hover:shadow-md"
                  )}
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="font-medium">{t('common.back', 'Back')}</span>
                </Button>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <h1 className={cn(
                      "font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent",
                      compact ? "text-2xl" : "text-4xl lg:text-5xl",
                      "tracking-tight leading-none"
                    )}>
                      {t('abg.history.title', 'ABG History')}
                    </h1>
                    <div className="absolute -bottom-1 left-0 h-1 w-16 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] rounded-full" />
                  </div>
                  
                  {analytics.total > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 text-[#2b6cb0] border-[#63b3ed]/50 px-3 py-1.5 rounded-full font-medium"
                    >
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      {t('abg.history.resultsCount', '{{count}} Results', { count: analytics.total })}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  {patientId ? (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#2b6cb0]" />
                      <span className="font-medium">{t('abg.history.filteredByPatient', 'Filtered by patient')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#63b3ed]" />
                      <span>{t('abg.history.comprehensiveView', 'Comprehensive history view')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{t('abg.history.updatedAt', 'Updated {{time}}', { time: new Date().toLocaleTimeString() })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3">
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectionMode}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-200",
                      "bg-white/80 hover:bg-white border-slate-200/60 hover:border-slate-300",
                      "hover:shadow-lg hover:-translate-y-0.5",
                      selectionMode && "bg-[#90cdf4]/50 border-[#2b6cb0] text-[#1a365d]"
                    )}
                  >
                    {selectionMode ? (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">
                      {selectionMode ? t('common.cancel', 'Cancel') : t('abg.history.select', 'Select')}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportDialog(true)}
                    disabled={results.length === 0}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-200",
                      "bg-white/80 hover:bg-white border-slate-200/60 hover:border-slate-300",
                      "hover:shadow-lg hover:-translate-y-0.5"
                    )}
                  >
                    <Download className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                    <span className="font-medium">{t('abg.results.export', 'Export')}</span>
                  </Button>
                </div>
              )}
              
              <Button
                onClick={() => navigate('/abg-analysis')}
                className={cn(
                  "group relative overflow-hidden bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]",
                  "hover:from-[#1a365d] hover:to-[#2b6cb0] transition-all duration-300",
                  "shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-xl",
                  "border-0 px-6 py-2.5"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                <span className="font-semibold">{t('abg.history.newAnalysis', 'New Analysis')}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Bulk Selection Bar */}
        {selectionMode && (
          <div className={cn(
            "transition-all duration-300 ease-out",
            pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <Card className="bg-gradient-to-r from-[#90cdf4]/80 via-[#63b3ed]/80 to-[#2b6cb0]/80 backdrop-blur-sm border-[#63b3ed]/60 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-[#2b6cb0]" />
                    <span className="font-medium text-slate-900">
                      {selectedResults.size === 0 
                        ? t('abg.history.bulk.selectHelp', 'Select items to delete or export')
                        : t('abg.history.bulk.selectedResults', '{{count}} result(s) selected', { count: selectedResults.size })
                      }
                    </span>
                  </div>
                  
                  {/* Always show Select All when in selection mode */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllResults}
                      disabled={selectedResults.size === results.length}
                      className={cn(
                        "h-8 px-3 text-[#1a365d] hover:bg-[#90cdf4]/60",
                        selectedResults.size === results.length && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {selectedResults.size === results.length ? (
                        <>{t('abg.history.bulk.allSelected', 'All Selected ({{count}})', { count: results.length })}</>
                      ) : (
                        <>{t('abg.history.bulk.selectAllCount', 'Select All ({{count}})', { count: results.length })}</>
                      )}
                    </Button>
                    {selectedResults.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8 px-3 text-slate-600 hover:bg-slate-100/60"
                      >
                        {t('abg.history.bulk.clearSelection', 'Clear Selection')}
                      </Button>
                    )}
                  </div>
                </div>
                
                {selectedResults.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExportDialog(true)}
                      className="bg-white/80 hover:bg-white border-slate-200/60"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('abg.history.bulk.exportSelected', 'Export Selected')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className={cn(
                        "bg-white/80 hover:bg-red-50 border-red-200/60 hover:border-red-300",
                        "text-red-700 hover:text-red-800 transition-all duration-200"
                      )}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('abg.history.bulk.deleteSelected', 'Delete Selected')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Premium Analytics Dashboard */}
        {!compact && !isLoading && results.length > 0 && (
          <div className={cn(
            "mb-8 transition-all duration-700 ease-out delay-200",
            pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Results Card */}
              <Card className={cn(
                "group relative overflow-hidden bg-white/80 backdrop-blur-sm",
                "border border-slate-200/60 hover:border-[#63b3ed]/60 transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#90cdf4]/80 rounded-xl">
                      <FileText className="h-5 w-5 text-[#2b6cb0]" />
                    </div>
                    <Badge variant="secondary" className="bg-[#90cdf4]/50 text-[#1a365d] border-[#63b3ed]">
                      {t('abg.history.cards.total', 'Total')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900">{analytics.total}</div>
                    <div className="text-sm text-slate-600">{t('abg.results.title', 'ABG Results')}</div>
                  </div>
                </div>
              </Card>

              {/* This Week Card */}
              <Card className={cn(
                "group relative overflow-hidden bg-white/80 backdrop-blur-sm",
                "border border-slate-200/60 hover:border-[#63b3ed]/60 transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#90cdf4]/80 rounded-xl">
                      <Calendar className="h-5 w-5 text-[#2b6cb0]" />
                    </div>
                    <Badge variant="secondary" className="bg-[#90cdf4]/50 text-[#1a365d] border-[#63b3ed]">
                      {t('abg.history.cards.recent', 'Recent')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900">{analytics.thisWeek}</div>
                    <div className="text-sm text-slate-600">{t('common.thisWeek', 'This week')}</div>
                  </div>
                </div>
              </Card>

              {/* Monthly Trend Card */}
              <Card className={cn(
                "group relative overflow-hidden bg-white/80 backdrop-blur-sm",
                "border border-slate-200/60 hover:border-[#63b3ed]/60 transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#90cdf4]/80 rounded-xl">
                      <BarChart3 className="h-5 w-5 text-[#2b6cb0]" />
                    </div>
                    <Badge variant="secondary" className="bg-[#90cdf4]/50 text-[#1a365d] border-[#63b3ed]">
                      {t('abg.history.cards.trend', 'Trend')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900">{analytics.thisMonth}</div>
                    <div className="text-sm text-slate-600">{t('common.thisMonth', 'This month')}</div>
                  </div>
                </div>
              </Card>

              {/* Performance Card */}
              <Card className={cn(
                "group relative overflow-hidden bg-white/80 backdrop-blur-sm",
                "border border-slate-200/60 hover:border-amber-300/60 transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-amber-100/80 rounded-xl">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="h-8 w-8 p-0 hover:bg-amber-100/50"
                    >
                      <RefreshCw className={cn("h-4 w-4 text-amber-600", refreshing && "animate-spin")} />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900">~{analytics.avgPerWeek}</div>
                    <div className="text-sm text-slate-600">{t('abg.history.cards.weeklyAvg', 'Weekly Avg')}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced Progress Indicator */}
            <Card className="bg-gradient-to-r from-white/60 via-white/80 to-white/60 backdrop-blur-sm border border-slate-200/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#63b3ed]" />
                    <span className="text-sm font-medium text-slate-700">
                      {t('abg.history.progress.activity', 'Analysis Activity')}
                    </span>
                  </div>
                  <div className="h-2 w-32 bg-slate-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (analytics.thisWeek / Math.max(1, analytics.avgPerWeek)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {t('abg.history.progress.vsAverage', `${analytics.weeklyGrowth > 0 ? '+' : ''}${analytics.weeklyGrowth.toFixed(0)}% vs avg`, { percent: analytics.weeklyGrowth.toFixed(0) })}
                  </span>
                </div>
                
                <div className="text-xs text-slate-500">
                  {t('abg.history.progress.lastUpdated', 'Last updated: {{time}}', { time: new Date().toLocaleTimeString() })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content Section */}
        <main className={cn(
          "transition-all duration-700 ease-out delay-300",
          pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <ContentView
            viewMode={viewMode}
            isLoading={isLoading}
            error={error}
            results={results}
            filters={filters}
            compact={compact}
            selectionMode={selectionMode}
            selectedResults={selectedResults}
            onResultSelect={handleResultSelect}
            onResultToggle={toggleResultSelection}
            onSingleDelete={handleSingleDelete}
            onExportRequest={() => setShowExportDialog(true)}
            onNewAnalysis={() => navigate('/abg-analysis')}
            onRetry={handleRefresh}
          />
        </main>

        {/* Premium Export Dialog */}
        {showExportDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="animate-in fade-in-0 zoom-in-95 duration-300">
              <ExportDialog
                isOpen={showExportDialog}
                onClose={() => setShowExportDialog(false)}
                results={selectedResults.size > 0 ? results.filter(r => selectedResults.has(r.id)) : getSelectedResults()}
                patients={patients}
                currentFilters={filters}
              />
            </div>
          </div>
        )}

        {/* Sophisticated Deletion Dialog */}
        <DeletionConfirmDialog
          isOpen={showDeletionDialog}
          onClose={() => setShowDeletionDialog(false)}
          onConfirm={confirmDeletion}
          resultIds={deletionTarget.ids}
          results={results.filter(r => deletionTarget.ids.includes(r.id))}
          dangerLevel={deletionTarget.type === 'bulk' ? 'high' : 'medium'}
        />
      </div>
    </div>
  );
};

export default PremiumABGHistoryPage;