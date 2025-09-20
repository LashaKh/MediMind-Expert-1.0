import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  Shield, 
  Award,
  BookOpen, 
  TrendingUp, 
  Users, 
  Activity, 
  Target,
  CheckCircle,
  Info,
  XCircle,
  AlertTriangle,
  Stethoscope,
  FileText,
  Building2,
  Calendar,
  Star,
  Globe
} from 'lucide-react';

interface GuidelineItem {
  title: string;
  content: string;
  evidenceLevel?: string;
  organization?: string;
  year?: string;
  type: 'key-source' | 'recommendation' | 'contraindication' | 'consideration';
  icon?: React.ReactNode;
}

interface GuidelinesRendererProps {
  content: string;
  className?: string;
  showHeader?: boolean;
}

const GuidelinesRenderer: React.FC<GuidelinesRendererProps> = ({ 
  content, 
  className = "",
  showHeader = true
}) => {
  const parseGuidelinesSection = (content: string): GuidelineItem[] => {
    const items: GuidelineItem[] = [];
    
    // Check if this is specifically a Guidelines section or full document
    const guidelinesMatch = content.match(/## Guidelines\s*\n([\s\S]*?)(?=\n## |$)/i);
    
    if (guidelinesMatch) {
      // This is a Guidelines section - parse key sources within it
      const guidelinesContent = guidelinesMatch[1];
      
      // Parse Key sources (case insensitive)
      const keySourcesMatch = guidelinesContent.match(/### Key [Ss]ources?\s*\n([\s\S]*?)(?=\n### |$)/i);
      if (keySourcesMatch) {
        const sourceContent = keySourcesMatch[1].trim();
        
        // Extract organizations and years from the content
        const orgYearMatches = sourceContent.match(/\*\*([^*]+)\*\*/g);
        let organizations: Array<{ org: string; year: string }> = [];
        if (orgYearMatches) {
          organizations = orgYearMatches.map(match => {
            const cleanMatch = match.replace(/\*\*/g, '');
            // Extract organization and year
            const yearMatch = cleanMatch.match(/\(([^)]*\d{4}[^)]*)\)/);
            const year = yearMatch ? yearMatch[1] : '';
            const org = cleanMatch.replace(/\([^)]*\d{4}[^)]*\)/g, '').trim();
            return { org, year };
          });
        }
        
        items.push({
          title: 'Key Sources',
          content: sourceContent,
          type: 'key-source',
          icon: <Building2 className="w-5 h-5 text-[#2b6cb0]" />,
          organization: organizations.length > 0 ? organizations[0].org : undefined,
          year: organizations.length > 0 ? organizations[0].year : undefined
        });
      }
      
      // Parse the rest of the document for guidelines
      const remainingContent = content.replace(guidelinesMatch[0], '');
      parseGuidelineRecommendations(remainingContent, items);
    } else {
      // This might be the full document or another section - just parse all guidelines
      parseGuidelineRecommendations(content, items);
    }
    
    return items;
  };
  
  const parseGuidelineRecommendations = (content: string, items: GuidelineItem[]) => {
    // Pattern for "As per [Organization] [Year] guidelines:" followed by recommendations
    const guidelinePattern = /\*\*As per ([^:]+?):\*\*\s*\n([\s\S]*?)(?=\n\*\*As per|\n\*\*Evidence Level:|\n## |\n### |\n#### |$)/gi;
    
    // Pattern for organization guidelines like "**ESC 2014 Guidelines:**" or "**ACC/AHA/AMSSM/SCMR 2024:**"
    const orgGuidelinePattern = /\*\*((?:ACC|AHA|AMSSM|SCMR|ESC)(?:[\/\s]*(?:ACC|AHA|AMSSM|SCMR|ESC))*)([^*]*?)\*\*\s*\n?([\s\S]*?)(?=\n\*\*(?:ACC|AHA|AMSSM|SCMR|ESC)|\n\*\*As per|\n\*\*Evidence Level:|\n## |\n### |\n#### |$)/gi;
    
    let match;
    while ((match = guidelinePattern.exec(content)) !== null) {
      const organization = match[1].trim();
      const recommendations = match[2].trim();
      
      // Extract year from organization if present
      const yearMatch = organization.match(/(\d{4})/);
      const year = yearMatch ? yearMatch[1] : '';
      const cleanOrg = organization.replace(/\s*\d{4}\s*guidelines?/i, '').trim();
      
      // Split recommendations into individual items
      const recommendationItems = recommendations.split(/\n\*\*/).filter(item => item.trim());
      
      recommendationItems.forEach((rec, index) => {
        const cleanRec = rec ? rec.replace(/^\*\*/, '').trim() : '';
        if (cleanRec) {
          const type = getRecommendationType(cleanRec);
          items.push({
            title: `${cleanOrg} Recommendation ${index + 1}`,
            content: cleanRec,
            organization: cleanOrg,
            year: year,
            type: type,
            icon: getIconForRecommendationType(type),
            evidenceLevel: extractEvidenceLevel(cleanRec)
          });
        }
      });
    }
    
    // Process organization guideline patterns (e.g., **ESC 2014 Guidelines:** or **ACC/AHA/AMSSM/SCMR 2024:**)
    let orgMatch;
    while ((orgMatch = orgGuidelinePattern.exec(content)) !== null) {
      const organizationFull = orgMatch[1] ? orgMatch[1].trim() : ''; // ACC/AHA/AMSSM/SCMR, etc.
      const details = orgMatch[2] ? orgMatch[2].trim() : ''; // Everything after organization (year, Guidelines:, etc.)
      const recommendations = orgMatch[3] ? orgMatch[3].trim() : ''; // Content following the pattern
      
      // Extract year from details if present
      const yearMatch = details.match(/(\d{4})/);
      const year = yearMatch ? yearMatch[1] : '';
      
      // Get the first organization for the organization field
      const firstOrg = organizationFull.split(/[\/\s]/)[0];
      
      // Clean up the details to create a nice title
      let title = organizationFull;
      if (year) title += ` ${year}`;
      if (details.toLowerCase().includes('guidelines')) title += ' Guidelines';
      
      // Split recommendations into individual items if they exist
      if (recommendations.trim()) {
        const recommendationItems = recommendations.split(/\n\*\*/).filter(item => item.trim());
        
        recommendationItems.forEach((rec, index) => {
          const cleanRec = rec ? rec.replace(/^\*\*/, '').trim() : '';
          if (cleanRec) {
            const type = getRecommendationType(cleanRec);
            items.push({
              title: `${title} - Recommendation ${index + 1}`,
              content: cleanRec,
              organization: firstOrg,
              year: year,
              type: type,
              icon: getIconForRecommendationType(type),
              evidenceLevel: extractEvidenceLevel(cleanRec)
            });
          }
        });
      } else {
        // No specific recommendations, add the guideline header itself
        items.push({
          title: title,
          content: `${organizationFull} ${details}`.trim(),
          organization: firstOrg,
          year: year,
          type: 'recommendation',
          icon: getIconForRecommendationType('recommendation'),
        });
      }
    }
    
    // Also look for embedded organization patterns in content
    // Pattern like: "based on guidelines from the **European Society of Cardiology (ESC 2020)**"
    const embeddedOrgPattern = /based on guidelines from the \*\*([^*]+)\*\*/gi;
    let embeddedMatch;
    while ((embeddedMatch = embeddedOrgPattern.exec(content)) !== null) {
      const orgText = embeddedMatch[1].trim();
      
      // Extract organization and year
      const yearMatch = orgText.match(/\(([^)]*\d{4}[^)]*)\)/);
      const year = yearMatch ? yearMatch[1] : '';
      const org = orgText.replace(/\([^)]*\d{4}[^)]*\)/g, '').trim();
      
      // Find the context around this mention
      const contextStart = Math.max(0, embeddedMatch.index - 200);
      const contextEnd = Math.min(content.length, embeddedMatch.index + 200);
      const context = content.substring(contextStart, contextEnd);
      
      items.push({
        title: `${org} Guidelines`,
        content: context,
        organization: org,
        year: year,
        type: 'recommendation',
        icon: <Stethoscope className="w-5 h-5 text-[#2b6cb0]" />
      });
    }
  };
  
  const getRecommendationType = (text: string): 'recommendation' | 'contraindication' | 'consideration' => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('do not') || lowerText.includes('avoid') || lowerText.includes('contraindication')) {
      return 'contraindication';
    } else if (lowerText.includes('consider')) {
      return 'consideration';
    }
    return 'recommendation';
  };
  
  const getIconForRecommendationType = (type: string): React.ReactNode => {
    switch (type) {
      case 'recommendation':
        return <CheckCircle className="w-5 h-5 text-[#2b6cb0]" />;
      case 'contraindication':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'consideration':
        return <Info className="w-5 h-5 text-[#2b6cb0]" />;
      case 'key-source':
        return <Building2 className="w-5 h-5 text-[#2b6cb0]" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const extractEvidenceLevel = (text: string): string | undefined => {
    const evidenceMatch = text.match(/\*\*Evidence Level:\s*([^*]+)\*\*/);
    return evidenceMatch ? evidenceMatch[1].trim() : undefined;
  };
  
  const getEvidenceLevelBadge = (level?: string) => {
    if (!level) return null;
    
    const levelChar = level.charAt(level.length - 1).toUpperCase();
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200', 
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-red-100 text-red-800 border-red-200',
      'E': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const colorClass = colors[levelChar as keyof typeof colors] || colors['E'];
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${colorClass} font-semibold`}
      >
        {level}
      </Badge>
    );
  };
  
  const formatContent = (content: string): string => {
    return content
      .replace(/\*\*Evidence Level:[^*]+\*\*/g, '') // Remove evidence level from content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .trim();
  };
  
  const getCardStyle = (type: string) => {
    const styles = {
      'key-source': {
        border: 'border-l-[#1a365d]',
        bg: 'bg-[#63b3ed]/10 dark:bg-[#1a365d]/20',
        hover: 'hover:bg-[#63b3ed]/15 dark:hover:bg-[#1a365d]/30'
      },
      'recommendation': {
        border: 'border-l-[#2b6cb0]',
        bg: 'bg-[#90cdf4]/10 dark:bg-[#2b6cb0]/20',
        hover: 'hover:bg-[#90cdf4]/15 dark:hover:bg-[#2b6cb0]/30'
      },
      'contraindication': {
        border: 'border-l-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
      },
      'consideration': {
        border: 'border-l-[#63b3ed]',
        bg: 'bg-[#90cdf4]/10 dark:bg-[#63b3ed]/20',
        hover: 'hover:bg-[#90cdf4]/15 dark:hover:bg-[#63b3ed]/30'
      }
    };
    
    return styles[type as keyof typeof styles] || styles['recommendation'];
  };
  
  const items = parseGuidelinesSection(content);
  
  if (items.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Guidelines
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evidence-based clinical recommendations
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {items.length} Item{items.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      {/* Add item count badge at top when header is hidden */}
      {!showHeader && (
        <div className="flex justify-end mb-4">
          <Badge variant="secondary">
            {items.length} Guideline{items.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
      
      {/* Guidelines Grid */}
      <div className="grid gap-4 md:gap-6">
        {items.map((item, index) => {
          const cardStyle = getCardStyle(item.type);
          
          return (
            <Card 
              key={index} 
              className={`group hover:shadow-md transition-all duration-200 border-l-4 ${cardStyle.border} ${cardStyle.bg} ${cardStyle.hover}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-colors shadow-sm">
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h3>
                        
                        {/* Organization and Year */}
                        {(item.organization || item.year) && (
                          <div className="flex items-center space-x-2 mb-2">
                            {item.organization && (
                              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                <Building2 className="w-3 h-3 mr-1" />
                                {item.organization}
                              </Badge>
                            )}
                            {item.year && (
                              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                <Calendar className="w-3 h-3 mr-1" />
                                {item.year}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Evidence Level Badge */}
                      {item.evidenceLevel && (
                        <div className="ml-2">
                          {getEvidenceLevelBadge(item.evidenceLevel)}
                        </div>
                      )}
                    </div>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {formatContent(item.content).split('\n\n').map((paragraph, pIndex) => (
                        <p 
                          key={pIndex} 
                          className="text-gray-900 dark:text-gray-200 leading-relaxed mb-3 last:mb-0"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#2b6cb0]/20 dark:to-[#63b3ed]/20 rounded-lg border border-[#63b3ed]/30 dark:border-[#63b3ed]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#2b6cb0]" />
            <span className="text-sm font-medium text-[#1a365d] dark:text-[#90cdf4]">
              Clinical Guidelines Complete
            </span>
          </div>
          <div className="text-xs text-[#2b6cb0] dark:text-[#63b3ed]">
            Evidence-based recommendations
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesRenderer; 