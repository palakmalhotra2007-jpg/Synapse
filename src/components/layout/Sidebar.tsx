'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Video,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Employee Directory',
    href: '/employees',
    icon: Users,
    badge: 'Directory',
  },
  {
    name: 'Document Intelligence',
    href: '/documents',
    icon: FileText,
    badge: 'Vaults',
  },
  {
    name: 'Meeting Intelligence',
    href: '/meetings',
    icon: Video,
    badge: 'MoM',
  },
  {
    name: 'Omni Fraud Analysis',
    href: '/fraud',
    icon: ShieldAlert,
    badge: 'AML',
  },
  {
    name: 'Access & Security',
    href: '/security',
    icon: ShieldCheck,
    badge: 'Audit',
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 z-40 select-none shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 shrink-0 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-white tracking-wider">
                  SYNAPSE
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded font-mono">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Security & Intelligence OS
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group relative text-xs font-semibold',
                isActive
                  ? 'bg-slate-900 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                )}
              />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="tracking-wide text-xs">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
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

      {/* System Status Footer */}
      {!isCollapsed ? (
        <div className="p-3.5 mx-3 mb-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white text-[11px]">Vault Status Active</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">99.98% SLA</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Clearance:</span>
            <span className="text-cyan-400 font-mono font-bold truncate max-w-[120px]">
              {user?.securityClearance?.split(' ')[0]} {user?.securityClearance?.split(' ')[1] || 'Level 1'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-4 flex justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Security Vault Active" />
        </div>
      )}
    </aside>
  );
};
