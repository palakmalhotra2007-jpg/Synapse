'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import { AuthPortal } from './AuthPortal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { LiveCharacter } from '@/components/character/LiveCharacter';
import { UnifiedAIChatModal } from '@/components/workspace/UnifiedAIChatModal';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [isAILLMOpen, setIsAILLMOpen] = useState(false);
  const [aiLLMInitialMode, setAiLLMInitialMode] = useState<'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection'>('chat');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show brief dark loading screen only during initial client hydration
  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050811] text-white gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Initializing Synapse Neural Engine & Session Verification...
        </p>
      </div>
    );
  }

  // Show auth portal if no authenticated user
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

      {/* Global Live Anime Speaking AI Character Companion */}
      <LiveCharacter
        mode="floating"
        onOpenAILLM={(mode) => {
          setAiLLMInitialMode(mode || 'chat');
          setIsAILLMOpen(true);
        }}
      />

      {/* Unified AI LLM, Document RAG & Vision Modal */}
      <UnifiedAIChatModal
        isOpen={isAILLMOpen}
        onClose={() => setIsAILLMOpen(false)}
        initialMode={aiLLMInitialMode}
      />
    </div>
  );
};


