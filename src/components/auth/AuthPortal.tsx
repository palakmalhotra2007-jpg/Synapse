'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Building,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { TEAMS_LIST, StoredUser, getStoredUsers } from '@/lib/auth/usersDb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TeamId, UserRbacRole } from '@/types/dashboard';

export const AuthPortal: React.FC = () => {
  const { login, loginWithPasskey, register, isPlatformBiometricAvailable } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('alex.sterling@synapse-ai.io');
  const [password, setPassword] = useState('Synapse#2026');
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('engineering');
  const [selectedRbacRole, setSelectedRbacRole] = useState<UserRbacRole>('Employee');
  const [role, setRole] = useState('Senior Systems Specialist');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasskeyAuthenticating, setIsPasskeyAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid corporate credentials.');
        } else {
          setSuccessMessage('Authentication verified. Welcome to Synapse Enterprise.');
        }
      } else {
        const res = await register(name, email, password, selectedTeam as TeamId, role, selectedRbacRole);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          setSuccessMessage('Employee account provisioned with assigned security clearance.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsPasskeyAuthenticating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginWithPasskey(email || undefined);
      if (!res.success) {
        setErrorMessage(res.error || 'WebAuthn biometric authentication was not completed.');
      } else {
        setSuccessMessage('Biometric passkey verified. Access granted.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Passkey verification failed.');
    } finally {
      setIsPasskeyAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 text-left">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Platform Branding */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Security & Intelligence OS</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  SYNAPSE
                </h1>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Enterprise Platform
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Authenticate using your enterprise credentials or WebAuthn platform passkeys (Windows Hello, Touch ID, Face ID, or Security Keys) to access protected intelligence vaults.
            </p>
          </div>

          {/* WebAuthn Hardware Passkey Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>WebAuthn / Passkeys Ready</span>
              </span>
              <Badge variant={isPlatformBiometricAvailable ? 'emerald' : 'amber'} size="sm">
                {isPlatformBiometricAvailable ? 'Hardware Available' : 'FIDO2 Supported'}
              </Badge>
            </div>

            <p className="text-[11px] text-slate-400">
              One-click biometric verification using your device's built-in platform authenticator.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePasskeyLogin}
              isLoading={isPasskeyAuthenticating}
              className="w-full justify-center border-cyan-500/30 text-white hover:border-cyan-400 hover:bg-slate-800"
              leftIcon={<Fingerprint className="w-4 h-4 text-cyan-400" />}
            >
              Sign In with Windows Hello / Touch ID
            </Button>
          </div>
        </div>

        {/* Right Column: Credential Authentication Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative bg-slate-950/90 backdrop-blur-2xl">
            {/* Header Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In with Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'register'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Provision Employee Account
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Full Employee Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Sterling"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Department</label>
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                      >
                        {TEAMS_LIST.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">RBAC Role</label>
                      <select
                        value={selectedRbacRole}
                        onChange={(e) => setSelectedRbacRole(e.target.value as UserRbacRole)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Security Analyst">Security Analyst</option>
                        <option value="Finance">Finance</option>
                        <option value="Legal">Legal</option>
                        <option value="Executive">Executive</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Role / Designation</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Security Specialist"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Enterprise Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.sterling@synapse-ai.io"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Password</span>
                  </label>
                  {tab === 'login' && (
                    <span className="text-[10px] text-cyan-400 cursor-pointer hover:underline">
                      Default: Synapse#2026
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full py-3 mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tab === 'login' ? 'Authenticate & Enter Vault' : 'Provision Employee Account'}
              </Button>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AES-256 Vault Encryption</span>
                </span>
                <span>SOC2 Type II Clearance</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
