import { TeamId } from './dashboard';

export type DocumentAccessLevel = 'PUBLIC' | 'TEAM_ONLY' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'md' | 'json' | 'xlsx' | 'img';
  uploadedAt: string;
  teamId?: TeamId | 'all';
  teamName?: string;
  uploadedBy?: string;
  uploadedByEmployeeId?: string;
  accessLevel?: DocumentAccessLevel;
  pageCount?: number;
  wordCount?: number;
  content: string;
  summary?: string;
  tags?: string[];
  sensitivityScore?: number; // 0 - 100
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
