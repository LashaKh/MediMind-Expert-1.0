import React, { useRef, useCallback } from 'react';
import { Message } from '../../types/chat';
import { ChatScrollAnchor } from './ChatScrollAnchor';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
  onScrollToTop?: () => void;
  typingMessage?: string;
  // Fact-check props
  onFactCheck?: (messageId: string) => void;
  isFactChecking?: boolean;
}

const MessageListComponent: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  className = '',
  onScrollToTop,
  typingMessage,
  onFactCheck,
  isFactChecking = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Filter out streaming messages that have no content yet (prevent empty bubble)
  const visibleMessages = React.useMemo(() => {
    return messages.filter(msg => {
      // Hide streaming messages that have no content yet
      if (msg.isStreaming && (!msg.content || msg.content.trim() === '')) {
        return false;
      }
      return true;
    });
  }, [messages]);

  // Check if any message is currently streaming
  const hasStreamingMessage = React.useMemo(() => {
    return messages.some(msg => msg.isStreaming);
  }, [messages]);

  // Debug: Log isTyping and hasStreamingMessage states
  React.useEffect(() => {
    console.log('📊 MessageList state:', { isTyping, hasStreamingMessage, messageCount: messages.length });
  }, [isTyping, hasStreamingMessage, messages.length]);

  // Handle scroll events - simplified to only manage scroll button visibility
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show scroll button when user is >100px from bottom
    const isNearBottom = distanceFromBottom < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);

    // Check if user scrolled to top for loading more messages
    if (scrollTop === 0 && onScrollToTop) {
      onScrollToTop();
    }
  }, [messages.length, onScrollToTop]);


  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setShowScrollButton(false);
  }, []);

  return (
    <div className={`relative flex-1 flex flex-col min-h-0 ${className}`}>
      {/* Messages container with modern scroll styling */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/60 dark:hover:scrollbar-thumb-gray-500/60"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          willChange: 'scroll-position',
          transform: 'translateZ(0)',
          scrollbarGutter: 'stable',
          overflowAnchor: 'none' // Prevent browser from auto-scrolling on content growth
        }}
      >
        {/* Render messages with modern spacing */}
        {visibleMessages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            className="animate-in slide-in-from-bottom-2 duration-500 ease-out"
            onFactCheck={onFactCheck}
            isFactChecking={isFactChecking}
          />
        ))}

        {/* Typing indicator with modern styling - show only when explicitly typing (not during streaming) */}
        {isTyping && (
          <div className="animate-in fade-in duration-300">
            <TypingIndicator
              message={typingMessage}
              className="mb-2"
            />
          </div>
        )}

        {/* Extra spacing for mobile input area overlay */}
        <div className="h-48 sm:h-24" />

        {/* Smart auto-scroll anchor - uses Intersection Observer to track bottom visibility */}
        <ChatScrollAnchor
          trackVisibility={hasStreamingMessage || isTyping}
          scrollAreaRef={containerRef}
        />
      </div>

    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const MessageList = React.memo(MessageListComponent);

export default MessageList; 