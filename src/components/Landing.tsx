import React from 'react';
import { HeroSection } from './Landing/HeroSection';
import { FeaturesSection } from './Landing/FeaturesSection';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
};