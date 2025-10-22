import React from 'react';
import { FileText, Plus, Stethoscope } from 'lucide-react';
import { Button } from '../ui/button';
import { EnhancedTooltip } from '../ui/EnhancedTooltip';
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
    <EnhancedTooltip
      title={t('chat.tooltip.createNewCaseTitle', 'Create New Case')}
      description={t('chat.tooltip.createNewCaseDescription', 'Create clinical cases that can be attached to chat for AI case study discussions and collaborative analysis.')}
      icon={Stethoscope}
      gradient="from-[#2b6cb0] to-[#63b3ed]"
      badge={t('chat.tooltip.aiDiscussion', 'AI Discussion')}
      disabled={disabled}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        size={size}
        className={`flex items-center space-x-2 transition-all duration-200 hover:shadow-md ${className}`}
        aria-label={t('case-creation.createNewCase', 'Create New Case')}
        title={t('case-creation.createNewCase', 'Create New Case')}
      >
        <div className="relative">
          <FileText className="w-4 h-4" />
          <Plus className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 bg-[#2b6cb0] text-white rounded-full p-0.5" />
        </div>
        <span className="font-semibold text-sm whitespace-nowrap">{t('case-creation.createNewCase', 'Create New Case')}</span>
      </Button>
    </EnhancedTooltip>
  );
}; 