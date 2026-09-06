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
  Scan,
  Users,
  ShieldCheck,
  Building,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/firebase/authContext';
import { sampleActivityFeed } from '@/lib/mockData/dashboard';
import { sampleMeetings } from '@/lib/mockData/meetings';
import { ActionItem } from '@/types/meeting';
import { TEAMS_LIST } from '@/lib/auth/usersDb';
import { LiveCharacter } from '@/components/character/LiveCharacter';
import { UnifiedAIChatModal } from '@/components/workspace/UnifiedAIChatModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [actionItems, setActionItems] = useState<ActionItem[]>(sampleMeetings[0].mom.actionItems);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAILLMOpen, setIsAILLMOpen] = useState(false);
  const [aiLLMInitialMode, setAiLLMInitialMode] = useState<'chat' | 'image_search' | 'chart_understanding' | 'duplicate_detection'>('chat');
  const [isSpeakingTasks, setIsSpeakingTasks] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(user?.displayName || 'Alex Sterling');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-09-12');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const currentTeamInfo = TEAMS_LIST.find((t) => t.id === user?.teamId) || TEAMS_LIST[0];

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
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Hero Welcome Banner with Live Anime Character */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-950 border border-synapse-cyan/30 glass-card-glow shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-synapse-cyan/10 border border-synapse-cyan/30 rounded-full text-synapse-cyan text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synapse Cognitive Enterprise OS</span>
              </div>
              <Badge variant="cyan" size="sm">
                {user?.teamName || 'Executive Ops'}
              </Badge>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950/80 text-synapse-cyan border border-slate-800 rounded-md font-bold">
                {user?.employeeId || 'EMP-EXEC-001'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-synapse-cyan via-purple-300 to-pink-300">
                {user?.displayName || 'Alex Sterling'}
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Assigned to <strong>{user?.teamName}</strong> as <strong>{user?.role}</strong>. Your department has{' '}
              <strong className="text-synapse-cyan">{currentTeamInfo.memberCount} specialists</strong> and{' '}
              <strong className="text-purple-300">{currentTeamInfo.documentCount} indexed vault files</strong>.
            </p>

            {/* Quick Action Prompt Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="glow"
                size="sm"
                onClick={() => {
                  setAiLLMInitialMode('chat');
                  setIsAILLMOpen(true);
                }}
                leftIcon={<Bot className="w-4 h-4" />}
              >
                Open AI Multi-Modal Assistant
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAiLLMInitialMode('image_search');
                  setIsAILLMOpen(true);
                }}
                className="border-synapse-cyan/30 text-slate-200 hover:text-synapse-cyan hover:border-synapse-cyan"
              >
                Inspect Image / Chart
              </Button>
            </div>
          </div>

          {/* AI Companion Quick Status Widget */}
          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl text-center max-w-[220px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-synapse-cyan/20 to-synapse-purple/20 border border-synapse-cyan/40 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <Sparkles className="w-6 h-6 text-synapse-cyan animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-100">Live AI Avatar Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Companion online in bottom corner. Hover or click anytime to talk.
            </p>
          </div>
        </div>
      </div>

      {/* "How Many Things Done" Overview Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-synapse-cyan" />
            <span>Operational Summary • How Many Things Done</span>
          </h3>
          <span className="text-xs text-slate-400">All metrics real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tasks Completed</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">{completedCount + 15}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +{completedCount} this week
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Action items closed by team</p>
          </Card>

          <Card className="p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Documents Audited</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">24</span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">
                100% Indexed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contracts, invoices & policies</p>
          </Card>

          <Card className="p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Fraud Checks Cleared</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">142</span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                3 Anomalies Flagged
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ledger wire transactions verified</p>
          </Card>

          <Card className="p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Meeting MoMs Transcribed</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">12</span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                Voice Synthesized
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Executive & team briefings</p>
          </Card>
        </div>
      </div>

      {/* Main Tasks for User & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Tasks for the User */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-synapse-cyan" />
                  <span>Main Tasks for You ({pendingCount} Pending)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Prioritized deliverables with one-click completion and voice audio</p>
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
                      <Volume2 className="w-3.5 h-3.5 text-synapse-cyan" />
                    )
                  }
                  className="text-xs border-slate-700"
                >
                  {isSpeakingTasks ? 'Stop Audio' : 'Speak All Tasks'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  New Task
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
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isDone
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-synapse-cyan/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-synapse-cyan cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-500' : 'text-white group-hover:text-synapse-cyan'}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
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
                        className="p-1.5 text-slate-400 hover:text-synapse-cyan rounded-lg hover:bg-slate-800 transition-colors"
                        title="Speak this task aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/fraud"
              className="p-4 rounded-2xl glass-panel hover:border-rose-500/40 hover:bg-slate-900 transition-all border border-slate-800 group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                Omni Fraud Analysis
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Wire ledger cross-auditing and forensic inspection</p>
            </Link>

            <Link
              href="/meetings"
              className="p-4 rounded-2xl glass-panel hover:border-cyan-500/40 hover:bg-slate-900 transition-all border border-slate-800 group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                Meeting Intelligence
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Voice MoM generation with participant designations</p>
            </Link>

            <Link
              href="/documents"
              className="p-4 rounded-2xl glass-panel hover:border-emerald-500/40 hover:bg-slate-900 transition-all border border-slate-800 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Document Vaults
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Team document repository & clause extraction</p>
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Intelligence Activity Stream */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-synapse-cyan" />
                <span>Recent System Activities</span>
              </h3>
              <span className="text-[10px] text-slate-400">Live feed</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {sampleActivityFeed.map((item) => (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="mt-0.5">
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badgeText}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-synapse-cyan transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {item.timestamp}
                    </span>
                  </div>
                </Link>
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
            <label className="text-xs font-semibold text-slate-300">Task Title / Deliverable</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Audit cloud database encryption keys"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Assignee</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Deadline</label>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>
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

      {/* Unified AI LLM & Vision Modal */}
      <UnifiedAIChatModal
        isOpen={isAILLMOpen}
        onClose={() => setIsAILLMOpen(false)}
        initialMode={aiLLMInitialMode}
      />
    </div>
  );
}
