/**
 * User Behavior Dashboard Component
 * Displays session analytics, reading patterns, and user engagement metrics
 */

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Activity,
  Target,
  Globe,
  Calendar,
  RefreshCw,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useUserBehaviorAnalytics } from '../../hooks/useRealtimeAnalytics';

interface SessionData {
  date: string;
  sessions: number;
  uniqueUsers: number;
  returningUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  specialty: string;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
  avgSessionTime: number;
  color: string;
}

interface ActivityHeatmap {
  hour: number;
  day: string;
  activity: number;
  specialty: string;
}

interface SpecialtyEngagement {
  specialty: string;
  engagement: number;
  retention: number;
  satisfaction: number;
  growth: number;
}

interface UserBehaviorDashboardProps {
  specialty?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  className?: string;
}

const DEVICE_COLORS = {
  mobile: '#ef4444',
  desktop: '#3b82f6',
  tablet: '#10b981'
};

const SPECIALTY_COLORS = {
  cardiology: '#ef4444',
  obgyn: '#8b5cf6',
  general: '#06b6d4',
  emergency_medicine: '#f97316',
  internal_medicine: '#10b981',
  surgery: '#f59e0b'
};

export const UserBehaviorDashboard: React.FC<UserBehaviorDashboardProps> = ({
  specialty,
  timeRange = '7d',
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [activityHeatmap, setActivityHeatmap] = useState<ActivityHeatmap[]>([]);
  const [specialtyEngagement, setSpecialtyEngagement] = useState<SpecialtyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'sessions' | 'devices' | 'activity' | 'specialty'>('sessions');

  const fetchUserBehaviorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data generation - replace with actual API calls
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const now = new Date();

      // Generate session data
      const sessionData: SessionData[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const sessions = Math.floor(Math.random() * 200) + 50;
        const uniqueUsers = Math.floor(sessions * (0.6 + Math.random() * 0.3));

        sessionData.push({
          date: dateStr,
          sessions,
          uniqueUsers,
          returningUsers: Math.floor(uniqueUsers * (0.3 + Math.random() * 0.4)),
          avgSessionDuration: Math.floor(Math.random() * 600) + 120,
          bounceRate: Math.random() * 0.4 + 0.2,
          specialty: specialty || 'cardiology'
        });
      }

      // Generate device data
      const deviceData: DeviceData[] = [
        {
          device: 'mobile',
          users: Math.floor(Math.random() * 500) + 300,
          percentage: 0,
          avgSessionTime: Math.floor(Math.random() * 300) + 180,
          color: DEVICE_COLORS.mobile
        },
        {
          device: 'desktop',
          users: Math.floor(Math.random() * 400) + 200,
          percentage: 0,
          avgSessionTime: Math.floor(Math.random() * 600) + 300,
          color: DEVICE_COLORS.desktop
        },
        {
          device: 'tablet',
          users: Math.floor(Math.random() * 150) + 50,
          percentage: 0,
          avgSessionTime: Math.floor(Math.random() * 400) + 200,
          color: DEVICE_COLORS.tablet
        }
      ];

      // Calculate percentages
      const totalUsers = deviceData.reduce((sum, d) => sum + d.users, 0);
      deviceData.forEach(d => {
        d.percentage = (d.users / totalUsers) * 100;
      });

      // Generate activity heatmap
      const activityData: ActivityHeatmap[] = [];
      const days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          activityData.push({
            hour,
            day: days_of_week[day],
            activity: Math.floor(Math.random() * 100) + 10,
            specialty: specialty || 'cardiology'
          });
        }
      }

      // Generate specialty engagement data
      const specialtyData: SpecialtyEngagement[] = Object.keys(SPECIALTY_COLORS).map(spec => ({
        specialty: spec,
        engagement: Math.random() * 40 + 60,
        retention: Math.random() * 30 + 70,
        satisfaction: Math.random() * 20 + 80,
        growth: Math.random() * 50 + 25
      }));

      setSessionData(sessionData);
      setDeviceData(deviceData);
      setActivityHeatmap(activityData);
      setSpecialtyEngagement(specialtyData);

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load user behavior data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBehaviorData();
  }, [specialty, timeRange]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            <span className="text-gray-600">Loading user behavior data...</span>
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
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-500 mb-2">Error loading data</div>
            <p className="text-gray-600 text-sm">{error}</p>
            <button 
              onClick={fetchUserBehaviorData}
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Behavior Analytics</h3>
              <p className="text-sm text-gray-600">
                Session patterns and engagement insights {specialty && `for ${specialty}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchUserBehaviorData}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => {/* Implement export functionality */}}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Export data"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'sessions', label: 'Sessions', icon: Users },
            { id: 'devices', label: 'Devices', icon: Monitor },
            { id: 'activity', label: 'Activity', icon: Calendar },
            { id: 'specialty', label: 'Specialty', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Sessions View */}
        {selectedView === 'sessions' && (
          <div className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatAxisLabel}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'avgSessionDuration') {
                        return [formatDuration(value as number), 'Avg Session Duration'];
                      }
                      return [value, name];
                    }}
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
                    dataKey="sessions"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="uniqueUsers"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="returningUsers"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Session Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {sessionData.reduce((sum, d) => sum + d.sessions, 0).toLocaleString()}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Unique Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {sessionData.reduce((sum, d) => sum + d.uniqueUsers, 0).toLocaleString()}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Returning Users</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {((sessionData.reduce((sum, d) => sum + d.returningUsers, 0) / 
                         sessionData.reduce((sum, d) => sum + d.uniqueUsers, 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Avg Session</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatDuration(sessionData.reduce((sum, d) => sum + d.avgSessionDuration, 0) / sessionData.length || 0)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices View */}
        {selectedView === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Distribution Pie Chart */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Device Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                        label={({ device, percentage }) => `${device} ${percentage.toFixed(1)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Performance */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Session Time by Device</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis type="number" stroke="#6b7280" fontSize={12} />
                      <YAxis type="category" dataKey="device" stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        formatter={(value) => [formatDuration(value as number), 'Avg Session Time']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="avgSessionTime" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Device Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {deviceData.map((device) => (
                <div key={device.device} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    {device.device === 'mobile' && <Smartphone className="w-5 h-5" style={{ color: device.color }} />}
                    {device.device === 'desktop' && <Monitor className="w-5 h-5" style={{ color: device.color }} />}
                    {device.device === 'tablet' && <Tablet className="w-5 h-5" style={{ color: device.color }} />}
                    <span className="font-medium text-gray-900 capitalize">{device.device}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Users</span>
                      <span className="font-semibold">{device.users.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Percentage</span>
                      <span className="font-semibold">{device.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Session</span>
                      <span className="font-semibold">{formatDuration(device.avgSessionTime)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Heatmap View */}
        {selectedView === 'activity' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Peak Activity Hours</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{hour}</div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const activity = activityHeatmap.find(a => a.hour === hour && a.day === day)?.activity || 0;
                      const intensity = Math.min(activity / 100, 1);
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="w-4 h-4 rounded-sm mb-1 mx-auto cursor-pointer transition-all hover:scale-110"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                            border: '1px solid #e5e7eb'
                          }}
                          title={`${day} ${hour}:00 - ${activity} sessions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Less activity</span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: `rgba(59, 130, 246, ${(i + 1) * 0.2})` }}
                    />
                  ))}
                </div>
                <span>More activity</span>
              </div>
            </div>
          </div>
        )}

        {/* Specialty Engagement View */}
        {selectedView === 'specialty' && !specialty && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Specialty Performance Radar</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={specialtyEngagement}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="specialty" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Engagement"
                    dataKey="engagement"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Retention"
                    dataKey="retention"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Satisfaction"
                    dataKey="satisfaction"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">User Retention</div>
            <div className="text-lg font-bold text-gray-900">
              {((sessionData.reduce((sum, d) => sum + d.returningUsers, 0) / 
                 sessionData.reduce((sum, d) => sum + d.uniqueUsers, 0)) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Bounce Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {(sessionData.reduce((sum, d) => sum + d.bounceRate, 0) / sessionData.length * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Mobile Usage</div>
            <div className="text-lg font-bold text-gray-900">
              {deviceData.find(d => d.device === 'mobile')?.percentage.toFixed(1) || '0'}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Peak Activity</div>
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...activityHeatmap.map(a => a.activity))} sessions/hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBehaviorDashboard;