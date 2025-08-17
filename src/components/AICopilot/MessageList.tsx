import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { useScrollToBottom } from '../../hooks/chat/useScrollToBottom';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { ArrowDown } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
  onScrollToTop?: () => void;
  typingMessage?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  className = '',
  onScrollToTop,
  typingMessage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useScrollToBottom(messages);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsAtBottom(isNearBottom);
    setShowScrollButton(!isNearBottom && messages.length > 0);

    // Check if user scrolled to top for loading more messages
    if (scrollTop === 0 && onScrollToTop) {
      onScrollToTop();
    }
  };

  // Auto-scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom, messagesEndRef]);

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (isTyping && isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTyping, isAtBottom, messagesEndRef]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  return (
    <div className={`relative flex-1 flex flex-col min-h-0 ${className}`}>
      {/* Messages container with modern scroll styling */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/60 dark:hover:scrollbar-thumb-gray-500/60"
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Render messages with modern spacing */}
        {messages.map((message, index) => (
          <MessageItem 
            key={message.id} 
            message={message}
            className="animate-in slide-in-from-bottom-2 duration-500 ease-out"
          />
        ))}

        {/* Typing indicator with modern styling */}
        {isTyping && (
          <div className="animate-in fade-in duration-300">
            <TypingIndicator 
              message={typingMessage}
              className="mb-2"
            />
          </div>
        )}

        {/* Scroll anchor with spacing */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

    </div>
  );
};

export default MessageList; 