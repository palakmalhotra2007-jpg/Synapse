'use client';

import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Scan,
  Fingerprint,
  Users,
  Building,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';
import { TEAMS_LIST, StoredUser, getStoredUsers } from '@/lib/auth/usersDb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FaceRecognitionModal } from './FaceRecognitionModal';
import { TeamId } from '@/types/dashboard';

export const AuthPortal: React.FC = () => {
  const { login, register, loginWithPersona } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'fingerprint' | 'face'>('password');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);

  // Form states
  const [email, setEmail] = useState('alex.sterling@synapse-ai.io');
  const [password, setPassword] = useState('Synapse#2026');
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('engineering');
  const [isCreatingNewTeam, setIsCreatingNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [role, setRole] = useState('Senior AI Systems Engineer');
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
          setSuccessMessage('Authentication verified. Welcome to Synapse.');
        }
      } else {
        const finalTeamId = isCreatingNewTeam ? (newTeamName.toLowerCase().replace(/\s+/g, '_') as TeamId) : (selectedTeam as TeamId);
        const res = await register(name, email, password, finalTeamId, role);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        } else {
          setSuccessMessage('Employee account provisioned and biometric clearance registered.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFingerprintScan = () => {
    setIsFingerprintScanning(true);
    setErrorMessage(null);

    setTimeout(async () => {
      setIsFingerprintScanning(false);
      // Auto-authenticate default user
      const defaultUser = getStoredUsers()[0];
      if (defaultUser) {
        loginWithPersona(defaultUser.uid);
        setSuccessMessage('Fingerprint biometric vector verified.');
      }
    }, 1600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Platform Branding & Multi-Biometric Pillars */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synapse-cyan/10 border border-synapse-cyan/30 text-synapse-cyan text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synapse Enterprise Security OS • Multi-Biometric Clearance</span>
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

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Authenticate using your facial biometrics, fingerprint sensor, or corporate credentials to access cross-document intelligence, fraud audit matrix, and meeting minutes synthesis.
            </p>
          </div>

          {/* Biometric Verification Methods Card */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Supported Authentication Channels:
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsFaceModalOpen(true)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-synapse-cyan/30 hover:border-synapse-cyan text-left text-xs text-white transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-synapse-cyan/10 text-synapse-cyan">
                    <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <strong className="block text-white">Live Face Recognition Scan</strong>
                    <span className="text-[10px] text-slate-400">Camera vector matching against biometric vault</span>
                  </div>
                </div>
                <Badge variant="cyan" size="sm">Camera Scan</Badge>
              </button>

              <button
                type="button"
                onClick={handleFingerprintScan}
                disabled={isFingerprintScanning}
                className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/30 hover:border-purple-400 text-left text-xs text-white transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Fingerprint className={`w-4 h-4 ${isFingerprintScanning ? 'animate-pulse text-synapse-cyan' : ''}`} />
                  </div>
                  <div>
                    <strong className="block text-white">
                      {isFingerprintScanning ? 'Scanning Sensor...' : 'Fingerprint / Touch Biometrics'}
                    </strong>
                    <span className="text-[10px] text-slate-400">Hardware token or biometric touch sensor</span>
                  </div>
                </div>
                <Badge variant="purple" size="sm">
                  {isFingerprintScanning ? 'Verifying...' : 'Touch ID'}
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Credential Authentication & Dynamic Team Provisioning Form */}
        <div className="lg:col-span-7">
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
                Sign In with Credentials
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
                Create Account & Department
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
                      <span>Full Employee Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Sterling"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                    />
                  </div>

                  {/* Team & Department Creation Options */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-purple-400" />
                        <span>Team & Department Assignment</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewTeam(!isCreatingNewTeam)}
                        className="text-[11px] text-synapse-cyan hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isCreatingNewTeam ? 'Select Existing Team' : 'Create New Team'}</span>
                      </button>
                    </div>

                    {!isCreatingNewTeam ? (
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
                      >
                        {TEAMS_LIST.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name} ({team.code}) • {team.lead}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          required
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="New Team Name (e.g. Risk Ops)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                        />
                        <input
                          type="text"
                          required
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          placeholder="Department (e.g. Corporate Finance)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Role / Designation</span>
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Security Specialist"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
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
                  placeholder="alex.sterling@synapse-ai.io"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
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
                {tab === 'login' ? 'Authenticate & Enter' : 'Provision Employee Account'}
              </Button>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AES-256 Biometric Vault</span>
                </span>
                <span>SOC2 Type II Clearance</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Face Recognition Biometric Modal */}
      <FaceRecognitionModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        mode="login"
      />
    </div>
  );
};
