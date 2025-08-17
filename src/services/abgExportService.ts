import {
  ABGResult,
  PatientInfo,
  ABGFilters,
  ABGExportOptions,
  ABGJSONExportData,
  ABGExportData,
  ABGPDFExportOptions
} from '../types/abg';
import { exportABGToPDF } from './abgPDFExport';
import i18next from 'i18next';

/**
 * ABG Export Service
 * Handles exporting ABG results in various formats (JSON, CSV, PDF)
 */

const EXPORT_VERSION = '1.0';

/**
 * Export ABG results to JSON format
 */
export const exportToJSON = async (
  results: ABGResult[],
  options: ABGExportOptions = { format: 'json' },
  patients?: PatientInfo[]
): Promise<ABGJSONExportData> => {
  try {
    // Filter results based on options
    let filteredResults = results;

    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      filteredResults = filteredResults.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    // Process results based on inclusion options
    const processedResults = filteredResults.map(result => {
      const exportResult: Partial<ABGResult> = { ...result };

      // Remove patient info if not included
      if (!options.includePatientInfo) {
        delete exportResult.patient_id;
        delete exportResult.patient;
      }

      // Remove interpretation if not included
      if (!options.includeInterpretation) {
        delete exportResult.interpretation;
      }

      // Remove action plan if not included
      if (!options.includeActionPlan) {
        delete exportResult.action_plan;
      }

      // Remove image URL if not included
      if (!options.includeImages) {
        delete exportResult.image_url;
      }

      return exportResult as ABGResult;
    });

    // Include patients if requested and available
    let exportPatients: PatientInfo[] | undefined = undefined;
    if (options.includePatientInfo && patients) {
      const patientIds = new Set(
        processedResults
          .map(result => result.patient_id)
          .filter(id => id !== undefined)
      );
      
      exportPatients = patients.filter(patient => patientIds.has(patient.id));
    }

    const exportData: ABGJSONExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      results: processedResults,
      patients: exportPatients,
      metadata: {
        totalCount: processedResults.length,
        dateRange: options.dateRange,
        filters: {} // This would be passed in from the calling component
      }
    };

    console.log(`Exported ${processedResults.length} ABG results to JSON`);
    return exportData;
  } catch (error) {
    console.error('Failed to export ABG results to JSON:', error);
    throw new Error(`${i18next.t('common.serviceErrors.jsonExportFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export ABG results to CSV format
 */
export const exportToCSV = async (
  results: ABGResult[],
  options: ABGExportOptions = { format: 'csv' }
): Promise<string> => {
  try {
    // Filter results based on options
    let filteredResults = results;

    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      filteredResults = filteredResults.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    // Define CSV headers based on inclusion options
    const headers: string[] = [
      i18next.t('common.serviceErrors.csvHeaders.id'),
      i18next.t('common.serviceErrors.csvHeaders.type'),
      i18next.t('common.serviceErrors.csvHeaders.rawAnalysis'),
      i18next.t('common.serviceErrors.csvHeaders.processingTimeMs'),
      i18next.t('common.serviceErrors.csvHeaders.confidence'),
      i18next.t('common.serviceErrors.csvHeaders.createdAt'),
      i18next.t('common.serviceErrors.csvHeaders.updatedAt')
    ];

    if (options.includePatientInfo) {
      headers.push(i18next.t('common.serviceErrors.csvHeaders.patientId'), i18next.t('common.serviceErrors.csvHeaders.patientName'));
    }

    if (options.includeInterpretation) {
      headers.push(i18next.t('common.serviceErrors.csvHeaders.interpretation'));
    }

    if (options.includeActionPlan) {
      headers.push(i18next.t('common.serviceErrors.csvHeaders.actionPlan'));
    }

    if (options.includeImages) {
      headers.push(i18next.t('common.serviceErrors.csvHeaders.imageUrl'));
    }

    // Process results into CSV rows
    const csvRows: string[] = [headers.join(',')];

    for (const result of filteredResults) {
      const row: string[] = [
        `"${result.id}"`,
        `"${result.type}"`,
        `"${result.raw_analysis.replace(/"/g, '""')}"`, // Escape quotes
        result.processing_time_ms?.toString() || '',
        result.gemini_confidence?.toString() || '',
        `"${result.created_at}"`,
        `"${result.updated_at}"`
      ];

      if (options.includePatientInfo) {
        row.push(
          result.patient_id ? `"${result.patient_id}"` : '',
          result.patient ? `"${result.patient.first_name} ${result.patient.last_name}"` : ''
        );
      }

      if (options.includeInterpretation) {
        row.push(result.interpretation ? `"${result.interpretation.replace(/"/g, '""')}"` : '');
      }

      if (options.includeActionPlan) {
        row.push(result.action_plan ? `"${result.action_plan.replace(/"/g, '""')}"` : '');
      }

      if (options.includeImages) {
        row.push(result.image_url ? `"${result.image_url}"` : '');
      }

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    console.log(`Exported ${filteredResults.length} ABG results to CSV`);
    return csvContent;
  } catch (error) {
    console.error('Failed to export ABG results to CSV:', error);
    throw new Error(`${i18next.t('common.serviceErrors.csvExportFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Download exported data as a file
 */
export const downloadExportedData = (
  data: string | ABGJSONExportData,
  filename: string,
  mimeType: string
): void => {
  try {
    let content: string;
    
    if (typeof data === 'string') {
      content = data;
    } else {
      content = JSON.stringify(data, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
    
    console.log(`Downloaded file: ${filename}`);
  } catch (error) {
    console.error('Failed to download exported data:', error);
    throw new Error(`${i18next.t('common.serviceErrors.downloadFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate filename for export based on options
 */
export const generateExportFilename = (
  options: ABGExportOptions,
  totalResults: number
): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const extension = options.format;
  
  let baseName = `abg-results-${timestamp}`;
  
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start).toISOString().split('T')[0];
    const endDate = new Date(options.dateRange.end).toISOString().split('T')[0];
    baseName = `abg-results-${startDate}-to-${endDate}`;
  }
  
  return `${baseName}-${totalResults}-results.${extension}`;
};

/**
 * Export ABG results with automatic file download
 */
export const exportAndDownload = async (
  results: ABGResult[],
  options: ABGExportOptions,
  patients?: PatientInfo[]
): Promise<void> => {
  try {
    const filename = generateExportFilename(options, results.length);
    
    switch (options.format) {
      case 'json': {
        const jsonData = await exportToJSON(results, options, patients);
        downloadExportedData(
          jsonData,
          filename,
          'application/json'
        );
        break;
      }
      
      case 'csv': {
        const csvData = await exportToCSV(results, options);
        downloadExportedData(
          csvData,
          filename,
          'text/csv'
        );
        break;
      }
      
      case 'pdf': {
        const pdfOptions: ABGPDFExportOptions = {
          ...options,
          template: 'standard',
          pageSize: 'letter',
          orientation: 'portrait'
        };
        
        // Filter results based on date range if specified
        let filteredResults = results;
        if (options.dateRange) {
          const startDate = new Date(options.dateRange.start);
          const endDate = new Date(options.dateRange.end);
          
          filteredResults = results.filter(result => {
            const resultDate = new Date(result.created_at);
            return resultDate >= startDate && resultDate <= endDate;
          });
        }
        
        exportABGToPDF(filteredResults, pdfOptions);
        break;
      }
      
      default:
        throw new Error(`${i18next.t('common.serviceErrors.unsupportedExportFormat')}: ${options.format}`);
    }
    
    console.log(`Export completed: ${filename}`);
  } catch (error) {
    console.error(i18next.t('common.serviceErrors.failedToExportABGResults'), error);
    throw error;
  }
};

/**
 * Get export summary for preview
 */
export const getExportSummary = (
  results: ABGResult[],
  options: ABGExportOptions
): {
  totalResults: number;
  filteredResults: number;
  dateRange?: { start: string; end: string };
  includedFields: string[];
  estimatedFileSize: string;
} => {
  try {
    let filteredCount = results.length;
    
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      filteredCount = results.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= startDate && resultDate <= endDate;
      }).length;
    }
    
    const includedFields: string[] = [
      i18next.t('common.serviceErrors.basicInfo'),
      i18next.t('common.serviceErrors.analysisResults')
    ];
    
    if (options.includePatientInfo) {
      includedFields.push(i18next.t('common.serviceErrors.patientInformation'));
    }
    
    if (options.includeInterpretation) {
      includedFields.push(i18next.t('common.serviceErrors.clinicalInterpretation'));
    }
    
    if (options.includeActionPlan) {
      includedFields.push(i18next.t('common.serviceErrors.actionPlans'));
    }
    
    if (options.includeImages) {
      includedFields.push(i18next.t('common.serviceErrors.imageUrls'));
    }
    
    // Estimate file size (rough calculation)
    const avgResultSize = options.format === 'json' ? 2000 : 500; // bytes per result
    const estimatedBytes = filteredCount * avgResultSize * includedFields.length / 4;
    
    let estimatedFileSize: string;
    if (estimatedBytes < 1024) {
      estimatedFileSize = `${estimatedBytes.toFixed(0)} bytes`;
    } else if (estimatedBytes < 1024 * 1024) {
      estimatedFileSize = `${(estimatedBytes / 1024).toFixed(1)} KB`;
    } else {
      estimatedFileSize = `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    
    return {
      totalResults: results.length,
      filteredResults: filteredCount,
      dateRange: options.dateRange,
      includedFields,
      estimatedFileSize
    };
  } catch (error) {
    console.error(i18next.t('common.serviceErrors.failedToGetExportSummary'), error);
    throw error;
  }
};

/**
 * Validate export options
 */
export const validateExportOptions = (options: ABGExportOptions): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Validate format
  if (!['json', 'csv', 'pdf'].includes(options.format)) {
    errors.push(i18next.t('common.serviceErrors.invalidExportFormat'));
  }
  
  // Validate date range
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);
    
    if (isNaN(startDate.getTime())) {
      errors.push(i18next.t('common.serviceErrors.invalidStartDate'));
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push(i18next.t('common.serviceErrors.invalidEndDate'));
    }
    
    if (startDate.getTime() > endDate.getTime()) {
      errors.push(i18next.t('common.serviceErrors.startDateAfterEndDate'));
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};