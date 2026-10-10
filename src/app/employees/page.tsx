'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronRight,
  Plus,
  UserPlus,
  FolderPlus,
  Shield,
  Building,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { UserProfile, Team } from '@/types/dashboard';
import { getStoredUsers, getStoredTeams, createNewTeam, registerNewUser } from '@/lib/auth/usersDb';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { useAuth } from '@/lib/firebase/authContext';

export default function EmployeeDirectoryPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Create Team Modal state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamBadge, setNewTeamBadge] = useState<'cyan' | 'rose' | 'amber' | 'purple' | 'emerald' | 'indigo'>('cyan');

  // Add Member Modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Senior Systems Specialist');
  const [newMemberTeamId, setNewMemberTeamId] = useState<string>('engineering');

  useEffect(() => {
    setEmployees(getStoredUsers());
    setTeamsList(getStoredTeams());
  }, []);

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const created = createNewTeam({
      name: newTeamName,
      code: newTeamCode || 'TEAM',
      description: newTeamDesc || 'Enterprise operations team vault.',
      lead: user?.displayName || 'Charvi Sharma',
      badgeVariant: newTeamBadge,
    });

    setTeamsList(getStoredTeams());
    setIsCreateTeamOpen(false);
    setNewTeamName('');
    setNewTeamCode('');
    setNewTeamDesc('');
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const result = registerNewUser(
      newMemberName,
      newMemberEmail,
      'Synapse#2026',
      newMemberTeamId as any,
      newMemberRole
    );

    if (result.success) {
      setEmployees(getStoredUsers());
      setIsAddMemberOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      emp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'ALL' || emp.teamId === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-800 text-left bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Organization Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            People & Team Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create enterprise teams, assign members, and manage personnel directories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateTeamOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<FolderPlus className="w-4 h-4 text-purple-600" />}
          >
            Create New Team
          </Button>

          <Button
            onClick={() => setIsAddMemberOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, role, or department..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Departments & Teams</option>
              {teamsList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const isSelf = user?.uid === emp.uid;
          return (
            <div
              key={emp.uid}
              onClick={() => {
                setSelectedEmployee(emp);
                setIsDrawerOpen(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 group relative bg-white border-slate-200/80 shadow-2xs ${
                isSelf
                  ? 'border-sky-300 ring-2 ring-sky-500/20'
                  : 'hover:border-sky-200 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Avatar, Name, Employee ID */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  {emp.displayName ? emp.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'EM'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {emp.displayName}
                    </h3>
                    {isSelf && (
                      <Badge variant="cyan" size="sm">You</Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-sky-700 font-mono font-bold block mt-0.5">
                    {emp.employeeId}
                  </span>
                </div>
              </div>

              {/* Middle Section: Designation & Department */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <p className="font-semibold text-slate-800 truncate">{emp.role}</p>
                <p className="text-[11px] text-slate-500 truncate">{emp.department || emp.teamName}</p>
              </div>

              {/* Action Row */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{emp.email}</span>
                <span className="text-sky-600 font-semibold group-hover:underline flex items-center gap-0.5 shrink-0">
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Create New Team */}
      <Modal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} title="Provision New Enterprise Team" maxWidth="md">
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Team Name</label>
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. AI Research & Neural Infrastructure"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Team Code</label>
              <input
                type="text"
                required
                value={newTeamCode}
                onChange={(e) => setNewTeamCode(e.target.value)}
                placeholder="e.g. AI-RND"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Badge Theme</label>
              <select
                value={newTeamBadge}
                onChange={(e) => setNewTeamBadge(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="cyan">Cyan (Neural)</option>
                <option value="purple">Purple (AI/R&D)</option>
                <option value="emerald">Emerald (Executive)</option>
                <option value="rose">Rose (Cyber Security)</option>
                <option value="amber">Amber (Finance)</option>
                <option value="indigo">Indigo (Platform)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Team Description</label>
            <textarea
              rows={2}
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              placeholder="Brief description of team responsibilities and vault clearances..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateTeamOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Provision Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Team Member */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Team Member to Organization" maxWidth="md">
        <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Enterprise Email</label>
            <input
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="e.g. ananya@synapse-ai.io"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Designation / Role</label>
              <input
                type="text"
                required
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assign Team</label>
              <select
                value={newMemberTeamId}
                onChange={(e) => setNewMemberTeamId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {teamsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={selectedEmployee}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
