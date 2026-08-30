'use client';

import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Sparkles, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { Badge } from '@/components/ui/Badge';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  return (
    <>
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left Search Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:border-synapse-cyan/40 hover:text-slate-200 transition-all text-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-synapse-cyan transition-colors" />
              <span>Search intelligence, transactions, MoMs, or documents...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-4">
          {/* Active Model Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
            <Sparkles className="w-3.5 h-3.5 text-synapse-cyan animate-pulse" />
            <span className="text-slate-400">Engine:</span>
            <span className="font-semibold text-slate-200">Synapse Neural v4</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-synapse-cyan animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-synapse-cyan" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-800" />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-2">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.displayName || 'User Avatar'}
              className="w-9 h-9 rounded-xl object-cover border border-synapse-cyan/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100">{user?.displayName || 'Alex Sterling'}</span>
              <span className="text-[10px] text-slate-400">{user?.role || 'Chief Technology Officer'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
