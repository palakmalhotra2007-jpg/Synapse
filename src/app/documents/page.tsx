'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bot,
  Send,
  UploadCloud,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Plus,
  ArrowRight,
  Shield,
  Eye,
  Paperclip,
  Download,
  FileDown,
  Users,
  Lock,
  Tag,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { DocumentItem, DocumentComparisonResult } from '@/types/document';
import {
  getStoredDocuments,
  saveStoredDocuments,
  sampleDocComparison,
} from '@/lib/mockData/documents';
import { TEAMS_LIST } from '@/lib/auth/usersDb';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { useAuth } from '@/lib/firebase/authContext';
import { TeamId } from '@/types/dashboard';
import { dispatchCompanionGuide } from '@/lib/ai/companionGuide';

export default function DocumentIntelligencePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'clauses' | 'compare'>('chat');
  const [selectedTeamVault, setSelectedTeamVault] = useState<string>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Document AI Chat state
  const [docMessages, setDocMessages] = useState<
    { role: 'user' | 'assistant'; content: string; citation?: string }[]
  >([]);
  const [docQuery, setDocQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Side-by-side comparison state
  const [compareDoc1, setCompareDoc1] = useState<DocumentItem | null>(null);
  const [compareDoc2, setCompareDoc2] = useState<DocumentItem | null>(null);
  const [comparisonResult, setComparisonResult] = useState<DocumentComparisonResult | null>(sampleDocComparison);

  // Initialize and sync documents from LocalStorage
  useEffect(() => {
    const stored = getStoredDocuments();
    setDocuments(stored);
    if (stored.length > 0) {
      setSelectedDoc(stored[0]);
      setCompareDoc1(stored[0]);
      setCompareDoc2(stored[1] || stored[0]);
      setDocMessages([
        {
          role: 'assistant',
          content: `I am ready to answer any questions about **${stored[0].name}** (Team: ${stored[0].teamName || 'Enterprise'}). Ask me about SLA uptime guarantees, liability caps, or data privacy rules!`,
          citation: stored[0].keyClauses?.[0]?.snippet || 'Section 4: Service Level Agreement',
        },
      ]);
    }
  }, []);

  // Filter documents by Vault and Search query
  const filteredDocuments = documents.filter((doc) => {
    const matchesVault =
      selectedTeamVault === 'all'
        ? true
        : selectedTeamVault === 'my_team'
        ? doc.teamId === user?.teamId || doc.teamId === 'all'
        : doc.teamId === selectedTeamVault || doc.teamId === 'all';

    const matchesSearch =
      !searchDocQuery.trim() ||
      doc.name.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.tags?.some((t) => t.toLowerCase().includes(searchDocQuery.toLowerCase())) ||
      doc.uploadedBy?.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.uploadedByEmployeeId?.toLowerCase().includes(searchDocQuery.toLowerCase());

    return matchesVault && matchesSearch;
  });

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    const updated = [newDoc, ...documents.filter((d) => d.id !== newDoc.id)];
    setDocuments(updated);
    setSelectedDoc(newDoc);
    setDocMessages([
      {
        role: 'assistant',
        content: `I have successfully parsed and indexed **${newDoc.name}** for **${newDoc.teamName}** vault. All ${newDoc.pageCount || 1} pages and clauses are now available for instant semantic search. What would you like to explore?`,
        citation: newDoc.keyClauses?.[0]?.snippet || 'Initial vector indexing complete',
      },
    ]);
  };

  const handleDeleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = documents.filter((d) => d.id !== docId);
    setDocuments(updated);
    saveStoredDocuments(updated);
    if (selectedDoc?.id === docId && updated.length > 0) {
      setSelectedDoc(updated[0]);
    }
  };

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setDocMessages([
      {
        role: 'assistant',
        content: `Context switched to **${doc.name}** (Team Vault: ${doc.teamName || 'Enterprise'}). Ask me about specific clauses, liability terms, or compliance guidelines.`,
        citation: doc.keyClauses?.[0]?.snippet || 'RAG Vector Memory Loaded',
      },
    ]);
  };

  const handleDocChatQuery = async () => {
    if (!docQuery.trim() || isAnswering || !selectedDoc) return;

    const userText = docQuery;
    setDocMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setDocQuery('');
    setIsAnswering(true);

    try {
      const response = await SynapseAIEngine.generateChatResponse(
        userText,
        'synapse-flash-v4',
        [],
        [selectedDoc]
      );

      setDocMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.responseText,
          citation: response.citations?.[0]?.snippet,
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const runComparison = async () => {
    if (!compareDoc1 || !compareDoc2) return;
    const res = await SynapseAIEngine.compareDocuments(compareDoc1, compareDoc2);
    setComparisonResult(res);
  };

  const exportComparisonReport = () => {
    if (!comparisonResult) return;
    const report = `# SYNAPSE CONTRACT COMPARISON & DIFF REPORT
Generated: ${new Date().toLocaleString()}
Document 1: ${comparisonResult.doc1Name}
Document 2: ${comparisonResult.doc2Name}
Similarity Match: ${comparisonResult.similarityScore}%

## Financial Variance
${comparisonResult.financialVariance}

## Risk Variance
${comparisonResult.riskVariance}

## Key Differences Breakdown
${comparisonResult.keyDifferences
  .map(
    (d) => `### ${d.section} [${d.impact} IMPACT]
- Doc 1: ${d.doc1Text}
- Doc 2: ${d.doc2Text}
*Explanation: ${d.explanation}*`
  )
  .join('\n\n')}

## Executive Recommendations
${comparisonResult.recommendations.map((r) => `- ${r}`).join('\n')}`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contract_Comparison_${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Team Vaults & Multi-Document AI Reasoning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Intelligence & Team Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload and query enterprise PDFs, agreements, and specifications scoped by Team Vaults with automated clause extraction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload to Team Vault
          </Button>
          {activeTab === 'compare' && (
            <Button onClick={exportComparisonReport} variant="glow" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export Diff Report
            </Button>
          )}
        </div>
      </div>

      {/* Team Vault Filter Bar */}
      <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTeamVault('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTeamVault === 'all'
                ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Vaults ({documents.length})
          </button>
          <button
            onClick={() => setSelectedTeamVault('my_team')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTeamVault === 'my_team'
                ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>My Team Vault</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-950/60 rounded">
              {user?.teamName?.split(' ')[0] || 'My Team'}
            </span>
          </button>

          {TEAMS_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamVault(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTeamVault === t.id
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.name.split(' ')[0]} Vault
            </button>
          ))}
        </div>

        {/* Search documents input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchDocQuery}
            onChange={(e) => setSearchDocQuery(e.target.value)}
            placeholder="Filter vault documents..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
          />
        </div>
      </div>

      {/* Main Grid: Document Library & Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Document Uploader & Active Documents */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Dropzone Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-synapse-cyan" />
                <span>Upload Document</span>
              </h3>
              <Badge variant="cyan" size="sm">AES-256 RAG</Badge>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full p-4 rounded-xl border border-dashed border-synapse-cyan/40 bg-slate-900/60 hover:bg-slate-900 text-center transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-synapse-cyan/10 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white group-hover:text-synapse-cyan">
                  Upload PDF, DOCX or TXT to Team Vault
                </div>
                <p className="text-[10px] text-slate-400">
                  Instant clause breakdown & vector indexing
                </p>
              </div>
            </button>
          </Card>

          {/* Indexed Document Library */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Vault Documents ({filteredDocuments.length}):
              </span>
              <span className="text-[10px] text-synapse-cyan font-mono">
                {selectedTeamVault === 'all' ? 'All Vaults' : 'Filtered Vault'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto custom-scrollbar">
              {filteredDocuments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No documents found matching the vault filter.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload First Document
                  </Button>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDocument(doc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 group relative ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-synapse-cyan">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="cyan" size="sm">{doc.type.toUpperCase()}</Badge>
                          <button
                            onClick={(e) => handleDeleteDocument(doc.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{doc.summary}</p>

                      {/* Team & Uploader Metadata Row */}
                      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1 truncate max-w-[130px]">
                          <Users className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{doc.teamName || 'All Teams'}</span>
                        </span>
                        <span className="font-mono text-synapse-cyan">
                          {doc.uploadedByEmployeeId || 'EMP-EXEC-001'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Document Workspace (Doc Chat, Clauses, Side-by-Side Compare) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => {
                setActiveTab('chat');
                dispatchCompanionGuide('/documents', {
                  customTitle: 'Document AI Chat',
                  customSpeech: 'Document AI Chat! Ask questions grounded in your selected document with real-time vector citations.',
                  category: 'Doc Chat',
                  speak: true,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Document AI Chat</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('clauses');
                dispatchCompanionGuide('/documents', {
                  customTitle: 'Key Clauses & Summary',
                  customSpeech: 'Key Clauses & Extracted Terms! Review SLA commitments, liability caps, and summary bullet points.',
                  category: 'Clause Extraction',
                  speak: true,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'clauses'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Key Clauses & Summary</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('compare');
                dispatchCompanionGuide('/documents', {
                  customTitle: 'Side-by-Side Comparison',
                  customSpeech: 'Document Comparison Engine! Compare two contract versions side-by-side to highlight differences and modified clauses.',
                  category: 'Diff & Audit',
                  speak: true,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'compare'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Compare Documents</span>
            </button>
          </div>

          {/* TAB 1: Document AI Chat Workspace */}
          {activeTab === 'chat' && (
            <Card className="flex flex-col h-[580px] p-0 overflow-hidden relative border-synapse-cyan/30">
              {/* Doc Header Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-synapse-cyan shrink-0" />
                  <span className="text-sm font-bold text-white truncate max-w-sm">
                    {selectedDoc?.name || 'Select a document'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Badge variant="cyan" size="sm">{selectedDoc?.teamName || 'Enterprise'}</Badge>
                  <span>{selectedDoc?.wordCount?.toLocaleString() || 0} words</span>
                </div>
              </div>

              {/* Chat Conversation Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/40">
                {docMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-purple-600/30 border border-purple-500/40 text-slate-100 rounded-tr-none'
                          : 'glass-panel border-slate-800 text-slate-200 rounded-tl-none bg-slate-900/90'
                      }`}
                    >
                      <MarkdownRenderer content={msg.content} />

                      {msg.citation && (
                        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-synapse-cyan italic">
                          Citation snippet: "{msg.citation}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAnswering && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                    <div className="w-3 h-3 border-2 border-synapse-cyan border-t-transparent rounded-full animate-spin" />
                    <span>Searching loaded document vectors for answer...</span>
                  </div>
                )}
              </div>

              {/* Doc Chat Input */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
                <input
                  type="text"
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDocChatQuery()}
                  placeholder={`Ask anything about ${selectedDoc?.name || 'document'}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                />
                <Button
                  onClick={handleDocChatQuery}
                  disabled={!docQuery.trim() || isAnswering || !selectedDoc}
                  variant="primary"
                  size="sm"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Ask AI
                </Button>
              </div>
            </Card>
          )}

          {/* TAB 2: Key Clauses & Summary */}
          {activeTab === 'clauses' && (
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{selectedDoc?.name}</h3>
                  <Badge variant="cyan">{selectedDoc?.accessLevel || 'TEAM ONLY'}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedDoc?.summary}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                  <span>Vault: <strong className="text-slate-200">{selectedDoc?.teamName}</strong></span>
                  <span>•</span>
                  <span>Uploader: <strong className="text-synapse-cyan">{selectedDoc?.uploadedBy} ({selectedDoc?.uploadedByEmployeeId})</strong></span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Extracted Contractual Clauses ({selectedDoc?.keyClauses?.length || 0}):
                </h4>
                {selectedDoc?.keyClauses?.map((clause, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{clause.title}</h5>
                      <Badge variant={clause.riskLevel === 'HIGH' ? 'rose' : clause.riskLevel === 'MEDIUM' ? 'amber' : 'cyan'}>
                        {clause.riskLevel} RISK
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{clause.snippet}"</p>
                    <span className="text-[10px] text-slate-500 block">{clause.pageOrSection}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Compare Documents Side-by-Side */}
          {activeTab === 'compare' && (
            <Card className="space-y-6">
              {/* Document Selectors Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Baseline Document (v1)</label>
                  <select
                    value={compareDoc1?.id || ''}
                    onChange={(e) => {
                      const doc = documents.find((d) => d.id === e.target.value) || documents[0];
                      setCompareDoc1(doc);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.teamName?.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Target Document (v2)</label>
                  <select
                    value={compareDoc2?.id || ''}
                    onChange={(e) => {
                      const doc = documents.find((d) => d.id === e.target.value) || documents[0];
                      setCompareDoc2(doc);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.teamName?.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Side-by-Side Comparison Results</h3>
                  <p className="text-xs text-slate-400">Identify risk variance, SLA changes, and financial impact</p>
                </div>
                {comparisonResult && (
                  <Badge variant="cyan" size="md">
                    {comparisonResult.similarityScore}% Match Similarity
                  </Badge>
                )}
              </div>

              {/* Differences List */}
              {comparisonResult && (
                <div className="space-y-4">
                  {comparisonResult.keyDifferences.map((diff, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{diff.section}</span>
                        <Badge variant={diff.impact === 'CRITICAL' ? 'rose' : 'amber'}>
                          {diff.impact} VARIANCE
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-lg bg-slate-950 border border-rose-500/20 text-slate-300">
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">Baseline Document:</span>
                          {diff.doc1Text}
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/20 text-slate-300">
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">Updated Document:</span>
                          {diff.doc2Text}
                        </div>
                      </div>

                      <p className="text-xs text-synapse-cyan font-medium pt-1">
                        <strong>AI Analysis:</strong> {diff.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleDocumentUploaded}
        defaultTeamId={(user?.teamId as TeamId) || 'all'}
      />
    </div>
  );
}

