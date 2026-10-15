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
    id: 'preset-fpga',
    title: 'Radiona ULX3S FPGA Hardware Board.svg',
    category: 'FPGA Hardware (6 Components)',
    mode: 'image_search' as const,
    url: '/test-assets/hardware_fpga_board.svg',
    prompt: 'Identify all hardware components visible on this board.',
  },
  {
    id: 'preset-chart',
    title: 'H1 2026 Enterprise Revenue & Telemetry.svg',
    category: 'Revenue Chart (Monthly Velocity)',
    mode: 'chart_understanding' as const,
    url: '/test-assets/q2_revenue_chart.svg',
    prompt: 'Explain this chart, extract monthly revenue values, and highlight anomalies.',
  },
  {
    id: 'preset-architecture',
    title: 'Synapse Enterprise AI Cloud Infrastructure.svg',
    category: 'Cloud Architecture (6 Subsystems)',
    mode: 'image_search' as const,
    url: '/test-assets/cloud_architecture_diagram.svg',
    prompt: 'Analyze this topology diagram and list all microservices.',
  },
  {
    id: 'preset-invoice',
    title: 'Vendor Contract Wire Authorization Scan.svg',
    category: 'Invoice Scan (Forgery Detection)',
    mode: 'duplicate_detection' as const,
    url: '/test-assets/vendor_invoice_scan.svg',
    prompt: 'Check for duplicate documents, IBAN tampering, and altered wire amounts.',
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
  const [hoverComponentId, setHoverComponentId] = useState<string | null>(null);

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

  const handleDownloadTestAsset = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Synapse Deep Learning Vision & Multimodal Component Identification"
      className="max-w-5xl"
    >
      <div className="space-y-6 text-xs text-slate-300">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveMode('image_search');
                setUserPrompt('Identify all components and structural elements on this image.');
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeMode === 'image_search'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Component Identification & Vision</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('chart_understanding');
                setUserPrompt('Explain this chart and calculate growth percentages.');
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeMode === 'chart_understanding'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
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
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate & Forgery Search</span>
            </button>
          </div>

          <button
            onClick={() => handleDownloadTestAsset(selectedImageUrl, selectedImageName)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            title="Download current test SVG image file"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Test SVG</span>
          </button>
        </div>

        {/* Preset Sample Images Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> Quick Test Images & Charts:
          </span>
          {presetImages.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                selectedImageName === preset.title
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.category}
            </button>
          ))}
        </div>

        {/* Image Preview & Upload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Canvas & Interactive Bounding Boxes */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center group shadow-md">
              {selectedImageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImageUrl}
                    alt={selectedImageName}
                    className="w-full h-full object-contain object-center"
                  />

                  {/* Overlaid Bounding Boxes when visual components are detected */}
                  {visionResponse?.visualComponents?.map((comp, idx) => {
                    if (!comp.boundingBox) return null;
                    const { x, y, width, height } = comp.boundingBox;
                    const isHovered = hoverComponentId === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onMouseEnter={() => setHoverComponentId(comp.id)}
                        onMouseLeave={() => setHoverComponentId(null)}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                        className={`absolute border-2 transition-all cursor-pointer rounded-lg flex flex-col justify-between p-1 z-20 ${
                          isHovered
                            ? 'border-sky-400 bg-sky-500/30 shadow-[0_0_25px_rgba(56,189,248,0.8)] scale-[1.02]'
                            : 'border-sky-400/70 bg-sky-950/25 hover:border-sky-300 hover:bg-sky-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-sky-400/80 text-[10px] font-extrabold text-sky-300 font-mono">
                            #{idx + 1} {comp.name.split(' ')[0]}
                          </span>
                          <span className="px-1 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/80 text-[9px] font-bold text-emerald-400">
                            {comp.confidence}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>No image selected</span>
                </div>
              )}

              {/* Image Title Badge */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between text-[11px] z-30">
                <span className="font-bold text-white truncate max-w-[250px]">{selectedImageName}</span>
                <Badge variant="cyan" size="sm">
                  {activeMode.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <FileDropzone
              onFileSelect={handleFileUpload}
              acceptTypes=".png, .jpg, .jpeg, .webp, .svg"
              label="Drop custom image, chart, or architecture SVG/PNG"
              sublabel="SVG, PNG, JPEG, WebP supported for multimodal visual component analysis"
            />
          </div>

          {/* Right: Question Prompt & AI Vision Results */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 block flex items-center justify-between">
                <span>Ask Synapse Vision Model about this image:</span>
                {visionResponse?.visualComponents && (
                  <span className="text-[10px] font-normal text-sky-400">
                    Hover components below to highlight bounding boxes
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. 'What components are visible?' or 'Explain this graph.'"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 pr-12 shadow-xs"
                />
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="absolute right-1.5 p-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-md disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Vision Results Area */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto custom-scrollbar">
                {isAnalyzing ? (
                  <div className="h-44 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-sky-300 animate-pulse font-medium">
                      Neural Vision Engine computing visual features &amp; bounding box components...
                    </span>
                  </div>
                ) : visionResponse ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
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
                      <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-xs">
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
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block flex items-center justify-between">
                          <span>Identified Visual Components ({visionResponse.visualComponents.length}):</span>
                          <span className="text-slate-500 font-mono text-[9px]">Target Overlays Active</span>
                        </span>
                        <div className="space-y-1.5">
                          {visionResponse.visualComponents.map((c, idx) => (
                            <div
                              key={c.id}
                              onMouseEnter={() => setHoverComponentId(c.id)}
                              onMouseLeave={() => setHoverComponentId(null)}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all cursor-pointer ${
                                hoverComponentId === c.id
                                  ? 'bg-sky-950/80 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 rounded bg-sky-900/80 border border-sky-400 text-[10px] font-mono text-sky-300">
                                    #{idx + 1}
                                  </span>
                                  {c.name}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                  {c.confidence}% Match
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300">{c.description}</p>
                              {c.boundingBox && (
                                <span className="text-[9px] font-mono text-slate-500 block">
                                  Bounding Box: [X: {c.boundingBox.x}%, Y: {c.boundingBox.y}%, W: {c.boundingBox.width}%, H: {c.boundingBox.height}%]
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar Image Matches */}
                    {visionResponse.similarMatches && visionResponse.similarMatches.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          Similar &amp; Duplicate Image Matches:
                        </span>
                        <div className="space-y-2">
                          {visionResponse.similarMatches.map((m) => (
                            <div key={m.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white truncate max-w-[200px]">{m.title}</span>
                                <Badge variant={m.similarityScore > 90 ? 'rose' : 'amber'} size="sm">
                                  {m.similarityScore}% {m.matchType.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-300">{m.varianceDetails}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
                  <div className="h-44 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
                    <Sparkles className="w-6 h-6 text-sky-400/80 animate-pulse" />
                    <span>Click "Run Deep Learning Visual Understanding" below to detect components &amp; analyze</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleRunAnalysis}
              isLoading={isAnalyzing}
              variant="primary"
              className="w-full shadow-lg"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Run Deep Learning Visual Component Identification
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
