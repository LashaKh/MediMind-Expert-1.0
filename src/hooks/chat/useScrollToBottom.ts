import { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';

export const useScrollToBottom = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return messagesEndRef;
};