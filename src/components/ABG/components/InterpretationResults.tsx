import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Edit2, 
  Save, 
  X, 
  Copy, 
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

interface InterpretationResultsProps {
  interpretation?: string;
  isLoading?: boolean;
  error?: string;
  onEdit?: (newInterpretation: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
}

interface InterpretationSection {
  title: string;
  content: string;
  severity?: 'normal' | 'warning' | 'critical';
  icon?: React.ElementType;
}

export const InterpretationResults: React.FC<InterpretationResultsProps> = ({
  interpretation,
  isLoading = false,
  error,
  onEdit,
  onSave,
  onCancel,
  editable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Clean markdown formatting from text for display
  const cleanMarkdownForDisplay = (text: string): string => {
    return text
      // Remove markdown bold formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove color indicators and format cleanly
      .replace(/•?\s*\[RED\]\s*([^:]+):/gi, '🔴 $1:')
      .replace(/•?\s*\[YELLOW\]\s*([^:]+):/gi, '🟡 $1:')
      .replace(/•?\s*\[GREEN\]\s*([^:]+):/gi, '🟢 $1:')
      .replace(/•?\s*Red\s*\(([^)]+)\):/gi, '🔴 $1:')
      .replace(/•?\s*Yellow\s*\(([^)]+)\):/gi, '🟡 $1:')
      .replace(/•?\s*Green\s*\(([^)]+)\):/gi, '🟢 $1:')
      .replace(/•?\s*\*\*\[Red\]\s*([^*]+)\*\*:/gi, '🔴 $1:')
      .replace(/•?\s*\*\*\[Yellow\]\s*([^*]+)\*\*:/gi, '🟡 $1:')
      .replace(/•?\s*\*\*\[Green\]\s*([^*]+)\*\*:/gi, '🟢 $1:')
      // Clean up ALL dash-based bullet points - handle various formats
      .replace(/^\s*-\s+/gm, '• ')
      .replace(/^\s*\*\s+/gm, '• ')
      .replace(/^\s*•\s+/gm, '• ')
      // Remove standalone dashes that might appear at the beginning of lines
      .replace(/^\s*-\s*$/gm, '')
      // Clean up markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove extra whitespace and empty lines
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .trim();
  };

  // Parse interpretation into sections
  const interpretationSections = useMemo((): InterpretationSection[] => {
    if (!interpretation) return [];

    const sections: InterpretationSection[] = [];
    const lines = interpretation.split('\n').filter(line => line.trim());

    let currentSection: InterpretationSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if line is a header (starts with number, bullet, or common headings)
      const isHeader = /^(\d+\.|\*|\-|#{1,3})\s*(.+)|^(Summary|Analysis|Interpretation|Assessment|Findings|Diagnosis|Clinical|Acid-Base|Oxygenation|Recommendations):?/i.test(trimmedLine);
      
      if (isHeader) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Extract title and clean markdown formatting
        const title = cleanMarkdownForDisplay(
          trimmedLine
            .replace(/^(\d+\.|\*|\-|#{1,3})\s*/, '')
            .replace(/^(Summary|Analysis|Interpretation|Assessment|Findings|Diagnosis|Clinical|Acid-Base|Oxygenation|Recommendations):?\s*/i, '')
            .trim()
        );

        // Determine severity based on keywords
        let severity: InterpretationSection['severity'] = 'normal';
        let icon: InterpretationSection['icon'] = Info;

        const lowerTitle = title.toLowerCase();
        const lowerLine = trimmedLine.toLowerCase();

        if (lowerTitle.includes('critical') || lowerTitle.includes('severe') || lowerTitle.includes('emergency') ||
            lowerLine.includes('critical') || lowerLine.includes('severe') || lowerLine.includes('emergency')) {
          severity = 'critical';
          icon = AlertTriangle;
        } else if (lowerTitle.includes('abnormal') || lowerTitle.includes('elevated') || lowerTitle.includes('low') ||
                   lowerTitle.includes('acidosis') || lowerTitle.includes('alkalosis') || lowerTitle.includes('hypox') ||
                   lowerLine.includes('abnormal') || lowerLine.includes('attention')) {
          severity = 'warning';
          icon = TrendingUp;
        } else if (lowerTitle.includes('normal') || lowerTitle.includes('within') || lowerTitle.includes('appropriate')) {
          icon = CheckCircle2;
        }

        currentSection = {
          title: title || 'Clinical Interpretation',
          content: '',
          severity,
          icon
        };
      } else if (currentSection) {
        // Add content to current section - clean markdown formatting for display
        const cleanedLine = cleanMarkdownForDisplay(trimmedLine);
        currentSection.content += (currentSection.content ? '\n' : '') + cleanedLine;
      } else {
        // Create default section if no header found yet
        const cleanedLine = cleanMarkdownForDisplay(trimmedLine);
        currentSection = {
          title: 'Clinical Interpretation',
          content: cleanedLine,
          severity: 'normal',
          icon: Info
        };
      }
    }

    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If no sections parsed, create a single section
    if (sections.length === 0 && interpretation) {
      sections.push({
        title: 'Clinical Interpretation',
        content: cleanMarkdownForDisplay(interpretation),
        severity: 'normal',
        icon: Info
      });
    }

    return sections;
  }, [interpretation]);

  // Start editing
  const handleStartEdit = () => {
    if (interpretation) {
      setEditedText(interpretation);
      setIsEditing(true);
    }
  };

  // Save edited text
  const handleSave = () => {
    if (onEdit) {
      onEdit(editedText);
    }
    if (onSave) {
      onSave();
    }
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Copy text to clipboard
  const handleCopy = async () => {
    if (interpretation) {
      try {
        await navigator.clipboard.writeText(interpretation);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {

      }
    }
  };

  // Toggle section expansion
  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Get severity styling
  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          text: 'text-red-900',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          border: 'border-[#63b3ed]/40',
          bg: 'bg-[#90cdf4]/20',
          text: 'text-[#1a365d]',
          icon: 'text-[#2b6cb0]',
          badge: 'bg-[#63b3ed]/30 text-[#1a365d]'
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#2b6cb0]" />
          <div className="text-center">
            <h3 className="font-semibold">Generating Clinical Interpretation...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI is analyzing the blood gas values
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Interpretation Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!interpretation) {
    return (
      <Card className="p-6 border-dashed">
        <div className="text-center text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Clinical interpretation will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#63b3ed]" />
            <div>
              <h3 className="text-lg font-semibold">Clinical Interpretation</h3>
              <p className="text-sm text-muted-foreground">AI-generated clinical analysis</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Implement export */}}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Implement share */}}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copySuccess}
            >
              {copySuccess ? (
                <CheckCircle2 className="h-4 w-4 text-[#63b3ed]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
            
            {editable && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isEditing ? (
        /* Edit Mode */
        <Card className="p-4">
          <div className="space-y-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-64 p-3 border rounded-md resize-vertical"
              placeholder="Enter clinical interpretation..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Display Mode */
        <div className="space-y-3">
          {interpretationSections.map((section, index) => {
            const styles = getSeverityStyles(section.severity);
            const Icon = section.icon || Info;
            const isExpanded = expandedSections.has(index) || interpretationSections.length === 1;
            
            return (
              <Card 
                key={index}
                className={cn("overflow-hidden", styles.border, styles.bg)}
              >
                {/* Section Header */}
                <div 
                  className={cn(
                    "p-4 cursor-pointer select-none",
                    interpretationSections.length > 1 && "hover:bg-black/5"
                  )}
                  onClick={() => interpretationSections.length > 1 && toggleSection(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-5 w-5 flex-shrink-0", styles.icon)} />
                      <h4 className={cn("font-semibold", styles.text)}>
                        {section.title}
                      </h4>
                      {section.severity !== 'normal' && (
                        <Badge variant="outline" className={styles.badge}>
                          {section.severity}
                        </Badge>
                      )}
                    </div>
                    
                    {interpretationSections.length > 1 && (
                      <div className={cn("transform transition-transform", isExpanded && "rotate-180")}>
                        <TrendingDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="bg-white/70 p-3 rounded border">
                      <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};