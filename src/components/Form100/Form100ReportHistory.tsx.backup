// Form 100 Report History Component
// Displays saved Form 100 reports with search, filter, and management capabilities
// HIPAA-compliant with mobile-optimized design

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Heart,
  Activity,
  User,
  Shield
} from 'lucide-react';
import { Form100Request, Form100ServiceResponse } from '../../types/form100';
import { Form100Service } from '../../services/form100Service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface Form100ReportHistoryProps {
  userId: string;
  sessionId?: string;
  onReportSelect?: (report: Form100Request) => void;
  onReportDelete?: (reportId: string) => void;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
  compact?: boolean;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  department: string;
}

const Form100ReportHistory: React.FC<Form100ReportHistoryProps> = ({
  userId,
  sessionId,
  onReportSelect,
  onReportDelete,
  className,
  showSearch = true,
  showFilters = true,
  maxHeight = 'max-h-96',
  compact = false
}) => {
  // State management
  const [reports, setReports] = useState<Form100Request[]>([]);
  const [filteredReports, setFilteredReports] = useState<Form100Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    department: 'all'
  });

  // Load reports from database
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await Form100Service.getUserForm100Reports(userId, {
        sessionId: sessionId,
        limit: 50 // Load up to 50 recent reports
      });
      
      if (result.success && result.data) {
        setReports(result.data.reports);
        setTotalCount(result.data.totalCount);
      } else {
        throw new Error(result.error?.message || 'Failed to load reports');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading Form 100 reports:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  // Initial load
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filter and search reports
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...reports];
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.generationStatus === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate = new Date(0); // Show all
      }
      
      filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
    }
    
    // Apply department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(report => report.department === filters.department);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report =>
        report.primaryDiagnosis?.name?.toLowerCase().includes(term) ||
        report.primaryDiagnosis?.code?.toLowerCase().includes(term) ||
        report.additionalNotes?.toLowerCase().includes(term) ||
        report.generatedForm?.toLowerCase().includes(term)
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, filters, searchTerm]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this Form 100 report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await Form100Service.deleteForm100Report(reportId, userId);
      
      if (result.success) {
        // Remove from local state
        setReports(prev => prev.filter(r => r.id !== reportId));
        onReportDelete?.(reportId);
      } else {
        throw new Error(result.error?.message || 'Failed to delete report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Handle report download
  const handleDownloadReport = (report: Form100Request) => {
    if (!report.generatedForm) {
      alert('No generated form content available for download.');
      return;
    }
    
    const content = `Form 100 Emergency Consultation Report
Generated: ${report.generatedAt?.toLocaleString() || report.createdAt.toLocaleString()}
Report ID: ${report.id}
Session ID: ${report.sessionId}

PRIMARY DIAGNOSIS:
${report.primaryDiagnosis?.name || 'Not specified'} (${report.primaryDiagnosis?.code || 'N/A'})

GENERATED REPORT:
${report.generatedForm}

---
Generated by MediMind Expert - Form 100 System
Report created: ${report.createdAt.toLocaleString()}
Last updated: ${report.updatedAt.toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form100-report-${report.id?.slice(0, 8)}-${new Date(report.createdAt).toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle report expansion
  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Completed' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Failed' };
      case 'processing':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', text: 'Processing' };
      default:
        return { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', text: 'Pending' };
    }
  };

  // Get diagnosis icon
  const getDiagnosisIcon = (diagnosis?: any) => {
    if (!diagnosis?.code) return FileText;
    
    const code = diagnosis.code.toLowerCase();
    if (code.includes('i50') || code.includes('heart failure')) return Heart;
    if (code.includes('i24') || code.includes('i21')) return Activity;
    if (code.includes('i26')) return Shield;
    return FileText;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading Form 100 reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Error Loading Reports</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={loadReports}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports by diagnosis, code, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="Emergency">Emergency</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Internal Medicine">Internal Medicine</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {filteredReports.length} of {totalCount} reports
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <button
          onClick={loadReports}
          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Reports list */}
      <div className={cn("space-y-3", maxHeight, "overflow-y-auto")}>
        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No Form 100 reports found</p>
            <p className="text-slate-400 text-sm">
              {searchTerm || filters.status !== 'all' || filters.dateRange !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Generate your first Form 100 report to see it here'
              }
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isExpanded = expandedReports.has(report.id!);
            const statusDisplay = getStatusDisplay(report.generationStatus);
            const DiagnosisIcon = getDiagnosisIcon(report.primaryDiagnosis);
            const StatusIcon = statusDisplay.icon;
            
            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                {/* Report header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <DiagnosisIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {report.primaryDiagnosis?.name || 'Form 100 Report'}
                          </h3>
                          {report.primaryDiagnosis?.code && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {report.primaryDiagnosis.code}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                          </span>
                          
                          <span className={cn("flex items-center space-x-1 px-2 py-0.5 rounded-full", statusDisplay.bg)}>
                            <StatusIcon className={cn("w-3 h-3", statusDisplay.color)} />
                            <span className={statusDisplay.color}>{statusDisplay.text}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {report.generationStatus === 'completed' && (
                        <>
                          <button
                            onClick={() => onReportSelect?.(report)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View report"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download report"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDeleteReport(report.id!)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      
                      <button
                        onClick={() => toggleReportExpansion(report.id!)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    {report.additionalNotes && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Notes</h4>
                        <p className="text-sm text-slate-600">{report.additionalNotes}</p>
                      </div>
                    )}
                    
                    {report.generatedForm && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Generated Report</h4>
                        <div className="bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                            {report.generatedForm.substring(0, 300)}
                            {report.generatedForm.length > 300 && '...'}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                      <div>
                        <span className="font-medium">Department:</span> {report.department}
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span> {report.priority}
                      </div>
                      <div>
                        <span className="font-medium">Session:</span> {report.sessionId?.slice(0, 8)}...
                      </div>
                      <div>
                        <span className="font-medium">Report ID:</span> {report.id?.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Form100ReportHistory;