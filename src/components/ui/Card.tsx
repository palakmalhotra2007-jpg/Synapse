import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glow' | 'solid';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200 p-6 relative overflow-hidden bg-white border border-slate-200/80 shadow-sm',
        hoverEffect && 'hover:border-sky-300 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
