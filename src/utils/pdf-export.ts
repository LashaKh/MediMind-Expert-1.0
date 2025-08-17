import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Export Utilities
 * Provides functionality to export markdown content to PDF
 */

interface PDFExportOptions {
  title?: string;
  content: string;
  filename?: string;
}

/**
 * Export markdown content to PDF
 * @param options - PDF export options
 */
export const exportToPDF = async (options: PDFExportOptions): Promise<void> => {
  const { title, content, filename = 'document.pdf' } = options;
  
  // Initialize jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // PDF dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentY = margin;
  
  // Add title if provided
  if (title) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, currentY);
    currentY += 15;
  }
  
  // Add content
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  // Split content into lines that fit the page width
  const lines = pdf.splitTextToSize(content, contentWidth);
  
  // Add lines to PDF, creating new pages as needed
  for (let i = 0; i < lines.length; i++) {
    if (currentY > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.text(lines[i], margin, currentY);
    currentY += 6; // Line height
  }
  
  // Save the PDF
  pdf.save(filename);
};

/**
 * Generate PDF with basic formatting
 * @param content - Markdown content to convert
 * @param title - Document title
 * @returns Promise that resolves when PDF is generated
 */
export const generateBasicPDF = async (content: string, title?: string): Promise<void> => {
  return exportToPDF({
    title,
    content,
    filename: title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'document.pdf'
  });
};

/**
 * Print current page
 */
export const printPage = (): void => {
  window.print();
};

/**
 * Share current page URL
 */
export const sharePage = async (): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href
      });
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(window.location.href);
  }
};