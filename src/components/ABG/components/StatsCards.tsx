import React from 'react';
import {
  FileText,
  Calendar,
  Zap,
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card } from '../../ui/card';

interface StatsCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsCardsProps {
  stats: {
    totalResults: number;
    thisWeek: number;
    thisMonth: number;
    avgProcessingTime: number;
    successRate: number;
    avgConfidence: number;
  };
  formatProcessingTime: (ms: number) => string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  formatProcessingTime
}) => {
  const statsCards: StatsCard[] = [
    {
      title: 'Total Analyses',
      value: stats.totalResults,
      subtitle: 'All time results',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'This Week',
      value: stats.thisWeek,
      subtitle: 'Recent activity',
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-500',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Avg Processing',
      value: formatProcessingTime(stats.avgProcessingTime),
      subtitle: 'Lightning fast',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      subtitle: 'Reliable analysis',
      icon: CheckCircle,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Avg Confidence',
      value: `${stats.avgConfidence}%`,
      subtitle: 'AI accuracy',
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'This Month',
      value: stats.thisMonth,
      subtitle: 'Monthly total',
      icon: BarChart3,
      gradient: 'from-rose-500 to-pink-500',
      trend: { value: 15, isPositive: true }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10`} />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                {card.trend && (
                  <div className={`text-sm font-medium ${card.trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {card.trend.isPositive ? '+' : '-'}{card.trend.value}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{card.value}</p>
                <p className="text-sm text-slate-600">{card.subtitle}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};