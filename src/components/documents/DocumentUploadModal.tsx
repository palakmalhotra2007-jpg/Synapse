'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Users,
  Lock,
  ArrowRight,
  Cpu,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { useAuth } from '@/lib/firebase/authContext';
import { TEAMS_LIST } from '@/lib/auth/usersDb';
import { DocumentItem, DocumentAccessLevel } from '@/types/document';
import { TeamId } from '@/types/dashboard';
import { addNewStoredDocument } from '@/lib/mockData/documents';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (doc: DocumentItem) => void;
  defaultTeamId?: TeamId | 'all';
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  defaultTeamId,
}) => {
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [targetTeam, setTargetTeam] = useState<TeamId | 'all'>(
    defaultTeamId || (user?.teamId as TeamId) || 'engineering'
  );
  const [accessLevel, setAccessLevel] = useState<DocumentAccessLevel>('TEAM_ONLY');
  const [tagsInput, setTagsInput] = useState('Enterprise, AI Index, 2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<DocumentItem | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!docTitle) {
      setDocTitle(file.name);
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select or drop a document file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Multi-phase AI Vector Ingestion Simulation
      setProcessingStep('Parsing file stream & extracting text tokens...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep('Generating 1536-dim HNSW vector embeddings...');
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep('Classifying contractual obligations & risk vectors...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep('Registering document to Synapse Team Vault...');
      await new Promise((r) => setTimeout(r, 500));

      const assignedTeamMeta = TEAMS_LIST.find((t) => t.id === targetTeam);
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileType =
        ext === 'pdf'
          ? 'pdf'
          : ext === 'docx' || ext === 'doc'
          ? 'docx'
          : ext === 'csv'
          ? 'csv'
          : ext === 'txt'
          ? 'txt'
          : ext === 'json'
          ? 'json'
          : ext === 'xlsx'
          ? 'xlsx'
          : 'md';

      const wordEstimate = Math.floor(selectedFile.size / 5.5);
      const pageEstimate = Math.max(1, Math.floor(wordEstimate / 350));

      const newDoc: DocumentItem = {
        id: `DOC-${Date.now()}`,
        name: docTitle.trim() || selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: fileType as any,
        uploadedAt: new Date().toISOString(),
        teamId: targetTeam,
        teamName: assignedTeamMeta?.name || 'All Enterprise Teams',
        uploadedBy: user?.displayName || 'Enterprise Employee',
        uploadedByEmployeeId: user?.employeeId || 'EMP-SYN-101',
        accessLevel: accessLevel,
        pageCount: pageEstimate,
        wordCount: wordEstimate,
        sensitivityScore: accessLevel === 'RESTRICTED' ? 95 : accessLevel === 'CONFIDENTIAL' ? 80 : 50,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        summary: `Enterprise document "${docTitle.trim() || selectedFile.name}" indexed for team ${assignedTeamMeta?.name || 'Enterprise'}. Encrypted with AES-256 and enabled for direct multi-hop RAG AI reasoning.`,
        content: `INDEXED DOCUMENT STREAM: ${docTitle.trim()}
Uploaded by ${user?.displayName || 'Employee'} (${user?.employeeId || 'EMP-001'})
Team Vault: ${assignedTeamMeta?.name || 'All Teams'}
Access Classification: ${accessLevel}

SECTION 1: OVERVIEW & PURPOSE
This document has been ingested into Synapse RAG Neural Store. Key clauses, SLAs, liabilities, and data handling warranties are available for instant semantic query answering.`,
        keyClauses: [
          {
            type: 'obligation',
            title: 'Team Operational SLA Requirement',
            snippet: 'Guarantees 99.95% team response time and priority escalation paths.',
            pageOrSection: 'Section 1.1',
            riskLevel: 'LOW',
          },
          {
            type: 'compliance',
            title: 'Enterprise Data Isolation Warranty',
            snippet: 'All vector indices partitioned strictly by team access levels.',
            pageOrSection: 'Section 4.3',
            riskLevel: 'LOW',
          },
          {
            type: 'liability',
            title: 'Confidentiality & Access Governance',
            snippet: 'Restricted to authorized team credentials with audit logging.',
            pageOrSection: 'Section 8.1',
            riskLevel: accessLevel === 'RESTRICTED' ? 'HIGH' : 'MEDIUM',
          },
        ],
      };

      addNewStoredDocument(newDoc);
      setUploadSuccess(newDoc);
      onUploadSuccess?.(newDoc);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process and index document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndClose = () => {
    setSelectedFile(null);
    setDocTitle('');
    setUploadSuccess(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Upload Enterprise Document to Team Vault"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-synapse-cyan/30">
          <div className="w-10 h-10 rounded-xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan shrink-0">
            <UploadCloud className="w-5 h-5 animate-pulse-glow" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Synapse Neural Document Ingestion</span>
              <Badge variant="cyan" size="sm">RAG Multi-Hop</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload PDFs, agreements, specifications, or audit reports to specific Team Vaults with automated clause extraction.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banner */}
        {uploadSuccess ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Document Successfully Ingested!</h4>
                <p className="text-xs text-slate-300">
                  {uploadSuccess.name} is now indexed in <strong>{uploadSuccess.teamName}</strong> vault.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">File Size</span>
                <span className="font-bold text-slate-200">{uploadSuccess.size}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Est. Pages</span>
                <span className="font-bold text-slate-200">{uploadSuccess.pageCount} Pages</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Uploader</span>
                <span className="font-bold text-synapse-cyan truncate block">{uploadSuccess.uploadedByEmployeeId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Access Level</span>
                <Badge variant="cyan" size="sm">{uploadSuccess.accessLevel}</Badge>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="primary" onClick={handleResetAndClose}>
                Done & View Documents
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone */}
            <FileDropzone
              onFileSelect={handleFileSelect}
              currentFileName={selectedFile?.name}
              acceptTypes=".pdf, .docx, .doc, .txt, .csv, .md, .json, .xlsx"
              label="Drop Enterprise Document (PDF, DOCX, CSV, TXT, JSON)"
              sublabel="Instant vector embedding & automated clause extraction"
            />

            {/* Document Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-synapse-cyan" />
                <span>Document Title / Display Name</span>
              </label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Master Enterprise Cloud Services Agreement 2026.pdf"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>

            {/* Target Team Vault & Access Level Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Team Vault */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Assign to Team Vault</span>
                </label>
                <select
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
                >
                  <option value="all">All Company (Public Vault)</option>
                  {TEAMS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Access Classification */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Access Classification Level</span>
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as DocumentAccessLevel)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
                >
                  <option value="TEAM_ONLY">Team Members Only</option>
                  <option value="CONFIDENTIAL">Confidential (Lead & Exec Only)</option>
                  <option value="RESTRICTED">Restricted (Security Audit Only)</option>
                  <option value="PUBLIC">Enterprise Public (All Employees)</option>
                </select>
              </div>
            </div>

            {/* Employee Attribution & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Uploader Attribution</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>{user?.displayName || 'Active Employee'}</span>
                  <span className="font-mono text-[11px] text-synapse-cyan font-bold">
                    {user?.employeeId || 'EMP-EXEC-001'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Metadata Tags (comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Audit, SLA, FinOps, Contract"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                />
              </div>
            </div>

            {/* AI Vector Ingestion Progress */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-xs text-synapse-cyan font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{processingStep}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-synapse-cyan to-synapse-purple animate-pulse w-3/4" />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={handleResetAndClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isProcessing}
                disabled={!selectedFile || isProcessing}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload & Ingest into Vault
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
