import React, { useState } from 'react';
import { User, Bot, Clock, AlertCircle, CheckCircle, Sparkles, Brain, Copy } from 'lucide-react';
import { Message } from '../../types/chat';
import { formatTimestamp } from '../../utils/chat/messageUtils';
import { SourceReferences } from './SourceReferences';
import { MedicalMarkdownRenderer } from './MedicalMarkdownRenderer';

interface MessageItemProps {
  message: Message;
  className?: string;
  // Fact-check props for AI messages
  onFactCheck?: (messageId: string) => void;
  isFactChecking?: boolean;
}

export const UserMessageItem: React.FC<MessageItemProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex justify-end group ${className}`}>
      <div className="flex items-end space-x-3 max-w-2xl lg:max-w-3xl">
        <div className="relative">
          <div className="bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] text-white rounded-2xl rounded-br-md px-6 py-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
            
            {/* Message metadata */}
            <div className="flex items-center justify-between mt-3 text-xs opacity-90">
              <span>{formatTimestamp(message.timestamp)}</span>
              
              {/* Status indicator */}
              <div className="flex items-center space-x-1">
                {message.status === 'sending' && (
                  <>
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>Sending...</span>
                  </>
                )}
                {message.status === 'sent' && (
                  <CheckCircle className="w-3 h-3" />
                )}
                {message.status === 'error' && (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Failed</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/20 via-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>
        
        {/* Enhanced User avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-xl flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-[#1a365d]" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-[#63b3ed]/20 to-[#90cdf4]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
};

export const AIMessageItem: React.FC<MessageItemProps> = ({ message, className = '', onFactCheck, isFactChecking = false }) => {
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [extractedSources, setExtractedSources] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Handle clicks on inline source references
  const handleSourceClick = (sourceNumber: number) => {
    setHighlightedSource(highlightedSource === sourceNumber ? null : sourceNumber);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check for extracted sources from MedicalMarkdownRenderer
  React.useEffect(() => {
    // Clear previous sources first when message content changes
    setExtractedSources([]);

    const checkExtractedSources = () => {
      if (typeof window !== 'undefined' && (window as any).extractedSources) {
        setExtractedSources((window as any).extractedSources);
        // Clear the global variable after using it
        (window as any).extractedSources = null;
      }
    };

    // Check immediately and after a small delay to ensure MedicalMarkdownRenderer has run
    checkExtractedSources();
    const timeout = setTimeout(checkExtractedSources, 100);

    return () => {
      clearTimeout(timeout);
      // Clear extracted sources when component unmounts or message changes
      setExtractedSources([]);
    };
  }, [message.content, message.id]);

  return (
    <div className={`flex justify-start group ${className}`}>
      <div className="flex items-start space-x-3 w-full max-w-4xl">
        {/* Enhanced AI avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white relative z-10" />
          </div>
        </div>
        
        <div className="relative flex-1 w-full">
          <div className="bg-gradient-to-br from-[#90cdf4]/10 via-white/95 to-white/95 backdrop-blur-xl text-gray-900 rounded-2xl rounded-bl-md px-6 py-4 shadow-lg border border-[#63b3ed]/20 hover:shadow-xl transition-all duration-300 hover:border-[#63b3ed]/30 w-full">
            <MedicalMarkdownRenderer 
              content={message.content}
              className="text-sm leading-relaxed"
              onSourceClick={handleSourceClick}
            />
            
            {/* Source references - merge vector store sources with extracted markdown sources */}
            {/* Always show SourceReferences for AI messages to enable fact-checking even without sources */}
            {(() => {
              const vectorSources = message.sources || [];
              const markdownSources = extractedSources || [];
              const allSources = [...vectorSources, ...markdownSources];

              // Always render for AI messages (to show fact-check button), but only add border if sources exist
              return (
                <div className={allSources.length > 0 ? "mt-4 pt-3 border-t border-gray-200/50" : "mt-4"}>
                  <SourceReferences
                    sources={allSources}
                    maxInitialDisplay={3}
                    showExcerpts={true}
                    highlightedSourceNumber={highlightedSource}
                    onSourceHighlight={setHighlightedSource}
                    factCheckResult={message.factCheckResult}
                    isFactChecking={isFactChecking}
                    isMessageStreaming={message.isStreaming}
                    onFactCheck={onFactCheck ? () => onFactCheck(message.id) : undefined}
                  />
                </div>
              );
            })()}
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200/50">
                <div className="text-xs font-medium text-gray-600 mb-2 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Attachments:</span>
                </div>
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50/80 rounded-lg border border-gray-200/50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-xs font-medium text-gray-700">{attachment.name}</span>
                      <span className="text-xs text-gray-500">({(attachment.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Copy button and timestamp */}
            <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(message.timestamp)}</span>
              </div>
              
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                title={copied ? "Copied!" : "Copy response"}
              >
                <Copy className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0]/10 to-[#63b3ed]/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>
      </div>
    </div>
  );
};

// Generic MessageItem component that renders the appropriate type
export const MessageItem: React.FC<MessageItemProps> = ({ message, className = '', onFactCheck, isFactChecking }) => {
  if (message.type === 'user') {
    return <UserMessageItem message={message} className={className} />;
  } else {
    return <AIMessageItem message={message} className={className} onFactCheck={onFactCheck} isFactChecking={isFactChecking} />;
  }
};

export default MessageItem; 