import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AnalysisMetrics {
  totalAnalyses: number;
  averageProcessingTime: number;
  mostCommonAnalysisType: string;
  totalTokensUsed: number;
  successRate: number;
}

interface AnalysisResultsProps {
  processingHistory: ProcessingHistory[];
  onExportAll?: () => void;
  onClearAll?: () => void;
}

const calculateMetrics = (history: ProcessingHistory[]): AnalysisMetrics => {
  if (history.length === 0) {
    return {
      totalAnalyses: 0,
      averageProcessingTime: 0,
      mostCommonAnalysisType: 'None',
      totalTokensUsed: 0,
      successRate: 100
    };
  }

  const totalProcessingTime = history.reduce((sum, item) => sum + item.processingTime, 0);
  const totalTokens = history.reduce((sum, item) => sum + (item.tokensUsed || 0), 0);
  
  // Analyze instruction types
  const instructionTypes = history.map(item => {
    const instruction = item.userInstruction.toLowerCase();
    if (instruction.includes('symptom') || instruction.includes('diagnos')) return 'Clinical Assessment';
    if (instruction.includes('medication') || instruction.includes('drug')) return 'Medication Review';
    if (instruction.includes('summary')) return 'Clinical Summary';
    if (instruction.includes('procedure')) return 'Treatment Plan';
    return 'General Analysis';
  });

  const typeCounts = instructionTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(typeCounts).reduce((a, b) => 
    typeCounts[a[0]] > typeCounts[b[0]] ? a : b
  )[0];

  return {
    totalAnalyses: history.length,
    averageProcessingTime: Math.round(totalProcessingTime / history.length),
    mostCommonAnalysisType: mostCommonType,
    totalTokensUsed: totalTokens,
    successRate: 100 // Assuming all completed analyses are successful
  };
};

const getAnalysisTypeDistribution = (history: ProcessingHistory[]) => {
  const types = history.map(item => {
    const instruction = item.userInstruction.toLowerCase();
    if (instruction.includes('symptom') || instruction.includes('diagnos')) return 'Clinical Assessment';
    if (instruction.includes('medication') || instruction.includes('drug')) return 'Medication Review';
    if (instruction.includes('summary')) return 'Clinical Summary';
    if (instruction.includes('procedure')) return 'Treatment Plan';
    if (instruction.includes('demographic') || instruction.includes('history')) return 'Patient History';
    return 'General Analysis';
  });

  const distribution = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / history.length) * 100)
  }));
};

const getRecentActivity = (history: ProcessingHistory[]) => {
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  const today = sortedHistory.filter(item => now - item.timestamp < oneDay);
  const thisWeek = sortedHistory.filter(item => now - item.timestamp < oneWeek);

  return {
    today: today.length,
    thisWeek: thisWeek.length,
    recentAnalyses: sortedHistory.slice(0, 5)
  };
};

const formatTime = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  processingHistory,
  onExportAll,
  onClearAll
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'all'>('all');

  const metrics = calculateMetrics(processingHistory);
  const distribution = getAnalysisTypeDistribution(processingHistory);
  const activity = getRecentActivity(processingHistory);

  if (processingHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          No Analysis Data Yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
          Once you start analyzing your medical transcripts, you'll see detailed insights, metrics, and trends here.
        </p>
      </div>
    );
  }

  const filteredHistory = processingHistory.filter(item => {
    const now = Date.now();
    const itemDate = item.timestamp;
    
    switch (selectedTimeframe) {
      case 'today':
        return now - itemDate < 24 * 60 * 60 * 1000;
      case 'week':
        return now - itemDate < 7 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Analysis Results
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Comprehensive insights from your medical transcript analyses
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['today', 'week', 'all'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                  selectedTimeframe === timeframe
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <MedicalButton
            variant="ghost"
            size="sm"
            leftIcon={showDetails ? EyeOff : Eye}
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-600 dark:text-slate-400"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </MedicalButton>
          
          {onExportAll && (
            <MedicalButton
              variant="outline"
              size="sm"
              leftIcon={Download}
              onClick={onExportAll}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Export All
            </MedicalButton>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {filteredHistory.length}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Total Analyses
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {selectedTimeframe === 'today' ? 'Today' : 
             selectedTimeframe === 'week' ? 'This week' : 'All time'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatTime(metrics.averageProcessingTime)}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Avg Processing Time
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Per analysis
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.successRate}%
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Success Rate
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Completed analyses
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.totalTokensUsed.toLocaleString()}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Tokens Processed
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            AI computation
          </p>
        </div>
      </div>

      {/* Analysis Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Analysis Type Distribution
          </h4>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2">
            <PieChart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        
        <div className="space-y-4">
          {distribution.map((item, index) => {
            const colors = [
              'bg-red-500',
              'bg-blue-500', 
              'bg-green-500',
              'bg-purple-500',
              'bg-amber-500',
              'bg-indigo-500'
            ];
            
            return (
              <div key={item.type} className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.type}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-500">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {showDetails && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent Activity
            </h4>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Last 5 analyses</span>
            </div>
          </div>

          <div className="space-y-3">
            {activity.recentAnalyses.map((analysis, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {analysis.userInstruction.substring(0, 60)}...
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-500 mt-1">
                    <span>{new Date(analysis.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{formatTime(analysis.processingTime)}</span>
                    <span>•</span>
                    <span>{analysis.model}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      {showDetails && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Export & Management
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export your analysis data or clear history for better organization
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {onExportAll && (
                <MedicalButton
                  variant="primary"
                  size="md"
                  leftIcon={Download}
                  onClick={onExportAll}
                >
                  Export All Data
                </MedicalButton>
              )}
              {onClearAll && (
                <MedicalButton
                  variant="destructive"
                  size="md"
                  leftIcon={AlertTriangle}
                  onClick={onClearAll}
                >
                  Clear History
                </MedicalButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};