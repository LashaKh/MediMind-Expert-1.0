import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useAuth } from '../../stores/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { useTour } from '../../stores/useAppStore';
import { PremiumTour } from '../Help/PremiumTour';
import { useFontGuard } from '../../hooks/useFontGuard';

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
  
  // Check if we're on the AI Copilot page - hide header on mobile for full screen chat
  const isAICopilotMobilePage = location.pathname === '/ai-copilot';
  
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

  return (
    <div 
      className={`min-h-screen flex flex-col ${isMediScribePage ? 'bg-white' : 'bg-background'} safe-area-inset layout-container`}
      style={{ 
        backgroundImage: 'none !important'
      }}
    >
      {/* Header with safe area support - Hidden on MediScribe and AI Copilot pages MOBILE ONLY */}
      {!((isMediScribePage || isAICopilotMobilePage) && isMobile) && (
        <Header onMenuToggle={handleMenuToggle} isOnboardingPage={isOnboardingPage} />
      )}
      
      <div className={`flex flex-1 layout-container ${
        (isMediScribePage || isAICopilotMobilePage) && isMobile
          ? 'pt-0' // No padding on MediScribe or AI Copilot page mobile since header is hidden
          : isMobile ? 'pt-16' : 'pt-20'
      }`}>
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
            className="fixed bg-black bg-opacity-50 z-30 transition-opacity duration-300"
            style={{
              top: '64px',
              left: '0',
              right: '0',
              bottom: '0'
            }}
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}
        
        {/* Main content area - Fixed positioning without overlap */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out 
            overflow-hidden ${(isMediScribePage || isAICopilotMobilePage) ? 'bg-white' : 'bg-background'}
            ${user && isMobile && isSidebarOpen ? 'pointer-events-none' : ''}
            ${''}
          `}
          style={{
            height: isMobile ? '100vh' : 'calc(100vh - 80px)', // Full height on mobile, minus header on desktop
            minHeight: isMobile ? '100vh' : 'calc(100vh - 80px)'
          }}
        >
          {/* Complete gap elimination - zero margin/padding wrapper */}
          <div className="h-full w-full m-0 p-0 border-0 bg-transparent overflow-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Navigation for mobile - DISABLED 
      {user && !isOnboardingPage && !isMediScribePage && <BottomNavigation />} */}
      
      {/* Footer - completely removed */}
      
      {/* Bottom safe area spacer */}
      <div className={`safe-bottom ${(isMediScribePage || isAICopilotMobilePage) ? 'bg-white' : 'bg-background'}`} />

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