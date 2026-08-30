import { TransactionRecord, FraudAnalysisSummary } from '@/types/fraud';

export const sampleTransactions: TransactionRecord[] = [
  {
    id: 'TXN-902148',
    timestamp: '2026-08-30T10:42:15Z',
    accountSender: 'ACC-881940 (Global Capital Corp)',
    accountRecipient: 'ACC-110294 (Apex Offshore Holdings)',
    senderLocation: 'New York, US',
    recipientLocation: 'George Town, KY (Cayman Islands)',
    amount: 1450000,
    currency: 'USD',
    merchantCategory: 'Financial Services / Offshore Wire',
    deviceFingerprint: 'DEV-FP-99021-X',
    ipAddress: '185.220.101.5',
    riskScore: 94,
    severity: 'CRITICAL',
    flagReasons: [
      'Abnormal transaction velocity (5 wires in 12 minutes)',
      'High-risk offshore tax sanctuary recipient',
      'Unrecognized VPN/Tor Exit Node IP Address',
      'Exceeds 90-day baseline transfer limit by 420%'
    ],
    status: 'FLAGGED',
    anomalyFactors: {
      velocityFactor: 8.4,
      amountAnomaly: 4.2,
      geoMismatch: true,
      knownBlacklistIP: true
    }
  },
  {
    id: 'TXN-881923',
    timestamp: '2026-08-30T09:15:30Z',
    accountSender: 'ACC-441029 (Starlight Tech Systems)',
    accountRecipient: 'ACC-992014 (Nexus Data Solutions)',
    senderLocation: 'London, UK',
    recipientLocation: 'Zurich, CH',
    amount: 480000,
    currency: 'USD',
    merchantCategory: 'Software Services / Enterprise License',
    deviceFingerprint: 'DEV-FP-33019-B',
    ipAddress: '194.26.29.110',
    riskScore: 82,
    severity: 'HIGH',
    flagReasons: [
      'Rapid sequential transfer following vendor account modification',
      'Mismatched IBAN routing clearing house',
      'Off-hours corporate transaction'
    ],
    status: 'UNDER_REVIEW',
    anomalyFactors: {
      velocityFactor: 4.1,
      amountAnomaly: 2.5,
      geoMismatch: true,
      knownBlacklistIP: false
    }
  },
  {
    id: 'TXN-773019',
    timestamp: '2026-08-30T08:50:11Z',
    accountSender: 'ACC-119203 (Vanguard Logistics)',
    accountRecipient: 'ACC-552019 (Fuel Logistics Direct)',
    senderLocation: 'Chicago, US',
    recipientLocation: 'Houston, US',
    amount: 85200,
    currency: 'USD',
    merchantCategory: 'Freight & Fleet Operations',
    deviceFingerprint: 'DEV-FP-11029-A',
    ipAddress: '64.233.160.1',
    riskScore: 35,
    severity: 'LOW',
    flagReasons: [
      'Slight deviation from recurring payment schedule'
    ],
    status: 'VERIFIED',
    anomalyFactors: {
      velocityFactor: 1.1,
      amountAnomaly: 1.0,
      geoMismatch: false,
      knownBlacklistIP: false
    }
  },
  {
    id: 'TXN-661092',
    timestamp: '2026-08-30T07:22:45Z',
    accountSender: 'ACC-339201 (Horizon BioHealth)',
    accountRecipient: 'ACC-882194 (CyberShield Security)',
    senderLocation: 'San Francisco, US',
    recipientLocation: 'Tel Aviv, IL',
    amount: 230000,
    currency: 'USD',
    merchantCategory: 'Cybersecurity Infrastructure',
    deviceFingerprint: 'DEV-FP-77210-C',
    ipAddress: '82.102.21.99',
    riskScore: 68,
    severity: 'MEDIUM',
    flagReasons: [
      'Cross-border transaction with new supplier',
      'Amount near single-signoff approval threshold ($250,000)'
    ],
    status: 'UNDER_REVIEW',
    anomalyFactors: {
      velocityFactor: 2.2,
      amountAnomaly: 1.8,
      geoMismatch: true,
      knownBlacklistIP: false
    }
  },
  {
    id: 'TXN-551920',
    timestamp: '2026-08-30T06:10:04Z',
    accountSender: 'ACC-772810 (Omni Retail Holdings)',
    accountRecipient: 'ACC-449102 (FastPay Gateway Solutions)',
    senderLocation: 'Frankfurt, DE',
    recipientLocation: 'Singapore, SG',
    amount: 1920000,
    currency: 'USD',
    merchantCategory: 'Payment Gateway Settlement',
    deviceFingerprint: 'DEV-FP-55102-D',
    ipAddress: '103.253.25.10',
    riskScore: 91,
    severity: 'CRITICAL',
    flagReasons: [
      'Unusual split payment structuring detected (Struct-9 Rule)',
      'Multiple failed authentication attempts prior to dispatch',
      'High-risk velocity burst across 3 sub-accounts'
    ],
    status: 'BLOCKED',
    anomalyFactors: {
      velocityFactor: 7.9,
      amountAnomaly: 3.8,
      geoMismatch: true,
      knownBlacklistIP: true
    }
  },
  {
    id: 'TXN-442910',
    timestamp: '2026-08-29T22:14:50Z',
    accountSender: 'ACC-881940 (Global Capital Corp)',
    accountRecipient: 'ACC-229104 (Standard Operations Inc)',
    senderLocation: 'New York, US',
    recipientLocation: 'Boston, US',
    amount: 45000,
    currency: 'USD',
    merchantCategory: 'Corporate Real Estate Lease',
    deviceFingerprint: 'DEV-FP-99021-X',
    ipAddress: '198.51.100.42',
    riskScore: 12,
    severity: 'LOW',
    flagReasons: [],
    status: 'VERIFIED',
    anomalyFactors: {
      velocityFactor: 0.9,
      amountAnomaly: 0.8,
      geoMismatch: false,
      knownBlacklistIP: false
    }
  }
];

export const sampleFraudSummary: FraudAnalysisSummary = {
  id: 'SUMMARY-2026-Q3-001',
  datasetName: 'Enterprise Financial Ledger - August 2026',
  processedAt: '2026-08-30T11:00:00Z',
  totalTransactions: 12480,
  totalVolumeUSD: 48920000,
  flaggedCount: 142,
  flaggedVolumeUSD: 6420000,
  averageRiskScore: 28.4,
  criticalAlertCount: 18,
  highRiskCount: 34,
  mediumRiskCount: 52,
  lowRiskCount: 38,
  topRiskCategories: [
    { category: 'Offshore Wire Transfer', count: 48 },
    { category: 'Payment Gateway Structuring', count: 36 },
    { category: 'Mismatched Vendor IBAN', count: 29 },
    { category: 'Tor/VPN Node Velocity', count: 22 },
    { category: 'Off-hours Threshold Spike', count: 7 }
  ],
  locationRiskMap: [
    { country: 'Cayman Islands', count: 42, riskScore: 92 },
    { country: 'Singapore', count: 28, riskScore: 84 },
    { country: 'Switzerland', count: 22, riskScore: 68 },
    { country: 'Israel', count: 18, riskScore: 62 },
    { country: 'United States', count: 32, riskScore: 22 }
  ]
};
