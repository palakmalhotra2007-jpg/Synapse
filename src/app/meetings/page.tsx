'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Edit3,
  Download,
  UploadCloud,
  Sparkles,
  Play,
  Pause,
  Share2,
  Calendar,
  AlertCircle,
  Volume2,
  Shield,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { sampleMeetings } from '@/lib/mockData/meetings';
import { MinutesOfMeeting, ActionItem } from '@/types/meeting';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';

export default function MeetingIntelligencePage() {
  const [activeSession, setActiveSession] = useState(sampleMeetings[0]);
  const [momData, setMomData] = useState<MinutesOfMeeting>(sampleMeetings[0].mom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'mom' | 'transcript' | 'actionItems' | 'risks'>('mom');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  // Audio Playback Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(15); // percentage
  const [currentTimeSec, setCurrentTimeSec] = useState(90); // 1:30

  // Action Item Creation Modal
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Sarah Jenkins (CTO)');
  const [newActionDeadline, setNewActionDeadline] = useState('2026-09-15');
  const [newActionPriority, setNewActionPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
        setCurrentTimeSec((prev) => prev + 2);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatSecToTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadFileName(file.name);
    try {
      const text = await file.text();
      const generatedMoM = await SynapseAIEngine.processMeetingSession(text || file.name);
      setMomData(generatedMoM);
    } catch (err) {
      const generatedMoM = await SynapseAIEngine.processMeetingSession(file.name);
      setMomData(generatedMoM);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleActionItemStatus = (id: string) => {
    setMomData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
          : item
      ),
    }));
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      title: newActionTitle.trim(),
      assignee: newActionAssignee,
      deadline: newActionDeadline,
      priority: newActionPriority,
      status: 'PENDING',
      category: 'Strategic',
    };

    setMomData((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));

    setNewActionTitle('');
    setIsAddActionOpen(false);
  };

  const exportMoMAsMarkdown = () => {
    const mdContent = `# ${momData.meetingTitle}
Date: ${momData.date} | Duration: ${momData.duration}
Attendees: ${momData.attendees.join(', ')}

## Executive Summary
${momData.executiveSummary}

## Agenda & Discussion Highlights
${momData.agendaTopics
  .map(
    (t) => `### ${t.topic}
Outcomes: ${t.outcomes}
Key Points:
${t.keyPoints.map((p) => `- ${p}`).join('\n')}`
  )
  .join('\n\n')}

## Key Decisions Made
${momData.keyDecisions.map((d) => `- ${d}`).join('\n')}

## Action Items & Deadlines
${momData.actionItems
  .map((a) => `- [${a.status === 'COMPLETED' ? 'x' : ' '}] ${a.title} (Owner: ${a.assignee}, Due: ${a.deadline}, Priority: ${a.priority})`)
  .join('\n')}

## Risk Register
${momData.riskRegister?.map((r) => `- **${r.risk}** [${r.impact} Impact] -> Mitigation: ${r.mitigation}`).join('\n') || 'None recorded'}`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoM_${momData.meetingTitle.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  const exportMoMJSON = () => {
    const blob = new Blob([JSON.stringify(momData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoM_${momData.meetingTitle.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Speech-to-Text & Automatic MoM Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meeting Intelligence & Action Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transcribe meeting audio, identify speaker segments, and generate executive Minutes of Meeting (MoM).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={exportMoMJSON} variant="secondary" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
            Export JSON
          </Button>
          <Button onClick={exportMoMAsMarkdown} variant="glow" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export MoM Markdown
          </Button>
        </div>
      </div>

      {/* Main Container: Upload & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media Uploader, Audio Player, & Active Sessions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Audio Player Scrubber Card */}
          <Card className="space-y-3 border-purple-500/30 bg-purple-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Audio Recording Player</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatSecToTime(currentTimeSec)} / 45:00
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Progress bar */}
              <div className="flex-1 space-y-1">
                <div
                  className="w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.round((clickX / rect.width) * 100);
                    setPlaybackProgress(pct);
                    setCurrentTimeSec(Math.round((pct / 100) * 2700));
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-synapse-cyan to-purple-500 rounded-full transition-all"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Executive Sync Recording</span>
                  <span>{playbackProgress}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-synapse-cyan" />
              <span>Transcribe New Recording</span>
            </h3>

            <FileDropzone
              onFileSelect={handleFileUpload}
              currentFileName={uploadFileName || undefined}
              acceptTypes=".mp3, .wav, .m4a, .mp4, .txt"
              label="Drop audio/video file or transcript text"
              sublabel="Auto-extracts speakers, key takeaways, and action items"
            />
          </Card>

          {/* Sample Sessions Library */}
          <Card className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Recent Meeting Sessions:
            </span>
            {sampleMeetings.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setActiveSession(m);
                  setMomData(m.mom);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  activeSession.id === m.id
                    ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
                  <Badge variant="purple" size="sm">{m.duration}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3 text-synapse-cyan" />
                  <span>{m.date}</span>
                  <span>•</span>
                  <span>{m.utterances.length} Speaker Lines</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right 2 Columns: MoM Viewer & Editor Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('mom')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'mom'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Minutes of Meeting (MoM)</span>
            </button>

            <button
              onClick={() => setActiveTab('actionItems')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'actionItems'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Action Items ({momData.actionItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'transcript'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Speaker Transcript</span>
            </button>

            <button
              onClick={() => setActiveTab('risks')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'risks'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Risk Register</span>
            </button>
          </div>

          {/* TAB 1: Minutes of Meeting (MoM) */}
          {activeTab === 'mom' && (
            <Card className="space-y-6">
              {/* MoM Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-white">{momData.meetingTitle}</h2>
                  <Badge variant="cyan">AI Synapse MoM v4</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                  <span>Date: <strong className="text-slate-200">{momData.date}</strong></span>
                  <span>Duration: <strong className="text-slate-200">{momData.duration}</strong></span>
                  <span>Attendees: <strong className="text-slate-200">{momData.attendees.join(', ')}</strong></span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-synapse-cyan uppercase tracking-wider">
                  Executive Briefing
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  {momData.executiveSummary}
                </p>
              </div>

              {/* Key Agenda Topics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Agenda Discussion Breakdown
                </h3>
                <div className="space-y-3">
                  {momData.agendaTopics.map((topic, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                      <h4 className="text-sm font-bold text-white">{topic.topic}</h4>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {topic.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                      <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-2">
                        <strong>Outcome:</strong> {topic.outcomes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Decisions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Key Decisions Log
                </h3>
                <div className="space-y-1.5">
                  {momData.keyDecisions.map((dec, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: Action Items Tracker */}
          {activeTab === 'actionItems' && (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Action Items & Task Deadlines</h3>
                  <p className="text-xs text-slate-400">Assigned task owners extracted directly from meeting audio</p>
                </div>
                <Button
                  onClick={() => setIsAddActionOpen(true)}
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Task
                </Button>
              </div>

              <div className="space-y-3">
                {momData.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      item.status === 'COMPLETED'
                        ? 'bg-slate-900/30 border-slate-800 text-slate-500'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={item.status === 'COMPLETED'}
                        onChange={() => toggleActionItemStatus(item.id)}
                        className="mt-1 rounded accent-synapse-cyan cursor-pointer"
                      />
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold ${item.status === 'COMPLETED' ? 'line-through' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-synapse-cyan" />
                            <span>{item.assignee}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Deadline: {item.deadline}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant={item.priority === 'HIGH' ? 'rose' : 'cyan'}>
                      {item.priority} PRIORITY
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Speaker Transcript */}
          {activeTab === 'transcript' && (
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Speaker Identification & Timestamped Transcript
              </h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {activeSession.utterances.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-synapse-cyan text-xs">{u.speaker}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{u.startTime} - {u.endTime}]</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{u.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: Risk Register */}
          {activeTab === 'risks' && (
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Identified Risk Register</h3>
                <p className="text-xs text-slate-400">AI-detected strategic and operational risks discussed in the sync</p>
              </div>

              <div className="space-y-3">
                {momData.riskRegister?.map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{risk.risk}</span>
                      <Badge variant={risk.impact === 'HIGH' ? 'rose' : 'amber'}>
                        {risk.impact} IMPACT
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Mitigation Strategy:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Action Item Modal */}
      <Modal
        isOpen={isAddActionOpen}
        onClose={() => setIsAddActionOpen(false)}
        title="Add Meeting Action Item"
        maxWidth="md"
      >
        <form onSubmit={handleAddActionItem} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Action Item Title</label>
            <input
              type="text"
              required
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="e.g. Schedule SOC2 vendor audit debrief"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assignee</label>
              <input
                type="text"
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Deadline</label>
              <input
                type="date"
                value={newActionDeadline}
                onChange={(e) => setNewActionDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Priority Level</label>
            <select
              value={newActionPriority}
              onChange={(e: any) => setNewActionPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddActionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Action Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
