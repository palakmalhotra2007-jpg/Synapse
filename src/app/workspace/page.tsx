'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Paperclip,
  Sparkles,
  FileText,
  Trash2,
  Plus,
  Layers,
  ChevronDown,
  Cpu,
  Brain,
  Shield,
  UploadCloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  MessageSquare,
  Coins,
  User,
  RefreshCw,
  Camera,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { useAuth } from '@/lib/firebase/authContext';
import { ChatMessage, AIModelId, AIModelSpec, SystemPromptPreset, ConversationSession } from '@/types/workspace';
import { DocumentItem } from '@/types/document';
import { getStoredDocuments } from '@/lib/mockData/documents';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { ImageVisionModal } from '@/components/vision/ImageVisionModal';
import { TEAMS_LIST } from '@/lib/auth/usersDb';
import { TeamId } from '@/types/dashboard';
import { generateChatHistoryReport } from '@/lib/utils/pdfGenerator';


const models: AIModelSpec[] = [
  {
    id: 'synapse-flash-v4',
    name: 'Synapse Flash v4',
    badge: 'Ultra Fast',
    description: 'Low-latency high throughput reasoning engine for real-time interaction.',
    contextWindow: '128k',
    iconName: 'Zap',
  },
  {
    id: 'synapse-pro-reasoning',
    name: 'Synapse Pro Reasoning',
    badge: 'Deep Logic',
    description: 'Complex multi-step chain-of-thought engine for enterprise strategic analysis.',
    contextWindow: '1M',
    iconName: 'Brain',
  },
  {
    id: 'synapse-vision-multimodal',
    name: 'Synapse Vision Multimodal',
    badge: 'Vision AI',
    description: 'Multimodal model capable of parsing diagrams, charts, and document layouts.',
    contextWindow: '256k',
    iconName: 'Cpu',
  },
  {
    id: 'synapse-financial-analyst',
    name: 'Synapse Financial Analyst',
    badge: 'Finance RAG',
    description: 'Trained specifically on financial ledgers, audit logs, and fraud vectoring.',
    contextWindow: '512k',
    iconName: 'Shield',
  },
];

const promptPresets: SystemPromptPreset[] = [
  {
    id: 'p1',
    title: 'Financial Fraud Auditor',
    description: 'Analyze transactions for velocity surges and geo-mismatches.',
    prompt: 'Acts as a senior financial audit bot. Identify potential fraud risks in transaction data.',
    category: 'finance',
  },
  {
    id: 'p2',
    title: 'Executive Summarizer',
    description: 'Distill documents into key decisions and action items.',
    prompt: 'Summarize the input text into executive bullet points, key decisions, and risks.',
    category: 'summary',
  },
  {
    id: 'p3',
    title: 'Code Architect & Security',
    description: 'Review system architecture and Firestore security rules.',
    prompt: 'Review architecture for optimal Next.js, Cloud Run, and Firebase security.',
    category: 'code',
  },
  {
    id: 'p4',
    title: 'Contract SLA Evaluator',
    description: 'Extract uptime commitments, penalties, and liability limits.',
    prompt: 'Evaluate the attached agreement for uptime SLA clauses, service credits, and liability caps.',
    category: 'finance',
  },
];

const initialSessions: ConversationSession[] = [
  {
    id: 'sess-1',
    title: 'Executive RAG & Cloud Scaling Strategy',
    createdAt: '2026-09-05T08:30:00Z',
    updatedAt: '2026-09-05T08:30:00Z',
    messageCount: 3,
    tags: ['Strategy', 'Compute'],
    pinned: true,
  },
  {
    id: 'sess-2',
    title: 'Offshore Fraud Risk Inquest',
    createdAt: '2026-09-04T15:20:00Z',
    updatedAt: '2026-09-04T15:20:00Z',
    messageCount: 5,
    tags: ['Fraud', 'AML'],
  },
];

export default function AIWorkspacePage() {
  const { deductTokens, user } = useAuth();
  const [sessions, setSessions] = useState<ConversationSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-1');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: `Hello! I'm **Synapse Multi-Modal AI**, your intelligent workspace companion.

Here is what I can do for you:
- **Image-Based Knowledge Search**: Upload machine/hardware images or technical diagrams and ask *"What components are visible?"*
- **Automatic Chart & Graph Understanding**: Upload bar graphs, pie charts, or dashboards and get growth percentages & trend analysis.
- **Duplicate & Similar Image Detection**: Perceptual hash comparisons to detect forged signatures, modified contracts, or duplicate graphics.
- **Universal Document RAG**: Ask questions grounded in all employee-uploaded PDFs, spreadsheets, and policies.

Click the quick-launch chips above or upload an image/document below to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'synapse-flash-v4',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('synapse-flash-v4');
  const selectedModelSpec = models.find((m) => m.id === selectedModel) || models[0];
  const [attachedDocs, setAttachedDocs] = useState<DocumentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [allDocs, setAllDocs] = useState<DocumentItem[]>([]);
  const [kbTeamFilter, setKbTeamFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [visionModalMode, setVisionModalMode] = useState<'image_search' | 'chart_understanding' | 'duplicate_detection'>('image_search');

  const openVisionModalWithMode = (mode: 'image_search' | 'chart_understanding' | 'duplicate_detection') => {
    setVisionModalMode(mode);
    setIsVisionModalOpen(true);
  };


  useEffect(() => {
    setAllDocs(getStoredDocuments());
  }, []);

  const filteredKbDocs = allDocs.filter((doc) => {
    if (kbTeamFilter === 'all') return true;
    if (kbTeamFilter === 'my_team') return doc.teamId === user?.teamId || doc.teamId === 'all';
    return doc.teamId === kbTeamFilter || doc.teamId === 'all';
  });

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setAllDocs((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    if (!attachedDocs.some((d) => d.id === newDoc.id)) {
      setAttachedDocs((prev) => [...prev, newDoc]);
    }
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Simulated streaming typewriter effect
  const streamResponse = async (fullText: string, messageId: string, model: AIModelId, citations?: any[]) => {
    const words = fullText.split(' ');
    let currentText = '';
    const initialAiMsg: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: model,
      ragCitations: citations,
    };

    setMessages((prev) => [...prev, initialAiMsg]);

    const chunkSize = Math.max(2, Math.floor(words.length / 25));
    for (let i = 0; i < words.length; i += chunkSize) {
      currentText = words.slice(0, i + chunkSize).join(' ');
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: currentText } : msg))
      );
      await new Promise((r) => setTimeout(r, 25));
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, content: fullText } : msg))
    );
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isGenerating) return;

    const userPromptText = inputPrompt;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedDocs.map((d) => ({ name: d.name, type: d.type, size: d.size })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const result = await SynapseAIEngine.generateChatResponse(
        userPromptText,
        selectedModel,
        messages,
        attachedDocs
      );

      // Deduct tokens
      if (result.tokensConsumed) {
        deductTokens(result.tokensConsumed);
      }

      const aiMsgId = `ai-${Date.now()}`;
      await streamResponse(result.responseText, aiMsgId, selectedModel, result.citations);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your query. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewThread = () => {
    const newSession: ConversationSession = {
      id: `sess-${Date.now()}`,
      title: `Conversation ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
      tags: ['General'],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content: `Hello! I've started a new chat thread for you. How can I help you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id && remaining.length > 0) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'csv',
        uploadedAt: new Date().toISOString(),
        vaultId: 'my_team',
        classification: 'INTERNAL RESTRICTED',
        securityLevel: 'Level 1 Standard',
        status: 'READY',
        content: 'Uploaded file contents indexed for RAG vector search.',
      };
      setAttachedDocs((prev) => [...prev, newDoc]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportChatHistory = () => {
    const activeSessionObj = sessions.find((s) => s.id === activeSessionId);
    generateChatHistoryReport({
      sessionTitle: activeSessionObj?.title || 'AI Workspace Chat',
      messages,
    });
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-slate-50">
      {/* Left Chat Threads Sidebar */}
      <div className="w-64 border-r border-slate-200/80 bg-white p-4 hidden lg:flex flex-col space-y-4 shrink-0 shadow-xs">
        <Button
          onClick={handleCreateNewThread}
          variant="primary"
          size="sm"
          className="w-full"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Conversation
        </Button>

        <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-2">
            Recent Threads ({sessions.length}):
          </span>
          {sessions.map((sess) => {
            const isActive = activeSessionId === sess.id;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-sky-50 border-sky-200 text-sky-900 font-bold shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="text-xs truncate">{sess.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteThread(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                  title="Delete thread"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Model Spec Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Active Model:</span>
            <span className="font-bold text-sky-700">{selectedModelSpec.name}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Context Window:</span>
            <span className="font-mono text-slate-900 font-bold">{selectedModelSpec.contextWindow}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Available Tokens:</span>
            <span className="font-mono text-amber-600 font-bold">
              {user?.tokenBalance ? (user.tokenBalance / 1000).toFixed(0) + 'k' : '850k'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Main Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/60">
        {/* Top Control Bar */}
        <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none shrink-0 shadow-xs">
          {/* Model Selector Dropdown & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline font-medium">Engine:</span>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AIModelId)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Vision Feature Action Badges */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={() => openVisionModalWithMode('image_search')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[11px] font-bold text-sky-700 flex items-center gap-1.5 transition-all shadow-xs"
                title="Upload machine / board image to extract visible components"
              >
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden md:inline">Image Search</span>
              </button>

              <button
                onClick={() => openVisionModalWithMode('chart_understanding')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[11px] font-bold text-purple-700 flex items-center gap-1.5 transition-all shadow-xs"
                title="Upload bar graphs, pie charts, and dashboards to calculate trends"
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Chart AI</span>
              </button>

              <button
                onClick={() => openVisionModalWithMode('duplicate_detection')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold text-rose-700 flex items-center gap-1.5 transition-all shadow-xs"
                title="Check perceptual image hash and vault duplicates"
              >
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden md:inline">Duplicate Scan</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-700">
              <Sparkles className="w-3 h-3 text-sky-600 animate-pulse" />
              <span>Universal RAG Brain ({allDocs.length} Docs Indexed)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportChatHistory}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="hidden sm:flex text-xs"
            >
              Export Chat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMessages([])}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </div>


        {/* Conversation Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-xs shrink-0 mt-0.5">
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-sky-600 border border-sky-100">
                      <Bot className="w-5 h-5" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed space-y-3 relative group ${
                    isAi
                      ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                      : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-xs font-medium'
                  }`}
                >
                  {/* Attached docs tag in user query */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/20">
                      {msg.attachments.map((att, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${
                            isAi
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-white/20 text-white border-white/30'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{att.name}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <MarkdownRenderer content={msg.content} />

                  {/* RAG Citations Accordion */}
                  {msg.ragCitations && msg.ragCitations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                      <span className="text-[11px] font-bold text-sky-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                        <span>Grounded Knowledge Base Citations ({msg.ragCitations.length} sources):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.ragCitations.map((cit, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5 hover:border-sky-300 transition-colors shadow-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="font-bold text-slate-900 flex items-center gap-1 truncate max-w-[170px]" title={cit.documentTitle}>
                                <FileText className="w-3 h-3 text-sky-600 shrink-0" />
                                <span className="truncate">{cit.documentTitle}</span>
                              </span>
                              <span className="text-emerald-600 font-mono font-bold shrink-0 ml-1">
                                {(cit.relevanceScore * 100).toFixed(0)}% match
                              </span>
                            </div>
                            {cit.uploadedBy && (
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                                <span>Uploaded by: <strong className="text-slate-700">{cit.uploadedBy}</strong></span>
                                {cit.teamName && (
                                  <span className="text-purple-600 font-mono">({cit.teamName.split(' ')[0]})</span>
                                )}
                              </div>
                            )}
                            <p className="text-[11px] italic text-slate-600 line-clamp-2 bg-white p-2 rounded-lg border border-slate-200/80">
                              "{cit.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Action & Timestamp */}
                  <div className={`flex items-center justify-between pt-1 text-[10px] ${isAi ? 'text-slate-400' : 'text-sky-100'}`}>
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all ${
                        isAi ? 'hover:text-sky-600 text-slate-400' : 'hover:text-white text-sky-100'
                      }`}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!isAi && (
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-4 justify-start animate-in fade-in">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span>Synapse is synthesizing response & reasoning over RAG context...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Box */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white/90 backdrop-blur">
          {/* Attached Document Chips */}
          {attachedDocs.length > 0 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Context RAG Docs:
              </span>
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 shrink-0 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span className="truncate max-w-[150px] font-medium">{doc.name}</span>
                  <span className="text-[9px] text-purple-600 font-mono">({doc.teamName?.split(' ')[0] || 'Team'})</span>
                  <button
                    onClick={() => setAttachedDocs(attachedDocs.filter((d) => d.id !== doc.id))}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="absolute left-2.5 flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-slate-100 transition-colors"
                title="Attach Document / Dataset for RAG"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                onClick={() => openVisionModalWithMode('image_search')}
                className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-slate-100 transition-colors"
                title="Upload Image for Deep Learning Vision Analysis (Machines, Charts, Duplicate Scan)"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything (e.g. 'explain circuit board', 'what is in this chart', 'write code', or say 'hi')..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-20 pr-14 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs resize-none custom-scrollbar"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputPrompt.trim() || isGenerating}
              className="absolute right-3 p-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: System Prompts & RAG Library */}
      <div className="w-80 border-l border-slate-200/80 bg-white p-5 hidden xl:flex flex-col space-y-6 overflow-y-auto custom-scrollbar shrink-0 shadow-xs">
        {/* Preset Prompts */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Prompt Presets</span>
          </h4>
          <div className="space-y-2">
            {promptPresets.map((p) => (
              <div
                key={p.id}
                onClick={() => setInputPrompt(p.prompt)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white hover:border-sky-300 border border-slate-200/80 cursor-pointer transition-all group shadow-xs"
              >
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                  {p.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base RAG Library Scoped by Team */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Team RAG Vaults</span>
            </h4>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-[10px] text-sky-700 hover:underline font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Upload</span>
            </button>
          </div>

          {/* Vault Filter Selector */}
          <select
            value={kbTeamFilter}
            onChange={(e) => setKbTeamFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 font-medium focus:outline-none focus:border-sky-500 shadow-xs"
          >
            <option value="all">All Vault Documents</option>
            <option value="my_team">My Team ({user?.teamName?.split(' ')[0] || 'My Team'})</option>
            {TEAMS_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.split(' ')[0]} Vault
              </option>
            ))}
          </select>

          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
            {filteredKbDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (!attachedDocs.some((d) => d.id === doc.id)) {
                    setAttachedDocs([...attachedDocs, doc]);
                  }
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-white hover:border-purple-300 border border-slate-200/80 cursor-pointer transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-semibold text-slate-800 truncate group-hover:text-sky-700">
                    {doc.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span className="text-purple-600 font-medium truncate">{doc.teamName?.split(' ')[0]}</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleDocumentUploaded}
        defaultVaultId="my_team"
      />

      {/* Image Vision, Chart & Duplicate Detection Modal */}
      <ImageVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        initialMode={visionModalMode}
      />
    </div>
  );
}

