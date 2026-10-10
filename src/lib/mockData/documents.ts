import { DocumentItem, DocumentComparisonResult } from '@/types/document';
import { getRelativeTimestamp } from '@/lib/utils';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'DOC-ENG-01',
    name: 'Master Enterprise Cloud Services & Neural Architecture Agreement 2026.pdf',
    size: '3.4 MB',
    type: 'pdf',
    uploadedAt: getRelativeTimestamp(-5),
    updatedAt: getRelativeTimestamp(-1),
    vaultId: 'engineering',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    uploadedBy: 'Charvi Sharma',
    uploadedByEmployeeId: 'EMP-ENG-001',
    accessLevel: 'CONFIDENTIAL',
    classification: 'CONFIDENTIAL',
    securityLevel: 'Level 5 Executive',
    status: 'READY',
    pageCount: 24,
    wordCount: 8450,
    sensitivityScore: 82,
    tags: ['Legal MSA', 'SLA 99.95%', 'Liability Cap', 'Neural Architecture'],
    summary: 'Comprehensive Master Service Agreement governing enterprise AI SaaS deployment, SLA uptime commitments (99.95%), liability caps ($5M), data sovereignty, and security encryption standards.',
    content: `MASTER ENTERPRISE SERVICES AGREEMENT (2026 REVISION)

SECTION 1: SCOPE OF SERVICES
Provider agrees to grant Customer a non-exclusive, non-transferable enterprise license to access Synapse AI Intelligence Platform, including AI Workspace, Vector Storage Engine, Meeting Intelligence, and Document Intelligence Vaults.

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
        updatedAt: getRelativeTimestamp(-1),
        updatedBy: 'Charvi Sharma',
        updatedByEmployeeId: 'EMP-ENG-001',
        changeNote: 'Updated liability cap from $2M to $5M and added data sovereignty clause.',
        size: '3.4 MB',
      },
      {
        version: '1.0.0',
        updatedAt: getRelativeTimestamp(-5),
        updatedBy: 'Charvi Sharma',
        updatedByEmployeeId: 'EMP-ENG-001',
        changeNote: 'Initial draft for 2026 enterprise deployment.',
        size: '3.1 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-msa-01',
        employeeId: 'EMP-ENG-001',
        employeeName: 'Charvi Sharma',
        action: 'VIEW',
        timestamp: getRelativeTimestamp(0, -1),
        ipAddress: '192.168.1.100',
        status: 'SUCCESS',
      },
      {
        id: 'acc-msa-02',
        employeeId: 'EMP-ENG-002',
        employeeName: 'Tanisha Gupta',
        action: 'COMPARE',
        timestamp: getRelativeTimestamp(0, -3),
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-ENG-02',
    name: 'Q2 2026 Infrastructure Scaling & AI Neural Pipeline Report.pdf',
    size: '4.8 MB',
    type: 'pdf',
    uploadedAt: getRelativeTimestamp(-10),
    updatedAt: getRelativeTimestamp(-3),
    vaultId: 'engineering',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    uploadedBy: 'Tanisha Gupta',
    uploadedByEmployeeId: 'EMP-ENG-002',
    accessLevel: 'TEAM_ONLY',
    classification: 'CONFIDENTIAL',
    securityLevel: 'Level 4 Cyber',
    status: 'READY',
    pageCount: 38,
    wordCount: 12100,
    sensitivityScore: 75,
    tags: ['Backend Scaling', 'Vector Search', 'RAG Pipeline', 'GPU Cluster'],
    summary: 'Engineering quarterly review detailing vector search index expansion, sub-300ms multi-document retrieval latency, and cloud cluster capacity scaling.',
    content: `Q2 ENGINEERING INFRASTRUCTURE & NEURAL PIPELINE REPORT

EXECUTIVE SUMMARY
Synapse Enterprise achieved 99.98% pipeline uptime in Q2 with vector search capacity growing to 88% peak load.

INFRASTRUCTURE HIGHLIGHTS
- Multi-Document Vector Queries: 14.2M processed
- Mean RAG Retrieval Latency: 240ms
- Distributed GPU Inference Nodes: 16 H100 Cluster Worker Nodes`,
    keyClauses: [
      {
        type: 'financial',
        title: 'Cluster Compute Expansion & Vector Scaling',
        snippet: 'Vector queries reached 14.2M with 84% search accuracy.',
        pageOrSection: 'Executive Highlights (page 3)',
        riskLevel: 'LOW',
      },
    ],
    versions: [
      {
        version: '1.0.0',
        updatedAt: getRelativeTimestamp(-10),
        updatedBy: 'Tanisha Gupta',
        updatedByEmployeeId: 'EMP-ENG-002',
        changeNote: 'Quarterly infrastructure review filed.',
        size: '4.8 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-fin-01',
        employeeId: 'EMP-ENG-002',
        employeeName: 'Tanisha Gupta',
        action: 'VIEW',
        timestamp: getRelativeTimestamp(0, -2),
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-ENG-03',
    name: 'Neural Model Architecture & Vector Indexing RFC.pdf',
    size: '5.1 MB',
    type: 'pdf',
    uploadedAt: getRelativeTimestamp(-6),
    updatedAt: getRelativeTimestamp(-2),
    vaultId: 'engineering',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    uploadedBy: 'Anshika Verma',
    uploadedByEmployeeId: 'EMP-ENG-003',
    accessLevel: 'TEAM_ONLY',
    classification: 'INTERNAL RESTRICTED',
    securityLevel: 'Level 4 Cyber',
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
        updatedAt: getRelativeTimestamp(-6),
        updatedBy: 'Anshika Verma',
        updatedByEmployeeId: 'EMP-ENG-003',
        changeNote: 'Initial RFC proposal.',
        size: '5.1 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-eng-01',
        employeeId: 'EMP-ENG-003',
        employeeName: 'Anshika Verma',
        action: 'VIEW',
        timestamp: getRelativeTimestamp(0, -4),
        ipAddress: '192.168.1.112',
        status: 'SUCCESS',
      },
    ],
  },
  {
    id: 'DOC-ENG-04',
    name: 'Frontend Design System & Component Library Specs.pdf',
    size: '3.1 MB',
    type: 'pdf',
    uploadedAt: getRelativeTimestamp(-4),
    updatedAt: getRelativeTimestamp(-1),
    vaultId: 'engineering',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    uploadedBy: 'Bhavya Malhotra',
    uploadedByEmployeeId: 'EMP-ENG-004',
    accessLevel: 'TEAM_ONLY',
    classification: 'CONFIDENTIAL',
    securityLevel: 'Level 3 Finance',
    status: 'READY',
    pageCount: 22,
    wordCount: 5400,
    sensitivityScore: 40,
    tags: ['UX Specifications', 'Design System', 'Tailwind Utilities', 'Micro-Animations'],
    summary: 'Design system specification detailing Synapse Enterprise UI design tokens, dark/light mode standards, accessible color contrast rules, and modal dialog behavior.',
    content: `SYNAPSE ENTERPRISE FRONTEND DESIGN SYSTEM

1. VISUAL ESTHETICS & ACCESSIBILITY
All interface components enforce slate-50 light enterprise themes, high contrast text hierarchy, and accessible ARIA attributes across desktop and mobile screens.`,
    keyClauses: [],
    versions: [
      {
        version: '1.0.0',
        updatedAt: getRelativeTimestamp(-4),
        updatedBy: 'Bhavya Malhotra',
        updatedByEmployeeId: 'EMP-ENG-004',
        changeNote: 'Design tokens published.',
        size: '3.1 MB',
      },
    ],
    accessHistory: [
      {
        id: 'acc-fe-01',
        employeeId: 'EMP-ENG-004',
        employeeName: 'Bhavya Malhotra',
        action: 'VIEW',
        timestamp: getRelativeTimestamp(0, -1),
        ipAddress: '192.168.1.108',
        status: 'SUCCESS',
      },
    ],
  },
];

export const sampleDocComparison: DocumentComparisonResult = {
  doc1Name: sampleDocuments[0].name,
  doc2Name: sampleDocuments[1].name,
  similarityScore: 84,
  keyDifferences: [
    {
      section: 'SLA Credit Penalty',
      doc1Text: '15% SLA service credit penalty for downtime exceeding 0.05%.',
      doc2Text: '10% SLA service credit penalty.',
      impact: 'MODERATE',
      explanation: 'Document 1 provides higher downtime reimbursement for enterprise customers.',
    },
    {
      section: 'Limitation of Liability',
      doc1Text: 'Mutual liability cap at $5,000,000 USD.',
      doc2Text: 'Mutual liability cap at $2,000,000 USD.',
      impact: 'CRITICAL',
      explanation: 'Document 1 increases cumulative liability threshold by $3M USD.',
    },
  ],
  financialVariance: '+$3,000,000 USD liability limit increase in Document 1.',
  riskVariance: 'Low risk variance. Both documents comply with SOC2 Type II.',
  recommendations: [
    'Align liability cap to $5M across all engineering partner contracts.',
    'Confirm 99.95% SLA commitment with cloud infrastructure providers.',
  ],
};

const STORAGE_KEY = 'synapse_documents_db_v4';

export function getStoredDocuments(): DocumentItem[] {
  if (typeof window === 'undefined') return sampleDocuments;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleDocuments));
      return sampleDocuments;
    }
    return JSON.parse(raw);
  } catch (e) {
    return sampleDocuments;
  }
}

export function saveStoredDocuments(docs: DocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save stored documents:', e);
  }
}

export function addNewStoredDocument(doc: DocumentItem): DocumentItem[] {
  const current = getStoredDocuments();
  const updated = [doc, ...current];
  saveStoredDocuments(updated);
  return updated;
}
