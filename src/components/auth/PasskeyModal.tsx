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
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 shrink-0 mt-0.5">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Hardware Authenticator</span>
              <Badge variant={isPlatformBiometricAvailable ? 'emerald' : 'amber'} size="sm">
                {isPlatformBiometricAvailable ? 'Platform Ready' : 'Security Key Mode'}
              </Badge>
            </div>
            <p className="text-slate-600">
              {isPlatformBiometricAvailable
                ? 'Windows Hello, Touch ID, Face ID, or Android Biometrics will be prompted securely by your operating system.'
                : 'Insert a FIDO2 hardware security key (e.g. YubiKey) or use your device authenticator.'}
            </p>
          </div>
        </div>

        {/* Current Employee Info */}
        {user && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Authenticating Employee:</span>
              <span className="font-bold text-slate-800">{user.displayName}</span>
              <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({user.employeeId})</span>
            </div>
            <Badge variant="sky" size="sm">{user.teamName}</Badge>
          </div>
        )}

        {/* Mode-specific input */}
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Passkey Label / Device Name (Optional)</label>
            <input
              type="text"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="e.g. Workstation Windows Hello / MacBook Touch ID"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
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
