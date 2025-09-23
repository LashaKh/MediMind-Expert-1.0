# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediMind Expert is a comprehensive medical AI co-pilot platform for healthcare professionals, providing specialty-specific workspaces (Cardiology, OB/GYN) with AI chat, medical calculators, medical news aggregation, knowledge management, and case studies. Built with React 18.3.1, TypeScript, Supabase, and deployed on Netlify with advanced serverless functions.

## Current Branch & Progress

**Branch**: `main`
**Recent Progress** (Updated: 2025-09-21):
- ✅ Implemented Georgian medical transcription system (MediScribe)
- ✅ Optimized recording start performance (<200ms with microphone pre-initialization)
- ✅ Added real-time session management with cross-session isolation
- ✅ Enhanced UI with medical iconography and responsive design
- ✅ Completed performance optimizations for instant recording/transcription
- ✅ Fixed React warnings and optimized component architecture
- ✅ **NEW**: Added comprehensive Claude Code command automation system
- ✅ **NEW**: Implemented advanced MCP server configuration with multiple providers
- ✅ **NEW**: Complete mobile responsiveness audit and optimization for MediScribe
- ✅ **NEW**: Added unified blue theme across entire application interface

## MCP Server Configuration

### Supabase MCP (Primary Database)
**Credentials**:
- **JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2OTc3MCwiZXhwIjoyMDYzOTQ1NzcwfQ.AVWB4s6CGI2IHK4pDSU9rZym4juJ3jwCJB7YyCPKfGE`
- **Access Token**: `sbp_a1ec55956577fedbde2561bfc49f24479a5cd533`
- **Database Password**: `Dba545c5fde36242@`
- **Project ID**: `kvsqtolsjggpyvdtdpss`
- **Project URL**: `https://kvsqtolsjggpyvdtdpss.supabase.co`

**Use for**: All database operations, user profiles,  medical data, Edge Functions deployment

### Playwright MCP (Browser Testing & Error Analysis)
**Available Tools for Browser Testing and Debugging (Use Only When Explicitly Requested)**:

#### Navigation & Setup
**Local Development**: http://localhost:8888 (use this URL for all browser testing)
- `mcp__playwright__browser_navigate` - Navigate to application URLs for testing
- `mcp__playwright__browser_resize` - Test responsive design at different viewport sizes
- `mcp__playwright__browser_install` - Install browser if not available

#### User Interactions
- `mcp__playwright__browser_click` - Click buttons, links, and interactive elements
- `mcp__playwright__browser_type` - Fill forms and input fields
- `mcp__playwright__browser_select_option` - Select dropdown options
- `mcp__playwright__browser_hover` - Test hover states and interactions
- `mcp__playwright__browser_drag` - Test drag and drop functionality

#### Error Detection & Analysis
- `mcp__playwright__browser_console_messages` - **PRIMARY**: Capture JavaScript errors, warnings, and console logs
- `mcp__playwright__browser_network_requests` - Monitor API calls, failed requests, and network issues
- `mcp__playwright__browser_snapshot` - Capture DOM structure for accessibility and element analysis
- `mcp__playwright__browser_take_screenshot` - Visual evidence of UI states and issues

#### Testing Workflows
- `mcp__playwright__browser_wait_for` - Wait for elements or conditions before proceeding
- `mcp__playwright__browser_evaluate` - Execute JavaScript to test functionality
- `mcp__playwright__browser_file_upload` - Test file upload features

#### Tab Management
- `mcp__playwright__browser_tab_new` - Open new tabs for multi-window testing
- `mcp__playwright__browser_tab_select` - Switch between tabs
- `mcp__playwright__browser_tab_close` - Clean up test tabs

**Common Testing Scenarios (Use Only When User Requests Browser Testing/Debugging)**:
1. **Error Investigation**: Navigate → Console Messages → Network Requests → Screenshot
2. **Responsive Testing**: Navigate → Resize (mobile/tablet/desktop) → Screenshot → Test interactions
3. **User Flow Testing**: Navigate → Type/Click interactions → Wait for results → Validate
4. **Accessibility Audit**: Navigate → Snapshot → Evaluate → Screenshot for evidence

### Other Available MCP Servers
- **Context7**: Library documentation and code patterns  
- **Browser Tools**: Alternative browser automation (use Playwright as primary)
- **Taskmaster AI**: Project management and task tracking

### MCP Configuration Files
- **`.mcp.json`**: Primary configuration with Supabase and Playwright
- **`.mcp.json.all-three`**: Extended configuration with additional providers
- **`.mcp.json.context7-only`**: Context7-specific configuration
- **`.mcp.json.supabase-only`**: Supabase-only configuration for focused database work

### MCP Usage Guidelines
- **Playwright MCP**: Use ONLY when explicitly requested for debugging, browser testing, or error analysis. Do not use by default for development tasks.
- **Sequential Thinking MCP**: Use for debugging, troubleshooting, complex problem-solving, and detailed project planning. Avoid excessive recursive calls.
- **Information Gathering**: Use Brave Search, Puppeteer, FireCrawl when troubleshooting or searching documentation. Combine with Sequential Thinking for refined solutions.
- **Browser Tools**: Requires explicit user confirmation. User must start server and ensure Chromium is running. Disable Puppeteer before use.

## Claude Code Command System

### Available Commands
- **`/constitution`**: Create or update project constitution with principle inputs
- **`/implement`**: Execute implementation plan by processing tasks.md
- **`/plan`**: Generate comprehensive development plans and specifications
- **`/specify`**: Create detailed technical specifications
- **`/tasks`**: Manage and track development tasks
- **`/updateClaude`**: Automatically update CLAUDE.md based on recent changes
- **`/promptOptimizer`**: Optimize prompts for better AI interactions

### Command Templates & Scripts
```
.specify/
├── memory/constitution.md          # Project governance and principles
├── scripts/bash/                   # Automation scripts
│   ├── check-prerequisites.sh      # Environment validation
│   ├── common.sh                   # Shared utilities
│   ├── create-new-feature.sh       # Feature scaffolding
│   ├── setup-plan.sh              # Plan initialization
│   └── update-agent-context.sh     # Context management
└── templates/                      # Template files
    ├── agent-file-template.md
    ├── plan-template.md
    ├── spec-template.md
    └── tasks-template.md
```

## Development Commands

### Core Development
```bash
# Development with Vite hot reload
npm run dev

# Development with Netlify functions
npm run dev:netlify

# Build for production
npm run build

# Fresh build (clears all caches)
npm run build:fresh

# Preview production build locally
npm run preview
```

### Testing Suite
```bash
# Run all tests with Vitest
npm test

# Run tests with UI dashboard
npm run test:ui

# Run tests once and exit
npm run test:run

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specialized test suites
npm run test:medical        # Medical calculator tests
npm run test:search         # MediSearch component tests
npm run test:integration    # Integration tests
npm run test:e2e           # Playwright E2E tests
npm run test:performance   # Performance benchmarks
npm run test:accessibility # Accessibility compliance
```

### Code Quality & Linting
```bash
# Lint entire codebase
npm run lint

# Remove console.log statements
npm run cleanup:console

# Clean build artifacts
npm run cleanup:build

# Advanced cleanup (console + OCR imports)
npm run cleanup:advanced
```

### Production Management
```bash
# Deploy to production
npm run deploy:prod

# Production database migration (with dry-run option)
npm run migrate:prod:dry
npm run migrate:prod

# Production rollback (with dry-run option) 
npm run rollback:prod:dry
npm run rollback:prod

# Health check
npm run health:check
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18.3.1 with TypeScript, Vite build system
- **Styling**: Tailwind CSS with mobile-first responsive design
- **State**: Zustand stores + React Context for complex features
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Functions**: Supabase Edge Functions (migrated from Netlify)
- **Deployment**: Netlify with Edge Functions integration
- **Testing**: Vitest + Playwright + Testing Library

### Core Architecture Patterns

#### 1. Specialty-Specific Workspace Architecture
```
src/components/
├── Workspaces/
│   ├── CardiologyWorkspace.tsx    # Cardiology-specific features
│   └── ObGynWorkspace.tsx         # OB/GYN-specific features
```
- Users choose specialty during onboarding and cannot switch
- All features (AI chat, calculators, news) are specialty-aware
- Separate Flowise chatbot endpoints for each specialty

#### 2. Feature-Based Component Organization
```
src/components/Feature/
├── Component.tsx
├── hooks/
├── types/
├── services/
└── index.ts                      # Clean exports
```
Each major feature is self-contained with its own hooks, types, and services.

#### 3. Medical Calculator System (100% Validated)
```
src/components/Calculators/
├── Calculators.tsx               # Main calculator grid
├── [CalculatorName].tsx         # Individual calculators
└── GRACE/                       # Complex multi-step calculators
    ├── GraceFormStep1.tsx
    ├── GraceFormStep2.tsx
    └── GraceResultDisplay.tsx
```
- 16+ cardiovascular calculators with ACC/AHA compliance
- Evidence-based validation with 100% test success rate
- AI integration via `useCalculatorIntegration` hook
- Mobile-optimized with touch-friendly interfaces

#### 4. AI Integration Architecture
```
Frontend: FlowiseChatWindow → useFlowiseChat → API
Backend: functions/flowise-proxy.js → Specialty Flowise Endpoints  
State: ChatContext → React reducers → Real-time UI
```
- Specialty-aware routing (Cardiology vs OB/GYN chatbots)
- File attachment support for medical image analysis
- Case management integration with privacy protection
- Calculator suggestions and result sharing

#### 5. Georgian Medical Transcription System (MediScribe)
```
src/components/Georgian/
├── GeorgianSTTApp.tsx             # Main transcription interface
├── GeorgianSTTAppWrapper.tsx      # Wrapper with context providers
├── SessionHistory.tsx             # Session management UI
├── TranscriptPanel.tsx            # Transcript display and editing
├── hooks/useGeorgianTTS.ts        # Core transcription logic with optimizations
├── lib/speech/georgianTTSService.ts # Supabase Edge Function integration
└── components/                    # Specialized UI components
    ├── ContextContent.tsx
    ├── HeaderControls.tsx
    ├── TabNavigation.tsx
    └── TranscriptContent.tsx
```
- **Performance**: <200ms recording start (microphone pre-initialization)
- **Real-time**: Live transcription with smart 23-second auto-segmentation  
- **Session Management**: Cross-session isolation with unique session IDs
- **Edge Functions**: Supabase integration for Georgian speech processing
- **Mobile Optimized**: Touch-friendly recording controls for medical consultations

#### 6. Mobile-First Responsive Design
```
src/styles/responsive.css         # CSS custom properties system
src/components/ui/mobile-form.tsx # Mobile form component library
src/components/Layout/BottomNavigation.tsx # Mobile navigation
```
- Touch targets minimum 44px (Apple guidelines)
- Safe area support for modern mobile devices
- Progressive enhancement from mobile to desktop

### Key Services & APIs

#### Medical Data Processing
- **Georgian Transcription**: `src/hooks/useGeorgianTTS.ts` - Real-time medical transcription with performance optimizations
- **Speech Processing**: `src/lib/speech/georgianTTSService.ts` - Supabase Edge Function integration
- **ABG Analysis**: `src/services/abgService.ts` - Blood gas analysis with OCR
- **Medical Calculators**: Validated algorithms with population-specific calibration
- **Medical News**: Specialty-filtered news aggregation and engagement tracking

#### Document & Knowledge Management
```
Pipeline: DocumentUpload → document-upload.js → documentProcessor.js → vectorStore.js
```
- OpenAI Vector Store integration for AI-powered document search
- Support for PDF, Word, Excel, TXT, and image files
- Real-time progress tracking with `useDocumentProgress`

#### Authentication & Security
- Supabase Auth with specialty selection during onboarding
- Row Level Security on all database tables
- HIPAA-compliant session management
- Medical data anonymization in case management

### Database Schema (Key Tables)
```sql
-- User management with specialty tracking
profiles (id, specialty, created_at)

-- Georgian transcription sessions with cross-session isolation
georgian_sessions (id, user_id, title, transcript, processing_results, created_at, session_id)

-- Medical news with specialty filtering  
medical_news (specialty, category, evidence_level, engagement_score)

-- Knowledge base with vector embeddings
user_documents (user_id, openai_file_id, processing_status)
user_vector_stores (user_id, openai_vector_store_id)

-- Case management with privacy protection
user_cases (user_id, title, description, is_active)

-- Performance monitoring
liked_search_results, clinical_trials_monitoring
```

## Key Development Guidelines

### Medical Calculator Development
1. **Validation First**: Achieve 100% test success before deployment
2. **Evidence-Based**: All algorithms must reference medical literature  
3. **Population-Specific**: Include demographic calibration factors
4. **Conservative Bias**: Err on side of patient safety
5. **Mobile Optimization**: Touch-friendly with responsive validation

### Georgian Transcription Development
1. **Performance Optimization**: Maintain <200ms recording start time with pre-initialization
2. **Session Isolation**: Use unique session IDs to prevent transcript contamination
3. **Real-time Processing**: Implement smart 23-second auto-segmentation for continuous recording
4. **Error Handling**: Use `safeAsync` patterns for robust microphone and API handling
5. **Mobile-First**: Touch-friendly controls optimized for bedside medical consultations

### AI Integration Patterns
1. **Specialty Awareness**: Always route to appropriate medical chatbot
2. **Context Enhancement**: Include relevant case/document context
3. **File Processing**: Support medical image attachments
4. **Privacy First**: Automatic anonymization of patient data
5. **Calculator Integration**: Suggest relevant calculators in chat

### Testing Strategy
1. **Standard Testing**: Use Vitest, npm test commands, and code analysis for primary testing
2. **Playwright MCP**: Use ONLY when explicitly requested for browser testing, debugging, or error analysis
3. **Console Error Analysis**: When user reports browser issues, then use Playwright to capture JavaScript errors
4. **Responsive Testing**: Use Playwright testing only when specifically requested at 320px, 768px, 1024px breakpoints
5. **Medical Accuracy**: Validate all clinical calculations through unit tests
6. **Cross-Device**: Ensure consistency through code review and standard testing practices

### Mobile-First Development
1. **Touch Targets**: Minimum 44px for medical professional use
2. **Progressive Enhancement**: Build mobile-first, enhance for desktop
3. **Safe Areas**: Support notches and home indicators
4. **Performance**: Optimize for bedside mobile use cases
5. **Clinical Workflows**: Seamless transition between devices
6. **Mobile Responsiveness**: Comprehensive viewport testing at 320px, 375px, and 414px breakpoints
7. **Keyboard Interactions**: Mobile keyboard-aware layout management with viewport height constraints

### Database Operations
- Use Supabase MCP for all database interactions
- Test Edge Functions through direct API calls and unit tests
- Use browser automation ONLY when explicitly requested for debugging
- Monitor real-time subscriptions and data updates
- Execute `supabase_setup_safe.sql` before user testing
- Maintain Row Level Security on all tables

### Code Quality Standards
- Follow React 18.3.1 patterns and TypeScript strict mode
- Maintain component modularity with feature-based organization
- Ensure WCAG accessibility compliance for medical professionals
- Mobile-first CSS with Tailwind utilities
- Comprehensive error handling with `safeAsync` patterns

## Recent Updates (Updated: 2025-09-21)

### Major Infrastructure Changes
- **Claude Code Command System**: Added comprehensive automation with 7 custom commands for project management, planning, and development workflows
- **Advanced MCP Configuration**: Multiple MCP server configurations for different development scenarios (all-three, context7-only, supabase-only)
- **Project Constitution Framework**: Implemented governance and principle management system with automated template synchronization

### UI/UX Improvements
- **Unified Blue Theme**: Applied comprehensive blue theme integration across all application interfaces including:
  - AI Copilot chat interface with modern blue styling
  - Medical calculators with blue-themed components
  - Georgian transcription interface with medical blue accents
  - Profile, knowledge base, and authentication pages
- **Mobile Optimization Completion**: Finalized mobile responsiveness audit with viewport testing at 320px, 375px, and 414px breakpoints
- **MediScribe Mobile Enhancements**: Fixed textarea keyboard interactions, button positioning, and layout stability

### Development Workflow Enhancements
- **Command Templates**: Added structured templates for plans, specifications, and task management
- **Automation Scripts**: Bash scripts for prerequisite checking, feature creation, and agent context updates
- **Mobile Testing Framework**: Comprehensive mobile testing with standard development tools (use Playwright only when explicitly requested)

### Technical Debt Resolution
- **Mobile Layout Issues**: Resolved keyboard interaction problems in Georgian transcription
- **Component Architecture**: Optimized React component structure for better maintainability
- **CSS Organization**: Unified styling approach with theme-consistent component libraries

## Critical Architecture Patterns

### Georgian Transcription Performance Optimizations
- **Microphone Pre-initialization**: `preInitializeMicrophone()` in `useGeorgianTTS.ts` eliminates 2-3 second recording delays
- **Smart Segmentation**: Automatic 23-second chunks with seamless continuation for long recordings
- **Session Isolation**: Unique session IDs prevent transcript contamination across recordings
- **Background Processing**: Non-blocking audio processing maintains responsive UI

### Component State Management
- **Local Transcript State**: GeorgianSTTApp maintains local transcript state separate from session management
- **Real-time Updates**: `onLiveTranscriptUpdate` callback provides session-aware updates
- **Cross-Component Communication**: Props drilling with TypeScript interfaces for type safety

### Edge Function Integration
- **Supabase Edge Functions**: `georgian-tts-proxy` handles speech processing with authentication
- **Error Recovery**: Graceful fallback patterns for network/API failures
- **Token Management**: Fresh authentication for reliable processing

### Build & Deployment
- Always run cleanup commands before production builds
- Test serverless functions thoroughly before deployment
- Validate Edge Function performance and error handling
- Monitor build sizes and performance metrics
- Verify mobile optimization in production builds
```
