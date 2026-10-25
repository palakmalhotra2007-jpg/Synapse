'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
} from '@/components/ui/Modal';
import {
  Bot,
  Send,
  Paperclip,
  Sparkles,
  FileText,
  Trash2,
  Plus,
  Layers,
  Cpu,
  Brain,
  Shield,
  UploadCloud,
  CheckCircle2,
  Copy,
  Download,
  MessageSquare,
  User,
  Camera,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  X,
  ChevronRight,
  Eye,
  Scan,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { useAuth } from '@/lib/firebase/authContext';
import { ChatMessage, AIModelId } from '@/types/workspace';
import { DocumentItem } from '@/types/document';
import { getStoredDocuments } from '@/lib/mockData/documents';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import {
  SynapseVisionEngine,
  ImageKnowledgeResponse,
} from '@/lib/ai/visionEngine';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { dispatchCompanionGuide } from '@/lib/ai/companionGuide';

interface UnifiedAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection';
}

const presetTestImages = [
  {
    id: 'preset-chart',
    title: 'H1 2026 Enterprise Revenue & Telemetry.svg',
    category: 'Revenue Growth Chart',
    mode: 'chart_understanding' as const,
    url: '/test-assets/q2_revenue_chart.svg',
    prompt: 'Explain this graph and calculate revenue growth velocity.',
  },
  {
    id: 'preset-architecture',
    title: 'Synapse Enterprise AI Cloud Infrastructure.svg',
    category: 'Cloud Topology & System',
    mode: 'image_search' as const,
    url: '/test-assets/cloud_architecture_diagram.svg',
    prompt: 'Analyze this topology diagram and list all microservices and database nodes.',
  },
  {
    id: 'preset-dup',
    title: 'Vendor Contract Wire Authorization Scan.svg',
    category: 'Contract & Forgery Scan',
    mode: 'duplicate_detection' as const,
    url: '/test-assets/vendor_invoice_scan.svg',
    prompt: 'Check if this image is a duplicate or contains altered signatures.',
  },
];

export const UnifiedAIChatModal: React.FC<UnifiedAIChatModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'chat',
}) => {
  const { user, executionMode, setExecutionMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'vision'>(
    initialMode === 'chat' ? 'chat' : 'vision'
  );
  const [visionMode, setVisionMode] = useState<'image_search' | 'chart_understanding' | 'duplicate_detection'>(
    initialMode === 'chat' ? 'image_search' : initialMode
  );

  // Trigger guide speech when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'chat') {
        dispatchCompanionGuide('chat', { speak: true });
      } else {
        dispatchCompanionGuide(visionMode, { speak: true });
      }
    }
  }, [isOpen, activeTab, visionMode]);

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'assistant',
      content: `Hello ${user?.displayName?.split(' ')[0] || ''}. I am your Synapse Enterprise AI Assistant.

I can assist you with:
- Universal Document RAG: Ask questions grounded in company PDFs, contracts, and datasets.
- Chart & Graph Analytics: Parse bar graphs, line charts, and metric growth rates.
- Duplicate & Tamper Detection: Detect modified signatures, invoices, and image duplicates.

How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'synapse-flash-v4',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelId>('synapse-flash-v4');
  const [attachedDocs, setAttachedDocs] = useState<DocumentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allDocs, setAllDocs] = useState<DocumentItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Vision States
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(presetTestImages[0].url);
  const [selectedImageName, setSelectedImageName] = useState<string>(presetTestImages[0].title);
  const [visionPrompt, setVisionPrompt] = useState(presetTestImages[0].prompt);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionResponse, setVisionResponse] = useState<ImageKnowledgeResponse | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAllDocs(getStoredDocuments());
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

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
        attachedDocs,
        executionMode
      );

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
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageUrl(reader.result as string);
      setSelectedImageName(file.name);
      setVisionResponse(null);
      setActiveTab('vision');
      if (visionMode === 'chart_understanding') {
        setVisionPrompt('Explain this chart and calculate growth percentages.');
      } else if (visionMode === 'duplicate_detection') {
        setVisionPrompt('Check for duplicate or modified versions in the vault.');
      } else {
        setVisionPrompt('What components and structural elements are visible?');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionAnalysis = async () => {
    if (!selectedImageUrl) return;
    setIsAnalyzingVision(true);
    try {
      if (visionMode === 'chart_understanding') {
        const res = await SynapseVisionEngine.analyzeChart(selectedImageName, selectedImageUrl);
        setVisionResponse(res);
      } else if (visionMode === 'duplicate_detection') {
        const res = await SynapseVisionEngine.detectSimilarImages(selectedImageName, selectedImageUrl);
        setVisionResponse(res);
      } else {
        const res = await SynapseVisionEngine.analyzeImage(selectedImageName, visionPrompt, selectedImageUrl);
        setVisionResponse(res);
      }
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Synapse AI Assistant & Multi-Modal Intelligence"
      maxWidth="5xl"
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-sky-500 text-white shadow-xs border border-sky-600'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Universal Document RAG & Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('vision')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'vision'
                  ? 'bg-sky-500 text-white shadow-xs border border-sky-600'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Deep Learning Vision & Charts</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="cyan" size="sm">
              {allDocs.length} Docs Available
            </Badge>
          </div>
        </div>

        {/* TAB 1: Chat & Universal Document RAG */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* Conversation Messages Container */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 min-h-[340px] max-h-[420px] overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((msg) => {
                const isAi = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 relative group shadow-2xs ${
                        isAi
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          : 'bg-sky-500 text-white border border-sky-600 rounded-tr-none'
                      }`}
                    >
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-200/60">
                          {msg.attachments.map((att, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${
                                isAi
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-sky-600 text-white border-sky-400'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>{att.name}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <MarkdownRenderer content={msg.content} />

                      {/* RAG Citations */}
                      {msg.ragCitations && msg.ragCitations.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            <span>Grounded Document Sources ({msg.ragCitations.length}):</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.ragCitations.map((cit, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1"
                              >
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span className="font-bold text-slate-900 truncate max-w-[160px]">
                                    {cit.documentTitle}
                                  </span>
                                  <span className="text-emerald-600 font-mono font-bold">
                                    {(cit.relevanceScore * 100).toFixed(0)}% Match
                                  </span>
                                </div>
                                <p className="italic text-[10px] text-slate-500 line-clamp-2">
                                  "{cit.snippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-sky-600 transition-all cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
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
                      <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 mt-0.5 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <Bot className="w-4 h-4 animate-pulse text-sky-600" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                    <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    <span>Synapse is synthesizing response across employee documents...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Attached Context Documents Chips */}
            {attachedDocs.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Attached Context:
                </span>
                {attachedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 shrink-0 shadow-2xs"
                  >
                    <FileText className="w-3 h-3 text-sky-600" />
                    <span className="truncate max-w-[140px] font-semibold">{doc.name}</span>
                    <button
                      onClick={() => setAttachedDocs(attachedDocs.filter((d) => d.id !== doc.id))}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar with Document & Image Attachments */}
            <div className="relative flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setAttachedDocs((prev) => [
                      ...prev,
                      {
                        id: `doc-${Date.now()}`,
                        name: f.name,
                        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                        type: 'pdf',
                        uploadedAt: new Date().toISOString(),
                        vaultId: 'my_team',
                        classification: 'INTERNAL RESTRICTED',
                        securityLevel: 'Level 1 Standard',
                        status: 'READY',
                        content: 'Uploaded file contents indexed for RAG vector search.',
                      },
                    ]);
                  }
                }}
                className="hidden"
              />

              <input
                ref={imageInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="absolute left-2.5 flex items-center gap-1 z-10">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Attach Document / PDF for RAG"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Upload Image / Chart for Deep Learning Vision"
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
                placeholder="Ask anything about enterprise documents, policies, or code..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-20 pr-14 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 resize-none custom-scrollbar shadow-2xs"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputPrompt.trim() || isGenerating}
                className="absolute right-3 p-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Deep Learning Vision, Charts & Duplicates */}
        {activeTab === 'vision' && (
          <div className="space-y-4">
            {/* Sub Mode Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setVisionMode('image_search');
                  setVisionPrompt('Analyze this system topology and microservices diagram.');
                  dispatchCompanionGuide('image_search', { speak: true });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  visionMode === 'image_search'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Image Knowledge Search</span>
              </button>

              <button
                onClick={() => {
                  setVisionMode('chart_understanding');
                  setVisionPrompt('Explain this chart and calculate revenue growth velocity.');
                  dispatchCompanionGuide('chart_understanding', { speak: true });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  visionMode === 'chart_understanding'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Chart & Graph Understanding</span>
              </button>

              <button
                onClick={() => {
                  setVisionMode('duplicate_detection');
                  setVisionPrompt('Check if this image is a duplicate or contains altered signatures.');
                  dispatchCompanionGuide('duplicate_detection', { speak: true });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  visionMode === 'duplicate_detection'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate & Similar Image Search</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sample Test Scans:
              </span>
              {presetTestImages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedImageUrl(p.url);
                    setSelectedImageName(p.title);
                    setVisionPrompt(p.prompt);
                    setVisionMode(p.mode);
                    setVisionResponse(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    selectedImageName === p.title
                      ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.category}
                </button>
              ))}
            </div>

            {/* Vision Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Image Preview & Upload Dropzone */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center shadow-2xs">
                  {selectedImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedImageUrl}
                      alt={selectedImageName}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span>No image selected</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-white/95 backdrop-blur border border-slate-200 flex items-center justify-between text-[11px] shadow-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[220px]">
                      {selectedImageName}
                    </span>
                    <Badge variant="cyan" size="sm">
                      {visionMode.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <FileDropzone
                  onFileSelect={handleImageFileUpload}
                  acceptTypes=".png, .jpg, .jpeg, .webp"
                  label="Drop image, chart, or machine photo"
                  sublabel="PNG, JPEG, WebP supported for deep learning analysis"
                />
              </div>

              {/* Vision Prompt & Results */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ask Deep Learning Vision Engine:
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                      placeholder="e.g. 'What components are visible?' or 'Explain this graph.'"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 pr-12 shadow-2xs"
                    />
                    <button
                      onClick={handleRunVisionAnalysis}
                      disabled={isAnalyzingVision}
                      className="absolute right-1.5 p-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg hover:shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Results Panel */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 min-h-[200px] max-h-[260px] overflow-y-auto custom-scrollbar shadow-2xs">
                    {isAnalyzingVision ? (
                      <div className="h-40 flex flex-col items-center justify-center space-y-2 text-center">
                        <div className="w-7 h-7 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-500">
                          Computing deep learning visual features...
                        </span>
                      </div>
                    ) : visionResponse ? (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>{visionResponse.title}</span>
                          </h4>
                          <Badge variant="emerald" size="sm">
                            Analyzed
                          </Badge>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {visionResponse.description}
                        </p>

                        {/* Chart Metrics */}
                        {visionResponse.chartData && (
                          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                              Extracted Monthly Trend Velocities:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {visionResponse.chartData.extractedMetrics.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-[10px]"
                                >
                                  <span className="text-slate-500 block truncate">{m.label}</span>
                                  <div className="flex items-baseline justify-between mt-0.5">
                                    <strong className="text-slate-900">{m.value}</strong>
                                    {m.changePercent && (
                                      <span
                                        className={`font-bold ${
                                          m.changePercent > 0 ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                      >
                                        {m.changePercent > 0 ? `+${m.changePercent}%` : `${m.changePercent}%`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Visual Components */}
                        {visionResponse.visualComponents && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                              Identified Visual Components:
                            </span>
                            {visionResponse.visualComponents.map((c) => (
                              <div
                                key={c.id}
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between"
                              >
                                <span className="font-semibold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                                  {c.confidence}% Match
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Similar Images */}
                        {visionResponse.similarMatches && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                              Duplicate & Altered Image Matches:
                            </span>
                            {visionResponse.similarMatches.map((m) => (
                              <div
                                key={m.id}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                                    {m.title}
                                  </span>
                                  <Badge variant={m.similarityScore > 90 ? 'rose' : 'amber'} size="sm">
                                    {m.similarityScore}% Match
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-slate-500">{m.varianceDetails}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-36 flex flex-col items-center justify-center space-y-1.5 text-center text-slate-400">
                        <Sparkles className="w-5 h-5 text-sky-500/60" />
                        <span>Click "Run Deep Learning Vision" to analyze this scan</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleRunVisionAnalysis}
                  isLoading={isAnalyzingVision}
                  variant="primary"
                  className="w-full"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Run Deep Learning Vision
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
