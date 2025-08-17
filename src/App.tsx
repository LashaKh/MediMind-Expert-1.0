import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { SignIn } from './components/Auth/SignIn';
import { SignUp } from './components/Auth/SignUp';
import { PasswordRecoveryForm } from './components/Auth/PasswordRecoveryForm';
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { SpecialtyGuard } from './components/Auth/SpecialtyGuard';
import { RootRedirect } from './components/Auth/RootRedirect';
import { AppInitializer } from './components/Auth/AppInitializer';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { CardiologyWorkspace } from './components/Workspaces/CardiologyWorkspace';
import { ObGynWorkspace } from './components/Workspaces/ObGynWorkspace';
import { AICopilot } from './components/AICopilot/AICopilot';
import { Calculators } from './components/Calculators/Calculators';
import { PremiumABGAnalysis, PremiumABGHistoryPage } from './components/ABG';

import { KnowledgeBase } from './components/KnowledgeBase/KnowledgeBase';
import { Profile } from './components/Profile/Profile';
import { HelpCenter } from './components/Help/HelpCenter';
import SimpleDiseasesIndex from './components/Diseases/SimpleDiseasesIndex';
import SimpleDiseasePage from './components/Diseases/SimpleDiseasePage';
import { ComingSoon } from './components/ui/ComingSoon';
import { MediSearchPage } from './components/MediSearch/MediSearchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

import MarkdownFileLoader from './components/Diseases/MarkdownFileLoader';
import { GlobalDocumentProgressTracker } from './components/ui/DocumentProgressTracker';

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
              
              {/* Global Progress Tracker for Document Uploads */}
              <GlobalDocumentProgressTracker />
        </MainLayout>
      </AppInitializer>
    </Router>
  );
}

export default App;