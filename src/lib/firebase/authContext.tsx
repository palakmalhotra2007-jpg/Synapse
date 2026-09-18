'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, TeamId, PasskeyCredential, ActiveSession, UserRbacRole } from '@/types/dashboard';
import {
  INITIAL_USERS,
  TEAMS_LIST,
  verifyCredentials,
  registerNewUser,
  getStoredUsers,
  saveStoredUsers,
  registerUserPasskey,
  removeUserPasskey,
  revokeUserSession as revokeUserSessionDb,
  addAuditLogEntry,
} from '@/lib/auth/usersDb';
import {
  registerWebAuthnPasskey,
  authenticateWebAuthnPasskey,
  checkWebAuthnSupport,
} from '@/lib/auth/webauthn';

export interface UserSession {
  token: string;
  loginTime: string;
  expiresAt: string;
  ipAddress: string;
  device: string;
  authMethod: 'PASSWORD' | 'WEBAUTHN_PASSKEY' | 'PLATFORM_BIOMETRIC' | 'PERSONA';
}

interface AuthContextType {
  user: UserProfile | null;
  session: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPasskey: (email?: string) => Promise<{ success: boolean; error?: string }>;
  registerPasskey: (name?: string) => Promise<{ success: boolean; passkey?: PasskeyCredential; error?: string }>;
  removePasskey: (passkeyId: string) => Promise<{ success: boolean }>;
  revokeSession: (sessionId: string) => Promise<{ success: boolean }>;
  register: (
    name: string,
    email: string,
    password: string,
    teamId?: TeamId,
    role?: string,
    rbacRole?: UserRbacRole
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithPersona: (personaId: string) => void;
  switchTeam: (teamId: TeamId) => void;
  signInDemoUser: () => void;
  signOut: () => void;
  deductTokens: (amount: number) => void;
  addTokens: (amount: number) => void;
  isPlatformBiometricAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({ success: false }),
  loginWithPasskey: async () => ({ success: false }),
  registerPasskey: async () => ({ success: false }),
  removePasskey: async () => ({ success: false }),
  revokeSession: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithPersona: () => {},
  switchTeam: () => {},
  signInDemoUser: () => {},
  signOut: () => {},
  deductTokens: () => {},
  addTokens: () => {},
  isPlatformBiometricAvailable: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlatformBiometricAvailable, setIsPlatformBiometricAvailable] = useState(false);

  // Check hardware WebAuthn capabilities on mount
  useEffect(() => {
    checkWebAuthnSupport().then((support) => {
      setIsPlatformBiometricAvailable(support.isPlatformAvailable);
    });
  }, []);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('synapse_auth_user');
        const savedSession = localStorage.getItem('synapse_auth_session');

        if (savedUser && savedUser !== 'undefined' && savedSession && savedSession !== 'undefined') {
          const parsedUser: UserProfile = JSON.parse(savedUser);
          const allUsers = getStoredUsers();
          const matched = allUsers.find((u) => u.uid === parsedUser.uid);
          if (matched) {
            const { passwordHash: _, ...freshProfile } = matched;
            setUser(freshProfile);
          } else {
            setUser(parsedUser);
          }
          setSession(JSON.parse(savedSession));
        } else {
          // Initialize with default primary enterprise user
          const allUsers = getStoredUsers();
          const defaultUser = allUsers[0] || INITIAL_USERS[0];
          const { passwordHash: _, ...freshProfile } = defaultUser;
          const sess = createSession(freshProfile, 'PASSWORD');
          setUser(freshProfile);
          setSession(sess);
          localStorage.setItem('synapse_auth_user', JSON.stringify(freshProfile));
          localStorage.setItem('synapse_auth_session', JSON.stringify(sess));
          sessionStorage.setItem('synapse-authenticated', 'true');
        }
      }
    } catch (err) {
      console.warn('Session restoration error:', err);
      const defaultUser = INITIAL_USERS[0];
      const { passwordHash: _, ...freshProfile } = defaultUser;
      setUser(freshProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = (
    profile: UserProfile,
    authMethod: 'PASSWORD' | 'WEBAUTHN_PASSKEY' | 'PLATFORM_BIOMETRIC' | 'PERSONA' = 'PASSWORD'
  ): UserSession => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Workstation';
    let deviceName = 'Corporate Workstation';
    if (ua.includes('Macintosh')) deviceName = 'MacBook Pro';
    else if (ua.includes('Windows')) deviceName = 'ThinkPad Workstation (Windows)';
    else if (ua.includes('iPhone')) deviceName = 'iPhone';
    else if (ua.includes('Android')) deviceName = 'Android Mobile';

    const newSession: UserSession = {
      token: `syn-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100 (HQ Secure Gateway)',
      device: deviceName,
      authMethod,
    };

    // Add active session to user profile
    const activeSess: ActiveSession = {
      id: `sess-${Date.now()}`,
      token: newSession.token,
      ipAddress: newSession.ipAddress,
      location: 'San Francisco, CA, USA',
      device: deviceName,
      browser: typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Safari / Edge',
      os: typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows') ? 'Windows 11' : 'macOS Sonoma',
      loginTime: newSession.loginTime,
      lastActiveTime: newSession.loginTime,
      authMethod,
      isCurrent: true,
    };

    const updatedProfile: UserProfile = {
      ...profile,
      activeSessions: [activeSess, ...(profile.activeSessions || []).map((s) => ({ ...s, isCurrent: false }))],
    };

    setUser(updatedProfile);
    setSession(newSession);
    localStorage.setItem('synapse_auth_user', JSON.stringify(updatedProfile));
    localStorage.setItem('synapse_auth_session', JSON.stringify(newSession));

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('synapse-authenticated', 'true');
    }
    return newSession;
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const verification = verifyCredentials(email, password);
      if (!verification.success || !verification.user) {
        return { success: false, error: verification.error || 'Authentication failed' };
      }
      createSession(verification.user, 'PASSWORD');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPasskey = async (
    email?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const allUsers = getStoredUsers();
      const targetUser = email
        ? allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        : allUsers[0];

      if (!targetUser) {
        return { success: false, error: 'No employee account found for passkey verification.' };
      }

      // Collect registered credential IDs for this user
      const allowedCredentialIds = targetUser.passkeys?.map((p) => p.credentialId) || [];

      // Request browser WebAuthn assertion
      const authResult = await authenticateWebAuthnPasskey({
        allowedCredentialIds: allowedCredentialIds.length > 0 ? allowedCredentialIds : undefined,
        userVerification: 'preferred',
      });

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'WebAuthn biometric authentication was not completed.',
        };
      }

      // Verification succeeded
      const { passwordHash: _, ...profile } = targetUser;
      createSession(profile, 'WEBAUTHN_PASSKEY');

      addAuditLogEntry({
        eventType: 'login',
        actorEmployeeId: targetUser.employeeId,
        actorName: targetUser.displayName,
        actorRole: targetUser.rbacRole,
        targetResource: 'Authentication Portal',
        action: 'WebAuthn Passkey / Platform Authenticator Login',
        status: 'SUCCESS',
        ipAddress: '192.168.1.100',
        details: 'Verified cryptographic assertion with registered passkey descriptor.',
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Passkey authentication error' };
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async (
    name?: string
  ): Promise<{ success: boolean; passkey?: PasskeyCredential; error?: string }> => {
    if (!user) return { success: false, error: 'You must be logged in to register a passkey.' };

    try {
      const res = await registerWebAuthnPasskey({
        user: {
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
        },
        rpName: 'SYNAPSE Enterprise Intelligence Platform',
        authenticatorAttachment: 'platform',
      });

      if (!res.success || !res.credential) {
        return { success: false, error: res.error || 'Passkey registration failed.' };
      }

      if (name) {
        res.credential.name = name;
      }

      registerUserPasskey(user.uid, res.credential);

      // Update local state
      const updatedUser: UserProfile = {
        ...user,
        passkeys: [...(user.passkeys || []).filter((p) => p.credentialId !== res.credential!.credentialId), res.credential],
      };
      setUser(updatedUser);
      localStorage.setItem('synapse_auth_user', JSON.stringify(updatedUser));

      return { success: true, passkey: res.credential };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to enroll WebAuthn passkey.' };
    }
  };

  const removePasskey = async (passkeyId: string): Promise<{ success: boolean }> => {
    if (!user) return { success: false };
    removeUserPasskey(user.uid, passkeyId);

    const updatedUser: UserProfile = {
      ...user,
      passkeys: (user.passkeys || []).filter((p) => p.id !== passkeyId),
    };
    setUser(updatedUser);
    localStorage.setItem('synapse_auth_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const revokeSession = async (sessionId: string): Promise<{ success: boolean }> => {
    if (!user) return { success: false };
    revokeUserSessionDb(user.uid, sessionId);

    const updatedUser: UserProfile = {
      ...user,
      activeSessions: (user.activeSessions || []).filter((s) => s.id !== sessionId),
    };
    setUser(updatedUser);
    localStorage.setItem('synapse_auth_user', JSON.stringify(updatedUser));

    // If current session was revoked, sign out
    if (session && user.activeSessions.find((s) => s.id === sessionId)?.isCurrent) {
      signOut();
    }

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    teamId: TeamId = 'engineering',
    role?: string,
    rbacRole: UserRbacRole = 'Employee'
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const res = registerNewUser(name, email, password, teamId, role, 'Aegis Global Enterprises', rbacRole);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Registration failed' };
      }
      createSession(res.user, 'PASSWORD');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPersona = (personaId: string) => {
    const users = getStoredUsers();
    const persona = users.find((u) => u.uid === personaId) || INITIAL_USERS[0];
    const { passwordHash: _, ...profile } = persona;
    createSession(profile, 'PERSONA');
  };

  const switchTeam = (teamId: TeamId) => {
    if (!user) return;
    const targetTeam = TEAMS_LIST.find((t) => t.id === teamId);
    if (!targetTeam) return;

    const updatedUser: UserProfile = {
      ...user,
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      department: targetTeam.name,
    };
    setUser(updatedUser);
    localStorage.setItem('synapse_auth_user', JSON.stringify(updatedUser));
  };

  const signInDemoUser = () => {
    loginWithPersona('usr-exec-001');
  };

  const signOut = () => {
    if (user) {
      addAuditLogEntry({
        eventType: 'logout',
        actorEmployeeId: user.employeeId,
        actorName: user.displayName,
        actorRole: user.rbacRole,
        targetResource: 'Authentication Portal',
        action: 'User Session Logged Out',
        status: 'SUCCESS',
        ipAddress: session?.ipAddress || '192.168.1.100',
        details: 'Active session terminated.',
      });
    }

    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem('synapse_auth_user');
      localStorage.removeItem('synapse_auth_session');
      sessionStorage.removeItem('synapse-authenticated');
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }
  };

  const deductTokens = (amount: number) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        tokenBalance: Math.max(0, prev.tokenBalance - amount),
      };
      try {
        localStorage.setItem('synapse_auth_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addTokens = (amount: number) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        tokenBalance: prev.tokenBalance + amount,
      };
      try {
        localStorage.setItem('synapse_auth_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginWithPasskey,
        registerPasskey,
        removePasskey,
        revokeSession,
        register,
        loginWithPersona,
        switchTeam,
        signInDemoUser,
        signOut,
        deductTokens,
        addTokens,
        isPlatformBiometricAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
