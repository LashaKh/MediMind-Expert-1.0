import React, { useState } from 'react';
import { 
  BookOpen, 
  MessageCircle, 
  Calculator, 
  Upload, 
  Stethoscope,
  Search,
  ChevronRight,
  HelpCircle,
  Bot,
  Users
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const HelpCenter: React.FC = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Stethoscope className="w-6 h-6" />,
      description: 'Learn the basics of using MediMind Expert',
      articles: [
        {
          id: 'account-setup',
          title: 'Account Setup & First Login',
          difficulty: 'beginner',
          tags: ['setup', 'account', 'onboarding'],
          content: `
# Account Setup & First Login

Get started with your MediMind Expert account and complete the essential setup steps.

## Step 1: Account Registration

### Creating Your Account
1. **Visit the Sign-Up Page**
   - Go to the MediMind Expert sign-up page
   - Choose "Create Account" to begin registration

2. **Enter Your Information**
   - **Full Name**: Enter your complete medical name as you'd like it displayed
   - **Email Address**: Use your professional email for account notifications
   - **Password**: Create a strong password (minimum 8 characters)
   - **Confirm Password**: Re-enter your password to verify

3. **Medical Specialty Selection**
   - Choose your primary specialty: **Cardiology** or **OB/GYN**
   - This customizes your workspace and available tools
   - You can change this later in your profile settings

### Account Verification
1. **Check Your Email**
   - Look for a verification email from MediMind Expert
   - Check your spam/junk folder if not received within 5 minutes

2. **Verify Your Account**
   - Click the verification link in the email
   - This activates your account and unlocks all features

## Step 2: First Login & Profile Setup

### Logging In
1. **Go to the Sign-In Page**
   - Enter your registered email address
   - Enter your password
   - Click "Sign In" to access your workspace

2. **Welcome Tour** (Optional)
   - Take the guided tour to familiarize yourself with the interface
   - Skip if you prefer to explore independently

### Complete Your Profile
1. **Navigate to Profile Settings**
   - Click on your profile icon in the top-right corner
   - Select "Profile" from the dropdown menu

2. **Essential Profile Information**
   - **About Me**: Add a brief description of your practice and interests
   - **Medical Specialty**: Confirm or update your specialty
   - **Profile Picture**: Upload a professional photo (optional but recommended)
   - **Preferences**: Set your preferred language and notification settings

## Step 3: Security & Privacy Settings

### Account Security
- **Two-Factor Authentication**: Enable 2FA for enhanced security
- **Password Management**: Update your password anytime
- **Session Management**: Control active sessions across devices

### Privacy Compliance
- **HIPAA Compliance**: Your account automatically follows HIPAA guidelines
- **Data Encryption**: All data is encrypted at rest and in transit
- **Privacy Controls**: Manage what information is shared with AI features

## Step 4: Workspace Orientation

### Dashboard Overview
Once logged in, you'll see your specialty-specific dashboard with:
- **AI Co-Pilot**: Direct access to medical AI assistance
- **Medical Calculators**: Specialty-specific clinical tools
- **Knowledge Base**: Document management system
- **Recent Activity**: Your latest interactions and calculations

### Quick Start Checklist
- ✅ Account verified and profile completed
- ✅ Medical specialty confirmed
- ✅ Privacy settings reviewed
- ✅ First AI conversation started
- ✅ Calculator explored
- ✅ Document uploaded (optional)

## Troubleshooting Common Setup Issues

### Can't Receive Verification Email?
- Check spam/junk folders
- Ensure email address was entered correctly
- Request a new verification email
- Contact support if issues persist

### Login Problems?
- Verify email address and password
- Try resetting your password
- Clear browser cache and cookies
- Disable browser extensions temporarily

### Profile Not Saving?
- Ensure all required fields are completed
- Check internet connection
- Try refreshing the page and re-entering information

## Next Steps
After completing your account setup:
1. Read the "Complete Platform Tour" guide
2. Start your first AI Co-Pilot conversation
3. Explore specialty-specific calculators
4. Upload your first medical document

*Estimated setup time: 5-10 minutes*
          `
        },
        {
          id: 'platform-tour',
          title: 'Complete Platform Tour',
          difficulty: 'beginner',
          tags: ['tour', 'navigation', 'features'],
          content: `
# Complete Platform Tour

Master your MediMind Expert workspace with this comprehensive platform tour.

## Specialty Workspace Overview

Your workspace is customized for **${profile?.medical_specialty || 'your medical specialty'}** practice with specialty-specific tools and content.

### Navigation Structure
- **Sidebar Navigation**: Access all major features
- **Header Controls**: Profile, settings, and notifications
- **Dashboard**: Quick access to frequently used tools
- **Search**: Global search across all features

### Workspace Personalization
- **Dashboard Layout**: Customize which tools appear first
- **Quick Actions**: Set up shortcuts for common tasks
- **Theme Settings**: Choose light or dark mode
- **Language Preferences**: Select your preferred language

## Core Platform Features

### 1. AI Co-Pilot
**Your Intelligent Medical Assistant**

**Capabilities:**
- Answer complex clinical questions with evidence-based responses
- Analyze medical images (ECGs, lab results, X-rays)
- Discuss patient cases and provide differential diagnoses
- Suggest relevant medical calculators
- Reference uploaded medical literature
- Provide drug information and interaction checking

**How to Use:**
- Click "AI Assistant" from your dashboard
- Type your medical question or upload an image
- Use specific medical terminology for best results
- Share calculator results for detailed interpretation
- Reference your uploaded documents in conversations

### 2. Medical Calculators
**Professional Clinical Decision Tools**

**${profile?.medical_specialty === 'cardiology' ? 'Cardiology' : profile?.medical_specialty === 'ob-gyn' ? 'OB/GYN' : 'Specialty'} Calculator Suite:**
${profile?.medical_specialty === 'cardiology' ? `
**Risk Assessment Tools:**
- ASCVD Risk Calculator (10-year cardiovascular risk)
- Framingham Risk Score (CHD risk prediction)
- Reynolds Risk Score (enhanced risk assessment)

**Acute Care Calculators:**
- GRACE Score (ACS risk stratification)
- TIMI Risk Score (STEMI/NSTEMI outcomes)
- PURSUIT Score (bleeding risk assessment)

**Therapy Management:**
- CHA2DS2-VASc Score (stroke risk in AF)
- HAS-BLED Score (bleeding risk assessment)
- DAPT Score (dual antiplatelet therapy)

**Heart Failure Assessment:**
- MAGGIC Risk Calculator
- Seattle Heart Failure Model
- Heart Failure Staging Tool

**Surgical Risk Assessment:**
- STS Risk Calculator (cardiac surgery)
- EuroSCORE II (European cardiac surgery risk)

**Specialized Tools:**
- HCM Risk-SCD Calculator (sudden cardiac death)
- HCM-AFR Calculator (atrial fibrillation risk)

*Total: 16+ validated calculators*
` : profile?.medical_specialty === 'ob-gyn' ? `
**Pregnancy Dating & Assessment:**
- EDD Calculator (estimated delivery date)
- Gestational Age Calculator
- Fetal Weight Estimation

**Labor & Delivery:**
- Bishop Score (cervical favorability)
- Apgar Score (newborn assessment)
- VBAC Success Calculator

**Risk Assessment Tools:**
- Preeclampsia Risk Calculator
- Preterm Birth Risk Assessment
- GDM Screening Calculator
- PPH Risk Assessment

**Gynecologic Oncology:**
- Cervical Cancer Risk Calculator
- Ovarian Cancer Risk Assessment
- Endometrial Cancer Risk Calculator

**Reproductive Endocrinology:**
- Ovarian Reserve Assessment
- Menopause Assessment Tool

*Total: 13+ validated calculators*
` : `
**Comprehensive Calculator Suite:**
- Risk assessment and scoring tools
- Clinical decision support calculators
- Evidence-based calculation algorithms
- Specialty-specific diagnostic tools
- Treatment planning calculators

*All calculators are clinically validated and evidence-based*
`}

**Using Calculators:**
1. Select your desired calculator from the categories
2. Input patient parameters (all fields are validated)
3. View results with clinical interpretation
4. Share results with AI Co-Pilot for detailed analysis
5. Save calculations for future reference

### 3. Knowledge Base
**Your Medical Literature Hub**

**Document Management:**
- Upload PDFs, Word documents, and text files
- AI processes documents for intelligent search
- Organize by specialty, topic, or custom categories
- Quick search across all uploaded content

**AI Integration:**
- Documents enhance AI responses with your specific literature
- AI can cite and reference your uploaded materials
- Create a personalized medical library
- Share document insights in AI conversations

**Supported Content:**
- Medical journals and research papers
- Clinical guidelines and protocols
- Textbook chapters and references
- Institutional policies and procedures

### 4. Analytics & Insights
**Track Your Clinical Workflow**

**Usage Analytics:**
- AI interaction history and patterns
- Calculator usage and trends
- Document access and search patterns
- Performance metrics and time savings

**Clinical Insights:**
- Most frequently used tools
- Common question patterns
- Research topic trends
- Workflow optimization suggestions

## Advanced Features

### Case Management
- Create anonymized patient cases
- Discuss complex scenarios with AI
- Track case progression and outcomes
- Build a personal case library

### Integration Features
- Calculator results directly shared with AI
- Document references in AI conversations
- Cross-feature search and navigation
- Workflow continuity between tools

### Collaboration Tools
- Share calculator results
- Export AI conversations
- Generate clinical summaries
- Create educational content

## Navigation Tips & Shortcuts

### Keyboard Shortcuts
- **Ctrl/Cmd + K**: Global search
- **Ctrl/Cmd + /**: Open help center
- **Ctrl/Cmd + ,**: Open settings
- **Esc**: Close current modal/dialog

### Mobile Navigation
- Swipe navigation between features
- Optimized touch interfaces
- Offline calculator access
- Mobile-friendly document viewing

### Quick Access Features
- Recent conversations sidebar
- Favorite calculators bookmark
- Quick upload buttons
- Recent documents panel

## Customization Options

### Dashboard Personalization
- Rearrange feature cards
- Set default landing page
- Customize quick action buttons
- Hide/show analytics panels

### Appearance Settings
- Light/dark theme toggle
- Font size adjustments
- Contrast settings
- Accessibility options

### Notification Preferences
- AI response notifications
- System update alerts
- Feature announcement preferences
- Email notification settings

## Getting Help

### In-App Support
- Help tooltips throughout the interface
- Interactive tutorials for complex features
- Contextual help based on current activity
- Quick access to relevant articles

### Support Resources
- Comprehensive help center
- Video tutorials and walkthroughs
- Community forums and discussions
- Direct support contact options

## Next Steps
Now that you understand the platform:
1. Start with the "AI Co-Pilot Mastery Guide"
2. Explore your specialty's calculators
3. Upload your first medical document
4. Try a complex clinical case with AI

*Estimated tour time: 10-15 minutes for full exploration*
          `
        },
        {
          id: 'first-steps',
          title: 'Your First Steps in MediMind Expert',
          difficulty: 'beginner',
          tags: ['onboarding', 'basics', 'quickstart'],
          content: `
# Your First Steps in MediMind Expert

Perfect for users who want to get up and running quickly with the essential features.

## Quick Start Checklist (5 minutes)

### ✅ Step 1: Verify Your Setup
- Ensure your account is verified and profile is complete
- Confirm your medical specialty is correctly selected
- Check that you can access your dashboard

### ✅ Step 2: Start Your First AI Conversation
1. **Click "AI Co-Pilot"** from your dashboard
2. **Try a simple medical question** like:
   - "What are the latest guidelines for hypertension management?"
   - "Explain the mechanism of action of ACE inhibitors"
   - "What's the differential diagnosis for chest pain?"

3. **Observe the AI response features:**
   - Evidence-based answers with source citations
   - Suggested medical calculators
   - Follow-up question recommendations

### ✅ Step 3: Explore a Medical Calculator
1. **Navigate to "Calculators"** from your sidebar
2. **Choose a relevant calculator** for your specialty:
${profile?.medical_specialty === 'cardiology' ? `   - Try the **ASCVD Risk Calculator** for cardiovascular risk assessment
   - Input sample patient data to see how results are interpreted
   - Notice the clinical recommendations provided` : profile?.medical_specialty === 'ob-gyn' ? `   - Try the **EDD Calculator** for pregnancy dating
   - Input a sample last menstrual period date
   - Notice the detailed pregnancy timeline provided` : `   - Try any calculator relevant to your practice
   - Input sample data to understand the interface
   - Notice the clinical interpretations provided`}

3. **Share results with AI:**
   - Use the "Share with AI" button
   - Ask for detailed interpretation and clinical recommendations

### ✅ Step 4: Upload Your First Document
1. **Go to "Knowledge Base"** from your sidebar
2. **Upload a medical document** (PDF recommended):
   - Recent journal article
   - Clinical guideline
   - Reference material
3. **Wait for AI processing** (usually 1-2 minutes)
4. **Test the integration:**
   - Ask the AI about content from your uploaded document
   - Notice how it references your personal library

## Essential Daily Workflows

### Clinical Question Workflow
1. **Open AI Co-Pilot**
2. **Ask specific clinical questions** using medical terminology
3. **Use suggested calculators** when recommended
4. **Reference your uploaded documents** for personalized insights

### Case Discussion Workflow  
1. **Start with patient demographics** (anonymized)
2. **Present clinical scenario** with relevant details
3. **Ask for differential diagnosis** or treatment recommendations
4. **Use relevant calculators** for risk assessment
5. **Request evidence-based sources** for recommendations

### Research & Learning Workflow
1. **Upload recent literature** to your Knowledge Base
2. **Ask AI to summarize** key findings from documents
3. **Explore related calculators** mentioned in literature
4. **Save important conversations** for future reference

## Success Tips for Beginners

### Getting Better AI Responses
- **Be specific**: "65-year-old male with chest pain and diabetes" vs "patient with chest pain"
- **Use medical terms**: "myocardial infarction" vs "heart attack"
- **Provide context**: Include relevant patient history and current medications
- **Ask follow-up questions**: Dive deeper into specific aspects of the response

### Calculator Best Practices
- **Double-check inputs**: Ensure all patient data is accurate
- **Understand limitations**: Read the calculator's scope and contraindications
- **Use clinical judgment**: Combine calculator results with clinical assessment
- **Share with AI**: Get detailed interpretation of results

### Document Management Tips
- **Upload quality documents**: Clear, text-based PDFs work best
- **Organize by topic**: Use descriptive filenames for easy searching
- **Update regularly**: Keep your knowledge base current with latest research
- **Reference in conversations**: Mention specific documents when asking questions

## Common New User Questions

### "How accurate is the AI?"
- AI provides evidence-based responses from medical literature
- Always cross-reference with current guidelines and clinical judgment
- Sources are provided for verification
- Use as clinical decision support, not replacement for medical expertise

### "Are my documents secure?"
- All documents are encrypted and stored securely
- HIPAA compliant infrastructure
- Only you can access your uploaded documents
- No sharing with other users or external parties

### "Can I use this during patient consultations?"
- Yes, designed for point-of-care use
- Calculators provide immediate clinical decision support
- AI can help with differential diagnosis in real-time
- Always maintain patient confidentiality

### "What if I have technical issues?"
- Use the help center for common troubleshooting
- Check your internet connection for upload/AI issues
- Contact support through the help center
- Most issues resolve with browser refresh

## Next Steps After Getting Started

### Week 1 Goals
- Complete at least 10 AI conversations
- Try 5 different calculators relevant to your practice
- Upload 3-5 key medical documents
- Customize your dashboard preferences

### Month 1 Goals
- Build a personal knowledge base with 20+ documents
- Develop proficiency with specialty-specific calculators
- Integrate MediMind into daily clinical workflows
- Explore advanced AI features like image analysis

### Ongoing Development
- Regular knowledge base updates with new literature
- Participation in advanced training webinars
- Community engagement and best practice sharing
- Feature exploration as new capabilities are released

## Troubleshooting Quick Fixes

### AI Not Responding?
- Check internet connection
- Refresh the page
- Try a simpler question first
- Contact support if issue persists

### Calculator Giving Errors?
- Verify all required fields are completed
- Check that values are within normal ranges
- Try clearing and re-entering data
- Refer to calculator help text

### Can't Upload Documents?
- Check file size (max 500MB for PDFs)
- Ensure file is in supported format (PDF, DOC, TXT)
- Try uploading one file at a time
- Verify internet connection stability

*Ready to dive deeper? Continue with the "AI Co-Pilot Mastery Guide" for advanced techniques.*
          `
        },
        {
          id: 'workspace-overview',
          title: 'Understanding Your Workspace',
          difficulty: 'beginner',
          tags: ['workspace', 'navigation'],
          content: `
# Understanding Your Workspace

Your MediMind Expert workspace is designed specifically for ${profile?.medical_specialty || 'your medical specialty'} practice.

## Main Features

### AI Co-Pilot
Your intelligent medical assistant that can:
- Answer clinical questions
- Discuss patient cases
- Provide evidence-based recommendations
- Suggest relevant medical calculators

### Medical Calculators
Professional-grade calculators including:
${profile?.medical_specialty === 'cardiology' ? `
- ASCVD Risk Calculator
- GRACE Score
- CHA2DS2-VASc Score
- HAS-BLED Score
- DAPT Score
- And 11 more cardiology calculators
` : profile?.medical_specialty === 'ob-gyn' ? `
- EDD Calculator
- Gestational Age Calculator
- Bishop Score
- Apgar Score
- Preeclampsia Risk Calculator
- And 8 more OB/GYN calculators
` : `
- Specialty-specific clinical calculators
- Risk assessment tools
- Scoring systems
- Evidence-based calculations
`}

### Knowledge Base
- Upload medical documents and literature
- AI-powered document search
- Personal document library
- Integration with AI conversations

### Case Management
- Create anonymized patient cases
- Discuss complex cases with AI
- Track case discussions
- Maintain case library

## Navigation Tips
- Use the sidebar to switch between features
- Return to workspace overview anytime
- Access help from any page
- Profile settings always available in top-right menu
          `
        }
      ]
    },
    {
      id: 'ai-copilot',
      title: 'AI Co-Pilot',
      icon: <Bot className="w-6 h-6" />,
      description: 'Master your intelligent medical assistant',
      articles: [
        {
          id: 'ai-copilot-mastery',
          title: 'AI Co-Pilot Mastery Guide',
          difficulty: 'intermediate',
          tags: ['ai', 'comprehensive', 'mastery'],
          content: `
# AI Co-Pilot Mastery Guide

Transform your clinical workflow with advanced AI assistance techniques.

## Understanding Your AI Co-Pilot

### Core Capabilities
Your AI Co-Pilot is designed specifically for medical professionals with:

**Clinical Intelligence:**
- Evidence-based medical responses from trusted sources
- Real-time analysis of medical images and lab results
- Drug interaction checking and medication guidance
- Differential diagnosis assistance with probability ranking
- Treatment protocol recommendations with guideline citations

**Specialty Knowledge:**
- ${profile?.medical_specialty === 'cardiology' ? 'Advanced cardiology expertise including interventional procedures, heart failure management, and electrophysiology' : profile?.medical_specialty === 'ob-gyn' ? 'Comprehensive obstetric and gynecologic knowledge including high-risk pregnancy, reproductive endocrinology, and gynecologic oncology' : 'Comprehensive medical knowledge tailored to your specialty'}
- Current medical literature and guideline integration
- Specialty-specific calculator recommendations
- Clinical decision support for complex cases

**Integration Features:**
- Seamless calculator result analysis and interpretation
- Personal knowledge base document referencing
- Case management and patient discussion threads
- Multi-modal input processing (text, images, data)

### Knowledge Base System

**Dual Knowledge Architecture:**
Your AI Co-Pilot operates with two distinct knowledge bases:

**1. Curated Knowledge Base (Flowise)**
- Professionally curated medical content
- Current clinical guidelines and protocols
- Evidence-based treatment recommendations
- Validated diagnostic and therapeutic information
- **Best for:** General medical questions, guideline consultations, standard clinical scenarios

**2. Personal Knowledge Base (OpenAI Vector Store)**
- Your uploaded documents and literature
- Institution-specific protocols and guidelines
- Personal research collection and notes
- Specialty-focused content library
- **Best for:** Referencing specific literature, institutional protocols, specialized research

**Smart Knowledge Selection:**
- The system automatically suggests the most relevant knowledge base
- You can manually switch between knowledge bases during conversations
- Responses integrate information from both sources when appropriate
- Personal documents enhance and contextualize curated content

## Advanced Prompting Techniques

### Clinical Scenario Framework
Structure complex cases using this proven framework:

**Template:**
\`\`\`
Patient: [Age, Sex, Relevant Demographics]
Chief Complaint: [Primary presenting symptom]
History: [Relevant medical history, medications, allergies]
Physical Exam: [Pertinent findings]
Diagnostics: [Lab results, imaging, other tests]
Question: [Specific clinical question or request]
\`\`\`

**Example:**
\`\`\`
Patient: 67-year-old female with DM2, HTN, CAD s/p PCI 2019
Chief Complaint: Progressive dyspnea on exertion for 3 weeks
History: Takes metformin, lisinopril, metoprolol, atorvastatin. NKDA.
Physical Exam: JVD at 8cm, bilateral lower extremity edema, S3 gallop
Diagnostics: BNP 1250, Cr 1.4 (baseline 1.1), EF 35% on echo
Question: Optimize heart failure management and assess for device therapy eligibility
\`\`\`

### Multi-Turn Conversation Strategies

**Progressive Inquiry Technique:**
1. Start with broad clinical question
2. Follow up with specific diagnostic queries
3. Request treatment options with evidence levels
4. Ask for monitoring parameters and follow-up plans

**Example Sequence:**
1. "What are the current guidelines for managing acute heart failure with reduced ejection fraction?"
2. "For this patient with EF 35%, what device therapies should be considered?"
3. "What are the specific criteria for CRT-D implantation in this scenario?"
4. "Develop a monitoring plan for post-discharge care"

### Image Analysis Optimization

**Medical Image Upload Best Practices:**

**ECG Analysis:**
- Upload clear, high-resolution images
- Include patient age and relevant medications
- Specify what specific abnormalities to evaluate
- Request comparison with previous ECGs when available

**Lab Results:**
- Provide reference ranges when not visible
- Include relevant clinical context
- Ask for trend analysis when multiple results available
- Request specific abnormality explanations

**Imaging Studies:**
- Specify the type of study and indication
- Include relevant clinical history
- Ask for structured reporting format
- Request differential diagnosis considerations

## Calculator Integration Mastery

### Intelligent Calculator Suggestions
Your AI Co-Pilot automatically suggests relevant calculators based on:
- Patient demographics mentioned
- Clinical symptoms described
- Risk factors identified
- Treatment decisions needed

### Seamless Workflow Integration
**Optimal Process:**
1. Discuss clinical scenario with AI
2. Accept calculator suggestions or request specific ones
3. Complete calculator with patient data
4. Share results back to AI for interpretation
5. Request clinical action plans based on results

**Example Workflow:**
\`\`\`
User: "65-year-old male smoker with chest pain, family history of CAD"
AI: [Suggests ASCVD Risk Calculator]
User: [Completes calculator, shares result: 15.2% 10-year risk]
AI: [Provides detailed interpretation, statin recommendations, lifestyle modifications]
User: "What monitoring is needed if we start high-intensity statin therapy?"
AI: [Provides monitoring protocol with timeline]
\`\`\`

### Advanced Calculator Applications

**Risk Stratification Conversations:**
- Use multiple calculators for comprehensive assessment
- Compare results across different risk models
- Discuss calculator limitations and clinical judgment
- Plan interventions based on combined risk profiles

**Treatment Monitoring:**
- Regular calculator updates to track patient progress
- Trending risk scores over time
- Adjustment recommendations based on changing parameters
- Outcomes prediction and goal setting

## Knowledge Base Optimization

### Document Upload Strategy

**Essential Documents for Your Library:**
${profile?.medical_specialty === 'cardiology' ? `
- Latest ACC/AHA cardiovascular guidelines
- ESC guidelines for your subspecialty areas
- Recent high-impact cardiology journal articles
- Institutional cardiac catheterization protocols
- Heart failure management pathways
- Anticoagulation decision algorithms
- Cardiac imaging interpretation guides
` : profile?.medical_specialty === 'ob-gyn' ? `
- ACOG Practice Bulletins and Committee Opinions
- Maternal-Fetal Medicine Society guidelines
- Recent OB/GYN journal articles and research
- Institutional obstetric emergency protocols
- Gynecologic oncology staging and treatment protocols
- Reproductive endocrinology management guidelines
- High-risk pregnancy management pathways
` : `
- Current specialty-specific clinical guidelines
- Recent high-impact medical literature
- Institutional protocols and pathways
- Evidence-based treatment algorithms
- Diagnostic and therapeutic decision trees
- Quality improvement and safety protocols
`}

**Document Optimization Techniques:**
- Use descriptive, searchable filenames
- Upload documents with clear text (avoid scanned images)
- Organize by topic, date, and relevance
- Regular updates with latest literature
- Include both guidelines and research studies

### Personal Knowledge Integration

**Referencing Your Documents:**
- Mention specific document names in conversations
- Ask AI to compare institutional vs. national guidelines
- Request evidence levels from your uploaded literature
- Cross-reference multiple sources for complex decisions

**Advanced Search Techniques:**
- Use specific medical terms from your documents
- Reference authors or study names for precise matching
- Ask for synthesis across multiple uploaded papers
- Request citation-style references for clinical documentation

## Clinical Decision Support Workflows

### Differential Diagnosis Assistance

**Structured Approach:**
1. Present clinical syndrome systematically
2. Request probability-ranked differential diagnosis
3. Ask for diagnostic test recommendations with rationale
4. Discuss cost-effective diagnostic strategies
5. Plan treatment approach for most likely diagnoses

### Treatment Protocol Development

**Comprehensive Treatment Planning:**
1. Discuss evidence-based treatment options
2. Consider patient-specific factors and contraindications
3. Develop step-wise treatment algorithms
4. Plan monitoring and follow-up strategies
5. Identify decision points for treatment modification

### Emergency Consultation Support

**Rapid Decision Support:**
- Structured emergency presentations for quick AI analysis
- Request immediate stabilization measures
- Ask for evidence-based emergency protocols
- Get rapid calculator results for critical decisions
- Obtain transfer criteria and consultation indications

## Advanced Features and Techniques

### Case Management Integration

**Complex Case Development:**
- Create detailed anonymized patient cases
- Track case evolution over multiple encounters
- Use AI for case presentation preparation
- Develop teaching cases from complex scenarios

### Multi-Modal Input Processing

**Combining Input Types:**
- Text descriptions with image uploads
- Calculator results with clinical narratives
- Document references with specific questions
- Laboratory trends with clinical assessments

### Conversation Threading

**Long-Term Clinical Relationships:**
- Maintain patient context across multiple sessions
- Track clinical decision rationale over time
- Build comprehensive care plans with AI assistance
- Document clinical reasoning for medicolegal purposes

## Quality Assurance and Validation

### AI Response Verification
- Always verify AI recommendations against current guidelines
- Cross-check drug dosing and interaction information
- Validate calculator results independently
- Confirm diagnostic and therapeutic recommendations

### Clinical Judgment Integration
- Use AI as clinical decision support, not replacement
- Apply professional experience and expertise
- Consider patient preferences and individual circumstances
- Maintain responsibility for all clinical decisions

## Troubleshooting and Optimization

### Performance Optimization
- Use specific medical terminology for better accuracy
- Provide complete clinical context for comprehensive responses
- Structure questions clearly and logically
- Follow up with clarifying questions when needed

### Common Issues and Solutions
- **Vague responses**: Add more clinical detail and context
- **Outdated information**: Reference specific guidelines or timeframes
- **Generic recommendations**: Provide patient-specific factors
- **Calculator errors**: Verify input parameters and ranges

*Master these techniques to transform your clinical decision-making with AI assistance.*
          `
        },
        {
          id: 'knowledge-base-guide',
          title: 'Knowledge Base Mastery',
          difficulty: 'intermediate',
          tags: ['knowledge-base', 'documents', 'personal-library'],
          content: `
# Knowledge Base Mastery

Build and leverage your personal medical library for enhanced AI interactions.

## Understanding Your Knowledge System

### Dual Knowledge Architecture

**Personal Knowledge Base (Your Documents):**
- Documents YOU upload and manage
- Institutional protocols and guidelines
- Specialty-specific literature and research
- Personal notes and reference materials
- Custom clinical pathways and algorithms

**Curated Knowledge Base (MediMind Library):**
- Professionally curated medical content
- Current clinical guidelines and protocols
- Evidence-based treatment recommendations
- Validated diagnostic information
- Continuously updated medical knowledge

### When to Use Each Knowledge Base

**Use Personal KB for:**
- Institution-specific protocols and guidelines
- Recent literature you've uploaded
- Specialized research in your field
- Personal clinical reference materials
- Custom treatment algorithms

**Use Curated KB for:**
- General medical questions and guidelines
- Standard clinical decision support
- Evidence-based treatment recommendations
- Broad medical knowledge queries
- When you don't have specific literature

## Document Upload Optimization

### Best Documents to Upload

**Essential Clinical Guidelines:**
${profile?.medical_specialty === 'cardiology' ? `
- ACC/AHA Cardiovascular Prevention Guidelines
- Heart Failure Management Guidelines (AHA/ACC/HFSA)
- Atrial Fibrillation Management (AHA/ACC/ESC)
- STEMI and NSTEMI Guidelines
- Valvular Heart Disease Guidelines
- Electrophysiology and Device Guidelines
- Cardiovascular Imaging Standards
` : profile?.medical_specialty === 'ob-gyn' ? `
- ACOG Practice Bulletins (updated annually)
- Maternal-Fetal Medicine Society Guidelines
- Gynecologic Oncology Guidelines (NCCN)
- Reproductive Endocrinology Protocols
- High-Risk Pregnancy Management
- Labor and Delivery Guidelines
- Contraception and Family Planning
` : `
- Specialty-specific clinical guidelines
- National society recommendations
- Evidence-based protocols
- Treatment algorithms
- Diagnostic criteria
- Quality metrics and outcomes
`}

**High-Impact Research:**
- Recent meta-analyses in your field
- Landmark clinical trials
- Systematic reviews from top journals
- Practice-changing research studies
- Safety alerts and drug advisories

**Institutional Resources:**
- Your hospital's clinical pathways
- Department-specific protocols
- Quality improvement initiatives
- Antibiogram and local resistance patterns
- Formulary and medication guidelines

### Document Preparation Best Practices

**File Format Optimization:**
- **PDF (Preferred)**: Best text extraction and processing
- **Word Documents**: Good for protocol documents
- **Text Files**: Excellent for guidelines and algorithms

**File Naming Strategy:**
\`\`\`
[Category]_[Topic]_[Date]_[Source].pdf

Examples:
Cardiology_HeartFailure_2023_AHA.pdf
Protocol_ChestPain_2024_YourHospital.pdf
Research_SGLT2_MetaAnalysis_2024_NEJM.pdf
\`\`\`

**Quality Optimization:**
- Use text-based PDFs, not scanned images
- Ensure clear, readable fonts
- Remove unnecessary pages (covers, indices)
- Combine related protocols into single documents

## AI Integration Strategies

### Document Referencing in Conversations

**Specific Document Queries:**
\`\`\`
"According to the 2023 AHA Heart Failure Guidelines I uploaded, what are the recommendations for SGLT2 inhibitors?"

"Compare the chest pain protocol from my hospital with current AHA recommendations"

"Summarize the key findings from the recent SGLT2 meta-analysis in my knowledge base"
\`\`\`

**Cross-Reference Analysis:**
- Ask AI to compare multiple uploaded documents
- Request synthesis of institutional vs. national guidelines
- Analyze conflicts or differences between sources
- Get recommendations for protocol updates

### Advanced Search Techniques

**Precision Searching:**
- Reference specific sections or page numbers
- Mention author names or study titles
- Use exact terminology from your documents
- Specify publication dates or versions

**Contextual Integration:**
- Combine document knowledge with clinical scenarios
- Reference multiple sources for complex decisions
- Ask for evidence levels from your literature
- Request citation-style references for documentation

## Personal Library Organization

### Category System

**Organizational Structure:**
\`\`\`
Guidelines/
├── National_Society_Guidelines/
├── International_Guidelines/
├── Institutional_Protocols/
└── Local_Pathways/

Research/
├── Meta_Analyses/
├── Clinical_Trials/
├── Reviews/
└── Case_Studies/

References/
├── Drug_Information/
├── Diagnostic_Criteria/
├── Risk_Calculators/
└── Teaching_Materials/
\`\`\`

### Document Lifecycle Management

**Regular Updates:**
- Monthly review of new guideline releases
- Quarterly literature searches for practice updates
- Annual institutional protocol reviews
- Remove outdated or superseded documents

**Version Control:**
- Keep only current versions of guidelines
- Note update dates in filenames
- Archive old versions in separate folders
- Track when documents were last reviewed

## Advanced Knowledge Base Features

### Document Processing Intelligence

**AI Processing Capabilities:**
- Text extraction and indexing
- Key concept identification
- Relationship mapping between documents
- Citation and reference tracking
- Summary generation for quick reference

**Search Enhancement:**
- Semantic search across all documents
- Cross-document concept linking
- Related content suggestions
- Automatic citation formatting

### Integration with Clinical Workflow

**Point-of-Care Access:**
- Quick document search during patient encounters
- Instant protocol lookup for emergency situations
- Medication checking against formulary
- Guideline verification for treatment decisions

**Documentation Support:**
- AI-generated clinical summaries with citations
- Evidence-based treatment justifications
- Protocol compliance documentation
- Quality metric tracking and reporting

## Collaboration and Sharing

### Team Knowledge Building

**Department Libraries:**
- Shared institutional protocols
- Team-specific guidelines and pathways
- Best practice documentation
- Educational resources and training materials

**Knowledge Sharing:**
- Export important conversations for team review
- Share calculator results with evidence
- Create teaching cases from complex scenarios
- Generate clinical summaries for handoffs

### Quality Assurance

**Document Validation:**
- Verify document authenticity and currency
- Cross-check against official sources
- Validate AI interpretations against original text
- Maintain source attribution and references

**Accuracy Monitoring:**
- Regular spot-checks of AI document references
- Verification of citation accuracy
- Monitoring for outdated information
- Feedback on AI interpretation quality

## Troubleshooting Common Issues

### Upload Problems
**File Won't Upload:**
- Check file size (max 500MB for PDFs)
- Verify file format compatibility
- Ensure stable internet connection
- Try uploading one file at a time

**Processing Delays:**
- Large documents may take 2-5 minutes to process
- Complex formatting can slow processing
- Multiple simultaneous uploads cause delays
- Check processing status in document manager

### Search and Reference Issues

**AI Can't Find Document:**
- Verify document name and spelling
- Try searching for key phrases from the document
- Check if document processing completed successfully
- Use broader search terms initially

**Inaccurate References:**
- Provide more specific context in queries
- Reference exact sections or page numbers
- Verify original document content
- Report persistent accuracy issues to support

### Performance Optimization

**Faster Document Access:**
- Use descriptive, searchable filenames
- Keep frequently used documents in root folder
- Regular cleanup of outdated materials
- Optimize document quality before upload

**Better AI Integration:**
- Provide context when referencing documents
- Use specific medical terminology
- Ask follow-up questions for clarification
- Verify AI interpretations against source material

*Build a comprehensive personal medical library that transforms your AI interactions and clinical decision-making.*
          `
        },
        {
          id: 'effective-prompting',
          title: 'Advanced Clinical Prompting',
          difficulty: 'advanced',
          tags: ['ai', 'prompting', 'clinical-scenarios'],
          content: `
# Advanced Clinical Prompting

Master the art of clinical AI communication for optimal diagnostic and therapeutic guidance.

## Clinical Communication Framework

### The SOAP-Enhanced Prompting Method

**Structure for Complex Cases:**
\`\`\`
Subjective: [Patient presentation and history]
Objective: [Physical exam, vitals, diagnostics]
Assessment: [Your clinical thinking and differential]
Plan: [Specific question or request for AI]
\`\`\`

**Example Implementation:**
\`\`\`
Subjective: 
- 72-year-old male presents with 3-day history of progressive dyspnea
- PMH: CAD s/p CABG 2018, DM2, HTN, CKD Stage 3
- Medications: Metoprolol 50mg BID, lisinopril 10mg daily, metformin 1000mg BID
- Reports medication compliance, no recent dietary changes

Objective:
- VS: BP 160/95, HR 110, RR 24, O2 sat 88% on RA, improved to 94% on 2L NC
- Physical: JVD to jaw, bilateral crackles to mid-lung fields, S3 gallop, 3+ LE edema
- Labs: BNP 2100, Cr 2.1 (baseline 1.8), eGFR 32, K+ 4.8
- CXR: Bilateral pulmonary edema, cardiomegaly
- ECG: Sinus tachycardia, old Q waves in inferior leads

Assessment:
- Acute decompensated heart failure, likely HFrEF given history
- Possible precipitating factor unclear - medication compliance reported

Plan:
Please provide evidence-based recommendations for:
1. Immediate stabilization measures
2. Diuretic strategy given CKD
3. ACE inhibitor adjustment considerations
4. Discharge planning and follow-up protocol
\`\`\`

### Specialty-Specific Prompting Patterns

**${profile?.medical_specialty === 'cardiology' ? 'Cardiology' : profile?.medical_specialty === 'ob-gyn' ? 'OB/GYN' : 'Clinical'} Excellence Framework:**

${profile?.medical_specialty === 'cardiology' ? `
**Acute Coronary Syndrome Evaluation:**
\`\`\`
Patient Profile: [Age, sex, risk factors]
Presentation: [Chest pain characteristics, timing, triggers]
Risk Stratification: [TIMI/GRACE score components]
Diagnostics: [ECG findings, troponin trends, imaging]
Clinical Question: [Specific management decision needed]
Guidelines Referenced: [Specify AHA/ACC, ESC, or institutional]
\`\`\`

**Heart Failure Management:**
\`\`\`
Heart Failure Type: [HFrEF, HFpEF, HFmrEF with EF%]
NYHA Class: [Current functional status]
Guideline-Directed Therapy: [Current medications and doses]
Comorbidities: [CKD, diabetes, COPD, etc.]
Recent Changes: [Hospitalizations, medication adjustments]
Specific Need: [Optimization, device consideration, monitoring]
\`\`\`

**Arrhythmia Assessment:**
\`\`\`
Arrhythmia Type: [Specific rhythm with ECG characteristics]
Hemodynamic Status: [Stable vs. unstable presentation]
Structural Heart Disease: [Echo findings, prior imaging]
Stroke Risk: [CHA2DS2-VASc components]
Bleeding Risk: [HAS-BLED components]
Decision Point: [Anticoagulation, rate vs. rhythm control, ablation]
\`\`\`
` : profile?.medical_specialty === 'ob-gyn' ? `
**Pregnancy Management Framework:**
\`\`\`
Gestational Age: [Weeks + days, dating method]
Gravidity/Parity: [Complete obstetric history]
Risk Factors: [Maternal age, medical conditions, prior pregnancy complications]
Current Issue: [Specific clinical concern or findings]
Prenatal Care: [Previous visits, screening results, growth parameters]
Management Question: [Specific decision or protocol needed]
\`\`\`

**Gynecologic Assessment:**
\`\`\`
Patient Demographics: [Age, menstrual history, reproductive goals]
Chief Complaint: [Specific symptoms with timing and characteristics]
Examination Findings: [Pelvic exam, imaging results]
Relevant History: [Surgical, hormonal, cancer screening]
Differential Considerations: [Your clinical thinking]
Clinical Decision: [Diagnostic workup, treatment options, referral needs]
\`\`\`

**High-Risk Pregnancy Consultation:**
\`\`\`
Maternal Factors: [Age, BMI, medical comorbidities]
Pregnancy Complications: [Current and historical]
Fetal Considerations: [Growth, anatomy, genetic factors]
Delivery Planning: [Timing, mode, special considerations]
Monitoring Strategy: [Frequency, specific assessments]
Consultation Need: [MFM referral, delivery planning, management adjustments]
\`\`\`
` : `
**Clinical Decision Support Framework:**
\`\`\`
Clinical Scenario: [Presenting problem with context]
Patient Factors: [Relevant demographics and comorbidities]
Current Management: [Treatments tried, current medications]
Diagnostic Data: [Lab results, imaging, other studies]
Decision Point: [Specific clinical question or choice]
Guidelines: [Relevant professional society recommendations]
\`\`\`
`}

## Advanced Multi-Turn Conversation Strategies

### Progressive Clinical Inquiry

**Layered Investigation Approach:**

**Turn 1 - Initial Assessment:**
"Based on this presentation, what are the most likely diagnoses and immediate priorities?"

**Turn 2 - Diagnostic Refinement:**
"Given the [specific finding], which additional studies would help differentiate between [condition A] and [condition B]?"

**Turn 3 - Treatment Planning:**
"For this most likely diagnosis, what are the evidence-based treatment options, and how do the patient's comorbidities affect the choice?"

**Turn 4 - Monitoring and Follow-up:**
"What monitoring parameters should guide therapy adjustments, and what are the key decision points for treatment modification?"

### Complex Case Evolution

**Longitudinal Case Management:**
- Track patient progress across multiple encounters
- Update AI on clinical response to interventions
- Modify management based on evolving clinical picture
- Document decision-making rationale for continuity

**Example Progression:**
\`\`\`
Initial Visit: Present new diagnosis with treatment initiation
Week 2 Follow-up: Report response to treatment, side effects, lab changes
Month 1: Discuss optimization opportunities, additional interventions
Month 3: Evaluate long-term outcomes, prevention strategies
\`\`\`

## Image Analysis Optimization

### Medical Image Upload Excellence

**ECG Analysis Mastery:**
\`\`\`
Clinical Context: [Symptoms, medications, prior ECGs]
Specific Request: [Rhythm analysis, ST changes, comparison study]
Patient Factors: [Age, gender, cardiac history]
Upload Quality: [12-lead, clear resolution, proper calibration]
Analysis Focus: [What specific abnormalities to evaluate]
\`\`\`

**Laboratory Result Interpretation:**
\`\`\`
Clinical Scenario: [Why these labs were ordered]
Timing: [Relationship to symptoms, medications, procedures]
Trend Analysis: [Prior values for comparison]
Reference Ranges: [If not visible on results]
Specific Questions: [Which abnormalities need explanation]
\`\`\`

**Imaging Study Analysis:**
\`\`\`
Study Type and Indication: [CT, MRI, X-ray with clinical reason]
Clinical History: [Relevant symptoms and prior imaging]
Specific Focus Areas: [What findings to emphasize]
Comparison Studies: [Prior imaging available]
Clinical Decision: [How results will guide management]
\`\`\`

## Calculator Integration Mastery

### Strategic Calculator Utilization

**Pre-Calculator Discussion:**
"For this clinical scenario, which risk calculators would provide the most clinically relevant information?"

**Post-Calculator Analysis:**
"Given these calculator results [share specific scores], how do these findings influence evidence-based treatment recommendations?"

**Comparative Assessment:**
"Compare the risk assessment from [Calculator A] versus [Calculator B] for this patient, and discuss which is more applicable."

### Advanced Calculator Workflows

**Risk Stratification Conversation:**
1. Present clinical scenario
2. Accept AI calculator suggestions
3. Complete multiple relevant calculators
4. Share all results for comprehensive analysis
5. Request integrated risk assessment
6. Discuss treatment implications
7. Plan monitoring and reassessment timeline

**Treatment Monitoring Application:**
- Use calculators at baseline, intervention, and follow-up
- Track score changes over time
- Correlate improvements with interventions
- Adjust therapy based on trending results

## Evidence Integration Techniques

### Literature-Based Decision Making

**Research Question Formation:**
"Based on this clinical scenario, what does the most recent evidence say about [specific intervention] in [patient population] with [specific characteristics]?"

**Guideline Synthesis:**
"Compare the recommendations from [Professional Society A] versus [Professional Society B] for this clinical situation, and explain any differences."

**Evidence Quality Assessment:**
"What is the strength of evidence supporting [specific recommendation], and are there any recent studies that might change this recommendation?"

### Personal Knowledge Base Integration

**Document-Specific Queries:**
"According to the [specific guideline] I uploaded, what are the recommended monitoring parameters for [medication/intervention]?"

**Comparative Analysis:**
"Compare my institution's protocol for [condition] with current national guidelines, and identify any areas needing updates."

**Evidence Synthesis:**
"Synthesize recommendations from the three most recent papers I uploaded about [clinical topic] and provide a unified approach."

## Quality Assurance and Validation

### AI Response Verification

**Critical Evaluation Questions:**
- Does this recommendation align with current guidelines?
- Are medication doses and frequencies accurate?
- Do the contraindications mentioned match established literature?
- Is the risk-benefit analysis appropriate for this patient?

**Source Verification:**
- Request specific citations for recommendations
- Cross-check medication information with reliable sources
- Verify calculator interpretations with original publications
- Confirm diagnostic criteria against professional society standards

### Clinical Judgment Integration

**Professional Decision Framework:**
- Use AI recommendations as clinical decision support
- Apply personal clinical experience and expertise
- Consider patient preferences and individual circumstances
- Maintain ultimate responsibility for clinical decisions
- Document reasoning for medico-legal protection

## Troubleshooting Advanced Prompting

### Common Issues and Solutions

**Vague or Generic Responses:**
- Add more specific clinical detail and context
- Provide patient-specific factors and comorbidities
- Reference specific guidelines or timeframes
- Ask targeted follow-up questions

**Inconsistent Recommendations:**
- Specify which guidelines or evidence to prioritize
- Provide more complete clinical picture
- Ask for explanation of recommendation rationale
- Request comparison of different approaches

**Outdated Information:**
- Reference specific recent guidelines or studies
- Upload current literature to personal knowledge base
- Ask for most recent evidence on specific topics
- Verify recommendations against current practice

*Master these advanced prompting techniques to unlock the full potential of AI-assisted clinical decision making.*
          `
        },
        {
          id: 'file-uploads-advanced',
          title: 'Advanced File Upload & Analysis',
          difficulty: 'advanced',
          tags: ['files', 'upload', 'analysis', 'images'],
          content: `
# Advanced File Upload & Analysis

Master multi-modal medical content analysis for comprehensive clinical insights.

## Comprehensive File Support System

### Medical Image Analysis

**Supported Image Types:**
- **ECG Strips**: 12-lead ECGs, rhythm strips, Holter excerpts
- **Laboratory Reports**: Blood work, urinalysis, microbiology results
- **Medical Imaging**: Chest X-rays, CT scans, MRI slices, ultrasound images
- **Clinical Photography**: Dermatologic lesions, wound assessments, clinical findings
- **Diagnostic Reports**: Echo reports, stress test results, catheterization findings

**Optimal Image Quality Guidelines:**
\`\`\`
Resolution: Minimum 1024x768 for text readability
Format: JPEG, PNG, or PDF for best processing
Lighting: Even, bright lighting for document photos
Focus: Sharp focus on all text and important details
Orientation: Correct orientation for easy reading
\`\`\`

### Document Processing Excellence

**Professional Documents:**
- Medical literature (PDFs up to 50MB)
- Clinical guidelines and protocols
- Research papers and systematic reviews
- Institutional policies and procedures
- Patient care pathways and algorithms

**Optimal Document Formats:**
- **PDF (Preferred)**: Best for text extraction and analysis
- **Word Documents**: Excellent for editable protocols
- **PowerPoint**: Good for educational materials
- **Text Files**: Perfect for guidelines and algorithms

## Advanced Upload Techniques

### Multi-File Upload Strategies

**Batch Upload Organization:**
1. **Related Documents**: Upload complementary files together
   - Example: Upload ECG + lab results + echo report for comprehensive case analysis

2. **Sequential Analysis**: Upload files in logical clinical order
   - Example: Pre-procedure → Procedure report → Post-procedure follow-up

3. **Comparative Studies**: Upload before/after studies for trend analysis
   - Example: Serial labs, imaging studies, or cardiac studies over time

### Context-Aware Upload Preparation

**Pre-Upload Clinical Context:**
\`\`\`
"I'm uploading an ECG from a 65-year-old male with chest pain. 
Please analyze for:
- Acute coronary syndrome findings
- Arrhythmias or conduction abnormalities
- Comparison with normal findings for age
- Recommendations for further cardiac evaluation"
\`\`\`

**Specific Analysis Requests:**
- Identify specific abnormalities to focus on
- Request comparison with normal values
- Ask for clinical significance and next steps
- Specify patient population for relevant interpretation

## AI Analysis Capabilities

### ECG Analysis Mastery

**Comprehensive ECG Evaluation:**
The AI can identify and analyze:
- **Rhythm Analysis**: Sinus rhythm, arrhythmias, AV blocks, pacemaker rhythms
- **Rate Calculation**: Automatic heart rate determination with reliability assessment
- **Axis Determination**: QRS axis with clinical significance
- **Interval Measurements**: PR, QRS, QT intervals with normative comparisons
- **ST-Segment Analysis**: Elevation, depression with localization and severity
- **T-Wave Assessment**: Inversions, hyperacute changes, repolarization abnormalities
- **Chamber Enlargement**: Atrial and ventricular hypertrophy patterns

**Advanced ECG Interpretation:**
\`\`\`
Clinical Scenario: "Patient with crushing chest pain for 2 hours"
ECG Upload: [12-lead ECG image]
Analysis Request: "Evaluate for STEMI with culprit vessel identification 
and recommendations for emergency management"

Expected AI Response:
- Specific ST elevation locations
- Culprit vessel identification
- STEMI vs. NSTEMI differentiation
- Urgency of reperfusion therapy
- Additional monitoring recommendations
\`\`\`

### Laboratory Analysis Excellence

**Comprehensive Lab Interpretation:**
- **Complete Blood Count**: Automated differential with clinical correlations
- **Basic Metabolic Panel**: Electrolyte abnormalities with clinical significance
- **Liver Function Tests**: Pattern recognition for hepatic vs. cholestatic injury
- **Lipid Panels**: Risk stratification with guideline-based interpretations
- **Cardiac Markers**: Troponin trending with MI diagnosis and prognosis
- **Inflammatory Markers**: ESR, CRP with differential diagnosis considerations

**Advanced Lab Analysis Requests:**
\`\`\`
Lab Context: "Serial troponins in patient with chest pain"
Upload: [Lab results from 0, 6, and 12 hours]
Analysis Request: "Interpret troponin kinetics for MI diagnosis, 
estimate infarct size, and provide prognostic information"
\`\`\`

### Medical Imaging Analysis

**Supported Imaging Analysis:**
- **Chest X-rays**: Cardiothoracic ratio, pulmonary edema, pneumonia patterns
- **CT Scans**: Anatomical abnormalities, contrast enhancement patterns
- **MRI Images**: Tissue characterization, anatomical variants
- **Ultrasound**: Cardiac function, vascular assessments, obstetric measurements
- **Nuclear Imaging**: Perfusion defects, functional assessments

**Structured Imaging Analysis:**
\`\`\`
Clinical Context: "Dyspnea in elderly patient with heart failure history"
Image Upload: [Chest X-ray]
Analysis Framework:
- Cardiothoracic ratio measurement
- Pulmonary vascular pattern assessment
- Evidence of pulmonary edema
- Pleural effusion evaluation
- Comparison with heart failure staging
- Treatment response monitoring recommendations
\`\`\`

## Clinical Integration Workflows

### Multi-Modal Case Presentation

**Comprehensive Case Upload Strategy:**
1. **Patient History**: Text description with relevant clinical details
2. **Physical Exam Findings**: Structured presentation with abnormalities
3. **Diagnostic Images**: ECGs, X-rays, or relevant studies
4. **Laboratory Data**: Relevant lab results with trends
5. **Specific Question**: Targeted clinical decision request

**Example Multi-Modal Workflow:**
\`\`\`
Text: "67-year-old female with 3-day progressive dyspnea, orthopnea, 
and lower extremity edema. History of CAD, diabetes, hypertension."

ECG Upload: [12-lead ECG showing sinus tachycardia, old Q waves]

Lab Upload: [BNP 1850, Cr 1.6, K+ 3.2]

X-ray Upload: [Chest X-ray showing cardiomegaly, pulmonary vascular congestion]

Clinical Question: "Provide comprehensive heart failure assessment with:
- Severity staging based on all available data
- Evidence-based treatment recommendations
- Monitoring plan for acute management
- Discharge planning considerations"
\`\`\`

### Longitudinal Monitoring Workflows

**Serial Study Analysis:**
- Upload baseline and follow-up studies for trend analysis
- Request comparison between time points
- Analyze treatment response based on objective changes
- Plan future monitoring based on current trends

**Trend Analysis Example:**
\`\`\`
Baseline Labs: [Upload initial BNP, creatinine, electrolytes]
Follow-up Labs: [Upload 48-hour post-diuresis results]
Analysis Request: "Compare pre- and post-treatment labs to assess:
- Degree of decongestion achieved
- Renal function preservation
- Electrolyte stability
- Recommendations for continued diuresis vs. optimization"
\`\`\`

## Advanced Analysis Techniques

### Comparative Analysis Requests

**Multi-Study Comparison:**
\`\`\`
"Compare these three serial ECGs taken at admission, 6 hours, and 24 hours:
- Evolution of ST-segment changes
- Evidence of successful reperfusion
- Development of Q waves or other complications
- Recommendations for ongoing monitoring"
\`\`\`

**Before/After Assessment:**
\`\`\`
"Analyze these pre- and post-procedure images:
- Evidence of successful intervention
- Residual abnormalities requiring attention
- Complications or concerning findings
- Follow-up recommendations"
\`\`\`

### Quantitative Analysis Requests

**Measurement and Calculation:**
- Request specific measurements from images
- Ask for quantitative assessments when possible
- Compare measurements to normal ranges
- Calculate derived parameters (ejection fraction, indices)

**Example Quantitative Analysis:**
\`\`\`
Echo Upload: [Echocardiogram images or report]
Analysis Request: "Provide quantitative assessment including:
- Left ventricular ejection fraction calculation
- Chamber size measurements with normal comparisons
- Diastolic function parameters
- Valvular function quantification
- Clinical classification and therapeutic implications"
\`\`\`

## Quality Optimization Strategies

### Pre-Upload Preparation

**Image Quality Checklist:**
- ✅ Adequate lighting for document photography
- ✅ Sharp focus on all text and important details
- ✅ Proper orientation (not sideways or upside down)
- ✅ Complete image capture (no cut-off text or borders)
- ✅ High resolution for detailed analysis

**Document Preparation:**
- ✅ Remove unnecessary pages (covers, blank pages)
- ✅ Ensure text-based PDFs rather than scanned images
- ✅ Combine related documents into single files when appropriate
- ✅ Use descriptive filenames for easy reference

### Upload Process Optimization

**Efficient Upload Workflow:**
1. **Prepare files in advance** for clinical encounters
2. **Upload multiple related files simultaneously** for comprehensive analysis
3. **Provide clinical context before uploading** for targeted analysis
4. **Verify successful upload** before proceeding with analysis requests

**Error Prevention:**
- Check file size limits (500MB for PDFs, 25MB for other documents)
- Verify supported file formats before uploading
- Ensure stable internet connection for large files
- Upload one file at a time if experiencing issues

## Privacy and Security Best Practices

### HIPAA Compliance for Uploads

**De-identification Requirements:**
- Remove all patient identifiers before uploading
- Mask dates of birth, medical record numbers
- Remove names, addresses, phone numbers
- Anonymize any unique identifying information

**Safe Upload Practices:**
- Use only anonymized or de-identified medical content
- Avoid uploading entire medical records
- Focus on specific clinical findings rather than comprehensive records
- Verify de-identification before each upload

### Institutional Compliance

**Workplace Guidelines:**
- Follow institutional policies for AI tool usage
- Obtain necessary approvals for medical image analysis
- Document AI assistance in clinical decision-making when required
- Maintain professional responsibility for all clinical decisions

*Master these advanced upload and analysis techniques to unlock comprehensive AI-powered clinical insights.*
          `
        },
        {
          id: 'case-management-workflows',
          title: 'Clinical Case Management Workflows',
          difficulty: 'advanced',
          tags: ['case-management', 'workflow', 'clinical-scenarios'],
          content: `
# Clinical Case Management Workflows

Master comprehensive patient case discussions with AI for optimal clinical decision-making.

## Case Management System Overview

### Comprehensive Case Creation

**Essential Case Components:**
- **Patient Demographics**: Age, sex, relevant social factors (anonymized)
- **Clinical Presentation**: Chief complaint with detailed symptom description
- **Medical History**: Past medical/surgical history, medications, allergies
- **Physical Examination**: Pertinent positive and negative findings
- **Diagnostic Results**: Labs, imaging, procedures with interpretation
- **Clinical Assessment**: Your differential diagnosis and clinical reasoning
- **Management Questions**: Specific decisions or guidance needed

**Case Security and Privacy:**
- All cases are automatically anonymized and encrypted
- No personal identifying information is stored
- Cases are accessible only to the creating user
- HIPAA-compliant infrastructure ensures data protection

### Advanced Case Discussion Framework

**Structured Case Presentation Template:**
\`\`\`
Case Title: [Descriptive title focusing on main clinical issue]

Patient Profile:
- Demographics: [Age, sex, relevant characteristics]
- Setting: [ED, inpatient, outpatient, ICU]

History of Present Illness:
- Chief Complaint: [Patient's primary concern]
- Symptom Timeline: [Onset, duration, progression]
- Characterization: [Quality, severity, aggravating/alleviating factors]
- Associated Symptoms: [Review of systems findings]

Past Medical History:
- Significant Conditions: [Relevant diagnoses with dates]
- Surgical History: [Procedures with dates and outcomes]
- Medications: [Current medications with doses]
- Allergies: [Drug allergies and reactions]
- Social History: [Relevant social factors]

Physical Examination:
- Vital Signs: [Complete vital signs with abnormalities highlighted]
- General Appearance: [Overall clinical assessment]
- System-Specific Findings: [Detailed examination by system]

Diagnostic Studies:
- Laboratory Results: [Relevant lab values with reference ranges]
- Imaging Studies: [Results with radiologist interpretations]
- Procedures: [ECG, biopsy, endoscopy results]

Clinical Assessment:
- Primary Diagnosis: [Most likely diagnosis with reasoning]
- Differential Diagnosis: [Alternative diagnoses with probability ranking]
- Clinical Reasoning: [Thought process and decision-making rationale]

Management Questions:
- Specific Clinical Decisions: [What guidance is needed]
- Treatment Options: [Considering benefits/risks]
- Monitoring Requirements: [What parameters to follow]
- Disposition Planning: [Discharge vs. admission considerations]
\`\`\`

## Specialty-Specific Case Workflows

### ${profile?.medical_specialty === 'cardiology' ? 'Cardiology' : profile?.medical_specialty === 'ob-gyn' ? 'OB/GYN' : 'Clinical'} Case Excellence

${profile?.medical_specialty === 'cardiology' ? `
**Acute Coronary Syndrome Case Framework:**
\`\`\`
Cardiology Case: [Age]-year-old with Acute Chest Pain

Risk Factor Profile:
- Traditional Risk Factors: [HTN, DM, smoking, family history, dyslipidemia]
- Risk Calculator Results: [ASCVD risk score, Framingham risk]
- Prior Cardiovascular Events: [MI, PCI, CABG history with dates]

Presentation Details:
- Chest Pain Characteristics: [Quality, location, radiation, triggers]
- Timing and Duration: [Onset, duration, pattern]
- Associated Symptoms: [Dyspnea, diaphoresis, nausea, syncope]
- Response to Treatments: [Nitroglycerin, oxygen, medications]

Cardiovascular Assessment:
- ECG Findings: [Rhythm, rate, ST changes, conduction abnormalities]
- Cardiac Markers: [Troponin trends with timing]
- Risk Stratification: [TIMI score, GRACE score components]
- Echocardiogram: [Wall motion, EF, valvular function]

Management Decisions:
- Reperfusion Strategy: [Primary PCI vs. fibrinolysis considerations]
- Antiplatelet Therapy: [DAPT selection and duration]
- Anticoagulation: [Agent selection based on bleeding risk]
- Secondary Prevention: [Statin therapy, ACE inhibitor, beta-blocker]
- Device Considerations: [ICD, pacemaker evaluation needs]
\`\`\`

**Heart Failure Case Management:**
\`\`\`
Heart Failure Case: [Age]-year-old with Decompensated Heart Failure

Heart Failure Characterization:
- Type: [HFrEF, HFpEF, HFmrEF with specific EF%]
- Etiology: [Ischemic, non-ischemic, valvular, hypertensive]
- NYHA Class: [Functional capacity assessment]
- Stage: [ACC/AHA staging A-D]

Current Therapy Assessment:
- Guideline-Directed Medical Therapy: [ACE-I/ARB, beta-blocker, aldosterone antagonist doses]
- Optimization Status: [Maximum tolerated doses, contraindications]
- Adherence Assessment: [Medication compliance, dietary sodium]
- Device Therapy: [ICD, CRT status and function]

Acute Management:
- Volume Status: [Clinical assessment, daily weights, BNP trends]
- Diuretic Strategy: [Loop diuretics, combination therapy, ultrafiltration]
- Hemodynamic Assessment: [Need for invasive monitoring, inotropes]
- Comorbidity Management: [Renal function, diabetes, COPD]

Long-term Planning:
- Optimization Opportunities: [Medication titration, device upgrades]
- Quality of Life: [Functional capacity, symptoms]
- Prognosis: [Risk stratification tools, transplant evaluation]
- Monitoring Plan: [Follow-up schedule, parameters to track]
\`\`\`

**Arrhythmia Management Cases:**
\`\`\`
Arrhythmia Case: [Age]-year-old with [Specific Arrhythmia]

Rhythm Analysis:
- Arrhythmia Type: [Specific diagnosis with ECG characteristics]
- Hemodynamic Impact: [Symptomatic vs. asymptomatic]
- Frequency and Duration: [Paroxysmal, persistent, permanent]
- Triggers: [Exercise, sleep, alcohol, caffeine]

Stroke Risk Assessment:
- CHA2DS2-VASc Score: [Individual components and total score]
- Bleeding Risk: [HAS-BLED score components]
- Anticoagulation Status: [Current therapy, INR control, adherence]

Management Strategy:
- Rate vs. Rhythm Control: [Strategy selection rationale]
- Antiarrhythmic Selection: [Drug choice based on heart disease, contraindications]
- Procedural Considerations: [Ablation candidacy, timing]
- Device Therapy: [Pacemaker, ICD indications]

Monitoring Requirements:
- Rhythm Monitoring: [Holter, event monitor, implantable loop recorder]
- Drug Monitoring: [Levels, organ function, proarrhythmia risk]
- Anticoagulation Monitoring: [INR, bleeding assessments]
\`\`\`
` : profile?.medical_specialty === 'ob-gyn' ? `
**High-Risk Pregnancy Case Framework:**
\`\`\`
Obstetric Case: [Age]-year-old G[x]P[x] at [x] weeks gestation

Pregnancy Assessment:
- Dating: [LMP, early ultrasound confirmation]
- Gravidity/Parity: [Complete obstetric history with outcomes]
- Current Gestational Age: [Weeks + days with dating method]
- Estimated Delivery Date: [EDD with confidence interval]

Risk Factor Analysis:
- Maternal Factors: [Age, BMI, medical conditions]
- Pregnancy-Specific Risks: [Preeclampsia, gestational diabetes, preterm labor]
- Fetal Factors: [Growth abnormalities, genetic conditions]
- Historical Factors: [Prior pregnancy complications, losses]

Current Pregnancy Course:
- Prenatal Care: [Frequency, provider type, compliance]
- Screening Results: [Genetic screening, anatomic survey]
- Growth Parameters: [Serial biometry, estimated fetal weight]
- Maternal-Fetal Surveillance: [NST, BPP, Doppler studies]

Management Decisions:
- Delivery Timing: [Spontaneous vs. indicated, optimal timing]
- Mode of Delivery: [Vaginal vs. cesarean indications]
- Monitoring Intensity: [Frequency of visits, testing schedule]
- Consultations: [MFM, anesthesia, neonatology, other specialties]
- Delivery Planning: [Location, personnel, special preparations]
\`\`\`

**Gynecologic Oncology Case Management:**
\`\`\`
Gynecologic Oncology Case: [Age]-year-old with [Suspected/Confirmed Cancer]

Cancer Assessment:
- Primary Site: [Cervical, ovarian, endometrial, vulvar, vaginal]
- Histologic Type: [Specific pathology with grade]
- Stage Assessment: [FIGO staging with imaging/surgical findings]
- Molecular Markers: [HER2, BRCA, Lynch syndrome, other relevant markers]

Diagnostic Workup:
- Imaging Studies: [CT, MRI, PET scan findings]
- Laboratory Studies: [CA-125, CEA, other tumor markers]
- Pathology Review: [Primary pathology, second opinion needs]
- Genetic Assessment: [Family history, genetic counseling needs]

Treatment Planning:
- Multidisciplinary Team: [Surgery, medical oncology, radiation oncology]
- Surgical Planning: [Extent of surgery, lymph node assessment]
- Systemic Therapy: [Neoadjuvant, adjuvant, palliative considerations]
- Radiation Therapy: [External beam, brachytherapy indications]

Survivorship Planning:
- Follow-up Schedule: [Surveillance imaging, physical exams]
- Toxicity Management: [Long-term effects, quality of life]
- Fertility Preservation: [Options discussed, decisions made]
- Psychosocial Support: [Counseling, support groups, resources]
\`\`\`

**Reproductive Endocrinology Cases:**
\`\`\`
Reproductive Endocrinology Case: [Age]-year-old with [Fertility/Reproductive Issue]

Reproductive Assessment:
- Reproductive Goals: [Pregnancy desires, timeline, contraception needs]
- Menstrual History: [Cycle regularity, ovulation assessment]
- Sexual History: [Frequency, timing, dysfunction issues]
- Contraceptive History: [Methods used, side effects, efficacy]

Infertility Evaluation (if applicable):
- Duration: [Time attempting conception]
- Female Factors: [Ovarian reserve, tubal patency, uterine cavity]
- Male Factors: [Semen analysis results]
- Ovulation Assessment: [BBT, OPKs, progesterone levels]
- Additional Testing: [HSG, sonohysterogram, laparoscopy]

Treatment Planning:
- First-Line Therapies: [Lifestyle modifications, ovulation induction]
- Assisted Reproductive Technology: [IUI, IVF indications]
- Surgical Interventions: [Hysteroscopy, laparoscopy needs]
- Hormonal Management: [Hormone replacement, cycle regulation]

Monitoring and Support:
- Cycle Monitoring: [Ultrasound, hormone levels]
- Pregnancy Achievement: [Early pregnancy monitoring]
- Psychological Support: [Counseling resources, support groups]
\`\`\`
` : `
**General Clinical Case Framework:**
\`\`\`
Clinical Case: [Age]-year-old with [Primary Clinical Issue]

Presenting Problem:
- Chief Complaint: [Patient's primary concern]
- History of Present Illness: [Detailed symptom description]
- Review of Systems: [Relevant positive and negative findings]
- Functional Impact: [How symptoms affect daily activities]

Risk Assessment:
- Risk Factors: [Modifiable and non-modifiable factors]
- Protective Factors: [Elements that reduce risk]
- Comorbidity Impact: [How other conditions affect management]
- Social Determinants: [Access, compliance, support factors]

Diagnostic Approach:
- Clinical Reasoning: [Differential diagnosis development]
- Testing Strategy: [Cost-effective diagnostic approach]
- Interpretation Challenges: [Ambiguous or conflicting results]
- Additional Studies: [Further testing needs]

Management Strategy:
- Treatment Options: [Evidence-based approaches]
- Patient Preferences: [Shared decision-making factors]
- Risk-Benefit Analysis: [Weighing treatment options]
- Monitoring Plan: [How to assess treatment response]
\`\`\`
`}

## Advanced Case Discussion Techniques

### Longitudinal Case Management

**Case Evolution Tracking:**
\`\`\`
Initial Presentation: [Date] - [Initial assessment and plan]
Follow-up #1: [Date] - [Response to treatment, new findings]
Follow-up #2: [Date] - [Treatment modifications, complications]
Current Status: [Date] - [Current clinical state, ongoing plans]

Evolution Analysis Request:
"Analyze this case progression and provide:
1. Assessment of treatment response and effectiveness
2. Identification of complications or unexpected developments  
3. Recommendations for ongoing management optimization
4. Prognostic assessment based on clinical course
5. Alternative approaches if current treatment fails"
\`\`\`

**Complex Case Progression:**
- Track multiple medical issues simultaneously
- Analyze interaction between treatments and conditions  
- Identify emerging complications or new diagnoses
- Optimize multiple therapies with consideration for drug interactions
- Plan long-term management with disease progression expectations

### Multi-Modal Case Integration

**Comprehensive Case with Attachments:**
1. **Detailed Case History**: Complete clinical narrative
2. **Diagnostic Images**: ECGs, X-rays, CT scans, lab results
3. **Calculator Results**: Relevant risk scores and clinical calculations
4. **Literature References**: Uploaded guidelines or research papers
5. **Specific Questions**: Targeted requests for clinical guidance

**Example Integrated Case:**
\`\`\`
Case Upload: [Detailed case description]
ECG Attachment: [12-lead ECG showing specific findings]
Lab Results: [Troponin series, BNP, creatinine trends]
Echo Report: [Structural and functional assessment]
GRACE Score: [Calculated risk score: 145 - High Risk]

Analysis Request: "Provide comprehensive ACS management recommendations 
integrating all clinical data, with specific attention to:
- Optimal reperfusion strategy given risk profile
- Evidence-based medical therapy with contraindication considerations
- Discharge planning and follow-up requirements
- Long-term prognosis and secondary prevention strategies"
\`\`\`

## Case-Based Learning and Teaching

### Educational Case Development

**Teaching Case Creation:**
- Present classic clinical presentations
- Include typical and atypical features
- Provide learning objectives and key teaching points
- Create cases that illustrate important clinical principles
- Develop cases for different training levels

**Case Discussion Formats:**
\`\`\`
Morning Report Case: "Present this case as you would in morning report, 
including clinical reasoning, differential diagnosis development, 
and teaching points for residents"

Journal Club Case: "Analyze this case in the context of recent literature, 
comparing outcomes with published data and current evidence"

Quality Improvement Case: "Evaluate this case for quality improvement 
opportunities, identifying system factors that contributed to outcomes"
\`\`\`

### Clinical Decision-Making Enhancement

**Decision Point Analysis:**
\`\`\`
Critical Decision Points in Case:
1. Initial diagnostic approach - what studies to order first?
2. Treatment selection - weighing risks and benefits  
3. Monitoring strategy - what parameters indicate response?
4. Complication management - how to recognize and address?
5. Disposition planning - when is patient ready for discharge?

Request: "For each decision point, provide evidence-based rationale, 
alternative approaches, and factors that would change the decision"
\`\`\`

**Outcome Prediction and Prognosis:**
- Request prognostic information based on presenting features
- Analyze factors that influence short-term and long-term outcomes
- Discuss treatment modifications that could improve prognosis
- Identify high-risk features requiring intensive monitoring

## Quality Assurance and Case Review

### Case Documentation Standards

**Complete Case Requirements:**
- All relevant clinical information included
- Appropriate de-identification of patient data
- Clear clinical questions and decision points
- Accurate medication names, doses, and timing
- Correct laboratory values and reference ranges

**Case Review and Validation:**
- Verify accuracy of all clinical data before submission
- Ensure clinical logic and timeline make sense
- Cross-check medication interactions and contraindications
- Validate diagnostic study interpretations
- Confirm treatment recommendations align with guidelines

### Error Prevention and Safety

**Clinical Safety Checks:**
- Verify all drug dosing and administration routes
- Check for medication interactions and contraindications
- Confirm allergy and adverse reaction history
- Validate clinical decision logic against established protocols
- Ensure appropriate monitoring and follow-up plans

**Quality Improvement Integration:**
- Identify system factors contributing to clinical outcomes
- Analyze communication breakdowns or care coordination issues
- Evaluate adherence to evidence-based guidelines
- Assess opportunities for process improvement
- Document lessons learned for future case management

*Master comprehensive case management to leverage AI assistance for optimal patient care and clinical decision-making.*
          `
        }
      ]
    },
    {
      id: 'calculators',
      title: 'Medical Calculators',
      icon: <Calculator className="w-6 h-6" />,
      description: 'Master the clinical calculation tools',
      articles: [
        {
          id: 'calculator-basics',
          title: 'Using Medical Calculators',
          difficulty: 'beginner',
          tags: ['calculators', 'clinical-tools'],
          content: `
# Using Medical Calculators

MediMind Expert includes professional-grade medical calculators for clinical decision support.

## Calculator Features

### Input Validation
- All inputs are validated for clinical accuracy
- Clear error messages for invalid values
- Range checks for physiological parameters

### Clinical Interpretations
- Evidence-based result interpretations
- Risk category classifications
- Clinical recommendations
- Guideline references

### AI Integration
- Share results directly with AI Co-Pilot
- Get detailed analysis of scores
- Explore treatment implications

## Available Calculator Categories

${profile?.medical_specialty === 'cardiology' ? `
### Cardiology Calculators

**Risk Assessment**
- ASCVD Risk Calculator
- Framingham Risk Score
- Reynolds Risk Score

**Acute Care**
- GRACE Score
- TIMI Risk Score
- PURSUIT Score

**Therapy Management**
- CHA2DS2-VASc Score
- HAS-BLED Score
- DAPT Score

**Heart Failure**
- Seattle Heart Failure Model
- MAGGIC Risk Calculator

**Surgical Risk**
- STS Risk Calculator
- EuroSCORE II

**Cardiomyopathy**
- HCM Risk-SCD Calculator
- HCM-AFR Calculator
` : profile?.medical_specialty === 'ob-gyn' ? `
### OB/GYN Calculators

**Obstetrics**
- EDD Calculator
- Gestational Age Calculator
- Bishop Score
- Apgar Score

**Antenatal Risk Assessment**
- Preeclampsia Risk Calculator
- Preterm Birth Risk Calculator
- GDM Screening Calculator

**Labor Management**
- VBAC Success Calculator

**Assessment Tools**
- PPH Risk Assessment

**Gynecologic Oncology**
- Cervical Cancer Risk Calculator
- Ovarian Cancer Risk Calculator
- Endometrial Cancer Risk Calculator

**Reproductive Endocrinology**
- {t('calculators.ObGyn.ovarianReserve.title')}
- Menopause Assessment Tool
` : `
### Professional Medical Calculators
Specialty-specific clinical calculators for:
- Risk assessment
- Scoring systems
- Clinical decision support
- Evidence-based calculations
`}

## How to Use Calculators

### Step 1: Select Calculator
- Browse by category
- Use search to find specific tools
- Click on calculator of interest

### Step 2: Enter Data
- Fill in required clinical parameters
- All fields are validated for accuracy
- Hover over fields for additional guidance

### Step 3: Calculate
- Click "Calculate" to get results
- View interpretation and recommendations
- Check references and guidelines

### Step 4: Share with AI
- Use "Share with AI" button
- Get detailed analysis from AI Co-Pilot
- Explore clinical implications

## Best Practices

### Data Accuracy
- Double-check all input values
- Use appropriate units
- Verify patient parameters

### Clinical Context
- Consider calculator limitations
- Use clinical judgment
- Validate with current guidelines

### Documentation
- Save important results
- Share relevant calculations in notes
- Reference calculator sources
          `
        }
      ]
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      icon: <Upload className="w-6 h-6" />,
      description: 'Manage your medical documents and literature',
      articles: [
        {
          id: 'document-upload',
          title: 'Uploading Medical Documents',
          difficulty: 'beginner',
          tags: ['documents', 'upload', 'knowledge-base'],
          content: `
# Uploading Medical Documents

Build your personal medical knowledge base with relevant literature and documents.

## Supported Document Types

### Medical Literature
- Research papers (PDF)
- Clinical guidelines
- Medical textbook chapters
- Journal articles

### Clinical Documents
- Protocol documents
- Institutional guidelines
- Reference materials
- Educational content

### File Formats
- PDF documents (up to 500MB for comprehensive medical texts)
- Word documents (.doc, .docx up to 25MB)
- Text files (.txt, .md up to 10MB)

## Upload Process

### 1. Access Upload
- Go to Knowledge Base from your workspace
- Click "Upload Documents" button
- Or drag files directly to upload area

### 2. Select Files
- Choose multiple files at once
- Drag and drop for convenience
- Files are validated automatically

### 3. Processing
- Documents are processed with AI
- Text is extracted and analyzed
- Vector embeddings are created for search

### 4. Integration
- Documents become searchable
- AI can reference your uploads
- Use in chat conversations

## AI Document Processing

### Text Extraction
- Comprehensive content analysis
- Preservation of medical terminology
- Structure recognition (headings, sections)

### Vector Search
- Semantic search capabilities
- Find relevant content by meaning
- Cross-reference related documents

### Chat Integration
- AI can cite your documents
- Reference specific sections
- Provide context-aware responses

## Organization Tips

### Naming Conventions
- Use descriptive filenames
- Include year and topic
- Add specialty or category

### Document Categories
- Guidelines and protocols
- Research and evidence
- Educational materials
- Reference documents

### Quality Control
- Upload high-quality, relevant documents
- Avoid duplicate content
- Keep library organized and current

## Privacy and Security

### Data Protection
- Documents are encrypted at rest
- Secure transmission protocols
- User data isolation

### Access Control
- Only you can access your documents
- AI uses documents within your conversations
- No sharing with other users

### HIPAA Compliance
- Remove all patient identifiers
- Anonymize case information
- Follow institutional policies
          `
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <HelpCircle className="w-6 h-6" />,
      description: 'Solutions to common issues',
      articles: [
        {
          id: 'common-issues',
          title: 'Common Issues and Solutions',
          difficulty: 'beginner',
          tags: ['troubleshooting', 'support'],
          content: `
# Common Issues and Solutions

Quick solutions to frequently encountered problems.

## Authentication Issues

### "Unable to sign in"
**Causes:**
- Incorrect email/password
- Network connectivity issues
- Account not verified

**Solutions:**
1. Double-check email and password
2. Try password reset if needed
3. Check email for verification link
4. Clear browser cache and cookies

### "Session expired"
**Causes:**
- Extended inactivity
- Browser security settings

**Solutions:**
1. Sign in again
2. Enable cookies in browser
3. Add site to trusted list

## Chat and AI Issues

### "AI not responding"
**Causes:**
- Network connectivity
- Server maintenance
- Rate limiting

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Wait a moment and try again
4. Contact support if persistent

### "File upload failed"
**Causes:**
- File too large
- Unsupported format
- Network issues

**Solutions:**
1. Check file size limits
2. Use supported formats (PDF, DOC, TXT)
3. Try uploading one file at a time
4. Check internet connection

## Calculator Issues

### "Invalid input" errors
**Causes:**
- Values outside normal ranges
- Incorrect units
- Missing required fields

**Solutions:**
1. Check all required fields are filled
2. Verify values are within normal ranges
3. Use correct units as specified
4. Refer to field help text

### "Calculation seems incorrect"
**Causes:**
- Input errors
- Misunderstanding of calculator scope

**Solutions:**
1. Double-check all input values
2. Review calculator documentation
3. Consider clinical context
4. Validate with alternative sources

## Performance Issues

### "Page loading slowly"
**Causes:**
- Network connectivity
- Browser cache issues
- High server load

**Solutions:**
1. Check internet speed
2. Clear browser cache
3. Try different browser
4. Disable browser extensions

### "Features not working"
**Causes:**
- JavaScript disabled
- Browser compatibility
- Ad blockers

**Solutions:**
1. Enable JavaScript
2. Use supported browser (Chrome, Firefox, Safari)
3. Disable ad blockers for this site
4. Update browser to latest version

## Getting Additional Help

### In-App Support
- Use help icons throughout the app
- Check tooltips and guidance text
- Review feature documentation

### Contact Support
If issues persist:
1. Note the specific error message
2. Include steps to reproduce
3. Mention browser and device type
4. Contact support team

### Community Resources
- Check for known issues
- Review user guides
- Participate in user forums
          `
        }
      ]
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.articles.some(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredArticles = selectedSection
    ? helpSections.find(s => s.id === selectedSection)?.articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ) || []
    : [];

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-5">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4">{line.substring(4)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-800 mb-2">{line.substring(2, line.length - 2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-600 mb-1 ml-4">{line.substring(2)}</li>;
      }
      if (line.startsWith('❌ ') || line.startsWith('✅ ')) {
        return <p key={index} className="text-gray-600 mb-2 font-mono text-sm bg-gray-50 p-2 rounded">{line}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-600 mb-3 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 text-primary mr-3" />
                Help Center
              </h1>
              <p className="text-gray-600 mt-1">
                Learn how to make the most of MediMind Expert
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(E) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setSelectedSection(null);
                  setSelectedArticle(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  !selectedSection 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3" />
                  All Topics
                </div>
              </button>

              {filteredSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setSelectedSection(section.id);
                      setSelectedArticle(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedSection === section.id 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {section.icon}
                        <span className="ml-3 font-medium">{section.title}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        selectedSection === section.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Articles submenu */}
                  {selectedSection === section.id && (
                    <div className="ml-6 mt-2 space-y-1">
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                            selectedArticle?.id === article.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedArticle ? (
              /* Article View */
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {selectedArticle.title}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedArticle.difficulty === 'beginner' 
                        ? 'bg-green-100 text-green-800'
                        : selectedArticle.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedArticle.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose max-w-none">
                  {renderContent(selectedArticle.content)}
                </div>
              </div>
            ) : selectedSection ? (
              /* Section View */
              <div>
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="flex items-center mb-4">
                    {helpSections.find(s => s.id === selectedSection)?.icon}
                    <h1 className="text-2xl font-bold text-gray-900 ml-3">
                      {helpSections.find(s => s.id === selectedSection)?.title}
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    {helpSections.find(s => s.id === selectedSection)?.description}
                  </p>
                </div>

                <div className="grid gap-6">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-4 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              article.difficulty === 'beginner' 
                                ? 'bg-green-100 text-green-800'
                                : article.difficulty === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {article.difficulty}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Overview */
              <div>
                <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to MediMind Expert Help Center
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    Find comprehensive guides, tutorials, and answers to help you make the most of your medical AI co-pilot.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Need Quick Help?</h3>
                        <p className="text-blue-700 text-sm">Search above or browse topics on the left</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-900">New to MediMind?</h3>
                        <p className="text-green-700 text-sm">Start with "Getting Started" guide</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {section.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 ml-3">
                            {section.title}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        {section.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        {section.articles.length} article{section.articles.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 