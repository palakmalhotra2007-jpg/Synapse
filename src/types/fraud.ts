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
