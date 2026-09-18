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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { sampleMeetings, sampleParticipants } from '@/lib/mockData/meetings';
import { MinutesOfMeeting, ActionItem, MeetingParticipant, MeetingSession, ActionItemNote } from '@/types/meeting';
import { getStoredUsers, addAuditLogEntry } from '@/lib/auth/usersDb';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { useAuth } from '@/lib/firebase/authContext';
import { UserProfile } from '@/types/dashboard';

export default function MeetingIntelligencePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeetingSession[]>(sampleMeetings);
  const [activeSession, setActiveSession] = useState<MeetingSession>(sampleMeetings[0]);
  const [momData, setMomData] = useState<MinutesOfMeeting>(sampleMeetings[0].mom);
  const [participants, setParticipants] = useState<MeetingParticipant[]>(sampleMeetings[0].participants);
  const [activeTab, setActiveTab] = useState<'mom' | 'tasks' | 'transcript' | 'participants'>('mom');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Selected Employee Profile Drawer State
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<UserProfile | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

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
  const [newActionAssigneeId, setNewActionAssigneeId] = useState(participants[0]?.employeeId || 'EMP-EXEC-001');
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

  const toggleActionItemStatus = (id: string) => {
    setMomData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
          return { ...item, status: nextStatus };
        }
        return item;
      }),
    }));
  };

  const handleReassignOwner = () => {
    if (!reassignItem || !selectedNewAssigneeId) return;
    const targetEmp = registeredEmployees.find((u) => u.employeeId === selectedNewAssigneeId);
    if (!targetEmp) return;

    setMomData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
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
    }));

    addAuditLogEntry({
      eventType: 'permission_change',
      actorEmployeeId: user?.employeeId || 'EMP-EXEC-001',
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

    setMomData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === deadlineItem.id ? { ...item, deadline: newDeadlineDate } : item
      ),
    }));

    setIsDeadlineModalOpen(false);
    setDeadlineItem(null);
  };

  const handleAddNoteToActionItem = () => {
    if (!noteItem || !newNoteText.trim()) return;

    const newNote: ActionItemNote = {
      id: `n-${Date.now()}`,
      author: user?.displayName || 'Active Employee',
      authorEmployeeId: user?.employeeId || 'EMP-EXEC-001',
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };

    setMomData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === noteItem.id
          ? { ...item, notes: [...(item.notes || []), newNote] }
          : item
      ),
    }));

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

    setMomData((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));

    setNewActionTitle('');
    setIsAddActionOpen(false);
  };

  const exportMoMReport = () => {
    const text = `# SYNAPSE ENTERPRISE MINUTES OF MEETING (MoM)
Title: ${momData.meetingTitle}
Date: ${momData.date} | Duration: ${momData.duration}
Organizer: ${momData.organizer || 'Executive Board'} (${momData.organizerEmployeeId || 'EMP-EXEC-001'})
Location: ${momData.location || 'Encrypted Video Bridge'}

## Attendees
${momData.participants?.map((p) => `- ${p.name} (${p.designation}, ${p.employeeId})`).join('\n')}

## Executive Summary
${momData.executiveSummary}

## Agenda & Topics
${momData.agendaTopics.map((a) => `### ${a.topic}\n- Key Points: ${a.keyPoints.join(', ')}\n- Outcome: ${a.outcomes}`).join('\n\n')}

## Key Decisions
${momData.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## Action Items & Direct Deliverables
${momData.actionItems.map((item, i) => `### Item ${i + 1}: ${item.title} [${item.priority} PRIORITY]
- Owner: ${item.assignee} (${item.assigneeEmployeeId})
- Deadline: ${item.deadline}
- Status: ${item.status}
- Notes: ${item.notes?.map((n) => n.text).join(' | ') || 'None'}`).join('\n\n')}`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meeting_Minutes_${momData.date}.md`;
    a.click();
  };

  const filteredUtterances = activeSession.utterances.filter(
    (u) =>
      !transcriptSearch.trim() ||
      u.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      u.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Executive Meeting Intelligence & MoM Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Meeting Intelligence & Action Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Searchable multi-speaker transcripts, automated key decision logs, and interactive action items with owner delegation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={() => setIsAddActionOpen(true)} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
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
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{activeSession.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {activeSession.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {activeSession.duration}
                </span>
                <span>•</span>
                <span>Organizer: <strong className="text-cyan-400">{activeSession.organizer}</strong></span>
              </div>
            </div>
          </div>

          <Badge variant="emerald" size="md">
            {activeSession.status}
          </Badge>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'mom', label: 'Executive Summary & Decisions' },
          { id: 'tasks', label: `Interactive Action Items (${momData.actionItems.length})` },
          { id: 'transcript', label: `Searchable Transcript (${activeSession.utterances.length} Utterances)` },
          { id: 'participants', label: `Participants (${participants.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 border border-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
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
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Executive Briefing Summary</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {momData.executiveSummary}
              </p>
            </Card>

            {/* Key Decisions */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Key Decisions Logged ({momData.keyDecisions.length})</span>
              </h3>
              <div className="space-y-2.5">
                {momData.keyDecisions.map((dec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 leading-relaxed font-medium">{dec}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Agenda Topics */}
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-purple-400" />
                <span>Agenda Topics & Outcomes</span>
              </h3>
              <div className="space-y-3">
                {momData.agendaTopics.map((topic, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <h5 className="font-bold text-white">{topic.topic}</h5>
                    <div className="text-slate-400 text-[11px] space-y-1">
                      <p><strong>Discussion Points:</strong> {topic.keyPoints.join(' • ')}</p>
                      <p className="text-cyan-400"><strong>Outcome:</strong> {topic.outcomes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Col: Participants Quick List */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Participants ({participants.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400">Click any participant to view full identity & security profile</p>

              <div className="space-y-2.5">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleParticipantClick(p.employeeId)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 truncate">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{p.designation}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Deliverables & Action Items Matrix</h3>
              <p className="text-xs text-slate-400">Toggle completion, reassign owners, adjust deadlines, and attach audit notes</p>
            </div>

            <Button onClick={() => setIsAddActionOpen(true)} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Action Item
            </Button>
          </div>

          <div className="space-y-3">
            {momData.actionItems.map((item) => {
              const isDone = item.status === 'COMPLETED';
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleActionItemStatus(item.id)}
                        className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                      >
                        {isDone ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-slate-500" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>
                            Owner:{' '}
                            <button
                              onClick={() => item.assigneeEmployeeId && handleParticipantClick(item.assigneeEmployeeId)}
                              className="font-bold text-cyan-400 hover:underline"
                            >
                              {item.assignee}
                            </button>{' '}
                            <span className="font-mono text-slate-500">({item.assigneeEmployeeId})</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Due: <strong className="text-slate-200">{item.deadline}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={item.priority === 'HIGH' ? 'rose' : item.priority === 'MEDIUM' ? 'amber' : 'slate'} size="sm">
                        {item.priority}
                      </Badge>
                      <Badge variant={isDone ? 'emerald' : item.status === 'IN_PROGRESS' ? 'purple' : 'amber'} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Item Notes */}
                  {item.notes && item.notes.length > 0 && (
                    <div className="pl-8 space-y-1.5 pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Action Notes:
                      </span>
                      {item.notes.map((n) => (
                        <div key={n.id} className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                          <span className="font-bold text-cyan-400">{n.author}:</span> {n.text}
                          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Buttons: Reassign, Change Deadline, Add Note */}
                  <div className="pl-8 pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/40">
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
            })}
          </div>
        </Card>
      )}

      {/* TAB 3: Searchable Transcript */}
      {activeTab === 'transcript' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Speaker Transcript</h3>
              <p className="text-xs text-slate-400">Verbatim timestamped utterance logs</p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search transcript..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredUtterances.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => u.speakerEmployeeId && handleParticipantClick(u.speakerEmployeeId)}
                      className="font-bold text-cyan-400 hover:underline"
                    >
                      {u.speaker}
                    </button>
                    <span className="text-[10px] text-slate-500">• {u.speakerDesignation}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{u.startTime} - {u.endTime}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{u.text}</p>
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
              className="p-4 space-y-3 cursor-pointer hover:border-cyan-500/40 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 truncate">{p.name}</h4>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold block">{p.employeeId}</span>
                  <p className="text-[10px] text-slate-400 truncate">{p.designation}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{p.team}</span>
                <span className="text-cyan-400 font-bold group-hover:underline">View Profile &rarr;</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reassign Modal */}
      <Modal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} title="Reassign Action Item Owner" maxWidth="md">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-300">
            Select a verified employee from the corporate directory to take over <strong>"{reassignItem?.title}"</strong>:
          </p>
          <select
            value={selectedNewAssigneeId}
            onChange={(e) => setSelectedNewAssigneeId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
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
          <p className="text-xs text-slate-300">Set a new completion deadline for <strong>"{deadlineItem?.title}"</strong>:</p>
          <input
            type="date"
            value={newDeadlineDate}
            onChange={(e) => setNewDeadlineDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
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
            <label className="text-xs font-semibold text-slate-300">Action Item Title</label>
            <input
              type="text"
              required
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="e.g. Audit cloud firewall rules"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assignee</label>
              <select
                value={newActionAssigneeId}
                onChange={(e) => setNewActionAssigneeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                {registeredEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.displayName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Deadline</label>
              <input
                type="date"
                value={newActionDeadline}
                onChange={(e) => setNewActionDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Priority Level</label>
            <select
              value={newActionPriority}
              onChange={(e) => setNewActionPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
