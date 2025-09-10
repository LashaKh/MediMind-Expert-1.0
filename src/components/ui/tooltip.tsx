import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute z-50 px-2 py-1 text-xs font-medium text-[var(--foreground)] bg-[var(--background-dark)] dark:bg-[var(--card)] rounded-md whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2"
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-[var(--background-dark)] dark:bg-[var(--card)] transform rotate-45 bottom-[-4px] left-1/2 -translate-x-1/2"
          />
        </div>
      )}
    </div>
  );
}; 