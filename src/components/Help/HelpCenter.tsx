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
          id: 'first-steps',
          title: 'Your First Steps in MediMind Expert',
          difficulty: 'beginner',
          tags: ['onboarding', 'basics'],
          content: `
# Your First Steps in MediMind Expert

Welcome to MediMind Expert! This guide will help you get started with your medical AI co-pilot.

## 1. Complete Your Profile
- Navigate to your profile page
- Update your medical specialty information
- Add an "About Me" section to help the AI understand your practice
- Upload a professional profile picture

## 2. Explore Your Workspace
Your ${profile?.medical_specialty || 'specialty'} workspace includes:
- **AI Co-Pilot**: Chat with medical AI for case discussions
- **Medical Calculators**: Access specialized clinical calculators
- **Knowledge Base**: Upload and manage medical documents
- **Case Management**: Create and track patient cases

## 3. Start Your First Chat
- Click "AI Co-Pilot" from your workspace
- Ask questions about medical conditions, treatments, or guidelines
- Use the calculator suggestions to perform quick clinical calculations
- Share calculator results directly in chat for AI analysis

## 4. Upload Medical Documents
- Use the Knowledge Base to upload relevant medical literature
- Documents are processed with AI for intelligent search
- Reference uploaded documents in AI conversations

## Tips for Success
- Be specific in your questions to get the most relevant responses
- Use medical terminology for precise answers
- Explore the calculators for quick clinical decision support
- Create cases for complex patient discussions
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
      description: 'Learn how to effectively use the AI assistant',
      articles: [
        {
          id: 'effective-prompting',
          title: 'How to Ask Effective Questions',
          difficulty: 'intermediate',
          tags: ['ai', 'prompting', 'best-practices'],
          content: `
# How to Ask Effective Questions

Getting the most out of your AI Co-Pilot requires thoughtful questioning.

## Best Practices

### Be Specific
❌ "Tell me about hypertension"
✅ "What are the latest ACC/AHA guidelines for treating hypertension in a 65-year-old with diabetes?"

### Provide Context
Include relevant details:
- Patient demographics (age, sex)
- Medical history
- Current medications
- Specific clinical scenario

### Use Medical Terminology
The AI understands medical language:
- Use proper drug names
- Include dosages and routes
- Specify medical conditions accurately

## Question Types That Work Well

### Clinical Decision Support
"For a 45-year-old male with chest pain, normal ECG, and troponin of 0.02, what's the next step?"

### Guideline Questions
"What does the 2023 ESC guideline say about anticoagulation in atrial fibrillation?"

### Differential Diagnosis
"Patient presents with fatigue, shortness of breath, and ankle swelling. What's the differential diagnosis?"

### Medication Questions
"What are the contraindications for ACE inhibitors in heart failure patients?"

## AI Co-Pilot Features

### Calculator Integration
- AI can suggest relevant calculators
- Share calculator results for analysis
- Get interpretation of scores

### Document References
- AI can reference your uploaded documents
- Cite medical literature
- Provide evidence-based responses

### Case Discussions
- Create cases for complex patients
- Get structured analysis
- Explore treatment options
          `
        },
        {
          id: 'file-uploads',
          title: 'Uploading Files to AI Chat',
          difficulty: 'beginner',
          tags: ['files', 'upload', 'images'],
          content: `
# Uploading Files to AI Chat

Enhance your AI conversations by uploading relevant files and images.

## Supported File Types

### Medical Images
- ECG strips and reports
- Lab results and screenshots
- Medical charts and graphs
- Radiology images (when appropriate)

### Documents
- PDF medical literature
- Clinical guidelines
- Research papers
- Protocol documents

## How to Upload Files

1. **Drag and Drop**
   - Drag files directly into the chat input area
   - Multiple files can be uploaded at once

2. **Click to Upload**
   - Click the attachment icon in chat
   - Select files from your device

3. **Paste Images**
   - Copy images from other applications
   - Paste directly into chat

## Best Practices

### Image Quality
- Ensure images are clear and readable
- Good lighting for photos of documents
- High resolution for detailed medical images

### File Organization
- Name files descriptively
- Group related files together
- Keep file sizes reasonable

### Privacy Considerations
- Remove all patient identifiers
- Anonymize any personal information
- Follow HIPAA guidelines for medical data

## AI Analysis Capabilities

The AI can analyze:
- ECG patterns and abnormalities
- Lab value trends
- Medical imaging findings
- Document content and recommendations

### Example Use Cases
- "Analyze this ECG for arrhythmias"
- "Interpret these lab results"
- "Summarize this research paper"
- "What does this chest X-ray show?"
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
- PDF documents (up to 50MB)
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