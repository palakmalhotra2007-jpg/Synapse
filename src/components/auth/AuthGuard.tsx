'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import { AuthPortal } from './AuthPortal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { UnifiedAIChatModal } from '@/components/workspace/UnifiedAIChatModal';
import { LiveCharacter } from '@/components/character/LiveCharacter';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAILLMOpen, setIsAILLMOpen] = useState(false);
  const [aiLLMInitialMode, setAiLLMInitialMode] = useState<'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection'>('chat');

  // Show minimal clean loading screen while restoring auth state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-4">
        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide">
          Loading Workspace...
        </p>
      </div>
    );
  }

  // Show auth portal if no authenticated user
  if (!user) {
    return <AuthPortal />;
  }

  return (
    <div className="relative z-10 flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          {children}
        </main>
      </div>

      {/* Persistent Live AI Character */}
      <LiveCharacter
        mode="floating"
        onOpenAILLM={(mode) => {
          setAiLLMInitialMode(mode || 'chat');
          setIsAILLMOpen(true);
        }}
      />

      {/* Unified AI Assistant Modal */}
      <UnifiedAIChatModal
        isOpen={isAILLMOpen}
        onClose={() => setIsAILLMOpen(false)}
        initialMode={aiLLMInitialMode}
      />
    </div>
  );
};
