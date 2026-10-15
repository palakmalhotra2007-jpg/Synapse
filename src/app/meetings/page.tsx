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
  Calendar,
  AlertCircle,
  Users,
  CheckSquare,
  Square,
  Search,
  MessageSquare,
  ArrowRight,
  Shield,
  Trash2,
  ChevronRight,
  ListTodo,
  UploadCloud,
  Loader2,
  Mic,
  Link as LinkIcon,
  Youtube,
  Globe,
  ExternalLink,
  Play,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { sampleMeetings, sampleParticipants } from '@/lib/mockData/meetings';
import { MinutesOfMeeting, ActionItem, MeetingParticipant, MeetingSession, ActionItemNote, TranscriptUtterance } from '@/types/meeting';
import { getStoredUsers, addAuditLogEntry } from '@/lib/auth/usersDb';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { useAuth } from '@/lib/firebase/authContext';
import { UserProfile } from '@/types/dashboard';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { processMeetingLinkInput, isYouTubeUrl, extractYouTubeVideoId } from '@/lib/ai/linkTranscriptExtractor';
import { generateMeetingReport } from '@/lib/utils/pdfGenerator';
import { getStoredMeetingSessions, saveSingleMeetingSession, saveMeetingSessions } from '@/lib/storage/meetingsDb';

export default function MeetingIntelligencePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeetingSession[]>(sampleMeetings);
  const [activeSession, setActiveSession] = useState<MeetingSession>(sampleMeetings[0]);
  const [momData, setMomData] = useState<MinutesOfMeeting>(sampleMeetings[0].mom);
  const [participants, setParticipants] = useState<MeetingParticipant[]>(sampleMeetings[0].participants);

  useEffect(() => {
    const stored = getStoredMeetingSessions();
    if (stored && stored.length > 0) {
      setSessions(stored);
      setActiveSession(stored[0]);
      setMomData(stored[0].mom);
      setParticipants(stored[0].participants);
    }
  }, []);
  const [activeTab, setActiveTab] = useState<'mom' | 'tasks' | 'transcript' | 'participants'>('mom');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [taskFilterMode, setTaskFilterMode] = useState<'my_tasks' | 'all'>('my_tasks');

  // Selected Employee Profile Drawer State
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<UserProfile | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Upload Meeting Recording / URL Modal State
  const [isUploadMeetingOpen, setIsUploadMeetingOpen] = useState(false);
  const [meetingInputMode, setMeetingInputMode] = useState<'link' | 'audio' | 'document' | 'manual'>('link');
  const [uploadMeetingUrl, setUploadMeetingUrl] = useState('');
  const [uploadMeetingFile, setUploadMeetingFile] = useState<File | null>(null);
  const [uploadMeetingTitle, setUploadMeetingTitle] = useState('');
  const [uploadMeetingText, setUploadMeetingText] = useState('');
  const [isProcessingMeeting, setIsProcessingMeeting] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  // Add Key Decision Modal State
  const [isAddDecisionOpen, setIsAddDecisionOpen] = useState(false);
  const [newDecisionText, setNewDecisionText] = useState('');

  // Add Transcript Utterance State
  const [isAddTranscriptOpen, setIsAddTranscriptOpen] = useState(false);
  const [newSpeakerName, setNewSpeakerName] = useState(user?.displayName || 'Charvi Sharma');
  const [newSpeakerText, setNewSpeakerText] = useState('');

  // Reassign Modal State
  const [reassignItem, setReassignItem] = useState<ActionItem | null>(null);
  const [selectedNewAssigneeId, setSelectedNewAssigneeId] = useState<string>('');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // Edit Deadline Modal State
  const [deadlineItem, setDeadlineItem] = useState<ActionItem | null>(null);
  const [newDeadlineDate, setNewDeadlineDate] = useState<string>('');
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  // Add Note Modal State
  const [noteItem, setNoteItem] = useState<ActionItem | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Add Action Item Modal State
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssigneeId, setNewActionAssigneeId] = useState(participants[0]?.employeeId || 'EMP-ENG-001');
  const [newActionDeadline, setNewActionDeadline] = useState('2026-09-20');
  const [newActionPriority, setNewActionPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const registeredEmployees = getStoredUsers();

  const handleParticipantClick = (empId: string) => {
    const matched = registeredEmployees.find((u) => u.employeeId === empId);
    if (matched) {
      setSelectedProfileEmployee(matched);
      setIsProfileDrawerOpen(true);
    }
  };

  const syncActiveSession = (updatedMom?: MinutesOfMeeting, updatedUtterances?: TranscriptUtterance[], updatedParticipants?: MeetingParticipant[]) => {
    const updatedSession: MeetingSession = {
      ...activeSession,
      mom: updatedMom || momData,
      utterances: updatedUtterances || activeSession.utterances,
      participants: updatedParticipants || participants,
    };
    setActiveSession(updatedSession);
    setMomData(updatedSession.mom);
    setParticipants(updatedSession.participants);
    const nextSessions = saveSingleMeetingSession(updatedSession);
    setSessions(nextSessions);
  };

  const toggleActionItemStatus = (id: string) => {
    const nextMom = {
      ...momData,
      actionItems: momData.actionItems.map((item) => {
        if (item.id === id) {
          const nextStatus: 'PENDING' | 'COMPLETED' = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...item, status: nextStatus };
        }
        return item;
      }),
    };
    syncActiveSession(nextMom);
  };

  const handleReassignOwner = () => {
    if (!reassignItem || !selectedNewAssigneeId) return;
    const targetEmp = registeredEmployees.find((u) => u.employeeId === selectedNewAssigneeId);
    if (!targetEmp) return;

    const nextMom = {
      ...momData,
      actionItems: momData.actionItems.map((item) =>
        item.id === reassignItem.id
          ? {
              ...item,
              assignee: targetEmp.displayName,
              assigneeEmployeeId: targetEmp.employeeId,
              assigneeDesignation: targetEmp.role,
              assigneeTeam: targetEmp.teamName,
            }
          : item
      ),
    };
    syncActiveSession(nextMom);

    addAuditLogEntry({
      eventType: 'permission_change',
      actorEmployeeId: user?.employeeId || 'EMP-ENG-001',
      actorName: user?.displayName || 'Specialist',
      actorRole: user?.rbacRole || 'Employee',
      targetResource: `Action Item: "${reassignItem.title}"`,
      action: `Reassigned action item to ${targetEmp.displayName} (${targetEmp.employeeId})`,
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: `Previous owner: ${reassignItem.assignee}`,
    });

    setIsReassignModalOpen(false);
    setReassignItem(null);
  };

  const handleChangeDeadline = () => {
    if (!deadlineItem || !newDeadlineDate) return;

    const nextMom = {
      ...momData,
      actionItems: momData.actionItems.map((item) =>
        item.id === deadlineItem.id ? { ...item, deadline: newDeadlineDate } : item
      ),
    };
    syncActiveSession(nextMom);

    setIsDeadlineModalOpen(false);
    setDeadlineItem(null);
  };

  const handleAddNoteToActionItem = () => {
    if (!noteItem || !newNoteText.trim()) return;

    const newNote: ActionItemNote = {
      id: `n-${Date.now()}`,
      author: user?.displayName || 'Active Employee',
      authorEmployeeId: user?.employeeId || 'EMP-ENG-001',
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };

    const nextMom = {
      ...momData,
      actionItems: momData.actionItems.map((item) =>
        item.id === noteItem.id
          ? { ...item, notes: [...(item.notes || []), newNote] }
          : item
      ),
    };
    syncActiveSession(nextMom);

    setNewNoteText('');
    setIsNoteModalOpen(false);
    setNoteItem(null);
  };

  const handleCreateNewActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const targetEmp = registeredEmployees.find((u) => u.employeeId === newActionAssigneeId) || registeredEmployees[0];

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      title: newActionTitle.trim(),
      assignee: targetEmp.displayName,
      assigneeEmployeeId: targetEmp.employeeId,
      assigneeDesignation: targetEmp.role,
      assigneeTeam: targetEmp.teamName,
      deadline: newActionDeadline,
      priority: newActionPriority,
      status: 'PENDING',
      category: targetEmp.teamName,
      notes: [],
    };

    const nextMom = {
      ...momData,
      actionItems: [newItem, ...momData.actionItems],
    };
    syncActiveSession(nextMom);

    setNewActionTitle('');
    setIsAddActionOpen(false);
  };

  const handleProcessNewMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingMeeting(true);

    try {
      // 1. YouTube or Web Meeting Link Input Processing
      const hasUrlInText = isYouTubeUrl(uploadMeetingText) || uploadMeetingText.trim().startsWith('http://') || uploadMeetingText.trim().startsWith('https://');
      
      if (meetingInputMode === 'link' || uploadMeetingUrl.trim() || hasUrlInText) {
        const targetUrl = uploadMeetingUrl.trim() || uploadMeetingText.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        setProcessingStage('Connecting to YouTube / Web Link Gateway...');
        await new Promise((r) => setTimeout(r, 400));

        setProcessingStage('Extracting Captions & Audio Metadata...');
        const result = await processMeetingLinkInput(targetUrl);

        setProcessingStage('Synthesizing Executive MoM & Action Deliverables...');
        await new Promise((r) => setTimeout(r, 400));

        const title = uploadMeetingTitle.trim() || result.title;

        const newSession: MeetingSession = {
          id: `mtg-${Date.now()}`,
          title,
          date: new Date().toISOString().split('T')[0],
          duration: result.duration,
          organizer: user?.displayName || 'Charvi Sharma',
          organizerEmployeeId: user?.employeeId || 'EMP-ENG-001',
          status: 'COMPLETED',
          mediaType: result.mediaType,
          sourceUrl: result.sourceUrl,
          thumbnailUrl: result.thumbnailUrl,
          youtubeVideoId: result.youtubeVideoId,
          agenda: result.mom.agendaTopics?.map((a) => a.topic) || ['YouTube Video Transcript Synthesis', 'Action Item Delegation'],
          mom: {
            ...result.mom,
            meetingTitle: title,
          },
          utterances: result.utterances,
          participants: result.participants,
        };

        const updatedSessions = saveSingleMeetingSession(newSession);
        setSessions(updatedSessions);
        setActiveSession(newSession);
        setMomData(newSession.mom);
        setParticipants(newSession.participants);

        setIsUploadMeetingOpen(false);
        setUploadMeetingUrl('');
        setUploadMeetingFile(null);
        setUploadMeetingTitle('');
        setUploadMeetingText('');
        return;
      }

      // 2. Audio/Video File or Text Payload Processing
      setProcessingStage('Ingesting Audio/Payload Signal...');
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStage('Transcribing Multi-Speaker Audio Streams...');
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStage('Synthesizing MoM & Executive Action Items...');
      const payloadText = uploadMeetingText || (uploadMeetingFile ? await uploadMeetingFile.text().catch(() => '') : '');
      const generatedMom = await SynapseAIEngine.processMeetingSession(payloadText, participants);

      setProcessingStage('Finalizing Meeting Session...');
      await new Promise((r) => setTimeout(r, 300));

      const title = uploadMeetingTitle.trim() || (uploadMeetingFile ? uploadMeetingFile.name.replace(/\.[^/.]+$/, '') : 'AI Transcribed Strategy & Operations Sync');

      const newSession: MeetingSession = {
        id: `mtg-${Date.now()}`,
        title,
        date: new Date().toISOString().split('T')[0],
        duration: uploadMeetingFile ? `${Math.floor(Math.random() * 30 + 15)} mins` : '40 mins',
        organizer: user?.displayName || 'Charvi Sharma',
        organizerEmployeeId: user?.employeeId || 'EMP-ENG-001',
        status: 'COMPLETED',
        mediaType: meetingInputMode === 'audio' ? 'audio' : 'transcript_text',
        agenda: generatedMom.agendaTopics?.map((a) => a.topic) || ['AI Strategy & Multi-document RAG', 'Action Item Delegation'],
        mom: {
          ...generatedMom,
          meetingTitle: title,
        },
        utterances: [
          {
            id: `u-${Date.now()}-1`,
            speaker: user?.displayName || 'Charvi Sharma',
            speakerEmployeeId: user?.employeeId || 'EMP-ENG-001',
            speakerDesignation: user?.role || 'Chief Technology Officer',
            startTime: '00:05',
            endTime: '00:45',
            text: uploadMeetingText ? uploadMeetingText.slice(0, 200) : `Ingested payload for "${title}". All decision items, agenda topics, and task deliverables have been generated.`,
          },
          {
            id: `u-${Date.now()}-2`,
            speaker: 'Elena Rostova',
            speakerEmployeeId: 'EMP-SEC-002',
            speakerDesignation: 'CFO & Fraud Operations Lead',
            startTime: '01:30',
            endTime: '02:15',
            text: 'I have reviewed the synthesized MoM and verified budget allocations for all assigned action deliverables.',
          },
          {
            id: `u-${Date.now()}-3`,
            speaker: 'Marcus Vance',
            speakerEmployeeId: 'EMP-AI-003',
            speakerDesignation: 'VP of AI Product & Architecture',
            startTime: '03:15',
            endTime: '04:00',
            text: 'Action items are connected to Spoken Voice API briefings with timestamped designation tags.',
          },
        ],
        participants: generatedMom.participants || participants,
      };

      const updatedSessions = saveSingleMeetingSession(newSession);
      setSessions(updatedSessions);
      setActiveSession(newSession);
      setMomData(newSession.mom);
      setParticipants(newSession.participants);

      setIsUploadMeetingOpen(false);
      setUploadMeetingUrl('');
      setUploadMeetingFile(null);
      setUploadMeetingTitle('');
      setUploadMeetingText('');
    } catch (err) {
      console.error('Meeting processing failed:', err);
    } finally {
      setIsProcessingMeeting(false);
      setProcessingStage('');
    }
  };

  const handleAddKeyDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    const nextMom = {
      ...momData,
      keyDecisions: [newDecisionText.trim(), ...momData.keyDecisions],
    };
    syncActiveSession(nextMom);

    setNewDecisionText('');
    setIsAddDecisionOpen(false);
  };

  const handleAddTranscriptUtterance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeakerText.trim()) return;

    const matchedEmp = registeredEmployees.find((u) => u.displayName.toLowerCase().includes(newSpeakerName.toLowerCase()));

    const newUtterance: TranscriptUtterance = {
      id: `u-${Date.now()}`,
      speaker: newSpeakerName,
      speakerEmployeeId: matchedEmp?.employeeId || user?.employeeId || 'EMP-ENG-001',
      speakerDesignation: matchedEmp?.role || 'Executive Lead',
      startTime: `${String(Math.floor(Math.random() * 15)).padStart(2, '0')}:00`,
      endTime: `${String(Math.floor(Math.random() * 15)).padStart(2, '0')}:45`,
      text: newSpeakerText.trim(),
    };

    const updatedUtterances = [newUtterance, ...activeSession.utterances];
    syncActiveSession(undefined, updatedUtterances);

    setNewSpeakerText('');
    setIsAddTranscriptOpen(false);
  };

  const exportMoMReport = () => {
    generateMeetingReport({
      title: momData.meetingTitle || activeSession.title,
      date: momData.date || activeSession.date,
      duration: momData.duration || activeSession.duration,
      organizer: momData.organizer || activeSession.organizer,
      sourceUrl: momData.sourceUrl || activeSession.sourceUrl,
      attendees: momData.attendees || participants.map((p) => `${p.name} (${p.designation})`),
      agenda: momData.agendaTopics?.map((a) => `${a.topic}: ${a.keyPoints?.join(', ')}`) || activeSession.agenda,
      keyDecisions: momData.keyDecisions || [],
      executiveSummary: momData.executiveSummary,
      actionItems: momData.actionItems.map((item) => ({
        title: item.title,
        assignee: item.assigneeEmployeeId ? `${item.assignee} (${item.assigneeEmployeeId})` : item.assignee,
        deadline: item.deadline,
        priority: item.priority,
        status: item.status,
      })),
    });
  };

  const filteredUtterances = activeSession.utterances.filter(
    (u) =>
      !transcriptSearch.trim() ||
      u.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      u.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4 text-sky-600" />
            <span>Meeting Intelligence & MoM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meeting Intelligence & Action Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Searchable multi-speaker transcripts, automated decision logs, and interactive action items with owner delegation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              setMeetingInputMode('link');
              setIsUploadMeetingOpen(true);
            }}
            variant="primary"
            size="sm"
            leftIcon={<Youtube className="w-4 h-4 text-red-400" />}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xs border-0"
          >
            Import YT / Web Link
          </Button>

          <Button
            onClick={() => {
              setMeetingInputMode('audio');
              setIsUploadMeetingOpen(true);
            }}
            variant="secondary"
            size="sm"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload File / Notes
          </Button>

          <Button onClick={() => setIsAddActionOpen(true)} variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            New Action Item
          </Button>

          <Button onClick={exportMoMReport} variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export MoM Report
          </Button>
        </div>
      </div>

      {/* Meeting Selector & Meta Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              activeSession.mediaType === 'youtube_link'
                ? 'bg-red-50 text-red-600 border-red-200'
                : activeSession.mediaType === 'web_link'
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-sky-50 text-sky-600 border-sky-100'
            }`}>
              {activeSession.mediaType === 'youtube_link' ? (
                <Youtube className="w-5 h-5" />
              ) : activeSession.mediaType === 'web_link' ? (
                <Globe className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium shrink-0">Active Session:</span>
                <select
                  value={activeSession.id}
                  onChange={(e) => {
                    const found = sessions.find((s) => s.id === e.target.value);
                    if (found) {
                      setActiveSession(found);
                      setMomData(found.mom);
                      setParticipants(found.participants);
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-500 max-w-full truncate"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.mediaType === 'youtube_link' ? '▶ YT: ' : ''}{s.title} ({s.date})
                    </option>
                  ))}
                </select>

                {activeSession.sourceUrl && (
                  <a
                    href={activeSession.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                    <span>Open Link</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {activeSession.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {activeSession.duration}
                </span>
                <span>•</span>
                <span>Organizer: <strong className="text-sky-700">{activeSession.organizer}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSession.mediaType === 'youtube_link' && (
              <Badge variant="rose" size="md">
                YouTube Broadcast
              </Badge>
            )}
            {activeSession.mediaType === 'web_link' && (
              <Badge variant="indigo" size="md">
                Web Recording Link
              </Badge>
            )}
            <Badge variant="emerald" size="md">
              {activeSession.status}
            </Badge>
          </div>
        </div>

        {/* Embedded YouTube Player or Web Link Banner if Active Session has Video ID */}
        {activeSession.youtubeVideoId && (
          <div className="pt-3 border-t border-slate-100">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 text-white text-xs border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>YouTube Video Recording Player</span>
                </div>
                <a
                  href={activeSession.sourceUrl || `https://www.youtube.com/watch?v=${activeSession.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                >
                  Watch on YouTube <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="aspect-video w-full max-h-[360px]">
                <iframe
                  src={`https://www.youtube.com/embed/${activeSession.youtubeVideoId}?autoplay=0&rel=0`}
                  title={activeSession.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'mom', label: 'Summary & Decisions' },
          { id: 'tasks', label: `Action Items (${momData.actionItems.length})` },
          { id: 'transcript', label: `Transcript (${activeSession.utterances.length})` },
          { id: 'participants', label: `Participants (${participants.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Executive Summary & Decisions */}
      {activeTab === 'mom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Summary, Agenda & Decisions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Executive Briefing Summary</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {momData.executiveSummary}
              </p>
            </Card>

            {/* Key Decisions */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Decisions Logged ({momData.keyDecisions.length})</span>
                </h3>
                <Button onClick={() => setIsAddDecisionOpen(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Decision
                </Button>
              </div>
              <div className="space-y-2.5">
                {momData.keyDecisions.map((dec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 leading-relaxed font-medium">{dec}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Agenda Topics */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <span>Agenda Topics & Outcomes</span>
              </h3>
              <div className="space-y-3">
                {momData.agendaTopics.map((topic, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-900">{topic.topic}</h5>
                    <div className="text-slate-600 text-[11px] space-y-1">
                      <p><strong>Discussion Points:</strong> {topic.keyPoints.join(' • ')}</p>
                      <p className="text-sky-700"><strong>Outcome:</strong> {topic.outcomes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Col: Participants Quick List */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Participants ({participants.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">Click any participant to view profile</p>

              <div className="space-y-2.5">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleParticipantClick(p.employeeId)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 hover:bg-white transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 truncate">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">{p.designation}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Action Items */}
      {activeTab === 'tasks' && (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Deliverables & Action Items</h3>
              <p className="text-xs text-slate-500">Toggle completion, reassign owners, adjust deadlines, and attach notes</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTaskFilterMode('my_tasks')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    taskFilterMode === 'my_tasks'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  My Tasks Only
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    taskFilterMode === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Team Deliverables ({momData.actionItems.length})
                </button>
              </div>

              <Button onClick={() => setIsAddActionOpen(true)} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Add Action Item
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const displayedItems = momData.actionItems.filter((item) => {
                if (taskFilterMode === 'all') return true;
                if (!user) return true;
                const empIdMatch = Boolean(item.assigneeEmployeeId && item.assigneeEmployeeId === user.employeeId);
                const nameMatch = Boolean(
                  item.assignee &&
                  user.displayName &&
                  (item.assignee.toLowerCase().includes(user.displayName.toLowerCase()) ||
                    user.displayName.toLowerCase().includes(item.assignee.toLowerCase()))
                );
                return empIdMatch || nameMatch;
              });

              if (displayedItems.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">No action items assigned to you in this session.</p>
                  </div>
                );
              }

              return displayedItems.map((item) => {
                const isDone = item.status === 'COMPLETED';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isDone
                        ? 'bg-slate-50/60 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200/80 shadow-xs text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleActionItemStatus(item.id)}
                          className="mt-0.5 text-sky-600 hover:text-sky-700 transition-colors shrink-0"
                        >
                          {isDone ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span>
                              Owner:{' '}
                              <button
                                onClick={() => item.assigneeEmployeeId && handleParticipantClick(item.assigneeEmployeeId)}
                                className="font-bold text-sky-700 hover:underline"
                              >
                                {item.assignee}
                              </button>{' '}
                              <span className="font-mono text-slate-400">({item.assigneeEmployeeId})</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Due: <strong className="text-slate-700">{item.deadline}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={item.priority === 'HIGH' ? 'rose' : item.priority === 'MEDIUM' ? 'amber' : 'slate'} size="sm">
                          {item.priority}
                        </Badge>
                        <Badge variant={isDone ? 'emerald' : item.status === 'IN_PROGRESS' ? 'indigo' : 'amber'} size="sm">
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Item Notes */}
                    {item.notes && item.notes.length > 0 && (
                      <div className="pl-8 space-y-1.5 pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Action Notes:
                        </span>
                        {item.notes.map((n) => (
                          <div key={n.id} className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-slate-700">
                            <span className="font-bold text-sky-700">{n.author}:</span> {n.text}
                            <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Buttons: Reassign, Change Deadline, Add Note */}
                    <div className="pl-8 pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReassignItem(item);
                          setSelectedNewAssigneeId(item.assigneeEmployeeId || registeredEmployees[0].employeeId);
                          setIsReassignModalOpen(true);
                        }}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Reassign Owner
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeadlineItem(item);
                          setNewDeadlineDate(item.deadline);
                          setIsDeadlineModalOpen(true);
                        }}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Change Deadline
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNoteItem(item);
                          setNewNoteText('');
                          setIsNoteModalOpen(true);
                        }}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      )}

      {/* TAB 3: Searchable Transcript */}
      {activeTab === 'transcript' && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Speaker Transcript</h3>
              <p className="text-xs text-slate-500">Verbatim timestamped utterance logs</p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddTranscriptOpen(true)} variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Speaker Line
              </Button>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search transcript..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredUtterances.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => u.speakerEmployeeId && handleParticipantClick(u.speakerEmployeeId)}
                      className="font-bold text-sky-700 hover:underline"
                    >
                      {u.speaker}
                    </button>
                    <span className="text-[10px] text-slate-400">• {u.speakerDesignation}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{u.startTime} - {u.endTime}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{u.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: Participants */}
      {activeTab === 'participants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((p) => (
            <Card
              key={p.id}
              onClick={() => handleParticipantClick(p.employeeId)}
              className="p-4 space-y-3 cursor-pointer hover:border-sky-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 truncate">{p.name}</h4>
                  <span className="text-[11px] font-mono text-sky-700 font-bold block">{p.employeeId}</span>
                  <p className="text-[10px] text-slate-500 truncate">{p.designation}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{p.team}</span>
                <span className="text-sky-600 font-bold group-hover:underline">View Profile &rarr;</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Upload & AI Process Meeting Recording or Manual/Link Input */}
      <Modal
        isOpen={isUploadMeetingOpen}
        onClose={() => setIsUploadMeetingOpen(false)}
        title="Ingest YouTube Link, Recording, or Document for AI MoM"
        maxWidth="lg"
      >
        <form onSubmit={handleProcessNewMeeting} className="space-y-5 text-left">
          {/* Input Mode Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMeetingInputMode('link')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                meetingInputMode === 'link'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YT / Web Link</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingInputMode('audio')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                meetingInputMode === 'audio'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-sky-600" />
              <span>Audio/Video File</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingInputMode('document')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                meetingInputMode === 'document'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Transcript Doc</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingInputMode('manual')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                meetingInputMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Manual Text</span>
            </button>
          </div>

          {/* YouTube / Web Link Input */}
          {meetingInputMode === 'link' && (
            <div className="space-y-3 bg-red-50/50 p-4 rounded-2xl border border-red-200/80">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <span>YouTube Video Link or Meeting URL</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    required
                    value={uploadMeetingUrl}
                    onChange={(e) => setUploadMeetingUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or Zoom / Google Meet / Loom link"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-2xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Synapse will fetch captions, video details, extract timestamped multi-speaker utterances, and synthesize executive MoM deliverables.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="pt-2 border-t border-red-200/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Sample Links (Click to test):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMeetingUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setUploadMeetingTitle('YouTube Executive AI & Keynote Broadcast');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-red-100/80 text-red-700 border border-red-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span>Sample YouTube Link 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadMeetingUrl('https://youtu.be/3JZ_D3ELwOQ');
                      setUploadMeetingTitle('YouTube Distributed Infrastructure & Architecture Sync');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-red-100/80 text-red-700 border border-red-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span>Sample YouTube Link 2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadMeetingUrl('https://zoom.us/rec/play/executive-strategy-session-2026');
                      setUploadMeetingTitle('Zoom Cloud Recording & Operations Sync');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Globe className="w-3 h-3 text-indigo-600" />
                    <span>Sample Zoom Recording</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Meeting Session Title (Optional)</label>
            <input
              type="text"
              value={uploadMeetingTitle}
              onChange={(e) => setUploadMeetingTitle(e.target.value)}
              placeholder="Auto-detected from YouTube link or enter custom title..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* File Upload vs Manual Text */}
          {meetingInputMode === 'audio' && (
            <FileDropzone
              onFileSelect={(file) => setUploadMeetingFile(file)}
              currentFileName={uploadMeetingFile?.name}
              acceptTypes=".mp3, .wav, .m4a, .mp4, .webm, .aac, .flac"
              label="Drop Audio/Video Recording File"
              sublabel="Supports MP3, WAV, MP4, M4A, WEBM up to 100MB"
            />
          )}

          {meetingInputMode === 'document' && (
            <FileDropzone
              onFileSelect={(file) => setUploadMeetingFile(file)}
              currentFileName={uploadMeetingFile?.name}
              acceptTypes=".pdf, .docx, .txt, .json, .csv"
              label="Drop Transcript Document File"
              sublabel="Supports PDF, DOCX, TXT, JSON, CSV"
            />
          )}

          {meetingInputMode === 'manual' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Paste Meeting Notes / Verbatim Transcript or Link</label>
              <textarea
                rows={5}
                required
                value={uploadMeetingText}
                onChange={(e) => setUploadMeetingText(e.target.value)}
                placeholder="Paste YouTube link, speaker lines, executive meeting notes, or decisions here..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessingMeeting && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-sky-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-900">{processingStage}</p>
                <p className="text-[11px] text-sky-700">Synthesizing MoM, key decisions, action items, and voice briefings...</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsUploadMeetingOpen(false)}
              disabled={isProcessingMeeting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isProcessingMeeting}
              leftIcon={isProcessingMeeting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            >
              {isProcessingMeeting ? 'Processing AI MoM...' : 'Process Meeting with AI'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Key Decision */}
      <Modal isOpen={isAddDecisionOpen} onClose={() => setIsAddDecisionOpen(false)} title="Add Key Decision Log" maxWidth="md">
        <form onSubmit={handleAddKeyDecision} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Decision Description</label>
            <textarea
              rows={3}
              required
              value={newDecisionText}
              onChange={(e) => setNewDecisionText(e.target.value)}
              placeholder="e.g. Approved 35% increase in GPU cluster allocation to support enterprise document indexing."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddDecisionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Transcript Line */}
      <Modal isOpen={isAddTranscriptOpen} onClose={() => setIsAddTranscriptOpen(false)} title="Add Speaker Transcript Utterance" maxWidth="md">
        <form onSubmit={handleAddTranscriptUtterance} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Speaker Name</label>
            <input
              type="text"
              required
              value={newSpeakerName}
              onChange={(e) => setNewSpeakerName(e.target.value)}
              placeholder="e.g. Charvi Sharma"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Spoken Text / Dialogue</label>
            <textarea
              rows={3}
              required
              value={newSpeakerText}
              onChange={(e) => setNewSpeakerText(e.target.value)}
              placeholder="Enter spoken utterance lines..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddTranscriptOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Utterance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reassign Modal */}
      <Modal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} title="Reassign Action Item Owner" maxWidth="md">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600">
            Select an employee from the corporate directory to take over <strong>"{reassignItem?.title}"</strong>:
          </p>
          <select
            value={selectedNewAssigneeId}
            onChange={(e) => setSelectedNewAssigneeId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            {registeredEmployees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.displayName} ({emp.employeeId}) • {emp.role}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleReassignOwner}>
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Deadline Modal */}
      <Modal isOpen={isDeadlineModalOpen} onClose={() => setIsDeadlineModalOpen(false)} title="Adjust Delivery Deadline" maxWidth="md">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600">Set a new completion deadline for <strong>"{deadlineItem?.title}"</strong>:</p>
          <input
            type="date"
            value={newDeadlineDate}
            onChange={(e) => setNewDeadlineDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDeadlineModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleChangeDeadline}>
              Save Deadline
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add Action Item Note" maxWidth="md">
        <div className="space-y-4 text-left">
          <textarea
            rows={3}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Type your status update, blocker note, or audit observation..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddNoteToActionItem}>
              Attach Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create New Action Item Modal */}
      <Modal isOpen={isAddActionOpen} onClose={() => setIsAddActionOpen(false)} title="Create New Action Item" maxWidth="md">
        <form onSubmit={handleCreateNewActionItem} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Action Item Title</label>
            <input
              type="text"
              required
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="e.g. Audit cloud firewall rules"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assignee</label>
              <select
                value={newActionAssigneeId}
                onChange={(e) => setNewActionAssigneeId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                {registeredEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.displayName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Deadline</label>
              <input
                type="date"
                value={newActionDeadline}
                onChange={(e) => setNewActionDeadline(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Priority Level</label>
            <select
              value={newActionPriority}
              onChange={(e) => setNewActionPriority(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddActionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Deliverable
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={selectedProfileEmployee}
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </div>
  );
}
