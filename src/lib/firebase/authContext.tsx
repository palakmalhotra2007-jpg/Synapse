'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types/dashboard';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInDemoUser: () => void;
  signOut: () => void;
}

const defaultUser: UserProfile = {
  uid: 'synapse-exec-001',
  displayName: 'Alex Sterling',
  email: 'alex.sterling@synapse-ai.io',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Chief Technology Officer',
  organization: 'Aegis Global Enterprises',
  tokenBalance: 850000,
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
  signInDemoUser: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  const [loading, setLoading] = useState(false);

  const signInDemoUser = () => {
    setUser(defaultUser);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInDemoUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
