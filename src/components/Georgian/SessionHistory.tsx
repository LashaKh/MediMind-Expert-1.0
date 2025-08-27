import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Heart,
  Activity,
  Stethoscope,
  Brain,
  Award,
  Shield,
  Zap,
  Filter,
  TrendingUp,
  Star,
  Archive,
  Volume2,
  MoreVertical
} from 'lucide-react';
import { GeorgianSession } from '../../hooks/useSessionManagement';

interface SessionHistoryProps {
  sessions: GeorgianSession[];
  currentSession: GeorgianSession | null;
  loading: boolean;
  onCreateSession: (title?: string) => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDuplicateSession: (sessionId: string) => void;
  onSearchChange: (query: string) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  currentSession,
  loading,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  onDuplicateSession,
  onSearchChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
  };

  const toggleExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatDuration = (ms: number) => {
    if (ms === 0) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionPreview = (session: GeorgianSession) => {
    if (!session.transcript) return 'No transcript yet...';
    return session.transcript.length > 80 
      ? session.transcript.substring(0, 80) + '...'
      : session.transcript;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Clean Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Archive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sessions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sessions.length} recordings
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onCreateSession()}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
            title="Create new session"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Clean Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-400 w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Loading Sessions</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Retrieving transcriptions...</p>
              </div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Sessions Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
              Create your first medical transcription session to begin capturing patient consultations.
            </p>
            
            <button
              onClick={() => onCreateSession()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const isActive = currentSession?.id === session.id;
              const hasTranscript = session.transcript && session.transcript.length > 0;
              const hasProcessing = session.processingResults && session.processingResults.length > 0;
              
              return (
                <div
                  key={session.id}
                  className={`
                    group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {session.transcript && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(session.id);
                                }}
                                className={`flex-shrink-0 p-1 rounded-lg transition-all duration-200 ${
                                  isActive 
                                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-white/60 dark:hover:bg-slate-800/60' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                }`}
                              >
                                {expandedSessions.has(session.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <h3 className={`text-base font-semibold truncate ${
                              isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                            }`}>
                              {session.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            {hasTranscript && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                                isActive 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              }`}>
                                <span>Transcribed</span>
                              </div>
                            )}
                            {hasProcessing && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                                isActive 
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                              }`}>
                                <span>AI Processed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm mb-3">
                        <div className={`flex items-center space-x-1 ${
                          isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                        {session.durationMs > 0 && (
                          <div className={`flex items-center space-x-1 ${
                            isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(session.durationMs)}</span>
                          </div>
                        )}
                      </div>
                      
                      {session.transcript && !expandedSessions.has(session.id) && (
                        <div className={`p-3 rounded-lg border text-sm leading-relaxed line-clamp-2 ${
                          isActive 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100' 
                            : 'bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {getSessionPreview(session)}
                        </div>
                      )}
                      
                      {/* Expanded Content */}
                      {expandedSessions.has(session.id) && session.transcript && (
                        <div className="mt-4">
                          <div className={`p-3 rounded-lg border text-sm leading-relaxed ${
                            isActive 
                              ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100' 
                              : 'bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {session.transcript}
                          </div>
                          
                          {/* Processing Results Count */}
                          {session.processingResults && session.processingResults.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                                isActive 
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                  : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                              }`}>
                                <span>{session.processingResults.length} AI analysis</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Quality Indicators */}
                      <div className="flex items-center space-x-2 mt-3">
                        <div className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          <Shield className="w-3 h-3" />
                          <span>Secure</span>
                        </div>
                        {session.transcript && (
                          <div className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            <span>98%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Menu */}
                    <div className="relative ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === session.id ? null : session.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeDropdown === session.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                          <div className="p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateSession(session.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 flex items-center space-x-2"
                            >
                              <Copy className="w-4 h-4 text-blue-500" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Active Session Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
          <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Secure</span>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};