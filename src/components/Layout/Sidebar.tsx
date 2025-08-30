import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  X,
  ChevronLeft,
  Activity,
  User,
  Database,
  Mic,
  Mic2,
  Search,
  BarChart3,
  TestTube2,
  Stethoscope
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useMobileOptimization, getGPUSafeClasses } from '../../hooks/useMobileOptimization';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile = false }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile } = useAuth();
  const { shouldOptimize, animationClasses } = useMobileOptimization();
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavItemRef = useRef<HTMLAnchorElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Color mapping for dynamic gradients
  const getGradientColors = (colorString: string) => {
    const colorMap: Record<string, string> = {
      'from-blue-500 to-cyan-500': 'linear-gradient(to right, #3b82f6, #06b6d4)',
      'from-indigo-500 to-purple-500': 'linear-gradient(to right, #6366f1, #a855f7)',
      'from-purple-500 to-pink-500': 'linear-gradient(to right, #a855f7, #ec4899)',
      'from-violet-500 to-purple-500': 'linear-gradient(to right, #8b5cf6, #a855f7)',
      'from-amber-500 to-orange-500': 'linear-gradient(to right, #f59e0b, #f97316)',
      'from-red-500 to-rose-500': 'linear-gradient(to right, #ef4444, #f43f5e)',
      'from-rose-500 to-pink-500': 'linear-gradient(to right, #f43f5e, #ec4899)',
      'from-slate-500 to-gray-500': 'linear-gradient(to right, #64748b, #6b7280)',
    };
    return colorMap[colorString] || 'linear-gradient(to right, #64748b, #6b7280)';
  };

  const navigationItems = [
    {
      icon: MessageSquare,
      label: t('navigation.aiCoPilot', 'AI Assistant'),
      path: '/ai-copilot',
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25',
      category: 'primary'
    },
    {
      icon: Search,
      label: t('navigation.mediSearch', 'Medi Search & News'),
      path: '/search',
      color: 'from-indigo-500 to-purple-500',
      shadowColor: 'shadow-indigo-500/25',
      category: 'primary'
    },
    {
      icon: Mic,
      label: t('navigation.podcastStudio', 'Podcast Studio'),
      path: '/podcast-studio',
      color: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/25',
      category: 'primary'
    },
    {
      icon: Calculator,
      label: t('navigation.calculators', 'Calculators'),
      path: '/calculators',
      color: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/25',
      category: 'primary'
    },
    {
      icon: TestTube2,
      label: 'Blood Gas Analysis',
      path: '/abg-analysis',
      color: 'from-red-500 to-rose-500',
      shadowColor: 'shadow-red-500/25',
      category: 'primary'
    },
    {
      icon: Stethoscope,
      label: 'MediScribe',
      path: '/mediscribe',
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/25',
      category: 'primary'
    },
    {
      icon: BookOpen,
      label: t('navigation.knowledgeBase', 'Knowledge Base'),
      path: '/knowledge-base',
      color: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/25',
      category: 'secondary'
    },
    {
      icon: Database,
      label: 'Diseases',
      path: '/diseases',
      color: 'from-red-500 to-rose-500',
      shadowColor: 'shadow-red-500/25',
      category: 'secondary'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
      color: 'from-violet-500 to-purple-500',
      shadowColor: 'shadow-violet-500/25',
      category: 'secondary',
      adminOnly: true
    },
    {
      icon: User,
      label: t('navigation.profile', 'Profile'),
      path: '/profile',
      color: 'from-rose-500 to-pink-500',
      shadowColor: 'shadow-rose-500/25',
      category: 'utility'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Debounced hover handlers to reduce flickering
  const handleMouseEnter = (path: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(path);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 50);
  };

  // Swipe to close functionality for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !isOpen) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isOpen) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isMobile || !isOpen) return;
          const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
    
    // Close sidebar on left swipe (swipe to close)
    if (isLeftSwipe) {
      onClose();
    }
  };

  // Enhanced keyboard navigation and focus management
  useEffect(() => {
    if (isOpen && isMobile) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
          return;
        }

        if (event.key === 'Tab') {
          const sidebar = sidebarRef.current;
          if (!sidebar) return;

          const focusableElements = sidebar.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      
      if (closeButtonRef.current) {
        setTimeout(() => closeButtonRef.current?.focus(), 100);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isMobile, onClose]);

  // Announce sidebar state for screen readers
  useEffect(() => {
    if (isMobile) {
      const announcement = isOpen ? t('ui.openMenu') : t('ui.closeMenu');
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      
      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }
  }, [isOpen, isMobile, t]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Enhanced Sidebar with Glassmorphism and Modern Design */}
      <aside
        ref={sidebarRef}
        id="sidebar"
        role="navigation"
        aria-label={t('navigation.toggleMenu', 'Toggle menu')}
        aria-hidden={isMobile ? !isOpen : false}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`
          ${isCollapsed && !isMobile ? 'w-20' : isMobile ? 'w-80 max-w-[90vw]' : 'w-72'} 
          relative transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          sidebar-container group
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'fixed left-0 z-50' : 'relative z-40'}
          md:translate-x-0
          focus-within:outline-none
        `}
        style={{
          ...(isMobile ? {
            top: '64px',
            height: 'calc(100vh - 64px)',
            // Landscape mode support - reduce width on short screens
            width: window.innerHeight < 500 ? 'min(280px, 85vw)' : undefined
          } : {
            height: 'calc(100vh - 64px)'
          })
        }}
      >
        {/* Glassmorphism Background with Animated Gradient */}
        <div className={`
          absolute inset-0 
          ${getGPUSafeClasses(
            'bg-gradient-to-br from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-xl backdrop-saturate-150',
            animationClasses.gradients,
            shouldOptimize
          )}
          border-r border-white/20 dark:border-gray-700/50
          ${shouldOptimize ? 'shadow-lg' : 'shadow-2xl shadow-black/5 dark:shadow-black/20'}
          transition-all duration-700
        `}>
          {/* Subtle gradient overlay - desktop only */}
          {!shouldOptimize && (
            <div className={`
              absolute inset-0 opacity-30
              bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10
              dark:from-blue-400/10 dark:via-purple-400/5 dark:to-cyan-400/10
              transition-opacity duration-500
            `} />
          )}
          
          {/* Noise texture for premium feel - desktop only */}
          {!shouldOptimize && (
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjEiIHJlc3VsdD0ibm9pc2UiLz48ZmVDb21wb3NpdGUgaW49Im5vaXNlIiBpbjI9IlNvdXJjZUdyYXBoaWMiIG9wZXJhdG9yPSJtdWx0aXBseSIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjI1Ii8+PC9zdmc+')] bg-repeat" />
          )}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Enhanced Header - Simplified without logo duplication */}
          <div className={`
            flex items-center justify-between pt-6 pb-4 px-4 border-b border-white/10 dark:border-gray-700/30
            ${isCollapsed && !isMobile ? 'px-2' : 'px-6'}
            transition-all duration-300
          `}>
            {/* User Profile Summary - Compressed on mobile landscape */}
            <div className={`
              flex items-center transition-all duration-300
              ${isCollapsed && !isMobile ? 'justify-center w-full' : 'space-x-3'}
              ${isMobile && window.innerHeight < 500 ? 'space-x-2' : 'space-x-3'}
            `}>
              <div className="relative flex-shrink-0">
                <div className={`
                  relative bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg overflow-hidden 
                  ${isMobile && window.innerHeight < 500 ? 'w-8 h-8' : 'w-10 h-10'}
                  transition-shadow duration-300
                `}>
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className={`${isMobile && window.innerHeight < 500 ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                    </div>
                  )}
                </div>
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex flex-col min-w-0 flex-1">
                  <h2 className={`
                    font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent truncate tracking-tight
                    ${isMobile && window.innerHeight < 500 ? 'text-sm' : 'text-lg'}
                  `}
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                    {profile?.full_name || 'Professional'}
                  </h2>
                  <p className={`
                    text-gray-500 dark:text-gray-400 font-medium truncate tracking-wide
                    ${isMobile && window.innerHeight < 500 ? 'text-xs' : 'text-xs'}
                  `}
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500, letterSpacing: '0.025em' }}>
                    {profile?.medical_specialty || 'Medical Professional'}
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-2">
              {/* Desktop Collapse Toggle */}
              {!isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`
                    p-2 rounded-lg transition-all duration-300
                    hover:bg-white/20 dark:hover:bg-gray-700/30
                    active:scale-95 focus-enhanced
                    ${isCollapsed ? 'rotate-180' : ''}
                  `}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
              
              {/* Mobile Close Button */}
              {isMobile && (
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30 active:scale-95 focus-enhanced"
                   aria-label={t('ui.closeMenu', 'Close menu')}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* Compact Colorful Navigation Design */}
          <nav 
            className={`
              flex-1 py-3 overflow-y-auto scrollbar-hide
              ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}
              transition-all duration-300
            `}
            role="list"
            aria-label={t('navigation.toggleMenu', 'Toggle menu')}
          >
            {/* Single Column Layout - All Items */}
            <div className="space-y-1.5">
              {navigationItems
                .filter(item => !item.adminOnly || (profile?.medical_specialty === 'admin'))
                .map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isHovered = hoveredItem === item.path;
                
                return (
                  <Link
                    key={item.path}
                    ref={index === 0 ? firstNavItemRef : undefined}
                    to={item.path}
                    onClick={onClose}
                    onMouseEnter={() => handleMouseEnter(item.path)}
                    onMouseLeave={handleMouseLeave}
                    role="listitem"
                    aria-current={active ? 'page' : undefined}
                    className={`
                      group relative block transition-all duration-300 sidebar-nav-item
                      ${isCollapsed && !isMobile ? 'mx-auto' : ''}
                      min-h-[44px] touch-target-md
                    `}
                  >
                    {/* Subtle to Colorful Card Design */}
                    <div 
                      className={`
                        relative overflow-hidden rounded-xl transition-all duration-300 ease-in-out
                        ${isCollapsed && !isMobile ? 'w-12 h-12 mx-auto' : 'w-full h-11'}
                        ${active 
                          ? `bg-gradient-to-r ${item.color} shadow-lg ${item.shadowColor}`
                          : `bg-gray-100/80 dark:bg-gray-800/80 hover:shadow-md border border-gray-300/60 dark:border-gray-600/60 hover:border-white/20 dark:hover:border-white/10`
                        }
                        ${shouldOptimize ? '' : 'backdrop-blur-sm'}
                        will-change-auto
                      `}
                      style={!active && isHovered ? {
                        background: getGradientColors(item.color),
                        transition: 'all 300ms ease-in-out',
                      } : {
                        transition: 'all 300ms ease-in-out',
                      }}
                    >
                      
                      {/* Background Pattern */}
                      <div className={`
                        absolute inset-0 transition-all duration-300
                        ${active ? 'opacity-20' : 'opacity-0 group-hover:opacity-15'}
                      `}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10" />
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white/40 rounded-full" />
                        <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white/30 rounded-full" />
                      </div>
                      
                      {/* Content Container */}
                      <div className={`
                        relative z-10 h-full flex items-center
                        ${isCollapsed && !isMobile ? 'justify-center' : 'px-3'}
                      `}>
                        
                        {/* Icon */}
                        <div className="flex items-center justify-center flex-shrink-0">
                          <Icon className={`
                            transition-all duration-300 ease-in-out
                            ${isCollapsed && !isMobile ? 'w-6 h-6' : 'w-5 h-5'}
                            ${active 
                              ? 'text-white drop-shadow-sm' 
                              : isHovered
                                ? 'text-white drop-shadow-sm'
                                : 'text-black dark:text-gray-200'
                            }
                            ${isHovered && !active ? 'scale-105' : 'scale-100'}
                          `} />
                        </div>
                        
                        {/* Label */}
                        {(!isCollapsed || isMobile) && (
                          <div className="flex-1 ml-3 min-w-0">
                            <h3 className={`
                              font-semibold text-sm transition-all duration-300 truncate tracking-tight
                              ${active 
                                ? 'text-white drop-shadow-sm' 
                                : isHovered
                                  ? 'text-white drop-shadow-sm'
                                  : 'text-black dark:text-gray-200'
                              }
                            `}
                            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                              {item.label}
                            </h3>
                          </div>
                        )}
                      </div>
                      
                      {/* Active State Indicator */}
                      {active && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white/80 rounded-r-full shadow-sm" />
                      )}
                      
                      {/* Subtle Hover Highlight */}
                      {isHovered && !active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-80 transition-opacity duration-300" />
                      )}
                    </div>

                    {/* Collapsed State Tooltip */}
                    {isCollapsed && !isMobile && (
                      <div className={`
                        absolute left-full ml-4 px-3 py-2 rounded-lg
                        bg-gray-900/95 text-white text-sm font-medium whitespace-nowrap
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-all duration-300 transform translate-x-2 group-hover:translate-x-0
                        z-50 shadow-xl border border-gray-700/50
                      `}>
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Compact Footer */}
          <div className={`
            p-3 border-t border-white/10 dark:border-gray-700/30 safe-bottom
            ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}
            transition-all duration-300
          `}>
            {(!isCollapsed || isMobile) ? (
              <div className="space-y-2">
                {/* Compact Activity Indicator */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 500 }}>
                      {t('profile.systemStatus', 'System Status')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                      {t('profile.online', 'Online')}
                    </span>
                  </div>
                </div>
                
                {/* Compact Version Info */}
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                    {t('profile.mediMindExpert', 'MediMind Expert v2.0')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                    {t('profile.medicalAiAssistant', 'Medical AI Assistant')}
                  </div>
                </div>
              </div>
            ) : (
              // Collapsed footer
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}; 