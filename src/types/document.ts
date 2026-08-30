export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'md';
  uploadedAt: string;
  pageCount?: number;
  wordCount?: number;
  content: string;
  summary?: string;
  keyClauses?: {
    type: 'obligation' | 'liability' | 'financial' | 'compliance' | 'risk';
    title: string;
    snippet: string;
    pageOrSection: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export interface DocumentComparisonResult {
  doc1Name: string;
  doc2Name: string;
  similarityScore: number; // 0 - 100
  keyDifferences: {
    section: string;
    doc1Text: string;
    doc2Text: string;
    impact: 'CRITICAL' | 'MODERATE' | 'NEUTRAL';
    explanation: string;
  }[];
  financialVariance: string;
  riskVariance: string;
  recommendations: string[];
}
