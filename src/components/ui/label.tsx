import React, { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      className={cn('text-sm font-medium text-[var(--foreground)]', className)}
      {...props}
    />
  );
};

Label.displayName = 'Label';

