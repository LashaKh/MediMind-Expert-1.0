import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSpecialty, getSpecialtyRoute } from '../../stores/useAppStore';

// This component only handles redirects from the root path
export const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  const { specialty, isSpecialtyVerified, isLoading } = useSpecialty();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for everything to load
    if (!user || isLoading) {
      return;
    }

    // If user has a specialty, redirect to their workspace
    if (specialty && isSpecialtyVerified) {
      const specialtyRoute = getSpecialtyRoute(specialty);
      navigate(specialtyRoute, { replace: true });
    }
  }, [user, specialty, isSpecialtyVerified, isLoading, navigate]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};