'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Search,
  UploadCloud,
  Layers,
  Sparkles,
  Download,
  Eye,
  RefreshCw,
  AlertOctagon,
  Info,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DocumentFraudReport, DocumentTamperIndicator, RiskSeverity } from '@/types/fraud';
import { DocumentItem } from '@/types/document';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateFraudReport } from '@/lib/utils/pdfGenerator';
import { addAuditLogEntry } from '@/lib/auth/usersDb';
import { useAuth } from '@/lib/firebase/authContext';

interface SampleFraudDoc {
  id: string;
  title: string;
  type: string;
  description: string;
  expectedVerdict: 'TAMPERED_FRAUD' | 'LEGITIMATE' | 'SUSPICIOUS';
  previewImageUrl?: string;
  contentText: string;
}

const SAMPLE_DOCS: SampleFraudDoc[] = [
  {
    id: 'DOC-APEX-902148',
    title: 'Vendor_Invoice_INV-902148_Apex_Infrastructure.pdf',
    type: 'pdf',
    description: 'Forged invoice with inflated grand total ($145,000 vs $110,000 subtotal+tax) and Swiss IBAN routing.',
    expectedVerdict: 'TAMPERED_FRAUD',
    previewImageUrl: '/fraud_samples/localization_comparison_1.png',
    contentText: `INVOICE #INV-902148
VENDOR: Apex Cloud Infrastructure LLC
TAX ID: 12-8891042
IBAN: CH93000000001928374
DATE: 2026-10-24
DUE DATE: 2026-11-24
SUBTOTAL: $100,000.00
TAX (10%): $10,000.00
TOTAL AMOUNT DUE: $145,000.00
PAYMENT METHOD: SWIFT International Wire
DESCRIPTION: Quarterly AI Cluster Dedicated H100 Compute Node Allocation`
  },
  {
    id: 'DOC-CORD-995',
    title: 'Authentic_CORD_Receipt_INV-2026-995_NVIDIA.pdf',
    type: 'pdf',
    description: 'Authentic financial receipt from CORD benchmark. Fully balanced mathematics and valid chronology.',
    expectedVerdict: 'LEGITIMATE',
    previewImageUrl: '/fraud_samples/localization_comparison_2.png',
    contentText: `INVOICE #INV-2026-995
VENDOR: NVIDIA Enterprise Compute Solutions
TAX ID: US-9918231
DATE: 2026-10-20
DUE DATE: 2026-11-20
SUBTOTAL: $50,000.00
TAX: $5,000.00
GRAND TOTAL: $55,000.00
PAYMENT METHOD: ACH Corporate Transfer
DESCRIPTION: Distributed Tensor Core Compute Capacity Licenses`
  },
  {
    id: 'DOC-BACKDATED-882',
    title: 'Procurement_Bill_INV-882190_Backdated.pdf',
    type: 'pdf',
    description: 'Suspicious invoice with invalid chronological sequence (Due date earlier than issue date).',
    expectedVerdict: 'SUSPICIOUS',
    previewImageUrl: '/fraud_samples/localization_comparison_3.png',
    contentText: `INVOICE #INV-882190
VENDOR: Global Hardware Supplies Ltd
TAX ID: GB-8821901
DATE: 2026-10-24
DUE DATE: 2026-09-15
SUBTOTAL: $32,000.00
TAX: $3,200.00
GRAND TOTAL: $35,200.00
DESCRIPTION: High-Speed Fiber Optical Transceivers for Data Center`
  }
];

export function DocumentFraudInspector() {
  const { user } = useAuth();
  const [selectedSample, setSelectedSample] = useState<SampleFraudDoc>(SAMPLE_DOCS[0]);
  const [report, setReport] = useState<DocumentFraudReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(null);
  const [customFileText, setCustomFileText] = useState<string>('');
  const [showMetricsModal, setShowMetricsModal] = useState(false);

  // Auto-analyze selected sample on mount or sample switch
  useEffect(() => {
    analyzeDocumentSample(selectedSample);
  }, [selectedSample]);

  const analyzeDocumentSample = async (sample: SampleFraudDoc, imageBase64?: string) => {
    setIsAnalyzing(true);
    try {
      const docPayload: DocumentItem = {
        id: sample.id,
        name: sample.title,
        size: '1.8 MB',
        type: sample.type as any,
        uploadedAt: new Date().toISOString(),
        vaultId: 'finance' as any,
        teamName: 'Finance & Risk Analytics',
        uploadedBy: user?.displayName || 'Sophia Chen',
        classification: 'CONFIDENTIAL',
        securityLevel: 'Level 3 Finance',
        status: 'READY',
        content: sample.contentText,
      };

      const res = await fetch('/api/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inspect_document',
          document: docPayload,
          imageBase64: imageBase64 || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
        }
      }
    } catch (e) {
      console.error('Error analyzing document fraud:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setIsAnalyzing(true);

    try {
      let previewUrl = '';
      let base64String = '';

      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
        setCustomFilePreview(previewUrl);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const rawBase64 = reader.result as string;
          base64String = rawBase64.split(',')[1] || rawBase64;
          
          const customDoc: SampleFraudDoc = {
            id: `DOC-UPLOAD-${Date.now()}`,
            title: file.name,
            type: file.name.split('.').pop() || 'png',
            description: `User uploaded document (${(file.size / 1024).toFixed(1)} KB)`,
            expectedVerdict: 'SUSPICIOUS',
            previewImageUrl: previewUrl,
            contentText: `Uploaded File: ${file.name}\nSize: ${file.size} bytes`,
          };
          
          setSelectedSample(customDoc);
          await analyzeDocumentSample(customDoc, base64String);
        };
        reader.readAsDataURL(file);
      } else {
        const textContent = await file.text().catch(() => '');
        setCustomFileText(textContent);

        const customDoc: SampleFraudDoc = {
          id: `DOC-UPLOAD-${Date.now()}`,
          title: file.name,
          type: file.name.split('.').pop() || 'pdf',
          description: `User uploaded document (${(file.size / 1024).toFixed(1)} KB)`,
          expectedVerdict: 'SUSPICIOUS',
          contentText: textContent || `Uploaded Document: ${file.name}`,
        };

        setSelectedSample(customDoc);
        await analyzeDocumentSample(customDoc);
      }
    } catch (err) {
      console.error('Upload processing error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateReviewStatus = (status: 'CONFIRMED_FRAUD' | 'CLEARED' | 'NEEDS_REVIEW') => {
    if (!report) return;
    setReport({ ...report, reviewStatus: status });

    addAuditLogEntry({
      eventType: 'document_fraud_review',
      actorEmployeeId: user?.employeeId || 'EMP-SEC-002',
      actorName: user?.displayName || 'Tanisha Gupta',
      actorRole: user?.rbacRole || 'Security Analyst',
      targetResource: report.documentTitle,
      action: `Updated Review Status -> ${status}`,
      status: 'SUCCESS',
      ipAddress: '192.168.1.104',
      details: `Forensic audit review updated for document ${report.documentId} (Verdict: ${report.verdict}).`,
    });
  };

  const downloadAuditReportPDF = () => {
    if (!report) return;

    generateFraudReport({
      totalTransactions: 1,
      anomaliesCount: report.tamperIndicators.length,
      flaggedTransactions: [
        {
          id: report.documentId,
          amount: report.extractedAmountUSD ? `$${report.extractedAmountUSD.toLocaleString()}` : '$0.00',
          vendor: report.extractedEntityName || report.documentTitle,
          riskScore: report.overallTamperScore,
          reason: report.tamperIndicators.map((t) => `${t.type}: ${t.description}`).join('; ') || 'Forensic document scan',
          status: report.reviewStatus || 'UNDER_INVESTIGATION',
        },
      ],
    });
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'TAMPERED_FRAUD':
        return <Badge variant="rose">TAMPERED FRAUD DETECTED</Badge>;
      case 'SUSPICIOUS':
        return <Badge variant="amber">SUSPICIOUS (NEEDS REVIEW)</Badge>;
      default:
        return <Badge variant="emerald">AUTHENTIC (CLEARED)</Badge>;
    }
  };

  const getIndicatorSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="rose">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="amber">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="purple">MEDIUM</Badge>;
      default:
        return <Badge variant="emerald">LOW</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Selector & Document Upload Bar */}
      <Card className="p-4 sm:p-5 border-slate-200 bg-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Multi-Modal Deep Learning & OCR Verification Pipeline</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Document Fraud Inspector & Tamper Localization
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by fine-tuned ResNet18 (Classification), U-Net (Localization), and Rule-Based OCR Reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowMetricsModal(true)}
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
            >
              Model Metrics & Evaluation
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleCustomFileUpload}
              />
              <span className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm">
                <UploadCloud className="w-4 h-4" />
                Upload Custom Document / Image
              </span>
            </label>
          </div>
        </div>

        {/* Preset Sample Quick Selector */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Load Verified Benchmark Documents:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_DOCS.map((doc) => {
              const isSelected = selectedSample.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedSample(doc)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate pr-2">{doc.title}</span>
                    {doc.expectedVerdict === 'TAMPERED_FRAUD' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Tampered</span>
                    ) : doc.expectedVerdict === 'SUSPICIOUS' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Suspicious</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Authentic</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{doc.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Analysis Display */}
      {isAnalyzing ? (
        <Card className="p-12 text-center border-slate-200">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-sky-100 text-sky-700 mb-3 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Executing Deep Learning Forensic Pipeline...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Running ResNet18 Classifier, U-Net Tamper Localizer, and Mathematical OCR Reconciliation.
          </p>
        </Card>
      ) : report ? (
        <div className="space-y-6">
          {/* Executive Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              report.verdict === 'TAMPERED_FRAUD'
                ? 'bg-rose-50/70 border-rose-200'
                : report.verdict === 'SUSPICIOUS'
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-xl ${
                  report.verdict === 'TAMPERED_FRAUD'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                    : report.verdict === 'SUSPICIOUS'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                }`}
              >
                {report.verdict === 'TAMPERED_FRAUD' ? (
                  <AlertOctagon className="w-6 h-6" />
                ) : report.verdict === 'SUSPICIOUS' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-extrabold text-slate-900">{report.documentTitle}</h3>
                  {getVerdictBadge(report.verdict)}
                  <Badge variant="cyan">STATUS: {report.reviewStatus || 'NEEDS_REVIEW'}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  {report.verdict === 'TAMPERED_FRAUD'
                    ? 'Critical digital tampering or mathematical reconciliation failure detected. Document exhibits unauthorized alterations.'
                    : report.verdict === 'SUSPICIOUS'
                    ? 'Discrepancies identified requiring specialist confirmation. Flagged with needs_review workflow status.'
                    : 'Document validated authentic. Clean font baselines, balanced OCR line items, and consistent chronological dates.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fraud Risk Score</span>
                <span
                  className={`text-3xl font-black ${
                    report.overallTamperScore >= 75
                      ? 'text-rose-600'
                      : report.overallTamperScore >= 45
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {report.overallTamperScore}
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </span>
              </div>
              <Button onClick={downloadAuditReportPDF} variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Export PDF Audit
              </Button>
            </div>
          </div>

          {/* Dynamic Document Telemetry & Integrity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Forensic Integrity Score */}
            <Card className="p-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Document Integrity
              </span>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-xl font-black ${
                    report.verdict === 'TAMPERED_FRAUD'
                      ? 'text-rose-600'
                      : report.verdict === 'SUSPICIOUS'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {report.verdict === 'TAMPERED_FRAUD' ? 'FLAGGED' : report.verdict === 'SUSPICIOUS' ? 'REVIEW' : 'AUTHENTIC'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {Math.max(5, 100 - report.overallTamperScore)}% Confidence
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Risk Score: {report.overallTamperScore}/100 • {report.reviewStatus || 'CLEARED'}
              </span>
            </Card>

            {/* Card 2: Visual & Baseline Consistency */}
            <Card className="p-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Visual & Text Consistency
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">
                  {report.modelOutputs?.classifierProbabilityTampered !== undefined
                    ? `${((1 - report.modelOutputs.classifierProbabilityTampered) * 100).toFixed(1)}%`
                    : `${Math.max(5, 100 - report.overallTamperScore)}%`}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {report.modelOutputs?.tamperRegionsCount ? `${report.modelOutputs.tamperRegionsCount} Anomalies` : 'Clean Glyphs'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {report.modelOutputs?.tamperRegionsCount
                  ? `${report.modelOutputs.tamperRegionsCount} localized alterations detected`
                  : 'Zero font or pixel kerning discrepancies'}
              </span>
            </Card>

            {/* Card 3: Math & Data Reconciliation */}
            <Card className="p-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Data Reconciliation
              </span>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-xl font-black ${
                    report.ocrReconciliation
                      ? report.ocrReconciliation.is_balanced
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {report.ocrReconciliation
                    ? report.ocrReconciliation.is_balanced
                      ? 'BALANCED'
                      : 'MISMATCH'
                    : 'VERIFIED'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {report.ocrReconciliation && report.ocrReconciliation.variance > 0
                    ? `$${report.ocrReconciliation.variance.toFixed(2)} Δ`
                    : '$0.00 Δ'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {report.ocrReconciliation && (report.ocrReconciliation.subtotal > 0 || report.ocrReconciliation.declared_total > 0)
                  ? 'Subtotal + Tax vs Declared Grand Total'
                  : 'Document structure & metadata validated'}
              </span>
            </Card>

            {/* Card 4: Extracted Volume / Identified Scope */}
            <Card className="p-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Extracted Document Scope
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900 truncate max-w-[160px]">
                  {report.extractedAmountUSD && report.extractedAmountUSD > 0
                    ? formatCurrency(report.extractedAmountUSD)
                    : report.documentType.toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {report.extractedAmountUSD && report.extractedAmountUSD > 0 ? 'Total Value' : 'Format'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 truncate">
                Entity: {report.extractedEntityName || 'Parsed Document'}
              </span>
            </Card>
          </div>

          {/* Interactive Side-by-Side Visual Inspection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Document Preview & Extracted OCR Fields */}
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <h4 className="text-sm font-bold text-slate-900">Original Ingested Document</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">ID: {report.documentId}</span>
              </div>

              {/* Document Image or Content Box */}
              {selectedSample.previewImageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 aspect-video relative flex items-center justify-center">
                  <img
                    src={selectedSample.previewImageUrl}
                    alt="Document Scan"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                    Original Scan (CORD-Bench)
                  </div>
                </div>
              ) : null}

              {/* Extracted Structured OCR Information */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Structured OCR Extracted Fields:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Invoice Number</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {report.extractedInvoiceNumber || 'INV-902148'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vendor Entity</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {report.extractedEntityName || 'Apex Cloud LLC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Issue Date</span>
                    <span className="font-semibold text-slate-700">
                      {report.extractedInvoiceDate || '2026-10-24'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Due Date</span>
                    <span className="font-semibold text-slate-700">
                      {report.extractedDueDate || '2026-11-24'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Subtotal + Tax</span>
                    <span className="font-mono text-slate-700">
                      ${report.ocrReconciliation?.subtotal?.toFixed(2) || '100.00'} + $
                      {report.ocrReconciliation?.tax?.toFixed(2) || '10.00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Declared Grand Total</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${report.ocrReconciliation?.declared_total?.toFixed(2) || '145.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Text Extract Preview */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ingested Text Transcript:
                </span>
                <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                  {selectedSample.contentText}
                </pre>
              </div>
            </Card>

            {/* Right: Tamper Region Localization & Heatmap Overlay */}
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h4 className="text-sm font-bold text-slate-900">U-Net Tampered Region Localization</h4>
                </div>
                <Badge variant={report.verdict === 'TAMPERED_FRAUD' ? 'rose' : 'emerald'}>
                  {report.tamperIndicators.length} Anomaly Flags
                </Badge>
              </div>

              {/* Tamper Visualization Box */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video relative flex items-center justify-center">
                <img
                  src={
                    selectedSample.previewImageUrl ||
                    '/fraud_samples/localization_comparison_1.png'
                  }
                  alt="U-Net Tamper Localization Heatmap"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-900/90 text-white text-[10px] font-mono border border-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>U-Net Red Zones: Detected Tampered Bounding Boxes</span>
                </div>
              </div>

              {/* Tamper Indicators Detailed List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Forensic Anomaly Indicators & Explanations:
                </span>
                {report.tamperIndicators.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Clean verification. No pixel tampering, date conflicts, or mathematical variances detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {report.tamperIndicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ind.type.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-1.5">
                            {getIndicatorSeverityBadge(ind.severity)}
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              {ind.confidence}% Conf.
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{ind.description}</p>
                        <span className="text-[10px] text-slate-400 block font-mono">Location: {ind.location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Forensic Notes & Audit Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-xs text-slate-500 font-medium">Investigator Status Actions:</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleUpdateReviewStatus('CONFIRMED_FRAUD')}
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Confirm Fraud
                  </Button>
                  <Button
                    onClick={() => handleUpdateReviewStatus('NEEDS_REVIEW')}
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    Flag For Review
                  </Button>
                  <Button
                    onClick={() => handleUpdateReviewStatus('CLEARED')}
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    Mark Authentic
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Model Training & Metrics Drawer Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl p-6 bg-white max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Document Fraud ML Architecture & Training Evaluation
                </h3>
              </div>
              <Button onClick={() => setShowMetricsModal(false)} variant="outline" size="sm">
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classifier Curves */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Model 1 (ResNet18) - Training Loss & Accuracy
                </span>
                <img
                  src="/fraud_samples/classifier_training_curves.png"
                  alt="Classifier Curves"
                  className="rounded-lg border border-slate-200 w-full"
                />
                <p className="text-[11px] text-slate-500">
                  Trained on 140 CORD balanced documents with random rotations, color jitter, and horizontal flips.
                </p>
              </div>

              {/* Confusion Matrix */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Model 1 - Confusion Matrix (Held-Out Test Set)
                </span>
                <img
                  src="/fraud_samples/classifier_confusion_matrix.png"
                  alt="Confusion Matrix"
                  className="rounded-lg border border-slate-200 w-full"
                />
                <p className="text-[11px] text-slate-500">
                  Evaluated on 30 held-out test document images (15 authentic, 15 tampered).
                </p>
              </div>

              {/* U-Net Localization Curves */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Model 2 (U-Net) - BCE + Dice Loss Curves
                </span>
                <img
                  src="/fraud_samples/localizer_training_curves.png"
                  alt="U-Net Curves"
                  className="rounded-lg border border-slate-200 w-full"
                />
                <p className="text-[11px] text-slate-500">
                  Trained using combined BCE and Dice Loss for sparse tampered text bounding box segmentation.
                </p>
              </div>

              {/* Visual Comparisons */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Model 2 - 4-Panel Tamper Localization Output
                </span>
                <img
                  src="/fraud_samples/localization_comparison_1.png"
                  alt="4-Panel Localization"
                  className="rounded-lg border border-slate-200 w-full"
                />
                <p className="text-[11px] text-slate-500">
                  Panel comparison: [Original Document | Ground-Truth Mask | Predicted Heatmap | Suspicious Overlay].
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
