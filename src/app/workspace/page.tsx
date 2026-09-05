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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import { ChatMessage, AIModelId, AIModelSpec, SystemPromptPreset, ConversationSession } from '@/types/workspace';
import { DocumentItem } from '@/types/document';
import { sampleDocuments } from '@/lib/mockData/documents';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

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
      content: `### ⚡ Synapse AI Intelligence Workspace Active

Welcome to the **Synapse RAG & Multimodal AI Studio**. You can ask complex enterprise queries, upload PDF/CSV documents for semantic RAG lookup, or select specialized neural models.

How can I assist your productivity workflow today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'synapse-flash-v4',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('synapse-flash-v4');
  const [attachedDocs, setAttachedDocs] = useState<DocumentItem[]>([sampleDocuments[0]]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedDocs.map((d) => ({ name: d.name, type: d.type, size: d.size })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const result = await SynapseAIEngine.generateChatResponse(
        userMsg.content,
        selectedModel,
        messages,
        attachedDocs
      );

      // Deduct tokens from user balance
      if (result.tokensConsumed) {
        deductTokens(result.tokensConsumed);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        ragCitations: result.citations,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
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
        content: `### ⚡ New Synapse AI Thread Initialized\n\nReady for your enterprise query with **${selectedModel.toUpperCase()}**.`,
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
        type: file.name.endsWith('.pdf') ? 'pdf' : 'csv',
        uploadedAt: new Date().toISOString(),
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
    const chatText = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()} (${m.modelUsed || 'user'}):\n${m.content}\n`)
      .join('\n---\n\n');

    const blob = new Blob([chatText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synapse_Chat_Export_${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex overflow-hidden">
      {/* Left Chat Threads Sidebar */}
      <div className="w-64 border-r border-slate-800/80 bg-slate-950/80 p-4 hidden lg:flex flex-col space-y-4 shrink-0">
        <Button
          onClick={handleCreateNewThread}
          variant="primary"
          size="sm"
          className="w-full"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Conversation
        </Button>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
            Recent Threads ({sessions.length}):
          </span>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => setActiveSessionId(sess.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeSessionId === sess.id
                  ? 'bg-synapse-cyan/15 border-synapse-cyan/40 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-synapse-cyan" />
                <span className="text-xs font-semibold truncate max-w-[130px]">{sess.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteThread(sess.id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                title="Delete thread"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Token Balance Footer */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Balance:</span>
          </div>
          <span className="font-bold text-synapse-cyan">
            {user?.tokenBalance ? user.tokenBalance.toLocaleString() : '850,000'}
          </span>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/60 relative min-w-0">
        {/* Model Bar Header */}
        <div className="h-14 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Model:</span>
            <div className="flex items-center gap-2 shrink-0">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    selectedModel === m.id
                      ? 'bg-synapse-cyan/15 border-synapse-cyan text-synapse-cyan shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportChatHistory}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Export Conversation"
            >
              <Download className="w-4 h-4" />
            </button>
            <Badge variant="purple" size="sm" className="hidden sm:inline-flex">
              RAG Vector Active
            </Badge>
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                    : 'bg-synapse-cyan/10 border border-synapse-cyan/40 text-synapse-cyan shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                }`}
              >
                {msg.role === 'user' ? <Paperclip className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Bubble Body */}
              <div className="space-y-2 max-w-2xl min-w-0">
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600/20 border-purple-500/40 text-slate-100 rounded-tr-none'
                      : 'glass-panel border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>

                  {/* RAG Citation Box */}
                  {msg.ragCitations && msg.ragCitations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-synapse-cyan uppercase tracking-wider block">
                        RAG Knowledge Citations ({msg.ragCitations.length})
                      </span>
                      {msg.ragCitations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-synapse-cyan">{cite.documentTitle}</span>
                            <span className="text-[10px] text-slate-400">Score: {(cite.relevanceScore * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">"{cite.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer timestamp & copy */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span>• {msg.modelUsed}</span>}
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="hover:text-slate-300 transition-colors ml-2"
                  >
                    {copiedId === msg.id ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Thinking Spinner */}
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 rounded-2xl glass-panel border-slate-800 max-w-sm">
              <div className="w-4 h-4 border-2 border-synapse-cyan border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-300 font-medium animate-pulse">
                Synapse Neural Engine computing reasoning chain...
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          {/* Attached Document Chips */}
          {attachedDocs.length > 0 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Context RAG Docs:
              </span>
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-synapse-cyan" />
                  <span className="truncate max-w-[150px]">{doc.name}</span>
                  <button
                    onClick={() => setAttachedDocs(attachedDocs.filter((d) => d.id !== doc.id))}
                    className="text-slate-500 hover:text-rose-400"
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
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-3 p-2 text-slate-400 hover:text-synapse-cyan rounded-xl hover:bg-slate-800 transition-colors"
              title="Attach Document / Dataset for RAG"
            >
              <Paperclip className="w-5 h-5" />
            </button>

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
              placeholder="Ask anything about financial fraud ledgers, document SLAs, or strategic decisions..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-14 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50 focus:ring-1 focus:ring-synapse-cyan/30 resize-none custom-scrollbar"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputPrompt.trim() || isGenerating}
              className="absolute right-3 p-2 bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: System Prompts & RAG Library */}
      <div className="w-80 border-l border-slate-800/80 bg-slate-950/80 p-5 hidden xl:flex flex-col space-y-6 overflow-y-auto custom-scrollbar shrink-0">
        {/* Preset Prompts */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-synapse-cyan" />
            <span>Prompt Presets</span>
          </h4>
          <div className="space-y-2">
            {promptPresets.map((p) => (
              <div
                key={p.id}
                onClick={() => setInputPrompt(p.prompt)}
                className="p-3 rounded-xl glass-panel hover:border-synapse-cyan/40 cursor-pointer transition-all border border-slate-800/80 group"
              >
                <h5 className="text-xs font-bold text-slate-200 group-hover:text-synapse-cyan transition-colors">
                  {p.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Sample RAG Documents */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Knowledge Base RAG Library</span>
          </h4>
          <div className="space-y-2">
            {sampleDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (!attachedDocs.some((d) => d.id === doc.id)) {
                    setAttachedDocs([...attachedDocs, doc]);
                  }
                }}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-semibold text-slate-200 truncate max-w-[170px]">
                    {doc.name}
                  </h5>
                  <span className="text-[10px] text-slate-500">{doc.size}</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400 hover:text-synapse-cyan" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
