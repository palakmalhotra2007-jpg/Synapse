import {
  UserProfile,
  Team,
  TeamId,
  VaultId,
  UserRbacRole,
  PasskeyCredential,
  ActiveSession,
  SecurityEvent,
  AuditLogEntry,
  AuditEventType,
} from '@/types/dashboard';

export interface StoredUser extends UserProfile {
  passwordHash: string; // Hashed/stored corporate password
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
}

export const TEAMS_LIST: Team[] = [
  {
    id: 'engineering',
    name: 'Engineering & Neural R&D',
    code: 'ENG',
    badgeVariant: 'cyan',
    description: 'LLM fine-tuning, vector pipelines, distributed inference clusters, and core platform API architecture.',
    lead: 'Marcus Vance',
    memberCount: 28,
    documentCount: 64,
    permissions: ['workspace', 'neural_models', 'documents', 'api_access', 'meetings'],
  },
  {
    id: 'fraud_security',
    name: 'Cyber & Financial Fraud Ops',
    code: 'SEC',
    badgeVariant: 'rose',
    description: 'Real-time transaction anomaly vectoring, AML screening, velocity monitoring, and forensics.',
    lead: 'Elena Rostova',
    memberCount: 16,
    documentCount: 42,
    permissions: ['fraud', 'security_audit', 'workspace', 'documents', 'meetings'],
  },
  {
    id: 'finance_risk',
    name: 'Finance & Risk Analytics',
    code: 'FIN',
    badgeVariant: 'amber',
    description: 'Enterprise treasury analytics, P&L forecasting, liquidity risk assessment, and SEC audit compliance.',
    lead: 'Sophia Chen',
    memberCount: 14,
    documentCount: 38,
    permissions: ['fraud', 'workspace', 'documents', 'meetings', 'financial_reports'],
  },
  {
    id: 'legal_compliance',
    name: 'Legal, Contracts & Compliance',
    code: 'LGL',
    badgeVariant: 'purple',
    description: 'Master Service Agreements, regulatory IP compliance, liability caps, and automated clause extraction.',
    lead: 'David Miller',
    memberCount: 12,
    documentCount: 56,
    permissions: ['documents', 'contract_diff', 'workspace', 'meetings'],
  },
  {
    id: 'executive_ops',
    name: 'Executive Leadership & Board',
    code: 'EXEC',
    badgeVariant: 'emerald',
    description: 'Cross-functional orchestration, board governance, strategic capital allocation, and enterprise SLA oversight.',
    lead: 'Alex Sterling',
    memberCount: 8,
    documentCount: 75,
    permissions: ['admin', 'workspace', 'fraud', 'meetings', 'documents', 'security_audit', 'financial_reports'],
  },
];

// Initial Verified Corporate Employees Database
export const INITIAL_USERS: StoredUser[] = [
  {
    uid: 'usr-exec-001',
    employeeId: 'EMP-EXEC-001',
    displayName: 'Alex Sterling',
    email: 'alex.sterling@synapse-ai.io',
    passwordHash: 'Synapse#2026',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: 'executive_ops',
    teamName: 'Executive Leadership & Board',
    department: 'Executive Governance & Strategy',
    role: 'Chief Technology Officer',
    rbacRole: 'Administrator',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 234-8901',
    office: 'Building A, Floor 14 (Executive Suite), San Francisco HQ',
    manager: 'Victoria Vance (Chief Executive Officer)',
    accessLevel: 'Tier 1 Top Secret',
    securityClearance: 'Level 5 Executive',
    joinedDate: '2023-01-15',
    tokenBalance: 850000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['executive', 'finance', 'legal', 'engineering', 'cyber', 'my_team'],
    permissions: ['admin', 'workspace', 'fraud', 'meetings', 'documents', 'security_audit', 'financial_reports', 'vault_admin', 'user_management'],
    lastLogin: '2026-09-16T08:30:00Z',
    passkeys: [
      {
        id: 'pk-01',
        name: 'Windows Hello (ThinkPad P1 Gen 6)',
        credentialId: 'cred-win-hello-sterling-994',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 42,
        createdAt: '2026-02-10T11:20:00Z',
        lastUsedAt: '2026-09-16T08:30:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Google Chrome 128',
        os: 'Windows (Windows Hello)',
      },
      {
        id: 'pk-02',
        name: 'YubiKey 5C NFC (Primary Security Key)',
        credentialId: 'cred-yubikey-sterling-502',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 18,
        createdAt: '2026-04-15T09:12:00Z',
        lastUsedAt: '2026-09-14T15:40:00Z',
        deviceType: 'cross-platform',
        authenticatorAttachment: 'cross-platform',
        browser: 'Microsoft Edge',
        os: 'Windows Hardware Key',
      },
    ],
    activeSessions: [
      {
        id: 'sess-01',
        token: 'syn-sess-exec-current',
        ipAddress: '192.168.1.100 (HQ Secure Gateway)',
        location: 'San Francisco, CA, USA',
        device: 'ThinkPad P1 Gen 6 Workstation',
        browser: 'Google Chrome 128',
        os: 'Windows 11 Enterprise',
        loginTime: '2026-09-16T08:30:00Z',
        lastActiveTime: '2026-09-16T17:00:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: true,
      },
      {
        id: 'sess-02',
        token: 'syn-sess-exec-mobile',
        ipAddress: '172.56.42.88 (Mobile 5G)',
        location: 'San Francisco, CA, USA',
        device: 'iPhone 15 Pro Max',
        browser: 'Mobile Safari 17.5',
        os: 'iOS 17.5 (Touch ID / Face ID)',
        loginTime: '2026-09-15T19:40:00Z',
        lastActiveTime: '2026-09-15T22:15:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: false,
      },
    ],
  },
  {
    uid: 'usr-sec-002',
    employeeId: 'EMP-SEC-002',
    displayName: 'Elena Rostova',
    email: 'elena.rostova@synapse-ai.io',
    passwordHash: 'FraudGuard#2026',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teamId: 'fraud_security',
    teamName: 'Cyber & Financial Fraud Ops',
    department: 'Fraud Risk & Security Forensics',
    role: 'Chief Financial Officer & Fraud Lead',
    rbacRole: 'Security Analyst',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 345-6789',
    office: 'Building B, Floor 8 (Cyber Ops Center), San Francisco HQ',
    manager: 'Alex Sterling (CTO)',
    accessLevel: 'Tier 1 Top Secret',
    securityClearance: 'Level 4 Cyber Forensics',
    joinedDate: '2023-04-01',
    tokenBalance: 620000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['cyber', 'finance', 'my_team'],
    permissions: ['workspace', 'fraud', 'meetings', 'documents', 'security_audit', 'fraud_investigate', 'freeze_transaction'],
    lastLogin: '2026-09-16T09:15:00Z',
    passkeys: [
      {
        id: 'pk-03',
        name: 'Touch ID (MacBook Pro 16" M3 Max)',
        credentialId: 'cred-mac-touchid-rostova-882',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 64,
        createdAt: '2026-01-20T14:10:00Z',
        lastUsedAt: '2026-09-16T09:15:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Apple Safari 17.4',
        os: 'macOS (Touch ID / Face ID)',
      },
    ],
    activeSessions: [
      {
        id: 'sess-03',
        token: 'syn-sess-sec-current',
        ipAddress: '192.168.1.104 (SOC VLAN)',
        location: 'San Francisco, CA, USA',
        device: 'MacBook Pro 16" M3 Max',
        browser: 'Apple Safari 17.4',
        os: 'macOS Sonoma',
        loginTime: '2026-09-16T09:15:00Z',
        lastActiveTime: '2026-09-16T16:45:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-eng-003',
    employeeId: 'EMP-ENG-003',
    displayName: 'Marcus Vance',
    email: 'marcus.vance@synapse-ai.io',
    passwordHash: 'NeuralAI#2026',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'AI Research & Platform Architecture',
    role: 'VP of AI Product & Architecture',
    rbacRole: 'Manager',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 456-7890',
    office: 'Building C, Floor 4 (R&D Lab), San Francisco HQ',
    manager: 'Alex Sterling (CTO)',
    accessLevel: 'Tier 2 Confidential',
    securityClearance: 'Level 1 General',
    joinedDate: '2023-06-15',
    tokenBalance: 490000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['engineering', 'my_team'],
    permissions: ['workspace', 'meetings', 'documents', 'neural_models', 'api_access'],
    lastLogin: '2026-09-16T09:40:00Z',
    passkeys: [
      {
        id: 'pk-04',
        name: 'Linux FIDO2 (Dell XPS 15 Ubuntu)',
        credentialId: 'cred-linux-fido2-vance-771',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 29,
        createdAt: '2026-03-01T10:00:00Z',
        lastUsedAt: '2026-09-16T09:40:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Mozilla Firefox 129',
        os: 'Linux (Ubuntu 24.04)',
      },
    ],
    activeSessions: [
      {
        id: 'sess-04',
        token: 'syn-sess-eng-current',
        ipAddress: '192.168.1.112 (Dev Lab)',
        location: 'San Francisco, CA, USA',
        device: 'Dell XPS 15 Workstation',
        browser: 'Mozilla Firefox 129',
        os: 'Linux x86_64',
        loginTime: '2026-09-16T09:40:00Z',
        lastActiveTime: '2026-09-16T16:50:00Z',
        authMethod: 'PASSWORD',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-fin-004',
    employeeId: 'EMP-FIN-004',
    displayName: 'Sophia Chen',
    email: 'sophia.chen@synapse-ai.io',
    passwordHash: 'Finance#2026',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    teamId: 'finance_risk',
    teamName: 'Finance & Risk Analytics',
    department: 'Treasury & Risk Modeling',
    role: 'Senior Financial Risk Analyst',
    rbacRole: 'Finance',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 567-8901',
    office: 'Building A, Floor 10 (Finance Wing), San Francisco HQ',
    manager: 'Elena Rostova (CFO)',
    accessLevel: 'Tier 2 Confidential',
    securityClearance: 'Level 3 Financial Risk',
    joinedDate: '2024-02-01',
    tokenBalance: 540000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['finance', 'my_team'],
    permissions: ['fraud', 'workspace', 'documents', 'meetings', 'financial_reports'],
    lastLogin: '2026-09-16T10:12:00Z',
    passkeys: [
      {
        id: 'pk-05',
        name: 'Windows Hello (HP Elite Dragonfly)',
        credentialId: 'cred-win-hello-chen-991',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 51,
        createdAt: '2026-02-18T16:20:00Z',
        lastUsedAt: '2026-09-16T10:12:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Microsoft Edge',
        os: 'Windows (Windows Hello)',
      },
    ],
    activeSessions: [
      {
        id: 'sess-05',
        token: 'syn-sess-fin-current',
        ipAddress: '192.168.1.120 (Finance VLAN)',
        location: 'San Francisco, CA, USA',
        device: 'HP Elite Dragonfly',
        browser: 'Microsoft Edge',
        os: 'Windows 11 Pro',
        loginTime: '2026-09-16T10:12:00Z',
        lastActiveTime: '2026-09-16T16:30:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-lgl-005',
    employeeId: 'EMP-LGL-005',
    displayName: 'David Miller',
    email: 'david.miller@synapse-ai.io',
    passwordHash: 'Legal#2026',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teamId: 'legal_compliance',
    teamName: 'Legal, Contracts & Compliance',
    department: 'Corporate Legal & Governance',
    role: 'Principal Legal Counsel',
    rbacRole: 'Legal',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 678-9012',
    office: 'Building A, Floor 12 (Legal Chamber), San Francisco HQ',
    manager: 'Alex Sterling (CTO)',
    accessLevel: 'Tier 2 Confidential',
    securityClearance: 'Level 2 Legal Compliance',
    joinedDate: '2023-09-10',
    tokenBalance: 410000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['legal', 'my_team'],
    permissions: ['documents', 'contract_diff', 'workspace', 'meetings', 'legal_audit'],
    lastLogin: '2026-09-16T11:45:00Z',
    passkeys: [
      {
        id: 'pk-06',
        name: 'Touch ID (MacBook Air 15" M2)',
        credentialId: 'cred-mac-touchid-miller-982',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 38,
        createdAt: '2026-01-25T11:15:00Z',
        lastUsedAt: '2026-09-16T11:45:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Apple Safari 17.4',
        os: 'macOS (Touch ID / Face ID)',
      },
    ],
    activeSessions: [
      {
        id: 'sess-06',
        token: 'syn-sess-lgl-current',
        ipAddress: '192.168.1.130 (Legal Subnet)',
        location: 'San Francisco, CA, USA',
        device: 'MacBook Air 15" M2',
        browser: 'Apple Safari 17.4',
        os: 'macOS Sonoma',
        loginTime: '2026-09-16T11:45:00Z',
        lastActiveTime: '2026-09-16T15:20:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-emp-006',
    employeeId: 'EMP-ENG-006',
    displayName: 'Sarah Connor',
    email: 'sarah.connor@synapse-ai.io',
    passwordHash: 'CyberDef#2026',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'AI Research & Platform Architecture',
    role: 'Lead ML Infrastructure Engineer',
    rbacRole: 'Employee',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 789-0123',
    office: 'Building C, Floor 3, San Francisco HQ',
    manager: 'Marcus Vance (VP Engineering)',
    accessLevel: 'Tier 3 Restricted',
    securityClearance: 'Level 1 General',
    joinedDate: '2024-05-15',
    tokenBalance: 320000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['engineering', 'my_team'],
    permissions: ['workspace', 'meetings', 'documents', 'neural_models'],
    lastLogin: '2026-09-16T12:10:00Z',
    passkeys: [],
    activeSessions: [
      {
        id: 'sess-07',
        token: 'syn-sess-emp-current',
        ipAddress: '192.168.1.140',
        location: 'San Francisco, CA, USA',
        device: 'MacBook Pro 14" M3',
        browser: 'Google Chrome 128',
        os: 'macOS Sonoma',
        loginTime: '2026-09-16T12:10:00Z',
        lastActiveTime: '2026-09-16T16:00:00Z',
        authMethod: 'PASSWORD',
        isCurrent: true,
      },
    ],
  },
];

// Initial Security Incident Events
export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-ev-01',
    timestamp: '2026-09-16T14:32:00Z',
    employeeId: 'EMP-SEC-002',
    employeeName: 'Elena Rostova',
    eventType: 'ANOMALY_FLAGGED',
    severity: 'CRITICAL',
    description: 'High-velocity SWIFT transaction TXN-902148 ($1,450,000) exceeded standard corridor ceiling by 420%.',
    ipAddress: '198.51.100.22',
  },
  {
    id: 'sec-ev-02',
    timestamp: '2026-09-16T11:15:00Z',
    employeeId: 'EMP-ENG-006',
    employeeName: 'Sarah Connor',
    eventType: 'UNAUTHORIZED_VAULT_ACCESS',
    severity: 'MEDIUM',
    description: 'Attempted read access to Executive Vault document (Board Strategic Capital Allocation 2026). Denied (HTTP 403).',
    ipAddress: '192.168.1.140',
  },
  {
    id: 'sec-ev-03',
    timestamp: '2026-09-16T08:30:00Z',
    employeeId: 'EMP-EXEC-001',
    employeeName: 'Alex Sterling',
    eventType: 'PASSKEY_REGISTERED',
    severity: 'LOW',
    description: 'Primary platform authenticator verified and hardware passkey bound to ThinkPad P1 Gen 6.',
    ipAddress: '192.168.1.100',
  },
];

// Initial Audit Trail Logs
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    timestamp: '2026-09-16T16:50:00Z',
    eventType: 'document_access',
    actorEmployeeId: 'EMP-EXEC-001',
    actorName: 'Alex Sterling',
    actorRole: 'Administrator',
    targetResource: 'DOC-2026-MSA-01 (Enterprise Cloud Master Service Agreement)',
    action: 'Extracted SLA and liability clauses in Document Workspace',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: 'Verified clearance Level 5 Executive. Decrypted AES-256 vault payload.',
  },
  {
    id: 'aud-02',
    timestamp: '2026-09-16T15:20:00Z',
    eventType: 'transaction_investigation',
    actorEmployeeId: 'EMP-SEC-002',
    actorName: 'Elena Rostova',
    actorRole: 'Security Analyst',
    targetResource: 'TXN-902148 ($1,450,000 to Apex Offshore)',
    action: 'Changed status to UNDER_INVESTIGATION & added forensic note',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104',
    details: 'Flagged velocity factor 5.2x and geo mismatch. Escalated to AML lead.',
  },
  {
    id: 'aud-03',
    timestamp: '2026-09-16T13:45:00Z',
    eventType: 'vault_denial',
    actorEmployeeId: 'EMP-ENG-003',
    actorName: 'Marcus Vance',
    actorRole: 'Manager',
    targetResource: 'Finance Vault (Q3 2026 Enterprise Treasury Forecast)',
    action: 'Attempted unauthorized document read',
    status: 'DENIED',
    ipAddress: '192.168.1.112',
    details: 'Access denied (HTTP 403). User holds Level 1 General; Level 3 Finance required.',
  },
  {
    id: 'aud-04',
    timestamp: '2026-09-16T11:45:00Z',
    eventType: 'login',
    actorEmployeeId: 'EMP-LGL-005',
    actorName: 'David Miller',
    actorRole: 'Legal',
    targetResource: 'Authentication Portal',
    action: 'WebAuthn Touch ID Authentication',
    status: 'SUCCESS',
    ipAddress: '192.168.1.130',
    details: 'Session token issued via FIDO2 platform authenticator assertion.',
  },
  {
    id: 'aud-05',
    timestamp: '2026-09-16T09:15:00Z',
    eventType: 'passkey_registration',
    actorEmployeeId: 'EMP-SEC-002',
    actorName: 'Elena Rostova',
    actorRole: 'Security Analyst',
    targetResource: 'Hardware Passkey Security Vault',
    action: 'Enrolled Apple Touch ID Authenticator',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104',
    details: 'Public key credential bound with ES256 algorithm.',
  },
];

// LocalStorage helpers
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const data = localStorage.getItem('synapse_users_db_v2');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u, i) => {
          const fallback = INITIAL_USERS[i % INITIAL_USERS.length];
          return {
            ...fallback,
            ...u,
            passkeys: u.passkeys || fallback.passkeys || [],
            activeSessions: u.activeSessions || fallback.activeSessions || [],
            vaultAccess: u.vaultAccess || fallback.vaultAccess || ['my_team'],
            rbacRole: u.rbacRole || fallback.rbacRole || 'Employee',
            securityClearance: u.securityClearance || fallback.securityClearance || 'Level 1 General',
            accessLevel: u.accessLevel || fallback.accessLevel || 'Tier 3 Restricted',
          };
        });
      }
    }
    localStorage.setItem('synapse_users_db_v2', JSON.stringify(INITIAL_USERS));
  } catch (err) {
    console.warn('LocalStorage error reading users:', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_users_db_v2', JSON.stringify(users));
  } catch (err) {
    console.warn('LocalStorage error saving users:', err);
  }
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const data = localStorage.getItem('synapse_audit_logs_v2');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem('synapse_audit_logs_v2', JSON.stringify(INITIAL_AUDIT_LOGS));
  } catch (err) {}
  return INITIAL_AUDIT_LOGS;
}

export function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const existing = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...existing];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('synapse_audit_logs_v2', JSON.stringify(updated));
    } catch (e) {}
  }
}

export function getStoredSecurityEvents(): SecurityEvent[] {
  if (typeof window === 'undefined') return INITIAL_SECURITY_EVENTS;
  try {
    const data = localStorage.getItem('synapse_security_events_v2');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem('synapse_security_events_v2', JSON.stringify(INITIAL_SECURITY_EVENTS));
  } catch (err) {}
  return INITIAL_SECURITY_EVENTS;
}

export function addSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
  const existing = getStoredSecurityEvents();
  const newEvent: SecurityEvent = {
    ...event,
    id: `sec-ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newEvent, ...existing];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('synapse_security_events_v2', JSON.stringify(updated));
    } catch (e) {}
  }
}

/**
 * Check if a user has RBAC clearance to access a specific vault
 */
export function canUserAccessVault(user: UserProfile | null | undefined, vaultId: VaultId): boolean {
  if (!user) return false;
  if (user.rbacRole === 'Administrator' || user.rbacRole === 'Executive') return true;
  if (vaultId === 'my_team') return true;
  if (user.vaultAccess && user.vaultAccess.includes(vaultId)) return true;

  // Role-specific defaults
  if (vaultId === 'finance' && user.rbacRole === 'Finance') return true;
  if (vaultId === 'legal' && user.rbacRole === 'Legal') return true;
  if (vaultId === 'cyber' && user.rbacRole === 'Security Analyst') return true;
  if (vaultId === 'engineering' && user.teamId === 'engineering') return true;

  return false;
}

/**
 * Revoke an active session
 */
export function revokeUserSession(uid: string, sessionId: string): boolean {
  const users = getStoredUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) return false;

  const targetSession = user.activeSessions.find((s) => s.id === sessionId);
  const updatedSessions = user.activeSessions.filter((s) => s.id !== sessionId);

  const updatedUsers = users.map((u) =>
    u.uid === uid ? { ...u, activeSessions: updatedSessions } : u
  );
  saveStoredUsers(updatedUsers);

  addAuditLogEntry({
    eventType: 'session_revocation',
    actorEmployeeId: user.employeeId,
    actorName: user.displayName,
    actorRole: user.rbacRole,
    targetResource: `Session ${sessionId} (${targetSession?.device || 'Device'})`,
    action: 'Session manually terminated by user or administrator',
    status: 'SUCCESS',
    ipAddress: targetSession?.ipAddress || '192.168.1.1',
    details: 'Session token invalidated and cleared from active devices.',
  });

  return true;
}

/**
 * Register a passkey for a user
 */
export function registerUserPasskey(uid: string, passkey: PasskeyCredential): boolean {
  const users = getStoredUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) return false;

  const updatedPasskeys = [...user.passkeys.filter((p) => p.credentialId !== passkey.credentialId), passkey];
  const updatedUsers = users.map((u) =>
    u.uid === uid ? { ...u, passkeys: updatedPasskeys } : u
  );
  saveStoredUsers(updatedUsers);

  addAuditLogEntry({
    eventType: 'passkey_registration',
    actorEmployeeId: user.employeeId,
    actorName: user.displayName,
    actorRole: user.rbacRole,
    targetResource: passkey.name,
    action: 'WebAuthn passkey credential registered on platform',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: `Credential ID: ${passkey.credentialId.substring(0, 16)}... bound to ${passkey.os}`,
  });

  return true;
}

/**
 * Remove a registered passkey
 */
export function removeUserPasskey(uid: string, passkeyId: string): boolean {
  const users = getStoredUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) return false;

  const updatedPasskeys = user.passkeys.filter((p) => p.id !== passkeyId);
  const updatedUsers = users.map((u) =>
    u.uid === uid ? { ...u, passkeys: updatedPasskeys } : u
  );
  saveStoredUsers(updatedUsers);
  return true;
}

/**
 * Validate credentials and authenticate user
 */
export function verifyCredentials(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    addAuditLogEntry({
      eventType: 'auth_failure',
      actorEmployeeId: 'UNKNOWN',
      actorName: normalizedEmail,
      actorRole: 'Anonymous',
      targetResource: 'Authentication Portal',
      action: 'Password authentication attempt with unrecognized email',
      status: 'FAILED',
      ipAddress: '192.168.1.1',
      details: 'Account lookup returned null.',
    });

    return {
      success: false,
      error: 'No account found with this corporate email address. Please check your credentials.',
    };
  }

  if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
    return {
      success: false,
      error: 'Account access has been suspended by Security Ops. Please contact SOC.',
    };
  }

  if (user.passwordHash !== password) {
    addAuditLogEntry({
      eventType: 'auth_failure',
      actorEmployeeId: user.employeeId,
      actorName: user.displayName,
      actorRole: user.rbacRole,
      targetResource: 'Authentication Portal',
      action: 'Invalid password entered',
      status: 'FAILED',
      ipAddress: '192.168.1.1',
      details: 'Password verification mismatch.',
    });

    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.',
    };
  }

  // Update last login
  const now = new Date().toISOString();
  const updatedUsers = users.map((u) =>
    u.uid === user.uid ? { ...u, lastLogin: now } : u
  );
  saveStoredUsers(updatedUsers);

  addAuditLogEntry({
    eventType: 'login',
    actorEmployeeId: user.employeeId,
    actorName: user.displayName,
    actorRole: user.rbacRole,
    targetResource: 'Authentication Portal',
    action: 'Corporate Password Login',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: 'Primary credential verification passed.',
  });

  const { passwordHash, ...profile } = user;
  return {
    success: true,
    user: profile,
  };
}

/**
 * Register a new employee user in the database
 */
export function registerNewUser(
  displayName: string,
  email: string,
  password: string,
  teamId: TeamId = 'engineering',
  role: string = 'Enterprise Systems Specialist',
  organization: string = 'Aegis Global Enterprises',
  rbacRole: UserRbacRole = 'Employee',
  employeeId?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!displayName.trim() || displayName.trim().length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters.' };
  }

  if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return { success: false, error: 'Please provide a valid enterprise email address.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An employee account with this email already exists.' };
  }

  const targetTeam = TEAMS_LIST.find((t) => t.id === teamId) || TEAMS_LIST[0];
  const generatedEmpId =
    employeeId || `EMP-${targetTeam.code}-${Math.floor(Math.random() * 900 + 100)}`;

  const newUser: StoredUser = {
    uid: `usr-custom-${Date.now()}`,
    employeeId: generatedEmpId,
    displayName: displayName.trim(),
    email: normalizedEmail,
    passwordHash: password,
    photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    teamId: targetTeam.id,
    teamName: targetTeam.name,
    department: targetTeam.name,
    role: role || 'Enterprise AI Specialist',
    rbacRole: rbacRole || 'Employee',
    organization: organization || 'Aegis Global Enterprises',
    phone: '+1 (555) 019-2831',
    office: 'San Francisco HQ, Building C',
    manager: 'Marcus Vance (VP)',
    accessLevel: 'Tier 3 Restricted',
    securityClearance: 'Level 1 General',
    joinedDate: new Date().toISOString().split('T')[0],
    tokenBalance: 500000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: [targetTeam.id as any, 'my_team'],
    permissions: targetTeam.permissions || ['workspace', 'fraud', 'meetings', 'documents'],
    lastLogin: new Date().toISOString(),
    passkeys: [],
    activeSessions: [
      {
        id: `sess-${Date.now()}`,
        token: `syn-sess-new-${Date.now()}`,
        ipAddress: '192.168.1.150',
        location: 'San Francisco, CA, USA',
        device: 'Workstation',
        browser: 'Google Chrome',
        os: 'Windows 11 Enterprise',
        loginTime: new Date().toISOString(),
        lastActiveTime: new Date().toISOString(),
        authMethod: 'PASSWORD',
        isCurrent: true,
      },
    ],
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  addAuditLogEntry({
    eventType: 'permission_change',
    actorEmployeeId: generatedEmpId,
    actorName: displayName.trim(),
    actorRole: rbacRole,
    targetResource: `Employee Account (${generatedEmpId})`,
    action: 'New employee account provisioned with default department clearance',
    status: 'SUCCESS',
    ipAddress: '192.168.1.150',
    details: `Assigned team: ${targetTeam.name}, RBAC: ${rbacRole}`,
  });

  const { passwordHash: _, ...profile } = newUser;
  return { success: true, user: profile };
}
