import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Edit2, 
  Save, 
  X, 
  Copy, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  User,
  Stethoscope,
  Calendar,
  FileText,
  ExternalLink,
  Star
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

interface ActionPlanResultsProps {
  actionPlan?: string;
  isLoading?: boolean;
  error?: string;
  onEdit?: (newActionPlan: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
}

interface ActionItem {
  id: string;
  priority: 'immediate' | 'urgent' | 'routine';
  category: 'intervention' | 'monitoring' | 'medication' | 'followup' | 'assessment';
  action: string;
  timeframe?: string;
  details?: string;
  completed?: boolean;
}

interface ActionCategory {
  name: string;
  icon: React.ElementType;
  items: ActionItem[];
  priority: 'high' | 'medium' | 'low';
}

export const ActionPlanResults: React.FC<ActionPlanResultsProps> = ({
  actionPlan,
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
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Parse action plan into structured categories
  const actionCategories = useMemo((): ActionCategory[] => {
    if (!actionPlan) return [];

    const lines = actionPlan.split('\n').filter(line => line.trim());
    const actions: ActionItem[] = [];
    let currentPriority: ActionItem['priority'] = 'routine';
    let currentCategory: ActionItem['category'] = 'intervention';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and section headers
      if (!trimmedLine || /^#{1,3}|^(Action Plan|Recommendations|Treatment Plan):?/i.test(trimmedLine)) {
        continue;
      }

      // Detect priority level
      if (/immediate|emergent|stat|urgent|critical/i.test(trimmedLine)) {
        currentPriority = 'immediate';
      } else if (/urgent|priority|asap/i.test(trimmedLine)) {
        currentPriority = 'urgent';
      } else {
        currentPriority = 'routine';
      }

      // Detect category
      if (/monitor|observe|watch|assess|check|evaluate/i.test(trimmedLine)) {
        currentCategory = 'monitoring';
      } else if (/medication|drug|administer|give|prescribe|dose/i.test(trimmedLine)) {
        currentCategory = 'medication';
      } else if (/follow.?up|discharge|referral|appointment|clinic/i.test(trimmedLine)) {
        currentCategory = 'followup';
      } else if (/lab|test|repeat|obtain|order/i.test(trimmedLine)) {
        currentCategory = 'assessment';
      } else {
        currentCategory = 'intervention';
      }

      // Extract action items (numbered, bulleted, or hyphenated)
      const actionMatch = trimmedLine.match(/^(\d+\.|\*|\-|\•)\s*(.+)/);
      if (actionMatch) {
        const actionText = actionMatch[2];
        
        // Extract timeframe if present
        const timeframeMatch = actionText.match(/\((within|in|after|every|q)\s*([^)]+)\)/i);
        const timeframe = timeframeMatch ? timeframeMatch[0] : undefined;
        const cleanAction = timeframe ? actionText.replace(timeframe, '').trim() : actionText;

        actions.push({
          id: `action-${actions.length}`,
          priority: currentPriority,
          category: currentCategory,
          action: cleanAction,
          timeframe,
          completed: false
        });
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Non-bulleted action item
        actions.push({
          id: `action-${actions.length}`,
          priority: currentPriority,
          category: currentCategory,
          action: trimmedLine,
          completed: false
        });
      }
    }

    // Group actions by category
    const categories: ActionCategory[] = [
      {
        name: 'Immediate Interventions',
        icon: AlertTriangle,
        items: actions.filter(a => a.priority === 'immediate' && a.category === 'intervention'),
        priority: 'high'
      },
      {
        name: 'Medications',
        icon: FileText,
        items: actions.filter(a => a.category === 'medication'),
        priority: 'high'
      },
      {
        name: 'Monitoring',
        icon: Stethoscope,
        items: actions.filter(a => a.category === 'monitoring'),
        priority: 'medium'
      },
      {
        name: 'Assessments',
        icon: CheckCircle2,
        items: actions.filter(a => a.category === 'assessment'),
        priority: 'medium'
      },
      {
        name: 'Follow-up Care',
        icon: Calendar,
        items: actions.filter(a => a.category === 'followup'),
        priority: 'low'
      },
      {
        name: 'General Interventions',
        icon: ClipboardList,
        items: actions.filter(a => a.category === 'intervention' && a.priority !== 'immediate'),
        priority: 'medium'
      }
    ].filter(cat => cat.items.length > 0);

    // Auto-expand high priority categories
    categories.forEach(cat => {
      if (cat.priority === 'high') {
        setExpandedCategories(prev => new Set([...prev, cat.name]));
      }
    });

    return categories;
  }, [actionPlan]);

  // Start editing
  const handleStartEdit = () => {
    if (actionPlan) {
      setEditedText(actionPlan);
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
    if (actionPlan) {
      try {
        await navigator.clipboard.writeText(actionPlan);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {

      }
    }
  };

  // Toggle action completion
  const toggleAction = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Get priority styling
  const getPriorityStyles = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'immediate':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          badge: 'bg-red-100 text-red-800',
          icon: 'text-red-600'
        };
      case 'urgent':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-800',
          icon: 'text-blue-600'
        };
    }
  };

  // Get category priority styling
  const getCategoryStyles = (priority: ActionCategory['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold">Generating Action Plan...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Creating personalized treatment recommendations
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
            <h4 className="font-semibold text-red-900">Action Plan Generation Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!actionPlan) {
    return (
      <Card className="p-6 border-dashed">
        <div className="text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Treatment action plan will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Treatment Action Plan</h3>
            <Badge variant="outline">
              {actionCategories.reduce((acc, cat) => acc + cat.items.length, 0)} actions
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copySuccess}
            >
              {copySuccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
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
              placeholder="Enter action plan..."
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
        /* Structured Action Categories */
        <div className="space-y-3">
          {actionCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories.has(category.name);
            const completedCount = category.items.filter(item => completedActions.has(item.id)).length;
            
            return (
              <Card 
                key={category.name}
                className={cn("overflow-hidden", getCategoryStyles(category.priority))}
              >
                {/* Category Header */}
                <div 
                  className="p-4 cursor-pointer select-none hover:bg-black/5"
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <h4 className="font-semibold">{category.name}</h4>
                      <Badge variant="outline">
                        {completedCount}/{category.items.length}
                      </Badge>
                    </div>
                    
                    <div className={cn("transform transition-transform", isExpanded && "rotate-90")}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Category Items */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {category.items.map((item) => {
                        const styles = getPriorityStyles(item.priority);
                        const isCompleted = completedActions.has(item.id);
                        
                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "p-3 border rounded-lg transition-all",
                              styles.bg,
                              styles.border,
                              isCompleted && "opacity-60"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleAction(item.id)}
                                className={cn(
                                  "mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  isCompleted 
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className={styles.badge}>
                                    {item.priority}
                                  </Badge>
                                  {item.timeframe && (
                                    <Badge variant="outline" className="gap-1">
                                      <Clock className="h-3 w-3" />
                                      {item.timeframe}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className={cn(
                                  "text-sm",
                                  styles.text,
                                  isCompleted && "line-through"
                                )}>
                                  {item.action}
                                </p>
                                
                                {item.details && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Raw Action Plan (Collapsible) */}
      {!isEditing && (
        <Card className="p-4">
          <details className="group">
            <summary className="cursor-pointer select-none font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Raw Action Plan
              <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-3 bg-muted/50 p-3 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {actionPlan}
              </pre>
            </div>
          </details>
        </Card>
      )}

      {/* Progress Summary */}
      {actionCategories.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Progress Summary</span>
            </div>
            <div className="text-sm text-blue-700">
              {completedActions.size} of {actionCategories.reduce((acc, cat) => acc + cat.items.length, 0)} actions completed
            </div>
          </div>
        </Card>
      )}

      {/* External Resources */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Star className="h-4 w-4" />
          Clinical Calculator
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Treatment Guidelines
        </Button>
      </div>
    </div>
  );
};