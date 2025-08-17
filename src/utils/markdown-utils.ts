import React from 'react';
import { 
  Award, 
  CheckCircle, 
  Info, 
  XCircle, 
  Minus, 
  Users, 
  AlertTriangle, 
  Shield 
} from 'lucide-react';
import { EvidenceLevel, MarkdownSection } from '../types/markdown-viewer';

/**
 * Detects evidence level from text content using comprehensive pattern matching
 * @param text - The text content to analyze
 * @returns Evidence level information or null if not found
 */
export const getEvidenceLevel = (text: string): EvidenceLevel | null => {
  const evidencePatterns = [
    // Enhanced Class/Level A patterns - Highest quality evidence
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+a\]\*\*|\*\*evidence\s+level:\s*class\s+a\*\*|\*\*\[(evidence\s+level:\s*)?a\]\*\*|\*\*evidence\s+level:\s*a\*\*|\(level\s+a\)|\(a\)|\bclass\s+i(?:\s|,|\.|\)|\]|$)|\blevel\s+(?:of\s+evidence\s+)?a\b|\bgrade\s+a\b|\bstrong\s+evidence\b|\bevidence\s+level:\s*a\b|\*\*\[a\]\*\*|^Evidence\s+Level:\s*A$|^Level\s+A$|^Class\s+A$|^Grade\s+A$)/i, 
      level: 'A', 
      color: 'emerald', 
      icon: Award 
    },
    // Enhanced Class/Level B patterns - Moderate quality evidence
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+b\]\*\*|\*\*evidence\s+level:\s*class\s+b\*\*|\*\*\[(evidence\s+level:\s*)?b\]\*\*|\*\*evidence\s+level:\s*b\*\*|\(level\s+b\)|\(b\)|\bclass\s+ii(?:\s|,|\.|\)|\]|$)|\blevel\s+(?:of\s+evidence\s+)?b\b|\bgrade\s+b\b|\bmoderate\s+evidence\b|\bevidence\s+level:\s*b\b|\*\*\[b\]\*\*|^Evidence\s+Level:\s*B$|^Level\s+B$|^Class\s+B$|^Grade\s+B$)/i, 
      level: 'B', 
      color: 'blue', 
      icon: CheckCircle 
    },
    // Enhanced Class/Level C patterns - Limited quality evidence
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+c\]\*\*|\*\*evidence\s+level:\s*class\s+c\*\*|\*\*\[(evidence\s+level:\s*)?c\]\*\*|\*\*evidence\s+level:\s*c\*\*|\(level\s+c\)|\(c\)|\bclass\s+iii(?:\s|,|\.|\)|\]|$)|\blevel\s+(?:of\s+evidence\s+)?c\b|\bgrade\s+c\b|\blimited\s+evidence\b|\bevidence\s+level:\s*c\b|\*\*\[c\]\*\*|^Evidence\s+Level:\s*C$|^Level\s+C$|^Class\s+C$|^Grade\s+C$)/i, 
      level: 'C', 
      color: 'amber', 
      icon: Info 
    },
    // Enhanced Class/Level D patterns - Very limited quality evidence
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+d\]\*\*|\*\*evidence\s+level:\s*class\s+d\*\*|\*\*\[(evidence\s+level:\s*)?d\]\*\*|\*\*evidence\s+level:\s*d\*\*|\(level\s+d\)|\(d\)|\bclass\s+iv(?:\s|,|\.|\)|\]|$)|\blevel\s+(?:of\s+evidence\s+)?d\b|\bgrade\s+d\b|\bevidence\s+level:\s*d\b|\*\*\[d\]\*\*|^Evidence\s+Level:\s*D$|^Level\s+D$|^Class\s+D$|^Grade\s+D$)/i, 
      level: 'D', 
      color: 'purple', 
      icon: Minus 
    },
    // Enhanced Class/Level E patterns - Expert opinion level
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+e\]\*\*|\*\*evidence\s+level:\s*class\s+e\*\*|\*\*\[(evidence\s+level:\s*)?e\]\*\*|\*\*evidence\s+level:\s*e\*\*|\(level\s+e\)|\(e\)|\bclass\s+v(?:\s|,|\.|\)|\]|$)|\blevel\s+(?:of\s+evidence\s+)?e\b|\bgrade\s+e\b|\bevidence\s+level:\s*e\b|\*\*\[e\]\*\*|^Evidence\s+Level:\s*E$|^Level\s+E$|^Class\s+E$|^Grade\s+E$)/i, 
      level: 'E', 
      color: 'slate', 
      icon: Minus 
    },
    // Enhanced Class/Level I patterns - Insufficient evidence
    { 
      pattern: /(\*\*\[(evidence\s+level:\s*)?class\s+i\]\*\*|\*\*evidence\s+level:\s*class\s+i\*\*|\*\*\[(evidence\s+level:\s*)?i\]\*\*|\*\*evidence\s+level:\s*i\*\*|\(level\s+i\)|\(i\)|\binsufficient\s+evidence\b|\bevidence\s+level:\s*i\b|\*\*\[i\]\*\*|^Evidence\s+Level:\s*I$|^Level\s+I$|^Class\s+I$|^Grade\s+I$)/i, 
      level: 'I', 
      color: 'red', 
      icon: XCircle 
    },
    // Special evidence types
    { pattern: /\b(expert\s+opinion|consensus|recommendation)\b/i, level: 'Expert', color: 'purple', icon: Users },
    { pattern: /\b(contraindication|warning|caution|avoid)\b/i, level: 'Warning', color: 'red', icon: AlertTriangle },
    { pattern: /\b(guideline|should|recommended)\b/i, level: 'Guideline', color: 'indigo', icon: Shield }
  ];

  for (const { pattern, level, color, icon } of evidencePatterns) {
    if (pattern.test(text)) {
      return { level, color, icon };
    }
  }
  return null;
};

/**
 * Get evidence level information by letter
 * @param level - The evidence level letter (A, B, C, D, E, I)
 * @returns Evidence level styling information
 */
export const getEvidenceLevelInfo = (level: string): { color: string; icon: React.ComponentType<{ className?: string }> } => {
  const levelMap = {
    'A': { color: 'emerald', icon: Award },
    'B': { color: 'blue', icon: CheckCircle },
    'C': { color: 'amber', icon: Info },
    'D': { color: 'purple', icon: Minus },
    'E': { color: 'slate', icon: Minus },
    'I': { color: 'red', icon: XCircle }
  };
  
  return levelMap[level as keyof typeof levelMap] || { color: 'slate', icon: Minus };
};

/**
 * Extract text content from React children recursively
 * @param children - React children to extract text from
 * @returns Extracted text content
 */
export const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return children.toString();
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children && typeof children === 'object' && children.props) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
};

/**
 * Render text with inline evidence level highlighting
 * @param children - React children to process
 * @returns Processed React elements with evidence level badges
 */
export const renderTextWithEvidenceLevels = (children: React.ReactNode): React.ReactNode => {
  const text = extractTextFromChildren(children);
  
  // Enhanced comprehensive pattern to match ALL evidence level formats including parenthetical and Level I
  const inlineEvidencePattern = /(Evidence\s+Level:\s*(?:Class\s*)?[A-EI]|Class\s+[A-EI]|Level\s+[A-EI]|Grade\s+[A-EI]|\([A-EI]\)|\[[A-EI]\]|\*\*Evidence\s+Level:\s*[A-EI]\*\*|\*\*\[Evidence\s+Level\s+[A-EI]\]\*\*)/gi;
  
  const parts = text.split(inlineEvidencePattern);
  
  return parts.map((part, index) => {
    // Enhanced patterns to detect all evidence level formats including Level I
    const patterns = [
      { regex: /^Evidence\s+Level:\s*(?:Class\s*)?([A-EI])$/i },
      { regex: /^\*\*Evidence\s+Level:\s*([A-EI])\*\*$/i },
      { regex: /^\*\*\[Evidence\s+Level\s+([A-EI])\]\*\*$/i },
      { regex: /^Class\s+([A-EI])$/i },
      { regex: /^Level\s+([A-EI])$/i },
      { regex: /^Grade\s+([A-EI])$/i },
      { regex: /^\(([A-EI])\)$/i },
      { regex: /^\[([A-EI])\]$/i }
    ];
    
    for (const { regex } of patterns) {
      const match = part.match(regex);
      if (match) {
        const level = match[1].toUpperCase();
        const evidence = getEvidenceLevelInfo(level);
        
        // Route through unified EvidenceLevel component
        return React.createElement(
          'span',
          {
            key: index,
            className: `inline-flex items-center gap-1 px-2.5 py-1 mx-1 bg-gradient-to-r rounded-lg border text-xs font-bold shadow-sm`,
            style: getEvidenceLevelStyles(evidence.color)
          },
          React.createElement(evidence.icon, { className: 'w-3.5 h-3.5' }),
          React.createElement('span', {}, `Level ${level}`)
        );
      }
    }
    
    return part;
  });
};

/**
 * Get consistent evidence level styles for unified appearance
 * @param color - Color scheme identifier
 * @returns CSS styles object for consistent evidence level appearance
 */
const getEvidenceLevelStyles = (color: string) => {
  const colorClasses = {
    emerald: {
      background: 'linear-gradient(to right, rgb(209 250 229), rgb(187 247 208))',
      color: 'rgb(6 95 70)',
      borderColor: 'rgb(110 231 183)'
    },
    blue: {
      background: 'linear-gradient(to right, rgb(219 234 254), rgb(186 230 253))',
      color: 'rgb(30 64 175)',
      borderColor: 'rgb(147 197 253)'
    },
    amber: {
      background: 'linear-gradient(to right, rgb(254 243 199), rgb(253 230 138))',
      color: 'rgb(146 64 14)',
      borderColor: 'rgb(252 211 77)'
    },
    purple: {
      background: 'linear-gradient(to right, rgb(243 232 255), rgb(221 214 254))',
      color: 'rgb(107 33 168)',
      borderColor: 'rgb(196 181 253)'
    },
    red: {
      background: 'linear-gradient(to right, rgb(254 226 226), rgb(252 165 165))',
      color: 'rgb(153 27 27)',
      borderColor: 'rgb(248 113 113)'
    },
    slate: {
      background: 'linear-gradient(to right, rgb(241 245 249), rgb(226 232 240))',
      color: 'rgb(30 41 59)',
      borderColor: 'rgb(148 163 184)'
    }
  };
  
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.slate;
};

/**
 * Parse markdown content into collapsible sections
 * @param content - Raw markdown content
 * @returns Array of parsed markdown sections
 */
export const parseMarkdownSections = (content: string): MarkdownSection[] => {
  const lines = content.split('\n');
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection | null = null;
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);

    if (h1Match || h2Match) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = sectionContent.join('\n').trim();
        sections.push(currentSection);
      }

      // Start new section
      const title = h1Match ? h1Match[1] : h2Match![1];
      const level = h1Match ? 1 : 2;
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      currentSection = {
        id,
        title,
        level,
        content: '',
        isCollapsed: title.toLowerCase().includes('studies') || 
                     title.toLowerCase().includes('major clinical studies')
      };
      sectionContent = [];
      
      // For Clinical Findings sections, include the H2 header in the content
      if (title.toLowerCase().includes('clinical') && title.toLowerCase().includes('findings')) {
        sectionContent.push(line);
      }
    } else {
      // Add line to current section content
      sectionContent.push(line);
    }
  }

  // Add the last section
  if (currentSection) {
    currentSection.content = sectionContent.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
};

/**
 * Calculate estimated reading time based on content
 * @param content - Text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Estimated reading time in minutes
 */
export const calculateReadingTime = (content: string, wordsPerMinute: number = 200): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Generate a unique ID from a title string
 * @param title - The title to convert to an ID
 * @returns URL-safe ID string
 */
export const generateId = (title: string): string => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

/**
 * Quote icon component for rendering quotes
 */
export const Quote: React.FC<{ className?: string }> = ({ className }) => {
  return React.createElement(
    'svg',
    {
      className,
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    },
    React.createElement('path', {
      d: 'M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z'
    })
  );
};