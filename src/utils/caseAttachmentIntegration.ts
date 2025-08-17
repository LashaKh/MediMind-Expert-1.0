import { ProcessedAttachment } from './caseFileProcessor';
import { FlowiseUpload, PatientCase } from '../types/chat';
import { supabase } from '../lib/supabase';

export interface CaseWithAttachments {
  caseId: string;
  attachments: ProcessedAttachment[];
}

/**
 * Upload case attachments to Supabase Storage
 */
export async function uploadCaseAttachments(
  caseId: string,
  userId: string,
  attachments: ProcessedAttachment[]
): Promise<{ uploadedPaths: string[], attachmentMetadata: any[] }> {
  const uploadedPaths: string[] = [];
  const attachmentMetadata: any[] = [];
  
  for (const attachment of attachments) {
    if (attachment.status !== 'ready') continue;
    
    try {
      // Convert base64 to blob
      const base64Response = await fetch(attachment.base64Data);
      const blob = await base64Response.blob();
      
      // Create file path
      const timestamp = Date.now();
      const sanitizedFileName = attachment.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `cases/${userId}/${caseId}/${timestamp}-${sanitizedFileName}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, blob, {
          contentType: attachment.file.type,
          upsert: false
        });
      
      if (error) throw error;
      
      uploadedPaths.push(filePath);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      // Store attachment metadata for case metadata
      attachmentMetadata.push({
        fileName: attachment.file.name,
        fileType: attachment.file.type,
        fileSize: attachment.file.size,
        category: attachment.category || 'other',
        extractedText: attachment.extractedText,
        storagePath: filePath,
        publicUrl: publicUrlData.publicUrl,
        metadata: {
          originalSize: attachment.file.size,
          compressed: attachment.processedData?.metadata?.compressed || false,
          extractionMethod: attachment.processedData?.metadata?.extractionMethod,
          pageCount: attachment.processedData?.metadata?.pageCount,
          ocrConfidence: attachment.processedData?.ocrConfidence
        }
      });
      
    } catch (error) {

    }
  }
  
  return { uploadedPaths, attachmentMetadata };
}

/**
 * Convert case attachments to Flowise format for AI chat
 */
export function prepareCaseAttachmentsForChat(
  attachments: ProcessedAttachment[]
): { uploads: FlowiseUpload[], contextText: string } {
  const uploads: FlowiseUpload[] = [];
  let contextText = '';
  
  for (const attachment of attachments) {
    if (attachment.status !== 'ready') continue;
    
    // For PDFs with extracted text, add to context
    if (attachment.uploadType === 'pdf' && attachment.extractedText) {
      contextText += `\n\n--- Document: ${attachment.file.name} ---\n${attachment.extractedText}\n`;
    } 
    // For images, add to uploads
    else if (attachment.uploadType === 'image' && attachment.base64Data) {
      uploads.push({
        data: attachment.base64Data,
        type: 'file',
        name: attachment.file.name,
        mime: attachment.file.type
      });
    }
    // For other documents with extracted text
    else if (attachment.extractedText) {
      contextText += `\n\n--- Document: ${attachment.file.name} ---\n${attachment.extractedText}\n`;
    }
  }
  
  return { uploads, contextText };
}

/**
 * Build enhanced case context including attachments
 */
export function buildCaseContextWithAttachments(
  caseData: PatientCase,
  attachments?: ProcessedAttachment[]
): string {
  let context = `Patient Case: ${caseData.title}
  
Description: ${caseData.description}

Patient Information:
${caseData.anonymizedInfo}`;

  if (caseData.metadata?.category) {
    context += `\n\nCategory: ${caseData.metadata.category}`;
  }
  
  if (caseData.metadata?.complexity) {
    context += `\nComplexity: ${caseData.metadata.complexity}`;
  }
  
  if (attachments && attachments.length > 0) {
    const { contextText } = prepareCaseAttachmentsForChat(attachments);
    if (contextText) {
      context += `\n\n=== Attached Documents ===\n${contextText}`;
    }
    
    // List attached files
    context += `\n\n=== Attached Files ===\n`;
    attachments.forEach(att => {
      if (att.status === 'ready') {
        context += `- ${att.file.name} (${att.category || att.uploadType})\n`;
      }
    });
  }
  
  return context;
}

/**
 * Build basic case context without any attachments
 */
export function buildBasicCaseContext(caseData: PatientCase): string {
  let context = `Patient Case: ${caseData.title}
  
Description: ${caseData.description}

Patient Information:
${caseData.anonymizedInfo}`;

  if (caseData.metadata?.category) {
    context += `\n\nCategory: ${caseData.metadata.category}`;
  }
  
  if (caseData.metadata?.complexity) {
    context += `\nComplexity: ${caseData.metadata.complexity}`;
  }
  
  return context;
}

/**
 * Build enhanced case context using case metadata for attachments
 */
export function buildEnhancedCaseContext(caseData: PatientCase): string {
  let context = `Patient Case: ${caseData.title}
  
Description: ${caseData.description}

Patient Information:
${caseData.anonymizedInfo}`;

  if (caseData.metadata?.category) {
    context += `\n\nCategory: ${caseData.metadata.category}`;
  }
  
  if (caseData.metadata?.complexity) {
    context += `\nComplexity: ${caseData.metadata.complexity}`;
  }
  
  // Check if case has attachment data stored in metadata
  if (caseData.metadata?.attachments && Array.isArray(caseData.metadata.attachments)) {
    const attachments = caseData.metadata.attachments as any[];
    
    if (attachments.length > 0) {
      context += `\n\n=== Attached Documents ===\n`;
      
      // Add extracted text content from each attachment
      attachments.forEach((attachment: any, index: number) => {
        if (attachment.extractedText && attachment.extractedText.trim()) {
          context += `\n--- Document ${index + 1}: ${attachment.fileName || 'Unknown'} ---\n`;
          context += `${attachment.extractedText}\n`;
        }
      });
      
      // List all attached files
      context += `\n\n=== Attached Files Summary ===\n`;
      attachments.forEach((attachment: any, index: number) => {
        const fileName = attachment.fileName || 'Unknown file';
        const category = attachment.category || 'Document';
        const hasText = attachment.extractedText ? '✓ Text extracted' : '✗ No text content';
        
        context += `${index + 1}. ${fileName} (${category}) - ${hasText}\n`;
        
        if (attachment.metadata) {
          if (attachment.metadata.pageCount) {
            context += `   Pages: ${attachment.metadata.pageCount}`;
          }
          if (attachment.metadata.extractionMethod) {
            context += ` | Method: ${attachment.metadata.extractionMethod}`;
          }
          if (attachment.metadata.confidence) {
            context += ` | Confidence: ${Math.round(attachment.metadata.confidence * 100)}%`;
          }
          context += '\n';
        }
      });
    }
  }
  
  return context;
}

/**
 * Build enhanced case context using only selected documents
 */
export function buildSelectiveCaseContext(caseData: PatientCase, selectedDocumentIds: string[]): string {
  let context = `Patient Case: ${caseData.title}
  
Description: ${caseData.description}

Patient Information:
${caseData.anonymizedInfo}`;

  if (caseData.metadata?.category) {
    context += `\n\nCategory: ${caseData.metadata.category}`;
  }
  
  if (caseData.metadata?.complexity) {
    context += `\nComplexity: ${caseData.metadata.complexity}`;
  }
  
  // Check if case has attachment data stored in metadata
  if (caseData.metadata?.attachments && Array.isArray(caseData.metadata.attachments)) {
    const attachments = caseData.metadata.attachments as any[];
    
    // Filter to only selected documents
    const selectedAttachments = attachments.filter((_, index) => 
      selectedDocumentIds.includes(`attachment-${index}`)
    );
    
    if (selectedAttachments.length > 0) {
      context += `\n\n=== Selected Documents ===\n`;
      
      // Add extracted text content from selected attachments only
      selectedAttachments.forEach((attachment: any, originalIndex: number) => {
        const attachmentIndex = attachments.findIndex(a => a === attachment);
        if (attachment.extractedText && attachment.extractedText.trim()) {
          context += `\n--- Document ${attachmentIndex + 1}: ${attachment.fileName || 'Unknown'} ---\n`;
          context += `${attachment.extractedText}\n`;
        }
      });
      
      // List only selected files
      context += `\n\n=== Selected Files Summary ===\n`;
      selectedAttachments.forEach((attachment: any, index: number) => {
        const originalIndex = attachments.findIndex(a => a === attachment);
        const fileName = attachment.fileName || 'Unknown file';
        const category = attachment.category || 'Document';
        const hasText = attachment.extractedText ? '✓ Text extracted' : '✗ No text content';
        
        context += `${originalIndex + 1}. ${fileName} (${category}) - ${hasText}\n`;
        
        if (attachment.metadata) {
          if (attachment.metadata.pageCount) {
            context += `   Pages: ${attachment.metadata.pageCount}`;
          }
          if (attachment.metadata.extractionMethod) {
            context += ` | Method: ${attachment.metadata.extractionMethod}`;
          }
          if (attachment.metadata.confidence) {
            context += ` | Confidence: ${Math.round(attachment.metadata.confidence * 100)}%`;
          }
          context += '\n';
        }
      });
    } else if (selectedDocumentIds.length > 0) {
      context += `\n\n=== Document Selection ===\n`;
      context += `Note: ${selectedDocumentIds.length} document(s) selected but no extracted text available.\n`;
    }
  }
  
  return context;
}