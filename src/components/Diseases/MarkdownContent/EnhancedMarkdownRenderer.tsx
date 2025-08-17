import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkLikelihoodRatios } from '../../../utils/remark-likelihood-ratios';
import { 
  FileText, BookOpen, Activity, Stethoscope, Shield, Globe, Heart,
  User, Microscope, Pill, Thermometer, Target, TrendingUp, Users,
  Award, CheckCircle, Info, XCircle, Minus, AlertTriangle, Star, Calculator
} from 'lucide-react';
import { extractTextFromChildren, renderTextWithEvidenceLevels, getEvidenceLevelInfo, getEvidenceLevel } from '../../../utils/markdown-utils';
import { Quote } from '../../../utils/markdown-utils';
import { GuidelineRenderer } from '../Guidelines/GuidelineRenderer';
import { UpdatedEvidenceSection, LandmarkTrialsSection } from '../SpecialSections';
import { LikelihoodRatiosTable, parseLikelihoodRatioTable } from '../LikelihoodRatiosTable';
import CHA2DS2VAScCalculator from '../../Calculators/CHA2DS2VAScCalculator';
import HIT4TsCalculator from '../../Calculators/HIT4TsCalculator';
import { SIADHCalculator } from '../../Calculators/SIADHCalculator';
import LakeLouiseCriteriaCalculator from '../../Calculators/LakeLouiseCriteriaCalculator';
import EvidenceLevelsTable from '../EvidenceLevel/EvidenceLevelsTable';

interface EnhancedMarkdownRendererProps {
  content: string;
  currentH2Section: string;
  currentH3Section: string;
  onSectionChange?: (h2: string, h3: string) => void;
  className?: string;
  hideEvidenceTable?: boolean;
}

/**
 * Enhanced Markdown Renderer with sophisticated medical components
 * Now uses SIMPLIFIED guideline detection approach
 */
export const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({
  content,
  currentH2Section,
  currentH3Section,
  onSectionChange,
  className = '',
  hideEvidenceTable = false
}) => {
  // Create medical color schemes for different section types
  const getSectionColorScheme = (sectionType: string) => {
    const schemes = {
      symptoms: { icon: Stethoscope, gradient: 'from-purple-500 to-violet-600', bg: 'from-purple-50 to-violet-50', text: 'text-purple-900', border: 'border-purple-200' },
      demographics: { icon: User, gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50', text: 'text-emerald-900', border: 'border-emerald-200' },
      'medical history': { icon: Heart, gradient: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50', text: 'text-red-900', border: 'border-red-200' },
      'past medical history': { icon: Heart, gradient: 'from-red-500 to-rose-600', bg: 'from-red-50 to-rose-50', text: 'text-red-900', border: 'border-red-200' },
      'vital signs': { icon: Activity, gradient: 'from-cyan-500 to-blue-600', bg: 'from-cyan-50 to-blue-50', text: 'text-cyan-900', border: 'border-cyan-200' },
      default: { icon: Activity, gradient: 'from-slate-500 to-gray-600', bg: 'from-slate-50 to-gray-50', text: 'text-slate-900', border: 'border-slate-200' }
    };
    return schemes[sectionType.toLowerCase() as keyof typeof schemes] || schemes.default;
  };

  // Advanced markdown components with all original sophistication
  const MarkdownComponents = {
    // H1 with medical icons and gradient backgrounds
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center space-x-4 pb-6 border-b-2 border-gradient-to-r from-blue-500 to-indigo-500 font-['Inter',_'system-ui',_sans-serif]">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <span className="tracking-tight">{children}</span>
      </h1>
    ),

    // H2 with section-specific styling and medical icons
    h2: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      
      // Track current H2 section
      React.useEffect(() => {
        if (onSectionChange) {
          onSectionChange(text, ''); // Reset H3 when new H2 starts
        }
      }, [text]);
      
      // Special handling for Clinical findings section (case insensitive)
      if (text.toLowerCase().includes('clinical findings')) {
        return (
          <div>
            <div className="bg-purple-50 -mx-8 px-8 py-6 mb-8 mt-12 rounded-2xl border-l-4 border-gradient-to-b from-purple-600 to-violet-600">
              <h2 className="text-3xl font-bold text-purple-900 flex items-center space-x-4 font-['Inter',_'system-ui',_sans-serif]" {...props}>
                <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="tracking-tight">{children}</span>
              </h2>
            </div>
          </div>
        );
      }
      
      // Special handling for Levels of Evidence section - check if content contains evidence levels intro text
      const contentLower = content.toLowerCase();
      const isEvidenceLevelsContent = !hideEvidenceTable && (text.toLowerCase().includes('levels of evidence') || 
                                     (text.toLowerCase().includes('introduction') && 
                                      (contentLower.includes('levels of evidence help you to target') ||
                                       contentLower.includes('grades of evidence describe') ||
                                       contentLower.includes('systematic reviews of randomised controlled trials'))));
      
      if (isEvidenceLevelsContent) {
        return (
          <div>
            <div className="bg-indigo-50 -mx-8 px-8 py-6 mb-8 mt-12 rounded-2xl border-l-4 border-gradient-to-b from-indigo-600 to-purple-600">
              <h2 className="text-3xl font-bold text-indigo-900 flex items-center space-x-4 font-['Inter',_'system-ui',_sans-serif]" {...props}>
                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="tracking-tight">{children}</span>
              </h2>
            </div>
            <EvidenceLevelsTable />
          </div>
        );
      }
      
      // Dynamic styling based on content
      let icon = Activity;
      let gradientClasses = "from-blue-600 to-indigo-600";
      let textColor = "text-blue-900";
      let bgColor = "bg-blue-50";
      
      if (text.includes('Background') || text.includes('Overview')) {
        icon = BookOpen;
        gradientClasses = "from-emerald-600 to-teal-600";
        textColor = "text-emerald-900";
        bgColor = "bg-emerald-50";
      } else if (text.includes('Clinical') || text.includes('Symptoms') || text.includes('Findings')) {
        icon = Stethoscope;
        gradientClasses = "from-purple-600 to-violet-600";
        textColor = "text-purple-900";
        bgColor = "bg-purple-50";
      } else if (text.includes('Guidelines') || text.includes('Management')) {
        icon = Shield;
        gradientClasses = "from-indigo-600 to-blue-600";
        textColor = "text-indigo-900";
        bgColor = "bg-indigo-50";
      } else if (text.includes('References')) {
        icon = Globe;
        gradientClasses = "from-slate-600 to-gray-600";
        textColor = "text-slate-900";
        bgColor = "bg-slate-50";
      }
      
      const IconComponent = icon;
      
      return (
        <div className={`${bgColor} -mx-8 px-8 py-6 mb-8 mt-12 rounded-2xl border-l-4 border-gradient-to-b ${gradientClasses.replace('from-', 'from-').replace('to-', 'to-')}`}>
          <h2 className={`text-3xl font-bold ${textColor} flex items-center space-x-4 font-['Inter',_'system-ui',_sans-serif]`} {...props}>
            <div className={`p-3 bg-gradient-to-r ${gradientClasses} rounded-xl shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <span className="tracking-tight">{children}</span>
          </h2>
        </div>
      );
    },

    // H3 with medical icons and color schemes
    h3: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      
      // Track current H3 section
      React.useEffect(() => {
        if (onSectionChange) {
          onSectionChange(currentH2Section, text);
        }
      }, [text]);
      
      // Hide h3 if we're in Clinical findings section (handled by standalone component)
      if (currentH2Section.toLowerCase().includes('clinical findings')) {
        return null;
      }
      
      let icon = Activity;
      let dotColor = "from-blue-500 to-indigo-600";
      let colorClasses = "text-blue-900";

      if (text.includes('Clinical') || text.includes('Symptoms')) {
        icon = Stethoscope;
        dotColor = "from-purple-500 to-violet-600";
        colorClasses = "text-purple-900";
      } else if (text.includes('Management') || text.includes('Treatment')) {
        icon = Shield;
        dotColor = "from-indigo-500 to-blue-600";
        colorClasses = "text-indigo-900";
      } else if (text.includes('Background') || text.includes('Pathophysiology')) {
        icon = BookOpen;
        dotColor = "from-emerald-500 to-teal-600";
        colorClasses = "text-emerald-900";
      }
      
      const IconComponent = icon;
      
      return (
        <h3 className={`text-xl font-bold ${colorClasses} mb-5 mt-10 flex items-center space-x-3 font-['Inter',_'system-ui',_sans-serif]`} {...props}>
          <div className={`p-2 bg-gradient-to-r ${dotColor} rounded-lg shadow-md`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight">{children}</span>
        </h3>
      );
    },

    // H4 with simple dotted styling
    h4: ({ children, ...props }: any) => (
      <h4 className="text-lg font-bold text-gray-800 mb-4 mt-8 flex items-center space-x-2 font-['Inter',_'system-ui',_sans-serif]" {...props}>
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
        <span className="tracking-tight">{children}</span>
      </h4>
    ),

    // Complex paragraph processing with evidence level detection
    p: ({ children, ...props }: any) => {
      const text = extractTextFromChildren(children);
      
      // Check if this is a standalone evidence level paragraph (ONLY evidence level, no other content)
      const standaloneEvidencePatterns = [
        /^Evidence\s+Level:\s*Class\s*[A-E]\.?$/i,
        /^Evidence\s+Level:\s*[A-E]\.?$/i,
        /^\[Evidence\s+Level:\s*[A-E]\]\.?$/i,
        /^Class\s+[A-E]:?\s*\.?$/i,
        /^\([A-E]\)\.?$/i,
        /^\[[A-E]\]\.?$/i,
        /^Level\s+[A-E]\.?$/i
      ];
      
      const isStandaloneEvidence = standaloneEvidencePatterns.some(pattern => pattern.test(text.trim()));
      
      if (isStandaloneEvidence) {
        const evidenceLevel = getEvidenceLevel(text.trim());
        if (evidenceLevel) {
          const { level, color, icon: EvidenceIcon } = evidenceLevel;
          
          const colorClasses = {
            emerald: 'from-emerald-100 to-green-100 text-emerald-900 border-emerald-300',
            blue: 'from-blue-100 to-sky-100 text-blue-900 border-blue-300',
            amber: 'from-amber-100 to-yellow-100 text-amber-900 border-amber-300',
            purple: 'from-purple-100 to-violet-100 text-purple-900 border-purple-300',
            red: 'from-red-100 to-pink-100 text-red-900 border-red-300',
            indigo: 'from-indigo-100 to-blue-100 text-indigo-900 border-indigo-300',
            slate: 'from-slate-100 to-gray-100 text-slate-900 border-slate-300'
          };
          
          return (
            <div className="flex justify-center my-8" {...props}>
              <div className={`inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl border-2 shadow-xl font-['Inter',_'system-ui',_sans-serif]`}>
                <EvidenceIcon className="w-6 h-6" />
                <span className="text-xl font-bold">Evidence Level {level}</span>
              </div>
            </div>
          );
        }
      }
      
      // 🧮 ENHANCED RENDERER - Calculator detection logic
      
      // TEMPORARY TEST: Force calculator render for CHA₂DS₂-VASc sections
      if (text.includes('CHA₂DS₂-VASc')) {
        return (
          <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg" {...props}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">CHA₂DS₂-VASc Calculator</h3>
            </div>
            <CHA2DS2VAScCalculator />
            <p className="mt-4 text-gray-700">{children}</p>
          </div>
        );
      }
      
      // Check for calculator placeholder
      if (text.includes('*Calculator Available*') || text.includes('Calculator Available')) {
        
        // Determine which calculator to render based on context
        const contextText = (currentH2Section + ' ' + currentH3Section + ' ' + content).toLowerCase();
        
        // Check for SIADH diagnostic criteria
        const isSIADHSection = contextText.includes('siadh') || 
                              contextText.includes('syndrome of inappropriate antidiuretic hormone') ||
                              contextText.includes('diagnostic criteria for syndrome') ||
                              contextText.includes('antidiuretic hormone secretion') ||
                              contextText.includes('hyponatremia') ||
                              text.toLowerCase().includes('essential criteria') ||
                              text.toLowerCase().includes('supplemental criteria');
        
        // Check for HIT 4Ts
        const isHIT4TsSection = contextText.includes('4ts') || 
                               contextText.includes('heparin-induced thrombocytopenia') ||
                               contextText.includes('hit') ||
                               text.toLowerCase().includes('heparin');
        
        // Check for Lake Louise Criteria (more specific detection)
        const isLakeLouiseSection = contextText.includes('lake louise') ||
                                   (contextText.includes('lake') && contextText.includes('louise')) ||
                                   (currentH2Section.toLowerCase().includes('lake louise')) ||
                                   (currentH3Section.toLowerCase().includes('lake louise')) ||
                                   text.toLowerCase().includes('lake louise criteria');

        if (isLakeLouiseSection) {
          return (
            <div className="my-8" {...props}>
              <LakeLouiseCriteriaCalculator />
            </div>
          );
        } else if (isSIADHSection) {
          return (
            <div className="my-8" {...props}>
              <SIADHCalculator />
            </div>
          );
        } else if (isHIT4TsSection) {
          return (
            <div className="my-8" {...props}>
              <HIT4TsCalculator />
            </div>
          );
        } else {
          // Default to CHA₂DS₂-VASc calculator for other sections
          return (
            <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg" {...props}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">CHA₂DS₂-VASc Calculator</h3>
              </div>
              <CHA2DS2VAScCalculator />
            </div>
          );
        }
      }
      
      // For all other paragraphs (including those with evidence levels mixed with text), render normally with inline evidence highlighting
      return (
        <p className="mb-4 text-gray-700 leading-relaxed" {...props}>
          {renderTextWithEvidenceLevels(children)}
        </p>
      );
    },

    // Enhanced strong with evidence level patterns
    strong: ({ children, ...props }: any) => {
      const text = extractTextFromChildren(children);
      
      // Use the comprehensive evidence detection from utils
      const evidenceLevel = getEvidenceLevel(text);
      
      if (evidenceLevel) {
        const { level, color, icon: EvidenceIcon } = evidenceLevel;
        
        const colorClasses = {
          emerald: 'text-emerald-900 bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300',
          blue: 'text-blue-900 bg-gradient-to-r from-blue-100 to-sky-100 border-blue-300',
          amber: 'text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300',
          purple: 'text-purple-900 bg-gradient-to-r from-purple-100 to-violet-100 border-purple-300',
          red: 'text-red-900 bg-gradient-to-r from-red-100 to-pink-100 border-red-300',
          indigo: 'text-indigo-900 bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-300',
          slate: 'text-slate-900 bg-gradient-to-r from-slate-100 to-gray-100 border-slate-300'
        };

        const displayText = `Evidence Level ${level}`;

        return (
          <strong className={`inline-flex items-center space-x-2 font-bold px-3 py-1.5 rounded-xl border font-['Inter',_'system-ui',_sans-serif] shadow-lg hover:shadow-xl transition-all duration-200 ${colorClasses[color as keyof typeof colorClasses]}`} {...props}>
            <EvidenceIcon className="w-4 h-4" />
            <span>{displayText}</span>
          </strong>
        );
      }
      
      // Medical keyword styling
      if (text.includes('Definition') || text.includes('Pathophysiology') || text.includes('Epidemiology')) {
        return (
          <strong className="font-bold text-emerald-900 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1.5 rounded-xl border border-emerald-200 font-['Inter',_'system-ui',_sans-serif] shadow-sm" {...props}>
            {children}
          </strong>
        );
      }
      
      return (
        <strong className="font-bold text-gray-900 bg-gradient-to-r from-slate-100 to-gray-100 px-2 py-1 rounded-lg border border-slate-200 font-['Inter',_'system-ui',_sans-serif] shadow-sm" {...props}>
          {children}
        </strong>
      );
    },

    // Reference lists with special spacing
    ol: ({ children, ...props }: any) => {
      const childrenText = extractTextFromChildren(children);
      const isReferencesList = childrenText.includes('et al.') || 
                              childrenText.includes('PubMed') || 
                              childrenText.includes('doi:') ||
                              /\d+\.\s+\w+.*et al\./.test(childrenText);
      
      if (isReferencesList) {
        return (
          <ol className="space-y-6 mb-8 pl-0" {...props}>
            {children}
          </ol>
        );
      }
      
      return (
        <ol className="space-y-4 mb-8 pl-2" {...props}>
          {children}
        </ol>
      );
    },

    // Standard lists with evidence level support
    ul: ({ children, ...props }: any) => (
      <ul className="space-y-4 mb-8 pl-2" {...props}>
        {children}
      </ul>
    ),

    // List items with evidence level highlighting
    li: ({ children, ...props }: any) => (
      <li className="mb-2 text-gray-700" {...props}>
        {renderTextWithEvidenceLevels(children)}
      </li>
    ),

    // Clinical section with medical color schemes
    ClinicalSection: ({ children, type, ...props }: any) => {
      const colorScheme = getSectionColorScheme(type);
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8" {...props}>
          {children}
        </div>
      );
    },

    // Clinical items with sophisticated styling
    ClinicalItem: ({ children, ...props }: any) => {
      const colorScheme = { icon: Stethoscope, gradient: 'from-purple-500 to-violet-600', bg: 'from-purple-50 to-violet-50', text: 'text-purple-900', border: 'border-purple-200' };
      const IconComponent = colorScheme.icon;
      
      return (
        <div className={`group relative overflow-hidden rounded-xl border ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg} p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`} {...props}>
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 bg-gradient-to-r ${colorScheme.gradient} rounded-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <div className={`font-medium text-sm ${colorScheme.text} leading-snug flex-1`}>
              {children}
            </div>
          </div>
          <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-bl ${colorScheme.gradient} opacity-20 rounded-full`}></div>
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-tr ${colorScheme.gradient} opacity-15 rounded-full`}></div>
        </div>
      );
    },

    // Enhanced blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 my-8 rounded-r-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
        {...props}
      >
        <div className="flex items-start space-x-5">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
            <Quote className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-gray-800 font-medium leading-relaxed text-lg italic font-['Inter',_'system-ui',_sans-serif] tracking-tight">
            {renderTextWithEvidenceLevels(children)}
          </div>
        </div>
      </blockquote>
    ),

    // Advanced table with evidence level and likelihood ratio detection
    table: ({ children, ...props }: any) => {
      const tableContent = extractTextFromChildren(children);
      const hasAdvancedStyling = tableContent.includes('Evidence Level') || 
                                tableContent.includes('Class') ||
                                tableContent.includes('Recommendation');
      
      // Check if this is a likelihood ratio table
      const isLikelihoodRatioTable = tableContent.includes('LR+') || tableContent.includes('LR-');
      const isPositiveLR = tableContent.includes('LR+');
      
      // For likelihood ratio tables, use custom styling
      if (isLikelihoodRatioTable) {
        return (
          <div className="overflow-x-auto my-8">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm" {...props}>
              {children}
            </table>
          </div>
        );
      }
      
      const containerClasses = hasAdvancedStyling 
        ? "overflow-x-auto my-12 rounded-2xl shadow-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
        : "overflow-x-auto my-8 rounded-xl shadow-xl border border-gray-200";
      
      const tableClasses = hasAdvancedStyling
        ? "w-full border-collapse bg-white rounded-2xl overflow-hidden"
        : "w-full border-collapse bg-white rounded-xl overflow-hidden";
      
      return (
        <div className={containerClasses}>
          <table className={tableClasses} {...props}>
            {children}
          </table>
        </div>
      );
    },

    // Enhanced table headers
    thead: ({ children, ...props }: any) => {
      const headerText = extractTextFromChildren(children);
      const hasEvidenceLevels = headerText.includes('Evidence Level') || 
                               headerText.includes('Class');
      const isLRTable = headerText.includes('LR+') || headerText.includes('LR-');
      
      // For likelihood ratio tables, use minimal styling
      if (isLRTable) {
        return (
          <thead className="bg-white" {...props}>
            {children}
          </thead>
        );
      }
      
      const headerClasses = hasEvidenceLevels 
        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white"
        : "bg-gradient-to-r from-gray-700 to-gray-800 text-white";
      
      return (
        <thead className={headerClasses} {...props}>
          {children}
        </thead>
      );
    },

    // Professional table headers
    th: ({ children, ...props }: any) => {
      const text = extractTextFromChildren(children);
      const isLRHeader = text === 'LR+' || text === 'LR-';
      
      // For likelihood ratio tables, use simpler styling
      if (isLRHeader || text === 'Finding' || text === 'Value') {
        return (
          <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200" {...props}>
            {children}
          </th>
        );
      }
      
      return (
        <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider border-r border-white/20 last:border-r-0" {...props}>
          {children}
        </th>
      );
    },

    // Advanced table cells with likelihood ratio bars
    td: ({ children, ...props }: any) => {
      const text = extractTextFromChildren(children);
      const isEvidenceCell = /Class\s*[A-E]/i.test(text);
      
      // Check if parent is a likelihood ratio table by looking at table context
      const parentElement = props.node?.parent?.parent?.parent;
      const tableText = parentElement ? extractTextFromChildren(parentElement) : '';
      const isLRTable = tableText.includes('LR+') || tableText.includes('LR-');
      
      // Check if this is a confidence interval cell (contains parentheses)
      const isConfidenceInterval = /\([^)]+\)/.test(text);
      
      // For LR tables, check column position
      const cellIndex = props.node?.parent?.children?.indexOf(props.node) || 0;
      const isValueColumn = isLRTable && cellIndex === 2; // Third column (0-indexed)
      const isLRColumn = isLRTable && cellIndex === 1; // Second column
      
      const cellClasses = isEvidenceCell
        ? "px-6 py-4 border-b border-gray-200 font-medium bg-gradient-to-r from-blue-50 to-indigo-50"
        : isLRTable
        ? "py-3 px-4 border-b border-gray-100"
        : "px-6 py-4 border-b border-gray-200";
      
      if (isEvidenceCell) {
        const match = text.match(/Class\s*([A-E])/i);
        if (match) {
          const level = match[1].toUpperCase();
          const { color, icon: EvidenceIcon } = getEvidenceLevelInfo(level);
          
          return (
            <td className={cellClasses} {...props}>
              <div className="flex items-center space-x-2">
                <EvidenceIcon className="w-4 h-4 text-blue-600" />
                <span className="font-bold">{children}</span>
              </div>
            </td>
          );
        }
      }
      
      // Handle LR column (show value with confidence interval)
      if (isLRColumn && isLRTable) {
        return (
          <td className={cellClasses} {...props}>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {children}
              </span>
            </div>
          </td>
        );
      }
      
      // Handle Value column (show visual bar)
      if (isValueColumn && isLRTable && isConfidenceInterval) {
        // Extract LR value from previous column
        const prevCell = props.node?.parent?.children?.[cellIndex - 1];
        const lrText = prevCell ? extractTextFromChildren(prevCell) : '';
        const lrMatch = lrText.match(/^(\d+\.?\d*)/); 
        const lrValue = lrMatch ? parseFloat(lrMatch[1]) : 0;
        
        let barColor = 'bg-gray-300';
        const maxLR = 20;
        const scaledValue = Math.min(lrValue, maxLR);
        const barWidth = Math.max(10, (scaledValue / maxLR) * 90);
        
        if (lrValue >= 10) {
          barColor = 'bg-green-500';
        } else if (lrValue >= 5) {
          barColor = 'bg-yellow-500';
        } else if (lrValue >= 2) {
          barColor = 'bg-orange-500';
        } else {
          barColor = 'bg-gray-400';
        }
        
        return (
          <td className={cellClasses} {...props}>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 text-sm min-w-[60px]">{children}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 max-w-[200px]">
                <div 
                  className={`${barColor} h-6 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </td>
        );
      }
      
      return (
        <td className={cellClasses} {...props}>
          {children}
        </td>
      );
    },

    // Medical-grade code styling
    code: ({ children, ...props }: any) => (
      <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-sm font-medium border border-slate-200 shadow-sm" {...props}>
        {children}
      </code>
    ),

    // Professional code blocks
    pre: ({ children, ...props }: any) => (
      <pre className="bg-slate-900 text-slate-100 p-8 rounded-2xl overflow-x-auto my-8 shadow-2xl border border-slate-700 font-['JetBrains_Mono',_monospace]" {...props}>
        {children}
      </pre>
    ),

    // Enhanced links with PubMed/DOI detection
    a: ({ children, href, ...props }: any) => {
      const linkText = children?.toString() || '';
      
      const isReferenceLink = linkText.includes('PubMed') || 
                             linkText.includes('DOI') || 
                             linkText.includes('Open') ||
                             linkText.includes('Full Text') ||
                             linkText.includes('Abstract') ||
                             linkText.includes('PMID') ||
                             href?.includes('pubmed') ||
                             href?.includes('doi.org') ||
                             href?.includes('ncbi.nlm.nih.gov');
      
      if (isReferenceLink) {
        return (
          <a 
            href={href} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '6px',
              padding: '4px 10px',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '9999px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              position: 'relative',
              zIndex: 10
            }}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(E) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #3730a3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(E) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            {...props}
          >
            {children}
          </a>
        );
      }
      
      return (
        <a 
          href={href} 
          style={{
            color: '#2563eb',
            fontWeight: '600',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          onMouseEnter={(E) => {
            e.currentTarget.style.color = '#1d4ed8';
          }}
          onMouseLeave={(E) => {
            e.currentTarget.style.color = '#2563eb';
          }}
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  // Process special sections (Updated Evidence, Landmark Trials) FIRST, before guideline processing
  const processSpecialSections = (text: string) => {
    const lines = text.split('\n');
    const parts: React.ReactNode[] = [];
    let partIndex = 0;
    let currentIndex = 0;
    
    // Pattern to match special section headers
    const specialSectionPattern = /^(#{3,4}|\*\*)\s*(Updated [Ee]vidence|Landmark [Tt]rials?):\s*(.+?)(\*\*)?$/;
    
    while (currentIndex < lines.length) {
      const line = lines[currentIndex];
      const match = line.match(specialSectionPattern);
      
      if (match) {
        const [fullMatch, marker, sectionType, trialName] = match;
        const isUpdatedEvidence = sectionType.toLowerCase().includes('updated evidence');
        
        // Capture content until next section
        const contentLines = [];
        let nextIndex = currentIndex + 1;
        
        while (nextIndex < lines.length) {
          const nextLine = lines[nextIndex];
          // Stop at next major section (##, ###, #### or **) 
          if (nextLine.match(/^#{1,4}\s/) || nextLine.match(/^\*\*/)) {
            break;
          }
          // Stop at "As per" guideline statements to prevent them from being captured
          if (nextLine.match(/^As per\s+/i) || nextLine.match(/^\s*As per\s+/i)) {
            break;
          }
          contentLines.push(nextLine);
          nextIndex++;
        }
        
        const description = contentLines.join('\n').trim();
        
        // Add the special section
        if (isUpdatedEvidence) {
          parts.push(
            <UpdatedEvidenceSection
              key={`special-${partIndex++}`}
              trialName={trialName.trim()}
              description={description}
              citation=""
            />
          );
        } else {
          parts.push(
            <LandmarkTrialsSection
              key={`special-${partIndex++}`}
              trialName={trialName.trim()}
              description={description}
              citation=""
            />
          );
        }
        
        currentIndex = nextIndex;
      } else {
        // Regular content - collect until next special section
        const contentLines = [line];
        let nextIndex = currentIndex + 1;
        
        while (nextIndex < lines.length) {
          const nextLine = lines[nextIndex];
          // Stop if we hit a special section
          if (nextLine.match(specialSectionPattern)) {
            break;
          }
          contentLines.push(nextLine);
          nextIndex++;
        }
        
        const content = contentLines.join('\n').trim();
        if (content) {
          parts.push(
            <div key={`content-${partIndex++}`}>
              <GuidelineRenderer content={content} />
            </div>
          );
        }
        
        currentIndex = nextIndex;
      }
    }
    
    return parts.length > 0 ? <>{parts}</> : processContentForGuidelines(text);
  };

  /**
   * SIMPLIFIED "As per" guideline processing
   * Uses the new GuidelineRenderer component with simple detection
   */
  const processContentForGuidelines = (text: string) => {
    return <GuidelineRenderer content={text} />;
  };

  return (
    <div className={`markdown-content ${className}`}>
      {processSpecialSections(content)}
    </div>
  );
};

export default EnhancedMarkdownRenderer; 