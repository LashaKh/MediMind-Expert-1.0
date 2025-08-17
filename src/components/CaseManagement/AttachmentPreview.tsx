import React, { useState } from 'react';
import { X, Download, Eye, FileText, Image as ImageIcon, File, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';

interface AttachmentPreviewProps {
  attachment: {
    id: string;
    name: string;
    type: string;
    url?: string;
    base64Data?: string;
    extractedText?: string;
    category?: string;
  };
  onClose?: () => void;
  className?: string;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onClose,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFileIcon = () => {
    if (attachment.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (attachment.type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5" />;
  };

  const renderPreview = () => {
    // Image preview
    if (attachment.type.startsWith('image/')) {
      const imageSrc = attachment.base64Data || attachment.url;
      if (!imageSrc) return null;

      return (
        <div className={`relative ${isFullscreen ? 'h-full flex items-center justify-center' : ''}`}>
          <img
            src={imageSrc}
            alt={attachment.name}
            className={`
              ${isFullscreen 
                ? 'max-h-full max-w-full object-contain' 
                : 'w-full h-auto max-h-[500px] object-contain rounded-lg'
              }
            `}
          />
        </div>
      );
    }

    // PDF text preview
    if (attachment.type === 'application/pdf' && attachment.extractedText) {
      return (
        <div className={`
          ${isFullscreen ? 'h-full overflow-auto' : 'max-h-[500px] overflow-y-auto'}
          p-4 bg-gray-50 rounded-lg
        `}>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {attachment.extractedText}
          </pre>
        </div>
      );
    }

    // Default preview
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
        {getFileIcon()}
        <p className="mt-4 text-sm text-gray-600">Preview not available</p>
        <p className="text-xs text-gray-500 mt-1">{attachment.type}</p>
      </div>
    );
  };

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else if (attachment.base64Data) {
      const link = document.createElement('a');
      link.href = attachment.base64Data;
      link.download = attachment.name;
      link.click();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {attachment.name}
            </h3>
            {attachment.category && (
              <p className="text-xs text-gray-500">{attachment.category}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          {(attachment.url || attachment.base64Data) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="p-2"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className={`${isFullscreen ? 'h-[calc(100%-64px)]' : 'p-4'}`}>
        {renderPreview()}
      </div>
    </div>
  );
};

// Modal wrapper for attachment preview
interface AttachmentPreviewModalProps {
  attachment: AttachmentPreviewProps['attachment'] | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  isOpen,
  onClose
}) => {
  if (!isOpen || !attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <AttachmentPreview
          attachment={attachment}
          onClose={onClose}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};