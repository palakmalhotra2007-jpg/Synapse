import { DashboardMetric, ActivityFeedItem } from '@/types/dashboard';

export const sampleDashboardMetrics: DashboardMetric[] = [
  {
    id: 'm1',
    title: 'AI Queries Processed',
    value: '184,920',
    changePercent: 24.5,
    isPositive: true,
    timeframe: 'vs last week',
    icon: 'Bot'
  },
  {
    id: 'm2',
    title: 'Active Fraud Alerts',
    value: '18 Critical',
    changePercent: -14.2,
    isPositive: true,
    timeframe: '142 total flagged',
    icon: 'ShieldAlert'
  },
  {
    id: 'm3',
    title: 'Meetings Transcribed',
    value: '342 hrs',
    changePercent: 18.9,
    isPositive: true,
    timeframe: '98.4% MoM accuracy',
    icon: 'Video'
  },
  {
    id: 'm4',
    title: 'Documents Analyzed',
    value: '1,284 docs',
    changePercent: 31.0,
    isPositive: true,
    timeframe: 'Avg RAG speed 1.2s',
    icon: 'FileText'
  }
];

export const sampleActivityFeed: ActivityFeedItem[] = [
  {
    id: 'act-1',
    type: 'fraud',
    title: 'Critical Fraud Anomaly Detected',
    description: 'Wire transaction TXN-902148 ($1,450,000 to Cayman Islands) flagged for high velocity & Tor exit IP.',
    timestamp: '12 mins ago',
    badgeText: 'CRITICAL RISK (94)',
    badgeVariant: 'rose',
    linkUrl: '/fraud'
  },
  {
    id: 'act-2',
    type: 'meeting',
    title: 'Minutes of Meeting (MoM) Generated',
    description: 'Executive AI Strategy & Q4 Budget Sync MoM ready with 3 high-priority action items assigned.',
    timestamp: '34 mins ago',
    badgeText: 'MoM READY',
    badgeVariant: 'cyan',
    linkUrl: '/meetings'
  },
  {
    id: 'act-3',
    type: 'document',
    title: 'Master Service Agreement Analyzed',
    description: 'Extracted 3 key clauses and verified 99.95% SLA guarantee from 2026 MSA PDF.',
    timestamp: '1 hour ago',
    badgeText: 'DOC ANALYZED',
    badgeVariant: 'purple',
    linkUrl: '/documents'
  },
  {
    id: 'act-4',
    type: 'chat',
    title: 'Financial Q2 RAG Query Session',
    description: 'Answered 14 questions regarding ARR growth and gross margins with cited document snippets.',
    timestamp: '2 hours ago',
    badgeText: 'AI CHAT',
    badgeVariant: 'emerald',
    linkUrl: '/workspace'
  },
  {
    id: 'act-5',
    type: 'task',
    title: 'Action Item Completed',
    description: 'Provisioned 35% additional Cloud Run instance capacity for peak RAG batching.',
    timestamp: '3 hours ago',
    badgeText: 'ACTION ITEM',
    badgeVariant: 'amber',
    linkUrl: '/meetings'
  }
];
