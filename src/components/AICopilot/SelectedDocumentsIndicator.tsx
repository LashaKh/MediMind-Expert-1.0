import React from 'react';
import { X, FileText, Image, Eye } from 'lucide-react';
import { CaseAttachmentData } from '../../types/chat';
import { Button } from '../ui/button';

interface SelectedDocumentsIndicatorProps {
  selectedDocuments: string[];
  allDocuments: CaseAttachmentData[];
  onRemoveDocument: (documentId: string) => void;
  onClearAll: () => void;
  onOpenSelector: () => void;
  className?: string;
}

export const SelectedDocumentsIndicator: React.FC<SelectedDocumentsIndicatorProps> = ({
  selectedDocuments,
  allDocuments,
  onRemoveDocument,
  onClearAll,
  onOpenSelector,
  className = ''
}) => {
  const selectedDocs = allDocuments.filter(doc => selectedDocuments.includes(doc.id));

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  const truncateFileName = (fileName: string, maxLength: number = 20) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
    return `${truncated}...${extension ? '.' + extension : ''}`;
  };

  if (selectedDocuments.length === 0) {
    return (
      <div className={`flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <FileText className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">
            No documents selected
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSelector}
            className="text-xs text-blue-600 hover:text-blue-700 h-auto p-1 mt-1"
          >
            Select documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSelector}
            className="text-xs text-blue-600 hover:text-blue-700 h-6 px-2"
          >
            <Eye className="w-3 h-3 mr-1" />
            Manage
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-700 h-6 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
        {selectedDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center space-x-1 bg-white border border-blue-200 rounded-md px-2 py-1 group hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-1 text-blue-700">
              {getFileIcon(doc.fileType)}
              <span className="text-xs font-medium">
                {truncateFileName(doc.fileName)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveDocument(doc.id)}
              className="h-4 w-4 p-0 text-blue-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {selectedDocuments.length > 3 && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            Documents will be included in your chat context for more relevant responses
          </p>
        </div>
      )}
    </div>
  );
};