import { useMemo } from 'react';
import { formatAIResponse } from '../../utils/messageFormatter';

export const useMessageFormatter = (content: string, isAI: boolean) => {
  return useMemo(() => {
    if (!isAI) return content;
    return formatAIResponse(content);
  }, [content, isAI]);
};