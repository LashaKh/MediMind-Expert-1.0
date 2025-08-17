import React from 'react';
import { cn } from '../../lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  role?: string;
  'data-testid'?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  className,
  children,
  id,
  style,
  role,
  'data-testid': dataTestId,
}) => {
  // Only pass activeValue and onValueChange to specific tab-related components
  const isTabComponent = (child: React.ReactElement) => {
    const type = child.type;
    // Use displayName check since components might not be defined yet
    return (
      typeof type === 'function' && 
      (type.displayName === 'TabsList' || 
       type.displayName === 'TabsContent' || 
       type.displayName === 'TabsTrigger')
    );
  };

  return (
    <div 
      className={cn("w-full", className)}
      id={id}
      style={style}
      role={role}
      data-testid={dataTestId}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && isTabComponent(child)) {
          return React.cloneElement(child as React.ReactElement<unknown>, {
            activeValue: value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  activeValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  role?: string;
  'data-testid'?: string;
}

export const TabsList: React.FC<TabsListProps> = ({
  className,
  children,
  activeValue,
  onValueChange,
  id,
  style,
  role,
  'data-testid': dataTestId,
}) => {
  // Only pass props to TabsTrigger components, not arbitrary DOM elements
  const isTabsTrigger = (child: React.ReactElement) => {
    const type = child.type;
    return (
      typeof type === 'function' && type.displayName === 'TabsTrigger'
    );
  };

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400",
        className
      )}
      id={id}
      style={style}
      role={role}
      data-testid={dataTestId}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && isTabsTrigger(child)) {
          return React.cloneElement(child as React.ReactElement<unknown>, {
            activeValue,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  value: string;
  onValueChange?: (value: string) => void;
  activeValue?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  style?: React.CSSProperties;
  role?: string;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  className,
  value,
  onValueChange,
  activeValue,
  children,
  disabled,
  type = 'button',
  id,
  style,
  role,
  'data-testid': dataTestId,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const isActive = activeValue === value;
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onValueChange) {
      onValueChange(value);
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      id={id}
      style={style}
      role={role}
      data-testid={dataTestId}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white dark:bg-gray-700 text-gray-950 dark:text-gray-50 shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50",
        className
      )}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  );
};

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string;
  activeValue?: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  role?: string;
  'data-testid'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean;
  tabIndex?: number;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  className,
  value,
  activeValue,
  children,
  id,
  style,
  role,
  'data-testid': dataTestId,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  tabIndex,
}) => {
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div
      id={id}
      style={style}
      role={role}
      data-testid={dataTestId}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
};

TabsContent.displayName = 'TabsContent'; 