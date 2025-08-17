import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSpecialty, useAuth, MedicalSpecialty, getSpecialtyRoute } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';

// Define which routes require which specialties
const SPECIALTY_ROUTE_MAP: Record<string, MedicalSpecialty[]> = {
  '/cardiology': [MedicalSpecialty.CARDIOLOGY],
  '/workspace/cardiology': [MedicalSpecialty.CARDIOLOGY],
  '/ob-gyn': [MedicalSpecialty.OBGYN],
  '/workspace/obgyn': [MedicalSpecialty.OBGYN],
  '/workspace/ob-gyn': [MedicalSpecialty.OBGYN],
};

interface SpecialtyGuardProps {
  children: React.ReactNode;
  requiredSpecialty?: MedicalSpecialty;
  allowedSpecialties?: MedicalSpecialty[];
}

export const SpecialtyGuard: React.FC<SpecialtyGuardProps> = ({ 
  children, 
  requiredSpecialty,
  allowedSpecialties 
}) => {
  const { specialty, isLoading, isSpecialtyVerified } = useSpecialty();
  const location = useLocation();
  const { profile } = useAuth();
  const { t } = useTranslation();

  // Show loading spinner while specialty is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {t('loading.verifying_specialty')}
        </span>
      </div>
    );
  }

  // If no specialty is verified, redirect to onboarding only if we're not already there
  if ((!isSpecialtyVerified || !specialty) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If we're on onboarding page but have specialty, allow through
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // Check if current route requires specific specialty
  const currentPath = location.pathname;
  const routeSpecialties = SPECIALTY_ROUTE_MAP[currentPath];
  
  let allowedForRoute: MedicalSpecialty[] = [];
  
  if (requiredSpecialty) {
    allowedForRoute = [requiredSpecialty];
  } else if (allowedSpecialties) {
    allowedForRoute = allowedSpecialties;
  } else if (routeSpecialties) {
    allowedForRoute = routeSpecialties;
  }

  // If route has specialty restrictions, check access
  if (allowedForRoute.length > 0) {
    const hasAccess = allowedForRoute.includes(specialty);
    
    if (!hasAccess) {
      // Redirect to user's appropriate workspace
      const userWorkspaceRoute = getSpecialtyRoute(specialty);
      return <Navigate to={userWorkspaceRoute} state={{ from: location }} replace />;
    }
  }

  // User has access, render children
  return <>{children}</>;
};

// Higher-order component for easy route wrapping
export const withSpecialtyGuard = (
  Component: React.ComponentType<any>,
  options?: {
    requiredSpecialty?: MedicalSpecialty;
    allowedSpecialties?: MedicalSpecialty[];
  }
) => {
  return (props: any) => (
    <SpecialtyGuard {...options}>
      <Component {...props} />
    </SpecialtyGuard>
  );
}; 