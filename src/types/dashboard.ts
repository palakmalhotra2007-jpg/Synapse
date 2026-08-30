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
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  organization: string;
  tokenBalance: number;
}
