import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Stethoscope,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Activity,
  Brain,
  Award,
  Shield,
  Zap,
  Filter,
  TrendingUp,
  Star,
  Archive,
  Volume2,
  MoreVertical,
  X,
  Check,
  Edit3,
  Hash,
  Headphones,
  Mic,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layers,
  Wand2,
  RefreshCcw,
  BookOpen,
  Target,
  Lightbulb,
  Zap as ZapIcon,
  Crown,
  Gem,
  ClipboardList
} from 'lucide-react';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { MedicalButton, MedicalCard, MedicalInput, MedicalLoading, MedicalBadge } from '../ui/MedicalDesignSystem';

interface SessionHistoryProps {
  sessions: GeorgianSession[];
  currentSession: GeorgianSession | null;
  loading: boolean;
  onCreateSession: (title?: string) => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDuplicateSession: (sessionId: string) => void;
  onUpdateSession?: (sessionId: string, updates: { title: string }) => void;
  onSearchChange: (query: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

// Session categories for intelligent grouping
const getSessionCategory = (session: GeorgianSession) => {
  const hasTranscript = session.transcript && session.transcript.length > 0;
  const hasProcessing = session.processingResults && session.processingResults.length > 0;
  const isRecent = new Date(session.createdAt).getTime() > Date.now() - 86400000; // Last 24 hours
  
  if (hasTranscript && hasProcessing) return 'complete';
  if (hasTranscript) return 'transcribed';
  if (isRecent) return 'recent';
  return 'draft';
};

// Advanced session metrics
const getSessionMetrics = (session: GeorgianSession) => {
  const wordCount = session.transcript ? session.transcript.split(' ').length : 0;
  const quality = wordCount > 100 ? 'high' : wordCount > 50 ? 'medium' : 'low';
  const processingCount = session.processingResults?.length || 0;
  
  return { wordCount, quality, processingCount };
};

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  currentSession,
  loading,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  onDuplicateSession,
  onUpdateSession,
  onSearchChange,
  onCollapseChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'transcribed' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  // Title editing states
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Enhanced search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange(query);
  };

  // Smart session grouping by date with category badges
  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter(session => {
      const matchesSearch = searchQuery.trim() === '' || 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session.transcript && session.transcript.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'transcribed' && session.transcript) ||
        (filterBy === 'favorites' && favorites.has(session.id));
      
      return matchesSearch && matchesFilter;
    });

    const groups: { [key: string]: GeorgianSession[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'This Month': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    filtered.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      
      if (sessionDay.getTime() === today.getTime()) {
        groups['Today'].push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(session);
      } else if (sessionDate.getTime() > thisWeek.getTime()) {
        groups['This Week'].push(session);
      } else if (sessionDate.getTime() > thisMonth.getTime()) {
        groups['This Month'].push(session);
      } else {
        groups['Older'].push(session);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [sessions, searchQuery, filterBy, favorites]);

  const toggleFavorite = (sessionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sessionId)) {
      newFavorites.delete(sessionId);
    } else {
      newFavorites.add(sessionId);
    }
    setFavorites(newFavorites);
  };

  const calculateDropdownPosition = (sessionId: string) => {
    const button = buttonRefs.current[sessionId];
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    const dropdownWidth = 192; // w-48 = 192px
    const dropdownHeight = 96; // Approximate height for 2 items
    
    // Position dropdown to the left of the button, aligned to the right edge of button
    let left = rect.right - dropdownWidth;
    let top = rect.bottom + 4; // Small gap below button
    
    // Adjust if dropdown would go off the left edge
    if (left < 8) {
      left = rect.left;
    }
    
    // Adjust if dropdown would go off the right edge
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8;
    }
    
    // If not enough space below, position above the button
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 4;
    }
    
    return { top, left };
  };

  const toggleHistory = () => {
    const newCollapsedState = !isHistoryCollapsed;
    setIsHistoryCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms === 0) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionPreview = (session: GeorgianSession) => {
    if (!session.transcript) return 'No content yet';
    // Get first 4-5 words only
    const words = session.transcript.split(' ').slice(0, 5);
    return words.join(' ') + (session.transcript.split(' ').length > 5 ? '...' : '');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'complete': return CheckCircle2;
      case 'transcribed': return Stethoscope;
      case 'recent': return Clock;
      default: return AlertCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'complete': return 'text-[#1a365d]';
      case 'transcribed': return 'text-[#2b6cb0]';
      case 'recent': return 'text-[#63b3ed]';
      default: return 'text-[#90cdf4]';
    }
  };

  const getCategoryBgColor = (category: string, isActive: boolean) => {
    if (isActive) {
      switch (category) {
        case 'complete': return 'bg-[#1a365d]';
        case 'transcribed': return 'bg-[#2b6cb0]';
        case 'recent': return 'bg-[#63b3ed]';
        default: return 'bg-[#90cdf4]';
      }
    }
    switch (category) {
      case 'complete': return 'bg-[#1a365d]/20';
      case 'transcribed': return 'bg-[#2b6cb0]/20';
      case 'recent': return 'bg-[#63b3ed]/20';
      default: return 'bg-[#90cdf4]/20';
    }
  };

  const getCategoryIconColor = (category: string, isActive: boolean) => {
    if (isActive) return 'text-white';
    switch (category) {
      case 'complete': return 'text-[#1a365d]';
      case 'transcribed': return 'text-[#2b6cb0]';
      case 'recent': return 'text-[#63b3ed]';
      default: return 'text-[#1a365d]';
    }
  };

  // Title editing functions
  const handleStartEditingTitle = (session: GeorgianSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveTitle = async () => {
    if (editingSessionId && onUpdateSession && editingTitle.trim()) {
      await onUpdateSession(editingSessionId, { title: editingTitle.trim() });
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEditTitle = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditTitle();
    }
  };

  // Helper function to count Form 100 reports for a session
  const getForm100Count = (session: GeorgianSession): number => {
    // Form 100 reports are stored in localStorage with keys like:
    // form100_generated_{sessionId}_{timestamp}

    try {
      let count = 0;

      // Check all localStorage keys for Form 100 reports for this session
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('form100_generated_') && key.includes(session.id)) {
          count++;
        }
      }

      return count;
    } catch (error) {
      console.error('Error counting Form 100 reports:', error);
      return 0;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSessionCard = (session: GeorgianSession) => {
    const isActive = currentSession?.id === session.id;
    const isHovered = hoveredSession === session.id;
    const isFavorite = favorites.has(session.id);
    const category = getSessionCategory(session);
    const metrics = getSessionMetrics(session);
    const CategoryIcon = getCategoryIcon(category);
    const form100Count = getForm100Count(session);

    return (
      <MedicalCard
        key={session.id}
        variant={isActive ? "elevated" : "interactive"}
        className={`
          group relative cursor-pointer transition-all duration-200 ease-out
          ${isActive
            ? 'shadow-lg border-[#2b6cb0] bg-gradient-to-br from-[#f0f9ff] to-white'
            : 'hover:shadow-md border-gray-200 hover:border-[#90cdf4]'
          }
          overflow-hidden
        `}
        onClick={() => onSelectSession(session.id)}
        onMouseEnter={() => setHoveredSession(session.id)}
        onMouseLeave={() => setHoveredSession(null)}
        padding="none"
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2b6cb0]" />
        )}

        {/* Card Content */}
        <div className="relative p-4 flex flex-col gap-3">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {editingSessionId === session.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleSaveTitle}
                    className="flex-1 text-base font-semibold bg-white border-2 border-[#2b6cb0] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2b6cb0]/20 text-[#1a365d]"
                    maxLength={100}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-2 bg-[#2b6cb0] text-white rounded-lg hover:bg-[#1a365d] transition-colors"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEditTitle}
                    className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/title">
                  <h3 className={`text-base font-semibold truncate ${isActive ? 'text-[#1a365d]' : 'text-gray-900'}`}>
                    {session.title}
                  </h3>
                  {onUpdateSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditingTitle(session);
                      }}
                      className="opacity-0 group-hover/title:opacity-100 p-1 text-[#2b6cb0] hover:text-[#1a365d] transition-opacity"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(session.id);
                }}
                className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-[#90cdf4]' : 'text-gray-400 hover:text-[#90cdf4]'}`}
                title={isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              <div className="relative">
                <button
                  ref={(el) => { buttonRefs.current[session.id] = el; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeDropdown === session.id) {
                      setActiveDropdown(null);
                      setDropdownPosition(null);
                    } else {
                      const position = calculateDropdownPosition(session.id);
                      setDropdownPosition(position);
                      setActiveDropdown(session.id);
                    }
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(session.createdAt)}</span>
            {metrics.wordCount > 0 && (
              <>
                <span>•</span>
                <span>{metrics.wordCount} words</span>
              </>
            )}
            {session.durationMs > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(session.durationMs)}</span>
              </>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {session.transcript && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#e0f2fe] text-[#0369a1] rounded-full">
                <Stethoscope className="w-3 h-3" />
                Transcribed
              </span>
            )}
            {session.processingResults && session.processingResults.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#dbeafe] text-[#1e40af] rounded-full">
                <Brain className="w-3 h-3" />
                AI: {session.processingResults.length}
              </span>
            )}
            {form100Count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#1e40af] text-white rounded-full">
                <ClipboardList className="w-3 h-3" />
                Form 100: {form100Count}
              </span>
            )}
          </div>

          {/* Preview Text */}
          {!isActive && getSessionPreview(session) !== 'No content yet' && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {getSessionPreview(session)}
            </p>
          )}
        </div>
      </MedicalCard>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Clean Compact Header */}
      <div className="relative bg-white border-b border-[#90cdf4]/30 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleHistory}
              className={`
                w-10 h-10 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                history-toggle-btn ${isHistoryCollapsed ? 'collapsed' : ''}
              `}
              title={isHistoryCollapsed ? "Expand sessions" : "Collapse sessions"}
            >
              {isHistoryCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            
            <div>
              <h2 className="text-lg font-bold text-[#1a365d]">
                History
              </h2>
              <p className="text-sm text-[#2b6cb0]">
                {sessions.length} recordings
              </p>
            </div>
          </div>
          
          {/* Compact Create Button */}
          <button
            onClick={() => onCreateSession()}
            className="transcription-btn-primary flex items-center space-x-2 px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white font-semibold">New</span>
          </button>
        </div>
        
        {/* Compact Search and Filters - Only show when expanded */}
        {!isHistoryCollapsed && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              {/* Compact Search */}
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="text-[#1a365d]/50 w-4 h-4" />
                </div>
                <MedicalInput
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 h-10 bg-white/80 dark:bg-medical-gray-700/80 border-medical-gray-200 dark:border-medical-gray-600 rounded-xl text-sm"
                  size="sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-medical-gray-400 hover:text-medical-gray-600 dark:hover:text-medical-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Compact Filter Options */}
              <div className="flex items-center space-x-1">
                {['all', 'transcribed', 'favorites'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterBy(filter as any)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize
                      ${filterBy === filter
                        ? 'transcription-btn-primary text-white'
                        : 'transcription-btn-secondary'
                      }
                    `}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session List - Only show when expanded */}
      {!isHistoryCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#90cdf4] border-t-[#1a365d] border-r-[#1a365d] rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-2 border-[#63b3ed]/30 rounded-full animate-ping" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-[#1a365d]">Loading Sessions</p>
                  <p className="text-sm text-[#2b6cb0]">Retrieving your medical transcriptions...</p>
                </div>
              </div>
            </div>
          ) : Object.keys(groupedSessions).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#90cdf4]/30 to-[#63b3ed]/30 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Stethoscope className="w-12 h-12 text-[#1a365d]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-[#1a365d] mb-3">
                {searchQuery || filterBy !== 'all' ? 'No Sessions Found' : 'Ready to Begin'}
              </h3>
              <p className="text-[#2b6cb0] text-center mb-8 max-w-md leading-relaxed">
                {searchQuery || filterBy !== 'all' 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Create your first medical transcription session to begin capturing patient consultations with AI-powered analysis.'
                }
              </p>
              
              {!searchQuery && filterBy === 'all' && (
                <button
                  onClick={() => onCreateSession()}
                  className="transcription-btn-primary flex items-center space-x-3 px-6 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg font-semibold"
                >
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-white">Create Your First Session</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
                <div key={groupName}>
                  {/* Compact Group Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-sm font-bold text-[#1a365d]">
                      {groupName}
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#90cdf4]/50 via-[#90cdf4]/30 to-transparent" />
                    <span className="text-xs text-[#2b6cb0] font-medium">
                      {groupSessions.length}
                    </span>
                  </div>

                  {/* Compact Sessions List */}
                  <div className={`
                    ${viewMode === 'grid' 
                      ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' 
                      : 'space-y-3'
                    }
                  `}>
                    {groupSessions.map((session) => renderSessionCard(session))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Footer - Only show when expanded */}
      {!isHistoryCollapsed && (
        <div className="relative px-4 py-2 bg-white border-t border-[#90cdf4]/30">
          <div className="flex items-center justify-center text-xs text-[#2b6cb0]">
            <span>{sessions.length} sessions • </span>
            <Shield className="w-3 h-3 mx-1 text-[#2b6cb0]" />
            <span>Secure</span>
          </div>
        </div>
      )}

      {/* Global dropdown portal - renders at document root to escape overflow:hidden */}
      {activeDropdown && dropdownPosition && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9999]" 
            onClick={() => {
              setActiveDropdown(null);
              setDropdownPosition(null);
            }} 
          />
          <div 
            className="fixed z-[10000] w-48 bg-white border border-[#90cdf4]/50 rounded-xl shadow-2xl"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left
            }}
            ref={dropdownRef}
          >
            <div className="p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateSession(activeDropdown);
                  setActiveDropdown(null);
                  setDropdownPosition(null);
                }}
                className="w-full px-3 py-2 text-left text-sm font-medium text-[#1a365d] hover:bg-[#90cdf4]/10 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Copy className="w-3 h-3 text-[#2b6cb0]" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const sessionToDelete = sessions.find(s => s.id === activeDropdown);
                  if (sessionToDelete && confirm(`Delete "${sessionToDelete.title}"?`)) {
                    onDeleteSession(activeDropdown);
                  }
                  setActiveDropdown(null);
                  setDropdownPosition(null);
                }}
                className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Enhanced keyboard shortcuts overlay */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(144, 205, 244, 0.1) !important;
          border-radius: 4px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%) !important;
          border-radius: 4px !important;
          transition: background 0.2s ease !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0f1c2e 0%, #1a365d 100%) !important;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgba(144, 205, 244, 0.1) !important;
        }
        
        /* Force Firefox scrollbar theme */
        .custom-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: #1a365d rgba(144, 205, 244, 0.3) !important;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};