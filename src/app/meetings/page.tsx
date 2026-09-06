'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  VolumeX,
  Volume1,
  Shield,
  FileDown,
  Users,
  Mic,
  ListTodo,
  CheckSquare,
  Square,
  Radio,
  Sliders,
  AudioWaveform as AudioWave,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { sampleMeetings, sampleParticipants } from '@/lib/mockData/meetings';
import { INITIAL_USERS } from '@/lib/auth/usersDb';
import { MinutesOfMeeting, ActionItem, MeetingParticipant } from '@/types/meeting';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { dispatchCompanionGuide } from '@/lib/ai/companionGuide';

export default function MeetingIntelligencePage() {
  const [sessions, setSessions] = useState(sampleMeetings);
  const [activeSession, setActiveSession] = useState(sampleMeetings[0]);
  const [momData, setMomData] = useState<MinutesOfMeeting>(sampleMeetings[0].mom);
  const [participants, setParticipants] = useState<MeetingParticipant[]>(
    sampleMeetings[0].participants || sampleParticipants
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'mom' | 'tasks' | 'transcript' | 'participants' | 'risks'>('mom');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

  // Audio Playback Simulation State (File Scrubber)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(22);
  const [currentTimeSec, setCurrentTimeSec] = useState(132);

  // Spoken Voice API (Speech Synthesis) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);

  // Participant Management Modal
  const [isManageParticipantsOpen, setIsManageParticipantsOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantDesignation, setNewParticipantDesignation] = useState('');
  const [newParticipantTeam, setNewParticipantTeam] = useState('Core AI & Platform');

  // Action Item Creation Modal
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(participants[0]?.name || 'Sarah Connor');
  const [newActionDeadline, setNewActionDeadline] = useState('2026-09-15');
  const [newActionPriority, setNewActionPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newActionSummary, setNewActionSummary] = useState('');

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Prefer natural English voices
          const englishIndex = voices.findIndex(
            (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
          );
          if (englishIndex !== -1) {
            setSelectedVoiceIndex(englishIndex);
          }
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio file scrubber timer
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
        setCurrentTimeSec((prev) => prev + 2);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const formatSecToTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // SPOKEN VOICE API (Web Speech Synthesis Engine)
  // =========================================================================
  const speakText = (text: string, label: string = 'Voice Readout') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech Synthesis API is not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsVoicePaused(false);
      setCurrentlySpeakingText(label);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setCurrentlySpeakingText(null);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setCurrentlySpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking && !isVoicePaused) {
        window.speechSynthesis.pause();
        setIsVoicePaused(true);
      } else if (isSpeaking && isVoicePaused) {
        window.speechSynthesis.resume();
        setIsVoicePaused(false);
      }
    }
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setCurrentlySpeakingText(null);
    }
  };

  const speakExecutiveSummary = () => {
    const mainTasksList = momData.mainThingsToDo
      ? momData.mainThingsToDo.map((t, idx) => `Task ${idx + 1}: ${t}`).join('. ')
      : '';
    const fullSpeech = `${momData.spokenSummary || momData.executiveSummary}. Here are the main things to do: ${mainTasksList}`;
    speakText(fullSpeech, 'Executive MoM & Main Tasks');
  };

  const speakAllAssignedTasks = () => {
    const tasksSpeech = momData.actionItems
      .map(
        (a, i) =>
          a.spokenText ||
          `Task ${i + 1} for ${a.assignee}, ${a.assigneeDesignation || 'Team Member'}: ${a.title}, due by ${a.deadline}, priority ${a.priority}.`
      )
      .join(' Next: ');
    speakText(`Here are the direct assigned action items from this meeting: ${tasksSpeech}`, 'All Assigned Direct Tasks');
  };

  const speakIndividualTask = (item: ActionItem) => {
    const taskSpeech =
      item.spokenText ||
      `Action item for ${item.assignee}, ${item.assigneeDesignation || 'Team Member'}: ${item.title}. Due date is ${item.deadline}, with ${item.priority} priority.`;
    speakText(taskSpeech, `Task: ${item.title}`);
  };

  // =========================================================================
  // MEETING TRANSCRIPT INGESTION & PARTICIPANTS
  // =========================================================================
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadFileName(file.name);
    try {
      const text = await file.text();
      const generatedMoM = await SynapseAIEngine.processMeetingSession(text || file.name, participants);
      setMomData(generatedMoM);
    } catch (err) {
      const generatedMoM = await SynapseAIEngine.processMeetingSession(file.name, participants);
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
          ? {
              ...item,
              status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
            }
          : item
      ),
    }));
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const matchedParticipant = participants.find((p) => p.name === newActionAssignee);

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      title: newActionTitle.trim(),
      assignee: newActionAssignee,
      assigneeDesignation: matchedParticipant?.designation || 'Team Specialist',
      assigneeTeam: matchedParticipant?.team || 'Operations',
      deadline: newActionDeadline,
      priority: newActionPriority,
      status: 'PENDING',
      category: 'Strategic',
      taskSummary: newActionSummary || newActionTitle.trim(),
      spokenText: `Action item for ${newActionAssignee}, ${matchedParticipant?.designation || 'Team Specialist'}: ${newActionTitle.trim()}, due by ${newActionDeadline}, priority ${newActionPriority}.`,
    };

    setMomData((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));

    setNewActionTitle('');
    setNewActionSummary('');
    setIsAddActionOpen(false);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim() || !newParticipantDesignation.trim()) return;

    const newP: MeetingParticipant = {
      id: `p-${Date.now()}`,
      name: newParticipantName.trim(),
      designation: newParticipantDesignation.trim(),
      team: newParticipantTeam,
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
    };

    const updated = [...participants, newP];
    setParticipants(updated);
    setMomData((prev) => ({
      ...prev,
      participants: updated,
      attendees: updated.map((p) => `${p.name} (${p.designation})`),
    }));

    setNewParticipantName('');
    setNewParticipantDesignation('');
    setIsManageParticipantsOpen(false);
  };

  const exportMoMAsMarkdown = () => {
    const mdContent = `# ${momData.meetingTitle}
Date: ${momData.date} | Duration: ${momData.duration}
Attendees & Designations:
${participants.map((p) => `- **${p.name}** - ${p.designation} (${p.team})`).join('\n')}

## Executive Summary
${momData.executiveSummary}

## What Main Things To Do (Direct Action Checklist)
${momData.mainThingsToDo?.map((t, idx) => `${idx + 1}. [ ] ${t}`).join('\n') || 'None recorded'}

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

## Direct Assigned Tasks
${momData.actionItems
  .map(
    (a) =>
      `- [${a.status === 'COMPLETED' ? 'x' : ' '}] **${a.title}**\n  - Assignee: **${a.assignee}** (${a.assigneeDesignation || 'Member'})\n  - Due: ${a.deadline} | Priority: ${a.priority}\n  - Spoken Briefing: "${a.spokenText || a.title}"`
  )
  .join('\n\n')}

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
    const blob = new Blob([JSON.stringify({ ...momData, participants }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoM_${momData.meetingTitle.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const filteredTasks = momData.actionItems.filter((item) => {
    if (assigneeFilter === 'ALL') return true;
    return item.assignee === assigneeFilter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Voice-Enabled Meeting Intelligence & Direct Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meeting Intelligence & Spoken Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transcribe discussions, tag participant designations, extract high-priority action items, and listen aloud via Spoken Voice API.
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

      {/* SPOKEN VOICE API CONTROLLER TOOLBAR */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-cyan-950/30 border-purple-500/40 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Voice Title & Live Equalizer */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isSpeaking
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse'
                  : 'bg-slate-800 text-purple-400 border border-slate-700'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-6 h-6" /> : <Volume1 className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-synapse-cyan" />
                  <span>Spoken Voice API (Neural TTS Reader)</span>
                </h3>
                {isSpeaking && (
                  <Badge variant="cyan" size="sm" className="animate-pulse">
                    Speaking: {currentlySpeakingText || 'Active'}
                  </Badge>
                )}
                {isVoicePaused && (
                  <Badge variant="amber" size="sm">
                    Paused
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Listen to executive briefings, key decisions, and designated action items aloud.
              </p>
            </div>
          </div>

          {/* Voice Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={speakExecutiveSummary}
              variant="glow"
              size="sm"
              leftIcon={<Volume2 className="w-3.5 h-3.5 text-synapse-cyan" />}
            >
              Speak Executive MoM
            </Button>

            <Button
              onClick={speakAllAssignedTasks}
              variant="secondary"
              size="sm"
              leftIcon={<ListTodo className="w-3.5 h-3.5 text-purple-400" />}
            >
              Speak All Tasks ({momData.actionItems.length})
            </Button>

            {isSpeaking && (
              <>
                <Button onClick={pauseVoice} variant="secondary" size="sm" leftIcon={<Pause className="w-3.5 h-3.5" />}>
                  {isVoicePaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopVoice} variant="danger" size="sm" leftIcon={<VolumeX className="w-3.5 h-3.5" />}>
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Voice Rate & Engine Controls Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Voice Speed:</span>
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    speechRate === rate
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {availableVoices.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <span>Voice Profile:</span>
                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2 py-1 max-w-[200px] truncate focus:outline-none"
                >
                  {availableVoices.map((v, i) => (
                    <option key={i} value={i}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Equalizer Graphic */}
          {isSpeaking && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-synapse-cyan font-mono mr-1">AUDIO PLAYING</span>
              <div className="w-1 h-3.5 bg-synapse-cyan rounded animate-pulse" />
              <div className="w-1 h-5 bg-purple-400 rounded animate-pulse delay-75" />
              <div className="w-1 h-2.5 bg-synapse-cyan rounded animate-pulse delay-150" />
              <div className="w-1 h-4 bg-purple-400 rounded animate-pulse" />
            </div>
          )}
        </div>
      </Card>

      {/* Main Container: Upload & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media Uploader, Audio Player, & Active Sessions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Audio Player Scrubber Card */}
          <Card className="space-y-3 border-purple-500/30 bg-purple-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Audio Recording Playback</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatSecToTime(currentTimeSec)} / 45:00
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
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

          {/* Media Uploader */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-synapse-cyan" />
              <span>Transcribe New Session</span>
            </h3>

            <FileDropzone
              onFileSelect={handleFileUpload}
              currentFileName={uploadFileName || undefined}
              acceptTypes=".mp3, .wav, .m4a, .mp4, .txt"
              label="Drop audio/video file or transcript text"
              sublabel="Auto-extracts speaker designations, key decisions, and direct tasks"
            />
          </Card>

          {/* Sample Sessions Library */}
          <Card className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Meeting Sessions Library:
            </span>
            {sessions.map((m) => {
              const isActive = activeSession.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveSession(m);
                    setMomData(m.mom);
                    if (m.participants) {
                      setParticipants(m.participants);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isActive
                      ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100 truncate max-w-[180px]">{m.title}</h4>
                    <Badge variant="purple" size="sm">
                      {m.duration}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3 text-synapse-cyan" />
                    <span>{m.date}</span>
                    <span>•</span>
                    <span>{m.utterances.length} Speaker Segments</span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Right 2 Columns: MoM Viewer, Direct Tasks & Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => {
                setActiveTab('mom');
                dispatchCompanionGuide('/meetings', {
                  customTitle: 'Minutes of Meeting (MoM)',
                  customSpeech: 'Minutes of Meeting Hub! Here you can review executive summaries, key decisions, and formatted briefing exports.',
                  category: 'Executive MoM',
                  speak: true,
                });
              }}
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
              onClick={() => {
                setActiveTab('tasks');
                dispatchCompanionGuide('/meetings', {
                  customTitle: 'Action Items & Deliverables',
                  customSpeech: 'Assigned Action Items! Each task is mapped with designated owners, SLA deadlines, and priority badges.',
                  category: 'Direct Tasks',
                  speak: true,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Direct Tasks ({momData.actionItems.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('participants');
                dispatchCompanionGuide('/meetings', {
                  customTitle: 'Participant Roster',
                  customSpeech: 'Meeting Participant Directory! Manage attendees, assign department roles, and track attendee contributions.',
                  category: 'Roster',
                  speak: true,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'participants'
                  ? 'bg-gradient-to-r from-synapse-cyan to-synapse-purple text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Participants ({participants.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('transcript');
                dispatchCompanionGuide('/meetings', {
                  customTitle: 'Speaker Audio Transcript',
                  customSpeech: 'Speaker Audio Transcript! Follow timestamped dialogue segments tagged by speaker identity and topic velocity.',
                  category: 'Audio Transcript',
                  speak: true,
                });
              }}
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
              onClick={() => {
                setActiveTab('risks');
                dispatchCompanionGuide('/meetings', {
                  customTitle: 'Executive Risk Register',
                  customSpeech: 'Meeting Risk Register! Track flagged blockers, infrastructure dependencies, and risk mitigation strategies.',
                  category: 'Risk Analysis',
                  speak: true,
                });
              }}
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
              <div className="border-b border-slate-800 pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-extrabold text-white">{momData.meetingTitle}</h2>
                  <Badge variant="cyan">Synapse AI MoM v4</Badge>
                </div>

                {/* Attendee Badges with Designations */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-synapse-cyan" />
                      <strong className="text-slate-200">{p.name}</strong>
                      <span className="text-purple-400 font-mono text-[11px]">— {p.designation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-synapse-cyan uppercase tracking-wider">
                    Executive Briefing
                  </h3>
                  <button
                    onClick={speakExecutiveSummary}
                    className="text-[11px] font-bold text-synapse-cyan hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Aloud</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  {momData.executiveSummary}
                </p>
              </div>

              {/* WHAT MAIN THINGS TO DO (Executive Action Checklist) */}
              <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 to-slate-900/90 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-purple-400" />
                    <span>What Main Things To Do (Direct Checklist)</span>
                  </h3>
                  <Badge variant="purple" size="sm">
                    {momData.mainThingsToDo?.length || 4} Priority Deliverables
                  </Badge>
                </div>

                <div className="space-y-2">
                  {(momData.mainThingsToDo || [
                    'Deploy multi-document RAG indexing to staging cluster.',
                    'Execute cross-document invoice tampering inspection.',
                    'Finalize SOC2 Type II encryption key rotation compliance report.',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-slate-200 leading-relaxed font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agenda Topics */}
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
                      <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 mt-2">
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
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: Direct Tasks & Action Items */}
          {activeTab === 'tasks' && (
            <Card className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Direct Tasks & Task Delegation</h3>
                  <p className="text-xs text-slate-400">
                    Assigned task owners with professional designations & voice readout triggers
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Assignee Filter */}
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">All Participants</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => setIsAddActionOpen(true)}
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Task
                  </Button>
                </div>
              </div>

              {/* Action Items Cards */}
              <div className="space-y-3">
                {filteredTasks.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.status === 'COMPLETED'
                        ? 'bg-slate-900/30 border-slate-800 text-slate-500'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-purple-500/40'
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
                        <p
                          className={`text-sm font-semibold ${
                            item.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {/* Assignee & Designation */}
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-synapse-cyan" />
                            <strong className="text-slate-200">{item.assignee}</strong>
                            {item.assigneeDesignation && (
                              <span className="text-purple-400 font-mono text-[11px]">
                                ({item.assigneeDesignation})
                              </span>
                            )}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Due: {item.deadline}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => speakIndividualTask(item)}
                        className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white transition-colors border border-purple-500/30"
                        title="Speak task aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <Badge variant={item.priority === 'HIGH' ? 'rose' : item.priority === 'MEDIUM' ? 'amber' : 'cyan'}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Participants Management */}
          {activeTab === 'participants' && (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Meeting Participants & Designations</h3>
                  <p className="text-xs text-slate-400">
                    Designated attendees responsible for meeting outcomes and direct task ownership
                  </p>
                </div>
                <Button
                  onClick={() => setIsManageParticipantsOpen(true)}
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Participant
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-synapse-cyan/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-synapse-cyan/20 to-purple-600/20 border border-synapse-cyan/30 flex items-center justify-center text-synapse-cyan font-bold text-xs">
                          {p.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{p.employeeId || 'EMP-104'}</span>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">
                        {p.team?.split(' ')[0] || 'Team'}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Designation / Role:</span>
                      <strong className="text-synapse-cyan">{p.designation}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: Speaker Transcript */}
          {activeTab === 'transcript' && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  Speaker Identification & Timestamped Transcript
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {activeSession.utterances.length} Segments
                </span>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {activeSession.utterances.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-synapse-cyan text-xs">{u.speaker}</span>
                        {u.speakerDesignation && (
                          <span className="text-[11px] text-purple-400 font-mono">
                            — {u.speakerDesignation}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        [{u.startTime} - {u.endTime}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{u.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 5: Risk Register */}
          {activeTab === 'risks' && (
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Meeting Risk & Mitigation Register</h3>
                <p className="text-xs text-slate-400">Identified operational roadblocks and mitigation strategies</p>
              </div>

              <div className="space-y-3">
                {(momData.riskRegister || []).map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-100">{risk.risk}</h4>
                      <Badge variant={risk.impact === 'HIGH' ? 'rose' : 'amber'}>
                        {risk.impact} IMPACT
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Direct Action Item Modal */}
      <Modal
        isOpen={isAddActionOpen}
        onClose={() => setIsAddActionOpen(false)}
        title="Assign Direct Action Item"
      >
        <form onSubmit={handleAddActionItem} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Task Title / Action Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Deploy 35% Cloud Run compute scaling to staging..."
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Assignee (With Designation)</label>
              <select
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.designation.split('&')[0].trim()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Deadline Date</label>
              <input
                type="date"
                required
                value={newActionDeadline}
                onChange={(e) => setNewActionDeadline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Priority Rating</label>
            <select
              value={newActionPriority}
              onChange={(e) => setNewActionPriority(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              <option value="HIGH">High Priority (Urgent)</option>
              <option value="MEDIUM">Medium Priority (Standard Sprint)</option>
              <option value="LOW">Low Priority (Backlog)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Action Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Participant Modal */}
      <Modal
        isOpen={isManageParticipantsOpen}
        onClose={() => setIsManageParticipantsOpen(false)}
        title="Add Meeting Participant with Designation"
      >
        <form onSubmit={handleAddParticipant} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Professional Designation / Role</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead AML & Fraud Operations Investigator"
              value={newParticipantDesignation}
              onChange={(e) => setNewParticipantDesignation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Team Assignment</label>
            <select
              value={newParticipantTeam}
              onChange={(e) => setNewParticipantTeam(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              <option value="Core AI & Platform">Core AI & Platform</option>
              <option value="Fraud & AML Ops">Fraud & AML Ops</option>
              <option value="Security & Cryptography">Security & Cryptography</option>
              <option value="Financial Risk & Compliance">Financial Risk & Compliance</option>
              <option value="Executive Leadership">Executive Leadership</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsManageParticipantsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Participant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
