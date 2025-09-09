import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Activity,
  User,
  Database,
  Mic,
  Mic2,
  Search,
  BarChart3,
  TestTube2,
  Stethoscope,
  FileText
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

  // PROFESSIONAL 3-TIER IMPORTANCE-BASED SEGMENTATION
  const navigationItems = {
    // TIER 1: CORE AI FEATURES - Most Important & Frequently Used
    coreAI: {
      title: t('navigation.sections.coreAI', 'AI Core Features'),
      subtitle: t('navigation.sections.coreAIDesc', 'Essential AI-powered medical tools'),
      priority: 1,
      items: [
        {
          icon: MessageSquare,
          label: t('navigation.aiCoPilot', 'AI Co-Pilot'),
          subtitle: 'Medical consultation AI',
          path: '/ai-copilot',
          color: 'from-blue-600 to-indigo-600',
          shadowColor: 'shadow-blue-500/30',
          importance: 'critical'
        },
        {
          icon: Mic2,
          label: 'MediScribe',
          subtitle: 'Voice transcription for medical notes',
          path: '/mediscribe',
          color: 'from-blue-600 to-cyan-600',
          shadowColor: 'shadow-blue-500/30',
          importance: 'critical'
        }
      ]
    },

    // TIER 2: CLINICAL TOOLS - Medical Analysis & Calculation Tools
    clinicalTools: {
      title: t('navigation.sections.clinicalTools', 'Clinical Tools'),
      subtitle: t('navigation.sections.clinicalToolsDesc', 'Professional medical analysis tools'),
      priority: 2,
      items: [
        {
          icon: Calculator,
          label: t('navigation.calculators', 'Medical Calculators'),
          subtitle: 'Clinical risk assessment tools',
          path: '/calculators',
          color: 'from-purple-600 to-violet-600',
          shadowColor: 'shadow-purple-500/30',
          importance: 'high'
        },
        {
          icon: TestTube2,
          label: 'Blood Gas Analysis',
          subtitle: 'ABG interpretation & analysis',
          path: '/abg-analysis',
          color: 'from-red-600 to-rose-600',
          shadowColor: 'shadow-red-500/30',
          importance: 'high'
        },
        {
          icon: Search,
          label: t('navigation.mediSearch', 'MediSearch'),
          subtitle: 'Medical literature & news',
          path: '/search',
          color: 'from-indigo-600 to-blue-600',
          shadowColor: 'shadow-indigo-500/30',
          importance: 'high'
        },
        {
          icon: Mic,
          label: t('navigation.podcastStudio', 'Podcast Studio'),
          subtitle: 'AI-powered medical podcasts',
          path: '/podcast-studio',
          color: 'from-pink-600 to-rose-600',
          shadowColor: 'shadow-pink-500/30',
          importance: 'medium'
        }
      ]
    },

    // TIER 3: KNOWLEDGE & PROFILE - Information & Personal Management
    knowledge: {
      title: t('navigation.sections.knowledge', 'Knowledge & Profile'),
      subtitle: t('navigation.sections.knowledgeDesc', 'Learning resources & account management'),
      priority: 3,
      items: [
        {
          icon: BookOpen,
          label: t('navigation.knowledgeBase', 'Knowledge Base'),
          subtitle: 'Medical reference library',
          path: '/knowledge-base',
          color: 'from-amber-600 to-orange-600',
          shadowColor: 'shadow-amber-500/30',
          importance: 'medium'
        },
        {
          icon: Database,
          label: 'Disease Library',
          subtitle: 'Comprehensive disease database',
          path: '/diseases',
          color: 'from-teal-600 to-cyan-600',
          shadowColor: 'shadow-teal-500/30',
          importance: 'medium'
        },
        {
          icon: User,
          label: t('navigation.profile', 'Profile & Settings'),
          subtitle: 'Account preferences',
          path: '/profile',
          color: 'from-slate-600 to-gray-600',
          shadowColor: 'shadow-slate-500/30',
          importance: 'low'
        },
        {
          icon: BarChart3,
          label: 'Analytics Dashboard',
          subtitle: 'Usage insights & metrics',
          path: '/analytics',
          color: 'from-violet-600 to-purple-600',
          shadowColor: 'shadow-violet-500/30',
          importance: 'low',
          adminOnly: true
        }
      ]
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Optimized hover handlers for instant navigation
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
    // Instant response - no delay
    setHoveredItem(null);
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
          relative transform transition-transform duration-200
          sidebar-container group
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'fixed inset-y-0 left-0 z-[9999]' : 'relative z-40'}
          md:translate-x-0
          focus-within:outline-none
        `}
        style={{
          ...(isMobile ? {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            height: '100vh',
            width: window.innerHeight < 500 ? 'min(280px, 85vw)' : '320px',
            maxWidth: '90vw',
            zIndex: 9999,
            paddingTop: '0',
            marginTop: '0',
          } : {
            height: 'calc(100vh - 64px)'
          })
        }}
      >
        {/* Solid Background - Always Opaque */}
        <div className={`
          absolute inset-0 
          ${shouldOptimize 
            ? 'bg-white dark:bg-gray-900' 
            : 'bg-white dark:bg-gray-900 backdrop-blur-sm'
          }
          border-r border-gray-200 dark:border-gray-700
          shadow-lg
        `}>
          {/* Minimal overlay for visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-900/20" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Enhanced Header - Simplified without logo duplication */}
          <div className={`
            flex items-center justify-between pt-6 pb-4 px-4 border-b border-gray-200/50 dark:border-gray-700/50
            ${isCollapsed && !isMobile ? 'px-2' : 'px-6'}
            transition-all duration-200
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
                  className="p-2 rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30 active:scale-95 focus-enhanced medical-touch-target medical-mobile-touch-md"
                   aria-label={t('ui.closeMenu', 'Close menu')}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* PROFESSIONAL TIERED NAVIGATION SYSTEM */}
          <nav 
            className={`
              flex-1 py-2 overflow-y-auto scrollbar-hide
              ${isCollapsed && !isMobile ? 'px-2' : 'px-3'}
              transition-all duration-300
            `}
            role="list"
            aria-label={t('navigation.toggleMenu', 'Toggle menu')}
          >
            {/* 3-TIER SEGMENTED NAVIGATION */}
            <div className="space-y-6">
              {Object.entries(navigationItems).map(([sectionKey, section], sectionIndex) => (
                <div key={sectionKey} className="space-y-3">
                  {/* SECTION HEADER - Only show when not collapsed */}
                  {(!isCollapsed || isMobile) && (
                    <div className="px-3 py-2">
                      <div className={`
                        flex items-center space-x-3 mb-2 
                        ${section.priority === 1 ? 'border-l-4 border-blue-500 pl-3' : ''}
                        ${section.priority === 2 ? 'border-l-4 border-purple-500 pl-3' : ''}
                        ${section.priority === 3 ? 'border-l-4 border-amber-500 pl-3' : ''}
                      `}>
                        <div className={`
                          w-2 h-2 rounded-full
                          ${section.priority === 1 ? 'bg-blue-500 shadow-lg shadow-blue-500/40' : ''}
                          ${section.priority === 2 ? 'bg-purple-500 shadow-lg shadow-purple-500/40' : ''}
                          ${section.priority === 3 ? 'bg-amber-500 shadow-lg shadow-amber-500/40' : ''}
                        `} />
                        <h4 className={`
                          font-bold text-xs uppercase tracking-wider
                          ${section.priority === 1 ? 'text-blue-700 dark:text-blue-300' : ''}
                          ${section.priority === 2 ? 'text-purple-700 dark:text-purple-300' : ''}
                          ${section.priority === 3 ? 'text-amber-700 dark:text-amber-300' : ''}
                        `}
                        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 700 }}>
                          {section.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed ml-6"
                         style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                        {section.subtitle}
                      </p>
                    </div>
                  )}

                  {/* SECTION ITEMS */}
                  <div className={`
                    space-y-1.5
                    ${section.priority === 1 ? 'mb-4' : ''}
                    ${section.priority === 2 ? 'mb-3' : ''}
                  `}>
                    {section.items
                      .filter(item => !item.adminOnly || (profile?.medical_specialty === 'admin'))
                      .map((item, index) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const isHovered = hoveredItem === item.path;
                      const globalIndex = sectionIndex * 10 + index; // Ensure unique refs
                      
                      return (
                        <Link
                          key={item.path}
                          ref={sectionIndex === 0 && index === 0 ? firstNavItemRef : undefined}
                          to={item.path}
                          onClick={onClose}
                          onMouseEnter={() => handleMouseEnter(item.path)}
                          onMouseLeave={handleMouseLeave}
                          role="listitem"
                          aria-current={active ? 'page' : undefined}
                          className={`
                            group relative block transition-colors duration-150 sidebar-nav-item
                            ${isCollapsed && !isMobile ? 'mx-auto' : ''}
                            min-h-[44px] touch-target-md
                            hover:bg-gray-50 dark:hover:bg-gray-800/50
                            active:bg-gray-100 dark:active:bg-gray-800
                            ${section.priority === 1 ? 'mb-2' : 'mb-1.5'}
                          `}
                          style={{ 
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation' 
                          }}
                        >
                          {/* PREMIUM NAVIGATION CARD WITH TIER-BASED STYLING */}
                          <div 
                            className={`
                              relative overflow-hidden rounded-xl transition-all duration-200 ease-out
                              ${isCollapsed && !isMobile ? 'w-12 h-12 mx-auto' : 'w-full'}
                              ${section.priority === 1 ? 'h-12' : section.priority === 2 ? 'h-11' : 'h-10'}
                              ${active 
                                ? `bg-gradient-to-r ${item.color} shadow-lg ${item.shadowColor}`
                                : `bg-gray-100/60 dark:bg-gray-800/60 border
                                   ${section.priority === 1 ? 'border-blue-300/40 dark:border-blue-600/40' : ''}
                                   ${section.priority === 2 ? 'border-purple-300/40 dark:border-purple-600/40' : ''}
                                   ${section.priority === 3 ? 'border-amber-300/40 dark:border-amber-600/40' : ''}
                                   group-hover:shadow-md group-hover:border-white/30 dark:group-hover:border-white/20`
                              }
                              ${section.priority === 1 ? 'transform group-hover:scale-[1.03] group-active:scale-[0.97]' : 
                                section.priority === 2 ? 'transform group-hover:scale-[1.02] group-active:scale-[0.98]' :
                                'transform group-hover:scale-[1.015] group-active:scale-[0.985]'}
                            `}
                            style={!active && isHovered ? {
                              background: getGradientColors(item.color),
                              boxShadow: section.priority === 1 ? '0 6px 16px rgba(0, 0, 0, 0.18)' : 
                                        section.priority === 2 ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 
                                        '0 2px 8px rgba(0, 0, 0, 0.12)',
                              transition: 'all 200ms ease-out',
                            } : {
                              transition: 'all 200ms ease-out',
                            }}
                          >
                            
                            {/* TIER-SPECIFIC BACKGROUND EFFECTS */}
                            <div className="absolute inset-0">
                              {/* Active state overlay with tier intensity */}
                              {active && (
                                <div className={`
                                  absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent
                                  ${section.priority === 1 ? 'opacity-90' : section.priority === 2 ? 'opacity-80' : 'opacity-70'}
                                `} />
                              )}
                              
                              {/* Hover state overlay */}
                              {isHovered && !active && (
                                <div className={`
                                  absolute inset-0 bg-gradient-to-br from-white/15 via-white/8 to-transparent transition-opacity duration-200
                                  ${section.priority === 1 ? 'opacity-90' : section.priority === 2 ? 'opacity-85' : 'opacity-80'}
                                `} />
                              )}
                              
                              {/* Tier-specific sparkle effects for active state */}
                              {active && section.priority === 1 && (
                                <>
                                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
                                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-300" />
                                  <div className="absolute top-1/2 right-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse delay-500" />
                                </>
                              )}
                              
                              {active && section.priority === 2 && (
                                <>
                                  <div className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                                  <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-300" />
                                </>
                              )}
                            </div>
                            
                            {/* CONTENT CONTAINER */}
                            <div className={`
                              relative z-10 h-full flex items-center
                              ${isCollapsed && !isMobile ? 'justify-center' : 'px-3'}
                            `}>
                              
                              {/* ICON WITH TIER-BASED SIZING */}
                              <div className="flex items-center justify-center flex-shrink-0">
                                <Icon className={`
                                  transition-all duration-200 ease-out
                                  ${isCollapsed && !isMobile 
                                    ? section.priority === 1 ? 'w-7 h-7' : section.priority === 2 ? 'w-6 h-6' : 'w-5 h-5'
                                    : section.priority === 1 ? 'w-6 h-6' : section.priority === 2 ? 'w-5 h-5' : 'w-4.5 h-4.5'
                                  }
                                  ${active 
                                    ? 'text-white drop-shadow-sm transform scale-105' 
                                    : isHovered
                                      ? 'text-white drop-shadow-sm transform scale-105'
                                      : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 group-hover:scale-105'
                                  }
                                `} />
                              </div>
                              
                              {/* LABEL & SUBTITLE */}
                              {(!isCollapsed || isMobile) && (
                                <div className="flex-1 ml-3 min-w-0">
                                  <h3 className={`
                                    font-semibold transition-all duration-200 ease-out truncate tracking-tight
                                    ${section.priority === 1 ? 'text-sm' : section.priority === 2 ? 'text-sm' : 'text-xs'}
                                    ${active 
                                      ? 'text-white drop-shadow-sm' 
                                      : isHovered
                                        ? 'text-white drop-shadow-sm'
                                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                                    }
                                  `}
                                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600 }}>
                                    {item.label}
                                  </h3>
                                  {/* Subtitle only for priority 1 items */}
                                  {section.priority === 1 && item.subtitle && (
                                    <p className={`
                                      text-xs mt-0.5 truncate transition-all duration-200 ease-out
                                      ${active 
                                        ? 'text-white/80' 
                                        : isHovered
                                          ? 'text-white/80'
                                          : 'text-gray-500 dark:text-gray-400'
                                      }
                                    `}
                                    style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 400 }}>
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* TIER-SPECIFIC ACTIVE STATE INDICATOR */}
                            {active && (
                              <div className={`
                                absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/95 rounded-r-full shadow-lg shadow-white/40 transition-all duration-200
                                ${section.priority === 1 ? 'w-2 h-10' : section.priority === 2 ? 'w-1.5 h-8' : 'w-1 h-6'}
                              `} />
                            )}
                            
                            {/* Hover state indicator */}
                            {isHovered && !active && (
                              <div className={`
                                absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-r-full transition-all duration-200
                                ${section.priority === 1 ? 'w-1.5 h-8' : section.priority === 2 ? 'w-1 h-6' : 'w-0.5 h-4'}
                              `} />
                            )}
                          </div>

                          {/* ENHANCED TOOLTIP WITH TIER INFO */}
                          {isCollapsed && !isMobile && (
                            <div className={`
                              absolute left-full ml-4 px-3 py-2 rounded-lg
                              bg-gray-900/95 text-white font-medium whitespace-nowrap
                              opacity-0 group-hover:opacity-100 pointer-events-none
                              transition-all duration-200 transform translate-x-2 group-hover:translate-x-0
                              z-50 shadow-xl border border-gray-700/50 backdrop-blur-sm
                              ${section.priority === 1 ? 'text-sm' : 'text-xs'}
                            `}>
                              <div>{item.label}</div>
                              {item.subtitle && section.priority === 1 && (
                                <div className="text-xs text-gray-300 mt-1">{item.subtitle}</div>
                              )}
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* SECTION DIVIDER - Only between sections when not collapsed */}
                  {(!isCollapsed || isMobile) && sectionIndex < Object.keys(navigationItems).length - 1 && (
                    <div className="px-3">
                      <div className={`
                        h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600
                        ${section.priority === 1 ? 'opacity-60' : section.priority === 2 ? 'opacity-40' : 'opacity-30'}
                      `} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Compact Footer */}
          <div className={`
            p-3 border-t border-gray-200/50 dark:border-gray-700/50 safe-bottom
            ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}
            transition-all duration-200
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