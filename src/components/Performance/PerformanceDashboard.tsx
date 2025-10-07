import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { performanceMonitor } from '../../services/performanceMonitoring';
import { usePerformanceMode } from '../../contexts/PerformanceModeContext';
import { Activity, Cpu, HardDrive, Gauge, Monitor, Zap, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  lcp?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  memoryUsage?: number;
  timestamp: number;
}

export const PerformanceDashboard: React.FC = () => {
  const { capabilities, performanceMode, setPerformanceMode } = usePerformanceMode();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ timestamp: Date.now() });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch latest metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      const aggregated = performanceMonitor.getAggregatedMetrics();
      setMetrics({
        lcp: aggregated.lcp.p95,
        inp: aggregated.inp.p95,
        cls: aggregated.cls.median,
        ttfb: aggregated.ttfb.p95,
        memoryUsage: aggregated.memory.avg,
        timestamp: Date.now()
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  // Clear metrics
  const handleClearMetrics = () => {
    performanceMonitor.clearMetrics();
    setRefreshKey(prev => prev + 1);
  };

  // Format metric value
  const formatMetric = (value: number | undefined, unit: string = 'ms'): string => {
    if (value === undefined) return 'N/A';
    if (unit === 'MB') return `${value.toFixed(2)} ${unit}`;
    return `${value.toFixed(0)} ${unit}`;
  };

  // Get metric status
  const getMetricStatus = (value: number | undefined, threshold: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value === undefined) return 'needs-improvement';
    if (value <= threshold) return 'good';
    if (value <= threshold * 1.5) return 'needs-improvement';
    return 'poor';
  };

  // Get status color
  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'needs-improvement':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  // Web Vitals thresholds
  const LCP_THRESHOLD = 2500; // ms
  const INP_THRESHOLD = 200; // ms
  const CLS_THRESHOLD = 0.1;
  const TTFB_THRESHOLD = 800; // ms

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time performance monitoring and device capabilities
            </p>
          </div>
          <button
            onClick={handleClearMetrics}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Metrics</span>
          </button>
        </div>

        {/* Web Vitals Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Core Web Vitals</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LCP Card */}
            <Card className={`\${getStatusColor(getMetricStatus(metrics.lcp, LCP_THRESHOLD))} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>LCP</span>
                  <Gauge className="w-4 h-4" />
                </CardTitle>
                <CardDescription className="text-xs">Largest Contentful Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMetric(metrics.lcp)}</div>
                <div className="text-xs mt-1">Target: &lt;{LCP_THRESHOLD}ms</div>
              </CardContent>
            </Card>

            {/* INP Card */}
            <Card className={`\${getStatusColor(getMetricStatus(metrics.inp, INP_THRESHOLD))} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>INP</span>
                  <Zap className="w-4 h-4" />
                </CardTitle>
                <CardDescription className="text-xs">Interaction to Next Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMetric(metrics.inp)}</div>
                <div className="text-xs mt-1">Target: &lt;{INP_THRESHOLD}ms</div>
              </CardContent>
            </Card>

            {/* CLS Card */}
            <Card className={`\${getStatusColor(getMetricStatus(metrics.cls, CLS_THRESHOLD))} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>CLS</span>
                  <Monitor className="w-4 h-4" />
                </CardTitle>
                <CardDescription className="text-xs">Cumulative Layout Shift</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMetric(metrics.cls, '')}</div>
                <div className="text-xs mt-1">Target: &lt;{CLS_THRESHOLD}</div>
              </CardContent>
            </Card>

            {/* TTFB Card */}
            <Card className={`\${getStatusColor(getMetricStatus(metrics.ttfb, TTFB_THRESHOLD))} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>TTFB</span>
                  <Activity className="w-4 h-4" />
                </CardTitle>
                <CardDescription className="text-xs">Time to First Byte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMetric(metrics.ttfb)}</div>
                <div className="text-xs mt-1">Target: &lt;{TTFB_THRESHOLD}ms</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resource Usage Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Resource Usage</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory Usage */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Memory Usage</span>
                  <HardDrive className="w-5 h-5 text-blue-600" />
                </CardTitle>
                <CardDescription>Current JS heap size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatMetric(metrics.memoryUsage, 'MB')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Target: &lt;150MB
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (metrics.memoryUsage || 0) < 150 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(((metrics.memoryUsage || 0) / 200) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Mode */}
            <Card className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Performance Mode</span>
                  <Zap className="w-5 h-5 text-blue-600" />
                </CardTitle>
                <CardDescription>Current optimization level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl font-bold \${
                    performanceMode === 'full' ? 'text-emerald-600' :
                    performanceMode === 'balanced' ? 'text-amber-600' :
                    'text-blue-600'
                  }`}>
                    {performanceMode.charAt(0).toUpperCase() + performanceMode.slice(1)}
                  </div>
                  {performanceMode === 'full' && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                  {performanceMode === 'lite' && <AlertTriangle className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="mt-4 space-y-2">
                  {['full', 'balanced', 'lite'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPerformanceMode(mode as any)}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                        performanceMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Device Capabilities Section */}
        {capabilities && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span>Device Capabilities</span>
            </h2>
            <Card className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPU Cores</div>
                    <div className="text-2xl font-bold">{capabilities.cpuCores}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Memory</div>
                    <div className="text-2xl font-bold">{capabilities.deviceMemory} GB</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">GPU Tier</div>
                    <div className={`text-2xl font-bold \${
                      capabilities.gpuTier === 'high' ? 'text-emerald-600' :
                      capabilities.gpuTier === 'medium' ? 'text-amber-600' :
                      'text-blue-600'
                    }`}>
                      {capabilities.gpuTier.charAt(0).toUpperCase() + capabilities.gpuTier.slice(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Connection</div>
                    <div className="text-2xl font-bold uppercase">{capabilities.connectionType}</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-2 \${capabilities.supportsWebGL ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {capabilities.supportsWebGL ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>WebGL</span>
                  </div>
                  <div className={`flex items-center space-x-2 \${capabilities.prefersReducedMotion ? 'text-blue-600' : 'text-gray-400'}`}>
                    {capabilities.prefersReducedMotion ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>Reduced Motion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
