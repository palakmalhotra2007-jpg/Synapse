import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sky' | 'cyan' | 'purple' | 'indigo' | 'rose' | 'amber' | 'emerald' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'sky',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors select-none',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        (variant === 'sky' || variant === 'cyan') && 'bg-sky-50 text-sky-700 border-sky-200',
        (variant === 'indigo' || variant === 'purple') && 'bg-indigo-50 text-indigo-700 border-indigo-200',
        variant === 'rose' && 'bg-rose-50 text-rose-700 border-rose-200',
        variant === 'amber' && 'bg-amber-50 text-amber-700 border-amber-200',
        variant === 'emerald' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        variant === 'slate' && 'bg-slate-100 text-slate-700 border-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
