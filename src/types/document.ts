import { TeamId, VaultId, UserRbacRole } from './dashboard';
export type { VaultId };

export type DocumentAccessLevel = 'PUBLIC' | 'TEAM_ONLY' | 'CONFIDENTIAL' | 'RESTRICTED';

export type DocumentClassification = 'TOP SECRET' | 'CONFIDENTIAL' | 'INTERNAL RESTRICTED' | 'UNCLASSIFIED';

export type DocumentSecurityLevel =
  | 'Level 5 Executive'
  | 'Level 4 Cyber'
  | 'Level 3 Finance'
  | 'Level 2 Legal'
  | 'Level 1 Standard';

export type DocumentProcessingStatus =
  | 'READY'
  | 'INDEXING'
  | 'PROCESSING'
  | 'EXTRACTING'
  | 'VALIDATING'
  | 'FAILED';

export interface DocumentVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  updatedByEmployeeId: string;
  changeNote: string;
  size: string;
}

export interface DocumentAccessHistoryEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  action: 'VIEW' | 'DOWNLOAD' | 'COMPARE' | 'EXTRACT_CLAUSES' | 'PERMISSIONS_UPDATE';
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED';
}

export interface DocumentKeyClause {
  type: 'obligation' | 'liability' | 'financial' | 'compliance' | 'risk';
  title: string;
  snippet: string;
  pageOrSection: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'csv' | 'txt' | 'md' | 'json' | 'xlsx' | 'img';
  uploadedAt: string;
  updatedAt?: string;
  teamId?: TeamId | 'all';
  teamName?: string;
  vaultId: VaultId;
  uploadedBy?: string;
  uploadedByEmployeeId?: string;
  accessLevel?: DocumentAccessLevel;
  classification: DocumentClassification;
  securityLevel: DocumentSecurityLevel;
  status: DocumentProcessingStatus;
  pageCount?: number;
  wordCount?: number;
  content: string;
  summary?: string;
  tags?: string[];
  sensitivityScore?: number; // 0 - 100
  keyClauses?: DocumentKeyClause[];
  versions?: DocumentVersion[];
  accessHistory?: DocumentAccessHistoryEntry[];
  permissions?: {
    allowedRoles: UserRbacRole[];
    allowedVaults: VaultId[];
    isRestricted: boolean;
  };
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
