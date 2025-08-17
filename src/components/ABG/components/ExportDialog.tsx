import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Calendar,
  Settings,
  Info,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { 
  ABGResult, 
  PatientInfo, 
  ABGExportOptions,
  ABGFilters 
} from '../../../types/abg';
import {
  exportAndDownload,
  getExportSummary,
  validateExportOptions
} from '../../../services/abgExportService';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: ABGResult[];
  patients?: PatientInfo[];
  currentFilters?: ABGFilters;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  results,
  patients,
  currentFilters
}) => {
  const { t } = useTranslation();
  const [exportOptions, setExportOptions] = useState<ABGExportOptions>({
    format: 'json',
    includeImages: true,
    includePatientInfo: true,
    includeInterpretation: true,
    includeActionPlan: true
  });

  const [exportSummary, setExportSummary] = useState<{
    totalResults: number;
    filteredResults: number;
    dateRange?: { start: string; end: string };
    includedFields: string[];
    estimatedFileSize: string;
  } | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Update export summary when options change
  useEffect(() => {
    if (isOpen && results.length > 0) {
      try {
        const summary = getExportSummary(results, exportOptions);
        setExportSummary(summary);
      } catch (error) {
        console.error('Failed to get export summary:', error);
      }
    }
  }, [isOpen, results, exportOptions]);

  // Handle export format change
  const handleFormatChange = (format: 'json' | 'csv' | 'pdf') => {
    setExportOptions(prev => ({ ...prev, format }));
    setExportError(null);
    setExportSuccess(false);
  };

  // Handle inclusion option change
  const handleInclusionChange = (
    field: keyof Pick<ABGExportOptions, 'includeImages' | 'includePatientInfo' | 'includeInterpretation' | 'includeActionPlan'>,
    value: boolean
  ) => {
    setExportOptions(prev => ({ ...prev, [field]: value }));
    setExportError(null);
    setExportSuccess(false);
  };

  // Handle date range change
  const handleDateRangeChange = (start?: string, end?: string) => {
    if (start && end) {
      setExportOptions(prev => ({
        ...prev,
        dateRange: { start, end }
      }));
    } else {
      setExportOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions.dateRange;
        return newOptions;
      });
    }
    setExportError(null);
    setExportSuccess(false);
  };

  // Handle export action
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      // Validate options
      const validation = validateExportOptions(exportOptions);
      if (!validation.isValid) {
        setExportError(validation.errors.join(' '));
        return;
      }

      // Perform export
      await exportAndDownload(results, exportOptions, patients);
      
      setExportSuccess(true);
      
      // Auto-close after successful export
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isExporting) {
      setExportError(null);
      setExportSuccess(false);
      onClose();
    }
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return '{ }';
      case 'csv':
        return '📊';
      case 'pdf':
        return '📄';
      default:
        return '📁';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">{t('abg.export.title', 'Export ABG Results')}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isExporting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('abg.export.format', 'Export Format')}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {(['json', 'csv', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatChange(format)}
                  disabled={isExporting}
                  className={cn(
                    "p-4 border rounded-lg text-center transition-colors",
                    exportOptions.format === format
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-2xl mb-2">{getFormatIcon(format)}</div>
                  <div className="font-medium uppercase">{format}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('abg.export.dateRange', 'Date Range (Optional)')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('abg.export.startDate', 'Start Date')}</label>
                <input
                  type="date"
                  value={exportOptions.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange(
                    e.target.value,
                    exportOptions.dateRange?.end
                  )}
                  disabled={isExporting}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">{t('abg.export.endDate', 'End Date')}</label>
                <input
                  type="date"
                  value={exportOptions.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange(
                    exportOptions.dateRange?.start,
                    e.target.value
                  )}
                  disabled={isExporting}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {exportOptions.dateRange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeChange()}
                disabled={isExporting}
              >
                {t('abg.export.clearDateRange', 'Clear Date Range')}
              </Button>
            )}
          </div>

          {/* Inclusion Options */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('abg.export.include', 'Include in Export')}
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'includePatientInfo' as const, label: t('abg.export.includeFields.patientInfo', 'Patient Information'), description: t('abg.export.includeFields.patientInfoDesc', 'Names, DOB, MRN') },
                { key: 'includeInterpretation' as const, label: t('abg.export.includeFields.interpretation', 'Clinical Interpretation'), description: t('abg.export.includeFields.interpretationDesc', 'AI-generated clinical analysis') },
                { key: 'includeActionPlan' as const, label: t('abg.export.includeFields.actionPlan', 'Action Plans'), description: t('abg.export.includeFields.actionPlanDesc', 'Treatment recommendations') },
                { key: 'includeImages' as const, label: t('abg.export.includeFields.images', 'Image URLs'), description: t('abg.export.includeFields.imagesDesc', 'Links to uploaded images') }
              ].map((option) => (
                <label key={option.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions[option.key]}
                    onChange={(e) => handleInclusionChange(option.key, e.target.checked)}
                    disabled={isExporting}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          {exportSummary && (
            <div className="space-y-4 mb-6">
            <h3 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
              {t('abg.export.summary.title', 'Export Summary')}
              </h3>
              
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{t('abg.export.summary.results', 'Results')}</div>
                    <div>
                      {t('abg.export.summary.resultsOf', '{{filtered}} of {{total}} results', { filtered: exportSummary.filteredResults, total: exportSummary.totalResults })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">{t('abg.export.summary.estimatedSize', 'Estimated Size')}</div>
                    <div>{exportSummary.estimatedFileSize}</div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="font-medium mb-2">{t('abg.export.summary.includedFields', 'Included Fields')}</div>
                    <div className="flex flex-wrap gap-1">
                      {exportSummary.includedFields.map((field) => (
                        <Badge key={field} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {exportError && (
            <div className="mb-6">
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-start gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('abg.export.failed', 'Export Failed')}</div>
                    <div className="text-sm">{exportError}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Success Display */}
          {exportSuccess && (
            <div className="mb-6">
              <Card className="p-4 border-green-200 bg-green-50">
                <div className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <div className="font-medium">{t('abg.export.success', 'Export Successful')}</div>
                    <div className="text-sm">{t('abg.export.downloaded', 'Your file has been downloaded.')}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting || !exportSummary || exportSummary.filteredResults === 0}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? t('abg.export.exporting', 'Exporting...') : t('abg.export.export', 'Export {{format}}', { format: exportOptions.format.toUpperCase() })}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• {t('abg.export.tips.json', 'JSON format includes all data with structure preservation')}</p>
            <p>• {t('abg.export.tips.csv', 'CSV format is suitable for spreadsheet applications')}</p>
            <p>• {t('abg.export.tips.large', 'Large exports may take a few moments to process')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};