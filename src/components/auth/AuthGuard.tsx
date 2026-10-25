'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/authContext';
import { AuthPortal } from './AuthPortal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { UnifiedAIChatModal } from '@/components/workspace/UnifiedAIChatModal';
import { LiveCharacter } from '@/components/character/LiveCharacter';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAILLMOpen, setIsAILLMOpen] = useState(false);
  const [aiLLMInitialMode, setAiLLMInitialMode] = useState<'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection'>('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    );
  }

  // Show auth portal if no authenticated user
  if (!user) {
    return <AuthPortal />;
  }

  return (
    <div className="relative z-10 flex min-h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
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
