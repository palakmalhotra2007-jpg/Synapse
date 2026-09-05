'use client';

import React from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import { AuthPortal } from './AuthPortal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-synapse-bg text-white gap-4">
        <div className="w-12 h-12 rounded-2xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan animate-pulse-glow">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Initializing Synapse Neural Engine & Session Verification...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal />;
  }

  return (
    <div className="relative z-10 flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
