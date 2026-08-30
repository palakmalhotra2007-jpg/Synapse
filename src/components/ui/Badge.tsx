import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'rose' | 'amber' | 'emerald' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'cyan',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        variant === 'cyan' && 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        variant === 'purple' && 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        variant === 'rose' && 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        variant === 'amber' && 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        variant === 'emerald' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        variant === 'slate' && 'bg-slate-800/80 border-slate-700 text-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
