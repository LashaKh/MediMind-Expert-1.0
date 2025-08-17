import React, { useEffect, useState } from 'react';
import { PatientCase, CaseAttachmentData } from '../../types/chat';
import { buildBasicCaseContext, buildEnhancedCaseContext, buildSelectiveCaseContext } from '../../utils/caseAttachmentIntegration';
import type { AttachmentUpload } from '../../types/case-management';

interface FlowiseAttachmentUpload {
  data: string;
  type: 'url' | 'file';
  name: string;
  mime: string;
}

interface CaseContextProviderProps {
  activeCase: PatientCase | null;
  selectedDocuments?: string[];
  children: (context: {
    caseContext: string;
    attachmentUploads: FlowiseAttachmentUpload[];
    attachments: CaseAttachmentData[];
  }) => React.ReactNode;
}

export const CaseContextProvider: React.FC<CaseContextProviderProps> = ({
  activeCase,
  selectedDocuments = [],
  children
}) => {
  const [attachments, setAttachments] = useState<CaseAttachmentData[]>([]);
  const [caseContext, setCaseContext] = useState<string>('');
  const [attachmentUploads, setAttachmentUploads] = useState<FlowiseAttachmentUpload[]>([]);

  useEffect(() => {
    const loadCaseData = () => {
      if (!activeCase) {
        setCaseContext('');
        setAttachments([]);
        setAttachmentUploads([]);
        return;
      }

      // Build context using selected documents or basic context if none selected
      const context = selectedDocuments.length > 0
        ? buildSelectiveCaseContext(activeCase, selectedDocuments)
        : buildBasicCaseContext(activeCase);
      setCaseContext(context);

      // Extract attachments from case metadata
      const attachmentData: CaseAttachmentData[] = [];
      const uploads: FlowiseAttachmentUpload[] = [];

      if (activeCase.metadata?.attachments && Array.isArray(activeCase.metadata.attachments)) {
        activeCase.metadata.attachments.forEach((attachment: any, index: number) => {
          // Convert to CaseAttachmentData format
          attachmentData.push({
            id: `attachment-${index}`,
            fileName: attachment.fileName || 'Unknown file',
            fileType: attachment.fileType || 'unknown',
            fileSize: attachment.fileSize || 0,
            category: attachment.category || 'other',
            extractedText: attachment.extractedText,
            publicUrl: attachment.publicUrl,
            uploadedAt: new Date()
          });

          // Add images to uploads for Flowise
          if (attachment.fileType?.startsWith('image/') && attachment.publicUrl) {
            uploads.push({
              data: attachment.publicUrl,
              type: 'url',
              name: attachment.fileName,
              mime: attachment.fileType
            });
          }
        });
      }
      
      setAttachments(attachmentData);
      setAttachmentUploads(uploads);
    };

    loadCaseData();
  }, [activeCase, selectedDocuments]);

  return (
    <>
      {children({ caseContext, attachmentUploads, attachments })}
    </>
  );
};