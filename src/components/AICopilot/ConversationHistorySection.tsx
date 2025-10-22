import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, ChevronDown, ChevronUp, Clock, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Conversation } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';
import { formatTimestampDetailed } from '../../utils/chat/messageUtils';

interface ConversationHistorySectionProps {
  caseId: string;
  conversations: Conversation[];
  conversationCount: number;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLoadConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string, caseId: string) => Promise<void>;
  className?: string;
}

export const ConversationHistorySection: React.FC<ConversationHistorySectionProps> = ({
  caseId,
  conversations,
  conversationCount,
  isLoading,
  isExpanded,
  onToggleExpand,
  onLoadConversation,
  onDeleteConversation,
  className = ''
}) => {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className={`mt-4 ${className}`}>
      {/* Expandable Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="
          w-full flex items-center justify-between px-4 py-3 rounded-xl
          bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 border border-[#63b3ed]/30
          hover:border-[#63b3ed]/50 hover:shadow-md
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20
          min-h-[52px]
        "
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#2b6cb0]/10 border border-[#63b3ed]/30">
            <MessageSquare className="w-4 h-4 text-[#2b6cb0]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-[#1a365d]">
              {t('caseLibrary.conversationHistory')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {conversationCount} {conversationCount === 1 ? t('caseLibrary.conversation') : t('caseLibrary.conversations')}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#2b6cb0] animate-spin" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#2b6cb0]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#2b6cb0]" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          transition-all duration-300 ease-in-out
          ${isExpanded
            ? 'max-h-[600px] opacity-100 mt-3 relative z-50'
            : 'max-h-0 opacity-0 overflow-hidden'
          }
        `}
      >
        <div className={`
          space-y-2 bg-white rounded-xl shadow-xl border border-slate-200/60 p-4
          ${isExpanded ? '' : 'hidden'}
        `}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#2b6cb0] animate-spin" />
            </div>
          ) : conversationCount === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
              <div className="p-3 rounded-full bg-slate-100 mb-3">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {t('caseLibrary.noConversations')}
              </p>
              <p className="text-xs text-slate-500 text-center">
                {t('caseLibrary.startChatToCreate')}
              </p>
            </div>
          ) : (
            // Conversation List
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[#63b3ed]/30 scrollbar-track-slate-100">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="
                    group relative p-4 rounded-xl bg-white border border-slate-200/50
                    hover:border-[#63b3ed]/40 hover:shadow-md
                    transition-all duration-200
                  "
                >
                  {/* Conversation Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate mb-1 leading-tight">
                        {conversation.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="font-semibold">
                            {conversation.metadata?.messageCount || 0}
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">
                            {formatTimestampDetailed(conversation.updatedAt, 'relative')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-3">
                      {/* Delete Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(conversation.id);
                        }}
                        size="sm"
                        disabled={deletingId === conversation.id}
                        className="
                          px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg
                          bg-red-50 text-red-600 border border-red-200
                          hover:bg-red-100 hover:border-red-300
                          shadow-sm hover:shadow-md
                          transition-all duration-200
                          font-semibold text-xs
                          focus:outline-none focus:ring-2 focus:ring-red-300/20
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {deletingId === conversation.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Load Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadConversation(conversation.id);
                        }}
                        size="sm"
                        className="
                          px-4 py-2 min-h-[44px] rounded-lg
                          bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] text-white
                          hover:from-[#1a365d] hover:to-[#2b6cb0]
                          shadow-md hover:shadow-lg
                          transition-all duration-200
                          font-semibold text-xs
                          focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20
                        "
                      >
                        {t('caseLibrary.loadConversation')}
                      </Button>
                    </div>
                  </div>

                  {/* Confirmation Dialog */}
                  {confirmDeleteId === conversation.id && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                      <div className="bg-white rounded-xl p-4 shadow-2xl max-w-sm mx-4 border-2 border-red-200">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">
                              {t('caseLibrary.deleteConversationTitle')}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {t('caseLibrary.deleteConversationMessage')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            size="sm"
                            className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                          >
                            {t('caseLibrary.cancel')}
                          </Button>
                          <Button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setDeletingId(conversation.id);
                              setConfirmDeleteId(null);
                              try {
                                await onDeleteConversation(conversation.id, caseId);
                              } catch (error) {
                                console.error('Error deleting conversation:', error);
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            size="sm"
                            className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold"
                          >
                            {t('caseLibrary.delete')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#90cdf4]/5 to-[#63b3ed]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
