'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types/dashboard';
import {
  INITIAL_USERS,
  verifyCredentials,
  registerNewUser,
  getStoredUsers,
} from '@/lib/auth/usersDb';

export interface UserSession {
  token: string;
  loginTime: string;
  expiresAt: string;
  ipAddress: string;
  device: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithPersona: (personaId: string) => void;
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
  register: async () => ({ success: false }),
  loginWithPersona: () => {},
  signInDemoUser: () => {},
  signOut: () => {},
  deductTokens: () => {},
  addTokens: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('synapse_auth_user');
      const savedSession = localStorage.getItem('synapse_auth_session');

      if (savedUser && savedSession) {
        setUser(JSON.parse(savedUser));
        setSession(JSON.parse(savedSession));
      } else {
        // Default to Alex Sterling on first fresh visit for immediate exploration, but allow full logout/switch
        const defaultUser = INITIAL_USERS[0];
        const { passwordHash: _, ...profile } = defaultUser;
        const newSession: UserSession = {
          token: `syn-sess-${Date.now()}`,
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.100 (Enterprise Gateway)',
          device: 'Chrome macOS / Windows Workstation',
        };
        setUser(profile);
        setSession(newSession);
        localStorage.setItem('synapse_auth_user', JSON.stringify(profile));
        localStorage.setItem('synapse_auth_session', JSON.stringify(newSession));
      }
    } catch (err) {
      console.error('Session restoration error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = (profile: UserProfile): UserSession => {
    const newSession: UserSession = {
      token: `syn-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100 (Enterprise Gateway)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 40) : 'Workstation',
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
      // Simulate network latency for authentic feel
      await new Promise((resolve) => setTimeout(resolve, 600));

      const verification = verifyCredentials(email, password);
      if (!verification.success || !verification.user) {
        return { success: false, error: verification.error || 'Authentication failed' };
      }

      createSession(verification.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const res = registerNewUser(name, email, password, role);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Registration failed' };
      }
      createSession(res.user);
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
    createSession(profile);
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
        register,
        loginWithPersona,
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
