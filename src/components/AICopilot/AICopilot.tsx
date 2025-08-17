import React from 'react';
import { FlowiseChatWindow } from './FlowiseChatWindow';
import { ChatProvider } from '../../contexts/ChatContext';
import { useTranslation } from '../../hooks/useTranslation';

interface AICopilotProps {
  className?: string;
}

export const AICopilot = React.memo<AICopilotProps>(({ className = '' }) => {
  const { t } = useTranslation();
  return (
    <div className={`h-full w-full ${className}`}>
      <ChatProvider>
        <FlowiseChatWindow 
          allowAttachments={true}
          placeholder={t('chat.typeMessage')}
          className="h-full"
        />
      </ChatProvider>
    </div>
  );
});

// Add display name for better debugging
AICopilot.displayName = 'AICopilot';

export default AICopilot; 