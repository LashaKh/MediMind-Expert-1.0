import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Circle, 
  MessageSquare,
  AlertTriangle,
  // Clock,
  Monitor,
  Pill,
  Activity,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { MobileCheckbox } from '../../ui/mobile-form';
import { cn } from '../../../lib/utils';
import { ABGResult } from '../../../types/abg';

interface ActionPlanSelectorProps {
  /** ABG result with action plan */
  result: ABGResult;
  /** Whether the selector is open */
  isOpen: boolean;
  /** Callback when selector is closed */
  onClose: () => void;
  /** Callback when AI consultation is requested with selected plans */
  onConsult: (selectedItems: string[]) => void;
  /** Custom CSS classes */
  className?: string;
}

interface ActionPlanItem {
  id: string;
  title: string;
  category: 'immediate' | 'monitoring' | 'medication' | 'diagnostic' | 'followup';
  priority: 'critical' | 'high' | 'medium' | 'low';
  content: string;
}

const categoryConfig = {
  immediate: {
    label: 'Immediate Actions',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  monitoring: {
    label: 'Monitoring Plan',
    icon: Monitor,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  medication: {
    label: 'Medications',
    icon: Pill,
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800'
  },
  diagnostic: {
    label: 'Diagnostic Tests',
    icon: Activity,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800'
  },
  followup: {
    label: 'Follow-up Care',
    icon: Calendar,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800'
  }
};

const priorityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
  low: { color: 'text-green-600', bg: 'bg-green-100' }
};

export const ActionPlanSelector: React.FC<ActionPlanSelectorProps> = ({
  result,
  isOpen,
  onClose,
  onConsult,
  className
}) => {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [parsedItems, setParsedItems] = useState<ActionPlanItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse action plan text into structured items
  useEffect(() => {
    if (!result.action_plan || !isOpen) return;

    console.log('🔍 DEBUG: Action plan received (first 800 chars):', result.action_plan.substring(0, 800));

    // Extract actual issues from the action plan
    const items: ActionPlanItem[] = [];
    
    // Try multiple patterns to extract action items
    
    // Pattern 1: Look for "# [severity_icon] Issue X:" format (with markdown header, any severity)

    let issueMatches = result.action_plan.match(/#{1,3}\s*[🚨⚠️ℹ️]\s*Issue\s+\d+:\s*([^\n]+)/gi);

    if (!issueMatches || issueMatches.length === 0) {
      // Pattern 1b: Look for plain "[severity_icon] Issue X:" format (without markdown header, any severity)

      issueMatches = result.action_plan.match(/[🚨⚠️ℹ️]\s*Issue\s+\d+:\s*([^\n]+)/gi);

    }
    
    if (issueMatches && issueMatches.length > 0) {

      issueMatches.forEach((match, index) => {
        const title = match.replace(/#{1,3}\s*[🚨⚠️ℹ️]\s*Issue\s+\d+:\s*/i, '').replace(/[🚨⚠️ℹ️]\s*Issue\s+\d+:\s*/i, '').trim();
        
        items.push({
          id: `issue-${index + 1}`,
          title: title,
          category: 'immediate',
          priority: 'critical',
          content: `Address ${title.toLowerCase()} with immediate interventions and monitoring`
        });
      });
    } else {
      // Pattern 2: Look for plain "Issue X:" format

      issueMatches = result.action_plan.match(/(?:^|\n)\s*Issue\s+\d+:\s*([^\n]+)/gi);

      if (issueMatches && issueMatches.length > 0) {

        issueMatches.forEach((match, index) => {
          const title = match.replace(/(?:^|\n)\s*Issue\s+\d+:\s*/i, '').trim();
          
          items.push({
            id: `issue-${index + 1}`,
            title: title,
            category: 'immediate',
            priority: 'critical',
            content: `Address ${title.toLowerCase()} with immediate interventions and monitoring`
          });
        });
      } else {
        // Pattern 3: Look for "## Issue" format
        issueMatches = result.action_plan.match(/#{1,3}\s*Issue[^\n]*:\s*([^\n]+)/gi);
        
        if (issueMatches && issueMatches.length > 0) {

          issueMatches.forEach((match, index) => {
            const title = match.replace(/#{1,3}\s*Issue[^:]*:\s*/i, '').trim();
            
            items.push({
              id: `issue-${index + 1}`,
              title: title,
              category: 'immediate',
              priority: 'critical',
              content: `Address ${title.toLowerCase()} with immediate interventions and monitoring`
            });
          });
        } else {
          // Pattern 4: Look for any numbered list items that might be issues
          const numberMatches = result.action_plan.match(/(?:^|\n)\s*\d+[\.\)]\s*([^\n]{10,100})/gi);
          
          if (numberMatches && numberMatches.length > 0) {

            numberMatches.slice(0, 5).forEach((match, index) => { // Limit to 5 items
              const title = match.replace(/(?:^|\n)\s*\d+[\.\)]\s*/i, '').trim();
              
              items.push({
                id: `item-${index + 1}`,
                title: title,
                category: 'immediate',
                priority: 'high',
                content: `${title}`
              });
            });
          } else {
            // Pattern 5: Look for bullet points or dashes
            const bulletMatches = result.action_plan.match(/(?:^|\n)\s*[-\*•]\s*([^\n]{10,100})/gi);
            
            if (bulletMatches && bulletMatches.length > 0) {

              bulletMatches.slice(0, 5).forEach((match, index) => {
                const title = match.replace(/(?:^|\n)\s*[-\*•]\s*/i, '').trim();
                
                items.push({
                  id: `bullet-${index + 1}`,
                  title: title,
                  category: 'immediate',
                  priority: 'medium',
                  content: `${title}`
                });
              });
            }
          }
        }
      }
    }

    // If still no items found, try to extract sections or headings
    if (items.length === 0) {

      // Pattern 6: Look for any markdown headers (##, ###, etc.)
      const headingMatches = result.action_plan.match(/#{1,6}\s*([^\n]{5,80})/gi);
      
      if (headingMatches && headingMatches.length > 0) {

        headingMatches.slice(0, 8).forEach((match, index) => {
          const title = match.replace(/#{1,6}\s*/i, '').trim();
          
          // Skip very generic titles
          if (!title.toLowerCase().includes('summary') && 
              !title.toLowerCase().includes('action plan') && 
              title.length > 5) {
            items.push({
              id: `heading-${index + 1}`,
              title: title,
              category: index < 2 ? 'immediate' : 'monitoring',
              priority: index < 2 ? 'high' : 'medium',
              content: `Discuss ${title.toLowerCase()} in detail`
            });
          }
        });
      }
      
      // If still no items, create multiple generic consultation options
      if (items.length === 0) {

        items.push(
          {
            id: 'interpretation-consultation',
            title: 'ABG Interpretation & Analysis',
            category: 'diagnostic',
            priority: 'high',
            content: 'Discuss the blood gas interpretation and clinical significance'
          },
          {
            id: 'treatment-consultation',
            title: 'Treatment & Management Plan',
            category: 'immediate',
            priority: 'high',
            content: 'Review treatment recommendations and management strategies'
          },
          {
            id: 'monitoring-consultation',
            title: 'Monitoring & Follow-up',
            category: 'monitoring',
            priority: 'medium',
            content: 'Discuss monitoring parameters and follow-up care'
          },
          {
            id: 'complications-consultation',
            title: 'Complications & Risk Assessment',
            category: 'immediate',
            priority: 'high',
            content: 'Review potential complications and risk mitigation strategies'
          }
        );
      }
    }
    
    setParsedItems(items);
  }, [result.action_plan, isOpen]);

  // Auto-scroll and center the modal when it opens
  useEffect(() => {
    if (isOpen) {
      // Start entrance animation immediately
      setIsVisible(true);
      
      // Auto-scroll after a short delay to ensure modal is rendered
      const scrollTimer = setTimeout(() => {
        if (modalRef.current) {
          // Scroll to center the modal in viewport
          modalRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
          
          // Also scroll the page to perfectly center the modal
          const modalRect = modalRef.current.getBoundingClientRect();
          if (modalRect) {
            const windowHeight = window.innerHeight;
            const modalHeight = modalRect.height;
            const scrollY = window.scrollY + modalRect.top - (windowHeight - modalHeight) / 2;
            
            window.scrollTo({
              top: Math.max(0, scrollY),
              behavior: 'smooth'
            });
          }
        }
      }, 200); // Delay for modal animation

      return () => clearTimeout(scrollTimer);
    } else {
      // Reset visibility when closing
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    if (selectedItems.size === parsedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(parsedItems.map(item => item.id)));
    }
  };

  const toggleItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleConsult = () => {
    const selectedTitles = parsedItems
      .filter(item => selectedItems.has(item.id))
      .map(item => item.title);
    onConsult(selectedTitles);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <Card 
        ref={modalRef}
        className={cn(
          "max-w-4xl w-full max-h-[80vh] overflow-hidden transition-all duration-500 ease-out",
          isVisible 
            ? "translate-y-0 scale-100 opacity-100" 
            : "translate-y-8 scale-95 opacity-0",
          className
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t('abg.selector.title', 'Select Action Plans for AI Consultation')}</h2>
                <p className="text-sm text-gray-600">
                  {t('abg.selector.subtitle', 'Choose which action plans to include in your AI consultation')}
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">v2.0</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
              >
                {selectedItems.size === parsedItems.length ? (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    {t('abg.selector.deselectAll', 'Deselect All')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('abg.selector.selectAll', 'Select All')}
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-600">
                {t('abg.selector.selectedCount', '{{selected}} of {{total}} selected', { selected: selectedItems.size, total: parsedItems.length })}
              </span>
            </div>
          </div>

          {/* Action Plan Items */}
          <div className="space-y-4">
            {parsedItems.map((item) => {
              const config = categoryConfig[item.category];
              const priorityStyle = priorityConfig[item.priority];
              const isSelected = selectedItems.has(item.id);

              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "p-4 border-2 cursor-pointer transition-all",
                    isSelected 
                      ? "border-blue-300 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <MobileCheckbox 
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1"
                      label=""
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <config.icon className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", config.textColor, config.bgColor)}
                        >
                          {config.label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", priorityStyle.color, priorityStyle.bg)}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.content.substring(0, 200)}
                        {item.content.length > 200 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {parsedItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('abg.selector.noItems', 'No action plan items found')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItems.size > 0 
                ? t('abg.selector.selectedForConsult', '{{count}} item(s) selected for AI consultation', { count: selectedItems.size })
                : t('abg.selector.selectForConsult', 'Select action plans to include in your consultation')
              }
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={handleConsult}
                disabled={selectedItems.size === 0}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t('abg.selector.aiConsult', 'AI Consult ({{count}})', { count: selectedItems.size })}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};