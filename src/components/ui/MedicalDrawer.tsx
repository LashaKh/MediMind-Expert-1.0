import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronDown, Search, Plus, FileText } from 'lucide-react';
import '../Georgian/MediScribeAnimations.css';

interface MedicalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}

export const MedicalDrawer: React.FC<MedicalDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '75vh',
  className = '',
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  actions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Touch gesture handlers for drawer
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ y: touch.clientY, time: Date.now() });
    setIsDragging(false);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.y;
    
    // Only start dragging if moved more than 10px downward
    if (deltaY > 10 && !isDragging) {
      setIsDragging(true);
    }
    
    // Update drag offset for visual feedback
    if (isDragging && deltaY > 0) {
      setDragOffset(Math.min(deltaY, 200));
    }
  }, [touchStart, isDragging]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Fast swipe down or significant drag - close drawer
    if ((deltaY > 50 && deltaTime < 300) || dragOffset > 100) {
      onClose();
    }
    
    // Reset state
    setTouchStart(null);
    setIsDragging(false);
    setDragOffset(0);
  }, [touchStart, dragOffset, onClose]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Enhanced Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Medical Drawer Container */}
      <div 
        ref={drawerRef}
        className={`
          absolute bottom-0 left-0 right-0 
          bg-white dark:bg-gray-800 
          rounded-t-3xl shadow-2xl 
          transform transition-all duration-300 ease-out
          ${isDragging ? 'transition-none' : ''}
          animate-premium-slide-in
          ${className}
        `}
        style={{ 
          maxHeight,
          transform: `translateY(${dragOffset}px)`,
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-center py-4 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 rounded-t-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={onClose}
        >
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-200" />
        </div>
        
        {/* Medical Header */}
        <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white medical-mobile-text-xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium medical-mobile-text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {actions}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 premium-hover-scale medical-touch-target medical-drawer-item"
                aria-label="Close drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Enhanced Search Input */}
          {showSearch && (
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="
                  w-full pl-12 pr-4 py-4 text-base rounded-2xl border-2 
                  border-gray-200 dark:border-gray-600 
                  bg-gray-50 dark:bg-gray-700 
                  text-gray-900 dark:text-white 
                  placeholder-gray-500 dark:placeholder-gray-400 
                  focus:outline-none focus:ring-4 focus:ring-blue-500/20 
                  focus:border-blue-500 dark:focus:border-blue-400
                  transition-all duration-200 premium-focus
                  touch-manipulation
                  medical-input medical-mobile-touch-md
                "
                style={{ minHeight: 'var(--medical-mobile-touch-md)' }}
              />
            </div>
          )}
        </div>
        
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto premium-scroll-indicator"
          style={{ 
            maxHeight: `calc(${maxHeight} - 160px)`,
            scrollbarWidth: 'thin',
            scrollbarColor: '#3B82F6 #F3F4F6'
          }}
        >
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Session Item Component for Medical Use
interface SessionItemProps {
  session: {
    id: string;
    title: string;
    transcript: string;
    createdAt: string;
    durationMs: number;
  };
  isActive: boolean;
  onSelect: () => void;
  className?: string;
}

export const MedicalSessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  className = ''
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const hasTranscript = session.transcript && session.transcript.length > 0;
  
  return (
    <div
      className={`
        relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 
        premium-hover-lift touch-manipulation
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/10' 
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-lg'
        }
        ${className}
      `}
      onClick={onSelect}
      style={{ minHeight: '80px' }} // Touch-friendly height
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
            isActive 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
              : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          }`}>
            <FileText className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold truncate mb-1 ${
              isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
            }`}>
              {session.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {new Date(session.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {session.durationMs > 0 && (
                <span className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatTime(session.durationMs)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {hasTranscript && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            isActive 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800'
          }`}>
            Transcribed
          </div>
        )}
      </div>
      
      {session.transcript && (
        <div className={`text-sm leading-relaxed line-clamp-2 font-medium ${
          isActive 
            ? 'text-blue-800 dark:text-blue-200'
            : 'text-gray-600 dark:text-gray-300'
        }`}>
          {session.transcript.length > 120 
            ? session.transcript.substring(0, 120) + '...'
            : session.transcript
          }
        </div>
      )}
      
      {/* Active Session Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full shadow-lg" />
      )}
    </div>
  );
};

// Empty State Component
interface MedicalEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const MedicalEmptyState: React.FC<MedicalEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-sm">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="
            px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700 
            text-white font-bold rounded-2xl 
            shadow-lg shadow-blue-500/25 
            hover:shadow-xl hover:shadow-blue-500/30
            transition-all duration-300 
            premium-hover-lift touch-manipulation
          "
          style={{ minHeight: '48px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};