import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import DebugPanel from './DebugPanel';

export const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">
            {t('navigation.settings')}
          </h1>
        </div>
        
        <DebugPanel />
        
        <div className="bg-[var(--component-card)] dark:bg-[var(--background)] rounded-lg shadow-md p-6 mt-6">
          <p className="text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] mb-4">
            {t('navigation.settingsDesc')}
          </p>
          <div className="text-center py-12">
            <SettingsIcon className="w-16 h-16 text-[var(--foreground-secondary)] mx-auto mb-4" />
            <p className="text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)]">
              {t('navigation.comingSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 