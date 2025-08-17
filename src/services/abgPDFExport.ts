import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  ABGResult, 
  PatientInfo, 
  ABGPDFExportOptions,
  ParsedABGAnalysis 
} from '../types/abg';

/**
 * ABG PDF Export Service
 * Creates professional medical PDF reports for ABG results
 */

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/**
 * Parse raw ABG analysis into structured data for PDF
 */
const parseABGForPDF = (rawAnalysis: string): ParsedABGAnalysis => {
  const lines = rawAnalysis.split('\n').filter(line => line.trim());
  const result: ParsedABGAnalysis = {
    patientInfo: {},
    bloodGasValues: {},
    electrolytes: {},
    clinicalContext: {},
    rawLines: lines
  };

  for (const line of lines) {
    const cleanLine = line.trim();
    
    // Patient information patterns
    if (cleanLine.match(/patient|name|age|dob|mrn/i)) {
      const parts = cleanLine.split(/[:\-=]/);
      if (parts.length >= 2) {
        result.patientInfo[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
    
    // Blood gas values (pH, pO2, pCO2, HCO3, etc.)
    else if (cleanLine.match(/ph|po2|pco2|hco3|be|sao2|fio2/i)) {
      const parts = cleanLine.split(/[:\-=]/);
      if (parts.length >= 2) {
        result.bloodGasValues[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
    
    // Electrolytes (Na, K, Cl, etc.)
    else if (cleanLine.match(/\b(na|sodium|k|potassium|cl|chloride|ca|calcium|mg|magnesium)\b/i)) {
      const parts = cleanLine.split(/[:\-=]/);
      if (parts.length >= 2) {
        result.electrolytes[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
    
    // Clinical context
    else if (cleanLine.match(/clinical|diagnosis|indication|specimen|temp|temperature/i)) {
      const parts = cleanLine.split(/[:\-=]/);
      if (parts.length >= 2) {
        result.clinicalContext[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }
  }

  return result;
};

/**
 * Format text for PDF with proper line breaking
 */
const formatTextForPDF = (text: string, maxWidth: number = 80): string[] => {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
};

/**
 * Add header to PDF with organization branding
 */
const addPDFHeader = (
  doc: jsPDF, 
  options: ABGPDFExportOptions,
  pageNumber: number = 1
): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Organization name
  if (options.organizationName) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.organizationName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Report title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Blood Gas Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  // Date and page number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${dateStr}`, 20, yPosition);
  doc.text(`Page ${pageNumber}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 15;

  // Add separator line
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  return yPosition;
};

/**
 * Add footer to PDF
 */
const addPDFFooter = (doc: jsPDF, options: ABGPDFExportOptions): void => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = pageHeight - 25;

  // Add separator line
  doc.setLineWidth(0.3);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;

  // Contact info
  if (options.contactInfo) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(options.contactInfo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }

  // Custom footer
  if (options.customFooter) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(options.customFooter, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
  }

  // Medical disclaimer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report is for informational purposes only. Clinical decisions should be based on professional medical judgment.',
    pageWidth / 2, 
    yPosition, 
    { align: 'center' }
  );
};

/**
 * Export single ABG result to PDF
 */
export const exportSingleResultToPDF = (
  result: ABGResult,
  options: ABGPDFExportOptions = { format: 'pdf', template: 'standard' }
): jsPDF => {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    format: options.pageSize || 'letter'
  });

  let yPosition = addPDFHeader(doc, options);

  // Patient Information Section
  if (options.includePatientInfo && result.patient) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, yPosition);
    yPosition += 8;

    const patientData = [
      ['Name', `${result.patient.first_name} ${result.patient.last_name}`],
      ['Date of Birth', result.patient.date_of_birth ? new Date(result.patient.date_of_birth).toLocaleDateString() : 'Not provided'],
      ['Medical Record Number', result.patient.medical_record_number || 'Not provided']
    ];

    doc.autoTable({
      head: [['Field', 'Value']],
      body: patientData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [70, 130, 180], textColor: 255 },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 100 } },
      margin: { left: 20, right: 20 }
    });

    yPosition = doc.lastAutoTable?.finalY || yPosition + 30;
    yPosition += 10;
  }

  // Test Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Information', 20, yPosition);
  yPosition += 8;

  const testData = [
    ['Test Type', result.type],
    ['Date Collected', new Date(result.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })],
    ['Processing Time', result.processing_time_ms ? `${result.processing_time_ms}ms` : 'Not recorded'],
    ['AI Confidence', result.gemini_confidence ? `${Math.round(result.gemini_confidence * 100)}%` : 'Not available']
  ];

  doc.autoTable({
    head: [['Field', 'Value']],
    body: testData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [70, 130, 180], textColor: 255 },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 100 } },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable?.finalY || yPosition + 30;
  yPosition += 10;

  // Raw Analysis Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Results', 20, yPosition);
  yPosition += 8;

  // Parse raw analysis for better presentation
  const parsedAnalysis = parseABGForPDF(result.raw_analysis);
  
  // Blood Gas Values Table
  if (Object.keys(parsedAnalysis.bloodGasValues).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Blood Gas Values', 20, yPosition);
    yPosition += 5;

    const bloodGasData = Object.entries(parsedAnalysis.bloodGasValues)
      .map(([key, value]) => [key, value]);

    doc.autoTable({
      head: [['Parameter', 'Value']],
      body: bloodGasData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [100, 150, 200], textColor: 255 },
      margin: { left: 20, right: 20 }
    });

    yPosition = doc.lastAutoTable?.finalY || yPosition + 20;
    yPosition += 10;
  }

  // Electrolytes Table
  if (Object.keys(parsedAnalysis.electrolytes).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Electrolytes', 20, yPosition);
    yPosition += 5;

    const electrolyteData = Object.entries(parsedAnalysis.electrolytes)
      .map(([key, value]) => [key, value]);

    doc.autoTable({
      head: [['Parameter', 'Value']],
      body: electrolyteData,
      startY: yPosition,
      theme: 'striped',
      headStyles: { fillColor: [100, 150, 200], textColor: 255 },
      margin: { left: 20, right: 20 }
    });

    yPosition = doc.lastAutoTable?.finalY || yPosition + 20;
    yPosition += 10;
  }

  // Full Raw Analysis (if detailed template)
  if (options.template === 'detailed') {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Complete Analysis', 20, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const analysisLines = formatTextForPDF(result.raw_analysis, 90);
    
    for (const line of analysisLines.slice(0, 20)) { // Limit to prevent overflow
      doc.text(line, 20, yPosition);
      yPosition += 4;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = addPDFHeader(doc, options, 2);
      }
    }
    yPosition += 10;
  }

  // Clinical Interpretation Section
  if (options.includeInterpretation && result.interpretation) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Interpretation', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const interpretationLines = formatTextForPDF(result.interpretation, 90);
    
    for (const line of interpretationLines) {
      doc.text(line, 20, yPosition);
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = addPDFHeader(doc, options, 2);
      }
    }
    yPosition += 10;
  }

  // Action Plan Section
  if (options.includeActionPlan && result.action_plan) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Action Plan', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const actionPlanLines = formatTextForPDF(result.action_plan, 90);
    
    for (const line of actionPlanLines) {
      doc.text(line, 20, yPosition);
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = addPDFHeader(doc, options, 2);
      }
    }
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPDFFooter(doc, options);
  }

  return doc;
};

/**
 * Export multiple ABG results to PDF
 */
export const exportMultipleResultsToPDF = (
  results: ABGResult[],
  options: ABGPDFExportOptions = { format: 'pdf', template: 'summary' }
): jsPDF => {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    format: options.pageSize || 'letter'
  });

  let yPosition = addPDFHeader(doc, options);

  // Summary Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Export Summary', 20, yPosition);
  yPosition += 8;

  const summaryData = [
    ['Total Results', results.length.toString()],
    ['Date Range', `${new Date(Math.min(...results.map(r => new Date(r.created_at).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...results.map(r => new Date(r.created_at).getTime()))).toLocaleDateString()}`],
    ['Export Date', new Date().toLocaleDateString()],
    ['Template', options.template || 'summary']
  ];

  doc.autoTable({
    head: [['Field', 'Value']],
    body: summaryData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [70, 130, 180], textColor: 255 },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 100 } },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable?.finalY || yPosition + 30;
  yPosition += 15;

  // Results Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Results Overview', 20, yPosition);
  yPosition += 8;

  const tableData = results.map(result => [
    result.id.slice(0, 8) + '...',
    result.type,
    new Date(result.created_at).toLocaleDateString(),
    result.patient ? `${result.patient.first_name} ${result.patient.last_name}` : 'N/A',
    result.gemini_confidence ? `${Math.round(result.gemini_confidence * 100)}%` : 'N/A'
  ]);

  const headers = ['ID', 'Type', 'Date', 'Patient', 'Confidence'];

  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: yPosition,
    theme: 'striped',
    headStyles: { fillColor: [70, 130, 180], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 50 },
      4: { cellWidth: 25 }
    },
    margin: { left: 20, right: 20 }
  });

  // Add individual result details if detailed template
  if (options.template === 'detailed') {
    for (let i = 0; i < results.length; i++) {
      doc.addPage();
      const result = results[i];
      
      let detailYPosition = addPDFHeader(doc, options, i + 2);
      
      // Result header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Result ${i + 1} of ${results.length}`, 20, detailYPosition);
      detailYPosition += 10;
      
      // Create a detailed PDF for this result
      const singleResultDoc = exportSingleResultToPDF(result, {
        ...options,
        template: 'standard'
      });
      
      // Note: In a real implementation, you would merge the pages here
      // For now, we'll add a reference
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Detailed analysis for Result ID: ${result.id}`, 20, detailYPosition);
      doc.text(`Type: ${result.type}`, 20, detailYPosition + 10);
      doc.text(`Date: ${new Date(result.created_at).toLocaleDateString()}`, 20, detailYPosition + 20);
      
      if (result.patient) {
        doc.text(`Patient: ${result.patient.first_name} ${result.patient.last_name}`, 20, detailYPosition + 30);
      }
    }
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPDFFooter(doc, options);
  }

  return doc;
};

/**
 * Download PDF file
 */
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  try {
    doc.save(filename);
    console.log(`PDF downloaded: ${filename}`);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw new Error(`PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate filename for PDF export
 */
export const generatePDFFilename = (
  results: ABGResult[],
  options: ABGPDFExportOptions
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const template = options.template || 'standard';
  
  if (results.length === 1) {
    const result = results[0];
    const patientName = result.patient 
      ? `${result.patient.first_name}-${result.patient.last_name}`
      : 'unknown-patient';
    return `abg-report-${patientName}-${timestamp}-${template}.pdf`;
  } else {
    return `abg-results-${results.length}-reports-${timestamp}-${template}.pdf`;
  }
};

/**
 * Main export function for PDF
 */
export const exportABGToPDF = (
  results: ABGResult[],
  options: ABGPDFExportOptions = { format: 'pdf', template: 'standard' }
): void => {
  try {
    let doc: jsPDF;
    
    if (results.length === 1) {
      doc = exportSingleResultToPDF(results[0], options);
    } else {
      doc = exportMultipleResultsToPDF(results, options);
    }
    
    const filename = generatePDFFilename(results, options);
    downloadPDF(doc, filename);
    
    console.log(`Exported ${results.length} ABG result(s) to PDF: ${filename}`);
  } catch (error) {
    console.error('Failed to export ABG results to PDF:', error);
    throw error;
  }
};