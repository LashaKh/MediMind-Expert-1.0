import { useState } from 'react';
import { useAuth, useChat } from '../../../stores/useAppStore';

interface UseCaseManagementReturn {
  // State
  isCaseListOpen: boolean;
  isCaseCreateOpen: boolean;
  
  // Actions  
  setIsCaseListOpen: (open: boolean) => void;
  setIsCaseCreateOpen: (open: boolean) => void;
  
  // From chat store
  caseHistory: any[];
  activeCase: any;
  setActiveCase: (caseData: any) => void;
  createCase: (data: any) => Promise<any>;
  
  // From auth store
  user: any;
}

export const useCaseManagement = (): UseCaseManagementReturn => {
  const { user } = useAuth();
  const { caseHistory, activeCase, setActiveCase, createCase } = useChat();
  
  // Local state for modals
  const [isCaseListOpen, setIsCaseListOpen] = useState(false);
  const [isCaseCreateOpen, setIsCaseCreateOpen] = useState(false);

  return {
    // State
    isCaseListOpen,
    isCaseCreateOpen,
    
    // Actions
    setIsCaseListOpen,
    setIsCaseCreateOpen,
    
    // From stores
    caseHistory,
    activeCase,
    setActiveCase,
    createCase,
    user
  };
};