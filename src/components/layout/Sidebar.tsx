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
  ChevronLeft,
  ChevronRight,
  Shield,
  Bot,
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
    name: 'AI Workspace',
    href: '/workspace',
    icon: Bot,
  },
  {
    name: 'Meetings',
    href: '/meetings',
    icon: Video,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Organization',
    href: '/employees',
    icon: Users,
  },
  {
    name: 'Fraud Analysis',
    href: '/fraud',
    icon: ShieldAlert,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-slate-200/80 bg-white transition-all duration-300 z-40 select-none shrink-0 shadow-xs',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                SYNAPSE
              </span>
              <span className="text-[10px] text-slate-500 font-medium -mt-0.5">
                Workspace OS
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                  ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
              {!isCollapsed && (
                <span className="tracking-wide text-xs">{item.name}</span>
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

      {/* Clean User Footer (No persistent Vault status / clearance card) */}
      {!isCollapsed && user && (
        <div className="p-3.5 mx-3 mb-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'CS'}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user.displayName}</h4>
            <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
};
