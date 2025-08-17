import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

interface NewCaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const NewCaseButton: React.FC<NewCaseButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 transition-all duration-200 hover:shadow-md ${className}`}
      aria-label={t('case.createNewCase', 'Create New Case')}
      title={t('case.createNewCase', 'Create New Case')}
    >
      <div className="relative">
        <FileText className="w-4 h-4" />
        <Plus className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white rounded-full p-0.5" />
      </div>
      <span className="font-semibold text-sm whitespace-nowrap">{t('case.createNewCase', 'Create New Case')}</span>
    </Button>
  );
}; 