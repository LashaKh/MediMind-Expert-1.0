import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  TrendingUp,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ABGResult, PatientInfo } from '../../../types/abg';

interface TrendChartsProps {
  results: ABGResult[];
  timeRange: string;
  patients: PatientInfo[];
}

// Interface retained for reference if external charting is added later
// interface ChartData {
//   labels: string[];
//   datasets: {
//     label: string;
//     data: number[];
//     backgroundColor?: string;
//     borderColor?: string;
//     fill?: boolean;
//   }[];
// }

interface TrendPoint {
  date: string;
  count: number;
  avgConfidence: number;
  avgProcessingTime: number;
  successRate: number;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  results,
  timeRange: _timeRange,
  patients: _patients
}) => {
  const { t } = useTranslation();
  const [activeChart, setActiveChart] = useState<'volume' | 'quality' | 'performance' | 'distribution'>('volume');

  // Process data for trend analysis
  const trendData = useMemo(() => {
    // Group results by date
    const dateGroups = results.reduce((acc, result) => {
      const date = new Date(result.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(result);
      return acc;
    }, {} as Record<string, ABGResult[]>);

    // Create trend points
    const trendPoints: TrendPoint[] = Object.entries(dateGroups)
      .map(([date, dayResults]) => {
        const avgConfidence = dayResults
          .filter(r => r.gemini_confidence)
          .reduce((sum, r) => sum + (r.gemini_confidence || 0), 0) / 
          Math.max(1, dayResults.filter(r => r.gemini_confidence).length);

        const avgProcessingTime = dayResults
          .filter(r => r.processing_time_ms)
          .reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / 
          Math.max(1, dayResults.filter(r => r.processing_time_ms).length);

        const successfulResults = dayResults.filter(r => r.interpretation && r.action_plan);
        const successRate = dayResults.length > 0 ? (successfulResults.length / dayResults.length) * 100 : 0;

        return {
          date,
          count: dayResults.length,
          avgConfidence: Math.round(avgConfidence * 100),
          avgProcessingTime: Math.round(avgProcessingTime),
          successRate: Math.round(successRate)
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return trendPoints;
  }, [results]);

  // Volume trend chart data
  // Chart data objects kept minimal; rendered via SimpleLineChart

  // Quality trend chart data

  // Performance chart data

  // Distribution data
  const distributionData = useMemo(() => {
    const arterialCount = results.filter(r => r.type === 'Arterial Blood Gas').length;
    const venousCount = results.filter(r => r.type === 'Venous Blood Gas').length;

    return {
      typeDistribution: {
        labels: ['Arterial Blood Gas', 'Venous Blood Gas'],
        datasets: [{
          data: [arterialCount, venousCount],
          backgroundColor: ['#3b82f6', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      confidenceDistribution: {
        labels: ['High (≥80%)', 'Medium (60-79%)', 'Low (<60%)'],
        datasets: [{
          data: [
            results.filter(r => (r.gemini_confidence || 0) >= 0.8).length,
            results.filter(r => (r.gemini_confidence || 0) >= 0.6 && (r.gemini_confidence || 0) < 0.8).length,
            results.filter(r => (r.gemini_confidence || 0) < 0.6).length
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    };
  }, [results]);

  // Simple SVG-based charts (since we don't have Chart.js)
  const SimpleLineChart = ({ data, title, color = '#3b82f6' }: { data: number[], title: string, color?: string }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="h-32 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
            <polyline
              fill={color}
              fillOpacity="0.1"
              stroke="none"
              points={`0,100 ${points} 100,100`}
            />
          </svg>
          <div className="absolute top-0 right-0 text-xs text-gray-500">{max}</div>
          <div className="absolute bottom-0 right-0 text-xs text-gray-500">{min}</div>
        </div>
      </div>
    );
  };

  const SimpleBarChart = ({ data, labels, title, color = '#3b82f6' }: { data: number[], labels: string[], title: string, color?: string }) => {
    const max = Math.max(...data, 1);

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="space-y-2">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-16 text-xs text-gray-600 truncate">{labels[index]}</div>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(value / max) * 100}%`,
                    backgroundColor: color
                  }}
                />
              </div>
              <div className="w-8 text-xs text-gray-600 text-right">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const chartConfigs = [
    {
      id: 'volume',
      title: t('abg.trends.tabs.volume', 'Analysis Volume Trends'),
      icon: TrendingUp,
      description: t('abg.trends.descriptions.volume', 'Daily analysis count over time')
    },
    {
      id: 'quality',
      title: t('abg.trends.tabs.quality', 'Quality Metrics'),
      icon: Target,
      description: t('abg.trends.descriptions.quality', 'Confidence and success rate trends')
    },
    {
      id: 'performance',
      title: t('abg.trends.tabs.performance', 'Performance Analytics'),
      icon: Clock,
      description: t('abg.trends.descriptions.performance', 'Processing time trends')
    },
    {
      id: 'distribution',
      title: t('abg.trends.tabs.distribution', 'Analysis Distribution'),
      icon: PieChart,
      description: t('abg.trends.descriptions.distribution', 'Type and quality distribution')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        {chartConfigs.map(config => {
          const Icon = config.icon;
          return (
            <Button
              key={config.id}
              variant={activeChart === config.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart(config.id as typeof activeChart)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {config.title}
            </Button>
          );
        })}
      </div>

      {/* Chart Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeChart === 'volume' && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('abg.trends.volume.dailyTitle', 'Daily Analysis Volume')}</h3>
              </div>
              <SimpleLineChart
                data={trendData.map(p => p.count)}
                title={t('abg.trends.volume.lineTitle', 'Number of Analyses per Day')}
                color="#3b82f6"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">{t('abg.trends.volume.statsTitle', 'Volume Statistics')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.max(...trendData.map(p => p.count), 0)}
                    </div>
                    <div className="text-sm text-gray-600">{t('abg.trends.volume.peakDaily', 'Peak Daily')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(trendData.reduce((sum, p) => sum + p.count, 0) / Math.max(trendData.length, 1))}
                    </div>
                    <div className="text-sm text-gray-600">{t('abg.trends.volume.dailyAverage', 'Daily Average')}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    {t('abg.trends.volume.total', '{{count}} Total', { count: trendData.reduce((sum, p) => sum + p.count, 0) })}
                  </div>
                  <div className="text-sm text-gray-500">{t('abg.trends.volume.subtitle', 'Analyses in selected period')}</div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeChart === 'quality' && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">{t('abg.trends.quality.title', 'Quality Trends')}</h3>
              </div>
              <SimpleLineChart
                data={trendData.map(p => p.avgConfidence)}
                title={t('abg.trends.quality.confidenceTitle', 'Average Confidence Score (%)')}
                color="#10b981"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">{t('abg.trends.quality.successTitle', 'Success Rate')}</h3>
              </div>
              <SimpleLineChart
                data={trendData.map(p => p.successRate)}
                title={t('abg.trends.quality.successLine', 'Success Rate (%)')}
                color="#8b5cf6"
              />
            </Card>
          </>
        )}

        {activeChart === 'performance' && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">{t('abg.trends.performance.title', 'Processing Time')}</h3>
              </div>
              <SimpleLineChart
                data={trendData.map(p => p.avgProcessingTime)}
                title={t('abg.trends.performance.lineTitle', 'Average Processing Time (ms)')}
                color="#f59e0b"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('abg.trends.performance.metrics', 'Performance Metrics')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.min(...trendData.map(p => p.avgProcessingTime).filter(t => t > 0), Infinity) || 0}
                    </div>
                    <div className="text-sm text-gray-600">{t('abg.trends.performance.fastest', 'Fastest (ms)')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.max(...trendData.map(p => p.avgProcessingTime), 0)}
                    </div>
                    <div className="text-sm text-gray-600">{t('abg.trends.performance.slowest', 'Slowest (ms)')}</div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeChart === 'distribution' && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('abg.trends.distribution.typesTitle', 'Analysis Types')}</h3>
              </div>
              <SimpleBarChart
                data={distributionData.typeDistribution.datasets[0].data}
                labels={distributionData.typeDistribution.labels}
                title={t('abg.trends.distribution.typeLine', 'Analysis Type Distribution')}
                color="#3b82f6"
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">{t('abg.trends.distribution.confidenceTitle', 'Confidence Distribution')}</h3>
              </div>
              <SimpleBarChart
                data={distributionData.confidenceDistribution.datasets[0].data}
                labels={distributionData.confidenceDistribution.labels}
                title={t('abg.trends.distribution.confidenceLine', 'Confidence Score Distribution')}
                color="#10b981"
              />
            </Card>
          </>
        )}
      </div>

      {/* Summary Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t('abg.trends.insights.title', 'Key Insights')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">{t('abg.trends.insights.volume', 'Volume Trend')}</h4>
            <p className="text-sm text-blue-700">
              {trendData.length > 0 && trendData[trendData.length - 1].count > trendData[0]?.count
                ? t('abg.trends.insights.increasing', 'Analysis volume is increasing over time')
                : t('abg.trends.insights.stable', 'Analysis volume is stable or decreasing')}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">{t('abg.trends.insights.quality', 'Quality Score')}</h4>
            <p className="text-sm text-green-700">
              {t('abg.trends.insights.avgConfidence', 'Average confidence: {{val}}%', { val: Math.round(trendData.reduce((sum, p) => sum + p.avgConfidence, 0) / Math.max(trendData.length, 1)) })}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">{t('abg.trends.insights.performance', 'Performance')}</h4>
            <p className="text-sm text-orange-700">
              {t('abg.trends.insights.avgProcessing', 'Avg processing: {{ms}}ms', { ms: Math.round(trendData.reduce((sum, p) => sum + p.avgProcessingTime, 0) / Math.max(trendData.length, 1)) })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrendCharts;