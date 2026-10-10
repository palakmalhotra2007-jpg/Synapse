import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
        size === 'sm' && 'px-3 py-1.5 text-xs gap-1.5',
        size === 'md' && 'px-4 py-2 text-sm gap-2',
        size === 'lg' && 'px-6 py-2.5 text-base gap-2.5',
        variant === 'primary' && 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm hover:from-sky-600 hover:to-blue-700 active:scale-[0.98]',
        variant === 'glow' && 'bg-sky-50 border border-sky-200 text-sky-700 font-semibold hover:bg-sky-100',
        variant === 'secondary' && 'bg-slate-100 border border-slate-200 text-slate-700 font-medium hover:bg-slate-200/80',
        variant === 'outline' && 'bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 shadow-xs',
        variant === 'ghost' && 'bg-transparent text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900',
        variant === 'danger' && 'bg-rose-50 border border-rose-200 text-rose-700 font-semibold hover:bg-rose-100',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
