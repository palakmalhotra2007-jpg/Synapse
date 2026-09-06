'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
  className,
}) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full glass-panel rounded-2xl border border-synapse-cyan/30 bg-slate-900/95 shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200',
          maxWidth === 'sm' && 'max-w-sm',
          maxWidth === 'md' && 'max-w-md',
          maxWidth === 'lg' && 'max-w-lg',
          maxWidth === 'xl' && 'max-w-xl',
          maxWidth === '2xl' && 'max-w-2xl',
          maxWidth === '4xl' && 'max-w-4xl',
          maxWidth === '5xl' && 'max-w-5xl',
          className
        )}
      >

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
