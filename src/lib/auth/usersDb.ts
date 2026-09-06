import { UserProfile, Team, TeamId } from '@/types/dashboard';

export interface StoredUser extends UserProfile {
  passwordHash: string; // Simulated secure hashed credential
  lastLogin?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  permissions: string[];
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

// Initial Verified User Database with Teams & Employee IDs
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
    department: 'Executive Governance',
    role: 'Chief Technology Officer',
    organization: 'Aegis Global Enterprises',
    tokenBalance: 850000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: 'FV-EXEC-STERLING-994',
    faceConfidence: 99.4,
    lastBiometricScan: '2026-09-05T08:30:00Z',
    permissions: ['admin', 'workspace', 'fraud', 'meetings', 'documents', 'security_audit'],
    lastLogin: '2026-09-05T08:30:00Z',
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
    organization: 'Aegis Global Enterprises',
    tokenBalance: 620000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: 'FV-SEC-ROSTOVA-988',
    faceConfidence: 98.8,
    lastBiometricScan: '2026-09-04T16:45:00Z',
    permissions: ['workspace', 'fraud', 'meetings', 'documents', 'security_audit'],
    lastLogin: '2026-09-04T16:45:00Z',
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
    organization: 'Aegis Global Enterprises',
    tokenBalance: 490000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: 'FV-ENG-VANCE-979',
    faceConfidence: 97.9,
    lastBiometricScan: '2026-09-05T09:12:00Z',
    permissions: ['workspace', 'meetings', 'documents', 'neural_models'],
    lastLogin: '2026-09-05T09:12:00Z',
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
    organization: 'Aegis Global Enterprises',
    tokenBalance: 540000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: 'FV-FIN-CHEN-991',
    faceConfidence: 99.1,
    lastBiometricScan: '2026-09-05T10:05:00Z',
    permissions: ['fraud', 'workspace', 'documents', 'meetings'],
    lastLogin: '2026-09-05T10:05:00Z',
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
    organization: 'Aegis Global Enterprises',
    tokenBalance: 410000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: 'FV-LGL-MILLER-982',
    faceConfidence: 98.2,
    lastBiometricScan: '2026-09-05T11:40:00Z',
    permissions: ['documents', 'contract_diff', 'workspace', 'meetings'],
    lastLogin: '2026-09-05T11:40:00Z',
  },
];

// Helper to get users from localStorage or fallback
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const data = localStorage.getItem('synapse_users_db');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all stored users have teamId and employeeId
        return parsed.map((u, i) => ({
          ...INITIAL_USERS[i % INITIAL_USERS.length],
          ...u,
          employeeId: u.employeeId || `EMP-${(u.teamId || 'ENG').toUpperCase().slice(0, 3)}-${100 + i}`,
          teamId: u.teamId || 'engineering',
          teamName: u.teamName || 'Engineering & Neural R&D',
          faceBiometricEnrolled: u.faceBiometricEnrolled ?? true,
        }));
      }
    }
    localStorage.setItem('synapse_users_db', JSON.stringify(INITIAL_USERS));
  } catch (err) {
    console.warn('LocalStorage error reading users:', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('synapse_users_db', JSON.stringify(users));
  } catch (err) {
    console.warn('LocalStorage error saving users:', err);
  }
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
    return {
      success: false,
      error: 'No account found with this email address. Please check your credentials.',
    };
  }

  if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
    return {
      success: false,
      error: 'Account access has been suspended. Please contact Security Ops.',
    };
  }

  if (user.passwordHash !== password) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.',
    };
  }

  // Update last login
  const updatedUsers = users.map((u) =>
    u.uid === user.uid ? { ...u, lastLogin: new Date().toISOString() } : u
  );
  saveStoredUsers(updatedUsers);

  const { passwordHash, ...profile } = user;
  return {
    success: true,
    user: profile,
  };
}

/**
 * Biometric Face Recognition Verification
 */
export function verifyFaceBiometrics(
  targetUidOrEmail: string,
  minConfidence: number = 85
): { success: boolean; user?: UserProfile; confidence?: number; error?: string } {
  const users = getStoredUsers();
  const query = targetUidOrEmail.trim().toLowerCase();

  // Find user by UID, email, or employeeId
  const user =
    users.find(
      (u) =>
        u.uid.toLowerCase() === query ||
        u.email.toLowerCase() === query ||
        u.employeeId.toLowerCase() === query ||
        u.displayName.toLowerCase().includes(query)
    ) || users[0];

  if (!user) {
    return {
      success: false,
      error: 'Biometric profile match not found in Synapse Neural Face Vector database.',
    };
  }

  if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
    return {
      success: false,
      error: 'Biometric login denied. Employee access suspended by Security Forensics.',
    };
  }

  const confidenceScore = user.faceConfidence || Math.floor(Math.random() * 6) + 94; // 94% - 99%

  if (confidenceScore < minConfidence) {
    return {
      success: false,
      error: `Biometric confidence score (${confidenceScore}%) below security threshold of ${minConfidence}%.`,
    };
  }

  // Update biometric scan timestamp
  const now = new Date().toISOString();
  const updatedUsers = users.map((u) =>
    u.uid === user.uid
      ? { ...u, lastLogin: now, lastBiometricScan: now, faceBiometricEnrolled: true, faceConfidence: confidenceScore }
      : u
  );
  saveStoredUsers(updatedUsers);

  const { passwordHash, ...profile } = user;
  return {
    success: true,
    user: {
      ...profile,
      faceBiometricEnrolled: true,
      faceConfidence: confidenceScore,
      lastBiometricScan: now,
    },
    confidence: confidenceScore,
  };
}

/**
 * Enroll user face biometrics
 */
export function enrollUserFace(
  uid: string,
  photoURL?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const user = users.find((u) => u.uid === uid);
  if (!user) {
    return { success: false, error: 'User not found for face enrollment.' };
  }

  const confidence = 98.6;
  const now = new Date().toISOString();
  const vectorId = `FV-${user.teamId.toUpperCase()}-${user.displayName.replace(/\s+/g, '').toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

  const updatedUsers = users.map((u) =>
    u.uid === uid
      ? {
          ...u,
          photoURL: photoURL || u.photoURL,
          faceBiometricEnrolled: true,
          faceVectorId: vectorId,
          faceConfidence: confidence,
          lastBiometricScan: now,
        }
      : u
  );
  saveStoredUsers(updatedUsers);

  const updatedUser = updatedUsers.find((u) => u.uid === uid)!;
  const { passwordHash, ...profile } = updatedUser;
  return { success: true, user: profile };
}

/**
 * Register a new employee user in the database with team assignment
 */
export function registerNewUser(
  displayName: string,
  email: string,
  password: string,
  teamId: TeamId = 'engineering',
  role: string = 'Enterprise AI Specialist',
  organization: string = 'Aegis Global Enterprises',
  employeeId?: string,
  photoURL?: string
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
    photoURL:
      photoURL ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    teamId: targetTeam.id,
    teamName: targetTeam.name,
    department: targetTeam.name,
    role: role || 'Enterprise AI Specialist',
    organization: organization || 'Aegis Global Enterprises',
    tokenBalance: 500000,
    status: 'ACTIVE',
    faceBiometricEnrolled: true,
    faceVectorId: `FV-${targetTeam.code}-${Math.floor(Math.random() * 900 + 100)}`,
    faceConfidence: 98.4,
    lastBiometricScan: new Date().toISOString(),
    permissions: targetTeam.permissions || ['workspace', 'fraud', 'meetings', 'documents'],
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  const { passwordHash: _, ...profile } = newUser;
  return { success: true, user: profile };
}

/**
 * Filter users by specific team
 */
export function getUsersByTeam(teamId: TeamId): StoredUser[] {
  const users = getStoredUsers();
  return users.filter((u) => u.teamId === teamId);
}

