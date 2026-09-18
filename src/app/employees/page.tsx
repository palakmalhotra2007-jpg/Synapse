'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Building,
  ChevronRight,
  UserPlus,
  Laptop,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserProfile, TeamId, UserRbacRole } from '@/types/dashboard';
import { getStoredUsers, TEAMS_LIST } from '@/lib/auth/usersDb';
import { EmployeeProfileDrawer } from '@/components/employees/EmployeeProfileDrawer';
import { useAuth } from '@/lib/firebase/authContext';

export default function EmployeeDirectoryPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedClearance, setSelectedClearance] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const users = getStoredUsers();
    setEmployees(users);
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      emp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'ALL' || emp.teamId === selectedDepartment;
    const matchesRole = selectedRole === 'ALL' || emp.rbacRole === selectedRole;
    const matchesClearance = selectedClearance === 'ALL' || emp.securityClearance === selectedClearance;

    return matchesSearch && matchesDept && matchesRole && matchesClearance;
  });

  const totalPasskeys = employees.reduce((acc, e) => acc + (e.passkeys?.length || 0), 0);
  const totalSessions = employees.reduce((acc, e) => acc + (e.activeSessions?.length || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Personnel & Access Governance Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Employee Directory & Identity Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage personnel credentials, RBAC clearance tiers, hardware passkeys, and active sessions.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Personnel</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{employees.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              100% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Verified corporate specialists</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hardware Passkeys</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{totalPasskeys}</span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">
              FIDO2 / WebAuthn
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Enrolled platform authenticators</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Workstations</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{totalSessions}</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live Sessions
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Encrypted AES-256 tokens</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Clearance Governance</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">5 Tiers</span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
              SOC2 Type II
            </span>
          </div>
          <p className="text-[11px] text-slate-400">RBAC vault segregation active</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, employee ID, email, role, or department..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="ALL">All Departments</option>
              {TEAMS_LIST.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="ALL">All RBAC Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Executive">Executive</option>
              <option value="Security Analyst">Security Analyst</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>

            {/* Clearance Filter */}
            <select
              value={selectedClearance}
              onChange={(e) => setSelectedClearance(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="ALL">All Clearance Tiers</option>
              <option value="Level 5 Executive">Level 5 Executive</option>
              <option value="Level 4 Cyber Forensics">Level 4 Cyber Forensics</option>
              <option value="Level 3 Financial Risk">Level 3 Financial Risk</option>
              <option value="Level 2 Legal Compliance">Level 2 Legal Compliance</option>
              <option value="Level 1 General">Level 1 General</option>
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
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 group relative ${
                isSelf
                  ? 'bg-slate-900/90 border-synapse-cyan/40 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Top Row: Avatar, Name, Employee ID */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={emp.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={emp.displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-synapse-cyan transition-colors truncate">
                        {emp.displayName}
                      </h3>
                      {isSelf && (
                        <Badge variant="cyan" size="sm">You</Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">
                      {emp.employeeId}
                    </span>
                  </div>
                </div>

                <Badge variant={emp.rbacRole === 'Administrator' ? 'emerald' : emp.rbacRole === 'Security Analyst' ? 'rose' : 'purple'} size="sm">
                  {emp.rbacRole}
                </Badge>
              </div>

              {/* Middle Section: Designation & Department */}
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-200 truncate">{emp.role}</p>
                <p className="text-[11px] text-slate-400 truncate">{emp.department}</p>
              </div>

              {/* Metadata Badges Row */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Shield className="w-3.5 h-3.5 text-synapse-cyan" />
                  <span>{emp.securityClearance.split(' ')[0]} {emp.securityClearance.split(' ')[1]}</span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-purple-400" />
                    <span>{emp.passkeys?.length || 0} PK</span>
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-emerald-400" />
                    <span>{emp.activeSessions?.length || 0} Sess</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={selectedEmployee}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
