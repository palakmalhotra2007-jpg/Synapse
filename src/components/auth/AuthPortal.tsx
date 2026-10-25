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
  Scan,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { TEAMS_LIST } from '@/lib/auth/usersDb';
import { Button } from '@/components/ui/Button';
import { TeamId, UserRbacRole } from '@/types/dashboard';
import { FaceRecognitionModal } from './FaceRecognitionModal';

export const AuthPortal: React.FC = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('charvi@synapse-ai.io');
  const [password, setPassword] = useState('Synapse#2026');
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('engineering');
  const [selectedRbacRole, setSelectedRbacRole] = useState<UserRbacRole>('Employee');
  const [role, setRole] = useState('Senior Systems Specialist');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setSuccessMessage('Authentication verified. Entering Synapse Workspace...');
        }
      } else {
        const res = await register(name, email, password, selectedTeam as TeamId, role, selectedRbacRole);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          setSuccessMessage('Employee account provisioned successfully.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 bg-slate-50">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
          
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                SYNAPSE
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Enterprise Intelligence Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register Employee
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charvi Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Team</label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    >
                      {TEAMS_LIST.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">RBAC Role</label>
                    <select
                      value={selectedRbacRole}
                      onChange={(e) => setSelectedRbacRole(e.target.value as UserRbacRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </>
            )}

            {tab === 'login' && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Demo Engineering Accounts:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to pre-fill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('charvi@synapse-ai.io');
                      setPassword('Synapse#2026');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'charvi@synapse-ai.io'
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">Charvi Sharma</div>
                    <div className="text-[10px] text-slate-500 truncate">Engineering Lead</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('tanisha@synapse-ai.io');
                      setPassword('Synapse#2026');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'tanisha@synapse-ai.io'
                        ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">Tanisha Gupta</div>
                    <div className="text-[10px] text-slate-500 truncate">Senior Backend Eng</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('anshika@synapse-ai.io');
                      setPassword('Synapse#2026');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'anshika@synapse-ai.io'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">Anshika Verma</div>
                    <div className="text-[10px] text-slate-500 truncate">Neural Pipeline Lead</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('bhavya@synapse-ai.io');
                      setPassword('Synapse#2026');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      email === 'bhavya@synapse-ai.io'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">Bhavya Malhotra</div>
                    <div className="text-[10px] text-slate-500 truncate">Frontend Lead</div>
                  </button>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <span>Enterprise Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="charvi@synapse-ai.io"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Password</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full py-3 mt-2 font-bold shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {tab === 'login' ? 'Sign In to Workspace' : 'Create Account'}
            </Button>

            {tab === 'login' && (
              <>
                <div className="relative flex py-1 items-center my-1">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    or biometric verification
                  </span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFaceModalOpen(true)}
                  className="w-full py-2.5 font-bold border-sky-300 text-sky-700 hover:bg-sky-50 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Scan className="w-3.5 h-3.5 text-sky-600" />
                  <span>Scan Face ID Biometrics</span>
                </Button>
              </>
            )}

            {/* Security Badge Footer */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>AES-256 Vault Encrypted</span>
            </div>
          </form>

          {/* Biometric Face Recognition Scanner Modal */}
          <FaceRecognitionModal
            isOpen={isFaceModalOpen}
            onClose={() => setIsFaceModalOpen(false)}
            mode="login"
            targetEmail={email}
            onSuccess={(user) => {
              setSuccessMessage(`Face Biometrics Verified: Welcome back, ${user?.displayName || 'Specialist'}! Entering Workspace...`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
