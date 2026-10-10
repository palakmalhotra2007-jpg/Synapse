'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  FileText,
  Zap,
  Plus,
  Volume2,
  VolumeX,
  User,
  CheckSquare,
  FolderLock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/firebase/authContext';
import { sampleActivityFeed } from '@/lib/mockData/dashboard';
import { sampleMeetings } from '@/lib/mockData/meetings';
import { sampleDocuments } from '@/lib/mockData/documents';
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
  const [newTaskAssignee, setNewTaskAssignee] = useState(user?.displayName || 'Charvi Sharma');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-09-18');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Filter tasks to ONLY display items assigned to the logged-in user
  const userActionItems = actionItems.filter((item) => {
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

  const pendingCount = userActionItems.filter((i) => i.status !== 'COMPLETED').length;

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
      assignee: user?.displayName || newTaskAssignee,
      assigneeEmployeeId: user?.employeeId || 'EMP-ENG-001',
      assigneeDesignation: user?.role || 'Executive Lead',
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
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-800 min-h-screen text-left bg-slate-50">
      {/* User Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" size="sm">
                {user?.teamName || 'Executive Operations'}
              </Badge>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md font-bold">
                {user?.employeeId || 'EMP-ENG-001'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.displayName || 'Charvi Sharma'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                {user?.role} • {user?.department || 'Operations'}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenUserProfile(user)}
                leftIcon={<User className="w-4 h-4" />}
              >
                View Profile
              </Button>

              <Link href="/documents">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  Document Workspace
                </Button>
              </Link>

              <Link href="/meetings">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Video className="w-4 h-4" />}
                >
                  Meetings & Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Assigned Tasks</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{pendingCount}</span>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              Pending
            </span>
          </div>
          <p className="text-xs text-slate-500">Action items assigned to you</p>
        </Card>

        <Link href="/documents" className="block">
          <Card className="p-4 space-y-2 hover:border-sky-300 transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Vault Documents</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <FolderLock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{sampleDocuments.length}</span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Available
              </span>
            </div>
            <p className="text-xs text-slate-500">Indexed team & vault documents</p>
          </Card>
        </Link>

        <Link href="/meetings" className="block">
          <Card className="p-4 space-y-2 hover:border-sky-300 transition-all group">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Recent Meetings</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900">{sampleMeetings.length}</span>
              <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Briefings
              </span>
            </div>
            <p className="text-xs text-slate-500">Transcripts and MoMs</p>
          </Card>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Action Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                  <span>Your Action Items ({pendingCount} Pending)</span>
                </h3>
                <p className="text-xs text-slate-500">Track and complete your assigned deliverables</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={speakAllPendingTasks}
                  leftIcon={
                    isSpeakingTasks ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                    )
                  }
                  className="text-xs"
                >
                  {isSpeakingTasks ? 'Stop Audio' : 'Listen Briefing'}
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
            <div className="space-y-2">
              {userActionItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">No pending action items assigned to you.</p>
                </div>
              ) : (
                userActionItems.map((item) => {
                  const isDone = item.status === 'COMPLETED';
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleTaskStatus(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isDone
                          ? 'bg-slate-50 border-slate-100 text-slate-400'
                          : 'bg-white border-slate-100 hover:border-sky-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-sky-600 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-sky-600'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span>Assignee: <strong className="text-slate-700">{item.assignee}</strong></span>
                            <span>•</span>
                            <span>Due: <strong className="text-slate-700">{item.deadline}</strong></span>
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
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Speak this item aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600" />
                <span>Recent Activity</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {sampleActivityFeed.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group block"
                >
                  <div className="mt-0.5 shrink-0">
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badgeText}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
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
        <form onSubmit={handleAddNewTask} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Deliverable Title</label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Audit cloud database keys"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assignee</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Deadline</label>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Priority</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
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
