import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Calculator, BookOpen, User, Grid3X3, Search } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';

interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  // Don't show if user is not authenticated
  if (!user) return null;

  const navigationItems = [
    {
      icon: MessageSquare,
      label: 'AI Chat',
      path: '/ai-copilot',
      shortLabel: 'Chat'
    },
    {
      icon: Search,
      label: 'Search',
      path: '/search',
      shortLabel: 'Search'
    },
    {
      icon: Calculator,
      label: 'Calculators',
      path: '/calculators',
      shortLabel: 'Calc'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      shortLabel: 'Profile'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-40 bg-[var(--component-card)]/95 dark:bg-[var(--background-dark)]/95 backdrop-blur-sm
        border-t border-[var(--glass-border-light)] dark:border-[var(--border-strong)] shadow-lg safe-bottom
        md:hidden ${className}
      `}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-20 px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center space-y-1.5 px-3 py-3 rounded-xl
                transition-all duration-200 relative group min-w-[48px] min-h-[48px] flex-1
                ${active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] hover:text-primary dark:hover:text-primary hover:bg-[var(--component-surface-secondary)] dark:hover:bg-[var(--background)]'
                }
                focus-enhanced active:scale-95 active:bg-primary/20
                border border-transparent hover:border-[var(--glass-border-light)] dark:hover:border-[var(--border-strong)]
                ${active ? 'border-primary/20' : ''}
              `}
              style={{
                minTouchTarget: '48px',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label={`${item.label} ${active ? '(current)' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              
              {/* Icon with active state */}
              <div className={`
                relative transition-all duration-200 flex items-center justify-center
                ${active ? 'transform scale-110' : 'group-hover:scale-105'}
              `}>
                <Icon className={`
                  w-6 h-6 transition-all duration-200
                  ${active ? 'text-primary' : 'text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)]'}
                `} />
                
                {/* Active background glow - removed as we now have bg on container */}
              </div>
              
              {/* Label */}
              <span className={`
                text-xs font-medium truncate transition-all duration-200 max-w-full
                ${active 
                  ? 'text-primary font-semibold' 
                  : 'text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] group-hover:text-[var(--foreground)] dark:group-hover:text-[var(--foreground)]'
                }
              `}>
                {item.shortLabel}
              </span>
              
              {/* Haptic feedback indicator */}
              <div className="sr-only" aria-hidden="true">
                {active ? 'Currently selected' : 'Navigate to ' + item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}; 