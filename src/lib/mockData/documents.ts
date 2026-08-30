import { DocumentItem, DocumentComparisonResult } from '@/types/document';

export const sampleDocuments: DocumentItem[] = [
  {
    id: 'DOC-2026-MSA-01',
    name: 'Master Enterprise Cloud Services Agreement 2026.pdf',
    size: '3.4 MB',
    type: 'pdf',
    uploadedAt: '2026-08-28T14:30:00Z',
    pageCount: 24,
    wordCount: 8450,
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
        riskLevel: 'LOW'
      },
      {
        type: 'liability',
        title: 'Mutual Cumulative Liability Cap',
        snippet: 'Cumulative liability shall not exceed $5,000,000 USD or 12 months of paid fees.',
        pageOrSection: 'Section 8.2 (page 14)',
        riskLevel: 'MEDIUM'
      },
      {
        type: 'compliance',
        title: 'Zero AI Model Training Guarantee & AES-256',
        snippet: 'Customer data is encrypted using AES-256 and never used for model training without explicit consent.',
        pageOrSection: 'Section 12.4 (page 19)',
        riskLevel: 'LOW'
      }
    ]
  },
  {
    id: 'DOC-2026-FIN-02',
    name: 'Q2 2026 Enterprise Financial Performance & Audit Report.pdf',
    size: '4.8 MB',
    type: 'pdf',
    uploadedAt: '2026-08-25T11:15:00Z',
    pageCount: 38,
    wordCount: 12100,
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
        riskLevel: 'LOW'
      },
      {
        type: 'risk',
        title: 'Infrastructure Cost vs Revenue Scaling',
        snippet: 'Cloud Infrastructure cost grew to $1.42M driven by high-throughput RAG document parsing.',
        pageOrSection: 'Section 3.2 (page 11)',
        riskLevel: 'MEDIUM'
      }
    ]
  }
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
      explanation: 'Uptime threshold increased by 0.05% and credit penalty tripled to 15%, significantly benefiting the enterprise buyer.'
    },
    {
      section: 'Section 8: Liability Cap',
      doc1Text: 'Liability limited to $2,000,000 USD or 6 months of paid fees.',
      doc2Text: 'Liability limited to $5,000,000 USD or 12 months of paid fees.',
      impact: 'CRITICAL',
      explanation: 'Liability ceiling increased by $3,000,000 USD (250% increase).'
    },
    {
      section: 'Section 12: AI Model Data Usage',
      doc1Text: 'Provider reserves right to use anonymized metadata for model optimization.',
      doc2Text: 'Explicit zero-model-training policy unless customer opts in explicitly.',
      impact: 'MODERATE',
      explanation: 'Strengthens enterprise privacy guarantee for compliance-sensitive clients.'
    }
  ],
  financialVariance: 'Exposure cap expanded from $2.0M to $5.0M; SLA failure penalty increased to 15%.',
  riskVariance: 'Overall contractual risk lowered for Customer due to stricter uptime SLA and zero AI training clauses.',
  recommendations: [
    'Approve v2.0 agreement revisions for all Tier-1 enterprise customers.',
    'Ensure DevOps team monitors 99.95% uptime threshold to avoid 15% credit triggers.',
    'Update legal playbook to standardise on $5M liability cap.'
  ]
};
