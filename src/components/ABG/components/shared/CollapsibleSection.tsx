import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface CollapsibleSectionProps {
  // Header content
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  
  // State
  isCollapsed: boolean;
  onToggle: () => void;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  iconBackground?: string;
  
  // Content
  children: React.ReactNode;
  
  // Optional collapsed preview
  collapsedPreview?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  icon,
  isCollapsed,
  onToggle,
  className,
  headerClassName,
  contentClassName,
  iconBackground = "bg-gradient-to-br from-blue-500 to-blue-600",
  children,
  collapsedPreview
}) => {
  return (
    <div className={cn("abg-card abg-glass p-5", className)}>
      <div 
        className={cn(
          "flex items-center justify-between mb-4 cursor-pointer",
          headerClassName
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              iconBackground
            )}>
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {isCollapsed ? 'Show' : 'Hide'}
          </span>
          {isCollapsed ? 
            <ChevronDown className="h-4 w-4 text-slate-400" /> : 
            <ChevronUp className="h-4 w-4 text-slate-400" />
          }
        </div>
      </div>
      
      {!isCollapsed ? (
        <div className={contentClassName}>
          {children}
        </div>
      ) : (
        collapsedPreview && (
          <div className="bg-slate-50 rounded-lg p-4">
            {collapsedPreview}
          </div>
        )
      )}
    </div>
  );
};