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
        'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-synapse-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        size === 'sm' && 'px-3 py-1.5 text-xs gap-1.5',
        size === 'md' && 'px-4 py-2.5 text-sm gap-2',
        size === 'lg' && 'px-6 py-3 text-base gap-2.5',
        variant === 'primary' && 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-semibold hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95',
        variant === 'glow' && 'bg-synapse-cyan/10 border border-synapse-cyan/40 text-synapse-cyan hover:bg-synapse-cyan/20 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)]',
        variant === 'secondary' && 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700/80 hover:text-white',
        variant === 'outline' && 'bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 hover:text-white',
        variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white',
        variant === 'danger' && 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30',
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
