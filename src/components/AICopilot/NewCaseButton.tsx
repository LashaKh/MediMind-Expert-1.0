import React from 'react';
import { Plus, Stethoscope, FilePlus2 } from 'lucide-react';
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
        className={className}
        aria-label={t('case-creation.createNewCase', 'Create New Case')}
        title={t('case-creation.createNewCase', 'Create New Case')}
      >
        {/* Icon container with glow effect */}
        <div className="relative">
          {/* Show FilePlus2 on mobile, Plus on desktop */}
          <FilePlus2 className="w-4 h-4 sm:hidden relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm" />
          <Plus className="w-4 h-4 hidden sm:block sm:mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-500 ease-out drop-shadow-sm" />
          {/* Icon glow on hover */}
          <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-slate-400 to-slate-500 transition-opacity duration-300" />
        </div>
        <span className="hidden sm:inline relative z-10 tracking-wide">{t('case-creation.newCase', 'New Case')}</span>

        {/* Premium shine effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-100/30 via-transparent to-blue-50/20 transition-opacity duration-300" />
      </Button>
    </EnhancedTooltip>
  );
}; 