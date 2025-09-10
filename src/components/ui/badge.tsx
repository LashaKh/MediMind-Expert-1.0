import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-[var(--button-destructive)] text-[var(--button-destructive-foreground)] hover:bg-[var(--button-destructive-hover)]",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        success: "bg-[var(--badge-success)] text-[var(--badge-success-foreground)]",
        warning: "bg-[var(--badge-warning)] text-[var(--badge-warning-foreground)]",
        info: "bg-[var(--badge-info)] text-[var(--badge-info-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props} />
  );
} 