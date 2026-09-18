'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Laptop,
  Smartphone,
  LogOut,
  History,
  Lock,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  User,
  Clock,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import {
  getStoredUsers,
  getStoredAuditLogs,
  getStoredSecurityEvents,
  revokeUserSession,
} from '@/lib/auth/usersDb';
import { AuditLogEntry, SecurityEvent, AuditEventType } from '@/types/dashboard';
import { PasskeyModal } from '@/components/auth/PasskeyModal';

export default function AccessAndSecurityPage() {
  const { user, session, signOut, removePasskey } = useAuth();
  const [activeTab, setActiveTab] = useState<'sessions' | 'passkeys' | 'events' | 'audit_logs'>('sessions');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);

  const loadData = () => {
    setAuditLogs(getStoredAuditLogs());
    setSecurityEvents(getStoredSecurityEvents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSession = (sessionId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to terminate this workstation session?')) {
      revokeUserSession(user.uid, sessionId);
      loadData();
    }
  };

  const handleRemovePasskey = async (passkeyId: string) => {
    if (confirm('Are you sure you want to unbind this hardware passkey?')) {
      await removePasskey(passkeyId);
      loadData();
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !auditSearch.trim() ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorEmployeeId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetResource.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesType = selectedEventType === 'ALL' || log.eventType === selectedEventType;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportAuditCSV = () => {
    const headers = 'ID,Timestamp,Actor ID,Actor Name,Role,Event Type,Resource,Action,Status,IP,Details\n';
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actorEmployeeId}","${l.actorName}","${l.actorRole}","${l.eventType}","${l.targetResource}","${l.action}","${l.status}","${l.ipAddress}","${l.details}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Audit_Log_${Date.now()}.csv`;
    a.click();
  };

  const allUsers = getStoredUsers();
  const allActiveSessions = allUsers.flatMap((u) => u.activeSessions || []);
  const allPasskeys = allUsers.flatMap((u) => u.passkeys || []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-100 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise Identity & Access Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Access & Security Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor active workstation sessions, manage WebAuthn hardware passkeys, inspect security events, and search immutable audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={() => setIsPasskeyModalOpen(true)} variant="primary" size="sm" leftIcon={<KeyRound className="w-4 h-4" />}>
            Enroll Passkey
          </Button>

          <Button onClick={exportAuditCSV} variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Audit Logs
          </Button>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Workstation Sessions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{allActiveSessions.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Encrypted TLS 1.3
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Authenticated devices across HQ</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Passkeys</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{allPasskeys.length}</span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">
              FIDO2 / WebAuthn
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Hardware biometrics & YubiKeys</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Incidents Flagged</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400">{securityEvents.length}</span>
            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
              Active Alerts
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Vault denials & anomaly spikes</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Recorded Audit Logs</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{auditLogs.length}</span>
            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
              Immutable Trail
            </span>
          </div>
          <p className="text-[11px] text-slate-400">SOC2 Type II compliant logs</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'sessions', label: `Active Workstations & Sessions (${allActiveSessions.length})` },
          { id: 'passkeys', label: `Registered Passkeys & Authenticators (${user?.passkeys?.length || 0})` },
          { id: 'events', label: `Security Incident Events (${securityEvents.length})` },
          { id: 'audit_logs', label: `System Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 border border-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Active Sessions */}
      {activeTab === 'sessions' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Active Authorized Sessions</h3>
              <p className="text-xs text-slate-400">Real-time inspection of active JWT session tokens and IP origins</p>
            </div>
          </div>

          <div className="space-y-3">
            {allUsers.map((u) => (
              <div key={u.uid} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{u.displayName}</span>
                  <span className="font-mono text-slate-500">({u.employeeId})</span>
                  <Badge variant="cyan" size="sm">{u.teamName}</Badge>
                </div>

                <div className="space-y-2 pl-4">
                  {(!u.activeSessions || u.activeSessions.length === 0) ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                      No active sessions.
                    </div>
                  ) : (
                    u.activeSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white">{sess.device}</span>
                            {sess.isCurrent && <Badge variant="emerald" size="sm">Current Active Session</Badge>}
                            <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {sess.authMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            IP: <span className="font-mono text-slate-300">{sess.ipAddress}</span> • Location: {sess.location} • Login: {new Date(sess.loginTime).toLocaleString()}
                          </p>
                        </div>

                        {!sess.isCurrent && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeSession(sess.id)}
                            leftIcon={<LogOut className="w-3.5 h-3.5" />}
                          >
                            Revoke Session
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: Passkeys & Authenticators */}
      {activeTab === 'passkeys' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Your Registered WebAuthn Passkeys</h3>
              <p className="text-xs text-slate-400">Hardware tokens, Windows Hello, Touch ID, and Face ID credentials</p>
            </div>

            <Button onClick={() => setIsPasskeyModalOpen(true)} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Enroll New Passkey
            </Button>
          </div>

          <div className="space-y-3">
            {(!user?.passkeys || user.passkeys.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                <KeyRound className="w-8 h-8 mx-auto text-slate-600" />
                <p>No passkeys registered for your account yet.</p>
                <Button variant="outline" size="sm" onClick={() => setIsPasskeyModalOpen(true)}>
                  Register Windows Hello / Touch ID
                </Button>
              </div>
            ) : (
              user.passkeys.map((pk) => (
                <div key={pk.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-synapse-cyan/10 text-cyan-400 border border-cyan-500/20">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{pk.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {pk.os} • {pk.browser} • Credential ID: {pk.credentialId.substring(0, 20)}...
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Registered: {new Date(pk.createdAt).toLocaleDateString()} • Last active: {pk.lastUsedAt ? new Date(pk.lastUsedAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemovePasskey(pk.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Remove passkey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: Security Incident Events */}
      {activeTab === 'events' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Security Incident Events</h3>
              <p className="text-xs text-slate-400">Real-time alerts on vault authorization failures, AML threshold breaches, and anomaly detections</p>
            </div>
          </div>

          <div className="space-y-3">
            {securityEvents.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  ev.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : ev.severity === 'HIGH'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="font-bold text-white">{ev.eventType}</span>
                    <Badge variant={ev.severity === 'CRITICAL' ? 'rose' : ev.severity === 'HIGH' ? 'amber' : 'cyan'} size="sm">
                      {ev.severity}
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">{ev.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                  <span>Actor: {ev.employeeName} ({ev.employeeId})</span>
                  <span>Origin IP: {ev.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: System Audit Logs */}
      {activeTab === 'audit_logs' && (
        <Card className="space-y-4 p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit logs by actor, employee ID, resource, or action..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="auth_failure">Auth Failure</option>
                  <option value="passkey_registration">Passkey Registration</option>
                  <option value="document_access">Document Access</option>
                  <option value="vault_access">Vault Access</option>
                  <option value="vault_denial">Vault Denial</option>
                  <option value="transaction_investigation">Transaction Investigation</option>
                  <option value="permission_change">Permission Change</option>
                  <option value="session_revocation">Session Revocation</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="DENIED">Denied</option>
                  <option value="FAILED">Failed</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action & Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{log.actorName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.actorEmployeeId} • {log.actorRole}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{log.action}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-sm block font-mono mt-0.5">{log.targetResource}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={log.status === 'SUCCESS' ? 'emerald' : log.status === 'DENIED' ? 'rose' : log.status === 'FAILED' ? 'rose' : 'amber'}
                        size="sm"
                      >
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Passkey Enrollment Modal */}
      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
        mode="register"
        onSuccess={loadData}
      />
    </div>
  );
}
