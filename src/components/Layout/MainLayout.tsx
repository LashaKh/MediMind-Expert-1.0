import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useAuth } from '../../stores/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { useTour } from '../../stores/useAppStore';
import { PremiumTour } from '../Help/PremiumTour';
import { useFontGuard } from '../../hooks/useFontGuard';
import { PullToRefreshContainer } from '../ui/PullToRefreshContainer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { isTourOpen, tourType, closeTour } = useTour();
  const location = useLocation();
  
  // ACTIVATE FONT GUARDIAN IN MAIN LAYOUT
  useFontGuard();
  
  // Check if we're on the onboarding page
  const isOnboardingPage = location.pathname === '/onboarding';
  
  // Check if we're on the AI Copilot page
  const isAICopilotPage = location.pathname === '/ai-copilot';
  
  // Check if we're on the MediScribe page - hide bottom navigation for full screen transcription
  const isMediScribePage = location.pathname === '/mediscribe';
  
  // Check if we're on pages that need normal scrolling (disable pull-to-refresh)
  const isScrollablePage = location.pathname.includes('/knowledge-base') || 
                          location.pathname.includes('/disease') || 
                          location.pathname.includes('/calculator') ||
                          location.pathname.includes('/medical-news') ||
                          isMediScribePage;
  
  // Initialize theme - this will force light mode
  useTheme();

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.getElementById('sidebar');
        const target = event.target as Node;
        
        if (sidebar && !sidebar.contains(target)) {
          setIsSidebarOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSidebarOpen, isMobile]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Handle pull-to-refresh with route-specific logic
  const handleRefresh = useCallback(async () => {
    // Add slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Route-specific refresh logic
    if (isAICopilotPage) {
      // For AI Copilot, we could refresh the conversation or clear it
      window.location.reload();
    } else {
      // For other pages, simple page reload
      window.location.reload();
    }
  }, [isAICopilotPage]);

  return (
    <div 
      className="min-h-screen flex flex-col bg-background safe-area-inset layout-container"
      style={{ 
        backgroundImage: 'none !important'
      }}
    >
      {/* Header with safe area support */}
      <Header onMenuToggle={handleMenuToggle} isOnboardingPage={isOnboardingPage} />
      
      <div className={`flex flex-1 layout-container ${isMobile ? 'pt-0' : 'pt-20'}`}>
        {/* Sidebar - only show for authenticated users and not on onboarding */}
        {user && !isOnboardingPage && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={handleSidebarClose}
            isMobile={isMobile}
          />
        )}
        
        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && user && !isOnboardingPage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}
        
        {/* Main content area - Fixed positioning without overlap */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out 
            overflow-hidden bg-background
            ${user && isMobile && isSidebarOpen ? 'pointer-events-none' : ''}
            ${''}
          `}
          style={{
            height: isMobile ? '100vh' : 'calc(100vh - 80px)', // Full height on mobile, minus header on desktop
            minHeight: isMobile ? '100vh' : 'calc(100vh - 80px)'
          }}
        >
          {/* Complete gap elimination - zero margin/padding wrapper */}
          <PullToRefreshContainer
            onRefresh={handleRefresh}
            enabled={!isOnboardingPage && isMobile} // Enable on mobile except onboarding
            className="h-full w-full"
          >
            <div className="h-full w-full m-0 p-0 border-0 bg-transparent overflow-auto">
              {children}
            </div>
          </PullToRefreshContainer>
        </main>
      </div>
      
      {/* Bottom Navigation for mobile - DISABLED 
      {user && !isOnboardingPage && !isMediScribePage && <BottomNavigation />} */}
      
      {/* Footer - completely removed */}
      
      {/* Bottom safe area spacer */}
      <div className="safe-bottom bg-background" />

      {/* Premium Guided Tour - persists across route changes, hide on onboarding */}
      {!isOnboardingPage && (
        <PremiumTour
          isOpen={isTourOpen}
          onClose={closeTour}
          tourType={tourType as any}
          autoStart={true}
          onComplete={() => {

          }}
        />
      )}
    </div>
  );
};