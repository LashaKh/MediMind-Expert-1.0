import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useSpecialty, getSpecialtyRoute, MedicalSpecialty } from '../../stores/useAppStore';

interface SpecialtyRouterProps {
  children: React.ReactNode;
}

export const SpecialtyRouter: React.FC<SpecialtyRouterProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const { specialty, isSpecialtyVerified, isLoading } = useSpecialty();
  const navigate = useNavigate();
  const location = useLocation();

  // Log on every render

  // Store current path in sessionStorage to preserve it across refreshes
  useEffect(() => {
    if (location.pathname !== '/') {
      sessionStorage.setItem('medimind_intended_route', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {

    // Early return if still loading or no user
    if (!user || isLoading) {
      return;
    }

    // Check if we have a stored intended route (from before refresh)
    const intendedRoute = sessionStorage.getItem('medimind_intended_route');
    const currentPath = location.pathname;
    
    // If we're on root path but have an intended route, restore it
    if (currentPath === '/' && intendedRoute && intendedRoute !== '/') {
      sessionStorage.removeItem('medimind_intended_route');
      navigate(intendedRoute, { replace: true });
      return;
    }
    
    // Case 1: User is on root path "/" - redirect to specialty workspace
    if (currentPath === '/' && specialty && isSpecialtyVerified) {
      const specialtyRoute = getSpecialtyRoute(specialty);
      navigate(specialtyRoute, { replace: true });
      return;
    }
    
    // Case 2: User is coming from login and needs to be redirected
    const isComingFromLogin = location.state?.from?.pathname === '/signin' || 
                              location.state?.from?.pathname === '/signup';
    
    if (isComingFromLogin && specialty && isSpecialtyVerified) {
      const specialtyRoute = getSpecialtyRoute(specialty);
      navigate(specialtyRoute, { replace: true });
      return;
    }
    
    // Case 3: User is trying to access wrong specialty workspace
    if (specialty && isSpecialtyVerified) {
      const isWrongCardiologyRoute = specialty !== MedicalSpecialty.CARDIOLOGY && 
        (currentPath === '/cardiology' || currentPath === '/workspace/cardiology');
      
      const isWrongObGynRoute = specialty !== MedicalSpecialty.OBGYN && 
        (currentPath === '/ob-gyn' || currentPath === '/workspace/obgyn');
      
      if (isWrongCardiologyRoute || isWrongObGynRoute) {
        const correctRoute = getSpecialtyRoute(specialty);
        navigate(correctRoute, { 
          replace: true,
          state: { 
            redirectReason: 'specialty_mismatch',
            from: location.pathname 
          }
        });
      }
    }

    // For all other cases (diseases, calculators, etc.), don't redirect
  }, [user, specialty, isSpecialtyVerified, isLoading, location, navigate]);

  return <>{children}</>;
};

// Hook for programmatic navigation to specialty routes
export const useSpecialtyNavigation = () => {
  const { specialty } = useSpecialty();
  const navigate = useNavigate();

  const navigateToWorkspace = () => {
    if (specialty) {
      const route = getSpecialtyRoute(specialty);
      navigate(route);
    }
  };

  const navigateToSpecialtyRoute = (route: string) => {
    if (specialty) {
      // Ensure route is allowed for current specialty
      const allowedRoutes = getSpecialtyAllowedRoutes(specialty);
      if (allowedRoutes.includes(route)) {
        navigate(route);
      } else {

        navigateToWorkspace();
      }
    }
  };

  return {
    navigateToWorkspace,
    navigateToSpecialtyRoute,
    currentSpecialty: specialty,
  };
};

// Helper function to get allowed routes for a specialty
const getSpecialtyAllowedRoutes = (specialty: MedicalSpecialty): string[] => {
  const commonRoutes = [
    '/ai-copilot',
    '/podcast-studio',
    '/calculators',

    '/knowledge-base',
    '/diseases',
    '/settings',
    '/profile',
    '/help'
  ];

  switch (specialty) {
    case MedicalSpecialty.CARDIOLOGY:
      return [
        '/cardiology',
        '/workspace/cardiology',
        ...commonRoutes
      ];
    case MedicalSpecialty.OBGYN:
      return [
        '/ob-gyn',
        '/workspace/obgyn',
        '/workspace/ob-gyn',
        ...commonRoutes
      ];
    default:
      return commonRoutes;
  }
}; 