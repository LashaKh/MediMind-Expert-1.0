/**
 * Analytics Page
 * Main analytics dashboard for medical news engagement and system monitoring
 */

import React, { useState } from 'react';
import { useAuth } from '../stores/useAppStore';
import { useTranslation } from '../hooks/useTranslation';
import { 
  NewsEngagementChart, 
  UserBehaviorDashboard, 
  SystemHealthDashboard 
} from '../components/Analytics';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { 
  BarChart3, 
  Users, 
  Activity, 
  Shield, 
  Calendar, 
  Filter,
  Download,
  Settings,
  AlertCircle,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';

interface AnalyticsPageProps {}

type AnalyticsView = 'overview' | 'engagement' | 'behavior' | 'health';
type TimeRange = '24h' | '7d' | '30d' | '90d';

export const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<AnalyticsView>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Redirect non-admin users
  if (user?.medical_specialty !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600">Analytics dashboard is available to administrators only.</p>
        </div>
      </div>
    );
  }

  const viewOptions = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Complete analytics overview'
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: TrendingUp,
      description: 'News engagement metrics'
    },
    {
      id: 'behavior',
      label: 'User Behavior',
      icon: Users,
      description: 'User patterns and activity'
    },
    {
      id: 'health',
      label: 'System Health',
      icon: Activity,
      description: 'API monitoring and alerts'
    }
  ];

  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'obgyn', label: 'OB/GYN' },
    { value: 'general', label: 'General Medicine' }
  ];

  return (
    <FeatureFlagProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-600">Medical news engagement and system monitoring</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Time Range Selector */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>

                {/* Specialty Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    {specialtyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Export Button */}
                <button className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-4">
              {viewOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedView(option.id as AnalyticsView)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedView === option.id
                        ? 'bg-violet-100 text-violet-700 border border-violet-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedView === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Articles</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last period
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">8,942</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8% from last period
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Read Time</p>
                      <p className="text-2xl font-bold text-gray-900">3:42</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        +15s from last period
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Health</p>
                      <p className="text-2xl font-bold text-gray-900">98.7%</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        All systems operational
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Overview Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NewsEngagementChart 
                  specialty={specialtyFilter === 'all' ? undefined : specialtyFilter}
                  timeRange={timeRange}
                />
                <SystemHealthDashboard />
              </div>
            </div>
          )}

          {selectedView === 'engagement' && (
            <div className="space-y-8">
              <NewsEngagementChart 
                specialty={specialtyFilter === 'all' ? undefined : specialtyFilter}
                timeRange={timeRange}
                className="w-full"
              />
            </div>
          )}

          {selectedView === 'behavior' && (
            <div className="space-y-8">
              <UserBehaviorDashboard 
                specialty={specialtyFilter === 'all' ? undefined : specialtyFilter}
                timeRange={timeRange}
                className="w-full"
              />
            </div>
          )}

          {selectedView === 'health' && (
            <div className="space-y-8">
              <SystemHealthDashboard 
                autoRefresh={true}
                refreshInterval={30000}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </FeatureFlagProvider>
  );
};

export default AnalyticsPage;