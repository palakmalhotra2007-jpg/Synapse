export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TransactionRecord {
  id: string;
  timestamp: string;
  accountSender: string;
  accountRecipient: string;
  senderLocation: string;
  recipientLocation: string;
  amount: number;
  currency: string;
  merchantCategory: string;
  deviceFingerprint: string;
  ipAddress: string;
  riskScore: number; // 0 - 100
  severity: RiskSeverity;
  flagReasons: string[];
  status: 'FLAGGED' | 'VERIFIED' | 'UNDER_REVIEW' | 'BLOCKED';
  anomalyFactors: {
    velocityFactor: number;
    amountAnomaly: number;
    geoMismatch: boolean;
    knownBlacklistIP: boolean;
  };
}

export interface FraudAnalysisSummary {
  id: string;
  datasetName: string;
  processedAt: string;
  totalTransactions: number;
  totalVolumeUSD: number;
  flaggedCount: number;
  flaggedVolumeUSD: number;
  averageRiskScore: number;
  criticalAlertCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topRiskCategories: { category: string; count: number }[];
  locationRiskMap: { country: string; count: number; riskScore: number }[];
}

export interface DocumentTamperIndicator {
  type: 'FONT_MISMATCH' | 'SIGNATURE_FORGERY' | 'TAX_ID_INVALID' | 'IBAN_MISMATCH' | 'DATE_COLLISION' | 'AMOUNT_TAMPERING';
  severity: RiskSeverity;
  description: string;
  location: string;
  confidence: number; // 0 - 100
}

export interface DocumentFraudReport {
  documentId: string;
  documentTitle: string;
  documentType: string;
  uploadedBy: string;
  teamName: string;
  overallTamperScore: number; // 0 - 100 (high is risky)
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'TAMPERED_FRAUD';
  tamperIndicators: DocumentTamperIndicator[];
  extractedAmountUSD?: number;
  extractedEntityName?: string;
  extractedTaxId?: string;
  extractedIBAN?: string;
  forensicNotes: string[];
  scanTimestamp: string;
}

export interface DocumentDiscrepancy {
  id: string;
  transactionId: string;
  documentId: string;
  documentTitle: string;
  type: 'AMOUNT_MISMATCH' | 'UNAUTHORIZED_BENEFICIARY' | 'SLA_BREACH' | 'MISSING_INVOICE' | 'SHELL_COMPANY_ROUTING';
  severity: RiskSeverity;
  ledgerValue: string;
  documentValue: string;
  variancePercent?: number;
  explanation: string;
  flaggedAt: string;
  recommendation: string;
}

export interface OmniFraudAuditResult {
  auditId: string;
  auditName: string;
  totalTransactionsAudited: number;
  totalDocumentsCrossChecked: number;
  totalDiscrepanciesFound: number;
  criticalRiskVolumeUSD: number;
  discrepancies: DocumentDiscrepancy[];
  documentReports: DocumentFraudReport[];
  overallIntegrityScore: number; // 0 - 100
  executiveForensicSummary: string;
  recommendations: string[];
}

