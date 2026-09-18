'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Laptop,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'register' | 'authenticate';
  onSuccess?: () => void;
}

export const PasskeyModal: React.FC<PasskeyModalProps> = ({
  isOpen,
  onClose,
  mode = 'authenticate',
  onSuccess,
}) => {
  const { user, loginWithPasskey, registerPasskey, isPlatformBiometricAvailable } = useAuth();
  const [passkeyName, setPasskeyName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAction = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'register') {
        const res = await registerPasskey(passkeyName.trim() || undefined);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to register platform passkey.');
        } else {
          setSuccessMessage('Platform passkey successfully registered and bound to your account.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1200);
        }
      } else {
        const res = await loginWithPasskey(user?.email);
        if (!res.success) {
          setErrorMessage(res.error || 'Biometric authentication was not completed.');
        } else {
          setSuccessMessage('Biometric verification confirmed. Access granted.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected WebAuthn error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'register' ? 'Register WebAuthn Passkey' : 'Platform Biometric Authentication'}
      maxWidth="md"
    >
      <div className="space-y-5 text-left">
        {/* Hardware Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-synapse-cyan/10 text-synapse-cyan shrink-0 mt-0.5">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Hardware Authenticator</span>
              <Badge variant={isPlatformBiometricAvailable ? 'emerald' : 'amber'} size="sm">
                {isPlatformBiometricAvailable ? 'Platform Ready' : 'Security Key Mode'}
              </Badge>
            </div>
            <p className="text-slate-400">
              {isPlatformBiometricAvailable
                ? 'Windows Hello, Touch ID, Face ID, or Android Biometrics will be prompted securely by your operating system.'
                : 'Insert a FIDO2 hardware security key (e.g. YubiKey) or use your device authenticator.'}
            </p>
          </div>
        </div>

        {/* Current Employee Info */}
        {user && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Authenticating Employee:</span>
              <span className="font-bold text-white">{user.displayName}</span>
              <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({user.employeeId})</span>
            </div>
            <Badge variant="cyan" size="sm">{user.teamName}</Badge>
          </div>
        )}

        {/* Mode-specific input */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Passkey Label / Device Name (Optional)</label>
            <input
              type="text"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="e.g. Workstation Windows Hello / MacBook Touch ID"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAction}
            isLoading={isProcessing}
            leftIcon={isProcessing ? undefined : <ShieldCheck className="w-4 h-4" />}
          >
            {mode === 'register' ? 'Register Biometric Passkey' : 'Verify with Windows Hello / Touch ID'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
