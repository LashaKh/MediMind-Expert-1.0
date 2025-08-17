import { TourStep } from './PremiumTour';

// Comprehensive tour definitions with detailed steps for each feature section
export const comprehensiveTourSteps: Record<string, TourStep[]> = {
  // AI Co-Pilot Tour - 7 comprehensive steps including case study creation
  'ai-copilot': [
    {
      id: 'ai-welcome',
      title: '🤖 Welcome to AI Medical Co-Pilot',
      content: '<p>Meet your intelligent medical assistant powered by advanced AI. This tour will show you how to use AI for <strong>evidence-based clinical decision support</strong> and case management.</p><p>✨ <em>Get ready to revolutionize your medical workflow!</em></p>',
      target: 'body',
      position: 'auto',
      path: '/ai-copilot',
      waitAfterNavigateMs: 600
    },
    {
      id: 'ai-interface',
      title: '💬 Chat Interface Overview',
      content: '<p>This is your main communication hub with the AI. The interface is designed for <strong>medical professionals</strong> with intuitive controls and clinical-focused features.</p><p>🎯 <em>Notice the medical-specific UI elements and professional styling</em></p>',
      target: '[data-tour="chat-window"]',
      position: 'auto'
    },
    {
      id: 'ai-message-input',
      title: '✍️ Advanced Message Input',
      content: '<p>Type your medical questions here. The AI understands <strong>medical terminology</strong>, abbreviations, and clinical contexts. You can ask about symptoms, treatments, drug interactions, and more.</p><p>💡 <em>Try typing "chest pain differential diagnosis"</em></p>',
      target: '[data-tour="message-input"]',
      position: 'auto'
    },
    {
      id: 'ai-file-upload',
      title: '📎 Medical File Upload',
      content: '<p>Upload medical files directly into the conversation. Supported formats include:</p><ul><li><strong>Medical Images</strong> (DICOM, PNG, JPG)</li><li><strong>Lab Results</strong> (PDF, CSV)</li><li><strong>ECGs and Reports</strong></li><li><strong>Clinical Documents</strong></li></ul><p>🔬 <em>AI can analyze and interpret these files in context</em></p>',
      target: '[data-tour="file-upload"]',
      position: 'auto'
    },
    {
      id: 'ai-case-creation',
      title: '📋 Case Study Creation',
      content: '<p>Create detailed patient case studies for <strong>research and documentation</strong>. Features include:</p><ul><li><strong>Anonymized patient information</strong></li><li><strong>Clinical complexity tracking</strong></li><li><strong>Case categorization and tagging</strong></li><li><strong>AI-enhanced case analysis</strong></li></ul><p>📚 <em>Build a comprehensive case library for learning and reference</em></p>',
      target: '[data-tour="case-creation-button"]',
      position: 'auto'
    },
    {
      id: 'ai-case-management',
      title: '🗂️ Case Management System',
      content: '<p>Your case studies integrate seamlessly with AI conversations:</p><ul><li><strong>Active case context</strong> in AI responses</li><li><strong>Case-specific recommendations</strong></li><li><strong>Progress tracking</strong> and follow-up</li><li><strong>Historical case analysis</strong></li></ul><p>🔗 <em>AI remembers case details and provides context-aware insights</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'ai-complete',
      title: '🎉 AI Co-Pilot Mastery Complete!',
      content: '<p>Excellent! You\'ve mastered the AI Medical Co-Pilot. You now know how to:</p><ul><li>Communicate with AI using medical terminology</li><li>Upload and analyze medical files</li><li>Create and manage patient case studies</li><li>Get AI-powered medical insights with case context</li><li>Leverage evidence-based recommendations</li></ul><p>🚀 <em>Ready to revolutionize your medical practice with comprehensive case management!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],

  // Medical Calculators Tour - 4 reliable steps using verified elements
  calculators: [
    {
      id: 'calc-welcome',
      title: '🧮 Medical Calculators Hub',
      content: '<p>Welcome to our comprehensive collection of <strong>16+ validated medical calculators</strong>. Every calculator has been rigorously tested for clinical accuracy and follows current guidelines.</p><p>✅ <em>100% validation success rate across all calculators</em></p>',
      target: '[data-tour="calculator-tabs"]',
      position: 'auto',
      path: '/calculators',
      waitAfterNavigateMs: 600
    },
    {
      id: 'calc-categories',
      title: '📊 Calculator Categories & Interface',
      content: '<p>The calculator interface is organized by clinical use:</p><ul><li><strong>Risk Assessment</strong> - ASCVD, GRACE, CHA2DS2-VASc</li><li><strong>Heart Failure</strong> - Staging, MAGGIC, SHFM</li><li><strong>Surgical Risk</strong> - STS, EuroSCORE II</li><li><strong>Specialized</strong> - HCM Risk, DAPT</li></ul><p>🎯 <em>Each category is designed for specific clinical scenarios and provides validated medical calculations</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'calc-features',
      title: '⚡ Advanced Calculator Features',
      content: '<p>All calculators include <strong>professional medical features</strong>:</p><ul><li><strong>Intelligent input validation</strong> with range checking</li><li><strong>Unit conversion</strong> (metric/imperial)</li><li><strong>Clinical context warnings</strong> and alerts</li><li><strong>Comprehensive results</strong> with interpretations</li><li><strong>Evidence-based recommendations</strong></li></ul><p>🛡️ <em>Designed for accuracy and clinical safety</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'calc-complete',
      title: '🎯 Calculator Mastery Complete!',
      content: '<p>Excellent! You\'ve learned about our medical calculator system. You now understand:</p><ul><li>How to navigate calculator categories</li><li>The advanced validation and safety features</li><li>How to apply evidence-based medicine</li><li>The clinical accuracy and guideline compliance</li></ul><p>🏆 <em>Ready to use validated medical calculators in your practice!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],

  // Comprehensive Knowledge Base Tour - Covers both curated and personal knowledge
  'knowledge-base': [
    {
      id: 'kb-welcome',
      title: '📚 Knowledge Base System Overview',
      content: '<p>Welcome to MediMind\'s comprehensive <strong>dual knowledge system</strong>! We offer both expertly curated medical literature AND your personal document library, all powered by AI.</p><p>🎓 <em>Two powerful knowledge sources in one unified system</em></p>',
      target: 'body',
      position: 'auto',
      path: '/knowledge-base',
      waitAfterNavigateMs: 600
    },
    {
      id: 'kb-curated-overview',
      title: '🌟 Curated Medical Literature',
      content: '<p>This is our <strong>curated knowledge base</strong> featuring expertly selected medical literature, clinical guidelines, and evidence-based protocols from trusted professional sources.</p><p>📖 <em>Professional-grade medical knowledge at your fingertips</em></p>',
      target: '[data-tour="knowledge-base-header"]',
      position: 'auto'
    },
    {
      id: 'kb-curated-features',
      title: '🔍 Curated Content Features',
      content: '<p>The curated knowledge base offers:</p><ul><li><strong>Evidence-based filtering</strong> and source credibility</li><li><strong>Medical specialty categorization</strong></li><li><strong>Clinical guidelines</strong> and protocols</li><li><strong>Professional recommendations</strong></li></ul><p>⚡ <em>Trusted medical information, instantly accessible</em></p>',
      target: '[data-tour="document-library"]',
      position: 'auto'
    },
    {
      id: 'kb-personal-transition',
      title: '🗃️ Now Let\'s Explore Personal Knowledge',
      content: '<p>Now let\'s explore the <strong>Personal Library</strong> section where you can upload and manage your own medical documents, research papers, and protocols for AI-powered search and reference.</p><p>🧠 <em>Your personalized medical intelligence system</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'kb-personal-overview',
      title: '⚡ Personal Document Processing',
      content: '<p>Your personal knowledge base features <strong>advanced semantic analysis</strong> that transforms your documents into AI-understandable knowledge using vector embeddings and intelligent processing.</p><p>📚 <em>Making your personal documents AI-accessible</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'kb-personal-features',
      title: '📁 Personal Knowledge Features',
      content: '<p>Your personal knowledge system provides:</p><ul><li><strong>Multi-format document upload</strong> (PDF, Word, PowerPoint)</li><li><strong>OCR processing</strong> for scanned documents</li><li><strong>Semantic search</strong> and AI integration</li><li><strong>Smart organization</strong> and management tools</li></ul><p>⚡ <em>Your personal medical library, AI-enhanced</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'kb-ai-integration',
      title: '🤖 Unified AI Integration',
      content: '<p>Both knowledge bases integrate seamlessly with our AI system:</p><ul><li><strong>Smart citations</strong> from both curated and personal sources</li><li><strong>Cross-reference capabilities</strong> between systems</li><li><strong>Contextual recommendations</strong> from all sources</li><li><strong>Unified search</strong> across all your knowledge</li></ul><p>🧠 <em>AI understands and references all your medical knowledge</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'kb-complete',
      title: '🎉 Complete Knowledge Mastery Achieved!',
      content: '<p>Outstanding! You\'ve mastered the entire Knowledge Base system. You can now:</p><ul><li><strong>Access curated medical literature</strong> and professional guidelines</li><li><strong>Upload and manage</strong> your personal documents</li><li><strong>Search across both systems</strong> with AI assistance</li><li><strong>Get unified citations</strong> from all sources</li></ul><p>🚀 <em>Complete medical knowledge at your command!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],


  // ABG Analysis Tour - 6 steps using specific data-tour attributes
  'abg-analysis': [
    {
      id: 'abg-welcome',
      title: '🩸 Blood Gas Analysis Engine',
      content: '<p>Master our <strong>AI-powered ABG analysis system</strong>. Get instant interpretations, comprehensive assessments, and treatment recommendations for arterial blood gas results.</p><p>⚕️ <em>Advanced clinical decision support for critical care</em></p>',
      target: 'body',
      position: 'auto',
      path: '/abg-analysis',
      waitAfterNavigateMs: 600
    },
    {
      id: 'abg-header',
      title: '🎯 ABG Analysis Header',
      content: '<p>Your comprehensive blood gas analysis workspace featuring:</p><ul><li><strong>Medical-grade AI badge</strong> - Professional certification</li><li><strong>Quick access to history</strong> - View previous analyses</li><li><strong>AI-powered intelligence</strong> - Clinical decision support</li><li><strong>Professional workflow design</strong> - Optimized for medical professionals</li></ul><p>🏥 <em>Designed for rapid clinical decision-making</em></p>',
      target: '[data-tour="abg-header"]',
      position: 'auto'
    },
    {
      id: 'abg-workflow',
      title: '📊 Workflow Progress System',
      content: '<p>Track your analysis progress through our <strong>4-step workflow</strong>:</p><ul><li><strong>Upload</strong> - Select blood gas report</li><li><strong>Analysis</strong> - AI vision processing</li><li><strong>Interpretation</strong> - Clinical analysis</li><li><strong>Action Plan</strong> - Treatment recommendations</li></ul><p>⚡ <em>Visual progress tracking with real-time updates</em></p>',
      target: '[data-tour="abg-workflow"]',
      position: 'auto'
    },
    {
      id: 'abg-type-selection',
      title: '🩺 Blood Gas Type Selection',
      content: '<p>Select the appropriate analysis type:</p><ul><li><strong>Arterial Blood Gas</strong> - Standard ABG analysis</li><li><strong>Venous Blood Gas</strong> - Venous sample analysis</li><li><strong>Smart selection</strong> - Optimizes AI processing</li><li><strong>Type-specific interpretation</strong> - Tailored clinical insights</li></ul><p>🎯 <em>Accurate type selection ensures optimal AI analysis</em></p>',
      target: '[data-tour="abg-type-selection"]',
      position: 'auto'
    },
    {
      id: 'abg-image-upload',
      title: '📁 Image Upload Interface',
      content: '<p>Upload your blood gas report using <strong>multiple methods</strong>:</p><ul><li><strong>Drag & drop</strong> - Simply drag files onto the upload area</li><li><strong>File browser</strong> - Click to select from your device</li><li><strong>Camera capture</strong> - Take a photo directly</li><li><strong>Multiple formats</strong> - JPEG, PNG, WebP supported</li></ul><p>🧠 <em>AI automatically extracts data from uploaded images</em></p>',
      target: '[data-tour="abg-image-upload"]',
      position: 'auto'
    },
    {
      id: 'abg-complete',
      title: '🎯 ABG Analysis Mastery Complete!',
      content: '<p>Excellent! You\'ve mastered ABG Analysis. You can now:</p><ul><li><strong>Upload blood gas reports</strong> via image or camera</li><li><strong>Select appropriate analysis types</strong> for optimal processing</li><li><strong>Track workflow progress</strong> through our 4-step system</li><li><strong>Access comprehensive history</strong> and professional features</li></ul><p>🏆 <em>Ready for expert-level blood gas analysis workflow!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],

  // Medical News Tour - 6 detailed steps
  'medical-news': [
    {
      id: 'news-welcome',
      title: '📰 Medical News & Literature Search',
      content: '<p>Discover our comprehensive <strong>medical search platform</strong> that combines AI-curated news, literature search, and clinical trials. Multiple trusted sources provide the latest medical developments.</p><p>🔔 <em>Your complete medical intelligence hub</em></p>',
      target: 'body',
      position: 'auto',
      path: '/search',
      waitAfterNavigateMs: 600
    },
    {
      id: 'news-interface',
      title: '🌟 Search Interface Overview',
      content: '<p>Your unified medical search interface featuring:</p><ul><li><strong>Literature Search</strong> - Research papers and journals</li><li><strong>Clinical Trials</strong> - Latest clinical research</li><li><strong>Medical News</strong> - AI-curated news updates</li><li><strong>Multi-Provider Search</strong> - Access multiple databases</li></ul><p>📊 <em>All medical information in one place</em></p>',
      target: '[data-tour="search-header"]',
      position: 'auto'
    },
    {
      id: 'news-search-input',
      title: '🔍 Advanced Search Capabilities',
      content: '<p>Use our powerful search interface for <strong>comprehensive medical research</strong>:</p><ul><li>Natural language queries</li><li>Medical terminology recognition</li><li>Advanced filtering options</li><li>Multi-provider simultaneous search</li></ul><p>🎯 <em>Find exactly what you need across all medical sources</em></p>',
      target: '[data-tour="search-input"]',
      position: 'auto'
    },
    {
      id: 'news-providers',
      title: '⚙️ Provider Selection & Customization',
      content: '<p>Choose your preferred search providers for <strong>optimal results</strong>:</p><ul><li>Brave Search - Web literature</li><li>Exa AI - Academic papers</li><li>Clinical Trials - Research studies</li><li>Perplexity - AI-enhanced search</li></ul><p>🔔 <em>Customize your search experience for best results</em></p>',
      target: '[data-tour="provider-selection"]',
      position: 'auto'
    },
    {
      id: 'news-tabs',
      title: '📊 Search Results & News Tabs',
      content: '<p>Navigate through different content types with our <strong>organized tab system</strong>:</p><ul><li><strong>Literature</strong> - Research papers and studies</li><li><strong>News</strong> - Latest medical news</li><li><strong>Clinical Trials</strong> - Research opportunities</li><li><strong>Trending</strong> - Popular content</li></ul><p>🤝 <em>Find the right type of information for your needs</em></p>',
      target: '[data-tour="search-tabs"]',
      position: 'auto'
    },
    {
      id: 'news-complete',
      title: '🎉 Medical Search Mastery Complete!',
      content: '<p>Excellent! You\'ve mastered the Medical Search system. You can now:</p><ul><li>Search medical literature and clinical trials</li><li>Access AI-curated medical news</li><li>Customize provider selection</li><li>Navigate different content types efficiently</li></ul><p>📚 <em>Your complete medical research toolkit is ready!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],

  // Disease Guidelines Tour - 7 detailed steps
  'disease-guidelines': [
    {
      id: 'disease-welcome',
      title: '🩺 Disease Guidelines & Clinical Pathways',
      content: '<p>Welcome to our comprehensive <strong>medical knowledge base</strong> with evidence-based disease guidelines, clinical pathways, and treatment protocols for medical professionals.</p><p>📚 <em>Your trusted source for evidence-based medical practice</em></p>',
      target: 'body',
      position: 'auto',
      path: '/diseases',
      waitAfterNavigateMs: 600
    },
    {
      id: 'disease-header',
      title: '🌟 Medical Knowledge Hub',
      content: '<p>Your comprehensive medical knowledge hub featuring:</p><ul><li><strong>Evidence-Based Guidelines</strong> - Current medical protocols</li><li><strong>Clinical Pathways</strong> - Structured treatment approaches</li><li><strong>Disease Categories</strong> - Organized by medical specialty</li><li><strong>Expert Curation</strong> - Reviewed by medical professionals</li></ul><p>📊 <em>Professional-grade medical reference at your fingertips</em></p>',
      target: '[data-tour="disease-header"]',
      position: 'auto'
    },
    {
      id: 'disease-search',
      title: '🔍 Advanced Medical Search',
      content: '<p>Find specific diseases and conditions with our <strong>intelligent search system</strong>:</p><ul><li>Search by disease name, symptoms, or treatments</li><li>Medical terminology recognition</li><li>Comprehensive guideline coverage</li><li>Real-time filtering and suggestions</li></ul><p>🎯 <em>Instantly locate the medical information you need</em></p>',
      target: '[data-tour="disease-search"]',
      position: 'auto'
    },
    {
      id: 'disease-filters',
      title: '⚙️ Category & Severity Filtering',
      content: '<p>Organize and filter diseases by <strong>medical categories and severity</strong>:</p><ul><li><strong>Specialty Categories</strong> - Cardiology, Emergency, etc.</li><li><strong>Severity Levels</strong> - Critical, Moderate, Stable</li><li><strong>Sorting Options</strong> - By name, severity, or update date</li><li><strong>View Modes</strong> - Grid or list presentation</li></ul><p>🔔 <em>Customize your medical reference experience</em></p>',
      target: '[data-tour="disease-filters"]',
      position: 'auto'
    },
    {
      id: 'disease-evidence',
      title: '📈 Evidence Levels Reference',
      content: '<p>Understand the <strong>quality of medical evidence</strong> with our evidence levels system:</p><ul><li><strong>Level I</strong> - Systematic reviews and meta-analyses</li><li><strong>Level II</strong> - Randomized controlled trials</li><li><strong>Level III</strong> - Controlled studies and cohort studies</li><li><strong>Level IV</strong> - Case series and expert opinion</li></ul><p>📊 <em>Make informed decisions based on evidence quality</em></p>',
      target: '[data-tour="evidence-levels"]',
      position: 'auto'
    },
    {
      id: 'disease-cards',
      title: '📋 Disease Information Cards',
      content: '<p>Each disease card provides <strong>comprehensive clinical information</strong>:</p><ul><li><strong>Severity Indicators</strong> - Visual severity classification</li><li><strong>Category Classification</strong> - Medical specialty grouping</li><li><strong>Clinical Tags</strong> - Key characteristics and symptoms</li><li><strong>Reading Time</strong> - Estimated review duration</li></ul><p>🤝 <em>Quick access to essential clinical details</em></p>',
      target: '[data-tour="disease-cards"]',
      position: 'auto'
    },
    {
      id: 'disease-complete',
      title: '🎉 Disease Guidelines Mastery Complete!',
      content: '<p>Outstanding! You\'ve mastered the Disease Guidelines system. You can now:</p><ul><li>Search and filter medical conditions efficiently</li><li>Understand evidence levels and quality</li><li>Navigate disease categories and severity levels</li><li>Access comprehensive clinical pathways</li></ul><p>🚀 <em>Your complete medical reference system is ready!</em></p>',
      target: 'body',
      position: 'auto'
    }
  ],

  // Full comprehensive tour - Enhanced version
  full: [
    {
      id: 'full-welcome',
      title: '🚀 MediMind Expert Complete Tour',
      content: '<p>Welcome to the <strong>complete MediMind Expert experience</strong>! This comprehensive tour showcases every feature of our advanced medical AI platform.</p><p>⚡ <em>Sit back and let us guide you through the future of medical practice</em></p>',
      target: 'body',
      position: 'auto'
    },
    {
      id: 'full-workspace',
      title: '🏥 Medical Workspace Overview',
      content: '<p>Your centralized command center for medical AI. From here you can access:</p><ul><li><strong>AI Medical Co-Pilot</strong></li><li><strong>Validated Calculators</strong></li><li><strong>Knowledge Management</strong></li><li><strong>Clinical Tools</strong></li></ul><p>🌟 <em>Everything designed for medical workflow efficiency</em></p>',
      target: '[data-tour="workspace-overview"]',
      position: 'auto',
      path: '/workspace/cardiology',
      waitAfterNavigateMs: 400
    },
    // Additional comprehensive steps would continue here...
  ]
};

export default comprehensiveTourSteps;