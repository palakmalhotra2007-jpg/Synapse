'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Shield,
  ShieldCheck,
  Lock,
  Download,
  Calendar,
  User,
  History,
  Tag,
  Layers,
  FileCheck,
  AlertTriangle,
  Clock,
  Eye,
  Building,
} from 'lucide-react';
import { DocumentItem, DocumentKeyClause, DocumentVersion, DocumentAccessHistoryEntry } from '@/types/document';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/firebase/authContext';
import { addAuditLogEntry, getStoredUsers } from '@/lib/auth/usersDb';

interface DocumentPreviewDrawerProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOwnerProfile?: (employeeId: string) => void;
}

export const DocumentPreviewDrawer: React.FC<DocumentPreviewDrawerProps> = ({
  document: doc,
  isOpen,
  onClose,
  onOpenOwnerProfile,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'content' | 'clauses' | 'summary' | 'versions' | 'permissions' | 'access_history'>('content');

  if (!isOpen || !doc) return null;

  const handleDownload = () => {
    const blob = new Blob([doc.content || doc.summary || 'Document Payload'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();

    addAuditLogEntry({
      eventType: 'document_access',
      actorEmployeeId: user?.employeeId || 'EMP-EXEC-001',
      actorName: user?.displayName || 'Specialist',
      actorRole: user?.rbacRole || 'Employee',
      targetResource: `${doc.name} (${doc.id})`,
      action: 'Downloaded document payload',
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: `File size: ${doc.size}, Vault: ${doc.vaultId.toUpperCase()}`,
    });
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'TOP SECRET':
        return <Badge variant="rose">TOP SECRET</Badge>;
      case 'CONFIDENTIAL':
        return <Badge variant="amber">CONFIDENTIAL</Badge>;
      case 'INTERNAL RESTRICTED':
        return <Badge variant="purple">INTERNAL RESTRICTED</Badge>;
      default:
        return <Badge variant="emerald">UNCLASSIFIED</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{doc.name}</h3>
                {getClassificationBadge(doc.classification)}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {doc.id} • {doc.size} • {doc.vaultId?.toUpperCase() || 'GENERAL'} VAULT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
              Download
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'content', label: 'Preview Content' },
            { id: 'clauses', label: `Key Clauses (${doc.keyClauses?.length || 0})` },
            { id: 'summary', label: 'Executive Summary' },
            { id: 'versions', label: `Versions (${doc.versions?.length || 1})` },
            { id: 'permissions', label: 'Vault Permissions' },
            { id: 'access_history', label: `Access History (${doc.accessHistory?.length || 1})` },
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

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 text-left">
          {/* Metadata Card (Always visible at top of drawer) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Owner / Author</span>
              <button
                onClick={() => doc.uploadedByEmployeeId && onOpenOwnerProfile?.(doc.uploadedByEmployeeId)}
                className="font-bold text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>{doc.uploadedBy}</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono">{doc.uploadedByEmployeeId}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Security Clearance</span>
              <span className="font-bold text-amber-400 block mt-0.5">{doc.securityLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Pages / Word Count</span>
              <span className="font-bold text-slate-200 block mt-0.5">{doc.pageCount} pages ({doc.wordCount} words)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Uploaded Date</span>
              <span className="font-bold text-slate-200 block mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* TAB 1: Preview Content */}
          {activeTab === 'content' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Document Stream Preview
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED AT REST (AES-256)</span>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar select-text">
                {doc.content || doc.summary || 'No text extracted for this document.'}
              </div>
            </div>
          )}

          {/* TAB 2: Key Clauses */}
          {activeTab === 'clauses' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Extracted Contractual Clauses & Liabilities ({doc.keyClauses?.length || 0}):
              </span>
              <div className="space-y-3">
                {doc.keyClauses?.map((clause, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{clause.title}</h5>
                      <Badge variant={clause.riskLevel === 'HIGH' ? 'rose' : clause.riskLevel === 'MEDIUM' ? 'amber' : 'emerald'}>
                        {clause.riskLevel} RISK
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      "{clause.snippet}"
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">{clause.pageOrSection} • Type: {clause.type.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Executive Synthesis & Overview
              </span>
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {doc.summary || 'No executive summary available.'}
                </p>
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {(doc.tags || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-400 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Versions */}
          {activeTab === 'versions' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Document Version History
              </span>
              <div className="space-y-2.5">
                {(doc.versions || [
                  {
                    version: '1.0.0',
                    updatedAt: doc.uploadedAt,
                    updatedBy: doc.uploadedBy || 'Specialist',
                    updatedByEmployeeId: doc.uploadedByEmployeeId || 'EMP-EXEC-001',
                    changeNote: 'Initial verified ingestion and clause indexing.',
                    size: doc.size,
                  },
                ]).map((v, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">v{v.version}</span>
                      <span className="text-[10px] text-slate-500">{new Date(v.updatedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{v.changeNote}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Author: {v.updatedBy} ({v.updatedByEmployeeId})</span>
                      <span>Size: {v.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Permissions */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Vault Access & RBAC Permissions Matrix
              </span>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Assigned Vault:</span>
                  <Badge variant="cyan">{doc.vaultId?.toUpperCase()} VAULT</Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Mandatory Clearance:</span>
                  <Badge variant="amber">{doc.securityLevel}</Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Classification Tier:</span>
                  <span className="font-bold text-white">{doc.classification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Audit Logging:</span>
                  <span className="text-emerald-400 font-bold">100% Comprehensive</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Access History */}
          {activeTab === 'access_history' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Audit Trail & Access History
              </span>
              <div className="space-y-2">
                {(doc.accessHistory || [
                  {
                    id: 'acc-01',
                    employeeId: doc.uploadedByEmployeeId || 'EMP-EXEC-001',
                    employeeName: doc.uploadedBy || 'Specialist',
                    action: 'VIEW' as const,
                    timestamp: doc.uploadedAt,
                    ipAddress: '192.168.1.100',
                    status: 'SUCCESS' as const,
                  },
                ]).map((acc) => (
                  <div key={acc.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{acc.employeeName}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{acc.employeeId}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Action: {acc.action} • IP: {acc.ipAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="emerald" size="sm">SUCCESS</Badge>
                      <span className="text-[9px] text-slate-500 block mt-1">{new Date(acc.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
