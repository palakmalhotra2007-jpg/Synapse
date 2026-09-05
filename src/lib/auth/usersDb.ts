import { UserProfile } from '@/types/dashboard';

export interface StoredUser extends UserProfile {
  passwordHash: string; // Simulated secure hashed credential
  lastLogin?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  permissions: string[];
}

// Initial Verified User Database
export const INITIAL_USERS: StoredUser[] = [
  {
    uid: 'usr-exec-001',
    displayName: 'Alex Sterling',
    email: 'alex.sterling@synapse-ai.io',
    passwordHash: 'Synapse#2026', // Plain for demo comparison simulation
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Chief Technology Officer',
    organization: 'Aegis Global Enterprises',
    tokenBalance: 850000,
    status: 'ACTIVE',
    permissions: ['admin', 'workspace', 'fraud', 'meetings', 'documents'],
    lastLogin: '2026-09-05T08:30:00Z',
  },
  {
    uid: 'usr-fin-002',
    displayName: 'Elena Rostova',
    email: 'elena.rostova@synapse-ai.io',
    passwordHash: 'FraudGuard#2026',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Chief Financial Officer & Fraud Lead',
    organization: 'Aegis Global Enterprises',
    tokenBalance: 620000,
    status: 'ACTIVE',
    permissions: ['workspace', 'fraud', 'meetings', 'documents'],
    lastLogin: '2026-09-04T16:45:00Z',
  },
  {
    uid: 'usr-ai-003',
    displayName: 'Marcus Vance',
    email: 'marcus.vance@synapse-ai.io',
    passwordHash: 'NeuralAI#2026',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'VP of AI Product & Architecture',
    organization: 'Aegis Global Enterprises',
    tokenBalance: 490000,
    status: 'ACTIVE',
    permissions: ['workspace', 'meetings', 'documents'],
    lastLogin: '2026-09-05T09:12:00Z',
  },
];

// Helper to get users from localStorage or fallback
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const data = localStorage.getItem('synapse_users_db');
    if (data) {
      return JSON.parse(data);
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
      error: 'No account found with this email address.',
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

  // Return sanitized user profile
  const { passwordHash, ...profile } = user;
  return {
    success: true,
    user: profile,
  };
}

/**
 * Register a new user in the database
 */
export function registerNewUser(
  displayName: string,
  email: string,
  password: string,
  role: string = 'Enterprise AI Specialist',
  organization: string = 'Aegis Global Enterprises'
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
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: StoredUser = {
    uid: `usr-custom-${Date.now()}`,
    displayName: displayName.trim(),
    email: normalizedEmail,
    passwordHash: password,
    photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: role || 'Enterprise AI Specialist',
    organization: organization || 'Aegis Global Enterprises',
    tokenBalance: 500000,
    status: 'ACTIVE',
    permissions: ['workspace', 'fraud', 'meetings', 'documents'],
    lastLogin: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  const { passwordHash: _, ...profile } = newUser;
  return { success: true, user: profile };
}
