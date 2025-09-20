import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HIT4TsCalculator from '../Calculators/HIT4TsCalculator';
import CHA2DS2VAScCalculator from '../Calculators/CHA2DS2VAScCalculator';
import ClinicalFindingsRenderer from './ClinicalFindingsRenderer';
import { 
  Search, 
  BookOpen, 
  Download, 
  Share2, 
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  Calendar,
  FileText,
  Bookmark,
  Eye,
  Menu,
  ChevronUp,
  Printer,
  Award,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Star,
  Shield,
  Zap,
  Heart,
  Activity,
  Stethoscope,
  Microscope,
  Pill,
  Thermometer,
  Target,
  TrendingUp,
  Users,
  Globe,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';

// Import enhanced modular components
import { EnhancedMarkdownRenderer } from './MarkdownContent/EnhancedMarkdownRenderer';
import { ReferenceSection } from './References/ReferenceSection';
import { TableOfContents } from './TableOfContents/TableOfContents';
import { ReadingProgress } from './ReadingProgress/ReadingProgress';
import BackgroundRenderer from './Background/BackgroundRenderer';
import { GuidelinesRenderer } from './Guidelines';
import { StudiesRenderer } from './Studies';
import { enhancedExportToPDF, enhancedPrintPage, enhancedSharePage } from '../../utils/enhanced-pdf-export';
import { enhanceClinicalContent, validateClinicalContent } from '../../utils/clinical-preprocessor';
import { parseMarkdownSections } from '../../utils/markdown-utils';

// Import types
import { InteractiveMarkdownViewerProps, MarkdownSection, TableOfContentsItem } from '../../types/markdown-viewer';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

/**
 * Modular Interactive Markdown Viewer
 * Comprehensive medical-grade markdown viewer using enhanced modular components
 * Maintains all sophisticated functionality from the original while being properly organized
 */
export const ModularInteractiveMarkdownViewer: React.FC<InteractiveMarkdownViewerProps> = ({ 
  filePath, 
  title,
  markdownContent 
}): JSX.Element => {
  
  // State management (identical to original)
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTOC, setShowTOC] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');
  const [currentH2Section, setCurrentH2Section] = useState<string>('');
  const [currentH3Section, setCurrentH3Section] = useState<string>('');
  
  // Additional state from original
  const currentSectionRef = useRef<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [sections, setSections] = useState<MarkdownSection[]>([]);

  // Load and process markdown content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);

      const [result, loadError] = await safeAsync(
        async () => {
          if (markdownContent) {
            // Process clinical content
            const processedContent = enhanceClinicalContent(markdownContent);
            return processedContent;
          } else if (filePath) {
            // For development, we'll use the content directly
            return markdownContent || '# No content available';
          }
          return '# No content available';
        },
        { 
          context: 'load and process markdown content',
          severity: ErrorSeverity.MEDIUM,
          showToast: true
        }
      );

      if (loadError) {
        setError(loadError.userMessage);
      } else {
        setContent(result);
      }
      
      setLoading(false);
    };

    loadContent();
  }, [filePath, markdownContent]);

  // Parse content into sections when content changes
  useEffect(() => {
    if (content) {
      
      // Parse sections directly without extracting special sections
      // Special sections will be handled inline during rendering
      const parsedSections = parseMarkdownSections(content);
      
      // Debug every section to find where calculator text is
      parsedSections.forEach((section, index) => {
        
        if (section.content.includes('*Calculator Available*') || section.content.includes('Calculator Available')) {
        }
        
        if (section.content.includes('CHA₂DS₂-VASc')) {
        }
      });
      
      // Check if References section has PubMed links
      const referencesSection = parsedSections.find(s => s.title.toLowerCase().includes('references'));
      if (referencesSection) {
      }

      // Check Classification and Risk Stratification section for calculator text
      const classificationSection = parsedSections.find(s => s.title.toLowerCase().includes('classification') && s.title.toLowerCase().includes('risk'));
      if (classificationSection) {
      }
      
      setSections(parsedSections);
    }
  }, [content]);

  // Calculate reading time and handle scroll tracking
  useEffect(() => {
    if (content) {
      const words = content.split(/\s+/).length;
      const readTime = Math.ceil(words / 200); // 200 words per minute
      setEstimatedReadTime(readTime);
    }

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
      setShowBackToTop(scrolled > 500);

      // Update active section with improved detection
      const sectionElements = document.querySelectorAll('[data-section-id]');
      let current = '';
      let closestDistance = Infinity;
      
      sectionElements.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 150);
        
        if (rect.top <= 200 && distance < closestDistance) {
          closestDistance = distance;
          current = section.getAttribute('data-section-id') || '';
        }
      });
      
      if (current && current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content, activeSection]);

  // Generate table of contents from sections
  const tableOfContents = useMemo(() => {
    return sections.map(section => ({
      id: section.id,
      title: section.title,
      level: section.level
    }));
  }, [sections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchTerm) return sections;
    
    return sections.filter(section => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sections, searchTerm]);

  // Navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    const sectionContainer = document.querySelector(`[data-section-id="${sectionId}"]`);
    
    if (sectionContainer) {
      sectionContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      setTimeout(() => {
        const currentScroll = window.scrollY || window.pageYOffset;
        const headerOffset = 120;
        window.scrollTo({
          top: currentScroll - headerOffset,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          setActiveSection(sectionId);
        }, 200);
      }, 100);
    } else {
      const fallbackElement = document.getElementById(sectionId);
      
      if (fallbackElement) {
        fallbackElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        setTimeout(() => {
          const currentScroll = window.scrollY || window.pageYOffset;
          const headerOffset = 120;
          window.scrollTo({
            top: currentScroll - headerOffset,
            behavior: 'smooth'
          });
          
          setTimeout(() => {
            setActiveSection(sectionId);
          }, 200);
        }, 100);
      }
    }
  };

  // Section management functions
  const toggleSection = (sectionId: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, isCollapsed: !section.isCollapsed }
          : section
      )
    );
  };

  const toggleAllSections = () => {
    const hasCollapsed = sections.some(s => s.isCollapsed);
    setSections(prevSections => 
      prevSections.map(section => ({ ...section, isCollapsed: !hasCollapsed }))
    );
  };

  // Enhanced action handlers
  const handlePrint = () => {
    enhancedPrintPage();
  };

  const handleDownload = async () => {
    await enhancedExportToPDF({
      title: title || 'Medical Document',
      content: content,
      filename: title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'document.pdf',
      includeGraphics: true,
      medicalMode: true
    });
  };

  const handleShare = async () => {
    await enhancedSharePage();
  };

  // Section change handler for enhanced markdown renderer
  const handleSectionChange = (h2: string, h3: string) => {
    setCurrentH2Section(h2);
    setCurrentH3Section(h3);
  };

  // Loading state with medical styling
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <Stethoscope className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Loading medical content...</p>
          <p className="text-sm text-gray-500">Please wait while we prepare the information</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#90cdf4]/10 to-[#63b3ed]/10 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-[#63b3ed]/30 max-w-md">
          <AlertCircle className="w-16 h-16 text-[#2b6cb0] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Content</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2b6cb0] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Reading Progress Bar */}
      <ReadingProgress 
        progress={readingProgress}
        showBackToTop={showBackToTop}
        onBackToTop={scrollToTop}
      />

      <div className="w-full px-4 py-8 flex gap-6">
        {/* Table of Contents Sidebar */}
        {showTOC && tableOfContents.length > 0 && (
          <TableOfContents
            items={tableOfContents}
            activeSection={activeSection}
            isVisible={showTOC}
            onItemClick={scrollToSection}
            onToggleVisibility={() => setShowTOC(false)}
            sections={sections}
            onToggleSection={toggleSection}
            estimatedReadTime={estimatedReadTime}
            readingProgress={readingProgress}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search within document..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {!showTOC && (
                  <button
                    onClick={() => setShowTOC(true)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="hidden sm:inline">TOC</span>
                  </button>
                )}
                
                {/* Expand/Collapse All Sections */}
                <button
                  onClick={toggleAllSections}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  title={sections.some(s => s.isCollapsed) ? 'Expand all sections' : 'Collapse all sections'}
                >
                  {sections.some(s => s.isCollapsed) ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {sections.some(s => s.isCollapsed) ? 'Expand All' : 'Collapse All'}
                  </span>
                </button>
                
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`px-4 py-3 rounded-xl transition-colors flex items-center space-x-2 ${
                    bookmarked 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#2b6cb0] transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                data-section-id={section.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <div 
                  id={section.id}
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {section.level === 1 ? (
                        <div className="p-3 bg-blue-600 rounded-xl">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="p-2 bg-indigo-500 rounded-lg">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h2 className={`font-bold text-gray-900 ${
                          section.level === 1 ? 'text-2xl' : 'text-xl'
                        }`}>
                          {section.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.level === 1 ? 'Main Section' : 'Subsection'} • 
                          {section.isCollapsed ? ' Collapsed' : ' Expanded'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {section.isCollapsed ? (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    section.isCollapsed ? 'max-h-0' : 'max-h-none'
                  }`}
                >
                  <div className="p-8">
                    <div className="prose prose-lg max-w-none">
                      {section.title.toLowerCase().includes('reference') ? (
                        // Special handling for References section
                        <ReferenceSection content={section.content} />
                      ) : section.title.toLowerCase().includes('background') ? (
                        // Special handling for Background section
                        <BackgroundRenderer 
                          content={`## ${section.title}\n${section.content}`} 
                          showHeader={false}
                        />
                      ) : section.title.toLowerCase().includes('guidelines') ? (
                        // Special handling for Guidelines section
                        <GuidelinesRenderer 
                          content={`## ${section.title}\n${section.content}`} 
                          showHeader={false}
                        />
                      ) : section.title.toLowerCase().includes('studies') ? (
                        // Special handling for Studies section
                        <StudiesRenderer 
                          content={`## ${section.title}\n${section.content}`} 
                          showHeader={false}
                        />
                      ) : (
                        // Check if this is Clinical findings section
                        section.title.toLowerCase().includes('clinical') && section.title.toLowerCase().includes('findings') ? (
                          <ClinicalFindingsRenderer content={section.content} />
                        ) : (
                          // Regular enhanced markdown rendering for other sections
                          (() => {
                            return (
                              <EnhancedMarkdownRenderer 
                                content={section.content}
                                currentH2Section={currentH2Section}
                                currentH3Section={currentH3Section}
                                onSectionChange={handleSectionChange}
                                hideEvidenceTable={filePath?.includes('evidence-based-medicine-guide')}
                              />
                            );
                          })()
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back to Top Button - handled by ReadingProgress component */}
    </div>
  );
};

export default ModularInteractiveMarkdownViewer; 