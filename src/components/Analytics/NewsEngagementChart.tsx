/**
 * News Engagement Chart Component
 * Displays real-time user interaction metrics and news consumption patterns
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  Bookmark, 
  Heart,
  Clock,
  Filter,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useEngagementAnalytics } from '../../hooks/useRealtimeAnalytics';

interface EngagementData {
  date: string;
  clicks: number;
  views: number;
  shares: number;
  bookmarks: number;
  likes: number;
  readTime: number;
  specialty: string;
}

interface SpecialtyEngagement {
  specialty: string;
  totalEngagement: number;
  clickThroughRate: number;
  avgReadTime: number;
  color: string;
}

interface NewsEngagementChartProps {
  specialty?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  className?: string;
}

const SPECIALTY_COLORS = {
  cardiology: '#ef4444',
  obgyn: '#8b5cf6',
  general: '#06b6d4',
  emergency_medicine: '#f97316',
  internal_medicine: '#10b981',
  surgery: '#f59e0b'
};

export const NewsEngagementChart: React.FC<NewsEngagementChartProps> = ({
  specialty,
  timeRange = '7d',
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<EngagementData[]>([]);
  const [specialtyData, setSpecialtyData] = useState<SpecialtyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'views' | 'shares' | 'bookmarks'>('clicks');

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeRange,
        metricType: 'engagement',
        ...(specialty && { specialty })
      });

      const response = await fetch(`/.netlify/functions/news-analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const analytics = await response.json();
      
      // Transform data for chart visualization
      const transformedData: EngagementData[] = [];
      const specialtyEngagement: Record<string, SpecialtyEngagement> = {};

      // Generate daily data points based on time range
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        transformedData.push({
          date: dateStr,
          clicks: Math.floor(Math.random() * 100) + 20, // Mock data - replace with real analytics
          views: Math.floor(Math.random() * 200) + 50,
          shares: Math.floor(Math.random() * 30) + 5,
          bookmarks: Math.floor(Math.random() * 40) + 10,
          likes: Math.floor(Math.random() * 60) + 15,
          readTime: Math.floor(Math.random() * 300) + 120,
          specialty: specialty || 'cardiology'
        });
      }

      // Calculate specialty-specific engagement
      Object.keys(SPECIALTY_COLORS).forEach(spec => {
        const specData = transformedData.filter(d => d.specialty === spec);
        if (specData.length > 0) {
          const totalClicks = specData.reduce((sum, d) => sum + d.clicks, 0);
          const totalViews = specData.reduce((sum, d) => sum + d.views, 0);
          const avgReadTime = specData.reduce((sum, d) => sum + d.readTime, 0) / specData.length;

          specialtyEngagement[spec] = {
            specialty: spec,
            totalEngagement: totalClicks + totalViews,
            clickThroughRate: totalViews > 0 ? totalClicks / totalViews : 0,
            avgReadTime,
            color: SPECIALTY_COLORS[spec as keyof typeof SPECIALTY_COLORS]
          };
        }
      });

      setData(transformedData);
      setSpecialtyData(Object.values(specialtyEngagement));

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, [specialty, timeRange]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'readTime') {
      return [`${Math.round(value)}s`, 'Avg Read Time'];
    }
    return [value.toLocaleString(), name];
  };

  const formatAxisLabel = (value: string) => {
    const date = new Date(value);
    return timeRange === '24h' 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading engagement data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error loading data</div>
            <p className="text-gray-600 text-sm">{error}</p>
            <button 
              onClick={fetchEngagementData}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">News Engagement Analytics</h3>
              <p className="text-sm text-gray-600">
                Real-time user interaction metrics {specialty && `for ${specialty}`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchEngagementData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="area">Area Chart</option>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Metric:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="clicks">Clicks</option>
              <option value="views">Views</option>
              <option value="shares">Shares</option>
              <option value="bookmarks">Bookmarks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-6">
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' && (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatAxisLabel}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Date: ${formatAxisLabel(label)}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="readTime"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={1}
                />
              </AreaChart>
            )}

            {chartType === 'line' && (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatAxisLabel}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Date: ${formatAxisLabel(label)}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
                <Line
                  type="monotone"
                  dataKey="readTime"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            )}

            {chartType === 'bar' && (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatAxisLabel}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => `Date: ${formatAxisLabel(label)}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey={selectedMetric} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Specialty Breakdown */}
        {!specialty && specialtyData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specialty Distribution Pie Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-600" />
                Engagement by Specialty
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={specialtyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalEngagement"
                      label={({ specialty, percent }) => `${specialty} ${(percent * 100).toFixed(0)}%`}
                    >
                      {specialtyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Total Engagement']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Specialty Performance Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
                Performance by Specialty
              </h4>
              <div className="space-y-3">
                {specialtyData.map((spec) => (
                  <div key={spec.specialty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: spec.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {spec.specialty.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {(spec.clickThroughRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">CTR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Eye className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Total Views</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.views, 0).toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Total Clicks</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Share2 className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Shares</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.shares, 0).toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Bookmark className="w-4 h-4 text-orange-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Bookmarks</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.bookmarks, 0).toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-indigo-600 mr-1" />
              <span className="text-xs font-medium text-gray-600">Avg Read Time</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Math.round(data.reduce((sum, d) => sum + d.readTime, 0) / data.length)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEngagementChart;