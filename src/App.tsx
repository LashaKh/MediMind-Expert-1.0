import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { SpecialtyGuard } from './components/Auth/SpecialtyGuard';
import { RootRedirect } from './components/Auth/RootRedirect';
import { AppInitializer } from './components/Auth/AppInitializer';

// Lazy-loaded authentication components
const SignIn = React.lazy(() => import('./components/Auth/SignIn').then(module => ({ default: module.SignIn })));
const SignUp = React.lazy(() => import('./components/Auth/SignUp').then(module => ({ default: module.SignUp })));
const PasswordRecoveryForm = React.lazy(() => import('./components/Auth/PasswordRecoveryForm').then(module => ({ default: module.PasswordRecoveryForm })));
const ResetPasswordForm = React.lazy(() => import('./components/Auth/ResetPasswordForm').then(module => ({ default: module.ResetPasswordForm })));

// Lazy-loaded main components
const OnboardingFlow = React.lazy(() => import('./components/Onboarding/OnboardingFlow').then(module => ({ default: module.OnboardingFlow })));
const CardiologyWorkspace = React.lazy(() => import('./components/Workspaces/CardiologyWorkspace').then(module => ({ default: module.CardiologyWorkspace })));
const ObGynWorkspace = React.lazy(() => import('./components/Workspaces/ObGynWorkspace').then(module => ({ default: module.ObGynWorkspace })));
const AICopilot = React.lazy(() => import('./components/AICopilot/AICopilot').then(module => ({ default: module.AICopilot })));
const Calculators = React.lazy(() => import('./components/Calculators/Calculators').then(module => ({ default: module.Calculators })));
const PremiumABGAnalysis = React.lazy(() => import('./components/ABG').then(module => ({ default: module.PremiumABGAnalysis })));
const PremiumABGHistoryPage = React.lazy(() => import('./components/ABG').then(module => ({ default: module.PremiumABGHistoryPage })));

// Lazy-loaded feature components
const KnowledgeBase = React.lazy(() => import('./components/KnowledgeBase/KnowledgeBase').then(module => ({ default: module.KnowledgeBase })));
const Profile = React.lazy(() => import('./components/Profile/Profile').then(module => ({ default: module.Profile })));
const HelpCenter = React.lazy(() => import('./components/Help/HelpCenter').then(module => ({ default: module.HelpCenter })));
const SimpleDiseasesIndex = React.lazy(() => import('./components/Diseases/SimpleDiseasesIndex'));
const SimpleDiseasePage = React.lazy(() => import('./components/Diseases/SimpleDiseasePage'));
const ComingSoon = React.lazy(() => import('./components/ui/ComingSoon').then(module => ({ default: module.ComingSoon })));
const MediSearchPage = React.lazy(() => import('./components/MediSearch/MediSearchPage').then(module => ({ default: module.MediSearchPage })));
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
          <Suspense fallback={<RouteLoader />}>
                <Routes>
                {/* Public routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<PasswordRecoveryForm />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<OnboardingFlow />} />
                  
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
                  
                  {/* Common routes available to all specialties */}
                  <Route path="/ai-copilot" element={<AICopilot />} />
                  <Route path="/search" element={<MediSearchPage />} />
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
                  <Route path="/calculators" element={<Calculators />} />
                  
                  {/* ABG Analysis routes - Premium Components */}
                  <Route path="/abg-analysis" element={<PremiumABGAnalysis />} />
                  <Route path="/abg-history" element={<PremiumABGHistoryPage />} />

                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/diseases" element={<SimpleDiseasesIndex />} />
                  <Route path="/diseases/:diseaseId" element={<SimpleDiseasePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  
                  {/* Test route for markdown display */}
                  <Route path="/test-markdown" element={<MarkdownFileLoader />} />
                  
                  {/* New dynamic markdown test page */}
                  <Route path="/dynamic-markdown-test" element={<MarkdownFileLoader />} />
                  
                  {/* Full markdown file loader */}
                  <Route path="/markdown-loader" element={<MarkdownFileLoader />} />
                  
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/help" element={<HelpCenter />} />
                  
                  {/* Root route - uses RootRedirect to handle specialty routing */}
                  <Route path="/" element={<RootRedirect />} />
                </Route>
              </Routes>
          </Suspense>
              
              {/* Global Progress Tracker for Document Uploads */}
              <GlobalDocumentProgressTracker />
        </MainLayout>
      </AppInitializer>
    </Router>
  );
}

export default App;