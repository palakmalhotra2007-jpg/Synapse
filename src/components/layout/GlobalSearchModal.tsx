'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, Video, FileText, Bot, ArrowRight, X, Sparkles } from 'lucide-react';
import { sampleTransactions } from '@/lib/mockData/transactions';
import { sampleMeetings } from '@/lib/mockData/meetings';
import { sampleDocuments } from '@/lib/mockData/documents';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredTransactions = sampleTransactions.filter(
    (t) =>
      t.id.toLowerCase().includes(normalizedQuery) ||
      t.accountSender.toLowerCase().includes(normalizedQuery) ||
      t.senderLocation.toLowerCase().includes(normalizedQuery) ||
      t.recipientLocation.toLowerCase().includes(normalizedQuery)
  );

  const filteredMeetings = sampleMeetings.filter((m) =>
    m.title.toLowerCase().includes(normalizedQuery) ||
    m.mom.executiveSummary.toLowerCase().includes(normalizedQuery) ||
    m.mom.attendees.some((a) => a.toLowerCase().includes(normalizedQuery))
  );

  const filteredDocuments = sampleDocuments.filter(
    (d) =>
      d.name.toLowerCase().includes(normalizedQuery) ||
      d.summary?.toLowerCase().includes(normalizedQuery) ||
      d.content.toLowerCase().includes(normalizedQuery)
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const totalResults =
    filteredTransactions.length + filteredMeetings.length + filteredDocuments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-synapse-cyan/40 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-800/80">
          <Search className="w-5 h-5 text-synapse-cyan mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search intelligence, transactions, MoMs, or contracts..."
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold shrink-0">Quick Modules:</span>
          <button
            onClick={() => handleNavigate('/workspace')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 shrink-0"
          >
            AI Workspace
          </button>
          <button
            onClick={() => handleNavigate('/fraud')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-800 shrink-0"
          >
            Fraud Analysis
          </button>
          <button
            onClick={() => handleNavigate('/meetings')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-purple-400 border border-slate-800 shrink-0"
          >
            Meeting MoM
          </button>
          <button
            onClick={() => handleNavigate('/documents')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 shrink-0"
          >
            Doc Intelligence
          </button>
        </div>

        {/* Search Results Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar">
          {totalResults === 0 && (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No records match "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for "Cayman", "Cloud Run", "SLA", or "TXN"</p>
            </div>
          )}

          {/* Fraud Results */}
          {filteredTransactions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 px-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fraud Anomaly Matches ({filteredTransactions.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTransactions.slice(0, 4).map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => handleNavigate('/fraud')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{txn.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                          Risk: {txn.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{txn.accountSender} • ${txn.amount.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-synapse-cyan transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Results */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 px-2">
                <Video className="w-3.5 h-3.5" />
                <span>Meeting Intelligence Matches ({filteredMeetings.length})</span>
              </div>
              <div className="space-y-1">
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleNavigate('/meetings')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-all"
                  >
                    <div>
                      <span className="font-semibold text-white text-sm">{m.title}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{m.mom.attendees.length} Attendees • {m.duration}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-synapse-cyan transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Results */}
          {filteredDocuments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 px-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Document Intelligence Matches ({filteredDocuments.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleNavigate('/documents')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-all"
                  >
                    <div>
                      <span className="font-semibold text-white text-sm">{doc.name}</span>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{doc.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-synapse-cyan transition-colors" />
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
