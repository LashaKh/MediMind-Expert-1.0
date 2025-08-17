import React, { useMemo } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  Award,
  Timer
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { ABGResult } from '../../../types/abg';

interface AnalyticsCardsProps {
  stats: {
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
  };
  timeRange: string;
  results: ABGResult[];
}

interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  stats,
  timeRange,
  results
}) => {
  // Calculate additional metrics
  const additionalMetrics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Today's results
    const todayResults = results.filter(r => 
      new Date(r.created_at) >= today
    ).length;
    
    // Yesterday's results
    const yesterdayResults = results.filter(r => {
      const createdAt = new Date(r.created_at);
      return createdAt >= yesterday && createdAt < today;
    }).length;
    
    // Daily trend
    const dailyTrend = yesterdayResults > 0 
      ? ((todayResults - yesterdayResults) / yesterdayResults) * 100 
      : todayResults > 0 ? 100 : 0;
    
    // Average processing time categories
    const fastResults = results.filter(r => (r.processing_time_ms || 0) < 5000).length;
    const slowResults = results.filter(r => (r.processing_time_ms || 0) > 15000).length;
    
    // Confidence categories
    const highConfidenceResults = results.filter(r => (r.gemini_confidence || 0) >= 0.8).length;
    const lowConfidenceResults = results.filter(r => (r.gemini_confidence || 0) < 0.6).length;
    
    // Analysis type distribution
    const arterialResults = results.filter(r => r.type === 'Arterial Blood Gas').length;
    const venousResults = results.filter(r => r.type === 'Venous Blood Gas').length;
    
    return {
      todayResults,
      dailyTrend,
      fastResults,
      slowResults,
      highConfidenceResults,
      lowConfidenceResults,
      arterialResults,
      venousResults
    };
  }, [results]);

  // Format processing time
  const formatProcessingTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get time range label
  const getTimeRangeLabel = (range: string): string => {
    const labels = {
      '7d': 'week',
      '30d': 'month',
      '3m': '3 months',
      '6m': '6 months',
      '1y': 'year'
    };
    return labels[range as keyof typeof labels] || 'period';
  };

  // Define metric cards
  const metricCards: MetricCard[] = [
    {
      title: 'Total Analyses',
      value: stats.totalResults,
      subtitle: `In the last ${getTimeRangeLabel(timeRange)}`,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      trend: {
        value: Math.abs(stats.recentTrend),
        isPositive: stats.recentTrend > 0,
        label: `vs. previous ${getTimeRangeLabel(timeRange)}`
      },
      badge: {
        text: stats.totalResults > 50 ? 'High Volume' : stats.totalResults > 10 ? 'Active' : 'Light',
        variant: 'outline',
        color: stats.totalResults > 50 ? 'text-green-600' : stats.totalResults > 10 ? 'text-blue-600' : 'text-gray-600'
      }
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      subtitle: 'Complete analyses with interpretation',
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      badge: {
        text: stats.successRate >= 90 ? 'Excellent' : stats.successRate >= 75 ? 'Good' : 'Needs Improvement',
        variant: stats.successRate >= 90 ? 'default' : stats.successRate >= 75 ? 'secondary' : 'destructive'
      }
    },
    {
      title: 'Avg Processing Time',
      value: formatProcessingTime(stats.avgProcessingTime),
      subtitle: 'Time per analysis',
      icon: Clock,
      gradient: 'from-purple-500 to-purple-600',
      badge: {
        text: stats.avgProcessingTime < 5000 ? 'Fast' : stats.avgProcessingTime < 10000 ? 'Normal' : 'Slow',
        variant: 'outline',
        color: stats.avgProcessingTime < 5000 ? 'text-green-600' : stats.avgProcessingTime < 10000 ? 'text-blue-600' : 'text-orange-600'
      }
    },
    {
      title: 'Avg Confidence',
      value: `${stats.avgConfidence}%`,
      subtitle: 'AI analysis confidence score',
      icon: Target,
      gradient: 'from-orange-500 to-orange-600',
      badge: {
        text: stats.avgConfidence >= 80 ? 'High' : stats.avgConfidence >= 60 ? 'Medium' : 'Low',
        variant: 'outline',
        color: stats.avgConfidence >= 80 ? 'text-green-600' : stats.avgConfidence >= 60 ? 'text-yellow-600' : 'text-red-600'
      }
    },
    {
      title: 'Unique Patients',
      value: stats.patientCount,
      subtitle: 'Patients with analyses',
      icon: Users,
      gradient: 'from-teal-500 to-teal-600',
      trend: {
        value: stats.patientCount,
        isPositive: true,
        label: 'total patients served'
      }
    },
    {
      title: 'Quality Score',
      value: `${stats.qualityScore}%`,
      subtitle: 'Overall system performance',
      icon: Award,
      gradient: 'from-indigo-500 to-indigo-600',
      badge: {
        text: stats.performanceRating.charAt(0).toUpperCase() + stats.performanceRating.slice(1),
        variant: stats.performanceRating === 'excellent' ? 'default' : 
                stats.performanceRating === 'good' ? 'secondary' : 'outline'
      }
    },
    {
      title: 'This Week',
      value: stats.thisWeek,
      subtitle: 'Analyses in last 7 days',
      icon: Calendar,
      gradient: 'from-pink-500 to-pink-600',
      trend: {
        value: Math.abs(additionalMetrics.dailyTrend),
        isPositive: additionalMetrics.dailyTrend > 0,
        label: 'vs. yesterday'
      }
    },
    {
      title: 'Performance Ratio',
      value: `${additionalMetrics.fastResults}:${additionalMetrics.slowResults}`,
      subtitle: 'Fast vs. slow processing',
      icon: Zap,
      gradient: 'from-yellow-500 to-yellow-600',
      badge: {
        text: additionalMetrics.fastResults > additionalMetrics.slowResults ? 'Optimized' : 'Review Needed',
        variant: additionalMetrics.fastResults > additionalMetrics.slowResults ? 'default' : 'destructive'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card 
            key={index}
            className="relative overflow-hidden abg-card hover:shadow-xl transition-all duration-300 group"
          >
            {/* Gradient Background */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity",
              card.gradient
            )} />
            
            <div className="p-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  card.gradient
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                {card.badge && (
                  <Badge 
                    variant={card.badge.variant}
                    className={cn("text-xs", card.badge.color)}
                  >
                    {card.badge.text}
                  </Badge>
                )}
              </div>

              {/* Main Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  {card.title}
                </h3>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>

              {/* Trend Indicator */}
              {card.trend && (
                <div className="mt-4 flex items-center gap-2">
                  {card.trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    card.trend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {card.trend.value}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {card.trend.label}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Card>
        );
      })}

      {/* Additional Summary Cards */}
      <Card className="md:col-span-2 lg:col-span-4 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Analysis Breakdown
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Analysis Type Distribution */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {additionalMetrics.arterialResults}
            </div>
            <div className="text-sm text-blue-600">Arterial Blood Gas</div>
            <div className="text-xs text-blue-500 mt-1">
              {results.length > 0 ? Math.round((additionalMetrics.arterialResults / results.length) * 100) : 0}% of total
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {additionalMetrics.venousResults}
            </div>
            <div className="text-sm text-purple-600">Venous Blood Gas</div>
            <div className="text-xs text-purple-500 mt-1">
              {results.length > 0 ? Math.round((additionalMetrics.venousResults / results.length) * 100) : 0}% of total
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {additionalMetrics.highConfidenceResults}
            </div>
            <div className="text-sm text-green-600">High Confidence</div>
            <div className="text-xs text-green-500 mt-1">≥80% confidence score</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {additionalMetrics.lowConfidenceResults}
            </div>
            <div className="text-sm text-orange-600">Review Needed</div>
            <div className="text-xs text-orange-500 mt-1">&lt;60% confidence score</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsCards;