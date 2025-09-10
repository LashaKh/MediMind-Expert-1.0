import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--component-button-primary)] text-[var(--primary-foreground)] hover:bg-[var(--component-button-primary-hover)] backdrop-blur-sm",
        destructive: "bg-[var(--error-background)] text-[var(--error-text)] hover:bg-[var(--error-background)]/90 backdrop-blur-sm",
        outline: "border border-[var(--glass-border-medium)] bg-transparent hover:bg-[var(--component-button-ghost-hover)] backdrop-blur-sm",
        secondary: "bg-[var(--component-button-secondary)] text-[var(--foreground)] hover:bg-[var(--component-button-secondary-hover)] backdrop-blur-sm",
        ghost: "bg-[var(--component-button-ghost)] hover:bg-[var(--component-button-ghost-hover)] backdrop-blur-sm",
        link: "bg-transparent underline-offset-4 hover:underline text-[var(--primary)] backdrop-blur-sm",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Create a utility function for class name merging if it doesn't exist
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button"; 