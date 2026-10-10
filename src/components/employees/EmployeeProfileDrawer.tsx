'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
} from 'lucide-react';
import { UserProfile } from '@/types/dashboard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/firebase/authContext';
import { sampleDocuments } from '@/lib/mockData/documents';
import { sampleMeetings } from '@/lib/mockData/meetings';

interface EmployeeProfileDrawerProps {
  employee: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'meetings'>('overview');

  if (!isOpen || !employee) return null;

  const associatedDocs = sampleDocuments.filter(
    (d) =>
      d.uploadedByEmployeeId === employee.employeeId ||
      d.uploadedBy?.toLowerCase().includes(employee.displayName.toLowerCase()) ||
      d.teamId === employee.teamId
  );

  const associatedMeetings = sampleMeetings.filter(
    (m) =>
      m.organizerEmployeeId === employee.employeeId ||
      m.participants.some((p) => p.employeeId === employee.employeeId || p.name === employee.displayName)
  );

  const tabs = [
    { id: 'overview', label: 'Profile Overview' },
    { id: 'documents', label: `Documents (${associatedDocs.length})` },
    { id: 'meetings', label: `Meetings (${associatedMeetings.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {employee.displayName ? employee.displayName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'EM'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{employee.displayName}</h3>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{employee.role} • {employee.department}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 text-left bg-slate-50/50">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Contact & Office Details */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Organization Directory Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Work Email</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      {employee.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Phone</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {employee.phone || '+1 (555) 019-2831'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Office</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      {employee.office || 'San Francisco HQ, Building C'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      {employee.manager || 'Charvi Sharma (Engineering Lead)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Department Team</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{employee.teamName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Organization</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{employee.organization || 'Aegis Global Enterprises'}</span>
                  </div>
                </div>
              </div>

              {/* Functional Role Badge */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Role & Department Assignment
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px]">Role</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{employee.role}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[11px]">Department</span>
                    <Badge variant="sky" size="sm" className="mt-1">
                      {employee.department}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Associated Vault Documents ({associatedDocs.length}):
              </span>
              <div className="space-y-2">
                {associatedDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">{doc.name}</h5>
                      <Badge variant="sky" size="sm">{doc.type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{doc.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Vault: {doc.teamName || 'Enterprise'}</span>
                      <span>Uploaded: {doc.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Meetings */}
          {activeTab === 'meetings' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Associated Meetings & Briefings ({associatedMeetings.length}):
              </span>
              <div className="space-y-2">
                {associatedMeetings.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">{m.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{m.mom.executiveSummary}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{m.participants.length} Participants</span>
                      <span>{m.mom.actionItems.length} Action Items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
