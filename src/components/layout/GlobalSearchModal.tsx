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
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 text-slate-800">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-sky-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search intelligence, transactions, MoMs, or contracts..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold shrink-0">Quick Modules:</span>
          <button
            onClick={() => handleNavigate('/fraud')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-sky-700 border border-slate-200 shrink-0 font-medium transition-colors"
          >
            Fraud Analysis
          </button>
          <button
            onClick={() => handleNavigate('/meetings')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-sky-700 border border-slate-200 shrink-0 font-medium transition-colors"
          >
            Meeting MoM
          </button>
          <button
            onClick={() => handleNavigate('/documents')}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-sky-700 border border-slate-200 shrink-0 font-medium transition-colors"
          >
            Doc Intelligence
          </button>
        </div>

        {/* Search Results Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar">
          {totalResults === 0 && (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No records match "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for "Cayman", "Cloud Run", "SLA", or "TXN"</p>
            </div>
          )}

          {/* Fraud Results */}
          {filteredTransactions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-2 px-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Fraud Anomaly Matches ({filteredTransactions.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTransactions.slice(0, 4).map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => handleNavigate('/fraud')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/60 cursor-pointer group transition-all border border-transparent hover:border-sky-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{txn.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-mono font-bold">
                          Risk: {txn.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{txn.accountSender} • ${txn.amount.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Results */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-2 px-2">
                <Video className="w-3.5 h-3.5 text-sky-600" />
                <span>Meeting Intelligence Matches ({filteredMeetings.length})</span>
              </div>
              <div className="space-y-1">
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleNavigate('/meetings')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/60 cursor-pointer group transition-all border border-transparent hover:border-sky-100"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{m.mom.attendees.length} Attendees • {m.duration}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Results */}
          {filteredDocuments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-2 px-2">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Document Intelligence Matches ({filteredDocuments.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleNavigate('/documents')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/60 cursor-pointer group transition-all border border-transparent hover:border-sky-100"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{doc.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
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
