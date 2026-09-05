'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  ShieldAlert,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  Sparkles,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    name: 'AI Workspace',
    href: '/workspace',
    icon: Bot,
    badge: 'LLM RAG',
  },
  {
    name: 'Fraud Analysis',
    href: '/fraud',
    icon: ShieldAlert,
    badge: 'AI Shield',
  },
  {
    name: 'Meeting Intelligence',
    href: '/meetings',
    icon: Video,
    badge: 'MoM AI',
  },
  {
    name: 'Document Intelligence',
    href: '/documents',
    icon: FileText,
    badge: 'Doc Chat',
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 z-40 select-none shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-synapse-cyan to-synapse-purple p-0.5 shadow-[0_0_15px_rgba(0,242,254,0.4)] shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-synapse-cyan">
              <Zap className="w-5 h-5 animate-pulse-glow" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-synapse-cyan tracking-wider">
                  SYNAPSE
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-synapse-cyan/20 text-synapse-cyan border border-synapse-cyan/30 rounded">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Enterprise AI Engine
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-synapse-cyan/15 to-synapse-purple/10 text-white font-semibold border border-synapse-cyan/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-synapse-cyan' : 'text-slate-400 group-hover:text-synapse-cyan'
                )}
              />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm tracking-wide">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/90 text-synapse-cyan border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-slate-800">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Token & Status Footer */}
      {!isCollapsed ? (
        <div className="p-4 mx-3 mb-4 rounded-xl glass-card-glow border border-synapse-cyan/20 bg-slate-900/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-white tracking-wide">Cloud Run Active</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">99.98% SLA</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Tokens Available:</span>
            <span className="font-bold text-synapse-cyan">
              {user?.tokenBalance ? (user.tokenBalance / 1000).toFixed(0) + 'k' : '850k'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-4 flex justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Cloud Run Active" />
        </div>
      )}
    </aside>
  );
};
