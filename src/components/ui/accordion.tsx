import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type AccordionContextValue = {
  value: string | string[] | null;
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
  collapsible: boolean;
};

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string | string[] | null;
  onValueChange?: (value: string | string[]) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  collapsible = false,
  value: controlledValue,
  onValueChange: onControlledValueChange,
  className,
  children,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(null);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const onValueChange = (itemValue: string) => {
    if (isControlled) {
      if (type === 'single') {
        onControlledValueChange?.(itemValue);
      } else if (type === 'multiple') {
        const currentValues = controlledValue as string[] || [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter(v => v !== itemValue)
          : [...currentValues, itemValue];
        onControlledValueChange?.(newValues);
      }
    } else {
      setUncontrolledValue(prev => prev === itemValue && collapsible ? null : itemValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange, type, collapsible }}>
      <div className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value: itemValue,
  className,
  children,
  ...props
}) => {
  const context = useContext(AccordionContext);
  
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }
  
  const isOpen = context.type === 'single'
    ? context.value === itemValue
    : Array.isArray(context.value) && context.value.includes(itemValue);

  return (
    <div
      className={cn(
        "border-b border-gray-200 dark:border-gray-700",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onToggle: () => context.onValueChange(itemValue),
          });
        }
        return child;
      })}
    </div>
  );
};

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className,
  children,
  isOpen,
  onToggle,
  ...props
}) => {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={onToggle}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen ? "rotate-180" : ""
        )}
      />
    </button>
  );
};

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  isOpen,
  ...props
}) => {
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        "overflow-hidden pt-0 pb-4 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      <div className="pb-4">{children}</div>
    </div>
  );
}; 