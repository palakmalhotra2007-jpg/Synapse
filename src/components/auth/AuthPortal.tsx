'use client';

import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Bot,
  Video,
  FileText,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { INITIAL_USERS } from '@/lib/auth/usersDb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const AuthPortal: React.FC = () => {
  const { login, register, loginWithPersona } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('alex.sterling@synapse-ai.io');
  const [password, setPassword] = useState('Synapse#2026');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Chief Technology Officer');
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
          setErrorMessage(res.error || 'Invalid credentials.');
        } else {
          setSuccessMessage('Authentication verified. Welcome to Synapse!');
        }
      } else {
        const res = await register(name, email, password, role);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          setSuccessMessage('Account provisioned successfully!');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPersona = (persona: typeof INITIAL_USERS[0]) => {
    setEmail(persona.email);
    setPassword(persona.passwordHash);
    setRole(persona.role);
    setErrorMessage(null);
    loginWithPersona(persona.uid);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Hero & Value Proposition */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-cyan/10 border border-synapse-cyan/30 text-synapse-cyan text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Synapse Enterprise AI Platform v4.2</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-synapse-cyan to-synapse-purple p-0.5 shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-synapse-cyan">
                  <Zap className="w-6 h-6 animate-pulse-glow" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-synapse-cyan tracking-tight">
                  SYNAPSE
                </h1>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Cognitive Enterprise Intelligence OS
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Unified intelligence engine providing real-time multimodal RAG reasoning, automated financial fraud vectoring, speech-to-MoM synthesis, and contract diff intelligence.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl glass-panel border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Bot className="w-4 h-4" />
                <span>AI Workspace</span>
              </div>
              <p className="text-[11px] text-slate-400">RAG Document Q&A with 1M+ context window</p>
            </div>

            <div className="p-3.5 rounded-xl glass-panel border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <Shield className="w-4 h-4" />
                <span>Fraud Anomaly</span>
              </div>
              <p className="text-[11px] text-slate-400">Ledger auditing with 40+ risk vectors</p>
            </div>

            <div className="p-3.5 rounded-xl glass-panel border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Video className="w-4 h-4" />
                <span>Meeting MoM</span>
              </div>
              <p className="text-[11px] text-slate-400">Speech-to-text with auto action items</p>
            </div>

            <div className="p-3.5 rounded-xl glass-panel border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <FileText className="w-4 h-4" />
                <span>Doc Intelligence</span>
              </div>
              <p className="text-[11px] text-slate-400">Key clause parsing & contract diffs</p>
            </div>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-synapse-cyan" />
                <span>Instant Demo Personas (1-Click Login):</span>
              </span>
              <span className="text-[10px] text-synapse-cyan font-mono">Zero Setup Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {INITIAL_USERS.map((persona) => (
                <button
                  key={persona.uid}
                  type="button"
                  onClick={() => handleSelectPersona(persona)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-synapse-cyan/50 hover:bg-slate-900 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={persona.photoURL}
                      alt={persona.displayName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700 group-hover:border-synapse-cyan"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-synapse-cyan">
                        {persona.displayName.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {persona.role.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Register Form */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-synapse-cyan/30 shadow-2xl relative bg-slate-950/80 backdrop-blur-2xl">
            {/* Header Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In to Platform
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Provision Account
              </button>
            </div>

            {/* Error / Success Feedback Banners */}
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
                      <User className="w-3.5 h-3.5 text-synapse-cyan" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Role & Function</span>
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Security Specialist"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-synapse-cyan" />
                  <span>Enterprise Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.io"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-synapse-cyan" />
                    <span>Password</span>
                  </label>
                  {tab === 'login' && (
                    <span className="text-[10px] text-synapse-cyan cursor-pointer hover:underline">
                      Demo: Synapse#2026
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
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
                {tab === 'login' ? 'Authenticate & Enter' : 'Create Enterprise Account'}
              </Button>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit Firestore Encrypted</span>
                </span>
                <span>SOC2 Type II Certified</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
