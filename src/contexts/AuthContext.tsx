
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are properly set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
    console.warn('Supabase environment variables not configured. Using mock client.');
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();

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
  isSupabaseConfigured: boolean;
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
  const [loading, setLoading] = useState(true);
  const isSupabaseConfigured = supabase !== null;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      setUser({
        id: userId,
        email: data.email,
        role: data.role || 'user',
        points: data.points || 0,
        watchedAds: data.watched_ads || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email,
          role,
          points: 0,
          watched_ads: []
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserPoints = async (pointsToAdd: number) => {
    if (!supabase || !user) return;

    const newPoints = user.points + pointsToAdd;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating points:', error);
      return;
    }

    setUser(prev => prev ? { ...prev, points: newPoints } : null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserPoints,
    isSupabaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
