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
    lead: 'Charvi Sharma',
    memberCount: 4,
    documentCount: 64,
    permissions: ['workspace', 'neural_models', 'documents', 'api_access', 'meetings'],
  },
];

// Initial Verified Corporate Employees Database (2 Employees in Engineering Team)
// Initial Verified Corporate Employees Database (4 Employees in Engineering Team: Charvi, Tanisha, Anshika, Bhavya)
export const INITIAL_USERS: StoredUser[] = [
  {
    uid: 'usr-eng-001',
    employeeId: 'EMP-ENG-001',
    displayName: 'Charvi Sharma',
    email: 'charvi@synapse-ai.io',
    passwordHash: 'Synapse#2026',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'Engineering & AI Architecture',
    role: 'Engineering Lead & Principal AI Architect',
    rbacRole: 'Administrator',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 234-8901',
    office: 'Building C, Floor 4 (Neural Lab), San Francisco HQ',
    manager: 'Engineering Board',
    accessLevel: 'Tier 1 Top Secret',
    securityClearance: 'Level 5 Executive',
    joinedDate: '2023-01-15',
    tokenBalance: 850000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['engineering', 'my_team', 'executive', 'finance', 'cyber'],
    permissions: ['admin', 'workspace', 'fraud', 'meetings', 'documents', 'security_audit', 'financial_reports', 'vault_admin', 'user_management'],
    lastLogin: '2026-10-07T08:30:00Z',
    passkeys: [
      {
        id: 'pk-01',
        name: 'Touch ID (MacBook Pro 16" M3 Max)',
        credentialId: 'cred-mac-touchid-charvi-882',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...',
        counter: 64,
        createdAt: '2026-01-20T14:10:00Z',
        lastUsedAt: '2026-10-07T08:30:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Google Chrome 128',
        os: 'macOS (Touch ID)',
      },
    ],
    faceId: {
      id: 'face-01',
      enrolledAt: '2026-01-22T10:00:00Z',
      vectorHash: 'VEC-HASH-CHARVI-RETINAL-1024',
      descriptor: 'Charvi Sharma Retinal Mesh Signature',
      deviceCamera: 'Built-in FaceTime HD Camera',
    },
    activeSessions: [
      {
        id: 'sess-01',
        token: 'syn-sess-charvi-current',
        ipAddress: '192.168.1.100 (HQ Secure Gateway)',
        location: 'San Francisco, CA, USA',
        device: 'MacBook Pro Workstation',
        browser: 'Google Chrome 128',
        os: 'macOS Sonoma',
        loginTime: '2026-10-07T08:30:00Z',
        lastActiveTime: '2026-10-07T17:00:00Z',
        authMethod: 'WEBAUTHN_PASSKEY',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-eng-002',
    employeeId: 'EMP-ENG-002',
    displayName: 'Tanisha Gupta',
    email: 'tanisha@synapse-ai.io',
    passwordHash: 'Synapse#2026',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'Engineering & AI Architecture',
    role: 'Senior Backend & Cloud Infrastructure Engineer',
    rbacRole: 'Manager',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 345-6789',
    office: 'Building C, Floor 4 (Distributed Systems Lab), San Francisco HQ',
    manager: 'Charvi Sharma (Engineering Lead)',
    accessLevel: 'Tier 2 Confidential',
    securityClearance: 'Level 4 Cyber Forensics',
    joinedDate: '2023-04-01',
    tokenBalance: 620000,
    status: 'ACTIVE',
    mfaEnabled: true,
    vaultAccess: ['engineering', 'my_team'],
    permissions: ['workspace', 'meetings', 'documents', 'neural_models', 'api_access'],
    lastLogin: '2026-10-07T09:15:00Z',
    passkeys: [
      {
        id: 'pk-02',
        name: 'Windows Hello Biometric Key',
        credentialId: 'cred-win-hello-tanisha-901',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEB...',
        counter: 32,
        createdAt: '2026-03-10T09:00:00Z',
        lastUsedAt: '2026-10-07T09:15:00Z',
        deviceType: 'platform',
        authenticatorAttachment: 'platform',
        browser: 'Firefox 129',
        os: 'Windows (Windows Hello)',
      },
    ],
    faceId: {
      id: 'face-02',
      enrolledAt: '2026-03-12T11:20:00Z',
      vectorHash: 'VEC-HASH-TANISHA-RETINAL-1024',
      descriptor: 'Tanisha Gupta Retinal Mesh Signature',
      deviceCamera: 'HD WebCam 1080p',
    },
    activeSessions: [
      {
        id: 'sess-02',
        token: 'syn-sess-tanisha-current',
        ipAddress: '192.168.1.104 (Dev VLAN)',
        location: 'San Francisco, CA, USA',
        device: 'Linux XPS Workstation',
        browser: 'Firefox 129',
        os: 'Linux Ubuntu',
        loginTime: '2026-10-07T09:15:00Z',
        lastActiveTime: '2026-10-07T16:45:00Z',
        authMethod: 'PASSWORD',
        isCurrent: true,
      },
    ],
  },
  {
    uid: 'usr-eng-003',
    employeeId: 'EMP-ENG-003',
    displayName: 'Anshika Verma',
    email: 'anshika@synapse-ai.io',
    passwordHash: 'Synapse#2026',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'Engineering & AI Architecture',
    role: 'Neural Pipeline & ML Infrastructure Lead',
    rbacRole: 'Manager',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 456-7890',
    office: 'Building C, Floor 4 (Neural Lab), San Francisco HQ',
    manager: 'Charvi Sharma (Engineering Lead)',
    accessLevel: 'Tier 2 Confidential',
    securityClearance: 'Level 4 Cyber Forensics',
    joinedDate: '2023-06-15',
    tokenBalance: 580000,
    status: 'ACTIVE',
    mfaEnabled: false,
    vaultAccess: ['engineering', 'my_team'],
    permissions: ['workspace', 'meetings', 'documents', 'neural_models'],
    lastLogin: '2026-10-06T14:20:00Z',
    passkeys: [],
    activeSessions: [],
  },
  {
    uid: 'usr-eng-004',
    employeeId: 'EMP-ENG-004',
    displayName: 'Bhavya Malhotra',
    email: 'bhavya@synapse-ai.io',
    passwordHash: 'Synapse#2026',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    teamId: 'engineering',
    teamName: 'Engineering & Neural R&D',
    department: 'Engineering & AI Architecture',
    role: 'Frontend Architect & UI Lead',
    rbacRole: 'Employee',
    organization: 'Aegis Global Enterprises',
    phone: '+1 (555) 567-8901',
    office: 'Building C, Floor 4 (UX Studio), San Francisco HQ',
    manager: 'Charvi Sharma (Engineering Lead)',
    accessLevel: 'Tier 3 Restricted',
    securityClearance: 'Level 3 Financial Risk',
    joinedDate: '2023-08-01',
    tokenBalance: 490000,
    status: 'ACTIVE',
    mfaEnabled: false,
    vaultAccess: ['engineering', 'my_team'],
    permissions: ['workspace', 'meetings', 'documents'],
    lastLogin: '2026-10-06T11:10:00Z',
    passkeys: [],
    activeSessions: [],
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
    employeeId: 'EMP-ENG-001',
    employeeName: 'Charvi Sharma',
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
    actorEmployeeId: 'EMP-ENG-001',
    actorName: 'Charvi Sharma',
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

// LocalStorage helpers for Teams
export function getStoredTeams(): Team[] {
  if (typeof window === 'undefined') return TEAMS_LIST;
  try {
    const raw = localStorage.getItem('synapse_stored_teams_v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem('synapse_stored_teams_v3', JSON.stringify(TEAMS_LIST));
  } catch (e) {}
  return TEAMS_LIST;
}

export function saveStoredTeams(teams: Team[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_stored_teams_v3', JSON.stringify(teams));
  } catch (e) {}
}

export function createNewTeam(teamData: {
  name: string;
  code: string;
  description: string;
  lead?: string;
  badgeVariant?: 'cyan' | 'rose' | 'amber' | 'purple' | 'emerald' | 'indigo';
}): Team {
  const teams = getStoredTeams();
  const slug = teamData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const teamId = `team_${slug}_${Date.now()}`;

  const newTeam: Team = {
    id: teamId,
    name: teamData.name.trim(),
    code: teamData.code.trim().toUpperCase() || 'TEAM',
    badgeVariant: teamData.badgeVariant || 'indigo',
    description: teamData.description.trim(),
    lead: teamData.lead || 'Charvi Sharma',
    memberCount: 1,
    documentCount: 0,
    permissions: ['workspace', 'documents', 'meetings', 'fraud'],
  };

  const updatedTeams = [...teams, newTeam];
  saveStoredTeams(updatedTeams);

  addAuditLogEntry({
    eventType: 'permission_change',
    actorEmployeeId: 'EMP-ENG-001',
    actorName: 'Charvi Sharma',
    actorRole: 'Administrator',
    targetResource: `Team ${newTeam.name} (${newTeam.code})`,
    action: 'Provisioned new enterprise department team',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: `Team Code: ${newTeam.code}, Lead: ${newTeam.lead}`,
  });

  return newTeam;
}

// LocalStorage helpers for Users
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const data = localStorage.getItem('synapse_users_db_v6');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem('synapse_users_db_v6', JSON.stringify(INITIAL_USERS));
  } catch (err) {
    console.warn('LocalStorage error reading users:', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_users_db_v6', JSON.stringify(users));
  } catch (err) {
    console.warn('LocalStorage error saving users:', err);
  }
}

// Helper to compute Euclidean distance between two 128-dimensional face embedding vectors
export function computeFaceEuclideanDistance(
  desc1: number[] | Float32Array,
  desc2: number[] | Float32Array
): number {
  let sum = 0;
  const len = Math.min(desc1.length, desc2.length);
  for (let i = 0; i < len; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function parseStoredDescriptor(raw: string | undefined): number[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 64) {
      return parsed;
    }
  } catch (e) {}
  return null;
}

// Biometric Face ID Enrollment & DB Storage
export function registerFaceIdForUser(
  email: string,
  descriptorData?: number[] | Float32Array | string,
  deviceCamera: string = 'Integrated WebCam'
): { success: boolean; user?: StoredUser; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (index === -1) {
    return { success: false, error: 'Employee user account not found in database.' };
  }

  let serializedDescriptor = '';
  if (descriptorData) {
    if (descriptorData instanceof Float32Array || Array.isArray(descriptorData)) {
      serializedDescriptor = JSON.stringify(Array.from(descriptorData));
    } else if (typeof descriptorData === 'string') {
      try {
        const parsed = JSON.parse(descriptorData);
        if (Array.isArray(parsed) && parsed.length >= 64) {
          serializedDescriptor = descriptorData;
        }
      } catch (_) {}
    }
  }

  // If no valid descriptor was provided, generate a deterministic, realistic 128-D vector for this user
  if (!serializedDescriptor) {
    const seed = Math.abs(email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 42));
    const generated = Array.from({ length: 128 }, (_, i) => {
      const val = Math.sin((seed + i) * 1.618) * 0.15;
      return Math.round(val * 10000) / 10000;
    });
    serializedDescriptor = JSON.stringify(generated);
  }

  const faceIdData = {
    id: `face-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    enrolledAt: new Date().toISOString(),
    vectorHash: `VEC-HASH-${users[index].employeeId}-${Date.now().toString(16).toUpperCase()}`,
    descriptor: serializedDescriptor,
    deviceCamera,
  };

  users[index].faceId = faceIdData;
  saveStoredUsers(users);

  addAuditLogEntry({
    eventType: 'passkey_registration',
    actorEmployeeId: users[index].employeeId,
    actorName: users[index].displayName,
    actorRole: users[index].rbacRole,
    targetResource: 'Biometric Face ID Vault DB',
    action: 'Enrolled & stored facial 128-D vector embedding in DB',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: `Face Vector Hash: ${faceIdData.vectorHash} (128-D Neural Embedding Vector)`,
  });

  return { success: true, user: users[index] };
}

// Biometric Verification Against Specific User in DB
export function verifyFaceDescriptorForUser(
  email: string,
  liveDescriptor: number[] | Float32Array,
  threshold: number = 0.58
): {
  success: boolean;
  matched: boolean;
  confidence: number;
  distance: number;
  user?: StoredUser;
  error?: string;
  isEnrolled?: boolean;
} {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, matched: false, confidence: 0, distance: 1.0, error: 'Employee account not found in database.' };
  }

  if (!user.faceId || !user.faceId.descriptor) {
    return {
      success: false,
      matched: false,
      confidence: 0,
      distance: 1.0,
      isEnrolled: false,
      error: `No Face ID signature registered in database for ${user.displayName}. Please enroll your face first.`,
    };
  }

  const storedDesc = parseStoredDescriptor(user.faceId.descriptor);
  if (!storedDesc) {
    return {
      success: false,
      matched: false,
      confidence: 0,
      distance: 1.0,
      isEnrolled: false,
      error: `Face ID profile for ${user.displayName} requires a live camera enrollment scan before verification.`,
    };
  }

  const distance = computeFaceEuclideanDistance(liveDescriptor, storedDesc);
  const matched = distance <= threshold;
  const confidence = Math.max(5, Math.min(99, Math.round((1 - (distance / 0.75)) * 100)));

  return {
    success: true,
    matched,
    confidence,
    distance: Math.round(distance * 1000) / 1000,
    user: matched ? user : undefined,
    error: matched ? undefined : `Face biometric mismatch (Distance: ${distance.toFixed(3)} > ${threshold}). Access denied.`,
  };
}

// Auto-Identify Person Across All Enrolled Employees in Database
export function identifyUserByFaceDescriptor(
  liveDescriptor: number[] | Float32Array,
  threshold: number = 0.58
): {
  matched: boolean;
  confidence: number;
  distance: number;
  user?: StoredUser;
  error?: string;
} {
  const users = getStoredUsers();
  let bestMatchUser: StoredUser | null = null;
  let lowestDistance = 999;

  for (const u of users) {
    if (!u.faceId?.descriptor) continue;
    const stored = parseStoredDescriptor(u.faceId.descriptor);
    if (!stored) continue;

    const dist = computeFaceEuclideanDistance(liveDescriptor, stored);
    if (dist < lowestDistance) {
      lowestDistance = dist;
      bestMatchUser = u;
    }
  }

  if (bestMatchUser && lowestDistance <= threshold) {
    const confidence = Math.max(5, Math.min(99, Math.round((1 - (lowestDistance / 0.75)) * 100)));
    return {
      matched: true,
      confidence,
      distance: Math.round(lowestDistance * 1000) / 1000,
      user: bestMatchUser,
    };
  }

  return {
    matched: false,
    confidence: lowestDistance === 999 ? 0 : Math.max(5, Math.min(45, Math.round((1 - (lowestDistance / 0.75)) * 100))),
    distance: lowestDistance === 999 ? 1.0 : Math.round(lowestDistance * 1000) / 1000,
    error: lowestDistance === 999
      ? 'No enrolled face profiles found in the enterprise database. Please enroll your face first.'
      : `Face does not match any registered employee (Closest distance: ${lowestDistance.toFixed(3)} > ${threshold}). Access denied.`,
  };
}

// Legacy verification check (checks presence of face enrollment)
export function verifyFaceIdForUser(
  email: string
): { success: boolean; user?: StoredUser; error?: string; isEnrolled?: boolean } {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, error: 'Employee account not found in database.' };
  }

  if (!user.faceId) {
    return {
      success: false,
      isEnrolled: false,
      error: `No Face ID signature registered in database for ${user.displayName}. Please enroll/register your face scan first.`,
    };
  }

  return { success: true, isEnrolled: true, user };
}

export function verifyPasskeyForUser(
  email: string
): { success: boolean; user?: StoredUser; error?: string; isEnrolled?: boolean } {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, error: 'Employee account not found in database.' };
  }

  if (!user.passkeys || user.passkeys.length === 0) {
    return {
      success: false,
      isEnrolled: false,
      error: `No WebAuthn passkey registered in database for ${user.displayName}. Please register your passkey first.`,
    };
  }

  return { success: true, isEnrolled: true, user };
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
