'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import { VaultId, UserRbacRole } from '@/types/dashboard';

interface AccessDeniedProps {
  requiredClearance?: string;
  requiredRole?: UserRbacRole | string;
  vaultName?: string;
  resourceName?: string;
  onBack?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredClearance = 'Level 4 or 5 Security Clearance',
  requiredRole,
  vaultName,
  resourceName,
  onBack,
}) => {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg w-full p-8 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-2xl space-y-5 backdrop-blur-xl">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title & Status */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
            <span>HTTP 403 • FORBIDDEN</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {vaultName ? `${vaultName} Access Restricted` : 'Security Clearance Required'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {resourceName
              ? `You do not possess the required RBAC clearance level to access "${resourceName}".`
              : 'Your employee profile does not hold the mandatory authorization tier for this vault.'}
          </p>
        </div>

        {/* Clearance Comparison Matrix */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Your Current Role:</span>
            <span className="font-bold text-white">{user?.role || 'Employee'}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Your Security Clearance:</span>
            <Badge variant="amber" size="sm">
              {user?.securityClearance || 'Level 1 General'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Required Clearance:</span>
            <Badge variant="rose" size="sm">
              {requiredRole || requiredClearance}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {onBack ? (
            <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Authorized Vault
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = '/';
              }}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
