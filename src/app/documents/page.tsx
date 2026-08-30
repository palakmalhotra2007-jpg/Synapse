'use client';

import React, { useState } from 'react';
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
  Paperclip
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { DocumentItem, DocumentComparisonResult } from '@/types/document';
import { sampleDocuments, sampleDocComparison } from '@/lib/mockData/documents';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export default function DocumentIntelligencePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(sampleDocuments);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(sampleDocuments[0]);
  const [activeTab, setActiveTab] = useState<'chat' | 'clauses' | 'compare'>('chat');
  
  // Document AI Chat state
  const [docMessages, setDocMessages] = useState<
    { role: 'user' | 'assistant'; content: string; citation?: string }[]
  >([
    {
      role: 'assistant',
      content: `I am ready to answer any questions about **${sampleDocuments[0].name}**. Ask me about SLA uptime guarantees, liability caps, or data privacy rules!`,
      citation: 'Section 1: Scope of Services'
    }
  ]);
  const [docQuery, setDocQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Side-by-side comparison state
  const [compareDoc2, setCompareDoc2] = useState<DocumentItem>(sampleDocuments[1] || sampleDocuments[0]);
  const [comparisonResult, setComparisonResult] = useState<DocumentComparisonResult | null>(sampleDocComparison);

  const handleDocumentUpload = (file: File) => {
    const newDoc: DocumentItem = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: 'pdf',
      uploadedAt: new Date().toISOString(),
      pageCount: 12,
      wordCount: 4200,
      summary: `User uploaded document ${file.name} indexed into Synapse Document Vector Engine for instant AI Chat & key clause extraction.`,
      content: 'Uploaded file contents indexed for RAG vector lookup.',
      keyClauses: [
        {
          type: 'obligation',
          title: 'Custom User Upload Clause',
          snippet: 'Key obligations parsed from user uploaded document.',
          pageOrSection: 'Section 1',
          riskLevel: 'LOW'
        }
      ]
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
  };

  const handleDocChatQuery = async () => {
    if (!docQuery.trim() || isAnswering) return;

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
          citation: response.citations?.[0]?.snippet
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Multi-Document AI Chat & Clause Extraction</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Document Intelligence & AI Q&A
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload PDFs, agreements, and reports to chat directly with documents, extract key clauses, or compare files side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="cyan" size="md">
            RAG Document Chat Active
          </Badge>
        </div>
      </div>

      {/* Main Grid: Document Library & Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Document Uploader & Active Documents */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-synapse-cyan" />
              <span>Upload Document for AI Chat</span>
            </h3>

            <FileDropzone
              onFileSelect={handleDocumentUpload}
              acceptTypes=".pdf, .docx, .txt, .csv, .md"
              label="Drop PDF or DOCX file to chat"
              sublabel="Instant vector embedding & clause breakdown"
            />
          </Card>

          {/* Indexed Document Library */}
          <Card className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Indexed Documents ({documents.length}):
            </span>
            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedDoc.id === doc.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100 truncate max-w-[200px]">
                      {doc.name}
                    </h4>
                    <Badge variant="cyan" size="sm">{doc.type.toUpperCase()}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{doc.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Document Workspace (Doc Chat, Clauses, Side-by-Side Compare) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Document AI Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('clauses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'clauses'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Key Clauses & Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
              <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-synapse-cyan" />
                  <span className="text-sm font-bold text-white truncate max-w-xs">{selectedDoc.name}</span>
                </div>
                <span className="text-xs text-slate-400">{selectedDoc.wordCount?.toLocaleString()} words</span>
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
                          : 'glass-panel border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

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
                  placeholder={`Ask anything about ${selectedDoc.name}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
                />
                <Button
                  onClick={handleDocChatQuery}
                  disabled={!docQuery.trim() || isAnswering}
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
                <h3 className="text-base font-bold text-white">{selectedDoc.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedDoc.summary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Extracted Contractual Clauses:
                </h4>
                {selectedDoc.keyClauses?.map((clause, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white">{clause.title}</h5>
                      <Badge variant={clause.riskLevel === 'HIGH' ? 'rose' : 'cyan'}>
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
          {activeTab === 'compare' && comparisonResult && (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Side-by-Side Document Comparison</h3>
                  <p className="text-xs text-slate-400">Identify risk variance, SLA changes, and financial impact between 2 files</p>
                </div>
                <Badge variant="cyan" size="md">
                  {comparisonResult.similarityScore}% Match Similarity
                </Badge>
              </div>

              {/* Differences List */}
              <div className="space-y-4">
                {comparisonResult.keyDifferences.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{diff.section}</span>
                      <Badge variant={diff.impact === 'CRITICAL' ? 'rose' : 'amber'}>
                        {diff.impact} VARIANCE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
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
                      💡 <strong>AI Analysis:</strong> {diff.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
