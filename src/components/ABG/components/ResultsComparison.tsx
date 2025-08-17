import React, { useState, useMemo } from 'react';
import {
  GitCompareArrows,
  Calendar,
  User,
  Clock,
  Target,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Copy,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { ABGResult, PatientInfo } from '../../../types/abg';

interface ResultsComparisonProps {
  results: ABGResult[];
  selectedResultIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onClose: () => void;
  className?: string;
}

interface ComparisonMetric {
  label: string;
  getValue: (result: ABGResult) => string | number | null;
  format?: (value: any) => string;
  icon?: React.ElementType;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'confidence';
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    label: 'Analysis Date',
    getValue: (r) => r.created_at,
    format: (date) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    icon: Calendar,
    type: 'date'
  },
  {
    label: 'Patient',
    getValue: (r) => r.patient ? `${r.patient.first_name} ${r.patient.last_name}` : 'Unknown',
    icon: User,
    type: 'text'
  },
  {
    label: 'Analysis Type',
    getValue: (r) => r.type,
    icon: FileText,
    type: 'text'
  },
  {
    label: 'Processing Time',
    getValue: (r) => r.processing_time_ms,
    format: (ms) => ms ? `${ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}` : 'N/A',
    icon: Clock,
    type: 'number'
  },
  {
    label: 'Confidence Score',
    getValue: (r) => r.gemini_confidence,
    format: (conf) => conf ? `${Math.round(conf * 100)}%` : 'N/A',
    icon: Target,
    type: 'confidence'
  },
  {
    label: 'Has Interpretation',
    getValue: (r) => !!r.interpretation,
    format: (has) => has ? 'Yes' : 'No',
    icon: CheckCircle,
    type: 'boolean'
  },
  {
    label: 'Has Action Plan',
    getValue: (r) => !!r.action_plan,
    format: (has) => has ? 'Yes' : 'No',
    icon: Activity,
    type: 'boolean'
  }
];

export const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  results,
  selectedResultIds,
  onSelectionChange,
  onClose,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'table'>('side-by-side');

  // Get selected results
  const selectedResults = useMemo(() => {
    return selectedResultIds.map(id => results.find(r => r.id === id)).filter(Boolean) as ABGResult[];
  }, [results, selectedResultIds]);

  // Calculate comparison insights
  const comparisonInsights = useMemo(() => {
    if (selectedResults.length < 2) return null;

    const insights = [];

    // Time span analysis
    const dates = selectedResults.map(r => new Date(r.created_at)).sort();
    const timeSpan = dates[dates.length - 1].getTime() - dates[0].getTime();
    const timeSpanDays = Math.ceil(timeSpan / (1000 * 60 * 60 * 24));
    
    if (timeSpanDays > 0) {
      insights.push({
        type: 'time',
        icon: Calendar,
        text: `Analysis span: ${timeSpanDays} day${timeSpanDays > 1 ? 's' : ''}`
      });
    }

    // Patient analysis
    const uniquePatients = new Set(selectedResults.map(r => r.patient_id).filter(Boolean));
    insights.push({
      type: 'patient',
      icon: User,
      text: `${uniquePatients.size} unique patient${uniquePatients.size > 1 ? 's' : ''}`
    });

    // Confidence trends
    const confidenceScores = selectedResults
      .map(r => r.gemini_confidence)
      .filter(Boolean)
      .map(c => c! * 100);
    
    if (confidenceScores.length > 1) {
      const avgConfidence = confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length;
      const trend = confidenceScores[confidenceScores.length - 1] > confidenceScores[0] ? 'improving' : 'declining';
      
      insights.push({
        type: 'confidence',
        icon: trend === 'improving' ? TrendingUp : TrendingDown,
        text: `Confidence trend: ${trend} (avg: ${Math.round(avgConfidence)}%)`
      });
    }

    // Processing time analysis
    const processingTimes = selectedResults
      .map(r => r.processing_time_ms)
      .filter(Boolean) as number[];
    
    if (processingTimes.length > 1) {
      const avgTime = processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length;
      insights.push({
        type: 'performance',
        icon: Clock,
        text: `Avg processing: ${avgTime < 1000 ? `${Math.round(avgTime)}ms` : `${(avgTime / 1000).toFixed(1)}s`}`
      });
    }

    return insights;
  }, [selectedResults]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const removeFromComparison = (resultId: string) => {
    onSelectionChange(selectedResultIds.filter(id => id !== resultId));
  };

  const exportComparison = () => {
    const data = selectedResults.map(result => ({
      id: result.id,
      date: result.created_at,
      patient: result.patient ? `${result.patient.first_name} ${result.patient.last_name}` : 'Unknown',
      type: result.type,
      processingTime: result.processing_time_ms,
      confidence: result.gemini_confidence,
      hasInterpretation: !!result.interpretation,
      hasActionPlan: !!result.action_plan,
      rawAnalysis: result.raw_analysis?.substring(0, 200) + '...'
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abg-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedResults.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <GitCompareArrows className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Selected</h3>
        <p className="text-gray-600 mb-4">
          Select 2 or more ABG results to compare them side by side
        </p>
        <Button variant="outline" onClick={onClose}>
          Close Comparison
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comparison Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitCompareArrows className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Results Comparison
              </h2>
              <p className="text-sm text-gray-600">
                Comparing {selectedResults.length} ABG analyses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={comparisonMode === 'side-by-side' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonMode('side-by-side')}
              >
                Side by Side
              </Button>
              <Button
                variant={comparisonMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonMode('table')}
              >
                Table
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={exportComparison}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comparison Insights */}
        {comparisonInsights && (
          <div className="mt-4 flex flex-wrap gap-2">
            {comparisonInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {insight.text}
                </Badge>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comparison Content */}
      {comparisonMode === 'side-by-side' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(selectedResults.length, 3)}, 1fr)` }}>
          {selectedResults.slice(0, 3).map((result, index) => (
            <Card key={result.id} className="p-4 space-y-4">
              {/* Result Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Analysis #{index + 1}
                  </h3>
                  <p className="text-xs text-gray-500">ID: {result.id.substring(0, 8)}...</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromComparison(result.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Result Metrics */}
              <div className="space-y-3">
                {COMPARISON_METRICS.map(metric => {
                  const Icon = metric.icon || FileText;
                  const value = metric.getValue(result);
                  const formattedValue = metric.format ? metric.format(value) : String(value);

                  let valueColor = 'text-gray-900';
                  if (metric.type === 'confidence') {
                    const conf = value as number;
                    if (conf >= 0.8) valueColor = 'text-green-600';
                    else if (conf >= 0.6) valueColor = 'text-yellow-600';
                    else valueColor = 'text-red-600';
                  } else if (metric.type === 'boolean') {
                    valueColor = value ? 'text-green-600' : 'text-gray-500';
                  }

                  return (
                    <div key={metric.label} className="flex items-start gap-2">
                      <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500">{metric.label}</div>
                        <div className={cn("text-sm font-medium", valueColor)}>
                          {formattedValue}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analysis Preview */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Analysis Preview</span>
                </div>
                <div className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded">
                  {result.raw_analysis?.substring(0, 150)}...
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2">
                <Badge
                  variant={result.interpretation ? 'default' : 'secondary'}
                  className={result.interpretation ? 'bg-green-100 text-green-800' : ''}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {result.interpretation ? 'Interpreted' : 'Pending'}
                </Badge>
                <Badge
                  variant={result.action_plan ? 'default' : 'secondary'}
                  className={result.action_plan ? 'bg-blue-100 text-blue-800' : ''}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {result.action_plan ? 'Action Plan' : 'No Plan'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {selectedResults.map((result, index) => (
                    <th key={result.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-between">
                        Analysis #{index + 1}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromComparison(result.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {COMPARISON_METRICS.map(metric => {
                  const Icon = metric.icon || FileText;
                  return (
                    <tr key={metric.label}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {metric.label}
                          </span>
                        </div>
                      </td>
                      {selectedResults.map(result => {
                        const value = metric.getValue(result);
                        const formattedValue = metric.format ? metric.format(value) : String(value);

                        let valueColor = 'text-gray-900';
                        if (metric.type === 'confidence') {
                          const conf = value as number;
                          if (conf >= 0.8) valueColor = 'text-green-600';
                          else if (conf >= 0.6) valueColor = 'text-yellow-600';
                          else valueColor = 'text-red-600';
                        } else if (metric.type === 'boolean') {
                          valueColor = value ? 'text-green-600' : 'text-gray-500';
                        }

                        return (
                          <td key={result.id} className="px-4 py-4 whitespace-nowrap">
                            <span className={cn("text-sm", valueColor)}>
                              {formattedValue}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detailed Sections */}
      <div className="space-y-4">
        {/* Analysis Details */}
        <Card>
          <button
            onClick={() => toggleSection('analysis')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Analysis Details</h3>
            </div>
            {expandedSections.has('analysis') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('analysis') && (
            <div className="p-4 border-t space-y-4">
              {selectedResults.map((result, index) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Analysis #{index + 1} - Full Text
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    {result.raw_analysis}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResultsComparison;