import React, { useMemo } from 'react';
import { 
  User, 
  Heart, 
  Stethoscope, 
  Activity, 
  Pill, 
  Thermometer
} from 'lucide-react';

interface ClinicalFindingsRendererProps {
  content: string;
}

interface SectionData {
  title: string;
  items: string[];
  type: 'symptoms' | 'demographics' | 'medical_history' | 'surgical_history' | 'medication_history' | 'vital_signs' | 'physical_exam';
}

// Helper function to detect section type based on title
function detectSectionType(title: string): SectionData['type'] {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('symptoms')) return 'symptoms';
  if (titleLower.includes('demographics') || titleLower.includes('patient')) return 'demographics';
  if (titleLower.includes('surgical') || titleLower.includes('surgery')) return 'surgical_history';
  if (titleLower.includes('medication') || titleLower.includes('drug')) return 'medication_history';
  if (titleLower.includes('vital') || titleLower.includes('signs')) return 'vital_signs';
  if (titleLower.includes('exam') || titleLower.includes('physical')) return 'physical_exam';
  if (titleLower.includes('medical') && titleLower.includes('history')) return 'medical_history';
  
  return 'symptoms'; // default
}

// Function to parse clinical findings from markdown content
function parseClinicalFindings(content: string): SectionData[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const lines = content.split('\n');
  const sections: SectionData[] = [];
  let currentSection: SectionData | null = null;
  
  // Since we're already in the Clinical Findings section, start processing immediately
  let inClinicalFindings = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check if we're entering Clinical findings section (in case content includes the header)
    if (trimmedLine.toLowerCase().includes('## clinical findings') || 
        trimmedLine.toLowerCase().includes('## clinical presentation')) {
      inClinicalFindings = true;
      continue;
    }
    
    // Check if we're leaving Clinical findings section (next ## section, but not ###)
    if (inClinicalFindings && trimmedLine.startsWith('## ') && 
        !trimmedLine.toLowerCase().includes('clinical findings') &&
        !trimmedLine.toLowerCase().includes('clinical presentation')) {
      // Save current section before leaving
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      inClinicalFindings = false;
      break;
    }
    
    // Skip if not in clinical findings
    if (!inClinicalFindings) continue;
    
    // Skip empty lines while in clinical findings
    if (!trimmedLine) continue;
    
    // Check for H3 subsections
    if (trimmedLine.startsWith('### ')) {
      // Save previous section if exists
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      
      const title = trimmedLine.replace('### ', '');
      const type = detectSectionType(title);
      
      currentSection = {
        title,
        items: [],
        type
      };
    }
    
    // Check for standard markdown list items
    if (trimmedLine.startsWith('- ') && currentSection) {
      const item = trimmedLine.replace('- ', '');
      if (item.trim()) {
        currentSection.items.push(item);
      }
    }
    
    // Check for ClinicalItem XML-like format
    const clinicalItemMatch = trimmedLine.match(/^<ClinicalItem>(.*?)<\/ClinicalItem>$/);
    if (clinicalItemMatch && currentSection) {
      const item = clinicalItemMatch[1];
      if (item.trim()) {
        currentSection.items.push(item);
      }
    }
    
    // Also handle ClinicalSection type attribute to override section title/type if needed
    const clinicalSectionMatch = trimmedLine.match(/^<ClinicalSection type="([^"]+)">$/);
    if (clinicalSectionMatch) {
      const sectionType = clinicalSectionMatch[1];
      
      // If we don't have a current section from H3, create one
      if (!currentSection) {
        const type = detectSectionType(sectionType);
        
        currentSection = {
          title: sectionType,
          items: [],
          type
        };
      }
    }
  }
  
  // Add the last section
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

const ClinicalFindingsRenderer: React.FC<ClinicalFindingsRendererProps> = ({ content }) => {
  // Parse sections from content with memoization for performance
  const sections = useMemo(() => {
    const result = parseClinicalFindings(content);
    return result;
  }, [content]);

  // Get color scheme for section type
  const getSectionColorScheme = useMemo(() => {
    return (type: SectionData['type']) => {
      const schemes = {
        symptoms: {
          icon: Stethoscope,
          gradient: 'from-[#1a365d] to-[#2b6cb0]',
          bg: 'from-[#90cdf4]/10 to-[#63b3ed]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#2b6cb0]/30'
        },
        demographics: {
          icon: User,
          gradient: 'from-[#2b6cb0] to-[#63b3ed]',
          bg: 'from-[#63b3ed]/10 to-[#90cdf4]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#63b3ed]/30'
        },
        medical_history: {
          icon: Heart,
          gradient: 'from-[#63b3ed] to-[#90cdf4]',
          bg: 'from-[#90cdf4]/10 to-[#63b3ed]/15',
          text: 'text-[#1a365d]',
          border: 'border-[#90cdf4]/30'
        },
        surgical_history: {
          icon: Pill,
          gradient: 'from-[#1a365d] to-[#63b3ed]',
          bg: 'from-[#2b6cb0]/10 to-[#90cdf4]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#2b6cb0]/30'
        },
        medication_history: {
          icon: Pill,
          gradient: 'from-[#2b6cb0] to-[#1a365d]',
          bg: 'from-[#63b3ed]/10 to-[#2b6cb0]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#2b6cb0]/30'
        },
        vital_signs: {
          icon: Activity,
          gradient: 'from-[#63b3ed] to-[#2b6cb0]',
          bg: 'from-[#90cdf4]/10 to-[#63b3ed]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#63b3ed]/30'
        },
        physical_exam: {
          icon: Thermometer,
          gradient: 'from-[#90cdf4] to-[#63b3ed]',
          bg: 'from-[#90cdf4]/15 to-[#63b3ed]/10',
          text: 'text-[#1a365d]',
          border: 'border-[#90cdf4]/30'
        }
      };
      
      return schemes[type];
    };
  }, []);

  // Early return if no content provided
  if (!content || typeof content !== 'string') {
    return null;
  }

  if (sections.length === 0) {
    return null; // No clinical findings found
  }

  return (
    <div className="clinical-findings-renderer">
      {sections.map((section, sectionIndex) => {
        const colorScheme = getSectionColorScheme(section.type);
        const IconComponent = colorScheme.icon;

        return (
          <div key={sectionIndex} className="mb-8">
            {/* Section Title */}
            <h3 className={`text-xl font-bold ${colorScheme.text} mb-5 mt-10 flex items-center space-x-3 font-['Inter',_'system-ui',_sans-serif]`}>
              <div className={`p-2 bg-gradient-to-r ${colorScheme.gradient} rounded-lg shadow-md`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <span className="tracking-tight">{section.title}</span>
            </h3>

            {/* Section Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={`group relative overflow-hidden rounded-xl border ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg} p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  {/* Content */}
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 bg-gradient-to-r ${colorScheme.gradient} rounded-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className={`font-medium text-sm ${colorScheme.text} leading-snug flex-1`}>
                      {item}
                    </div>
                  </div>
                  
                  {/* Subtle decorative elements */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-bl ${colorScheme.gradient} opacity-20 rounded-full`}></div>
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-tr ${colorScheme.gradient} opacity-15 rounded-full`}></div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClinicalFindingsRenderer;