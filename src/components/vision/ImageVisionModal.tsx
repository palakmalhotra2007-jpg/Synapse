'use client';

import React, { useState } from 'react';
import {
  Modal,
} from '@/components/ui/Modal';
import {
  Camera,
  BarChart3,
  Copy,
  UploadCloud,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Layers,
  Search,
  Maximize2,
  Cpu,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileDropzone } from '@/components/ui/FileDropzone';
import {
  SynapseVisionEngine,
  ImageKnowledgeResponse,
  DetectedVisualComponent,
  ChartAnalysisResult,
  SimilarImageMatch,
} from '@/lib/ai/visionEngine';

interface ImageVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'image_search' | 'chart_understanding' | 'duplicate_detection';
}

const presetImages = [
  {
    id: 'preset-machine',
    title: 'Enterprise AI Server Hardware Assembly.png',
    category: 'Hardware & Machine',
    mode: 'image_search' as const,
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    prompt: 'What components are visible on this board?',
  },
  {
    id: 'preset-chart',
    title: 'H1 2026 Revenue Growth & Monthly Velocity.png',
    category: 'Chart & Dashboard',
    mode: 'chart_understanding' as const,
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    prompt: 'Explain this graph and summarize revenue trends.',
  },
  {
    id: 'preset-dup',
    title: 'Vendor Contract Wire Authorization Scan.png',
    category: 'Document Scan & Forgery',
    mode: 'duplicate_detection' as const,
    url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    prompt: 'Check if this image is a duplicate or has altered signatures.',
  },
];

export const ImageVisionModal: React.FC<ImageVisionModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'image_search',
}) => {
  const [activeMode, setActiveMode] = useState<'image_search' | 'chart_understanding' | 'duplicate_detection'>(
    initialMode
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(presetImages[0].url);
  const [selectedImageName, setSelectedImageName] = useState<string>(presetImages[0].title);
  const [userPrompt, setUserPrompt] = useState(presetImages[0].prompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResponse, setVisionResponse] = useState<ImageKnowledgeResponse | null>(null);

  const handleSelectPreset = (preset: typeof presetImages[0]) => {
    setSelectedImageUrl(preset.url);
    setSelectedImageName(preset.title);
    setUserPrompt(preset.prompt);
    setActiveMode(preset.mode);
    setVisionResponse(null);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageUrl(reader.result as string);
      setSelectedImageName(file.name);
      setVisionResponse(null);
      if (activeMode === 'chart_understanding') {
        setUserPrompt('Explain this chart and calculate growth percentages.');
      } else if (activeMode === 'duplicate_detection') {
        setUserPrompt('Check for duplicate or modified versions in the vault.');
      } else {
        setUserPrompt('What components and structural elements are visible?');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImageUrl) return;
    setIsAnalyzing(true);
    try {
      if (activeMode === 'chart_understanding') {
        const res = await SynapseVisionEngine.analyzeChart(selectedImageName, selectedImageUrl);
        setVisionResponse(res);
      } else if (activeMode === 'duplicate_detection') {
        const res = await SynapseVisionEngine.detectSimilarImages(selectedImageName, selectedImageUrl);
        setVisionResponse(res);
      } else {
        const res = await SynapseVisionEngine.analyzeImage(selectedImageName, userPrompt, selectedImageUrl);
        setVisionResponse(res);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Synapse Deep Learning Vision & Image Knowledge Search"
      className="max-w-5xl"
    >
      <div className="space-y-6 text-xs text-slate-300">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => {
              setActiveMode('image_search');
              setUserPrompt('What components are visible on this board?');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeMode === 'image_search'
                ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Image Knowledge Search</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('chart_understanding');
              setUserPrompt('Explain this chart and calculate growth percentages.');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeMode === 'chart_understanding'
                ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Automatic Chart & Graph Understanding</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('duplicate_detection');
              setUserPrompt('Check for duplicate or modified versions in the vault.');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeMode === 'duplicate_detection'
                ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate & Similar Image Search</span>
          </button>
        </div>

        {/* Preset Sample Images Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Test Images:
          </span>
          {presetImages.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                selectedImageName === preset.title
                  ? 'bg-synapse-cyan/15 border-synapse-cyan text-synapse-cyan'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.category}
            </button>
          ))}
        </div>

        {/* Image Preview & Upload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Canvas & Dropzone */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 aspect-video flex items-center justify-center group shadow-inner">
              {selectedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImageUrl}
                  alt={selectedImageName}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>No image selected</span>
                </div>
              )}

              {/* Image Title Badge */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-bold text-white truncate max-w-[250px]">{selectedImageName}</span>
                <Badge variant="cyan" size="sm">
                  {activeMode.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <FileDropzone
              onFileSelect={handleFileUpload}
              acceptTypes=".png, .jpg, .jpeg, .webp, .gif"
              label="Drop custom image, chart, or machine photo"
              sublabel="PNG, JPEG, WebP supported for deep learning visual parsing"
            />
          </div>

          {/* Right: Question Prompt & AI Vision Results */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Ask Synapse Vision Model about this image:
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. 'What components are visible?' or 'Explain this graph.'"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50 pr-12"
                />
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="absolute right-1.5 p-2 bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 font-bold rounded-lg hover:shadow-md disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Vision Results Area */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto custom-scrollbar">
                {isAnalyzing ? (
                  <div className="h-44 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 border-2 border-synapse-cyan border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 animate-pulse font-medium">
                      Neural Vision Engine computing visual features & structure...
                    </span>
                  </div>
                ) : visionResponse ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-synapse-cyan" />
                        <span>{visionResponse.title}</span>
                      </h4>
                      <Badge variant="emerald" size="sm">
                        Analyzed
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {visionResponse.description}
                    </p>

                    {/* Chart Extracted Metrics */}
                    {visionResponse.chartData && (
                      <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          Extracted Chart Metric Velocity:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {visionResponse.chartData.extractedMetrics.map((m, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                              <span className="text-slate-400 block truncate">{m.label}</span>
                              <div className="flex items-baseline justify-between mt-0.5">
                                <strong className="text-white font-bold">{m.value}</strong>
                                {m.changePercent && (
                                  <span
                                    className={`text-[9px] font-bold ${
                                      m.changePercent > 0 ? 'text-emerald-400' : 'text-rose-400'
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

                    {/* Detected Visual Components */}
                    {visionResponse.visualComponents && visionResponse.visualComponents.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-synapse-cyan uppercase tracking-wider block">
                          Identified Visual Components:
                        </span>
                        <div className="space-y-1.5">
                          {visionResponse.visualComponents.map((c) => (
                            <div key={c.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-0.5">
                              <div className="flex items-center justify-between">
                                <strong className="text-white">{c.name}</strong>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                  {c.confidence}% Match
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{c.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar Image Matches */}
                    {visionResponse.similarMatches && visionResponse.similarMatches.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          Similar & Duplicate Image Matches:
                        </span>
                        <div className="space-y-2">
                          {visionResponse.similarMatches.map((m) => (
                            <div key={m.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white truncate max-w-[200px]">{m.title}</span>
                                <Badge variant={m.similarityScore > 90 ? 'rose' : 'amber'} size="sm">
                                  {m.similarityScore}% {m.matchType.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400">{m.varianceDetails}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span>Vault: {m.teamName.split(' ')[0]}</span>
                                <span>•</span>
                                <span>By: {m.uploadedBy}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center space-y-2 text-center text-slate-500">
                    <Sparkles className="w-6 h-6 text-synapse-cyan/60" />
                    <span>Click "Run Visual Understanding" or press Send to inspect this image</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleRunAnalysis}
              isLoading={isAnalyzing}
              variant="primary"
              className="w-full"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Run Deep Learning Visual Understanding
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
