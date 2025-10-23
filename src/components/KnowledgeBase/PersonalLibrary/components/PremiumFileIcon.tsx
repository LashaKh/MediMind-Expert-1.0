import React from 'react';
import { File, FileText, FileImage, FileSpreadsheet } from 'lucide-react';

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
  const getFileIcon = (type: string) => {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('pdf')) {
      return { Icon: FileText, color: 'from-[#1a365d] to-[#2b6cb0]', solid: 'text-[#1a365d]' };
    } else if (normalizedType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(normalizedType)) {
      return { Icon: FileImage, color: 'from-purple-500 to-pink-500', solid: 'text-purple-500' };
    } else if (normalizedType.includes('excel') || normalizedType.includes('csv') || normalizedType.includes('spreadsheet')) {
      return { Icon: FileSpreadsheet, color: 'from-green-500 to-emerald-500', solid: 'text-green-500' };
    } else if (normalizedType.includes('word') || normalizedType.includes('doc')) {
      return { Icon: FileText, color: 'from-[#2b6cb0] to-[#63b3ed]', solid: 'text-[#2b6cb0]' };
    } else {
      return { Icon: File, color: 'from-gray-500 to-gray-600', solid: 'text-gray-500' };
    }
  };

  const { Icon, color, solid } = getFileIcon(fileType);

  if (showGradient) {
    return (
      <div className={`${className} rounded-lg bg-gradient-to-br ${color} p-2 text-white shadow-lg`}>
        <Icon className="w-full h-full" />
      </div>
    );
  }

  return <Icon className={`${className} ${solid}`} />;
};
