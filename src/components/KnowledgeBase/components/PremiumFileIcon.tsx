/**
 * Premium File Icon Component
 *
 * Displays file type icons with sophisticated styling and gradients.
 */

import React from 'react';
import { File, FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import { getFileIconConfig } from '../utils/documentHelpers';

interface PremiumFileIconProps {
  fileType: string;
  className?: string;
  showGradient?: boolean;
}

export const PremiumFileIcon: React.FC<PremiumFileIconProps> = ({
  fileType,
  className = "w-8 h-8",
  showGradient = false
}) => {
  const { iconType, color, solid } = getFileIconConfig(fileType);

  const getIcon = () => {
    switch (iconType) {
      case 'pdf':
      case 'word':
        return FileText;
      case 'image':
        return FileImage;
      case 'spreadsheet':
        return FileSpreadsheet;
      default:
        return File;
    }
  };

  const Icon = getIcon();

  if (showGradient) {
    return (
      <div className={`${className} rounded-lg bg-gradient-to-br ${color} p-2 text-white shadow-lg`}>
        <Icon className="w-full h-full" />
      </div>
    );
  }

  return <Icon className={`${className} ${solid}`} />;
};
