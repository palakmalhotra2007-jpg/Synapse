import { DocumentItem, DocumentComparisonResult } from '@/types/document';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'DOC-2026-MSA-01',
    name: 'Master Enterprise Cloud Services Agreement 2026.pdf',
    size: '3.4 MB',
    type: 'pdf',
    uploadedAt: '2026-08-28T14:30:00Z',
    teamId: 'legal_compliance',
    teamName: 'Legal, Contracts & Compliance',
    uploadedBy: 'David Miller',
    uploadedByEmployeeId: 'EMP-LGL-005',
    accessLevel: 'CONFIDENTIAL',
    pageCount: 24,
    wordCount: 8450,
    sensitivityScore: 82,
    tags: ['Legal MSA', 'SLA 99.95%', 'Liability Cap', 'Compliance'],
    summary: 'Comprehensive Master Service Agreement governing enterprise AI SaaS deployment, SLA uptime commitments (99.95%), liability caps ($5M), data sovereignty, and Firestore security encryption standards.',
    content: `MASTER ENTERPRISE SERVICES AGREEMENT (2026 REVISION)

SECTION 1: SCOPE OF SERVICES
Provider agrees to grant Customer a non-exclusive, non-transferable enterprise license to access Synapse AI Productivity & Intelligence Platform, including AI Workspace, Fraud Analysis Engine, Meeting Intelligence, and RAG Document Intelligence.

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
  },
  {
    id: 'DOC-2026-FIN-02',
    name: 'Q2 2026 Enterprise Financial Performance & Audit Report.pdf',
    size: '4.8 MB',
    type: 'pdf',
    uploadedAt: '2026-08-25T11:15:00Z',
    teamId: 'finance_risk',
    teamName: 'Finance & Risk Analytics',
    uploadedBy: 'Sophia Chen',
    uploadedByEmployeeId: 'EMP-FIN-004',
    accessLevel: 'TEAM_ONLY',
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
  },
  {
    id: 'DOC-2026-ENG-03',
    name: 'Synapse Neural Engine v4.2 Architecture Specification.docx',
    size: '5.2 MB',
    type: 'docx',
    uploadedAt: '2026-09-01T09:40:00Z',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    uploadedBy: 'Marcus Vance',
    uploadedByEmployeeId: 'EMP-ENG-003',
    accessLevel: 'PUBLIC',
    pageCount: 45,
    wordCount: 15800,
    sensitivityScore: 60,
    tags: ['Architecture', 'Vector Pipeline', 'Transformer RAG', 'Low Latency'],
    summary: 'Technical whitepaper on distributed vector index partitioning, Flash Attention v3 integration, and sub-15ms multi-hop reasoning algorithms.',
    content: `SYNAPSE NEURAL ENGINE V4.2 ARCHITECTURE SPECIFICATION
Engineering & Neural R&D Division

1. DISTRIBUTED VECTOR PARTITIONING
Synapse v4.2 partitions high-dimensional embedding spaces across sharded HNSW indices with zero-lock concurrent updates.

2. MULTI-MODAL REASONING CORES
Context window expanded to 1M tokens with adaptive sparsity attention, enabling document and code diff cross-referencing in real time.`,
    keyClauses: [
      {
        type: 'obligation',
        title: 'Target Inference Latency SLA',
        snippet: 'P99 inference latency bound strictly below 45ms across enterprise tier clusters.',
        pageOrSection: 'Section 2.1',
        riskLevel: 'LOW',
      },
      {
        type: 'compliance',
        title: 'Zero Data Retention in Core Clusters',
        snippet: 'Volatile RAM scratchpads purged immediately upon query stream termination.',
        pageOrSection: 'Section 5.3',
        riskLevel: 'LOW',
      },
    ],
  },
  {
    id: 'DOC-2026-SEC-04',
    name: 'Cyber Threat Anomaly & AML Defense Playbook.pdf',
    size: '2.9 MB',
    type: 'pdf',
    uploadedAt: '2026-09-03T16:20:00Z',
    teamId: 'fraud_security',
    teamName: 'Cyber & Financial Fraud Ops',
    uploadedBy: 'Elena Rostova',
    uploadedByEmployeeId: 'EMP-SEC-002',
    accessLevel: 'RESTRICTED',
    pageCount: 19,
    wordCount: 6300,
    sensitivityScore: 94,
    tags: ['AML Playbook', 'Fraud Vectoring', 'Darknet Watch', 'Zero Day'],
    summary: 'Standard operating procedure for isolating anomalous wire transfers, crypto mixers, and account takeovers exceeding $100k velocity limits.',
    content: `CYBER THREAT ANOMALY & AML DEFENSE PLAYBOOK
Cyber & Financial Fraud Ops

1. VELOCITY SPIKE TRIGGER CONDITIONS
Transactions exceeding 300% historical 7-day average require dual-analyst cryptographic sign-off before settlement.

2. GEOLOCATION HOP PROTOCOLS
Immediate hold on accounts demonstrating IP geo-hops under 15 minutes between non-contiguous jurisdictions.`,
    keyClauses: [
      {
        type: 'risk',
        title: 'Instant Automated Asset Freezing Trigger',
        snippet: 'High-confidence AML vectors automatically trigger 24-hour liquidity holds.',
        pageOrSection: 'Section 1.4',
        riskLevel: 'HIGH',
      },
      {
        type: 'compliance',
        title: 'FinCEN SAR Filing Automation',
        snippet: 'Suspicious Activity Reports pre-populated within 120 seconds of risk score > 90.',
        pageOrSection: 'Section 4.2',
        riskLevel: 'MEDIUM',
      },
    ],
  },
  {
    id: 'DOC-2026-EXEC-05',
    name: 'Q3-Q4 2026 Strategic Board Presentation & M&A Overview.pdf',
    size: '6.1 MB',
    type: 'pdf',
    uploadedAt: '2026-09-04T18:00:00Z',
    teamId: 'executive_ops',
    teamName: 'Executive Leadership & Board',
    uploadedBy: 'Alex Sterling',
    uploadedByEmployeeId: 'EMP-EXEC-001',
    accessLevel: 'RESTRICTED',
    pageCount: 30,
    wordCount: 9200,
    sensitivityScore: 98,
    tags: ['Board Strategy', 'M&A Pipeline', 'Capital Plan', 'Executive'],
    summary: 'Confidential executive briefing on Series C expansion, global infrastructure rollout across EMEA/APAC, and target strategic acquisitions.',
    content: `CONFIDENTIAL - BOARD OF DIRECTORS BRIEFING
Aegis Global Enterprises & Synapse Platform

STRATEGIC INITIATIVES
1. EMEA Data Center Expansion (Frankfurt & Zurich sovereign AI clusters)
2. Acquisition evaluation of Quantum Fraud Forensics IP
3. Gross revenue targets of $120M ARR for FY2026.`,
    keyClauses: [
      {
        type: 'financial',
        title: 'Capital Expenditure Authorization',
        snippet: '$18M capital reserve earmarked for sovereign GPU compute procurement.',
        pageOrSection: 'Slide 14',
        riskLevel: 'MEDIUM',
      },
      {
        type: 'compliance',
        title: 'Strict Board Non-Disclosure Mandate',
        snippet: 'Materials subject to Reg FD and international securities confidentiality regulations.',
        pageOrSection: 'Slide 2',
        riskLevel: 'HIGH',
      },
    ],
  },
  {
    id: 'DOC-2026-INV-06',
    name: 'Apex Cloud Vendor Invoice & Wire Schedule INV-9042.pdf',
    size: '1.8 MB',
    type: 'pdf',
    uploadedAt: '2026-09-02T10:15:00Z',
    teamId: 'finance_risk',
    teamName: 'Finance & Risk Analytics',
    uploadedBy: 'Sophia Chen',
    uploadedByEmployeeId: 'EMP-FIN-004',
    accessLevel: 'CONFIDENTIAL',
    pageCount: 4,
    wordCount: 1450,
    sensitivityScore: 89,
    tags: ['Vendor Invoice', 'Wire Authorization', 'Apex Cloud', 'IBAN Verification'],
    summary: 'Approved vendor invoice for Apex Cloud Infrastructure services detailing authorized payment of $250,000 USD to domestic bank routing.',
    content: `APEX CLOUD SERVICES LLC - OFFICIAL INVOICE
Invoice Number: INV-9042
Invoice Date: August 28, 2026
Payment Terms: Net 30
Authorized Vendor: Apex Cloud Infrastructure LLC (Delaware Registration #88194)
Beneficiary Name: Apex Cloud Infrastructure LLC
Authorized Bank: First National Commercial Bank, New York, US
Authorized Routing: 021000021
Authorized Account / IBAN: US890210000219988112
Authorized Payment Amount: $250,000.00 USD
Tax ID / EIN: 12-8891042

DISCREPANCY WARNING:
Any payment request exceeding $250,000.00 USD or directing funds to offshore jurisdictions (e.g., Cayman Islands, Switzerland, Singapore) violates Master Service Agreement Section 8 and requires dual-officer CFO authorization.`,
    keyClauses: [
      {
        type: 'financial',
        title: 'Approved Payment Ceiling ($250,000 USD)',
        snippet: 'Authorized payment amount is $250,000.00 USD for August 2026 services.',
        pageOrSection: 'Page 1 (Summary Table)',
        riskLevel: 'LOW',
      },
      {
        type: 'compliance',
        title: 'Offshore Routing Prohibition Clause',
        snippet: 'Routing funds to offshore accounts violates MSA terms without dual CFO authorization.',
        pageOrSection: 'Page 2 (Wire Instructions)',
        riskLevel: 'HIGH',
      },
    ],
  },
];

export const sampleDocComparison: DocumentComparisonResult = {
  doc1Name: 'Master Enterprise Agreement 2025 (v1.2).pdf',
  doc2Name: 'Master Enterprise Agreement 2026 (v2.0).pdf',
  similarityScore: 84,
  keyDifferences: [
    {
      section: 'Section 4: SLA Uptime Target',
      doc1Text: 'Provider guarantees 99.90% monthly uptime with 5% service credit.',
      doc2Text: 'Provider guarantees 99.95% monthly uptime with 15% service credit.',
      impact: 'CRITICAL',
      explanation:
        'Uptime threshold increased by 0.05% and credit penalty tripled to 15%, significantly benefiting the enterprise buyer.',
    },
    {
      section: 'Section 8: Liability Cap',
      doc1Text: 'Liability limited to $2,000,000 USD or 6 months of paid fees.',
      doc2Text: 'Liability limited to $5,000,000 USD or 12 months of paid fees.',
      impact: 'CRITICAL',
      explanation: 'Liability ceiling increased by $3,000,000 USD (250% increase).',
    },
    {
      section: 'Section 12: AI Model Data Usage',
      doc1Text: 'Provider reserves right to use anonymized metadata for model optimization.',
      doc2Text: 'Explicit zero-model-training policy unless customer opts in explicitly.',
      impact: 'MODERATE',
      explanation: 'Strengthens enterprise privacy guarantee for compliance-sensitive clients.',
    },
  ],
  financialVariance:
    'Exposure cap expanded from $2.0M to $5.0M; SLA failure penalty increased to 15%.',
  riskVariance:
    'Overall contractual risk lowered for Customer due to stricter uptime SLA and zero AI training clauses.',
  recommendations: [
    'Approve v2.0 agreement revisions for all Tier-1 enterprise customers.',
    'Ensure DevOps team monitors 99.95% uptime threshold to avoid 15% credit triggers.',
    'Update legal playbook to standardise on $5M liability cap.',
  ],
};

// LocalStorage helpers for Document Persistence
export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return sampleDocuments;
  try {
    const data = localStorage.getItem('synapse_documents_db');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem('synapse_documents_db', JSON.stringify(sampleDocuments));
  } catch (err) {
    console.warn('LocalStorage error reading documents:', err);
  }
  return sampleDocuments;
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_documents_db', JSON.stringify(docs));
  } catch (err) {
    console.warn('LocalStorage error saving documents:', err);
  }
}

export function addNewStoredDocument(doc: DocumentItem): DocumentItem[] {
  const current = getStoredDocuments();
  const updated = [doc, ...current.filter((d) => d.id !== doc.id)];
  saveStoredDocuments(updated);
  return updated;
}

