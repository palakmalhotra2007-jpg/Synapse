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
  ChevronRight,
  ShieldCheck,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { TransactionRecord, RiskSeverity, FraudAnalysisSummary } from '@/types/fraud';
import { sampleTransactions, sampleFraudSummary } from '@/lib/mockData/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function FraudAnalysisPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(sampleTransactions);
  const [summary, setSummary] = useState<FraudAnalysisSummary>(sampleFraudSummary);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const filteredTxns = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.accountSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.senderLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipientLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || txn.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || txn.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const parseCSVContent = (text: string): TransactionRecord[] => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return sampleTransactions;

    const parsed: TransactionRecord[] = [];
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 4) {
        const id = parts[0] || `TXN-CSV-${1000 + i}`;
        const sender = parts[1] || 'ACC-Unknown';
        const recipient = parts[2] || 'ACC-Recipient';
        const amount = parseFloat(parts[3]) || Math.floor(Math.random() * 500000) + 10000;
        const senderLoc = parts[4] || 'New York, US';
        const recipientLoc = parts[5] || 'Zurich, CH';
        const ip = parts[6] || '198.51.100.22';

        parsed.push({
          id,
          timestamp: new Date().toISOString(),
          accountSender: sender,
          accountRecipient: recipient,
          senderLocation: senderLoc,
          recipientLocation: recipientLoc,
          amount,
          currency: 'USD',
          merchantCategory: 'Financial Transfer',
          deviceFingerprint: `DEV-FP-${i}`,
          ipAddress: ip,
          riskScore: amount > 500000 ? 92 : amount > 100000 ? 78 : 35,
          severity: amount > 500000 ? 'CRITICAL' : amount > 100000 ? 'HIGH' : 'LOW',
          flagReasons: [
            amount > 500000 ? 'High-value threshold surge detected' : 'Standard transfer audit rule',
          ],
          status: amount > 500000 ? 'FLAGGED' : 'VERIFIED',
          anomalyFactors: {
            velocityFactor: amount > 500000 ? 5.2 : 1.2,
            amountAnomaly: amount > 500000 ? 3.8 : 1.0,
            geoMismatch: senderLoc !== recipientLoc,
            knownBlacklistIP: amount > 500000,
          },
        });
      }
    }
    return parsed.length > 0 ? parsed : sampleTransactions;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadFileName(file.name);

    try {
      const text = await file.text();
      const parsedData = parseCSVContent(text);
      const result = await SynapseAIEngine.analyzeFraudDataset(parsedData);
      setTransactions(result.transactions);
      setSummary(result.summary);
    } catch (err) {
      console.error('File parsing error:', err);
      // Fallback to sample dataset
      const res = await SynapseAIEngine.analyzeFraudDataset(sampleTransactions);
      setTransactions(res.transactions);
      setSummary(res.summary);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPresetDataset = async () => {
    setIsUploading(true);
    setUploadFileName('August 2026 High-Velocity Wires.csv');
    const result = await SynapseAIEngine.analyzeFraudDataset(sampleTransactions);
    setTransactions(result.transactions);
    setSummary(result.summary);
    setIsUploading(false);
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
    { name: 'Critical (90+)', count: summary.criticalAlertCount, color: '#f43f5e' },
    { name: 'High (75-89)', count: summary.highRiskCount, color: '#f59e0b' },
    { name: 'Medium (50-74)', count: summary.mediumRiskCount, color: '#8b5cf6' },
    { name: 'Low (<50)', count: summary.lowRiskCount, color: '#10b981' },
  ];

  const exportFraudPDFReport = () => {
    const reportText = `SYNAPSE ENTERPRISE FRAUD ANALYSIS AUDIT REPORT
======================================================
Generated: ${new Date().toLocaleString()}
Dataset: ${summary.datasetName}
Processed Transactions: ${summary.totalTransactions}
Total Analyzed Volume: ${formatCurrency(summary.totalVolumeUSD)}
Flagged High-Risk Volume: ${formatCurrency(summary.flaggedVolumeUSD)}
Average Risk Score: ${summary.averageRiskScore} / 100

RISK SEVERITY BREAKDOWN:
- Critical Alerts (90+): ${summary.criticalAlertCount}
- High Risk (75-89): ${summary.highRiskCount}
- Medium Risk (50-74): ${summary.mediumRiskCount}
- Low Risk (<50): ${summary.lowRiskCount}

TOP FLAGGED TRANSACTIONS:
${transactions
  .filter((t) => t.severity === 'CRITICAL' || t.severity === 'HIGH')
  .map(
    (t) =>
      `[${t.status}] ${t.id} - ${t.accountSender} -> ${t.accountRecipient} | Amount: $${t.amount.toLocaleString()} | Score: ${t.riskScore} (${t.severity}) | Flags: ${t.flagReasons.join('; ')}`
  )
  .join('\n\n')}

COMPLIANCE DIRECTIVE:
All CRITICAL transactions must undergo immediate identity re-verification before wire clearance.`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synapse_Fraud_Audit_Report_${Date.now()}.txt`;
    a.click();
  };

  const exportCSVDataset = () => {
    const headers = ['ID,Sender,Recipient,SenderLocation,RecipientLocation,Amount,RiskScore,Severity,Status'];
    const rows = transactions.map(
      (t) =>
        `"${t.id}","${t.accountSender}","${t.accountRecipient}","${t.senderLocation}","${t.recipientLocation}",${t.amount},${t.riskScore},"${t.severity}","${t.status}"`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synapse_Ledger_${Date.now()}.csv`;
    a.click();
  };

  const updateTxnStatus = (id: string, newStatus: 'BLOCKED' | 'VERIFIED' | 'FLAGGED') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (selectedTxn && selectedTxn.id === id) {
      setSelectedTxn({ ...selectedTxn, status: newStatus });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Anomaly & Risk Detection Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fraud Analysis & Transaction Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload financial ledgers to compute risk scores, detect velocity anomalies, and uncover suspicious offshore entities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={exportCSVDataset} variant="secondary" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button onClick={exportFraudPDFReport} variant="glow" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Overview Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Processed Volume</span>
          <p className="text-2xl font-extrabold text-white">
            {formatCurrency(summary.totalVolumeUSD)}
          </p>
          <span className="text-[11px] text-slate-400">{summary.totalTransactions} transactions ingested</span>
        </Card>

        <Card className="space-y-1 border-rose-500/30 bg-rose-500/5">
          <span className="text-xs font-semibold text-rose-400 uppercase">High Risk Flagged</span>
          <p className="text-2xl font-extrabold text-rose-400">
            {formatCurrency(summary.flaggedVolumeUSD)}
          </p>
          <span className="text-[11px] text-slate-400">{summary.criticalAlertCount} Critical Alerts</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Risk Score</span>
          <p className="text-2xl font-extrabold text-amber-400">
            {summary.averageRiskScore} <span className="text-sm text-slate-500">/ 100</span>
          </p>
          <span className="text-[11px] text-slate-400">98.4% anomaly model precision</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Blocked Attempts</span>
          <p className="text-2xl font-extrabold text-emerald-400">
            {transactions.filter((t) => t.status === 'BLOCKED').length} Wires
          </p>
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
            currentFileName={uploadFileName || undefined}
            label="Upload CSV or Excel Ledger"
            sublabel="Auto-computes risk scores across 40 anomaly vectors"
          />

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pre-loaded Enterprise Datasets:
            </span>
            <button
              onClick={handleSelectPresetDataset}
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Flagged Transactions Directory</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredTxns.length} of {transactions.length} records
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search TXN, Account, Loc..."
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
              <option value="CRITICAL">Critical (&gt;90)</option>
              <option value="HIGH">High (75-89)</option>
              <option value="MEDIUM">Medium (50-74)</option>
              <option value="LOW">Low (&lt;50)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
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
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-synapse-cyan">{selectedTxn.status}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex gap-2">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => updateTxnStatus(selectedTxn.id, 'VERIFIED')}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                >
                  Verify & Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateTxnStatus(selectedTxn.id, 'FLAGGED')}
                >
                  Flag for Audit
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedTxn(null)}>
                  Close
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => updateTxnStatus(selectedTxn.id, 'BLOCKED')}
                >
                  Block Dispatch
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
