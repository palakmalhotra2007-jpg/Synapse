'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, TeamId } from '@/types/dashboard';
import {
  INITIAL_USERS,
  TEAMS_LIST,
  verifyCredentials,
  verifyFaceBiometrics,
  enrollUserFace,
  registerNewUser,
  getStoredUsers,
} from '@/lib/auth/usersDb';

export interface UserSession {
  token: string;
  loginTime: string;
  expiresAt: string;
  ipAddress: string;
  device: string;
  authMethod: 'PASSWORD' | 'FACE_BIOMETRIC' | 'PERSONA';
}

interface AuthContextType {
  user: UserProfile | null;
  session: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithFace: (
    identifier: string,
    minConfidence?: number
  ) => Promise<{ success: boolean; confidence?: number; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    teamId?: TeamId,
    role?: string
  ) => Promise<{ success: boolean; error?: string }>;
  enrollFace: (photoUrl?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPersona: (personaId: string) => void;
  switchTeam: (teamId: TeamId) => void;
  signInDemoUser: () => void;
  signOut: () => void;
  deductTokens: (amount: number) => void;
  addTokens: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({ success: false }),
  loginWithFace: async () => ({ success: false }),
  register: async () => ({ success: false }),
  enrollFace: async () => ({ success: false }),
  loginWithPersona: () => {},
  switchTeam: () => {},
  signInDemoUser: () => {},
  signOut: () => {},
  deductTokens: () => {},
  addTokens: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initial synchronous fallback if possible
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('synapse_auth_user');
        if (saved && saved !== 'undefined') return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultUser = INITIAL_USERS[0];
    const { passwordHash: _, ...profile } = defaultUser;
    return profile;
  });

  const [session, setSession] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('synapse_auth_session');
        if (saved && saved !== 'undefined') return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      token: `syn-sess-init`,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100 (Enterprise Gateway)',
      device: 'Workstation',
      authMethod: 'FACE_BIOMETRIC',
    };
  });

  const [loading, setLoading] = useState(false);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('synapse_auth_user');
        const savedSession = localStorage.getItem('synapse_auth_session');

        if (savedUser && savedUser !== 'undefined' && savedSession && savedSession !== 'undefined') {
          const parsedUser: UserProfile = JSON.parse(savedUser);
          if (!parsedUser.employeeId || !parsedUser.teamId) {
            const matched = INITIAL_USERS.find((u) => u.uid === parsedUser.uid) || INITIAL_USERS[0];
            parsedUser.employeeId = matched.employeeId;
            parsedUser.teamId = matched.teamId;
            parsedUser.teamName = matched.teamName;
            parsedUser.department = matched.department;
            parsedUser.faceBiometricEnrolled = true;
          }
          setUser(parsedUser);
          setSession(JSON.parse(savedSession));
        } else {
          const defaultUser = INITIAL_USERS[0];
          const { passwordHash: _, ...profile } = defaultUser;
          const newSession: UserSession = {
            token: `syn-sess-${Date.now()}`,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100 (Enterprise Gateway)',
            device: 'Workstation',
            authMethod: 'FACE_BIOMETRIC',
          };
          setUser(profile);
          setSession(newSession);
          localStorage.setItem('synapse_auth_user', JSON.stringify(profile));
          localStorage.setItem('synapse_auth_session', JSON.stringify(newSession));
        }
      }
    } catch (err) {
      console.warn('Session restoration fallback:', err);
      const defaultUser = INITIAL_USERS[0];
      const { passwordHash: _, ...profile } = defaultUser;
      setUser(profile);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = (
    profile: UserProfile,
    authMethod: 'PASSWORD' | 'FACE_BIOMETRIC' | 'PERSONA' = 'PASSWORD'
  ): UserSession => {
    const newSession: UserSession = {
      token: `syn-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100 (Enterprise Gateway)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 40) : 'Workstation',
      authMethod,
    };
    setUser(profile);
    setSession(newSession);
    localStorage.setItem('synapse_auth_user', JSON.stringify(profile));
    localStorage.setItem('synapse_auth_session', JSON.stringify(newSession));
    return newSession;
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
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

  const loginWithFace = async (
    identifier: string,
    minConfidence: number = 85
  ): Promise<{ success: boolean; confidence?: number; error?: string }> => {
    setLoading(true);
    try {
      // Simulate neural face vector extraction latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      const verification = verifyFaceBiometrics(identifier, minConfidence);
      if (!verification.success || !verification.user) {
        return {
          success: false,
          error: verification.error || 'Biometric Face Identification failed.',
        };
      }
      createSession(verification.user, 'FACE_BIOMETRIC');
      return { success: true, confidence: verification.confidence };
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometric processing error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    teamId: TeamId = 'engineering',
    role?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const res = registerNewUser(name, email, password, teamId, role);
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

  const enrollFace = async (photoUrl?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User must be logged in to enroll biometrics' };
    try {
      const res = enrollUserFace(user.uid, photoUrl);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Face enrollment failed' };
      }
      setUser(res.user);
      localStorage.setItem('synapse_auth_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometric enrollment failed' };
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
    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem('synapse_auth_user');
      localStorage.removeItem('synapse_auth_session');
    } catch (err) {
      console.warn('Error clearing localStorage:', err);
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
        loginWithFace,
        register,
        enrollFace,
        loginWithPersona,
        switchTeam,
        signInDemoUser,
        signOut,
        deductTokens,
        addTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

