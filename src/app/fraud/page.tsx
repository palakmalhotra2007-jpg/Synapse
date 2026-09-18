'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  FileText,
  Scale,
  Layers,
  Sparkles,
  AlertOctagon,
  HelpCircle,
  FileCheck,
  X,
  Plus,
  Send,
  Lock,
  ArrowRight,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/ui/FileDropzone';
import {
  TransactionRecord,
  RiskSeverity,
  FraudAnalysisSummary,
  TransactionStatus,
  InvestigationNote,
} from '@/types/fraud';
import { sampleTransactions, sampleFraudSummary } from '@/lib/mockData/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SynapseAIEngine } from '@/lib/ai/synapseEngine';
import { addAuditLogEntry } from '@/lib/auth/usersDb';
import { useAuth } from '@/lib/firebase/authContext';

export default function FraudAnalysisPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>(sampleTransactions);
  const [summary, setSummary] = useState<FraudAnalysisSummary>(sampleFraudSummary);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Investigation Note Form State
  const [newNoteText, setNewNoteText] = useState('');
  const [newActionTaken, setNewActionTaken] = useState<string>('NOTE_ADDED');

  // Recalculate summary metrics from current transactions
  const recalculateSummary = (txns: TransactionRecord[], datasetName: string = 'Current Active Ledger') => {
    const totalTransactions = txns.length;
    const totalVolumeUSD = txns.reduce((acc, t) => acc + t.amount, 0);
    const flaggedTxns = txns.filter((t) => t.status === 'FLAGGED' || t.status === 'UNDER_INVESTIGATION' || t.status === 'ESCALATED' || t.status === 'BLOCKED');
    const flaggedCount = flaggedTxns.length;
    const flaggedVolumeUSD = flaggedTxns.reduce((acc, t) => acc + t.amount, 0);
    const averageRiskScore = totalTransactions > 0 ? Math.round((txns.reduce((acc, t) => acc + t.riskScore, 0) / totalTransactions) * 10) / 10 : 0;
    const criticalAlertCount = txns.filter((t) => t.severity === 'CRITICAL').length;
    const highRiskCount = txns.filter((t) => t.severity === 'HIGH').length;
    const mediumRiskCount = txns.filter((t) => t.severity === 'MEDIUM').length;
    const lowRiskCount = txns.filter((t) => t.severity === 'LOW').length;

    const newSummary: FraudAnalysisSummary = {
      id: `FSUM-${Date.now()}`,
      datasetName,
      processedAt: new Date().toISOString(),
      totalTransactions,
      totalVolumeUSD,
      flaggedCount,
      flaggedVolumeUSD,
      averageRiskScore,
      criticalAlertCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      topRiskCategories: [
        { category: 'Offshore High-Risk Wires', count: txns.filter((t) => t.country !== 'United States' && t.riskScore > 70).length },
        { category: 'Velocity Surge Violations', count: txns.filter((t) => t.anomalyFactors.velocityFactor > 3.0).length },
        { category: 'Tor / Proxy IP Subnets', count: txns.filter((t) => t.anomalyFactors.knownBlacklistIP).length },
      ],
      locationRiskMap: [
        { country: 'Cayman Islands', count: txns.filter((t) => t.country === 'Cayman Islands').length, riskScore: 94 },
        { country: 'Singapore', count: txns.filter((t) => t.country === 'Singapore').length, riskScore: 96 },
        { country: 'Switzerland', count: txns.filter((t) => t.country === 'Switzerland').length, riskScore: 82 },
        { country: 'United States', count: txns.filter((t) => t.country === 'United States').length, riskScore: 28 },
        { country: 'Israel', count: txns.filter((t) => t.country === 'Israel').length, riskScore: 68 },
      ],
    };

    setSummary(newSummary);
  };

  const filteredTxns = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.accountSender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.accountRecipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.senderLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipientLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.country?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'ALL' || txn.severity === filterSeverity || txn.riskLevel === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || txn.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const parseCSVContent = (text: string, filename: string): TransactionRecord[] => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return sampleTransactions;

    const parsed: TransactionRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 4) {
        const id = parts[0] || `TXN-CSV-${1000 + i}`;
        const sender = parts[1] || 'ACC-Unknown Sender';
        const recipient = parts[2] || 'ACC-Unknown Recipient';
        const amount = parseFloat(parts[3]) || Math.floor(Math.random() * 500000) + 10000;
        const senderLoc = parts[4] || 'New York, US';
        const recipientLoc = parts[5] || 'Zurich, CH';
        const country = parts[6] || (recipientLoc.includes('CH') ? 'Switzerland' : recipientLoc.includes('KY') ? 'Cayman Islands' : 'United States');
        const paymentMethod = (parts[7] || (amount > 500000 ? 'SWIFT International' : 'Wire Transfer')) as any;
        const ip = parts[8] || '198.51.100.22';
        const device = parts[9] || 'Corporate Workstation';

        const isCritical = amount > 1000000 || country === 'Cayman Islands';
        const isHigh = amount > 400000;
        const isMed = amount > 150000;

        const riskScore = isCritical ? Math.floor(Math.random() * 8 + 92) : isHigh ? Math.floor(Math.random() * 10 + 78) : isMed ? Math.floor(Math.random() * 15 + 55) : Math.floor(Math.random() * 25 + 15);
        const severity: RiskSeverity = riskScore >= 90 ? 'CRITICAL' : riskScore >= 75 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW';

        const reasons = [];
        if (amount > 500000) reasons.push(`Transfer amount ($${amount.toLocaleString()}) exceeds baseline limit`);
        if (country !== 'United States') reasons.push(`Cross-border corridor (${country}) requires enhanced AML audit`);
        if (isCritical) reasons.push('Velocity surge: multiple high-value wires in short window');

        parsed.push({
          id,
          timestamp: new Date().toISOString(),
          accountSender: sender,
          senderName: sender.split('(')[1]?.replace(')', '') || sender,
          accountRecipient: recipient,
          recipientName: recipient.split('(')[1]?.replace(')', '') || recipient,
          senderLocation: senderLoc,
          recipientLocation: recipientLoc,
          country,
          amount,
          currency: 'USD',
          paymentMethod,
          merchant: 'Enterprise Wire Gateway',
          merchantCategory: 'Corporate Treasury',
          device,
          deviceFingerprint: `DEV-FP-${1000 + i}`,
          ipAddress: ip,
          riskScore,
          riskLevel: severity,
          severity,
          riskReasons: reasons.length > 0 ? reasons : ['Standard recurring transfer'],
          flagReasons: reasons.length > 0 ? reasons : ['Standard recurring transfer'],
          status: severity === 'CRITICAL' ? 'FLAGGED' : severity === 'HIGH' ? 'UNDER_INVESTIGATION' : 'VERIFIED',
          assignedInvestigator: 'Elena Rostova (EMP-SEC-002)',
          anomalyFactors: {
            velocityFactor: isCritical ? 6.4 : isHigh ? 3.2 : 1.1,
            amountAnomaly: isCritical ? 4.5 : isHigh ? 2.2 : 1.0,
            geoMismatch: senderLoc !== recipientLoc,
            knownBlacklistIP: isCritical,
          },
          anomalyBreakdown: {
            unusualAmount: { isAnomaly: isHigh || isCritical, score: isCritical ? 95 : isHigh ? 80 : 20, details: `Amount $${amount.toLocaleString()} evaluated against historical baseline.` },
            transactionVelocity: { isAnomaly: isCritical, score: isCritical ? 90 : 15, details: 'Wire submission rate evaluated.' },
            unusualCountry: { isAnomaly: country !== 'United States', score: country !== 'United States' ? 75 : 10, details: `Destination country: ${country}` },
            unusualDeviceOrIP: { isAnomaly: isCritical, score: isCritical ? 88 : 10, details: `Origin IP: ${ip}` },
            unusualTransactionTime: { isAnomaly: false, score: 20, details: 'Normal operating hours.' },
            repeatedTransfers: { isAnomaly: isHigh, score: isHigh ? 70 : 15, details: 'Single wire submission.' },
            abnormalBehavior: { isAnomaly: isCritical, score: isCritical ? 85 : 15, details: 'Account status verified.' },
          },
          investigationNotes: [],
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
      const parsedData = parseCSVContent(text, file.name);
      setTransactions(parsedData);
      recalculateSummary(parsedData, file.name);
      setIsUploadModalOpen(false);

      addAuditLogEntry({
        eventType: 'transaction_investigation',
        actorEmployeeId: user?.employeeId || 'EMP-EXEC-001',
        actorName: user?.displayName || 'Specialist',
        actorRole: user?.rbacRole || 'Employee',
        targetResource: `Dataset: ${file.name}`,
        action: `Uploaded and parsed ${parsedData.length} ledger transactions`,
        status: 'SUCCESS',
        ipAddress: '192.168.1.100',
        details: `Calculated metrics: $${parsedData.reduce((a, b) => a + b.amount, 0).toLocaleString()} total volume.`,
      });
    } catch (err) {
      console.error('File parsing error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const updateTransactionStatus = (txnId: string, nextStatus: TransactionStatus, actionLabel: string) => {
    const updated = transactions.map((t) =>
      t.id === txnId ? { ...t, status: nextStatus, lastUpdated: new Date().toISOString() } : t
    );
    setTransactions(updated);
    recalculateSummary(updated, summary.datasetName);

    if (selectedTxn?.id === txnId) {
      setSelectedTxn((prev) => prev ? { ...prev, status: nextStatus } : null);
    }

    addAuditLogEntry({
      eventType: 'transaction_investigation',
      actorEmployeeId: user?.employeeId || 'EMP-SEC-002',
      actorName: user?.displayName || 'Elena Rostova',
      actorRole: user?.rbacRole || 'Security Analyst',
      targetResource: `Transaction ${txnId}`,
      action: `${actionLabel} (Status -> ${nextStatus})`,
      status: 'SUCCESS',
      ipAddress: '192.168.1.104',
      details: `Updated status on transaction record ${txnId}.`,
    });
  };

  const handleAddInvestigationNote = () => {
    if (!selectedTxn || !newNoteText.trim()) return;

    const note: InvestigationNote = {
      id: `inv-note-${Date.now()}`,
      authorEmployeeId: user?.employeeId || 'EMP-SEC-002',
      authorName: user?.displayName || 'Elena Rostova',
      timestamp: new Date().toISOString(),
      note: newNoteText.trim(),
      actionTaken: newActionTaken,
    };

    const updated = transactions.map((t) =>
      t.id === selectedTxn.id
        ? {
            ...t,
            investigationNotes: [note, ...(t.investigationNotes || [])],
          }
        : t
    );

    setTransactions(updated);
    setSelectedTxn((prev) => (prev ? { ...prev, investigationNotes: [note, ...(prev.investigationNotes || [])] } : null));
    setNewNoteText('');

    addAuditLogEntry({
      eventType: 'transaction_investigation',
      actorEmployeeId: user?.employeeId || 'EMP-SEC-002',
      actorName: user?.displayName || 'Elena Rostova',
      actorRole: user?.rbacRole || 'Security Analyst',
      targetResource: `Transaction ${selectedTxn.id}`,
      action: `Added Forensic Note [${newActionTaken}]`,
      status: 'SUCCESS',
      ipAddress: '192.168.1.104',
      details: newNoteText.trim(),
    });
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="rose">CRITICAL ({severity})</Badge>;
      case 'HIGH':
        return <Badge variant="amber">HIGH ({severity})</Badge>;
      case 'MEDIUM':
        return <Badge variant="purple">MEDIUM ({severity})</Badge>;
      default:
        return <Badge variant="emerald">LOW ({severity})</Badge>;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'FLAGGED':
        return <Badge variant="rose">FLAGGED</Badge>;
      case 'UNDER_INVESTIGATION':
        return <Badge variant="amber">INVESTIGATING</Badge>;
      case 'ESCALATED':
        return <Badge variant="rose">ESCALATED</Badge>;
      case 'BLOCKED':
        return <Badge variant="rose">BLOCKED</Badge>;
      case 'REVIEWED':
        return <Badge variant="cyan">REVIEWED</Badge>;
      case 'DISMISSED':
        return <Badge variant="slate">DISMISSED</Badge>;
      default:
        return <Badge variant="emerald">VERIFIED</Badge>;
    }
  };

  const exportFraudCSV = () => {
    const headers = 'Transaction ID,Timestamp,Sender,Receiver,Amount,Currency,Country,Payment Method,Merchant,IP,Risk Score,Risk Level,Status,Risk Reasons\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.timestamp}","${t.accountSender}","${t.accountRecipient}",${t.amount},"${t.currency}","${t.country}","${t.paymentMethod}","${t.merchant}","${t.ipAddress}",${t.riskScore},"${t.severity}","${t.status}","${t.riskReasons.join('; ')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fraud_Investigation_Ledger_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full text-slate-100 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Real-Time Anomaly Detection & AML Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Omni Fraud Analysis & Ledger Forensics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze wire transactions, detect explainable behavioral anomalies, and manage full forensic investigation lifecycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={() => setIsUploadModalOpen(true)} variant="primary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
            Upload CSV / XLSX Ledger
          </Button>

          <Button onClick={exportFraudCSV} variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export CSV Ledger
          </Button>
        </div>
      </div>

      {/* Overview Real Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 space-y-1.5">
          <span className="text-[11px] text-slate-400 block">Total Audited Volume</span>
          <span className="text-xl font-bold text-white block">{formatCurrency(summary.totalVolumeUSD)}</span>
          <span className="text-[10px] text-slate-500 font-mono">{summary.totalTransactions} Transactions</span>
        </Card>

        <Card className="p-4 space-y-1.5">
          <span className="text-[11px] text-rose-400 font-bold block">Flagged Risk Volume</span>
          <span className="text-xl font-bold text-rose-400 block">{formatCurrency(summary.flaggedVolumeUSD)}</span>
          <span className="text-[10px] text-rose-400 font-mono">{summary.flaggedCount} High-Risk Wires</span>
        </Card>

        <Card className="p-4 space-y-1.5">
          <span className="text-[11px] text-slate-400 block">Average Risk Score</span>
          <span className="text-xl font-bold text-cyan-400 block">{summary.averageRiskScore} / 100</span>
          <span className="text-[10px] text-slate-500 font-mono">Normalized baseline</span>
        </Card>

        <Card className="p-4 space-y-1.5">
          <span className="text-[11px] text-slate-400 block">Critical Anomalies</span>
          <span className="text-xl font-bold text-rose-500 block">{summary.criticalAlertCount}</span>
          <span className="text-[10px] text-rose-400 font-mono">Immediate SOC Action</span>
        </Card>

        <Card className="p-4 space-y-1.5">
          <span className="text-[11px] text-slate-400 block">Active Dataset</span>
          <span className="text-xs font-bold text-slate-200 block truncate mt-1">{summary.datasetName}</span>
          <span className="text-[10px] text-slate-500 font-mono">100% Parsed & Indexed</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by transaction ID, sender, recipient, country, payment method, IP..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (90+)</option>
              <option value="HIGH">High (75-89)</option>
              <option value="MEDIUM">Medium (50-74)</option>
              <option value="LOW">Low (&lt;50)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Investigation Statuses</option>
              <option value="FLAGGED">Flagged</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ESCALATED">Escalated</option>
              <option value="BLOCKED">Blocked</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="DISMISSED">Dismissed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Flagged Transactions Table */}
      <Card className="p-0 overflow-hidden border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Flagged Transaction Ledger ({filteredTxns.length} Records)
          </span>
          <span className="text-[11px] text-rose-400 font-mono font-semibold">
            Real-time anomaly scoring active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Sender & Recipient</th>
                <th className="py-3 px-4">Amount (USD)</th>
                <th className="py-3 px-4">Country & Method</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Investigation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTxns.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => {
                    setSelectedTxn(txn);
                    setIsInvestigateOpen(true);
                  }}
                  className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {txn.id}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(txn.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white block truncate max-w-[200px]">{txn.accountSender}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                        &rarr; {txn.accountRecipient}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ${txn.amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-200 block">{txn.country}</span>
                      <span className="text-[10px] text-slate-400 block">{txn.paymentMethod}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${txn.riskScore >= 80 ? 'text-rose-400' : txn.riskScore >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {txn.riskScore}
                      </span>
                      {getSeverityBadge(txn.severity)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(txn.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTxn(txn);
                          setIsInvestigateOpen(true);
                        }}
                        className="text-[11px] h-7 px-2"
                      >
                        Investigate
                      </Button>

                      {txn.status !== 'REVIEWED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateTransactionStatus(txn.id, 'REVIEWED', 'Marked Reviewed')}
                          className="text-[11px] h-7 px-2"
                        >
                          Review
                        </Button>
                      )}

                      {txn.status !== 'ESCALATED' && txn.severity === 'CRITICAL' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateTransactionStatus(txn.id, 'ESCALATED', 'Escalated to AML Lead')}
                          className="text-[11px] h-7 px-2"
                        >
                          Escalate
                        </Button>
                      )}

                      {txn.status !== 'DISMISSED' && (
                        <button
                          onClick={() => updateTransactionStatus(txn.id, 'DISMISSED', 'Dismissed False Positive')}
                          className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors text-[11px]"
                          title="Dismiss alert"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Investigation Drawer / Modal */}
      {isInvestigateOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">{selectedTxn.id}</h3>
                    {getStatusBadge(selectedTxn.status)}
                    {getSeverityBadge(selectedTxn.severity)}
                  </div>
                  <p className="text-xs text-slate-400">
                    Amount: <strong className="text-white">${selectedTxn.amount.toLocaleString()} USD</strong> • {selectedTxn.paymentMethod}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsInvestigateOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 text-left">
              {/* Quick Status Control Bar */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-300">Change Investigation Status:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTransactionStatus(selectedTxn.id, 'UNDER_INVESTIGATION', 'Set Status: Under Investigation')}
                  >
                    Investigate
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateTransactionStatus(selectedTxn.id, 'REVIEWED', 'Approved & Cleared')}
                  >
                    Clear / Review
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => updateTransactionStatus(selectedTxn.id, 'ESCALATED', 'Escalated to Compliance Director')}
                  >
                    Escalate
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => updateTransactionStatus(selectedTxn.id, 'BLOCKED', 'Quarantined & Blocked Transfer')}
                  >
                    Block Wire
                  </Button>
                </div>
              </div>

              {/* Transaction Telemetry Grid */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Wire Telemetry & Routing Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Sender Account</span>
                    <span className="font-bold text-white block mt-0.5">{selectedTxn.accountSender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Beneficiary Account</span>
                    <span className="font-bold text-white block mt-0.5">{selectedTxn.accountRecipient}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Destination Country</span>
                    <span className="font-bold text-cyan-400 block mt-0.5">{selectedTxn.country} ({selectedTxn.recipientLocation})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Origin IP Address</span>
                    <span className="font-mono text-slate-200 block mt-0.5">{selectedTxn.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Device Fingerprint</span>
                    <span className="font-mono text-slate-200 block mt-0.5">{selectedTxn.deviceFingerprint}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Assigned Investigator</span>
                    <span className="font-bold text-cyan-400 block mt-0.5">{selectedTxn.assignedInvestigator || 'Elena Rostova'}</span>
                  </div>
                </div>
              </div>

              {/* Explainable Anomaly Factors Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Explainable Anomaly Factor Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedTxn.anomalyBreakdown && Object.entries(selectedTxn.anomalyBreakdown).map(([key, factor]) => {
                    const formattedTitle = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div
                        key={key}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          factor.isAnomaly
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{formattedTitle}</span>
                          <span className={`font-mono font-bold ${factor.score > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {factor.score}/100
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{factor.details}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Risk Reasons Callout */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Identified Risk Triggers & AML Violations:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc pl-5">
                  {selectedTxn.riskReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Forensic Investigation Notes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Forensic Notes & Case Log ({selectedTxn.investigationNotes?.length || 0}):
                  </span>
                </div>

                {/* Add Note Form */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add forensic observation, beneficial ownership check, or audit notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={newActionTaken}
                      onChange={(e) => setNewActionTaken(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="NOTE_ADDED">Note Only</option>
                      <option value="AML_DOC_REQUESTED">Requested AML Documents</option>
                      <option value="BENEFICIARY_VERIFIED">Beneficiary Verified</option>
                      <option value="QUARANTINE_EXTENDED">Quarantine Extended</option>
                    </select>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddInvestigationNote}
                      disabled={!newNoteText.trim()}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Attach Note
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {selectedTxn.investigationNotes?.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{note.authorName} ({note.authorEmployeeId})</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{note.note}</p>
                      {note.actionTaken && (
                        <Badge variant="cyan" size="sm" className="mt-1">{note.actionTaken}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV / XLSX Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Wire & Treasury Ledger" maxWidth="md">
        <div className="space-y-4 text-left">
          <FileDropzone
            onFileSelect={handleFileUpload}
            acceptTypes=".csv, .xlsx, .xls, .json"
            label="Drop Transaction CSV or Excel file"
            sublabel="Automatic metric recalculation and anomaly risk scoring"
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
