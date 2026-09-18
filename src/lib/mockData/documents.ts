import { DocumentItem, DocumentComparisonResult } from '@/types/document';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'DOC-2026-MSA-01',
    name: 'Master Enterprise Cloud Services Agreement 2026.pdf',
    size: '3.4 MB',
    type: 'pdf',
    uploadedAt: '2026-08-28T14:30:00Z',
    updatedAt: '2026-09-10T11:00:00Z',
    vaultId: 'legal',
    teamId: 'legal_compliance',
    teamName: 'Legal & Contracts Vault',
    uploadedBy: 'David Miller',
    uploadedByEmployeeId: 'EMP-LGL-005',
    accessLevel: 'CONFIDENTIAL',
    classification: 'CONFIDENTIAL',
    securityLevel: 'Level 2 Legal',
    status: 'READY',
    pageCount: 24,
    wordCount: 8450,
    sensitivityScore: 82,
    tags: ['Legal MSA', 'SLA 99.95%', 'Liability Cap', 'Compliance'],
    summary: 'Comprehensive Master Service Agreement governing enterprise AI SaaS deployment, SLA uptime commitments (99.95%), liability caps ($5M), data sovereignty, and security encryption standards.',
    content: `MASTER ENTERPRISE SERVICES AGREEMENT (2026 REVISION)

SECTION 1: SCOPE OF SERVICES
Provider agrees to grant Customer a non-exclusive, non-transferable enterprise license to access Synapse AI Intelligence Platform, including AI Workspace, Fraud Analysis Engine, Meeting Intelligence, and Document Intelligence Vaults.

SECTION 4: SERVICE LEVEL AGREEMENT (SLA) & UPTIME
Provider guarantees a monthly uptime percentage of 99.95%. In the event of an unplanned service interruption exceeding 0.05% in any calendar month, Customer shall receive a service credit equal to 15% of monthly recurring fees.

SECTION 8: LIMITATION OF LIABILITY
Neither party's cumulative liability arising out of or related to this Agreement shall exceed $5,000,000 USD or the total fees paid by Customer in the preceding 12 months, whichever is greater.

SECTION 12: DATA PRIVACY & FIRESTORE ENCRYPTION
All customer data uploaded to Synapse, including transaction logs, meeting audio transcripts, and proprietary documents, is encrypted at rest using AES-256 and in transit via TLS 1.3. No customer data shall be used to train foundation models without explicit opt-in consent.`,
    keyClauses: [
      {
        type: 'obligation',
        title: 'Guaranteed 99.95% System Uptime SLA',
        snippet: 'Provider guarantees a monthly uptime percentage of 99.95%. Interruptions trigger 15% service credits.',
        pageOrSection: 'Section 4.1 (page 7)',
        riskLevel: 'LOW',
      },
      {
        type: 'liability',
        title: 'Mutual Cumulative Liability Cap',
        snippet: 'Cumulative liability shall not exceed $5,000,000 USD or 12 months of paid fees.',
        pageOrSection: 'Section 8.2 (page 14)',
        riskLevel: 'MEDIUM',
      },
      {
        type: 'compliance',
        title: 'Zero AI Model Training Guarantee & AES-256',
        snippet: 'Customer data is encrypted using AES-256 and never used for model training without explicit consent.',
        pageOrSection: 'Section 12.4 (page 19)',
        riskLevel: 'LOW',
      },
    ],
    versions: [
      {
        version: '1.2.0',
        updatedAt: '2026-09-10T11:00:00Z',
        updatedBy: 'David Miller',
        updatedByEmployeeId: 'EMP-LGL-005',
        changeNote: 'Updated liability cap from $2M to $5M and added data sovereignty clause.',
        size: '3.4 MB',
      },
      {
        version: '1.0.0',
        updatedAt: '2026-08-28T14:30:00Z',
        updatedBy: 'David Miller',
        updatedByEmployeeId: 'EMP-LGL-005',
        changeNote: 'Initial draft for 2026 enterprise deployment.',
        size: '3.1 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-msa-01',
        employeeId: 'EMP-EXEC-001',
        employeeName: 'Alex Sterling',
        action: 'VIEW',
        timestamp: '2026-09-16T16:50:00Z',
        ipAddress: '192.168.1.100',
        status: 'SUCCESS',
      },
      {
        id: 'acc-msa-02',
        employeeId: 'EMP-LGL-005',
        employeeName: 'David Miller',
        action: 'COMPARE',
        timestamp: '2026-09-15T14:20:00Z',
        ipAddress: '192.168.1.130',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-2026-FIN-02',
    name: 'Q2 2026 Enterprise Financial Performance & Audit Report.pdf',
    size: '4.8 MB',
    type: 'pdf',
    uploadedAt: '2026-08-25T11:15:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    vaultId: 'finance',
    teamId: 'finance_risk',
    teamName: 'Finance & Risk Analytics',
    uploadedBy: 'Sophia Chen',
    uploadedByEmployeeId: 'EMP-FIN-004',
    accessLevel: 'TEAM_ONLY',
    classification: 'CONFIDENTIAL',
    securityLevel: 'Level 3 Finance',
    status: 'READY',
    pageCount: 38,
    wordCount: 12100,
    sensitivityScore: 75,
    tags: ['Financial Audit', 'ARR Growth', 'P&L', 'SEC 10-Q'],
    summary: 'Executive quarterly financial review detailing 142% YoY ARR expansion, gross profit margin of 84%, operating expenditure breakdown, and risk reserve allocation for fraud prevention tooling.',
    content: `Q2 2026 FINANCIAL PERFORMANCE & AUDIT REPORT

EXECUTIVE SUMMARY
Synapse Enterprise achieved record quarterly revenue of $24.8 Million in Q2 2026, representing a 142% Year-over-Year increase. Growth was primarily propelled by enterprise expansion across financial institutions adopting our Fraud Detection Engine.

FINANCIAL HIGHLIGHTS
- Annual Recurring Revenue (ARR): $92.4M (vs $38.2M Q2 2025)
- Gross Profit Margin: 84.2%
- Cloud Infrastructure Operating Cost: $1.42M
- Net Revenue Retention (NRR): 134%`,
    keyClauses: [
      {
        type: 'financial',
        title: 'ARR Growth & Gross Margin Breakdown',
        snippet: 'ARR hit $92.4M with gross margins expanding to 84.2%.',
        pageOrSection: 'Executive Highlights (page 3)',
        riskLevel: 'LOW',
      },
      {
        type: 'risk',
        title: 'Infrastructure Cost vs Revenue Scaling',
        snippet: 'Cloud Infrastructure cost grew to $1.42M driven by high-throughput RAG document parsing.',
        pageOrSection: 'Section 3.2 (page 11)',
        riskLevel: 'MEDIUM',
      },
    ],
    versions: [
      {
        version: '1.0.0',
        updatedAt: '2026-08-25T11:15:00Z',
        updatedBy: 'Sophia Chen',
        updatedByEmployeeId: 'EMP-FIN-004',
        changeNote: 'Quarterly financial close audit report filed with board.',
        size: '4.8 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-fin-01',
        employeeId: 'EMP-FIN-004',
        employeeName: 'Sophia Chen',
        action: 'VIEW',
        timestamp: '2026-09-16T10:15:00Z',
        ipAddress: '192.168.1.120',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-2026-EXEC-03',
    name: 'Board Strategic Capital Allocation & AI Roadmap 2026.pdf',
    size: '6.2 MB',
    type: 'pdf',
    uploadedAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
    vaultId: 'executive',
    teamId: 'executive_ops',
    teamName: 'Executive Leadership Vault',
    uploadedBy: 'Alex Sterling',
    uploadedByEmployeeId: 'EMP-EXEC-001',
    accessLevel: 'RESTRICTED',
    classification: 'TOP SECRET',
    securityLevel: 'Level 5 Executive',
    status: 'READY',
    pageCount: 45,
    wordCount: 16500,
    sensitivityScore: 98,
    tags: ['Board Governance', 'M&A Pipeline', 'Capital Budget', 'Neural R&D'],
    summary: 'Restricted executive strategy paper outlining $45M Series C expansion, European banking compliance framework, and GPU cluster infrastructure provisioning.',
    content: `BOARD OF DIRECTORS EXECUTIVE MEMORANDUM
CONFIDENTIALITY LEVEL: TOP SECRET / STRICTLY COMPARTMENTED

1. STRATEGIC CAPITAL ALLOCATION
The board has approved the allocation of $45,000,000 across 3 primary strategic vectors:
- 40% ($18M) to Distributed Neural H100 Cluster Procurement
- 35% ($15.75M) to Global Sales Expansion across EMEA and APAC
- 25% ($11.25M) to Fraud Defense & Sovereign Data Residency Infrastructure.`,
    keyClauses: [
      {
        type: 'financial',
        title: 'Strategic Capital Expenditure Commitment',
        snippet: '$45,000,000 allocated for GPU clusters, sales expansion, and sovereign vaults.',
        pageOrSection: 'Section 1.1',
        riskLevel: 'LOW',
      },
      {
        type: 'liability',
        title: 'Executive Non-Disclosure & Regulatory Compliance',
        snippet: 'Restricted under Section 16 SEC governance rules. Unauthorized disclosure triggers immediate termination.',
        pageOrSection: 'Section 6.3',
        riskLevel: 'HIGH',
      },
    ],
    versions: [
      {
        version: '1.1.0',
        updatedAt: '2026-09-12T14:30:00Z',
        updatedBy: 'Alex Sterling',
        updatedByEmployeeId: 'EMP-EXEC-001',
        changeNote: 'Incorporated EMEA banking compliance additions.',
        size: '6.2 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-exec-01',
        employeeId: 'EMP-EXEC-001',
        employeeName: 'Alex Sterling',
        action: 'VIEW',
        timestamp: '2026-09-16T08:45:00Z',
        ipAddress: '192.168.1.100',
        status: 'SUCCESS',
      },
      {
        id: 'acc-exec-02',
        employeeId: 'EMP-ENG-006',
        employeeName: 'Sarah Connor',
        action: 'VIEW',
        timestamp: '2026-09-16T11:15:00Z',
        ipAddress: '192.168.1.140',
        status: 'DENIED',
      },
    ],
  },
  {
    id: 'DOC-2026-SEC-04',
    name: 'Cyber Threat Intelligence & AML Screening Guidelines.pdf',
    size: '2.9 MB',
    type: 'pdf',
    uploadedAt: '2026-09-05T13:20:00Z',
    updatedAt: '2026-09-14T10:00:00Z',
    vaultId: 'cyber',
    teamId: 'fraud_security',
    teamName: 'Cyber & Fraud Ops Vault',
    uploadedBy: 'Elena Rostova',
    uploadedByEmployeeId: 'EMP-SEC-002',
    accessLevel: 'RESTRICTED',
    classification: 'TOP SECRET',
    securityLevel: 'Level 4 Cyber',
    status: 'READY',
    pageCount: 18,
    wordCount: 6200,
    sensitivityScore: 92,
    tags: ['AML Thresholds', 'SWIFT Forensics', 'Sanctions Screening', 'Velocity Rules'],
    summary: 'Standard Operating Procedure for high-velocity transaction auditing, automated sanction list cross-checks, and account freeze criteria.',
    content: `CYBER & FRAUD FORENSICS STANDARD OPERATING PROCEDURE

RULE 1: VELOCITY ANOMALY THRESHOLDS
Any account originating transfers exceeding 300% of historical 30-day velocity shall be placed into automated quarantine pending manual inspection.

RULE 2: WIRE AMOUNT THRESHOLD
Transactions exceeding $500,000 USD require dual Level 4 Security Analyst sign-off and cross-verification against verified Master Invoices.`,
    keyClauses: [
      {
        type: 'obligation',
        title: 'Mandatory Dual-Signoff on Wires > $500,000',
        snippet: 'Transactions exceeding $500,000 USD require dual Level 4 Analyst approval.',
        pageOrSection: 'Rule 2.1',
        riskLevel: 'HIGH',
      },
    ],
    versions: [
      {
        version: '1.0.0',
        updatedAt: '2026-09-05T13:20:00Z',
        updatedBy: 'Elena Rostova',
        updatedByEmployeeId: 'EMP-SEC-002',
        changeNote: 'Baseline AML procedure approved by CTO and Legal.',
        size: '2.9 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-sec-01',
        employeeId: 'EMP-SEC-002',
        employeeName: 'Elena Rostova',
        action: 'VIEW',
        timestamp: '2026-09-16T09:20:00Z',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-2026-ENG-05',
    name: 'Neural Model Architecture & Vector Indexing RFC.pdf',
    size: '5.1 MB',
    type: 'pdf',
    uploadedAt: '2026-09-08T15:40:00Z',
    updatedAt: '2026-09-15T09:30:00Z',
    vaultId: 'engineering',
    teamId: 'engineering',
    teamName: 'Engineering Vault',
    uploadedBy: 'Marcus Vance',
    uploadedByEmployeeId: 'EMP-ENG-003',
    accessLevel: 'TEAM_ONLY',
    classification: 'INTERNAL RESTRICTED',
    securityLevel: 'Level 1 Standard',
    status: 'READY',
    pageCount: 32,
    wordCount: 9800,
    sensitivityScore: 65,
    tags: ['Architecture RFC', 'Vector Embeddings', 'Distributed RAG', 'H100 Cluster'],
    summary: 'Technical specification for Synapse distributed vector search pipeline, multi-hop RAG orchestration, and sub-50ms inference SLA.',
    content: `SYNAPSE DISTRIBUTED VECTOR ARCHITECTURE RFC

1. DISTRIBUTED HNSW VECTOR INDEXING
The vector store utilizes hierarchical navigable small world graphs partitioned across 8 GPU worker nodes with sub-25ms retrieval latency.`,
    keyClauses: [
      {
        type: 'obligation',
        title: 'Sub-50ms End-to-End Inference SLA',
        snippet: 'Platform guarantees 99th percentile inference latency below 50 milliseconds.',
        pageOrSection: 'Section 4.1',
        riskLevel: 'LOW',
      },
    ],
    versions: [
      {
        version: '1.0.0',
        updatedAt: '2026-09-08T15:40:00Z',
        updatedBy: 'Marcus Vance',
        updatedByEmployeeId: 'EMP-ENG-003',
        changeNote: 'Initial RFC proposal.',
        size: '5.1 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-eng-01',
        employeeId: 'EMP-ENG-003',
        employeeName: 'Marcus Vance',
        action: 'VIEW',
        timestamp: '2026-09-16T09:50:00Z',
        ipAddress: '192.168.1.112',
        status: 'SUCCESS',
      },
    ],
  },
];

export const sampleDocComparison: DocumentComparisonResult = {
  doc1Name: 'Master Enterprise Cloud Services Agreement 2025 (v1.0)',
  doc2Name: 'Master Enterprise Cloud Services Agreement 2026 (v2.0)',
  similarityScore: 84,
  financialVariance: 'Liability Cap increased from $2,000,000 USD to $5,000,000 USD (+150%). Service credit ceiling increased from 10% to 15%.',
  riskVariance: 'Overall contractual risk lowered from HIGH to LOW due to explicit zero-AI-model training warranties and sovereign encryption guarantees.',
  keyDifferences: [
    {
      section: 'Section 4: Uptime SLA & Service Credits',
      doc1Text: 'Guarantees 99.9% uptime with 10% maximum monthly fee credit.',
      doc2Text: 'Guarantees 99.95% uptime with 15% maximum monthly fee credit.',
      impact: 'MODERATE',
      explanation: 'Uptime threshold tightened by 0.05% with increased financial penalty on downtime.',
    },
    {
      section: 'Section 8: Cumulative Limitation of Liability',
      doc1Text: 'Cumulative aggregate liability capped at $2,000,000 USD.',
      doc2Text: 'Cumulative aggregate liability capped at $5,000,000 USD or 12 months fees.',
      impact: 'CRITICAL',
      explanation: 'Major expansion in liability coverage for enterprise data loss or breach events.',
    },
    {
      section: 'Section 12: AI Data Sovereignty & Foundation Training',
      doc1Text: 'Provider may use anonymized metadata to improve platform heuristics.',
      doc2Text: 'Zero customer data or metadata shall be utilized for AI training without explicit consent.',
      impact: 'CRITICAL',
      explanation: 'Strict zero-training warranty protects proprietary enterprise intelligence.',
    },
  ],
  recommendations: [
    'Approve v2.0 revision as liability cap expansion aligns with enterprise risk policy.',
    'Confirm that 99.95% uptime SLA is mirrored in downstream cloud provider contracts.',
    'Log new agreement hash to immutable compliance audit trail.',
  ],
};

// Storage helper functions
export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return sampleDocuments;
  try {
    const data = localStorage.getItem('synapse_documents_db_v2');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem('synapse_documents_db_v2', JSON.stringify(sampleDocuments));
  } catch (err) {}
  return sampleDocuments;
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_documents_db_v2', JSON.stringify(docs));
  } catch (err) {}
}

export function addNewStoredDocument(doc: DocumentItem): void {
  const existing = getStoredDocuments();
  const updated = [doc, ...existing.filter((d) => d.id !== doc.id)];
  saveStoredDocuments(updated);
}
