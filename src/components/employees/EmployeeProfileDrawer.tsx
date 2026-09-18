'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  Laptop,
  Smartphone,
  Calendar,
  Mail,
  Phone,
  Building,
  Lock,
  Layers,
  FileText,
  Video,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  Trash2,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, PasskeyCredential, ActiveSession, VaultId } from '@/types/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/authContext';
import { getStoredAuditLogs, getStoredSecurityEvents } from '@/lib/auth/usersDb';
import { sampleDocuments } from '@/lib/mockData/documents';
import { sampleMeetings } from '@/lib/mockData/meetings';

interface EmployeeProfileDrawerProps {
  employee: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { user: currentUser, revokeSession, removePasskey } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'sessions' | 'documents' | 'meetings' | 'activity'>('overview');

  if (!isOpen || !employee) return null;

  const isSelf = currentUser?.uid === employee.uid;
  const auditLogs = getStoredAuditLogs().filter(
    (l) => l.actorEmployeeId === employee.employeeId || l.targetResource.includes(employee.employeeId)
  );
  const securityEvents = getStoredSecurityEvents().filter(
    (s) => s.employeeId === employee.employeeId
  );

  const associatedDocs = sampleDocuments.filter(
    (d) =>
      d.uploadedByEmployeeId === employee.employeeId ||
      d.uploadedBy?.toLowerCase().includes(employee.displayName.toLowerCase()) ||
      d.teamId === employee.teamId
  );

  const associatedMeetings = sampleMeetings.filter(
    (m) =>
      m.organizerEmployeeId === employee.employeeId ||
      m.participants.some((p) => p.employeeId === employee.employeeId || p.name === employee.displayName)
  );

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to terminate this active session?')) {
      await revokeSession(sessionId);
    }
  };

  const handleRemovePasskey = async (passkeyId: string) => {
    if (confirm('Are you sure you want to remove this registered passkey?')) {
      await removePasskey(passkeyId);
    }
  };

  const allVaults: { id: VaultId; label: string; color: string }[] = [
    { id: 'executive', label: 'Executive Leadership Vault', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { id: 'finance', label: 'Finance & Treasury Vault', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { id: 'legal', label: 'Legal & Contracts Vault', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    { id: 'cyber', label: 'Cyber & Fraud Forensics Vault', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
    { id: 'engineering', label: 'Engineering & Neural Vault', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
    { id: 'my_team', label: 'Departmental Team Vault', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={employee.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={employee.displayName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{employee.displayName}</h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{employee.role} • {employee.department}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'security', label: 'Clearance & Vaults' },
            { id: 'sessions', label: `Passkeys & Sessions (${employee.activeSessions?.length || 0})` },
            { id: 'documents', label: `Documents (${associatedDocs.length})` },
            { id: 'meetings', label: `Meetings (${associatedMeetings.length})` },
            { id: 'activity', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-synapse-cyan text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 text-left">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Contact & Office Details */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Corporate Directory Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Work Email:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      {employee.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Direct Phone:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {employee.phone || '+1 (555) 019-2831'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Assigned Office / Desk:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-purple-400" />
                      {employee.office || 'San Francisco HQ, Building C'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Reporting Manager:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {employee.manager || 'Alex Sterling (CTO)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Department Team:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{employee.teamName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Organization:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{employee.organization || 'Aegis Global Enterprises'}</span>
                  </div>
                </div>
              </div>

              {/* Security & Clearance Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Security Clearance Tier & RBAC Role
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">RBAC Role</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{employee.rbacRole || 'Employee'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Security Clearance</span>
                    <Badge variant="cyan" size="sm" className="mt-1">
                      {employee.securityClearance || 'Level 1 General'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">Access Level</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">{employee.accessLevel || 'Tier 2 Confidential'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-500 block text-[11px]">MFA Protection</span>
                    <span className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active & Enforced
                    </span>
                  </div>
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Granted Platform Permissions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(employee.permissions || ['workspace', 'documents', 'meetings']).map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Clearance & Vaults */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enterprise Vault Access Authorization Matrix
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {employee.vaultAccess?.length || 1} / 6 Vaults Granted
                  </span>
                </div>

                <div className="space-y-2.5">
                  {allVaults.map((vault) => {
                    const hasAccess =
                      employee.rbacRole === 'Administrator' ||
                      employee.rbacRole === 'Executive' ||
                      vault.id === 'my_team' ||
                      employee.vaultAccess?.includes(vault.id) ||
                      (vault.id === 'finance' && employee.rbacRole === 'Finance') ||
                      (vault.id === 'legal' && employee.rbacRole === 'Legal') ||
                      (vault.id === 'cyber' && employee.rbacRole === 'Security Analyst') ||
                      (vault.id === 'engineering' && employee.teamId === 'engineering');

                    return (
                      <div
                        key={vault.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          hasAccess
                            ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                            : 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${vault.color}`}>
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{vault.label}</h5>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {vault.id.toUpperCase()}_VAULT_RESTRICTED
                            </span>
                          </div>
                        </div>

                        <Badge variant={hasAccess ? 'emerald' : 'slate'} size="sm">
                          {hasAccess ? 'CLEARANCE GRANTED' : 'ACCESS DENIED'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Events related to this employee */}
              {securityEvents.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Security Events Involving This Employee ({securityEvents.length})</span>
                  </span>
                  <div className="space-y-2">
                    {securityEvents.map((ev) => (
                      <div key={ev.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{ev.eventType}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(ev.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Passkeys & Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {/* Registered WebAuthn Passkeys */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Registered WebAuthn Passkeys & Authenticators</span>
                  </span>
                  <Badge variant="cyan" size="sm">{employee.passkeys?.length || 0} Registered</Badge>
                </div>

                <div className="space-y-2">
                  {!employee.passkeys || employee.passkeys.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No platform passkeys registered yet for this employee.
                    </div>
                  ) : (
                    employee.passkeys.map((pk) => (
                      <div
                        key={pk.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-synapse-cyan/10 text-synapse-cyan">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-white">{pk.name}</h5>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {pk.os} • {pk.browser} • Last used: {pk.lastUsedAt ? new Date(pk.lastUsedAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>

                        {isSelf && (
                          <button
                            onClick={() => handleRemovePasskey(pk.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remove passkey"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span>Active Workstation Sessions & Devices</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {employee.activeSessions?.length || 0} Active
                  </span>
                </div>

                <div className="space-y-2">
                  {!employee.activeSessions || employee.activeSessions.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No active sessions.
                    </div>
                  ) : (
                    employee.activeSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{sess.device}</span>
                            {sess.isCurrent && (
                              <Badge variant="emerald" size="sm">Current Session</Badge>
                            )}
                            <span className="text-[10px] font-mono text-cyan-400">{sess.authMethod}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            IP: {sess.ipAddress} • {sess.location} • Login: {new Date(sess.loginTime).toLocaleTimeString()}
                          </p>
                        </div>

                        {(isSelf || currentUser?.rbacRole === 'Administrator') && !sess.isCurrent && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeSession(sess.id)}
                            leftIcon={<LogOut className="w-3.5 h-3.5" />}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Authored or Associated Vault Documents ({associatedDocs.length}):
              </span>
              <div className="space-y-2">
                {associatedDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white">{doc.name}</h5>
                      <Badge variant="cyan" size="sm">{doc.type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{doc.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Vault: {doc.teamName || 'Enterprise'}</span>
                      <span>Uploaded: {doc.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Meetings */}
          {activeTab === 'meetings' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Associated Briefings & Meetings ({associatedMeetings.length}):
              </span>
              <div className="space-y-2">
                {associatedMeetings.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white">{m.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{m.mom.executiveSummary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>{m.participants.length} Participants</span>
                      <span>{m.mom.actionItems.length} Action Items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Audit Trail Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Security Audit Log Entries ({auditLogs.length}):
              </span>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    No audit records logged for this employee.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{log.details}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="font-mono">Resource: {log.targetResource}</span>
                        <Badge variant={log.status === 'SUCCESS' ? 'emerald' : log.status === 'DENIED' ? 'rose' : 'amber'} size="sm">
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
