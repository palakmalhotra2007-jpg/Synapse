'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  ShieldAlert,
  Video,
  FileText,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  Plus,
  Volume2,
  VolumeX,
  User,
  CheckSquare,
  Users,
  ShieldCheck,
  Building,
  ArrowRight,
  KeyRound,
  Lock,
  ExternalLink,
  Layers,
  AlertTriangle,
  FolderLock,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/firebase/authContext';
import { sampleActivityFeed } from '@/lib/mockData/dashboard';
import { sampleMeetings } from '@/lib/mockData/meetings';
import { sampleDocuments } from '@/lib/mockData/documents';
import { sampleTransactions } from '@/lib/mockData/transactions';
import { ActionItem } from '@/types/meeting';
import { TEAMS_LIST, getStoredUsers } from '@/lib/auth/usersDb';
import { UnifiedAIChatModal } from '@/components/workspace/UnifiedAIChatModal';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { UserProfile } from '@/types/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [actionItems, setActionItems] = useState<ActionItem[]>(sampleMeetings[0].mom.actionItems);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAILLMOpen, setIsAILLMOpen] = useState(false);
  const [aiLLMInitialMode, setAiLLMInitialMode] = useState<'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection'>('chat');
  const [isSpeakingTasks, setIsSpeakingTasks] = useState(false);
  
  // Profile Drawer state
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(user?.displayName || 'Alex Sterling');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-09-18');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const currentTeamInfo = TEAMS_LIST.find((t) => t.id === user?.teamId) || TEAMS_LIST[0];
  const allUsers = getStoredUsers();

  const completedCount = actionItems.filter((i) => i.status === 'COMPLETED').length;
  const pendingCount = actionItems.filter((i) => i.status !== 'COMPLETED').length;

  const toggleTaskStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
            }
          : item
      )
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      status: 'PENDING',
      category: user?.teamName || 'General',
    };

    setActionItems([newItem, ...actionItems]);
    setNewTaskTitle('');
    setIsAddTaskOpen(false);
  };

  const handleOpenUserProfile = (targetUser?: UserProfile | null) => {
    if (targetUser) {
      setSelectedProfile(targetUser);
      setIsProfileOpen(true);
    } else if (user) {
      setSelectedProfile(user);
      setIsProfileOpen(true);
    }
  };

  const speakAllPendingTasks = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const pending = actionItems.filter((i) => i.status !== 'COMPLETED');
    if (pending.length === 0) {
      const u = new SpeechSynthesisUtterance('All tasks are completed. Great work.');
      window.speechSynthesis.speak(u);
      return;
    }

    const taskText = `You have ${pending.length} main tasks to complete. First: ${pending
      .map((t, idx) => `Task ${idx + 1}: ${t.title}, assigned to ${t.assignee}, due ${t.deadline}`)
      .join('. Next: ')}.`;

    const utterance = new SpeechSynthesisUtterance(taskText);
    utterance.rate = 1.05;
    utterance.pitch = 1.2;

    utterance.onstart = () => setIsSpeakingTasks(true);
    utterance.onend = () => setIsSpeakingTasks(false);
    utterance.onerror = () => setIsSpeakingTasks(false);

    window.speechSynthesis.speak(utterance);
  };

  const speakSingleTask = (task: ActionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `Task: ${task.title}. Assigned to ${task.assignee}. Priority: ${task.priority}. Due: ${task.deadline}.`
    );
    utterance.rate = 1.05;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-100 min-h-screen">
      {/* Executive Command Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SYNAPSE SECURE ENTERPRISE OS</span>
              </div>
              <Badge variant="cyan" size="sm">
                {user?.teamName || 'Executive Operations'}
              </Badge>
              <span className="text-xs font-mono px-2.5 py-0.5 bg-slate-950 text-cyan-400 border border-slate-800 rounded-md font-bold">
                {user?.employeeId || 'EMP-EXEC-001'}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-md font-bold">
                Clearance: {user?.securityClearance || 'Level 5 Executive'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Enterprise Operations Command
              </h1>
              <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                Logged in as <strong className="text-white cursor-pointer hover:text-cyan-400 underline decoration-dotted" onClick={() => handleOpenUserProfile(user)}>{user?.displayName || 'Alex Sterling'}</strong> ({user?.role}). Clearance: <strong className="text-purple-300">{user?.securityClearance}</strong>. Active Passkeys: <strong className="text-emerald-400">{user?.passkeys?.length || 1} Registered</strong>.
              </p>
            </div>

            {/* Quick module action pills */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="glow"
                size="sm"
                onClick={() => handleOpenUserProfile(user)}
                leftIcon={<User className="w-4 h-4" />}
              >
                View My Profile & Passkeys
              </Button>

              <Link href="/documents">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileText className="w-4 h-4" />}
                  className="border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50"
                >
                  Document Vaults
                </Button>
              </Link>

              <Link href="/fraud">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ShieldAlert className="w-4 h-4" />}
                  className="border-slate-700 text-slate-200 hover:text-rose-400 hover:border-rose-500/50"
                >
                  Omni Fraud Forensics
                </Button>
              </Link>

              <Link href="/security">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  className="border-slate-700 text-slate-200 hover:text-purple-400 hover:border-purple-500/50"
                >
                  Access & Audit Logs
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Security Status Badge */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0 w-full lg:w-72">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">Security State</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SECURE
              </span>
            </div>
            <div className="flex justify-between text-slate-300 pt-1">
              <span>RBAC Role:</span>
              <span className="font-mono text-cyan-400 font-bold">{user?.rbacRole || 'Admin'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Active Sessions:</span>
              <span className="font-mono text-white font-bold">{user?.activeSessions?.length || 1} Device</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>MFA / Passkeys:</span>
              <span className="font-mono text-emerald-400 font-bold">WebAuthn Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Summary Telemetry Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Platform Intelligence Telemetry</span>
          </h3>
          <span className="text-xs text-slate-500">Live system status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/documents" className="block">
            <Card className="p-4 space-y-2 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Vault Documents</span>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                  <FolderLock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{sampleDocuments.length}</span>
                <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  6 Vaults
                </span>
              </div>
              <p className="text-xs text-slate-400">Classified contracts & policies</p>
            </Card>
          </Link>

          <Link href="/fraud" className="block">
            <Card className="p-4 space-y-2 hover:border-rose-500/40 transition-all group">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">AML Transactions</span>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{sampleTransactions.length}</span>
                <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                  {sampleTransactions.filter(t => t.riskScore >= 70).length} Flagged
                </span>
              </div>
              <p className="text-xs text-slate-400">Wire ledger forensic checks</p>
            </Card>
          </Link>

          <Link href="/meetings" className="block">
            <Card className="p-4 space-y-2 hover:border-purple-500/40 transition-all group">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Executive MoMs</span>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{sampleMeetings.length}</span>
                <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Transcribed
                </span>
              </div>
              <p className="text-xs text-slate-400">Briefings with action item sync</p>
            </Card>
          </Link>

          <Link href="/employees" className="block">
            <Card className="p-4 space-y-2 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Employee Directory</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{allUsers.length}</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  All Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Personnel profiles & clearances</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Main Content Layout: Action Items / Tasks & Intelligence Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Priority Deliverables & Action Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>Assigned Action Items & Deliverables ({pendingCount} Pending)</span>
                </h3>
                <p className="text-xs text-slate-400">One-click completion, status tracking and audio briefing</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={speakAllPendingTasks}
                  leftIcon={
                    isSpeakingTasks ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    )
                  }
                  className="text-xs border-slate-700"
                >
                  {isSpeakingTasks ? 'Stop Audio' : 'Audio Briefing'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  New Item
                </Button>
              </div>
            </div>

            {/* Task Checklist Items */}
            <div className="space-y-2.5">
              {actionItems.map((item) => {
                const isDone = item.status === 'COMPLETED';
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTaskStatus(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isDone
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-cyan-400 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-500' : 'text-white group-hover:text-cyan-300'}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>Owner: <strong className="text-slate-300">{item.assignee}</strong></span>
                          <span>•</span>
                          <span>Due: <strong className="text-slate-300">{item.deadline}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge
                        variant={item.priority === 'HIGH' ? 'rose' : item.priority === 'MEDIUM' ? 'amber' : 'slate'}
                        size="sm"
                      >
                        {item.priority}
                      </Badge>

                      <button
                        onClick={(e) => speakSingleTask(item, e)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Speak this item aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Navigation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/fraud"
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 hover:border-rose-500/40 transition-all border border-slate-800 group block"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                Omni Fraud Analysis
              </h4>
              <p className="text-xs text-slate-400 mt-1">Wire transfer anomaly detection & forensic notes</p>
            </Link>

            <Link
              href="/meetings"
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/40 transition-all border border-slate-800 group block"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                Meeting Intelligence
              </h4>
              <p className="text-xs text-slate-400 mt-1">AI voice MoM generation & actionable task export</p>
            </Link>

            <Link
              href="/documents"
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/40 transition-all border border-slate-800 group block"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Document Vaults
              </h4>
              <p className="text-xs text-slate-400 mt-1">RBAC secure vaults, 6-stage upload & diff tool</p>
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Intelligence Activity Stream & Team Personnel */}
        <div className="space-y-6">
          {/* Intelligence Activity Stream */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>System Security & Audit Stream</span>
              </h3>
              <Link href="/security" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {sampleActivityFeed.map((item) => (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors group block"
                >
                  <div className="mt-0.5">
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badgeText}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Department Specialists Quick Access */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Department Specialists</span>
              </h3>
              <Link href="/employees" className="text-xs text-cyan-400 hover:underline">
                Directory
              </Link>
            </div>

            <div className="space-y-2">
              {allUsers.slice(0, 4).map((u) => (
                <div
                  key={u.uid}
                  onClick={() => handleOpenUserProfile(u)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 group-hover:border-cyan-500/50">
                      {u.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                        {u.displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.role}
                      </p>
                    </div>
                  </div>
                  <Badge variant={u.securityClearance.includes('Executive') ? 'rose' : u.securityClearance.includes('Cyber') ? 'cyan' : 'amber'} size="sm">
                    {u.securityClearance.split(' ')[2] || u.securityClearance}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Create New Action Item"
        maxWidth="md"
      >
        <form onSubmit={handleAddNewTask} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Deliverable Title</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Audit cloud database encryption keys"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assignee</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Deadline</label>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Priority</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={selectedProfile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Unified AI LLM & Vision Modal */}
      <UnifiedAIChatModal
        isOpen={isAILLMOpen}
        onClose={() => setIsAILLMOpen(false)}
        initialMode={aiLLMInitialMode}
      />
    </div>
  );
}
