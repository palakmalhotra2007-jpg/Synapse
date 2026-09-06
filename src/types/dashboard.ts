export type TeamId =
  | 'engineering'
  | 'fraud_security'
  | 'finance_risk'
  | 'legal_compliance'
  | 'executive_ops'
  | 'product_growth';

export interface Team {
  id: TeamId;
  name: string;
  code: string;
  badgeVariant: 'cyan' | 'purple' | 'rose' | 'emerald' | 'amber' | 'blue';
  description: string;
  lead: string;
  memberCount: number;
  documentCount: number;
  permissions: string[];
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  changePercent: number;
  isPositive: boolean;
  timeframe: string;
  icon: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'chat' | 'fraud' | 'meeting' | 'document' | 'task';
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeVariant: 'cyan' | 'purple' | 'rose' | 'emerald' | 'amber';
  linkUrl: string;
  teamId?: TeamId;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  employeeId: string;
  teamId: TeamId;
  teamName: string;
  department: string;
  role: string;
  organization: string;
  photoURL?: string;
  tokenBalance: number;
  faceBiometricEnrolled?: boolean;
  faceVectorId?: string;
  faceConfidence?: number;
  lastBiometricScan?: string;
  permissions?: string[];
}

