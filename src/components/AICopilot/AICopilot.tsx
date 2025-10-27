import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FlowiseChatWindow } from './FlowiseChatWindow';
import { ChatProvider } from '../../contexts/ChatContext';
import { useTranslation } from '../../hooks/useTranslation';

interface AICopilotProps {
  className?: string;
}

export const AICopilot = React.memo<AICopilotProps>(({ className = '' }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openCaseModal, setOpenCaseModal] = useState(false);

  // Hide body and html overflow to prevent page-level scrollbar
  useEffect(() => {
    // Store original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Hide overflow on both body and html elements
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Restore scrollbar on unmount (use 'auto' if original was empty)
    return () => {
      document.body.style.overflow = originalBodyOverflow || 'auto';
      document.documentElement.style.overflow = originalHtmlOverflow || 'auto';
    };
  }, []);

  useEffect(() => {
    // Check if we should open the case creation modal
    if (searchParams.get('createCase') === 'true') {
      setOpenCaseModal(true);
      // Remove the parameter from URL
      searchParams.delete('createCase');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className={`h-full w-full ${className}`}>
      <ChatProvider>
        <FlowiseChatWindow
          allowAttachments={true}
          placeholder={t('chat.typeMessage')}
          className="h-full"
          openCaseModalOnMount={openCaseModal}
        />
      </ChatProvider>
    </div>
  );
});

// Add display name for better debugging
AICopilot.displayName = 'AICopilot';

export default AICopilot; 