import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Calendar,
  TestTube2,
  TrendingUp,
  Activity,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { PatientInfo, ABGResult, ABGFilters } from '../../../types/abg';
import { getUserABGResults } from '../../../services/abgService';

interface PatientABGSummaryProps {
  patient: PatientInfo;
  onViewResult?: (result: ABGResult) => void;
  onViewAll?: () => void;
  compact?: boolean;
  maxResults?: number;
}

export const PatientABGSummary: React.FC<PatientABGSummaryProps> = ({
  patient,
  onViewResult,
  onViewAll,
  compact = false,
  maxResults = 5
}) => {
  const [results, setResults] = useState<ABGResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [stats, setStats] = useState({
    totalResults: 0,
    recentResults: 0,
    avgProcessingTime: 0
  });

  // Load patient's ABG results
  const loadPatientResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const filters: ABGFilters = {
        patientId: patient.id,
        limit: maxResults
      };

      const patientResults = await getUserABGResults(filters);
      
      // Get all results for stats
      const allResults = await getUserABGResults({
        patientId: patient.id,
        limit: 1000 // Get all for stats
      });

      setResults(patientResults);
      
      // Calculate stats
      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentCount = allResults.filter(r => 
        new Date(r.created_at) >= lastMonth
      ).length;

      const processingTimes = allResults
        .filter(r => r.processing_time_ms)
        .map(r => r.processing_time_ms!);
      const avgTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;

      setStats({
        totalResults: allResults.length,
        recentResults: recentCount,
        avgProcessingTime: Math.round(avgTime)
      });

    } catch (err) {

      setError('Failed to load ABG results');
    } finally {
      setIsLoading(false);
    }
  }, [patient.id, maxResults]);

  useEffect(() => {
    loadPatientResults();
  }, [loadPatientResults]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate patient age
  const calculateAge = (): number | null => {
    if (!patient.date_of_birth) return null;
    const birth = new Date(patient.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Loading patient ABG history...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3 text-red-600">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-medium">Unable to load ABG history</div>
            <div className="text-sm text-red-500">{error}</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("", compact ? "p-4" : "p-6")}>
      {/* Patient Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              {patient.medical_record_number && (
                <span>MRN: {patient.medical_record_number}</span>
              )}
              {calculateAge() && (
                <span>Age: {calculateAge()}</span>
              )}
            </div>
            {patient.date_of_birth && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {onViewAll && stats.totalResults > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="flex items-center gap-2"
          >
            <span>View All ({stats.totalResults})</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalResults}</div>
          <div className="text-sm text-gray-600">Total ABGs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.recentResults}</div>
          <div className="text-sm text-gray-600">Last 30 Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {stats.avgProcessingTime > 0 ? `${(stats.avgProcessingTime / 1000).toFixed(1)}s` : '-'}
          </div>
          <div className="text-sm text-gray-600">Avg Processing</div>
        </div>
      </div>

      {/* Recent Results */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TestTube2 className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Recent ABG Results</h4>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TestTube2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <div className="font-medium">No ABG results yet</div>
            <div className="text-sm">ABG analyses for this patient will appear here</div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <TestTube2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {result.interpretation && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Interpreted</span>
                        </div>
                      )}
                      {result.action_plan && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">Action Plan</span>
                        </div>
                      )}
                      {result.processing_time_ms && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {(result.processing_time_ms / 1000).toFixed(1)}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {onViewResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewResult(result)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">View</span>
                  </Button>
                )}
              </div>
            ))}

            {stats.totalResults > results.length && (
              <div className="text-center pt-2">
                <div className="text-sm text-gray-500">
                  Showing {results.length} of {stats.totalResults} results
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};