# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediMind Expert is a comprehensive medical AI co-pilot platform for healthcare professionals, providing specialty-specific workspaces (Cardiology, OB/GYN) with AI chat, medical calculators, medical news aggregation, knowledge management, and case studies. Built with React 18.3.1, TypeScript, Supabase, and deployed on Netlify with advanced serverless functions.

## Current Branch & Progress

**Branch**: `main`
**Recent Progress**:
- ✅ Enhanced source references with collapsible UI and full text viewing
- ✅ Completed news collection scheduling system  
- ✅ Added Netlify scheduled functions for twice-daily news collection
- ✅ Migrated news-collection function to Supabase Edge Functions
- ✅ Completed full migration from Netlify to Supabase Edge Functions

## MCP Server Configuration

### Supabase MCP (Primary Database)
**Credentials**:
- **JWT Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2OTc3MCwiZXhwIjoyMDYzOTQ1NzcwfQ.AVWB4s6CGI2IHK4pDSU9rZym4juJ3jwCJB7YyCPKfGE`
- **Access Token**: `sbp_a1ec55956577fedbde2561bfc49f24479a5cd533`
- **Database Password**: `Dba545c5fde36242@`
- **Project ID**: `kvsqtolsjggpyvdtdpss`
- **Project URL**: `https://kvsqtolsjggpyvdtdpss.supabase.co`

**Use for**: All database operations, user profiles, content briefs, medical data, Edge Functions deployment

### Playwright MCP (Browser Testing & Error Analysis)
**Primary Tools for Browser Testing and Debugging**:

#### Navigation & Setup
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

**Common Testing Scenarios**:
1. **Error Investigation**: Navigate → Console Messages → Network Requests → Screenshot
2. **Responsive Testing**: Navigate → Resize (mobile/tablet/desktop) → Screenshot → Test interactions
3. **User Flow Testing**: Navigate → Type/Click interactions → Wait for results → Validate
4. **Accessibility Audit**: Navigate → Snapshot → Evaluate → Screenshot for evidence

### Other Available MCP Servers
- **Context7**: Library documentation and code patterns
- **Browser Tools**: Alternative browser automation (use Playwright as primary)
- **Taskmaster AI**: Project management and task tracking

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

#### 5. Mobile-First Responsive Design
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

### AI Integration Patterns
1. **Specialty Awareness**: Always route to appropriate medical chatbot
2. **Context Enhancement**: Include relevant case/document context
3. **File Processing**: Support medical image attachments
4. **Privacy First**: Automatic anonymization of patient data
5. **Calculator Integration**: Suggest relevant calculators in chat

### Testing Strategy
1. **Playwright MCP Primary**: Use for browser testing and error analysis
2. **Console Messages First**: Always capture JavaScript errors initially
3. **Responsive Testing**: Test at 320px, 768px, 1024px breakpoints
4. **Medical Accuracy**: Validate all clinical calculations
5. **Cross-Device**: Ensure consistency from mobile to desktop

### Mobile-First Development
1. **Touch Targets**: Minimum 44px for medical professional use
2. **Progressive Enhancement**: Build mobile-first, enhance for desktop
3. **Safe Areas**: Support notches and home indicators
4. **Performance**: Optimize for bedside mobile use cases
5. **Clinical Workflows**: Seamless transition between devices

### Database Operations
- Use Supabase MCP for all database interactions
- Test Edge Functions through browser automation
- Monitor real-time subscriptions and data updates
- Execute `supabase_setup_safe.sql` before user testing
- Maintain Row Level Security on all tables

### Code Quality Standards
- Follow React 18.3.1 patterns and TypeScript strict mode
- Maintain component modularity with feature-based organization
- Ensure WCAG accessibility compliance for medical professionals
- Mobile-first CSS with Tailwind utilities
- Comprehensive error handling with `safeAsync` patterns

### Build & Deployment
- Always run cleanup commands before production builds
- Test serverless functions thoroughly before deployment
- Validate Edge Function performance and error handling
- Monitor build sizes and performance metrics
- Verify mobile optimization in production builds
```