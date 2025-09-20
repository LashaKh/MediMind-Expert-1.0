import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity,
  ExternalLink,
  FileText,
  ChevronRight,
  FlaskConical,
  Microscope,
  BarChart3
} from 'lucide-react';

interface StudyEntry {
  year: string;
  title: string;
  description: string;
  author: string;
  journal: string;
  date: string;
  pubmedLink?: string;
}

interface StudiesRendererProps {
  content: string;
  className?: string;
  showHeader?: boolean;
}

const StudiesRenderer: React.FC<StudiesRendererProps> = ({ 
  content, 
  className = "",
  showHeader = true
}) => {
  const parseStudiesSection = (content: string): StudyEntry[] => {
    const studies: StudyEntry[] = [];
    
    // Find the Studies section
    const studiesMatch = content.match(/## (?:Studies|Major Clinical Studies)\s*([\s\S]*?)(?=\n## |$)/i);
    if (!studiesMatch) return studies;
    
    const studiesContent = studiesMatch[1];
    
    // Parse individual studies using multiple formats:
    // Original: ### YEAR • [TITLE](link) or ### YEAR • TITLE
    // Header with year: ### TITLE (YEAR)
    // Citation format: ### TITLE (YEAR) followed by **Citation**: 
    // Descriptive: ### DESCRIPTIVE_TITLE (without year in header)
    const studyRegex = /^### (?:(?:(\d{4}) • (?:(?:\[([^\]]+)\](?:\([^)]+\))?)|([^\n]+)))|(?:([^(]+)\s*\((\d{4})\))|([^\n]+))\s*\n([\s\S]*?)(?=\n### |$)/gm;
    
    // Try the original pattern first
    let match;
    while ((match = studyRegex.exec(studiesContent)) !== null) {
        const parsedStudy = parseStudyMatch(match, true);
        if (parsedStudy) studies.push(parsedStudy);
    }
    
    // If no studies found with ### pattern, try parsing **TITLE** bold format
    if (studies.length === 0) {
        // Pattern to match: **TITLE**\nDescription\n*Author et al. Journal. Date.*
        const boldStudyRegex = /\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*[^*]+\*\*|$)/gm;
        while ((match = boldStudyRegex.exec(studiesContent.trim())) !== null) {
            const parsedStudy = parseBoldStudyMatch(match);
            if (parsedStudy) studies.push(parsedStudy);
        }
    }
    
    // If still no studies found, try parsing as plain text studies
    if (studies.length === 0) {
        // Pattern to match: Title\nDescription (separated by double newlines)
        const plainStudyRegex = /^([A-Z][^\n]*(?:\s+Study)?)\s*\n([\s\S]*?)(?=\n\n[A-Z][^\n]*(?:\s+Study)?|$)/gm;
        while ((match = plainStudyRegex.exec(studiesContent.trim())) !== null) {
            const parsedStudy = parseStudyMatch(match, false);
            if (parsedStudy) studies.push(parsedStudy);
        }
    }
    
    // Sort studies by year, descending (handle undefined years)
    studies.sort((a, b) => {
      const yearA = a.year ? parseInt(a.year) : 0;
      const yearB = b.year ? parseInt(b.year) : 0;
      return yearB - yearA;
    });

    return studies;
  };

  const parseBoldStudyMatch = (match: RegExpExecArray): StudyEntry | null => {
    // Handle **TITLE** format: match[1] = title, match[2] = content
    const title = match[1] ? match[1].trim() : '';
    const restContent = match[2] ? match[2].trim() : '';
    
    let description = '';
    let author = '', journal = '', date = '', year = '';
    const pubmedLink = '';

    // Split content by lines to separate description from author info
    const lines = restContent.split('\n').filter(line => line.trim());
    
    // Find the author line (starts and ends with *)
    let authorLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('*') && lines[i].trim().endsWith('*')) {
        authorLineIndex = i;
        break;
      }
    }
    
    if (authorLineIndex > -1) {
      // Description is everything before the author line
      description = lines.slice(0, authorLineIndex).join(' ').trim();
      
      // Parse author info from the line with asterisks
      const authorLine = lines[authorLineIndex];
      const authorInfo = authorLine.replace(/^\*\s*/, '').replace(/\s*\*$/, '').trim();
      
      // Split by periods to get author, journal, date
      const parts = authorInfo.split('.');
      if (parts.length >= 3) {
        author = parts[0].trim();
        journal = parts[1].trim();
        const datePart = parts[2].trim();
        date = datePart;
        
        // Extract year from date (look for 4-digit year)
        const yearMatch = datePart.match(/(\d{4})/);
        if (yearMatch) {
          year = yearMatch[1];
        }
      }
    } else {
      // No author line found, use all content as description
      description = lines.join(' ').trim();
    }
    
    // Clean up description by removing markdown links but keeping the text
    description = description
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [text](url) -> text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (title) {
      return {
        year: year || '',
        title,
        description,
        author,
        journal,
        date,
        pubmedLink
      };
    }
    
    return null;
  };

  const parseStudyMatch = (match: RegExpExecArray, isHeaderFormat: boolean): StudyEntry | null => {
    if (isHeaderFormat) {
        // Handle ### header format: match[1-7] correspond to different capture groups
        // Original format: match[1] = year, match[2] or match[3] = title, match[7] = content
        // New format: match[4] = title, match[5] = year, match[7] = content
        // Descriptive format: match[6] = title, match[7] = content (year extracted from content)
        const year = match[1] || match[5]; // Year from header
        const title = (match[2] || match[3] || match[4] || match[6] || '').trim(); // Title from header
        const restContent = (match[7] || '').trim(); // Content is always in match[7]
        
        return parseStudyContent(title, restContent, year);
    } else {
        // Handle plain text format: match[1] = title, match[2] = content
        const title = match[1] ? match[1].trim() : '';
        const restContent = match[2] ? match[2].trim() : '';
        
        return parseStudyContent(title, restContent);
    }
  };

  const parseStudyContent = (title: string, restContent: string, headerYear?: string): StudyEntry | null => {
        let year = headerYear;
        
        // If no year in header, try to extract from content (e.g., from link like "(2007)")
        if (!year) {
            const yearFromContent = restContent.match(/\((\d{4})\)/);
            if (yearFromContent) {
                year = yearFromContent[1];
            }
        }

        let description = '';
        let author = '', journal = '', date = '';
        let pubmedLink = '';

        // Check for **Citation**: format first
        const citationMatch = restContent.match(/^([\s\S]*?)\n\*\*Citation\*\*:\s*(.+)$/m);
        if (citationMatch) {
            // Handle **Citation**: format
            description = citationMatch[1].trim();
            const citationInfo = citationMatch[2].trim();
            
            // Parse citation: "Author et al. Journal. Date."
            const citationParts = citationInfo.split('.');
            if (citationParts.length >= 3) {
                author = citationParts[0].trim();
                journal = citationParts[1].trim();
                date = citationParts[2].trim();
                
                // Extract year from date if not already set
                if (!year) {
                    const yearMatch = date.match(/(\d{4})/);
                    if (yearMatch) {
                        year = yearMatch[1];
                    }
                }
            }
        } else {
            // Handle traditional formats
            // Extract description - handle both single line and multi-line descriptions
            // Remove markdown links and italics for clean description
            let rawDescription = '';
            if (restContent.includes('*')) {
                // Traditional format with italics - take content before first asterisk
                const descriptionMatch = restContent.match(/^([^*]+)(?:\*|$)/);
                rawDescription = descriptionMatch ? descriptionMatch[1].trim() : '';
            } else {
                // New format - take the entire content as description
                rawDescription = restContent.trim();
            }
            
            description = rawDescription;
            
            // Extract author, journal, date from italics
            const authorMatch = restContent.match(/\*([^*]+)\*/);
            if (authorMatch) {
                const authorInfo = authorMatch[1];
                const parts = authorInfo.split('.');
                if (parts.length >= 3) {
                    author = parts[0].trim();
                    journal = parts[1].trim();
                    date = parts[2].trim();
                }
            }
        }
        
        // Clean up description by removing markdown links but keeping the text
        description = description
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [text](url) -> text
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Extract PubMed link - handle both [PubMed](url) and embedded links
        const pubmedMatch = restContent.match(/\[PubMed\]\(([^)]+)\)/);
        if (pubmedMatch) {
            pubmedLink = pubmedMatch[1];
        } else {
            // Look for embedded PubMed links in the format [text](https://pubmed.ncbi.nlm.nih.gov/...)
            const embeddedPubmedMatch = restContent.match(/\[([^\]]+)\]\((https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/[^)]+)\)/);
            if (embeddedPubmedMatch) {
                pubmedLink = embeddedPubmedMatch[2];
            }
        }

        if (title) { // Allow studies even without explicit year
            return {
                year: year || '',
                title,
                description,
                author,
                journal,
                date,
                pubmedLink
            };
        }
        
        return null;
  };

  const getYearBadgeColor = (year: string): string => {
    const yearNum = parseInt(year);
    if (yearNum >= 2024) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (yearNum >= 2020) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    if (yearNum >= 2015) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  };

  const studies = parseStudiesSection(content);
  
  if (studies.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Studies
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Research evidence and clinical trials
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {studies.length} Stud{studies.length !== 1 ? 'ies' : 'y'}
          </Badge>
        </div>
      )}
      
      {/* Add study count badge at top when header is hidden */}
      {!showHeader && (
        <div className="flex justify-end mb-4">
          <Badge variant="secondary">
            {studies.length} Stud{studies.length !== 1 ? 'ies' : 'y'}
          </Badge>
        </div>
      )}
      
      {/* Studies Grid */}
      <div className="grid gap-4 md:gap-6">
        {studies.map((study, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                    <Microscope className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Year */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {study.year && (
                          <Badge className={getYearBadgeColor(study.year)}>
                            {study.year}
                          </Badge>
                        )}
                        {study.pubmedLink && (
                          <a 
                            href={study.pubmedLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {study.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {study.description}
                    </p>
                  </div>
                  
                  {/* Author and Journal Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {study.author && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{study.author}</span>
                      </div>
                    )}
                    {study.journal && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{study.journal}</span>
                      </div>
                    )}
                    {study.date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{study.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-gradient-to-r from-[#90cdf4]/10 to-[#63b3ed]/10 dark:from-[#2b6cb0]/20 dark:to-[#63b3ed]/20 rounded-lg border border-[#63b3ed]/30 dark:border-[#63b3ed]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#2b6cb0]" />
            <span className="text-sm font-medium text-[#1a365d] dark:text-[#90cdf4]">
              Research Evidence Overview
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-[#2b6cb0] dark:text-[#63b3ed]">
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span>{studies.length} studies analyzed</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>
                {studies.filter(s => s.year && parseInt(s.year) >= 2020).length} recent (2020+)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudiesRenderer;