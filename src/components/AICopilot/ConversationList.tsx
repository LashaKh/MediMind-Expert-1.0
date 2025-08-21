import React, { useState, useEffect } from 'react';
import { useChat } from '../../stores/useAppStore';
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
  Stethoscope
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<'all' | 'cardiology' | 'obgyn'>('all');
  const [selectedType, setSelectedType] = useState<'all' | ConversationType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'messages'>('date');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load conversations from database when component mounts
  useEffect(() => {

    loadConversationsFromDatabase();
  }, [loadConversationsFromDatabase]);

  // Convert conversations to summaries format
  const conversationSummaries: ConversationSummary[] = conversations.map((conv): ConversationSummary => ({
    id: conv.id,
    title: conv.title,
    type: conv.type,
    lastMessage: conv.messages?.[conv.messages.length - 1]?.content || undefined,
    updatedAt: new Date(conv.updatedAt || conv.createdAt),
    messageCount: conv.metadata?.messageCount || conv.messages?.length || 0,
    specialty: conv.specialty,
    caseId: conv.caseId
  }));

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

  const handleSelectConversation = async (conversationId: string) => {

    setActiveConversation(conversationId);
    
    // Load messages for this conversation

    await loadMessagesForConversation(conversationId);
    
    onClose();
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
        return <Heart className="w-3 h-3 text-red-500" />;
      case 'obgyn':
        return <Brain className="w-3 h-3 text-purple-500" />;
      default:
        return <MessageCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getSpecialtyColor = (specialty: 'cardiology' | 'obgyn' | undefined) => {
    switch (specialty) {
      case 'cardiology':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'obgyn':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getConversationTypeIcon = (type: ConversationType | undefined) => {
    switch (type) {
      case 'case-study':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'general':
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConversationTypeColor = (type: ConversationType | undefined) => {
    switch (type) {
      case 'case-study':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'general':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Premium Backdrop with Blur */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40 transition-opacity duration-300 ${className}`} 
        onClick={onClose} 
      />
      
      {/* Sophisticated Conversation Panel */}
      <div className="fixed left-6 top-20 bottom-6 w-[420px] bg-white/98 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-slate-900/10 z-50 flex flex-col border border-slate-200/60 overflow-hidden">
        {/* Luxurious Header Section */}
        <div className="relative bg-gradient-to-br from-slate-50/80 via-white/90 to-slate-50/80 border-b border-slate-200/60">
          {/* Subtle background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-indigo-500/1 to-purple-500/2" />
          
          <div className="relative p-6 pb-5">
            {/* Premium Header Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {t('conversations.title')}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    {t('conversations.manageSubtitle')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="
                    relative h-10 px-4 py-2.5 rounded-xl
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm
                    shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                    hover:scale-105 hover:-translate-y-0.5 active:scale-95
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
                  "
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">{t('conversations.newChat')}</span>
                </Button>
                
                <Button
                  onClick={loadConversationsFromDatabase}
                  size="sm"
                  variant="outline"
                  className="
                    relative h-10 px-3 py-2.5 rounded-xl
                    bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold text-sm border-green-200
                    shadow-lg shadow-green-500/10 hover:shadow-xl hover:shadow-green-500/20
                    hover:scale-105 hover:-translate-y-0.5 active:scale-95
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2
                  "
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{t('ui.refresh')}</span>
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="
                    relative h-10 w-10 p-0 rounded-xl
                    bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/60
                    text-slate-600 hover:text-slate-800 shadow-lg shadow-slate-900/5
                    hover:shadow-xl hover:shadow-slate-900/10 hover:scale-105 hover:-translate-y-0.5
                    active:scale-95 transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2
                  "
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-500/5 to-gray-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <X className="w-4 h-4 relative z-10" />
                </Button>
              </div>
            </div>

            {/* Premium Search Bar */}
            <div className="relative mb-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder={t('conversations.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full pl-12 pr-5 py-3.5 text-sm font-medium text-slate-700
                    bg-gradient-to-r from-white/90 to-slate-50/90 border border-slate-200/60
                    rounded-2xl shadow-lg shadow-slate-900/5 backdrop-blur-xl
                    placeholder:text-slate-400 placeholder:font-medium
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200/60
                    hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-0.5
                    transition-all duration-300 ease-out
                  "
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Conversation Type Tabs */}
            <div className="mb-5">
              <div className="flex items-center space-x-1 p-1 bg-slate-100/60 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
                    ${selectedType === 'all'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <Users className="w-4 h-4" />
                  <span>{t('conversations.all')} ({conversationSummaries.length})</span>
                </button>
                
                <button
                  onClick={() => setSelectedType('general')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
                    ${selectedType === 'general'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('conversations.conversations')} ({generalConversations.length})</span>
                </button>
                
                <button
                  onClick={() => setSelectedType('case-study')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
                    ${selectedType === 'case-study'
                      ? 'bg-white text-slate-800 shadow-md shadow-slate-900/10 border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('conversations.caseStudies')} ({caseStudyConversations.length})</span>
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
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200/60
                    hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-0.5
                    transition-all duration-300 ease-out appearance-none cursor-pointer
                  "
                >
                  <option value="all">{t('conversations.allSpecialties')}</option>
                  <option value="cardiology">{t('conversations.cardiology')}</option>
                  <option value="obgyn">{t('conversations.obgyn')}</option>
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
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200/60
                    hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-0.5
                    transition-all duration-300 ease-out appearance-none cursor-pointer
                  "
                >
                  <option value="date">{t('conversations.recent')}</option>
                  <option value="name">{t('conversations.byName')}</option>
                  <option value="messages">{t('conversations.byMessages')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Conversation List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-lg">
                  <MessageCircle className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute -top-1 -right-1 p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Search className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {searchTerm ? t('conversations.noMatchesFound') : t('conversations.noConversationsFound')}
              </h3>
              
              <p className="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed">
                {searchTerm 
                  ? t('conversations.tryAdjustingSearchOrFilters')
                  : t('conversations.startNewConversationHint')
                }
              </p>
              
              {!searchTerm && (
                <Button
                  onClick={handleCreateNew}
                  className="
                    relative px-6 py-3 rounded-xl
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold
                    shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                    hover:scale-105 hover:-translate-y-0.5 active:scale-95
                    transition-all duration-300 ease-out
                  "
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('conversations.createFirstConversation')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className={`group relative rounded-2xl cursor-pointer transition-all duration-300 ease-out ${
                    activeConversationId === conv.id
                      ? conv.type === 'case-study'
                        ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200/60 shadow-lg shadow-blue-500/10 scale-105'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/60 shadow-lg shadow-blue-500/10 scale-105'
                      : conv.type === 'case-study'
                        ? 'bg-gradient-to-r from-blue-50/30 to-sky-50/30 border-2 border-blue-200/30 hover:border-blue-300/60 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] hover:-translate-y-0.5'
                        : 'bg-gradient-to-r from-white/90 to-slate-50/90 border-2 border-slate-200/40 hover:border-slate-300/60 hover:shadow-lg hover:shadow-slate-900/10 hover:scale-[1.02] hover:-translate-y-0.5'
                  }`}
                  onClick={() => editingId !== conv.id && handleSelectConversation(conv.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Sophisticated Card Content */}
                  <div className="p-5">
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
                            bg-white/90 border-2 border-blue-200/60 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60
                            shadow-lg backdrop-blur-sm
                          "
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                          >
                            {t('conversations.save')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                          >
                            {t('conversations.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {/* Premium Type & Specialty Icon */}
                            <div className={`
                              p-2.5 rounded-xl shadow-md transition-all duration-300 relative
                              ${conv.type === 'case-study'
                                ? 'bg-gradient-to-br from-blue-50 to-sky-100 border border-blue-200/50'
                                : conv.specialty === 'cardiology' 
                                  ? 'bg-gradient-to-br from-red-50 to-rose-100 border border-red-200/50' 
                                  : conv.specialty === 'obgyn'
                                    ? 'bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200/50'
                                    : 'bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200/50'
                              }
                              ${activeConversationId === conv.id ? 'scale-110' : 'group-hover:scale-105'}
                            `}>
                              {conv.type === 'case-study' ? (
                                <Stethoscope className="w-3 h-3 text-blue-600" />
                              ) : (
                                getSpecialtyIcon(conv.specialty)
                              )}
                              {conv.type === 'case-study' && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                              )}
                            </div>
                            
                            {/* Conversation Title */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base text-slate-800 truncate leading-tight">
                                {conv.title}
                              </h3>
                              
                              {/* Quick Stats */}
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Hash className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs font-semibold text-slate-500">
                                    {conv.messageCount}
                                  </span>
                                </div>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs font-semibold text-slate-500">
                                    {formatTimestampDetailed(conv.updatedAt, 'relative')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                opacity-0 group-hover:opacity-100 transition-all duration-300
                                h-8 w-8 p-0 rounded-lg bg-white/80 hover:bg-blue-50 shadow-md
                                hover:scale-110 hover:shadow-lg
                              "
                              onClick={(e) => {
                                e.stopPropagation();

                                loadMessagesForConversation(conv.id);
                              }}
                              title={t('conversations.loadMessages')}
                            >
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                opacity-0 group-hover:opacity-100 transition-all duration-300
                                h-8 w-8 p-0 rounded-lg bg-white/80 hover:bg-white shadow-md
                                hover:scale-110 hover:shadow-lg
                              "
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conv);
                              }}
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="
                                opacity-0 group-hover:opacity-100 transition-all duration-300
                                h-8 w-8 p-0 rounded-lg bg-white/80 hover:bg-red-50 shadow-md
                                hover:scale-110 hover:shadow-lg
                              "
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(conv.id);
                              }}
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
                                {conv.messageCount} {conv.messageCount !== 1 ? t('conversations.messages') : t('conversations.message')}
                              </span>
                            </div>
                            
                            {/* Conversation Type Badge */}
                            <div className={`
                              flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-sm
                              ${getConversationTypeColor(conv.type)}
                            `}>
                              {getConversationTypeIcon(conv.type)}
                              <span>{conv.type === 'case-study' ? t('conversations.caseStudy') : t('conversations.conversation')}</span>
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
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none" />
                  )}
                  
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            {conversationSummaries.length} {conversationSummaries.length !== 1 ? t('conversations.conversations') : t('conversations.conversation')} • {' '}
            {conversationSummaries.reduce((total, conv) => total + conv.messageCount, 0)} {t('conversations.totalMessages')}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 z-50 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('conversations.deleteConversation')}</h3>
            <p className="text-gray-600 mb-4">
              {t('conversations.deleteConfirmation')}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t('conversations.cancel')}</Button>
              <Button 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('conversations.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 