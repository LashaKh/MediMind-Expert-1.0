/**
 * System Health Dashboard Component
 * Displays real-time system status, API monitoring, and health metrics
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
  Cell
} from 'recharts';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Database,
  Globe,
  Shield,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  AlertCircle,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useSystemHealthMonitoring } from '../../hooks/useRealtimeAnalytics';

interface SystemMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  activeUsers: number;
}

interface APIEndpoint {
  name: string;
  url: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  responseTime: number;
  successRate: number;
  errorCount: number;
  lastChecked: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  component: string;
}

interface DatabaseHealth {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryPerformance: {
    avgDuration: number;
    slowQueries: number;
    totalQueries: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface SystemHealthDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

const STATUS_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  down: '#6b7280'
};

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [databaseHealth, setDatabaseHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');

  const fetchSystemHealth = async () => {
    try {
      setError(null);

      // Mock data generation - replace with actual monitoring dashboard API
      const now = new Date();
      const hours = selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : selectedTimeRange === '24h' ? 24 : 168;
      
      // Generate system metrics
      const metricsData: SystemMetrics[] = [];
      for (let i = hours * 4; i >= 0; i--) { // Data points every 15 minutes
        const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
        metricsData.push({
          timestamp: timestamp.toISOString(),
          cpuUsage: Math.random() * 40 + 30, // 30-70%
          memoryUsage: Math.random() * 30 + 50, // 50-80%
          responseTime: Math.random() * 500 + 100, // 100-600ms
          errorRate: Math.random() * 2, // 0-2%
          throughput: Math.random() * 100 + 200, // 200-300 requests/min
          activeUsers: Math.floor(Math.random() * 100) + 50 // 50-150 users
        });
      }

      // Generate API endpoint status
      const endpointsData: APIEndpoint[] = [
        {
          name: 'Medical News API',
          url: '/api/medical-news',
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          responseTime: Math.random() * 200 + 50,
          successRate: 0.95 + Math.random() * 0.05,
          errorCount: Math.floor(Math.random() * 5),
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Search Orchestrator',
          url: '/api/search-orchestrator',
          status: Math.random() > 0.05 ? 'healthy' : 'warning',
          responseTime: Math.random() * 300 + 100,
          successRate: 0.92 + Math.random() * 0.08,
          errorCount: Math.floor(Math.random() * 3),
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Flowise Proxy',
          url: '/api/flowise-proxy',
          status: Math.random() > 0.1 ? 'healthy' : 'critical',
          responseTime: Math.random() * 800 + 200,
          successRate: 0.90 + Math.random() * 0.10,
          errorCount: Math.floor(Math.random() * 8),
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Document Upload',
          url: '/api/document-upload',
          status: Math.random() > 0.15 ? 'healthy' : 'warning',
          responseTime: Math.random() * 1500 + 500,
          successRate: 0.88 + Math.random() * 0.12,
          errorCount: Math.floor(Math.random() * 4),
          lastChecked: new Date().toISOString()
        },
        {
          name: 'OpenAI Assistant',
          url: '/api/openai-assistant',
          status: Math.random() > 0.08 ? 'healthy' : 'warning',
          responseTime: Math.random() * 2000 + 300,
          successRate: 0.94 + Math.random() * 0.06,
          errorCount: Math.floor(Math.random() * 6),
          lastChecked: new Date().toISOString()
        }
      ];

      // Generate system alerts
      const alertsData: SystemAlert[] = [];
      if (Math.random() > 0.7) {
        alertsData.push({
          id: `alert-${Date.now()}`,
          type: 'warning',
          title: 'High Response Time',
          message: 'Search API response time above threshold (>500ms)',
          timestamp: new Date().toISOString(),
          resolved: false,
          component: 'search-api'
        });
      }
      if (Math.random() > 0.8) {
        alertsData.push({
          id: `alert-${Date.now() + 1}`,
          type: 'info',
          title: 'High User Activity',
          message: 'Unusual increase in user activity detected',
          timestamp: new Date().toISOString(),
          resolved: false,
          component: 'user-activity'
        });
      }

      // Generate database health
      const dbHealth: DatabaseHealth = {
        connectionPool: {
          active: Math.floor(Math.random() * 15) + 5,
          idle: Math.floor(Math.random() * 10) + 10,
          total: 25
        },
        queryPerformance: {
          avgDuration: Math.random() * 50 + 25,
          slowQueries: Math.floor(Math.random() * 5),
          totalQueries: Math.floor(Math.random() * 1000) + 500
        },
        storage: {
          used: Math.random() * 50 + 30,
          total: 100,
          percentage: Math.random() * 50 + 30
        }
      };

      setMetrics(metricsData);
      setEndpoints(endpointsData);
      setAlerts(alertsData);
      setDatabaseHealth(dbHealth);
      setLastRefresh(new Date());

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedTimeRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'down': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading system health data...</span>
          </div>
        </div>
      </div>
    );
  }

  const overallHealth = endpoints.every(e => e.status === 'healthy') ? 'healthy' :
                       endpoints.some(e => e.status === 'critical' || e.status === 'down') ? 'critical' : 'warning';

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              overallHealth === 'healthy' ? 'bg-green-100' :
              overallHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Activity className={`w-5 h-5 ${
                overallHealth === 'healthy' ? 'text-green-600' :
                overallHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Health Dashboard</h3>
              <p className="text-sm text-gray-600">
                Real-time monitoring • Last updated {formatTimestamp(lastRefresh.toISOString())}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={fetchSystemHealth}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border-l-4 ${
            overallHealth === 'healthy' ? 'bg-green-50 border-green-500' :
            overallHealth === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">System Status</p>
                <p className={`text-lg font-bold capitalize ${
                  overallHealth === 'healthy' ? 'text-green-600' :
                  overallHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {overallHealth}
                </p>
              </div>
              {getStatusIcon(overallHealth)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Users</p>
                <p className="text-lg font-bold text-blue-600">
                  {metrics.length > 0 ? metrics[metrics.length - 1].activeUsers : 0}
                </p>
              </div>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Avg Response</p>
                <p className="text-lg font-bold text-purple-600">
                  {metrics.length > 0 ? formatDuration(metrics[metrics.length - 1].responseTime) : '0ms'}
                </p>
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Throughput</p>
                <p className="text-lg font-bold text-indigo-600">
                  {metrics.length > 0 ? Math.round(metrics[metrics.length - 1].throughput) : 0}/min
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Response Time & Error Rate
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => formatTimestamp(value)}
                    stroke="#6b7280"
                    fontSize={11}
                  />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(value)}
                    formatter={(value, name) => {
                      if (name === 'responseTime') return [formatDuration(value as number), 'Response Time'];
                      if (name === 'errorRate') return [`${(value as number).toFixed(2)}%`, 'Error Rate'];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="errorRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Usage Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Server className="w-4 h-4 mr-2 text-gray-600" />
              Resource Usage
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => formatTimestamp(value)}
                    stroke="#6b7280"
                    fontSize={11}
                  />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(value)}
                    formatter={(value, name) => [`${(value as number).toFixed(1)}%`, name === 'cpuUsage' ? 'CPU Usage' : 'Memory Usage']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpuUsage"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* API Endpoints Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-600" />
            API Endpoints Health
          </h4>
          <div className="grid gap-3">
            {endpoints.map((endpoint) => (
              <div key={endpoint.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <p className="font-medium text-gray-900">{endpoint.name}</p>
                    <p className="text-sm text-gray-600">{endpoint.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Response: </span>
                      <span className="font-medium">{formatDuration(endpoint.responseTime)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Success: </span>
                      <span className="font-medium">{(endpoint.successRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Errors: </span>
                      <span className={`font-medium ${endpoint.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {endpoint.errorCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Health & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Health */}
          {databaseHealth && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2 text-gray-600" />
                Database Health
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Connection Pool</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Active: <strong>{databaseHealth.connectionPool.active}</strong></span>
                    <span>Idle: <strong>{databaseHealth.connectionPool.idle}</strong></span>
                    <span>Total: <strong>{databaseHealth.connectionPool.total}</strong></span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Query Performance</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Avg: <strong>{formatDuration(databaseHealth.queryPerformance.avgDuration)}</strong></span>
                    <span>Slow: <strong>{databaseHealth.queryPerformance.slowQueries}</strong></span>
                    <span>Total: <strong>{databaseHealth.queryPerformance.totalQueries.toLocaleString()}</strong></span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Storage</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>{databaseHealth.storage.used.toFixed(1)}GB / {databaseHealth.storage.total}GB</span>
                    <span className="font-medium">{databaseHealth.storage.percentage.toFixed(1)}% used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        databaseHealth.storage.percentage > 80 ? 'bg-red-500' :
                        databaseHealth.storage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${databaseHealth.storage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Alerts */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-gray-600" />
              Recent Alerts
              {alerts.filter(a => !a.resolved).length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              )}
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No active alerts</p>
                  <p className="text-xs text-gray-500">All systems operating normally</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      alert.type === 'critical' ? 'bg-red-100' :
                      alert.type === 'error' ? 'bg-orange-100' :
                      alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(alert.timestamp)} • {alert.component}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => {
                            setAlerts(alerts.map(a => 
                              a.id === alert.id ? { ...a, resolved: true } : a
                            ));
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">System Performance Trends</h4>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => formatTimestamp(value)}
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip 
                  labelFormatter={(value) => formatTimestamp(value)}
                  formatter={(value, name) => {
                    switch (name) {
                      case 'responseTime': return [formatDuration(value as number), 'Response Time'];
                      case 'throughput': return [`${Math.round(value as number)}/min`, 'Throughput'];
                      case 'activeUsers': return [value, 'Active Users'];
                      default: return [value, name];
                    }
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="text-lg font-bold text-green-600">99.9%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Healthy Endpoints</div>
            <div className="text-lg font-bold text-blue-600">
              {endpoints.filter(e => e.status === 'healthy').length}/{endpoints.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Active Alerts</div>
            <div className={`text-lg font-bold ${
              alerts.filter(a => !a.resolved).length > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {alerts.filter(a => !a.resolved).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Check</div>
            <div className="text-lg font-bold text-gray-900">
              {formatTimestamp(lastRefresh.toISOString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;