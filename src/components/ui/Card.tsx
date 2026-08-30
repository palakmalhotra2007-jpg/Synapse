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
        'rounded-2xl transition-all duration-300 p-6 relative overflow-hidden',
        variant === 'glass' && 'glass-panel',
        variant === 'glow' && 'glass-card-glow',
        variant === 'solid' && 'bg-slate-900/90 border border-slate-800',
        hoverEffect && 'hover:border-synapse-cyan/40 hover:shadow-[0_0_25px_rgba(0,242,254,0.15)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
