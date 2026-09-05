'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Shield,
  User,
  ChevronDown,
  LogOut,
  Coins,
  Clock,
  CheckCircle2,
  Users,
  ExternalLink,
  ShieldAlert,
  Video,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { INITIAL_USERS } from '@/lib/auth/usersDb';
import { GlobalSearchModal } from './GlobalSearchModal';

export const Navbar: React.FC = () => {
  const { user, session, signOut, loginWithPersona, addTokens } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [sessionUptime, setSessionUptime] = useState('0m');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Calculate session uptime
  useEffect(() => {
    if (!session?.loginTime) return;
    const interval = setInterval(() => {
      const login = new Date(session.loginTime).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((now - login) / 60000);
      if (diffMinutes < 60) {
        setSessionUptime(`${diffMinutes}m`);
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        setSessionUptime(`${hours}h ${mins}m`);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [session?.loginTime]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  const notifications = [
    {
      id: 'n1',
      title: 'Critical Fraud Anomaly Flagged',
      desc: 'TXN-902148 ($1,450,000) exceeded transfer limit by 420%',
      time: '10m ago',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      id: 'n2',
      title: 'Executive Meeting MoM Ready',
      desc: 'MoM for Executive AI Strategy generated with 3 action items',
      time: '25m ago',
      icon: Video,
      color: 'text-cyan-400',
    },
    {
      id: 'n3',
      title: 'MSA Agreement Analyzed',
      desc: 'Extracted 99.95% SLA and $5M liability clauses',
      time: '1h ago',
      icon: FileText,
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left Search Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:border-synapse-cyan/40 hover:text-slate-200 transition-all text-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-synapse-cyan transition-colors" />
              <span className="hidden sm:inline">Search intelligence, transactions, MoMs, or documents...</span>
              <span className="sm:hidden">Search Synapse...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Model Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
            <Sparkles className="w-3.5 h-3.5 text-synapse-cyan animate-pulse" />
            <span className="text-slate-400">Engine:</span>
            <span className="font-semibold text-slate-200">Synapse Neural v4.2</span>
          </div>

          {/* Token Balance Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-cyan-500/20 rounded-xl text-xs text-slate-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">
              {user?.tokenBalance ? user.tokenBalance.toLocaleString() : '850,000'}
            </span>
            <span className="text-[10px] text-slate-400">Tokens</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-synapse-cyan animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-synapse-cyan" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-800 bg-slate-900/95 shadow-2xl p-4 space-y-3 z-50 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">System Alerts & Notifications</span>
                    <Badge variant="cyan" size="sm">3 New</Badge>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 group"
                      >
                        <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${n.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-200 group-hover:text-synapse-cyan truncate">
                            {n.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.desc}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-800" />

          {/* User Profile Trigger & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
            >
              <img
                src={
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.displayName || 'User Avatar'}
                className="w-9 h-9 rounded-xl object-cover border border-synapse-cyan/40 shadow-[0_0_10px_rgba(0,242,254,0.3)]"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100">{user?.displayName || 'Alex Sterling'}</span>
                <span className="text-[10px] text-slate-400">{user?.role || 'Chief Technology Officer'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel border border-synapse-cyan/30 bg-slate-900/95 shadow-2xl p-4 space-y-4 z-50 animate-in zoom-in-95">
                {/* User Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <img
                    src={user?.photoURL}
                    alt={user?.displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-synapse-cyan/40 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">{user?.displayName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <Badge variant="cyan" size="sm" className="mt-1">
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                {/* Session & Quota Status */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Token Quota:</span>
                    </span>
                    <span className="font-bold text-white">
                      {user?.tokenBalance ? user.tokenBalance.toLocaleString() : '850,000'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Session Uptime:</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{sessionUptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Organization:</span>
                    <span className="text-slate-300 font-semibold">{user?.organization}</span>
                  </div>
                </div>

                {/* Quick Switch Persona */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-purple-400" />
                    <span>Switch Active Persona:</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {INITIAL_USERS.map((p) => (
                      <button
                        key={p.uid}
                        onClick={() => {
                          loginWithPersona(p.uid);
                          setIsUserMenuOpen(false);
                        }}
                        className={`p-2 rounded-lg text-center transition-all border ${
                          user?.uid === p.uid
                            ? 'bg-synapse-cyan/15 border-synapse-cyan text-synapse-cyan font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[11px] truncate">{p.displayName.split(' ')[0]}</div>
                        <div className="text-[9px] text-slate-500 truncate">{p.role.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => addTokens(50000)}
                    className="text-[11px] text-synapse-cyan hover:underline font-semibold"
                  >
                    + Refill 50k Tokens
                  </button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Terminate User Session"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <LogOut className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">Are you sure you want to log out?</p>
              <p className="text-slate-300">
                Your active session token will be invalidated and you will need to re-authenticate with your credentials or select a persona.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsLogoutModalOpen(false);
                signOut();
              }}
            >
              Confirm Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
