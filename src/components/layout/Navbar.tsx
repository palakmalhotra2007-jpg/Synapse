'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Clock,
  ShieldCheck,
  Users,
  Database,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, session, signOut, executionMode, setExecutionMode } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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

  const notifications = [
    {
      id: 'n1',
      title: 'MoM Briefing Ready',
      desc: 'Meeting summary and 3 action items assigned to you',
      time: '15m ago',
    },
    {
      id: 'n2',
      title: 'Document Uploaded',
      desc: 'Updated agreement added to Vault',
      time: '1h ago',
    },
  ];

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none text-left shadow-2xs">
        {/* Left Section: Mobile Menu Button & Active Team Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs font-semibold text-sky-700 max-w-[200px] sm:max-w-none">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
            <span className="truncate">{user?.teamName || 'Executive Ops'}</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">{user?.department || 'Operations'}</span>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 space-y-3 z-50 animate-in zoom-in-95 text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-100">
                    2 New
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                    >
                      <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                      <p className="text-[11px] text-slate-500">{n.desc}</p>
                      <span className="text-[9px] text-slate-400 block font-mono">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Profile Trigger & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'CS'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800">{user?.displayName || 'Charvi Sharma'}</span>
                <span className="text-[10px] text-slate-500">{user?.role || 'User'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 space-y-3 z-50 animate-in zoom-in-95 text-slate-800">
                {/* User Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'CS'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{user?.displayName}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    <span className="text-[10px] font-mono text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 inline-block mt-1">
                      {user?.employeeId}
                    </span>
                  </div>
                </div>

                {/* Session Status */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" />
                      <span>Session:</span>
                    </span>
                    <span className="font-mono text-slate-800 font-bold">{sessionUptime}</span>
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
                    className="w-full p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 font-medium transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>View Profile</span>
                  </button>

                  <Link
                    href="/security"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 font-medium transition-all flex items-center gap-2.5 block"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Security & Passkeys</span>
                  </Link>

                  <Link
                    href="/employees"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full p-2 rounded-xl hover:bg-slate-50 text-left text-xs text-slate-700 font-medium transition-all flex items-center gap-2.5 block"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Organization Directory</span>
                  </Link>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
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
        title="Sign Out"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600">
            Are you sure you want to log out of your session?
          </p>

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
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
