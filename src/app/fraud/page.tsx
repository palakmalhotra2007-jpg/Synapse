'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Eye,
  Info,
  Globe,
  DollarSign,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { TransactionRecord, RiskSeverity } from '@/types/fraud';
import { sampleTransactions, sampleFraudSummary } from '@/lib/mockData/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function FraudAnalysisPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(sampleTransactions);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);

  const filteredTxns = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.accountSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.senderLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || txn.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      // Simulates ingested dataset with computed risk scores
      setTransactions(sampleTransactions);
    }, 1200);
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="rose">CRITICAL (90+)</Badge>;
      case 'HIGH':
        return <Badge variant="amber">HIGH (75+)</Badge>;
      case 'MEDIUM':
        return <Badge variant="purple">MEDIUM (50+)</Badge>;
      default:
        return <Badge variant="emerald">LOW (&lt;50)</Badge>;
    }
  };

  const riskDistributionData = [
    { name: 'Critical (90+)', count: sampleFraudSummary.criticalAlertCount, color: '#f43f5e' },
    { name: 'High (75-89)', count: sampleFraudSummary.highRiskCount, color: '#f59e0b' },
    { name: 'Medium (50-74)', count: sampleFraudSummary.mediumRiskCount, color: '#8b5cf6' },
    { name: 'Low (<50)', count: sampleFraudSummary.lowRiskCount, color: '#10b981' },
  ];

  const exportFraudPDFReport = () => {
    const reportText = `SYNAPSE ENTERPRISE FRAUD ANALYSIS AUDIT REPORT
Generated: ${new Date().toLocaleString()}
Processed Transactions: ${sampleFraudSummary.totalTransactions}
Flagged Volume USD: ${formatCurrency(sampleFraudSummary.flaggedVolumeUSD)}
Average Risk Score: ${sampleFraudSummary.averageRiskScore}

CRITICAL ANOMALIES IDENTIFIED:
${sampleTransactions
  .filter((t) => t.severity === 'CRITICAL')
  .map((t) => `- ${t.id}: ${t.accountSender} -> ${t.accountRecipient} ($${t.amount.toLocaleString()}) [Score: ${t.riskScore}]`)
  .join('\n')}`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synapse_Fraud_Audit_Report_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Anomaly & Risk Detection Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Fraud Analysis & Transaction Audit
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload financial ledgers to compute risk scores, detect velocity anomalies, and uncover suspicious offshore entities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={exportFraudPDFReport} variant="glow" leftIcon={<Download className="w-4 h-4" />}>
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Overview Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Processed Volume</span>
          <p className="text-2xl font-extrabold text-white">
            {formatCurrency(sampleFraudSummary.totalVolumeUSD)}
          </p>
          <span className="text-[11px] text-slate-400">{sampleFraudSummary.totalTransactions} transactions ingested</span>
        </Card>

        <Card className="space-y-1 border-rose-500/30 bg-rose-500/5">
          <span className="text-xs font-semibold text-rose-400 uppercase">High Risk Flagged</span>
          <p className="text-2xl font-extrabold text-rose-400">
            {formatCurrency(sampleFraudSummary.flaggedVolumeUSD)}
          </p>
          <span className="text-[11px] text-slate-400">{sampleFraudSummary.criticalAlertCount} Critical Alerts</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Risk Score</span>
          <p className="text-2xl font-extrabold text-amber-400">
            {sampleFraudSummary.averageRiskScore} <span className="text-sm text-slate-500">/ 100</span>
          </p>
          <span className="text-[11px] text-slate-400">98.4% anomaly model precision</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Blocked Attempts</span>
          <p className="text-2xl font-extrabold text-emerald-400">18 Wires</p>
          <span className="text-[11px] text-slate-400">Auto-prevented fraud loss</span>
        </Card>
      </div>

      {/* Main Analysis Section: Upload & Risk Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drag & Drop File Upload */}
        <Card className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-synapse-cyan" />
            <span>Ingest Transaction Ledger</span>
          </h3>

          <FileDropzone
            onFileSelect={handleFileUpload}
            label="Upload CSV or Excel Ledger"
            sublabel="Auto-computes risk scores across 40 anomaly vectors"
          />

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pre-loaded Enterprise Datasets:
            </span>
            <button
              onClick={() => setTransactions(sampleTransactions)}
              className="w-full text-left p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-synapse-cyan/40 transition-colors flex items-center justify-between group"
            >
              <div>
                <h5 className="text-xs font-bold text-slate-200 group-hover:text-synapse-cyan transition-colors">
                  August 2026 High-Velocity Wires
                </h5>
                <span className="text-[10px] text-slate-400">12,480 rows • 94 Critical Score</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-synapse-cyan" />
            </button>
          </div>
        </Card>

        {/* Risk Distribution Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Risk Severity Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Transaction counts grouped by Synapse risk scoring thresholds</p>
            </div>
            <Badge variant="rose">Critical Threshold &gt;90</Badge>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(0, 242, 254, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filterable Transactions Data Table */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Flagged Transactions Directory</h3>
            <p className="text-xs text-slate-400">Line-by-line anomaly breakdown with flags & severity indicators</p>
          </div>

          {/* Search & Severity Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search TXN ID or Account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-synapse-cyan/50"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Sender Account</th>
                <th className="py-3 px-4">Recipient Location</th>
                <th className="py-3 px-4">Amount (USD)</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-900/60 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{txn.id}</td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">{txn.accountSender}</td>
                  <td className="py-3.5 px-4 text-slate-400">{txn.recipientLocation}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-100">${txn.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">{getSeverityBadge(txn.severity)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        txn.status === 'BLOCKED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : txn.status === 'FLAGGED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTxn(txn)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deep-Dive Anomaly Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Fraud Investigation: ${selectedTxn.id}`}
        >
          <div className="space-y-6">
            {/* Risk Banner */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Computed Risk Score
                </span>
                <span className="text-3xl font-extrabold text-white">{selectedTxn.riskScore} / 100</span>
              </div>
              <Badge variant="rose" size="md">{selectedTxn.severity} ANOMALY</Badge>
            </div>

            {/* Entity Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block mb-1">Sender Account</span>
                <span className="font-bold text-white">{selectedTxn.accountSender}</span>
                <span className="text-slate-400 block mt-1">Loc: {selectedTxn.senderLocation}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block mb-1">Recipient Account</span>
                <span className="font-bold text-white">{selectedTxn.accountRecipient}</span>
                <span className="text-slate-400 block mt-1">Loc: {selectedTxn.recipientLocation}</span>
              </div>
            </div>

            {/* Flag Reasons Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Synapse Anomaly Detection Flags:
              </h4>
              <div className="space-y-1.5">
                {selectedTxn.flagReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Vector Specs */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Velocity Factor:</span>
                <span className="font-bold text-white">{selectedTxn.anomalyFactors.velocityFactor}x Baseline</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Routing:</span>
                <span className="font-bold text-rose-400">{selectedTxn.ipAddress} (Tor/VPN Exit Node)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedTxn(null)}>
                Close Inspection
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setTransactions(transactions.map(t => t.id === selectedTxn.id ? { ...t, status: 'BLOCKED' } : t));
                  setSelectedTxn(null);
                }}
              >
                Block Transaction Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
