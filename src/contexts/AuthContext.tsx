
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Export supabase for backward compatibility
export { supabase };

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  watchedAds: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPoints: (points: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // Auth removed - placeholder function
  };

  const signUp = async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    // Auth removed - placeholder function
  };

  const signOut = async () => {
    // Auth removed - placeholder function
  };

  const updateUserPoints = async (pointsToAdd: number) => {
    // Auth removed - placeholder function
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserPoints
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
