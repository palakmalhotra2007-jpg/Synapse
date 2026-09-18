'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  ChevronDown,
  LogOut,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  Video,
  FileText,
  KeyRound,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PasskeyModal } from '@/components/auth/PasskeyModal';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';

export const Navbar: React.FC = () => {
  const { user, session, signOut } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
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
      title: 'Critical SWIFT Anomaly Flagged',
      desc: 'TXN-902148 ($1,450,000) exceeded velocity baseline limit by 420%',
      time: '10m ago',
      icon: ShieldAlert,
      color: 'text-rose-400',
    },
    {
      id: 'n2',
      title: 'Executive Briefing MoM Ready',
      desc: 'MoM for Q4 Distributed Infrastructure generated with 3 deliverables',
      time: '25m ago',
      icon: Video,
      color: 'text-cyan-400',
    },
    {
      id: 'n3',
      title: 'MSA Agreement Analyzed',
      desc: 'Extracted 99.95% SLA and $5M liability caps in Legal Vault',
      time: '1h ago',
      icon: FileText,
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none text-left">
        {/* Left Section: Active Department & Security Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white tracking-wide">{user?.teamName || 'Executive Ops'}</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400">{user?.department || 'Operations'}</span>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* WebAuthn Hardware Passkey Button */}
          <button
            onClick={() => setIsPasskeyModalOpen(true)}
            className="px-3 py-1.5 text-xs text-cyan-400 hover:bg-slate-900 rounded-xl transition-colors border border-cyan-500/30 hover:border-cyan-400 flex items-center gap-2"
            title="WebAuthn Passkey Status"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">WebAuthn Passkey</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-4 space-y-3 z-50 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">System Security Alerts</span>
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
                          <h5 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 truncate">
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
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800"
            >
              <img
                src={
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.displayName || 'User Avatar'}
                className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-sm"
              />
              <div className="hidden md:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100">{user?.displayName || 'Alex Sterling'}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-900 text-cyan-400 border border-slate-800 rounded font-bold">
                    {user?.employeeId || 'EMP-EXEC-001'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.role || 'CTO'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-4 space-y-3 z-50 animate-in zoom-in-95">
                {/* User Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <img
                    src={user?.photoURL}
                    alt={user?.displayName}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{user?.displayName}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                        {user?.employeeId}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="cyan" size="sm">{user?.securityClearance}</Badge>
                    </div>
                  </div>
                </div>

                {/* Session Status */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Session Duration:</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{sessionUptime}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">RBAC Role:</span>
                    <span className="font-bold text-white">{user?.rbacRole || 'Administrator'}</span>
                  </div>
                </div>

                {/* Profile & Security Menu Items */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileDrawerOpen(true);
                    }}
                    className="w-full p-2 rounded-xl hover:bg-slate-800/60 text-left text-xs text-white transition-all flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>View My Identity Profile</span>
                  </button>

                  <Link
                    href="/security"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full p-2 rounded-xl hover:bg-slate-800/60 text-left text-xs text-white transition-all flex items-center gap-2.5 block"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Access & Security Hub</span>
                  </Link>

                  <Link
                    href="/employees"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full p-2 rounded-xl hover:bg-slate-800/60 text-left text-xs text-white transition-all flex items-center gap-2.5 block"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Employee Directory</span>
                  </Link>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
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

      {/* Passkey Modal */}
      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
        mode="register"
      />

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={user}
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Terminate User Session"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <LogOut className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">Are you sure you want to log out?</p>
              <p className="text-slate-300">
                Your active session token will be invalidated and you will need to re-authenticate with your credentials or WebAuthn passkey.
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
