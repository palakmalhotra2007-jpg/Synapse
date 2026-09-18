export type TeamId =
  | 'engineering'
  | 'fraud_security'
  | 'finance_risk'
  | 'legal_compliance'
  | 'executive_ops'
  | 'product_growth';

export type UserRbacRole =
  | 'Employee'
  | 'Manager'
  | 'Security Analyst'
  | 'Finance'
  | 'Legal'
  | 'Executive'
  | 'Administrator';

export type VaultId =
  | 'executive'
  | 'finance'
  | 'legal'
  | 'engineering'
  | 'cyber'
  | 'my_team';

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

export interface PasskeyCredential {
  id: string;
  name: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: string;
  lastUsedAt?: string;
  deviceType: 'platform' | 'cross-platform';
  authenticatorAttachment?: 'platform' | 'cross-platform';
  browser: string;
  os: string;
}

export interface ActiveSession {
  id: string;
  token: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  loginTime: string;
  lastActiveTime: string;
  authMethod: 'PASSWORD' | 'WEBAUTHN_PASSKEY' | 'PLATFORM_BIOMETRIC' | 'MFA' | 'PERSONA';
  isCurrent?: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  employeeId: string;
  employeeName: string;
  eventType: 'UNAUTHORIZED_VAULT_ACCESS' | 'ANOMALY_FLAGGED' | 'SESSION_REVOCATION' | 'AUTH_FAILURE' | 'CLEARANCE_OVERRIDE' | 'PASSKEY_REGISTERED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export type AuditEventType =
  | 'login'
  | 'logout'
  | 'auth_failure'
  | 'passkey_registration'
  | 'document_access'
  | 'vault_access'
  | 'vault_denial'
  | 'transaction_investigation'
  | 'permission_change'
  | 'session_revocation';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actorEmployeeId: string;
  actorName: string;
  actorRole: string;
  targetResource: string;
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED' | 'FLAGGED';
  ipAddress: string;
  details: string;
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
  type: 'chat' | 'fraud' | 'meeting' | 'document' | 'task' | 'security';
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
  rbacRole: UserRbacRole;
  organization: string;
  phone?: string;
  office?: string;
  manager?: string;
  accessLevel: 'Tier 1 Top Secret' | 'Tier 2 Confidential' | 'Tier 3 Restricted' | 'Tier 4 Standard';
  securityClearance: 'Level 5 Executive' | 'Level 4 Cyber Forensics' | 'Level 3 Financial Risk' | 'Level 2 Legal Compliance' | 'Level 1 General';
  permissions: string[];
  vaultAccess: VaultId[];
  mfaEnabled: boolean;
  passkeys: PasskeyCredential[];
  activeSessions: ActiveSession[];
  photoURL?: string;
  tokenBalance: number;
  joinedDate?: string;
  lastLogin?: string;
}
