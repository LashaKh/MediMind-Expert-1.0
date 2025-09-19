import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  Zap,
  FileText,
  Star,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { AnalyticsCards } from './AnalyticsCards';
import { TrendCharts } from './TrendCharts';
import { ABGResult, ABGFilters, PatientInfo } from '../../../types/abg';

interface HistoryDashboardProps {
  results: ABGResult[];
  patients: PatientInfo[];
  filters: ABGFilters;
  onFiltersChange: (filters: Partial<ABGFilters>) => void;
  loading?: boolean;
  className?: string;
}

interface DashboardStats {
  totalResults: number;
  thisWeek: number;
  thisMonth: number;
  avgProcessingTime: number;
  avgConfidence: number;
  successRate: number;
  patientCount: number;
  recentTrend: number;
  qualityScore: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 3 months', value: '3m', days: 90 },
  { label: 'Last 6 months', value: '6m', days: 180 },
  { label: 'Last year', value: '1y', days: 365 }
];

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  results,
  patients,
  filters,
  onFiltersChange,
  loading = false,
  className
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'analytics' | 'trends'>('overview');
  
  // Calculate comprehensive statistics
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === selectedTimeRange);
    const rangeStart = new Date(now.getTime() - (selectedRange?.days || 30) * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter results by selected time range
    const filteredResults = results.filter(r => 
      new Date(r.created_at) >= rangeStart
    );
    
    const thisWeekCount = results.filter(r => 
      new Date(r.created_at) > weekAgo
    ).length;
    
    const thisMonthCount = results.filter(r => 
      new Date(r.created_at) > monthAgo
    ).length;
    
    // Calculate average processing time
    const processingTimes = filteredResults
      .filter(r => r.processing_time_ms)
      .map(r => r.processing_time_ms || 0);
    
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;
    
    // Calculate average confidence
    const confidenceScores = filteredResults
      .filter(r => r.gemini_confidence)
      .map(r => r.gemini_confidence || 0);
    
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length
      : 0;
    
    // Calculate success rate (results with interpretation and action plan)
    const completedResults = filteredResults.filter(r => 
      r.interpretation && r.action_plan
    );
    const successRate = filteredResults.length > 0 
      ? (completedResults.length / filteredResults.length) * 100 
      : 0;
    
    // Calculate unique patient count
    const uniquePatients = new Set(
      filteredResults
        .filter(r => r.patient_id)
        .map(r => r.patient_id)
    );
    
    // Calculate trend (comparison with previous period)
    const previousRangeStart = new Date(rangeStart.getTime() - (selectedRange?.days || 30) * 24 * 60 * 60 * 1000);
    const previousResults = results.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= previousRangeStart && createdAt < rangeStart;
    });
    
    const recentTrend = previousResults.length > 0
      ? ((filteredResults.length - previousResults.length) / previousResults.length) * 100
      : 0;
    
    // Calculate quality score (weighted average of confidence and success rate)
    const qualityScore = (avgConfidence * 100 * 0.6) + (successRate * 0.4);
    
    // Determine performance rating
    let performanceRating: DashboardStats['performanceRating'] = 'poor';
    if (qualityScore >= 90) performanceRating = 'excellent';
    else if (qualityScore >= 75) performanceRating = 'good';
    else if (qualityScore >= 60) performanceRating = 'average';
    
    return {
      totalResults: filteredResults.length,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      avgProcessingTime: Math.round(avgProcessingTime),
      avgConfidence: Math.round(avgConfidence * 100),
      successRate: Math.round(successRate),
      patientCount: uniquePatients.size,
      recentTrend: Math.round(recentTrend),
      qualityScore: Math.round(qualityScore),
      performanceRating
    };
  }, [results, selectedTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    const selectedRange = TIME_RANGES.find(r => r.value === range);
    if (selectedRange) {
      const startDate = new Date(Date.now() - selectedRange.days * 24 * 60 * 60 * 1000);
      onFiltersChange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: undefined // Clear end date to show "from start date to now"
      });
    }
  };

  // Performance rating color and icon
  const getPerformanceIndicator = (rating: DashboardStats['performanceRating']) => {
    switch (rating) {
      case 'excellent':
        return { color: 'text-green-600', bg: 'bg-green-50', icon: Star };
      case 'good':
        return { color: 'text-[#2b6cb0]', bg: 'bg-[#90cdf4]/50', icon: CheckCircle };
      case 'average':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Target };
      default:
        return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
    }
  };

  const performanceIndicator = getPerformanceIndicator(stats.performanceRating);
  const PerformanceIcon = performanceIndicator.icon;

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 abg-premium", className)}>
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#2b6cb0]" />
            ABG Analysis Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and insights for your blood gas analysis history
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="px-3 py-2 border border-[#2b6cb0]/30 rounded-lg focus:ring-2 focus:ring-[#2b6cb0] focus:border-[#2b6cb0] bg-white/80 backdrop-blur-sm"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[#90cdf4]/20 rounded-lg p-1 border border-[#2b6cb0]/20">
            {[
              { mode: 'overview', icon: BarChart3, label: 'Overview' },
              { mode: 'analytics', icon: PieChart, label: 'Analytics' },
              { mode: 'trends', icon: LineChart, label: 'Trends' }
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode as typeof viewMode)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary Bar */}
      <Card className="p-4 border-l-4 border-l-[#2b6cb0] bg-gradient-to-r from-[#90cdf4]/10 to-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", performanceIndicator.bg)}>
              <PerformanceIcon className={cn("h-5 w-5", performanceIndicator.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                System Performance: {stats.performanceRating.charAt(0).toUpperCase() + stats.performanceRating.slice(1)}
              </h3>
              <p className="text-sm text-gray-600">
                Quality Score: {stats.qualityScore}% | Success Rate: {stats.successRate}% | Avg Confidence: {stats.avgConfidence}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={stats.recentTrend > 0 ? 'default' : 'secondary'}
              className={stats.recentTrend > 0 ? 'bg-[#63b3ed]/20 text-[#1a365d] border-[#2b6cb0]/30' : 'bg-[#90cdf4]/20 text-[#1a365d] border-[#2b6cb0]/20'}
            >
              <TrendingUp className={cn("h-3 w-3 mr-1", stats.recentTrend < 0 && "rotate-180")} />
              {Math.abs(stats.recentTrend)}%
            </Badge>
          </div>
        </div>
      </Card>

      {/* Analytics Cards */}
      <AnalyticsCards 
        stats={stats}
        timeRange={selectedTimeRange}
        results={results}
      />

      {/* Detailed Views */}
      {viewMode === 'trends' && (
        <TrendCharts 
          results={results}
          timeRange={selectedTimeRange}
          patients={patients}
        />
      )}

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-br from-[#90cdf4]/10 to-white/50 backdrop-blur-sm border-[#2b6cb0]/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onFiltersChange({ hasInterpretation: false })}
          >
            <AlertTriangle className="h-4 w-4 mr-2 text-[#2b6cb0]" />
            Pending Interpretations
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => {
              const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              onFiltersChange({ startDate: sevenDaysAgo.toISOString().split('T')[0] });
            }}
          >
            <Calendar className="h-4 w-4 mr-2 text-[#2b6cb0]" />
            Recent Activity
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => {
              // Filter for high-confidence results
              onFiltersChange({});
            }}
          >
            <Star className="h-4 w-4 mr-2 text-[#63b3ed]" />
            High Quality Results
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onFiltersChange({ type: 'Arterial Blood Gas' })}
          >
            <FileText className="h-4 w-4 mr-2 text-[#2b6cb0]" />
            Arterial Blood Gas
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HistoryDashboard;