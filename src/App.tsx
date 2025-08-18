import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { SpecialtyGuard } from './components/Auth/SpecialtyGuard';
import { RootRedirect } from './components/Auth/RootRedirect';
import { AppInitializer } from './components/Auth/AppInitializer';

// INSTANT LOADING - DIRECT IMPORTS FOR MAIN NAVIGATION COMPONENTS
// Core workspace components (main navigation) - NO lazy loading for instant response
import { CardiologyWorkspace } from './components/Workspaces/CardiologyWorkspace';
import { ObGynWorkspace } from './components/Workspaces/ObGynWorkspace';
import { AICopilot } from './components/AICopilot/AICopilot';
import { Calculators } from './components/Calculators/Calculators';
import { PremiumABGAnalysis } from './components/ABG';
import { PremiumABGHistoryPage } from './components/ABG';
import { KnowledgeBase } from './components/KnowledgeBase/KnowledgeBase';
import { MediSearchPage } from './components/MediSearch/MediSearchPage';
import { Profile } from './components/Profile/Profile';
import { HelpCenter } from './components/Help/HelpCenter';
import { ComingSoon } from './components/ui/ComingSoon';

// Keep lazy loading ONLY for auth components and less frequently used pages
const SignIn = React.lazy(() => import('./components/Auth/SignIn').then(module => ({ default: module.SignIn })));
const SignUp = React.lazy(() => import('./components/Auth/SignUp').then(module => ({ default: module.SignUp })));
const PasswordRecoveryForm = React.lazy(() => import('./components/Auth/PasswordRecoveryForm').then(module => ({ default: module.PasswordRecoveryForm })));
const ResetPasswordForm = React.lazy(() => import('./components/Auth/ResetPasswordForm').then(module => ({ default: module.ResetPasswordForm })));
const OnboardingFlow = React.lazy(() => import('./components/Onboarding/OnboardingFlow').then(module => ({ default: module.OnboardingFlow })));

// Keep lazy loading for secondary features
const SimpleDiseasesIndex = React.lazy(() => import('./components/Diseases/SimpleDiseasesIndex'));
const SimpleDiseasePage = React.lazy(() => import('./components/Diseases/SimpleDiseasePage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));

// Components that need to stay eagerly loaded for core functionality
import MarkdownFileLoader from './components/Diseases/MarkdownFileLoader';
import { GlobalDocumentProgressTracker } from './components/ui/DocumentProgressTracker';
import { RouteLoader } from './components/ui/RouteLoader';

import { MedicalSpecialty } from './stores/useAppStore';

function App() {
  return (
    <Router future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true
    }}>
      <AppInitializer>
        <MainLayout>
          <Routes>
            {/* Auth routes - KEEP lazy loading for auth components */}
            <Route path="/signin" element={
              <Suspense fallback={<RouteLoader pageName="Sign In" />}>
                <SignIn />
              </Suspense>
            } />
            <Route path="/signup" element={
              <Suspense fallback={<RouteLoader pageName="Sign Up" />}>
                <SignUp />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<RouteLoader pageName="Password Recovery" />}>
                <PasswordRecoveryForm />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<RouteLoader pageName="Reset Password" />}>
                <ResetPasswordForm />
              </Suspense>
            } />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Onboarding - keep lazy loading */}
              <Route path="/onboarding" element={
                <Suspense fallback={<RouteLoader pageName="Onboarding" />}>
                  <OnboardingFlow />
                </Suspense>
              } />
              
              {/* INSTANT LOADING - Main navigation components (NO Suspense) */}
              {/* Specialty-specific workspace routes */}
              <Route 
                path="/workspace/cardiology" 
                element={
                  <SpecialtyGuard requiredSpecialty={MedicalSpecialty.CARDIOLOGY}>
                    <CardiologyWorkspace />
                  </SpecialtyGuard>
                } 
              />
              <Route 
                path="/workspace/obgyn" 
                element={
                  <SpecialtyGuard requiredSpecialty={MedicalSpecialty.OBGYN}>
                    <ObGynWorkspace />
                  </SpecialtyGuard>
                } 
              />
              
              {/* Legacy routes for backward compatibility */}
              <Route 
                path="/cardiology" 
                element={
                  <SpecialtyGuard requiredSpecialty={MedicalSpecialty.CARDIOLOGY}>
                    <CardiologyWorkspace />
                  </SpecialtyGuard>
                } 
              />
              <Route 
                path="/ob-gyn" 
                element={
                  <SpecialtyGuard requiredSpecialty={MedicalSpecialty.OBGYN}>
                    <ObGynWorkspace />
                  </SpecialtyGuard>
                } 
              />
              
              {/* INSTANT LOADING - Core navigation routes */}
              <Route path="/ai-copilot" element={<AICopilot />} />
              <Route path="/search" element={<MediSearchPage />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/abg-analysis" element={<PremiumABGAnalysis />} />
              <Route path="/abg-history" element={<PremiumABGHistoryPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<HelpCenter />} />
              
              <Route path="/podcast-studio" element={
                <ComingSoon 
                  title="AI Podcast Studio"
                  description="Transform your medical documents into captivating, professional podcasts with revolutionary AI technology and studio-quality natural voices."
                  features={[
                    "Intelligent medical content analysis",
                    "Natural voice synthesis with expert intonation",
                    "Multiple language support",
                    "Professional audio quality",
                    "Quick generation in minutes"
                  ]}
                />
              } />
              
              {/* Secondary features - KEEP lazy loading */}
              <Route path="/diseases" element={
                <Suspense fallback={<RouteLoader pageName="Diseases Index" />}>
                  <SimpleDiseasesIndex />
                </Suspense>
              } />
              <Route path="/diseases/:diseaseId" element={
                <Suspense fallback={<RouteLoader pageName="Disease Details" />}>
                  <SimpleDiseasePage />
                </Suspense>
              } />
              <Route path="/analytics" element={
                <Suspense fallback={<RouteLoader pageName="Analytics" />}>
                  <AnalyticsPage />
                </Suspense>
              } />
              
              {/* Test routes for markdown display */}
              <Route path="/test-markdown" element={<MarkdownFileLoader />} />
              <Route path="/dynamic-markdown-test" element={<MarkdownFileLoader />} />
              <Route path="/markdown-loader" element={<MarkdownFileLoader />} />
              
              {/* Root route - uses RootRedirect to handle specialty routing */}
              <Route path="/" element={<RootRedirect />} />
            </Route>
          </Routes>
              
              {/* Global Progress Tracker for Document Uploads */}
              <GlobalDocumentProgressTracker />
        </MainLayout>
      </AppInitializer>
    </Router>
  );
}

export default App;