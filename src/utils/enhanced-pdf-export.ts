import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

/**
 * Enhanced PDF Export with sophisticated medical formatting
 * Includes all advanced graphics and medical-grade styling from the original
 */

interface EnhancedPDFExportOptions {
  title?: string;
  content: string;
  filename?: string;
  includeGraphics?: boolean;
  medicalMode?: boolean;
}

/**
 * Enhanced PDF export with medical graphics and advanced formatting
 */
export const enhancedExportToPDF = async (options: EnhancedPDFExportOptions): Promise<void> => {
  const { title, content, filename, includeGraphics = true, medicalMode = true } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // PDF dimensions and styling
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // Color utility functions from original
  const setColor = (color: number[]) => {
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  // Draw rounded rectangles for medical styling
  const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, style: 'F' | 'S' | 'DF' = 'F') => {
    pdf.roundedRect(x, y, width, height, radius, radius, style);
  };

  // Draw medical icons in PDF
  const drawIcon = (x: number, y: number, color: number[]) => {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.circle(x + 4, y + 4, 3, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.circle(x + 4, y + 4, 1.5, 'F');
  };

  // Advanced text handling with page breaks
  const addTextWithPageBreak = (text: string, fontSize: number, options: any = {}) => {
    const {
      isBold = false,
      isItalic = false,
      color = [0, 0, 0],
      leftMargin = margin,
      topMargin = 10,
      maxWidth = contentWidth,
      lineHeight = fontSize * 0.4
    } = options;

    // Set text properties
    pdf.setFontSize(fontSize);
    setColor(color);
    
    if (isBold && isItalic) {
      pdf.setFont('helvetica', 'bolditalic');
    } else if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else if (isItalic) {
      pdf.setFont('helvetica', 'italic');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    // Split text to fit page width
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (currentY + lineHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        
        // Add header to new page if it's a medical document
        if (medicalMode && title) {
          addMedicalHeader();
          currentY += 20;
        }
      }
      
      pdf.text(lines[i], leftMargin, currentY);
      currentY += lineHeight;
    }
    
    currentY += topMargin;
  };

  // Add sophisticated medical header
  const addMedicalHeader = () => {
    if (!title) return;
    
    // Header background
    pdf.setFillColor(37, 99, 235); // Blue
    drawRoundedRect(margin, 10, contentWidth, 15, 3, 'F');
    
    // Medical icon
    drawIcon(margin + 5, 12, [255, 255, 255]);
    
    // Title text
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    setColor([255, 255, 255]);
    pdf.text(title, margin + 20, 20);
    
    // Subtitle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Medical Information Document', margin + 20, 23);
  };

  // Process markdown content for PDF
  const processMarkdownContent = async (markdownContent: string) => {
    // Convert markdown to HTML first
    const htmlContent = await marked(markdownContent);
    
    // Create temporary div to process HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Process the DOM tree
    const processNode = (node: Element | ChildNode) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          addTextWithPageBreak(text, 11, { topMargin: 2 });
        }
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent || '';
      
      switch (tagName) {
        case 'h1':
          // Medical H1 styling
          if (medicalMode) {
            pdf.setFillColor(37, 99, 235);
            drawRoundedRect(margin, currentY - 5, contentWidth, 12, 2, 'F');
            drawIcon(margin + 3, currentY - 3, [255, 255, 255]);
          }
          addTextWithPageBreak(textContent, 20, {
            isBold: true,
            color: medicalMode ? [255, 255, 255] : [0, 0, 0],
            topMargin: medicalMode ? 15 : 10,
            leftMargin: medicalMode ? margin + 15 : margin
          });
          break;
          
        case 'h2':
          // Medical H2 with section colors
          const sectionColor = getSectionColor(textContent);
          if (medicalMode) {
            pdf.setFillColor(sectionColor[0], sectionColor[1], sectionColor[2]);
            drawRoundedRect(margin, currentY - 3, contentWidth * 0.8, 8, 2, 'F');
            drawIcon(margin + 2, currentY - 1, [255, 255, 255]);
          }
          addTextWithPageBreak(textContent, 16, {
            isBold: true,
            color: medicalMode ? [255, 255, 255] : [0, 0, 0],
            topMargin: 12,
            leftMargin: medicalMode ? margin + 12 : margin
          });
          break;
          
        case 'h3':
          addTextWithPageBreak(textContent, 14, { isBold: true, topMargin: 8 });
          break;
          
        case 'h4':
          addTextWithPageBreak(textContent, 12, { isBold: true, topMargin: 6 });
          break;
          
        case 'p':
          // Check for evidence levels
          const evidenceMatch = textContent.match(/Evidence Level:\s*([A-E])/i);
          if (evidenceMatch && medicalMode) {
            const level = evidenceMatch[1].toUpperCase();
            const evidenceColor = getEvidenceLevelColor(level);
            
            // Draw evidence level badge
            pdf.setFillColor(evidenceColor[0], evidenceColor[1], evidenceColor[2]);
            drawRoundedRect(margin, currentY - 2, 40, 6, 3, 'F');
            
            addTextWithPageBreak(textContent, 11, {
              isBold: true,
              color: [255, 255, 255],
              leftMargin: margin + 2,
              topMargin: 8
            });
          } else {
            addTextWithPageBreak(textContent, 11, { topMargin: 4 });
          }
          break;
          
        case 'ul':
        case 'ol':
          currentY += 3;
          for (const child of element.children) {
            if (child.tagName.toLowerCase() === 'li') {
              const prefix = tagName === 'ul' ? '• ' : `${Array.from(element.children).indexOf(child) + 1}. `;
              addTextWithPageBreak(prefix + (child.textContent || ''), 10, {
                leftMargin: margin + 5,
                topMargin: 2
              });
            }
          }
          currentY += 3;
          break;
          
        case 'blockquote':
          // Medical blockquote styling
          if (medicalMode) {
            pdf.setDrawColor(37, 99, 235);
            pdf.setLineWidth(1);
            pdf.line(margin, currentY, margin, currentY + 15);
            
            pdf.setFillColor(239, 246, 255);
            drawRoundedRect(margin + 3, currentY - 2, contentWidth - 6, 12, 2, 'F');
          }
          
          addTextWithPageBreak(textContent, 11, {
            isItalic: true,
            leftMargin: margin + (medicalMode ? 8 : 5),
            topMargin: medicalMode ? 10 : 6,
            color: medicalMode ? [37, 99, 235] : [100, 100, 100]
          });
          break;
          
        case 'strong':
          // Evidence level detection in strong tags
          const strongEvidenceMatch = textContent.match(/Evidence Level\s*([A-E])/i);
          if (strongEvidenceMatch && medicalMode) {
            const level = strongEvidenceMatch[1].toUpperCase();
            const evidenceColor = getEvidenceLevelColor(level);
            
            pdf.setFillColor(evidenceColor[0], evidenceColor[1], evidenceColor[2]);
            drawRoundedRect(margin, currentY - 1, 35, 4, 2, 'F');
            
            addTextWithPageBreak(textContent, 10, {
              isBold: true,
              color: [255, 255, 255],
              leftMargin: margin + 1,
              topMargin: 6
            });
          } else {
            addTextWithPageBreak(textContent, 11, { isBold: true, topMargin: 2 });
          }
          break;
          
        case 'table':
          addTableToPDF(element);
          break;
          
        default:
          // Process child nodes
          for (const child of node.childNodes) {
            processNode(child);
          }
          break;
      }
    };
    
    // Process all nodes
    for (const child of tempDiv.childNodes) {
      processNode(child);
    }
  };

  // Get section-specific colors for medical documents
  const getSectionColor = (sectionTitle: string): [number, number, number] => {
    const title = sectionTitle.toLowerCase();
    
    if (title.includes('background') || title.includes('overview')) {
      return [16, 185, 129]; // Emerald
    } else if (title.includes('clinical') || title.includes('symptoms') || title.includes('findings')) {
      return [139, 92, 246]; // Purple
    } else if (title.includes('guidelines') || title.includes('management')) {
      return [79, 70, 229]; // Indigo
    } else if (title.includes('references')) {
      return [100, 116, 139]; // Slate
    }
    
    return [37, 99, 235]; // Default blue
  };

  // Get evidence level colors
  const getEvidenceLevelColor = (level: string): [number, number, number] => {
    switch (level) {
      case 'A': return [16, 185, 129]; // Emerald - Strong evidence
      case 'B': return [59, 130, 246]; // Blue - Moderate evidence  
      case 'C': return [245, 158, 11]; // Amber - Limited evidence
      case 'D': return [239, 68, 68]; // Red - Very limited evidence
      case 'E': return [100, 116, 139]; // Slate - Expert opinion
      default: return [100, 116, 139]; // Default slate
    }
  };

  // Advanced table processing for PDF
  const addTableToPDF = (tableElement: Element) => {
    const rows: string[][] = [];
    const headers: string[] = [];
    
    // Extract headers
    const headerRow = tableElement.querySelector('thead tr');
    if (headerRow) {
      const headerCells = headerRow.querySelectorAll('th');
      headerCells.forEach(cell => {
        headers.push(cell.textContent || '');
      });
    }
    
    // Extract data rows
    const bodyRows = tableElement.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowData: string[] = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        rowData.push(cell.textContent || '');
      });
      rows.push(rowData);
    });
    
    // Check if we have enough space for the table
    const estimatedTableHeight = (rows.length + 1) * 8 + 20;
    if (currentY + estimatedTableHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      if (medicalMode && title) {
        addMedicalHeader();
        currentY += 20;
      }
    }
    
    // Create the table with medical styling
    (pdf as any).autoTable({
      head: headers.length > 0 ? [headers] : undefined,
      body: rows,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: medicalMode ? [37, 99, 235] : [100, 100, 100],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: medicalMode ? [248, 250, 252] : [245, 245, 245]
      },
      columnStyles: {},
      didDrawPage: (data: any) => {
        currentY = data.cursor.y + 10;
      }
    });
  };

  // Add sophisticated medical cover page
  if (medicalMode && title) {
    // Background gradient effect
    for (let i = 0; i < 100; i++) {
      const alpha = (100 - i) / 100;
      pdf.setFillColor(37 + i * 2, 99 + i, 235 - i);
      pdf.rect(0, i * 3, pageWidth, 3, 'F');
    }
    
    // Main title area
    pdf.setFillColor(255, 255, 255);
    drawRoundedRect(margin, 60, contentWidth, 80, 5, 'F');
    
    // Medical icon
    pdf.setFillColor(37, 99, 235);
    pdf.circle(pageWidth / 2, 80, 8, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.circle(pageWidth / 2, 80, 5, 'F');
    
    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    setColor([37, 99, 235]);
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 110);
    
    // Subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    setColor([100, 116, 139]);
    const subtitle = 'Medical Information Document';
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 125);
    
    // Date
    const date = new Date().toLocaleDateString();
    pdf.setFontSize(12);
    const dateWidth = pdf.getTextWidth(date);
    pdf.text(date, (pageWidth - dateWidth) / 2, 135);
    
    // Add new page for content
    pdf.addPage();
    currentY = margin;
  }

  // Add content header
  if (title && !medicalMode) {
    addTextWithPageBreak(title, 20, { isBold: true, topMargin: 10 });
  }

  // Process the main content
  await processMarkdownContent(content);

  // Generate filename
  const finalFilename = filename || (title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'medical_document.pdf');

  // Save the PDF
  pdf.save(finalFilename);
};

/**
 * Generate PDF with enhanced medical formatting
 */
export const generateMedicalPDF = async (content: string, title?: string): Promise<void> => {
  return enhancedExportToPDF({
    title,
    content,
    filename: title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}_medical.pdf` : 'medical_document.pdf',
    includeGraphics: true,
    medicalMode: true
  });
};

/**
 * Print current page with enhanced styling
 */
export const enhancedPrintPage = (): void => {
  // Add medical-specific print styles
  const printStyles = document.createElement('style');
  printStyles.textContent = `
    @media print {
      .markdown-content h1 { page-break-before: always; }
      .markdown-content h2 { page-break-after: avoid; }
      .evidence-level { background: #e0e7ff !important; }
      .clinical-item { break-inside: avoid; }
      .table-container { break-inside: avoid; }
    }
  `;
  document.head.appendChild(printStyles);
  
  window.print();
  
  // Remove styles after printing
  setTimeout(() => {
    document.head.removeChild(printStyles);
  }, 1000);
};

/**
 * Enhanced share functionality
 */
export const enhancedSharePage = async (): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        text: 'Medical Information Document',
        url: window.location.href
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  } else {
    await navigator.clipboard.writeText(window.location.href);
  }
}; 