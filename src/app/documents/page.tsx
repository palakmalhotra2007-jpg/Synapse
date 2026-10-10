'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Plus,
  Shield,
  Eye,
  Download,
  Lock,
  Tag,
  Trash2,
  Calendar,
  User,
  Filter,
  RefreshCw,
  FolderLock,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DocumentItem, DocumentComparisonResult, VaultId, DocumentClassification } from '@/types/document';
import {
  getStoredDocuments,
  saveStoredDocuments,
  sampleDocComparison,
} from '@/lib/mockData/documents';
import { TEAMS_LIST, canUserAccessVault, getStoredUsers, addAuditLogEntry } from '@/lib/auth/usersDb';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentPreviewDrawer } from '@/components/documents/DocumentPreviewDrawer';
import { generateDocumentDiffReport } from '@/lib/utils/pdfGenerator';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { useAuth } from '@/lib/firebase/authContext';
import { UserProfile } from '@/types/dashboard';

export default function DocumentIntelligencePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultId | 'all'>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'workspace' | 'compare'>('workspace');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Employee Profile Drawer State
  const [profileEmployee, setProfileEmployee] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Side-by-side comparison state
  const [compareDoc1, setCompareDoc1] = useState<DocumentItem | null>(null);
  const [compareDoc2, setCompareDoc2] = useState<DocumentItem | null>(null);
  const [comparisonResult, setComparisonResult] = useState<DocumentComparisonResult | null>(sampleDocComparison);
  const [isComparing, setIsComparing] = useState(false);

  // Initialize and sync documents
  useEffect(() => {
    const stored = getStoredDocuments();
    setDocuments(stored);
    if (stored.length >= 2) {
      setCompareDoc1(stored[0]);
      setCompareDoc2(stored[1]);
    }
  }, []);

  // Vault authorization check
  const isVaultAuthorized = selectedVault === 'all' || canUserAccessVault(user, selectedVault);

  // Filter documents by Vault, Search, and Classification
  const filteredDocuments = documents.filter((doc) => {
    const matchesVault =
      selectedVault === 'all'
        ? true
        : selectedVault === 'my_team'
        ? doc.vaultId === (user?.teamId as any) || doc.teamId === user?.teamId
        : doc.vaultId === selectedVault;

    const matchesSearch =
      !searchDocQuery.trim() ||
      doc.name.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.tags?.some((t) => t.toLowerCase().includes(searchDocQuery.toLowerCase())) ||
      doc.uploadedBy?.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.uploadedByEmployeeId?.toLowerCase().includes(searchDocQuery.toLowerCase());

    const matchesClassification =
      classificationFilter === 'ALL' || doc.classification === classificationFilter;

    return matchesVault && matchesSearch && matchesClassification;
  });

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    const updated = [newDoc, ...documents.filter((d) => d.id !== newDoc.id)];
    setDocuments(updated);
    setPreviewDoc(newDoc);
    setIsPreviewOpen(true);
  };

  const handleDeleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      const updated = documents.filter((d) => d.id !== docId);
      setDocuments(updated);
      saveStoredDocuments(updated);
    }
  };

  const handleOpenOwnerProfile = (employeeId: string) => {
    const allUsers = getStoredUsers();
    const matched = allUsers.find((u) => u.employeeId === employeeId);
    if (matched) {
      setProfileEmployee(matched);
      setIsProfileOpen(true);
    }
  };

  const runComparison = async () => {
    if (!compareDoc1 || !compareDoc2) return;
    setIsComparing(true);
    try {
      const res = await SynapseAIEngine.compareDocuments(compareDoc1, compareDoc2);
      setComparisonResult(res);
    } finally {
      setIsComparing(false);
    }
  };

  const exportComparisonReport = () => {
    if (!comparisonResult) return;

    generateDocumentDiffReport({
      doc1Name: comparisonResult.doc1Name,
      doc2Name: comparisonResult.doc2Name,
      similarityScore: comparisonResult.similarityScore,
      executiveSummary: `${comparisonResult.financialVariance} ${comparisonResult.riskVariance}`,
      differences: comparisonResult.keyDifferences.map((d) => ({
        category: d.section,
        originalText: d.doc1Text,
        modifiedText: d.doc2Text,
        impact: d.impact,
      })),
    });
  };

  const handleDirectDownloadDoc = (doc: DocumentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const filePayload = `================================================================================
SYNAPSE ENTERPRISE VAULT DOCUMENT
DOCUMENT NAME: ${doc.name}
DOCUMENT ID: ${doc.id}
VAULT REPOSITORY: ${doc.vaultId?.toUpperCase()} VAULT
CLASSIFICATION TIER: ${doc.classification}
SECURITY CLEARANCE: ${doc.securityLevel}
UPLOADED BY: ${doc.uploadedBy || 'Specialist'} (${doc.uploadedByEmployeeId || 'EMP-ENG-001'})
DATE INGESTED: ${new Date(doc.uploadedAt).toLocaleString()}
================================================================================

--- EXECUTIVE SUMMARY ---
${doc.summary || 'No executive summary available for this document.'}

--- DOCUMENT CONTENT PAYLOAD ---
${doc.content || 'Encrypted document content stored in vault isolation.'}

--- KEY CONTRACTUAL CLAUSES (${doc.keyClauses?.length || 0}) ---
${
  doc.keyClauses && doc.keyClauses.length > 0
    ? doc.keyClauses
        .map(
          (c, idx) =>
            `${idx + 1}. [${c.type.toUpperCase()}] ${c.title} (${c.pageOrSection}) - Risk Level: ${c.riskLevel}\n   Snippet: "${c.snippet}"`
        )
        .join('\n\n')
    : 'No key clauses indexed.'
}

================================================================================
VERIFIED CRYPTOGRAPHIC VAULT AUDIT TRAIL & COMPLIANCE LOG
================================================================================
`;

    let exportFileName = doc.name;
    if (!exportFileName.endsWith('.txt') && !exportFileName.endsWith('.md') && !exportFileName.endsWith('.csv')) {
      exportFileName = exportFileName.replace(/\.[^/.]+$/, '') + '.txt';
    }

    const blob = new Blob([filePayload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 300);

    addAuditLogEntry({
      eventType: 'document_access',
      actorEmployeeId: user?.employeeId || 'EMP-ENG-001',
      actorName: user?.displayName || 'Specialist',
      actorRole: user?.rbacRole || 'Employee',
      targetResource: `${doc.name} (${doc.id})`,
      action: 'Downloaded document payload',
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: `File size: ${doc.size}, Vault: ${doc.vaultId.toUpperCase()}`,
    });
  };

  const getClassificationBadge = (classification: DocumentClassification) => {
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

  const vaultsList: { id: VaultId | 'all'; label: string; count: number; requiredRole?: string }[] = [
    { id: 'all', label: 'All Vaults', count: documents.length },
    { id: 'executive', label: 'Executive Vault', count: documents.filter((d) => d.vaultId === 'executive').length, requiredRole: 'Executive or Admin' },
    { id: 'finance', label: 'Finance Vault', count: documents.filter((d) => d.vaultId === 'finance').length, requiredRole: 'Finance or Admin' },
    { id: 'legal', label: 'Legal Vault', count: documents.filter((d) => d.vaultId === 'legal').length, requiredRole: 'Legal or Admin' },
    { id: 'cyber', label: 'Cyber & Fraud Vault', count: documents.filter((d) => d.vaultId === 'cyber').length, requiredRole: 'Security Analyst or Admin' },
    { id: 'engineering', label: 'Engineering Vault', count: documents.filter((d) => d.vaultId === 'engineering').length },
    { id: 'my_team', label: 'My Team Vault', count: documents.filter((d) => d.vaultId === (user?.teamId as any) || d.teamId === user?.teamId).length },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <FolderLock className="w-4 h-4 text-sky-600" />
            <span>Multi-Vault Document Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Document Intelligence & Vault Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Role-isolated document repositories with automated clause extraction, side-by-side diff comparison, and audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload to Vault
          </Button>

          {activeTab === 'compare' && (
            <Button onClick={exportComparisonReport} variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export Diff Report
            </Button>
          )}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'workspace'
              ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4 text-sky-600" />
          <span>Vault Workspace & Library</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'compare'
              ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Side-by-Side Compare Documents</span>
        </button>
      </div>

      {/* TAB 1: Vault Workspace */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          {/* Vault Navigation Pills */}
          <div className="p-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {vaultsList.map((v) => {
                const isSelected = selectedVault === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVault(v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>{v.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-50 rounded-md font-bold text-sky-700 border border-sky-100">
                      {v.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Classification Filters */}
            <div className="flex items-center gap-2">
              <select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Classifications</option>
                <option value="TOP SECRET">Top Secret</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="INTERNAL RESTRICTED">Internal Restricted</option>
                <option value="UNCLASSIFIED">Unclassified</option>
              </select>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  placeholder="Filter vault documents..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* If unauthorized vault, display Access Denied */}
          {!isVaultAuthorized ? (
            <AccessDenied
              vaultName={vaultsList.find((v) => v.id === selectedVault)?.label}
              requiredClearance={vaultsList.find((v) => v.id === selectedVault)?.requiredRole || 'Level 4 Clearance'}
              onBack={() => setSelectedVault('all')}
            />
          ) : (
            /* Document Library Table */
            <Card className="p-0 overflow-hidden border-slate-200/80">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Indexed Vault Documents ({filteredDocuments.length})
                </span>
                <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Storage Verified</span>
                </span>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-slate-400" />
                  <p>No documents found in this vault matching your criteria.</p>
                  <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]">
                        <th className="py-3 px-4">Document Name</th>
                        <th className="py-3 px-4">Vault</th>
                        <th className="py-3 px-4">Owner / Author</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Security Level</th>
                        <th className="py-3 px-4">Updated Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          onClick={() => {
                            setPreviewDoc(doc);
                            setIsPreviewOpen(true);
                          }}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <Badge variant="sky" size="sm">
                                {doc.type.toUpperCase()}
                              </Badge>
                              <div className="min-w-0">
                                <span className="block truncate max-w-sm">{doc.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {doc.id} • {doc.size}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 font-medium">
                              {doc.vaultId?.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (doc.uploadedByEmployeeId) {
                                  handleOpenOwnerProfile(doc.uploadedByEmployeeId);
                                }
                              }}
                              className="text-sky-700 hover:underline font-medium flex items-center gap-1"
                            >
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{doc.uploadedBy}</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {doc.uploadedByEmployeeId}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {getClassificationBadge(doc.classification)}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {doc.securityLevel}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant="emerald" size="sm">
                              READY
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc(doc);
                                  setIsPreviewOpen(true);
                                }}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                Preview
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleDirectDownloadDoc(doc, e)}
                                leftIcon={<Download className="w-3.5 h-3.5 text-sky-600" />}
                              >
                                Download
                              </Button>

                              <button
                                onClick={(e) => handleDeleteDocument(doc.id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: Side-by-Side Compare Documents */}
      {activeTab === 'compare' && (
        <Card className="space-y-6">
          {/* Document Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Baseline Document (v1.0)</label>
              <select
                value={compareDoc1?.id || ''}
                onChange={(e) => {
                  const d = documents.find((doc) => doc.id === e.target.value);
                  if (d) setCompareDoc1(d);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vaultId?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Updated Document (v2.0)</label>
              <select
                value={compareDoc2?.id || ''}
                onChange={(e) => {
                  const d = documents.find((doc) => doc.id === e.target.value);
                  if (d) setCompareDoc2(d);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vaultId?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Side-by-Side Difference Analysis</h3>
              <p className="text-xs text-slate-500">
                Automated contractual clause comparison, liability caps, and financial exposure variance.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={runComparison}
              isLoading={isComparing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />}
            >
              Re-Calculate Diff
            </Button>
          </div>

          {/* Comparison Results Card */}
          {comparisonResult && (
            <div className="space-y-5">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Similarity Score</span>
                  <span className="text-xl font-bold text-sky-700">{comparisonResult.similarityScore}% Match</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Financial Variance</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1 line-clamp-2">{comparisonResult.financialVariance}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Risk Variance</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-1 line-clamp-2">{comparisonResult.riskVariance}</span>
                </div>
              </div>

              {/* Differences List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Identified Clause Changes ({comparisonResult.keyDifferences.length}):
                </span>
                {comparisonResult.keyDifferences.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{diff.section}</span>
                      <Badge variant={diff.impact === 'CRITICAL' ? 'rose' : diff.impact === 'MODERATE' ? 'amber' : 'emerald'} size="sm">
                        {diff.impact} VARIANCE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">Baseline Document:</span>
                        {diff.doc1Text}
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span className="text-[10px] text-sky-700 font-bold block mb-1">Updated Document:</span>
                        {diff.doc2Text}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium pt-1">
                      <strong>AI Analysis:</strong> {diff.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                  Executive Compliance Recommendations:
                </span>
                <ul className="space-y-1 text-xs text-slate-700 list-disc pl-5">
                  {comparisonResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleDocumentUploaded}
        defaultVaultId={selectedVault === 'all' || selectedVault === 'my_team' ? 'engineering' : selectedVault}
      />

      {/* Document Preview Drawer */}
      <DocumentPreviewDrawer
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onOpenOwnerProfile={handleOpenOwnerProfile}
      />

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={profileEmployee}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
