import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Activity, 
  Target,
  Microscope,
  Heart,
  BarChart3
} from 'lucide-react';

interface BackgroundSection {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

interface BackgroundRendererProps {
  content: string;
  className?: string;
  showHeader?: boolean;
}

const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ 
  content, 
  className = "",
  showHeader = true
}) => {
  const parseBackgroundSection = (content: string): BackgroundSection[] => {
    const sections: BackgroundSection[] = [];
    
    // Find the Background section
    const backgroundMatch = content.match(/## Background\s*\n([\s\S]*?)(?=\n## |$)/);
    if (!backgroundMatch) return sections;
    
    const backgroundContent = backgroundMatch[1];
    
    // Check if there's an Overview wrapper
    const hasOverview = backgroundContent.includes('### Overview');
    
    if (hasOverview) {
      // Parse Overview subsections
      const overviewMatch = backgroundContent.match(/### Overview\s*\n([\s\S]*?)(?=\n### |$)/);
      if (overviewMatch) {
        const overviewContent = overviewMatch[1];
        parseSubsections(overviewContent, sections);
      }
    } else {
      // Parse direct subsections
      parseSubsections(backgroundContent, sections);
    }
    
    return sections;
  };
  
  const parseSubsections = (content: string, sections: BackgroundSection[]) => {
    const subsectionRegex = /#### \*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n#### |$)/g;
    const directSubsectionRegex = /### ([^\n]+)\s*\n([\s\S]*?)(?=\n### |$)/g;
    
    let match;
    
    // Try bold subsections first (#### **Title**)
    while ((match = subsectionRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const sectionContent = match[2].trim();
      
      sections.push({
        title,
        content: sectionContent,
        icon: getIconForSection(title)
      });
    }
    
    // If no bold subsections found, try direct subsections (### Title)
    if (sections.length === 0) {
      while ((match = directSubsectionRegex.exec(content)) !== null) {
        const title = match[1].trim();
        const sectionContent = match[2].trim();
        
        sections.push({
          title,
          content: sectionContent,
          icon: getIconForSection(title)
        });
      }
    }
  };
  
  const getIconForSection = (title: string): React.ReactNode => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('definition')) {
      return <BookOpen className="w-5 h-5 text-[#1a365d]" />;
    } else if (titleLower.includes('pathophysiology')) {
      return <Microscope className="w-5 h-5 text-[#63b3ed]" />;
    } else if (titleLower.includes('epidemiology')) {
      return <BarChart3 className="w-5 h-5 text-[#2b6cb0]" />;
    } else if (titleLower.includes('disease course') || titleLower.includes('course')) {
      return <TrendingUp className="w-5 h-5 text-[#2b6cb0]" />;
    } else if (titleLower.includes('prognosis') || titleLower.includes('risk')) {
      return <Target className="w-5 h-5 text-[#2b6cb0]" />;
    } else if (titleLower.includes('demographics')) {
      return <Users className="w-5 h-5 text-[#63b3ed]" />;
    } else {
      return <Heart className="w-5 h-5 text-[#63b3ed]" />;
    }
  };
  
  const formatContent = (content: string): string => {
    // Clean up content formatting
    return content
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold formatting for display
  };
  
  const sections = parseBackgroundSection(content);
  
  if (sections.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Background
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Essential disease information and context
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {sections.length} Section{sections.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      {/* Add section count badge at top when header is hidden */}
      {!showHeader && (
        <div className="flex justify-end mb-4">
          <Badge variant="secondary">
            {sections.length} Section{sections.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      {/* Sections Grid */}
      <div className="grid gap-4 md:gap-6">
        {sections.map((section, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                    {section.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h3>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatContent(section.content).split('\n\n').map((paragraph, pIndex) => (
                      <p 
                        key={pIndex} 
                        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Background Overview Complete
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {sections.length} key aspects covered
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRenderer; 