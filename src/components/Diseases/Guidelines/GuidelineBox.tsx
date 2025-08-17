import React from 'react';
import { Award, Calendar, Globe, Shield, BookOpen, Stethoscope, Heart, Building2, Sparkles, Activity } from 'lucide-react';
import { getEvidenceLevelInfo } from '../../../utils/markdown-utils';
import EvidenceLevel from '../EvidenceLevel/EvidenceLevel';

interface BulletPoint {
  content: string;
  evidenceLevel?: string | null;
}

interface GuidelineBoxProps {
  organization: string;
  year?: string;
  title?: string;
  content: string | BulletPoint[];
  evidenceLevel?: string;
  isStandalone?: boolean;
  isMultiPoint?: boolean;
  enhanced?: boolean; // New prop for enhanced "As per" styling
}

/**
 * Convert markdown tables to HTML tables with professional styling
 */
const convertMarkdownTablesToHTML = (content: string): string => {
  // Check if content contains markdown table syntax
  if (!content.includes('|') || !content.includes('---')) {
    return content;
  }

  // Split content by lines to process tables
  const lines = content.split('\n');
  let result = '';
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this line looks like a table row (contains |)
    if (line.includes('|') && line !== '') {
      if (!inTable) {
        // Starting a new table
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else if (inTable && line === '') {
      // End of table (empty line)
      result += convertTableRowsToHTML(tableRows);
      tableRows = [];
      inTable = false;
      result += line + '\n';
    } else if (inTable && !line.includes('|')) {
      // End of table (non-table line)
      result += convertTableRowsToHTML(tableRows);
      tableRows = [];
      inTable = false;
      result += line + '\n';
    } else {
      // Regular line, not part of table
      if (inTable) {
        // We're in a table but this line doesn't have |, so end the table
        result += convertTableRowsToHTML(tableRows);
        tableRows = [];
        inTable = false;
      }
      result += line + '\n';
    }
  }

  // Handle case where table is at the end of content
  if (inTable && tableRows.length > 0) {
    result += convertTableRowsToHTML(tableRows);
  }

  return result;
};

/**
 * Convert table rows to HTML table with professional medical styling
 */
const convertTableRowsToHTML = (rows: string[]): string => {
  if (rows.length === 0) return '';

  // Filter out separator rows (lines with only dashes and pipes)
  const dataRows = rows.filter(row => !row.match(/^[\s\|\-]+$/));
  
  if (dataRows.length === 0) return '';

  let html = '<div class="overflow-x-auto my-6 rounded-lg shadow-md border border-gray-200">';
  html += '<table class="w-full border-collapse bg-white" style="border-spacing: 0;">';

  dataRows.forEach((row, index) => {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    
    if (cells.length === 0) return;

    const isHeader = index === 0;
    const tag = isHeader ? 'th' : 'td';
    const headerStyle = isHeader 
      ? 'background: linear-gradient(to right, rgb(239 246 255), rgb(219 234 254)); padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 600; color: rgb(17 24 39); border-bottom: 2px solid rgb(147 197 253);' 
      : 'padding: 12px 16px; font-size: 14px; color: rgb(55 65 81); border-bottom: 1px solid rgb(243 244 246);';

    html += isHeader ? '<thead>' : '';
    html += '<tr' + (isHeader ? '' : ' style="transition: background-color 0.2s; &:hover { background-color: rgb(249 250 251); }"') + '>';
    
    cells.forEach(cell => {
      html += `<${tag} style="${headerStyle}">${cell}</${tag}>`;
    });
    
    html += '</tr>';
    html += isHeader ? '</thead><tbody>' : '';
  });

  html += '</tbody></table></div>';
  return html;
};

/**
 * Beautiful GuidelineBox Component
 * Renders medical guidelines in visually appealing, professional boxes
 * with organization-specific styling and evidence levels
 * Enhanced mode provides special styling for simplified "As per" guidelines
 */
export const GuidelineBox: React.FC<GuidelineBoxProps> = ({ 
  organization, 
  year, 
  title,
  content, 
  evidenceLevel,
  isStandalone = false,
  isMultiPoint = false,
  enhanced = false
}) => {
  // Get organization-specific styling and icons
  const getOrganizationStyle = (org: string) => {
    const orgUpper = org.toUpperCase();
    
    // Major cardiovascular organizations
    if (orgUpper.includes('ESC')) {
      return {
        name: 'European Society of Cardiology',
        abbreviation: 'ESC',
        icon: Heart,
        gradient: 'from-red-500 to-red-600',
        bg: 'from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800'
      };
    }
    if (orgUpper.includes('ACC') || orgUpper.includes('AHA')) {
      return {
        name: 'American College of Cardiology / American Heart Association',
        abbreviation: 'ACC/AHA',
        icon: Heart,
        gradient: 'from-blue-500 to-blue-600',
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800'
      };
    }
    if (orgUpper.includes('HRS')) {
      return {
        name: 'Heart Rhythm Society',
        abbreviation: 'HRS',
        icon: Award,
        gradient: 'from-purple-500 to-purple-600',
        bg: 'from-purple-50 to-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800'
      };
    }
    if (orgUpper.includes('EHRA')) {
      return {
        name: 'European Heart Rhythm Association',
        abbreviation: 'EHRA',
        icon: Award,
        gradient: 'from-indigo-500 to-indigo-600',
        bg: 'from-indigo-50 to-indigo-100',
        border: 'border-indigo-200',
        text: 'text-indigo-900',
        badge: 'bg-indigo-100 text-indigo-800'
      };
    }
    if (orgUpper.includes('ACOG')) {
      return {
        name: 'American College of Obstetricians and Gynecologists',
        abbreviation: 'ACOG',
        icon: Shield,
        gradient: 'from-pink-500 to-pink-600',
        bg: 'from-pink-50 to-pink-100',
        border: 'border-pink-200',
        text: 'text-pink-900',
        badge: 'bg-pink-100 text-pink-800'
      };
    }
    if (orgUpper.includes('WHO')) {
      return {
        name: 'World Health Organization',
        abbreviation: 'WHO',
        icon: Globe,
        gradient: 'from-cyan-500 to-cyan-600',
        bg: 'from-cyan-50 to-cyan-100',
        border: 'border-cyan-200',
        text: 'text-cyan-900',
        badge: 'bg-cyan-100 text-cyan-800'
      };
    }
    if (orgUpper.includes('ACEP')) {
      return {
        name: 'American College of Emergency Physicians',
        abbreviation: 'ACEP',
        icon: Stethoscope,
        gradient: 'from-orange-500 to-orange-600',
        bg: 'from-orange-50 to-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800'
      };
    }
    if (orgUpper.includes('ACP')) {
      return {
        name: 'American College of Physicians',
        abbreviation: 'ACP',
        icon: BookOpen,
        gradient: 'from-green-500 to-green-600',
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800'
      };
    }
    if (orgUpper.includes('ESVS')) {
      return {
        name: 'European Society for Vascular Surgery',
        abbreviation: 'ESVS',
        icon: Activity,
        gradient: 'from-teal-500 to-teal-600',
        bg: 'from-teal-50 to-teal-100',
        border: 'border-teal-200',
        text: 'text-black',
        badge: 'bg-teal-100 text-teal-800'
      };
    }
    if (orgUpper.includes('SVS')) {
      return {
        name: 'Society for Vascular Surgery',
        abbreviation: 'SVS',
        icon: Activity,
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'from-emerald-50 to-emerald-100',
        border: 'border-emerald-200',
        text: 'text-black',
        badge: 'bg-emerald-100 text-emerald-800'
      };
    }
    
    // Default styling for other organizations
    return {
      name: organization,
      abbreviation: organization.split(' ').map(word => word[0]).join('').toUpperCase(),
      icon: Building2,
      gradient: 'from-slate-500 to-slate-600',
      bg: 'from-slate-50 to-slate-100',
      border: 'border-slate-200',
      text: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-800'
    };
  };

  const orgStyle = getOrganizationStyle(organization);
  const IconComponent = orgStyle.icon;

  // Enhanced mode for simplified "As per" guidelines
  if (enhanced) {
    return (
      <div className="my-8 group">
        {/* Premium glass-morphism enhanced guideline box */}
        <div className={`relative rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden transform transition-all duration-700 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)]`}
             style={{
               background: `linear-gradient(135deg, 
                 rgba(255, 255, 255, 0.95) 0%, 
                 rgba(255, 255, 255, 0.85) 50%, 
                 rgba(255, 255, 255, 0.95) 100%)`,
               boxShadow: `
                 0 20px 40px -12px rgba(0, 0, 0, 0.15),
                 0 4px 16px -4px rgba(0, 0, 0, 0.1),
                 inset 0 1px 0 rgba(255, 255, 255, 0.8),
                 inset 0 -1px 0 rgba(0, 0, 0, 0.05)
               `
             }}>
          
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700"
               style={{
                 background: `linear-gradient(135deg, 
                   ${orgStyle.gradient.replace('from-', '').replace('to-', '').split(' ')[0]} 0%, 
                   ${orgStyle.gradient.replace('from-', '').replace('to-', '').split(' ')[1]} 100%)`
               }}></div>
          
          {/* Animated shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute -inset-10 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
          </div>
          
          {/* Sophisticated sparkle decoration */}
          <div className="absolute top-6 right-6 opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
            <Sparkles className="w-6 h-6 text-white filter drop-shadow-lg" />
          </div>
          
          {/* Premium organization badge */}
          <div className="relative z-10 flex items-center justify-between mb-6 p-8 pb-0">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-r ${orgStyle.gradient} rounded-2xl shadow-xl ring-4 ring-white/30 transition-transform duration-300 group-hover:scale-105`}
                   style={{
                     boxShadow: `
                       0 8px 16px -4px rgba(0, 0, 0, 0.2),
                       0 4px 8px -2px rgba(0, 0, 0, 0.1),
                       inset 0 1px 0 rgba(255, 255, 255, 0.3)
                     `
                   }}>
                <IconComponent className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <span className={`font-bold text-lg ${orgStyle.text} tracking-wide drop-shadow-sm`}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {orgStyle.abbreviation}
                </span>
                <p className="text-sm text-gray-700 font-medium opacity-90 mt-1">{orgStyle.name}</p>
              </div>
            </div>
            {year && (
              <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-gray-200 transition-all duration-300 hover:scale-105`}
                   style={{
                     background: 'rgba(255, 255, 255, 0.9)',
                     color: '#1f2937',
                     textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                   }}>
                {year}
              </div>
            )}
          </div>

          {/* Premium content section */}
          <div className="relative z-10 px-8 pb-8">
            <div className="max-w-none">
              <div 
                className="text-gray-900 font-medium text-base leading-relaxed"
                style={{ 
                  color: '#1f2937 !important',
                  lineHeight: '1.75',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: typeof content === 'string' 
                    ? convertMarkdownTablesToHTML(content) // Convert tables first
                        .replace(/^\*\*As per\s+[^:]+(?:\s+guidelines?)?[:\s]*\*\*/i, '') // Remove "**As per..." prefix
                        .replace(/^As per\s+[^:]+(?:\s+guidelines?)?[,:\s]*/i, '') // Remove plain "As per..." prefix
                        .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #1f2937 !important; font-weight: 700;">$1</strong>') // Bold formatting
                        .replace(/\n/g, '<br>') // Line breaks
                        .replace(/\(([A-E])\)/g, (match: string, level: string) => {
                          const colors: Record<string, string> = {
                            'A': 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: 1px solid #10b981; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);',
                            'B': 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: 1px solid #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);',
                            'C': 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: 1px solid #f59e0b; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);',
                            'D': 'background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; border: 1px solid #a855f7; box-shadow: 0 2px 4px rgba(168, 85, 247, 0.2);',
                            'E': 'background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); color: white; border: 1px solid #94a3b8; box-shadow: 0 2px 4px rgba(148, 163, 184, 0.2);'
                          };
                          const style = colors[level] || colors['E'];
                          return `<span style="${style} font-weight: 700; padding: 4px 10px; border-radius: 8px; font-size: 12px; margin: 0 2px; display: inline-block; transition: all 0.2s ease; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">(${level})</span>`;
                        }) // Premium color-coded evidence levels
                    : content.toString() 
                }}
              />
            </div>
          </div>

          {/* Premium bottom accent with animated gradient */}
          <div className="relative h-2 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${orgStyle.gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 group-hover:animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Original styling for complex guidelines
  return (
    <div className={`my-6 rounded-xl border-2 ${orgStyle.border} bg-gradient-to-br ${orgStyle.bg} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Header with organization info */}
      <div className={`bg-gradient-to-r ${orgStyle.gradient} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{orgStyle.abbreviation}</h3>
              <p className="text-white/90 text-sm font-medium">{orgStyle.name}</p>
            </div>
          </div>
          {year && (
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1 backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">{year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Title section if present */}
      {title && (
        <div className={`px-6 py-3 border-b border-opacity-20 ${orgStyle.border}`}>
          <h4 className={`text-lg font-semibold ${orgStyle.text} italic`}>
            {title}
          </h4>
        </div>
      )}

      {/* Content area */}
      <div className="p-6">
        <div className={`${orgStyle.text} leading-relaxed`}>
          {isMultiPoint && Array.isArray(content) ? (
            /* Multi-point guidelines with bullet points */
            <>
              <ul className="space-y-3">
                {content.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full ${orgStyle.gradient.replace('from-', 'bg-').split(' ')[0]} mt-2 flex-shrink-0`}></div>
                    <div className="flex-1">
                      <p className="text-base font-medium">
                        {point.content}
                      </p>
                      {point.evidenceLevel && (
                        <div className="mt-2">
                          <EvidenceLevel 
                            evidence={{
                              level: point.evidenceLevel,
                              ...getEvidenceLevelInfo(point.evidenceLevel)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Overall evidence level for multi-point guidelines */}
              {evidenceLevel && (
                <div className="mt-4 flex items-center space-x-2">
                  <EvidenceLevel 
                    evidence={{
                      level: evidenceLevel.replace('Level ', ''),
                      ...getEvidenceLevelInfo(evidenceLevel.replace('Level ', ''))
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            /* Single content guidelines */
            <>
              <p className="text-base font-medium mb-3">
                {typeof content === 'string' ? content.replace(/^(As per .*?guidelines?:?\s*)/i, '').trim() : ''}
              </p>
              
              {/* Evidence level badge if present */}
              {evidenceLevel && (
                <div className="mt-4 flex items-center space-x-2">
                  <EvidenceLevel 
                    evidence={{
                      level: evidenceLevel.replace('Level ', ''),
                      ...getEvidenceLevelInfo(evidenceLevel.replace('Level ', ''))
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Subtle bottom accent */}
      <div className={`h-1 bg-gradient-to-r ${orgStyle.gradient}`}></div>
    </div>
  );
};

export default GuidelineBox;