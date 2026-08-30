'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, Video, FileText, Bot, ArrowRight, X } from 'lucide-react';
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
        else {
          // Open search logic handled in parent or global event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTransactions = sampleTransactions.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      t.accountSender.toLowerCase().includes(query.toLowerCase()) ||
      t.senderLocation.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMeetings = sampleMeetings.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocuments = sampleDocuments.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.summary?.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-synapse-cyan/40 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800/80">
          <Search className="w-5 h-5 text-synapse-cyan mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, meetings, docs, or AI chats..."
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar">
          {/* Fraud Results */}
          {filteredTransactions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 px-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fraud Anomaly Matches</span>
              </div>
              <div className="space-y-1">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => handleNavigate('/fraud')}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{txn.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
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
                <span>Meeting Intelligence Matches</span>
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
                <span>Document Intelligence Matches</span>
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
