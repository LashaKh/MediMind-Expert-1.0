import React, { useState, useEffect } from 'react';
import { useChat } from '../../stores/useAppStore';
import { useAppStore } from '../../stores/useAppStore';
import { useChat as useChatContext } from '../../contexts/ChatContext';
import { formatTimestampDetailed } from '../../utils/chat/messageUtils';
import { ConversationSummary, ConversationType } from '../../types/chat';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import {
  MessageCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Heart,
  Brain,
  X,
  Filter,
  SortDesc,
  Clock,
  Hash,
  Calendar,
  Users,
  Stethoscope,
  Loader2
} from 'lucide-react';

interface ConversationListProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    setActiveConversation,
    deleteConversation,
    updateConversation,
    loadConversationsFromDatabase,
    loadMessagesForConversation
  } = useChat();

  // Get ChatContext methods to sync state
  const chatContext = useChatContext();
  const setMessagesInContext = chatContext.setMessages;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<'all' | 'cardiology' | 'obgyn'>('all');
  const [selectedType, setSelectedType] = useState<'all' | ConversationType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'messages'>('date');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);

  // Track prefetched conversations for instant loading
  const [prefetchedConversations, setPrefetchedConversations] = useState<Set<string>>(new Set());

  // Load conversations from database when component mounts
  useEffect(() => {

    loadConversationsFromDatabase();
  }, [loadConversationsFromDatabase]);

  // Convert conversations to summaries format and remove duplicates
  const conversationSummaries: ConversationSummary[] = conversations
    .filter((conv, index, self) => self.findIndex(c => c.id === conv.id) === index)
    .map((conv): ConversationSummary => {
      return {
        id: conv.id,
        title: conv.title,
        type: conv.type,
        lastMessage: conv.messages?.[conv.messages.length - 1]?.content || undefined,
        updatedAt: new Date(conv.updatedAt || conv.createdAt),
        messageCount: conv.metadata?.messageCount || conv.messages?.length || 0,
        specialty: conv.specialty,
        caseId: conv.caseId
      };
    });

  // Filter and sort conversations
  const filteredConversations = conversationSummaries
    .filter(conv => {
      const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = selectedSpecialty === 'all' || conv.specialty === selectedSpecialty;
      const matchesType = selectedType === 'all' || conv.type === selectedType;
      
      return matchesSearch && matchesSpecialty && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'messages':
          return b.messageCount - a.messageCount;
        case 'date':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  // Get counts for different conversation types
  const generalConversations = conversationSummaries.filter(conv => 
    (!conv.type || conv.type === 'general') && 
    (selectedSpecialty === 'all' || conv.specialty === selectedSpecialty)
  );
  const caseStudyConversations = conversationSummaries.filter(conv => 
    conv.type === 'case-study' && 
    (selectedSpecialty === 'all' || conv.specialty === selectedSpecialty)
  );

  const handleCreateNew = () => {
    createNewConversation();
    onClose();
  };

  // Prefetch messages on hover for instant loading
  const handleHoverConversation = async (conversationId: string) => {
    // Skip if already prefetched or currently loading
    if (prefetchedConversations.has(conversationId) || loadingConversationId === conversationId) {
      return;
    }

    // Mark as prefetched
    setPrefetchedConversations(prev => new Set(prev).add(conversationId));

    // Prefetch messages in background
    try {
      await loadMessagesForConversation(conversationId);
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      // Set active conversation in both stores
      setActiveConversation(conversationId);
      chatContext.setActiveConversation(conversationId);

      // Get cached messages from current conversation state
      const cachedConversation = conversations.find(conv => conv.id === conversationId);

      // INSTANT: Show cached messages immediately (if available)
      if (cachedConversation && cachedConversation.messages && cachedConversation.messages.length > 0) {
        console.log(`⚡ Instant display: ${cachedConversation.messages.length} cached messages`);
        setMessagesInContext(cachedConversation.messages);

        // Close modal immediately for instant feel
        onClose();

        // BACKGROUND: Load fresh messages from database
        loadMessagesForConversation(conversationId).then(() => {
          const freshState = useAppStore.getState();
          const refreshedConversation = freshState.conversations.find(conv => conv.id === conversationId);

          if (refreshedConversation && refreshedConversation.messages) {
            console.log(`🔄 Background refresh: ${refreshedConversation.messages.length} messages`);
            setMessagesInContext(refreshedConversation.messages);
          }
        }).catch(error => {
          console.error('Background refresh failed:', error);
        });
      } else {
        // No cached messages - show loading and wait for database
        setLoadingConversationId(conversationId);

        await loadMessagesForConversation(conversationId);

        const freshState = useAppStore.getState();
        const loadedConversation = freshState.conversations.find(conv => conv.id === conversationId);

        if (loadedConversation && loadedConversation.messages) {
          console.log(`📨 Loaded ${loadedConversation.messages.length} messages from DB`);
          setMessagesInContext(loadedConversation.messages);
        }

        setLoadingConversationId(null);
        onClose();
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setLoadingConversationId(null);
    }
  };

  const handleStartEdit = (conv: ConversationSummary) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateConversation(editingId, { title: editingTitle.trim() });
      setEditingId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteClick = (conversationId: string) => {
    setDeleteConfirmId(conversationId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteConversation(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getSpecialtyIcon = (specialty: 'cardiology' | 'obgyn' | undefined) => {
    switch (specialty) {
      case 'cardiology':
        return <Heart className="w-3 h-3 text-[#2b6cb0]" />;
      case 'obgyn':
        return <Brain className="w-3 h-3 text-[#2b6cb0]" />;
      default:
        return <MessageCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getSpecialtyColor = (specialty: 'cardiology' | 'obgyn' | undefined) => {
    switch (specialty) {
      case 'cardiology':
        return 'bg-[#90cdf4]/10 text-[#1a365d] border-[#63b3ed]/30';
      case 'obgyn':
        return 'bg-[#90cdf4]/10 text-[#1a365d] border-[#63b3ed]/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConversationTypeIcon = (type: ConversationType | undefined) => {
    switch (type) {
      case 'case-study':
        return <Stethoscope className="w-4 h-4 text-[#2b6cb0]" />;
      case 'general':
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConversationTypeColor = (type: ConversationType | undefined) => {
    switch (type) {
      case 'case-study':
        return 'bg-[#90cdf4]/10 text-[#1a365d] border-[#63b3ed]/30';
      case 'general':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile-Optimized Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 transition-opacity duration-300 ${className}`} 
        onClick={onClose} 
      />
      
      {/* Mobile-First Conversation Panel */}
      <div className="fixed inset-0 md:left-6 md:top-20 md:bottom-6 md:w-[420px] bg-white z-50 flex flex-col md:rounded-3xl md:shadow-2xl md:shadow-slate-900/10 md:border md:border-slate-200/60 overflow-hidden">
        {/* Mobile-First Header Section */}
        <div className="relative bg-white border-b border-slate-200/60 safe-top">
          <div className="relative px-4 py-4 md:p-6 md:pb-5">
            {/* Mobile Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] shadow-lg shadow-[#2b6cb0]/25">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight truncate">
                    {t('chat.conversations.title')}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium hidden md:block">
                    {t('chat.conversations.subtitle')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Mobile-Optimized New Chat Button */}
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="
                    min-h-[44px] px-3 md:px-4 py-2.5 rounded-xl
                    bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white font-semibold text-sm
                    shadow-lg shadow-[#2b6cb0]/25 hover:shadow-xl hover:shadow-[#2b6cb0]/30
                    active:scale-95 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20
                  "
                >
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{t('chat.conversations.newChat')}</span>
                </Button>

                {/* Mobile-Optimized Refresh Button */}
                <Button
                  onClick={loadConversationsFromDatabase}
                  size="sm"
                  variant="outline"
                  className="
                    min-h-[44px] px-3 md:px-3 py-2.5 rounded-xl
                    bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 text-[#1a365d] font-semibold text-sm border-[#63b3ed]/30
                    shadow-lg shadow-[#63b3ed]/10 hover:shadow-xl hover:shadow-[#63b3ed]/20
                    active:scale-95 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20
                  "
                >
                  <span className="hidden md:inline">{t('chat.conversations.refresh')}</span>
                  <span className="md:hidden">↻</span>
                </Button>
                
                {/* Mobile-Optimized Close Button */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="
                    min-h-[44px] min-w-[44px] p-0 rounded-xl
                    bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/60
                    text-slate-600 hover:text-slate-800 shadow-lg shadow-slate-900/5
                    hover:shadow-xl hover:shadow-slate-900/10 active:scale-95
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#90cdf4]/20
                  "
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile-Optimized Search Bar */}
            <div className="relative mb-4 md:mb-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder={t('chat.conversations.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full pl-12 pr-12 py-4 md:py-3.5 text-sm font-medium text-slate-700
                    bg-gradient-to-r from-white/90 to-slate-50/90 border border-slate-200/60
                    rounded-xl md:rounded-2xl shadow-lg shadow-slate-900/5 backdrop-blur-xl
                    placeholder:text-slate-400 placeholder:font-medium
                    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed]/60
                    hover:shadow-xl hover:shadow-slate-900/10
                    transition-all duration-200 min-h-[52px]
                  "
                  style={{ fontSize: '16px' }} // Prevent mobile zoom
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-200 z-10 rounded-lg hover:bg-slate-100/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile-Optimized Filter Tabs */}
            <div className="mb-4 md:mb-5">
              <div className="flex items-center space-x-1 p-1 bg-slate-100/60 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`
                    flex-1 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-4 py-3 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 min-h-[56px] md:min-h-[auto]
                    ${selectedType === 'all'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="text-center">{t('chat.conversations.all')} ({conversationSummaries.length})</span>
                </button>

                <button
                  onClick={() => setSelectedType('general')}
                  className={`
                    flex-1 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-4 py-3 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 min-h-[56px] md:min-h-[auto]
                    ${selectedType === 'general'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-center">{t('chat.conversations.chats')} ({generalConversations.length})</span>
                </button>

                <button
                  onClick={() => setSelectedType('case-study')}
                  className={`
                    flex-1 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-4 py-3 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 min-h-[56px] md:min-h-[auto]
                    ${selectedType === 'case-study'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <Stethoscope className="w-4 h-4 flex-shrink-0" />
                  <span className="text-center">{t('chat.conversations.cases')} ({caseStudyConversations.length})</span>
                </button>
              </div>
            </div>

            {/* Sophisticated Filter Controls */}
            <div className="flex items-center space-x-3">
              {/* Specialty Filter */}
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value as 'cardiology' | 'obgyn')}
                  className="
                    w-full pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700
                    bg-gradient-to-r from-white/90 to-slate-50/90 border border-slate-200/60
                    rounded-xl shadow-md shadow-slate-900/5 backdrop-blur-xl
                    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed]/60
                    hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-0.5
                    transition-all duration-300 ease-out appearance-none cursor-pointer
                  "
                >
                  <option value="all">{t('chat.conversations.allSpecialties')}</option>
                  <option value="cardiology">{t('chat.conversations.cardiology')}</option>
                  <option value="obgyn">{t('chat.conversations.obgyn')}</option>
                </select>
              </div>
              
              {/* Sort Filter */}
              <div className="relative flex-1">
                <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'alphabetical' | 'mostMessages')}
                  className="
                    w-full pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-700
                    bg-gradient-to-r from-white/90 to-slate-50/90 border border-slate-200/60
                    rounded-xl shadow-md shadow-slate-900/5 backdrop-blur-xl
                    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed]/60
                    hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-0.5
                    transition-all duration-300 ease-out appearance-none cursor-pointer
                  "
                >
                  <option value="date">{t('chat.conversations.recent')}</option>
                  <option value="name">{t('chat.conversations.byName')}</option>
                  <option value="messages">{t('chat.conversations.byMessages')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 safe-bottom -webkit-overflow-scrolling-touch">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-lg">
                  <MessageCircle className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-1 -right-1 p-2 rounded-full bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] shadow-lg">
                  <Search className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {searchTerm ? t('chat.conversations.noMatchesFound') : t('chat.conversations.noConversationsFound')}
              </h3>
              
              <p className="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed">
                {searchTerm 
                  ? t('chat.conversations.tryAdjustingSearchOrFilters')
                  : t('chat.conversations.startNewConversationHint')
                }
              </p>
              
              {!searchTerm && (
                <Button
                  onClick={handleCreateNew}
                  className="
                    relative px-6 py-3 rounded-xl
                    bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white font-semibold
                    shadow-lg shadow-[#2b6cb0]/25 hover:shadow-xl hover:shadow-[#2b6cb0]/30
                    hover:scale-105 hover:-translate-y-0.5 active:scale-95
                    transition-all duration-300 ease-out
                  "
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('chat.conversations.createFirstConversation')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {filteredConversations.map((conv, index) => (
                <div
                  key={`${conv.id}-${index}`}
                  className={`group relative rounded-xl md:rounded-2xl transition-all duration-200 ${
                    loadingConversationId === conv.id
                      ? 'cursor-wait opacity-60'
                      : 'cursor-pointer'
                  } ${
                    activeConversationId === conv.id
                      ? conv.type === 'case-study'
                        ? 'bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 border-2 border-[#63b3ed]/60 shadow-lg shadow-[#2b6cb0]/10'
                        : 'bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 border-2 border-[#63b3ed]/60 shadow-lg shadow-[#2b6cb0]/10'
                      : conv.type === 'case-study'
                        ? 'bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 border-2 border-[#63b3ed]/30 hover:border-[#63b3ed]/60 hover:shadow-lg hover:shadow-[#2b6cb0]/10 active:scale-[0.98]'
                        : 'bg-gradient-to-r from-white/90 to-slate-50/90 border-2 border-slate-200/40 hover:border-[#63b3ed]/40 hover:shadow-lg hover:shadow-[#2b6cb0]/5 active:scale-[0.98]'
                  }`}
                  onClick={() => editingId !== conv.id && loadingConversationId !== conv.id && handleSelectConversation(conv.id)}
                  onMouseEnter={() => handleHoverConversation(conv.id)}
                >
                  {/* Mobile-Optimized Card Content */}
                  <div className="p-4 md:p-5">
                    {editingId === conv.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="
                            w-full px-4 py-3 text-sm font-semibold text-slate-800
                            bg-white/90 border-2 border-[#63b3ed]/60 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed]
                            shadow-lg backdrop-blur-sm
                          "
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-[#2b6cb0] hover:bg-[#1a365d] text-white rounded-lg font-semibold"
                          >
                            {t('chat.conversations.save')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                          >
                            {t('chat.conversations.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Mobile-Optimized Card Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {/* Mobile-Friendly Icon */}
                            <div className={`
                              p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-md transition-all duration-200 relative flex-shrink-0
                              ${conv.type === 'case-study'
                                ? 'bg-gradient-to-br from-[#90cdf4]/20 to-[#63b3ed]/30 border border-[#63b3ed]/50'
                                : conv.specialty === 'cardiology' 
                                  ? 'bg-gradient-to-br from-[#90cdf4]/10 to-[#63b3ed]/20 border border-[#63b3ed]/40' 
                                  : conv.specialty === 'obgyn'
                                    ? 'bg-gradient-to-br from-[#90cdf4]/10 to-[#63b3ed]/20 border border-[#63b3ed]/40'
                                    : 'bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200/50'
                              }
                            `}>
                              {conv.type === 'case-study' ? (
                                <Stethoscope className="w-4 h-4 md:w-3 md:h-3 text-[#2b6cb0]" />
                              ) : (
                                getSpecialtyIcon(conv.specialty)
                              )}
                              {conv.type === 'case-study' && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#2b6cb0] rounded-full border border-white"></div>
                              )}
                            </div>
                            
                            {/* Mobile-Optimized Content */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base md:text-base text-slate-800 truncate leading-tight mb-1">
                                {conv.title}
                              </h3>
                              
                              {/* Mobile-Friendly Stats */}
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="font-semibold text-slate-500">
                                  {conv.messageCount} messages
                                </span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="font-semibold text-slate-500 truncate">
                                  {formatTimestampDetailed(conv.updatedAt, 'relative')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile-Optimized Action Buttons */}
                          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                md:opacity-0 md:group-hover:opacity-100 transition-all duration-200
                                min-h-[44px] min-w-[44px] p-0 rounded-lg bg-white/80 hover:bg-[#90cdf4]/10 shadow-md
                                active:scale-95 hover:shadow-lg border border-[#63b3ed]/30
                              "
                              onClick={(e) => {
                                e.stopPropagation();
                                loadMessagesForConversation(conv.id);
                              }}
                              title="Load messages"
                            >
                              <MessageCircle className="w-4 h-4 text-[#2b6cb0]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                md:opacity-0 md:group-hover:opacity-100 transition-all duration-200
                                min-h-[44px] min-w-[44px] p-0 rounded-lg bg-white/80 hover:bg-slate-50 shadow-md
                                active:scale-95 hover:shadow-lg border border-slate-200/30
                              "
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conv);
                              }}
                              title="Edit conversation"
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                md:opacity-0 md:group-hover:opacity-100 transition-all duration-200
                                min-h-[44px] min-w-[44px] p-0 rounded-lg bg-white/80 hover:bg-red-50 shadow-md
                                active:scale-95 hover:shadow-lg border border-red-200/30
                              "
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(conv.id);
                              }}
                              title="Delete conversation"
                            >
                              <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Last Message Preview */}
                        {conv.lastMessage && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                              {conv.lastMessage}
                            </p>
                          </div>
                        )}
                        
                        {/* Enhanced Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {/* Message Count Badge */}
                            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200/50">
                              <MessageCircle className="w-3 h-3 text-slate-500" />
                              <span className="text-xs font-bold text-slate-700">
                                {conv.messageCount} {conv.messageCount !== 1 ? t('chat.conversations.messages') : t('chat.conversations.message')}
                              </span>
                            </div>
                            
                            {/* Conversation Type Badge */}
                            <div className={`
                              flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm
                              ${getConversationTypeColor(conv.type)}
                            `}>
                              {getConversationTypeIcon(conv.type)}
                              <span>{conv.type === 'case-study' ? t('chat.conversations.caseStudy') : t('chat.conversations.conversation')}</span>
                            </div>
                            
                            {/* Specialty Badge */}
                            {conv.specialty && (
                              <div className={`
                                px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm
                                ${getSpecialtyColor(conv.specialty)}
                              `}>
                                {conv.specialty}
                              </div>
                            )}
                          </div>
                          
                          {/* Enhanced Timestamp */}
                          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-100/50">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-500 tabular-nums">
                              {formatTimestampDetailed(conv.updatedAt, 'relative')}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Subtle gradient overlay for active state */}
                  {activeConversationId === conv.id && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2b6cb0]/5 to-[#63b3ed]/5 pointer-events-none" />
                  )}

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#90cdf4]/5 to-[#63b3ed]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Loading overlay */}
                  {loadingConversationId === conv.id && (
                    <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-8 h-8 text-[#2b6cb0] animate-spin" />
                        <p className="text-sm font-semibold text-[#2b6cb0]">Loading messages...</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            {conversationSummaries.length} {conversationSummaries.length !== 1 ? t('chat.conversations.conversations') : t('chat.conversations.conversation')} • {' '}
            {conversationSummaries.reduce((total, conv) => total + conv.messageCount, 0)} {t('chat.conversations.totalMessages')}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 z-50 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('chat.conversations.deleteConversation')}</h3>
            <p className="text-gray-600 mb-4">
              {t('chat.conversations.deleteConfirmation')}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t('chat.conversations.cancel')}</Button>
              <Button 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('chat.conversations.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 